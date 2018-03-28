---
id: architecture
title: OpenEBS Architecture
sidebar_label: Architecture
---

------

OpenEBS follows CAS model where each volume has a dedicated controller POD and set of replica PODs. The advantages of CAS architecture can be read here.  To simplify the deployment by Operators/Admins and usage by application developers, OpenEBS is integrated nicely into the Kubernetes concepts and recommended patterns.  

![OpenEBS-Architecture-Overview](/docs/assets/openebs-arch.png)



OpenEBS solution/project has many components , which can be grouped into the following categories

- [Control plane components](#ControlPlane) - Provisioner, API Server, volume exports, volume side-cars
- [Data plane components](#DataPlane) - Jiva and cStor
- [Node disk manager](#NDM) - Discover, monitor and manage the disks attached to Kubernetes node
- [Integrations with cloud native tools](#CNTools)  - For more productivity on storage front, integrations are done with Prometheus, Grafana, Fluentd and Jaeger


<a name="ControlPlane"></a>

------



## Control Plane



OpenEBS control plane is responsible for provisioning volumes, associated volume actions such as taking snapshots, making clones, creating storage policies, enforcing storage policies, exporting the volume metrics for consumption by prometheus/grafana,  etc.

 

![Maya is the control plane of OpenEBS](https://raw.githubusercontent.com/openebs/maya/master/docs/openebs-maya-architecture.png)

OpenEBS provides a [dynamic provisioner](https://github.com/kubernetes-incubator/external-storage/tree/master/openebs), which is the standard Kubernetes external storage plugin. Primary task of OpenEBS PV provisioner is to initiate the volume provisioning to application PODS, and to implement the Kubernetes specification for PVs.

m-apiserver exposes storage REST API and takes the bulk of volume policy processing and management. 

The connectivity between control plane data plane is achieved through Kubernetes side-car pattern. There are couple of scenarios in which the control plane needs to communicate with data plane. 

- For volume statistics such as IOPS, throughput, latency etc. This is achieved through volume-exporter side-car
- For volume policy enforcement with volume controller pod and disk/pool management with the volume replica pod. This is achieved through volume-management side-car(s)

The above control plane components are explained in detail below.

### OpenEBS PV Provisioner

![OpenEBS volume pods provisioning-overview](/docs/assets/volume-provisioning.png)

This component runs as a POD and is core to the provisioning decisions. 

Developer constructs a claim with the required volume parameters, chooses the appropriate storage class and invokes kubelet on the yaml spec. The OpenEBS PV dynamic provisioner interacts with the maya-apiserver to create the deployment specifications for volume controller pod and volume replica pod(s) on appropriate nodes. The scheduling of the volume pods (controller/replica) can be controlled using annotations in PVC spec, details of which are discussed in a separate section.

Currently OpenEBS provisioner supports only one type of binding - iSCSI. 



### Maya-ApiServer

![OpenEBS m-apiserver Internals](/docs/assets/m-apiserver.png)

m-apiserver runs as a POD.

As the name suggest, m-apiserver exposes the OpenEBS REST APIs. For details on API documentation refer to [OpenEBS APIs](/docs/apis.html)

m-apiserver is also responsible for creating deployment spec files required for creating the volume pods. After generating these spec files, it invokes kube-apiserver for scheduling the pods accordingly. At the end of volume provisioning by the OpenEBS PV provisioner, a Kubernetes object PV is created and is mounted on the application pod . The PV is hosted by the controller pod which is supported by a set of replica pods in different nodes. Controller pod and replica pods are part of the data plane and are described in more detail in the [Storage Engines section](/docs/storageengine.html) 

Another important task of m-apiserver is volume policy management. OpenEBS provides very granular specification for expressing policies. m-apiserver interprets these yaml specifications, converts them into enforceable components and enforces them through volume-management side-cars.



### Maya volume exporter

Maya volume export is a side-car to each of the storage controller pods (cStor/Jiva). These side cars connect the control plane to the data plane for fetching statistics. The granularity of statistics is at volume level. Some of the example stats are: 

- volume read latency
- volume write latency
- read IOPS
- write IOPS
- read block size
- write block size
- capacity stats

![OpenEBS volume exporter data flow](/docs/assets/vol-exporter.png)

These stats are typically pulled  either by prometheus client that is installed and configured during OpenEBS installation or by weave cortex agent that is installed and configured during the connectivity to [MayaOnline](https://mayaonline.io).

### Volume management side-cars

For passing controller configuration parameters and volume policies to the volume controller pod which is data plane and for passing replica configuration parameters and replica data protection parameters to the volume replica pod, side-cars are used. 

![volume management side-cars for cStor](/docs/assets/vol-mgmt-sidecars.png)



<a name="DataPlane"></a>

------



## Data Plane 

OpenEBS data plane is responsible for the actual volume IO path. A storage engine implements the actual IO path in the data plane. Currently, OpenEBS provides two storage engines that can be plugged in easily. These are Jiva and cStor. Both these storage engines run completely in Linux user space and are completely based on micro services. 

### Jiva

Jiva storage engine is developed with Rancher's LongHorn and gotgt as the base. The entire Jiva engine is written in GO language and runs entirely in user space. LongHorn controller synchronously replicates the incoming IO to the LongHorn replicas. The replica considers a Linux sparse file as the foundation for building the storage features such as thin provisioning, snapshotting, rebuilding etc. More details on Jiva architecture are [written here](/docs/storageengine.html).   

### cStor

cStor is a high performing storage engine built with proven building blocks of storage components such as "BSD based Multi-threaded iSCSI protocol stack that is still serving hundreds of installations" and DMU layer of user space ZFS taken from the proven OpenSolaris stack. cStor gives unparalled data integrity, CoW based snapshots. Roadmap of cStor includes SPDK and DPDK integrations to achieve multi-fold increase in performance. More details on cStor architecture are [written here](/data/storageengine.html).

## Node Disk Manager<a name="NDM"></a>

------



## Integrations with cloud native tools <a name="CNTools"></a>

------



### Prometheus 

### Grafana

### Jaeger

### WeaveScope

### Kubernetes Dashboard



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
