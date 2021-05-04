---
id: architecture
title: OpenEBS Architecture
sidebar_label: OpenEBS Architecture
---

------

OpenEBS follows the container attached storage or CAS model.  As a part of this approach, each volume has a dedicated controller POD and a set of replica PODs. The advantages of the CAS architecture are discussed on the CNCF blog [here](https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/). OpenEBS is simple to operate and to use largely because it looks and feels like other cloud-native and Kubernetes friendly projects.  

<br>

<img src="/docs/assets/svg/openebs-arch.svg" alt="drawing" width="80%"/>

<br>

OpenEBS has many components, which can be grouped into the following categories.

- [Control plane components](#ControlPlane) - Provisioner, API Server, volume exports, and volume sidecars
- [Data plane components](#DataPlane) - Jiva and cStor
- [Node disk manager](#NDM) - Discover, monitor, and manage the media attached to the Kubernetes node
- [Integrations with cloud-native tools](#CNTools)  - Integrations are done with Prometheus, Grafana, Fluentd, and Jaeger.


<a name="ControlPlane"></a>

------


## Control Plane

The control plane of an OpenEBS cluster is often referred to as Maya. The OpenEBS control plane is responsible for provisioning volumes, associated volume actions such as taking snapshots, making clones, creating storage policies, enforcing storage policies, exporting the volume metrics for consumption by Prometheus/grafana, and so on.


![Maya is the control plane of OpenEBS](/docs/assets/openebs-maya-architecture.png)

OpenEBS provides a [dynamic provisioner](https://github.com/kubernetes-incubator/external-storage/tree/master/openebs), which is the standard Kubernetes external storage plugin. The primary task of an OpenEBS PV provisioner is to initiate volume provisioning to application PODS and to implement the Kubernetes specification for PVs.

m-apiserver exposes storage REST API and takes the bulk of volume policy processing and management. 

Connectivity between the control plane and the data plane uses a Kubernetes sidecar pattern. There are a couple of scenarios as follows in which the control plane needs to communicate with the data plane. 

- For volume statistics such as IOPS, throughput, latency etc. - achieved through volume-exporter sidecar
- For volume policy enforcement with volume controller pod and disk/pool management with the volume replica pod - achieved through volume-management sidecar(s)

The above control plane components are explained in detail below.

### OpenEBS PV Provisioner

![OpenEBS volume pods provisioning-overview](/docs/assets/volume-provisioning.png)

This component runs as a POD and makes provisioning decisions. 

The way it is used is that the developer constructs a claim with the required volume parameters, chooses the appropriate storage class and invokes kubelet on the YAML specification. The OpenEBS PV dynamic provisioner interacts with the `maya-apiserver` to create deployment specifications for the volume controller pod and volume replica pod(s) on appropriate nodes. Scheduling of the volume pods (controller/replica) can be controlled using annotations in PVC specification, details of which are discussed in a separate section.

Currently, the OpenEBS provisioner supports only one type of binding i.e. iSCSI. 

### Maya-ApiServer

![OpenEBS m-apiserver Internals](/docs/assets/m-apiserver.png)

m-apiserver runs as a POD. As the name suggests, m-apiserver exposes the OpenEBS REST APIs. 

m-apiserver is also responsible for creating deployment specification files required for creating the volume pods. After generating these specification files, it invokes kube-apiserver for scheduling the pods accordingly. At the end of volume provisioning by the OpenEBS PV provisioner, a Kubernetes object PV is created and is mounted on the application pod. The PV is hosted by the controller pod which is supported by a set of replica pods in different nodes. The controller pod and replica pods are part of the data plane and are described in more detail in the [Storage Engines](/docs/next/casengines.html) section.

Another important task of the m-apiserver is volume policy management. OpenEBS provides very granular specification for expressing policies. m-apiserver interprets these YAML specifications, converts them into enforceable components and enforces them through volume-management sidecars.


### Maya Volume Exporter

Maya volume exporter is a sidecar for each of the storage controller pods (cStor/Jiva). These sidecars connect the control plane to the data plane for fetching statistics. The granularity of statistics is at the volume level. Some example statistics are: 

- volume read latency
- volume write latency
- read IOPS
- write IOPS
- read block size
- write block size
- capacity stats

![OpenEBS volume exporter data flow](/docs/assets/vol-exporter.png)

These statistics are typically pulled either by the Prometheus client that is installed and configured during OpenEBS installation.

### Volume Management Sidecars

Sidecars are also used for passing controller configuration parameters and volume policies to the volume controller pod which is a data plane and for passing replica configuration parameters and replica data protection parameters to the volume replica pod. 

![volume management sidecars for cStor](/docs/assets/vol-mgmt-sidecars.png)

<a name="DataPlane"></a>

------

## Data Plane 

The OpenEBS data plane is responsible for the actual volume IO path. A storage engine implements the actual IO path in the data plane. Currently, OpenEBS provides two storage engines that can be plugged in easily. These are called Jiva and cStor. Both these storage engines run completely in Linux user space and are based on micro services architecture. 

### Jiva

Jiva storage engine is developed with Rancher's LongHorn and gotgt as the base. Jiva engine is written in GO language and runs in the user space. LongHorn controller synchronously replicates the incoming IO to the LongHorn replicas. The replica considers a Linux sparse file as the foundation for building the storage features such as thin provisioning, snapshots, rebuilding etc. More details on Jiva architecture are written [here](/docs/next/jiva.html).   

### cStor

cStor data engine is written in C and has a high performing iSCSI target and Copy-On-Write block system to provide data integrity,  data resiliency and  point-in-time snapshots and clones. cStor has a pool feature that aggregates the disks on a node in striped, mirrored or in RAIDZ mode to give larger units of capacity and performance. cStor also provides  the synchronous replication of data to multiple nodes even across zones so that node loss or node reboots do not cause unavailability of data. See [here](/docs/next/cstor.html) for more details on cStor features and architecture.

### LocalPV

For those applications that do not need storage level replication, LocalPV may be good option as it gives higher performance. OpenEBS LocalPV is similar to Kubernetes LocalPV except that it is dynamically provisioned by OpenEBS control plane, just like any other regular PV. OpenEBS LocalPV is of two types - `hostpath` LocalPV or `device` LocalPV. `hostpath` LocalPV refers to a subdirectory on the host and `device` LocalPV refers to a discovered disk (either directly attached or network attached) on the node. OpenEBS has introduced a LocalPV provisioner for selecting a matching disk or hostpath against some criteria in PVC and storage class specifications. For more details on OpenEBS LocalPV, see [here](/docs/next/localpv.html).



## Node Disk Manager<a name="NDM"></a>

------

Node Disk Manager (NDM) fills a gap in the chain of tools required for managing persistent storage for stateful applications using Kubernetes. DevOps architects in the container era must serve the infrastructure needs of applications and of application developers in an automated way that delivers resilience and consistency across environments. These requirements mean that the storage stack must itself be extremely flexible so that Kubernetes and other software in the cloud-native ecosystem can easily use this stack. The NDM plays a foundational role in the storage stack for Kubernetes by unifying disparate disks and by providing the capability to pool them in part by identifying them as a Kubernetes object.  Also, NDM discovers, provisions, monitors, and manages the underlying disks in such a way that Kubernetes PV provisioners such as  OpenEBS and other storage systems and Prometheus can manage the disk subsystems. 

<br>

<img src="/docs/assets/svg/ndm.svg" alt="NDM architecture" style="width:70%">

<br>

## Integrations with Cloud-Native Tools <a name="CNTools"></a>

------

### Prometheus and Grafana 

Prometheus is installed as a micro service by the OpenEBS operator during the initial setup. Prometheus monitoring for a given volume is controlled by a volume policy. With granular volume, disk-pool, and disk statistics, the Prometheus and Grafana tool combination help the OpenEBS user community to monitor their use of persistent data. 



### WeaveScope

WeaveScope is a well-regarded cloud-native visualization solution in Kubernetes to view metrics, tags and metadata within the context of a process, container, service or host. Node Disk Manager components, volume pods, and other persistent storage structures of Kubernetes have been enabled for WeaveScope integration. With these enhancements, exploration and traversal of these components have become significantly easier.



<br>

## See Also:

### [Understanding NDM](/docs/next/ndm.html)


<br>

<hr>

<br>
