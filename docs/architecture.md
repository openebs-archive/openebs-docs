---
id: architecture
title: OpenEBS Architecture
sidebar_label: Architecture
---

<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  Documentation for OpenEBS v0.5 is no longer actively maintained. The version you are currently viewing is a static snapshot. Click here for the [latest](https://docs.openebs.io) version.
</strong></p></center>

------

OpenEBS follows CAS model where each volume has a dedicated controller POD and a set of replica PODs. The advantages of CAS architecture can be read here. To simplify the deployment by Operators/Administrators and usage by application developers, OpenEBS is integrated well into the Kubernetes concepts and recommended patterns.  

![OpenEBS-Architecture-Overview](/docs/assets/openebs-arch.png)



OpenEBS solution/project has many components, which can be grouped into the following categories.

- [Control plane components](#ControlPlane) - Provisioner, API Server, volume exports, and volume sidecars
- [Data plane components](#DataPlane) - Jiva and cStor
- [Node disk manager](#NDM) - Discover, monitor, and manage the disks attached to the Kubernetes node
- [Integrations with cloud native tools](#CNTools)  - For more productivity on storage front, integrations are done with Prometheus, Grafana, Fluentd, and Jaeger


<a name="ControlPlane"></a>

------



## Control Plane



The control plane of an OpenEBS cluster is often referred to as Maya. OpenEBS control plane is responsible for provisioning volumes, associated volume actions such as taking snapshots, making clones, creating storage policies, enforcing storage policies, exporting the volume metrics for consumption by prometheus/grafana, and so on.

 

![Maya is the control plane of OpenEBS](https://raw.githubusercontent.com/openebs/maya/master/docs/openebs-maya-architecture.png)

OpenEBS provides a [dynamic provisioner](https://github.com/kubernetes-incubator/external-storage/tree/master/openebs), which is the standard Kubernetes external storage plugin. The primary task of an OpenEBS PV provisioner is to initiate volume provisioning to application PODS and to implement the Kubernetes specification for PVs.

m-apiserver exposes storage REST API and takes the bulk of volume policy processing and management. 

The connectivity between control plane and data plane is achieved through Kubernetes sidecar pattern. There are a couple of scenarios as follows in which the control plane needs to communicate with the data plane. 

- For volume statistics such as IOPS, throughput, latency etc. - achieved through volume-exporter sidecar
- For volume policy enforcement with volume controller pod and disk/pool management with the volume replica pod - achieved through volume-management sidecar(s)

The above control plane components are explained in detail below.

### OpenEBS PV Provisioner

![OpenEBS volume pods provisioning-overview](/docs/assets/volume-provisioning.png)

This component runs as a POD and is core to the provisioning decisions. 

Developer constructs a claim with the required volume parameters, chooses the appropriate storage class and invokes kubelet on the yaml specification. The OpenEBS PV dynamic provisioner interacts with the maya-apiserver to create deployment specifications for the volume controller pod and volume replica pod(s) on appropriate nodes. Scheduling of the volume pods (controller/replica) can be controlled using annotations in PVC specification, details of which are discussed in a separate section.

Currently OpenEBS provisioner supports only one type of binding i.e. iSCSI. 

### Maya-ApiServer

![OpenEBS m-apiserver Internals](/docs/assets/m-apiserver.png)

m-apiserver runs as a POD.

As the name suggests, m-apiserver exposes the OpenEBS REST APIs. 

m-apiserver is also responsible for creating deployment specification files required for creating the volume pods. After generating these specification files, it invokes kube-apiserver for scheduling the pods accordingly. At the end of volume provisioning by the OpenEBS PV provisioner, a Kubernetes object PV is created and is mounted on the application pod . The PV is hosted by the controller pod which is supported by a set of replica pods in different nodes. Controller pod and replica pods are part of the data plane and are described in more detail in the [Storage Engines](/docs/next/storageengine.html) section.


Another important task of m-apiserver is volume policy management. OpenEBS provides very granular specification for expressing policies. m-apiserver interprets these yaml specifications, converts them into enforceable components and enforces them through volume-management sidecars.


### Maya volume exporter

Maya volume export is a sidecar for each of the storage controller pods (cStor/Jiva). These sidecars connect the control plane to the data plane for fetching statistics. The granularity of statistics is at the volume level. Some example statistics are: 

- volume read latency
- volume write latency
- read IOPS
- write IOPS
- read block size
- write block size
- capacity stats

![OpenEBS volume exporter data flow](/docs/assets/vol-exporter.png)

These statitics are typically pulled either by the Prometheus client that is installed and configured during OpenEBS installation or by the Weave Cortex agent that is installed and configured during connectivity to [MayaOnline](https://mayaonline.io).

### Volume management sidecars

For passing controller configuration parameters and volume policies to the volume controller pod which is a data plane and for passing replica configuration parameters and replica data protection parameters to the volume replica pod, sidecars are used. 

![volume management sidecars for cStor](/docs/assets/vol-mgmt-sidecars.png)



<a name="DataPlane"></a>

------



## Data Plane 

OpenEBS data plane is responsible for the actual volume IO path. A storage engine implements the actual IO path in the data plane. Currently, OpenEBS provides two storage engines that can be plugged in easily. These are Jiva and cStor. Both these storage engines run completely in Linux user space and are completely based on microservices. 

### Jiva

Jiva storage engine is developed with Rancher's LongHorn and gotgt as the base. The entire Jiva engine is written in GO language and runs entirely in the user space. LongHorn controller synchronously replicates the incoming IO to the LongHorn replicas. The replica considers a Linux sparse file as the foundation for building the storage features such as thin provisioning, snapshotting, rebuilding etc. More details on Jiva architecture are [written here](/docs/next/storageengine.html).   

### cStor

`Note: This storage engine is available from version 0.6 release onwards`

cStor is a high performing storage engine built with proven building blocks of storage components such as "BSD based Multi-threaded iSCSI protocol stack that is still serving hundreds of installations" and DMU layer of user space ZFS taken from the proven OpenSolaris stack. cStor gives unparalled data integrity, CoW based snapshots. Roadmap of cStor includes SPDK and DPDK integrations to achieve multi-fold increase in performance. More details on cStor architecture are [written here](/data/next/storageengine.html).



## Node Disk Manager<a name="NDM"></a>

------

```
Note: This storage engine is available from version 0.6 release onwards
```

Node Disk Manager fills the gap in the chain of tools required for managing persistent storage for stateful applications using Kubernetes. Administrators in the container era are increasing tasks with the goal of automating the infrastructure needs of an application or application developer. The complex work flow automations in storage provisioning requires flexible structures in the storage stack so that Cloud Native tools in the Kubernetes ecosystem can easily use them. Node Disk Manager or NDM unifies disparate disks to a common Kubernetes object and provides the capability to pool them. NDM discovers, provisions, monitors, and manages the underlying disks in such a way that Kubernetes PV provisioners and Prometheus can easily integrate into the disk subsystem. 


![Node Disk Manager](/docs/assets/ndm.png)



## Integrations with cloud native tools <a name="CNTools"></a>

------

### Prometheus and Grafana 

Prometheus is installed as a microservice by the OpenEBS operator during the initial setup. Prometheus monitoring for a given volume is controlled by a volume policy. With granular volume, disk-pool, and disk statistics, the Prometheus and Grafana tool combination will empower the OpenEBS user community immensely in persistent data monitoring. 

### Jaeger

This is a roadmap feature. Jaeger tracing will be enabled for OpenEBS control plane components. Contributions to stabilize this integration are welcome.

### WeaveScope

Node Disk Manager components, volume pods, and other persistent storage structures of Kubernetes are being enabled for WeaveScope integration. With these enhancements, exploration and traversal of these components will become significantly easier.

### Kubernetes Dashboard

Kubernetes dashboard is extended to include the PV and PVC traversals from the application PODs and vice versa. 



<!-- Hotjar Tracking Code for https://docs.openebs.io -->
<script>
   (function(h,o,t,j,a,r){
       h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
       h._hjSettings={hjid:785693,hjsv:6};
       a=o.getElementsByTagName('head')[0];
       r=o.createElement('script');r.async=1;
       r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
       a.appendChild(r);
   })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
