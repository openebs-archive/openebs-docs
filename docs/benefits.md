---
id: benefits
title: OpenEBS Benefits
sidebar_label: Benefits
---

------

<br>
- [Open Source Cloud Native storage for Kubernetes](#open-source-cloud-native-storage-for-kubernetes)
- [Granular policies per stateful workload](#granular-policies-per-stateful-workload)
- [Avoid Cloud Lock-in](#avoid-cloud-lock-in)
- [Reduced storage TCO up to 50%](#reduced-storage-tco-up-to-50)
- [Native HCI on Kubernetes](#natively-hyperconverged-on-kubernetes)
- [High availability - No Blast Radius](#high-availability)
<br>

:::tip
For information on how OpenEBS is used in production,  visit the [use cases](/docs/next/usecases.html) section or see examples of users and their stories on the OpenEBS Adopters section [here](https://github.com/openebs/openebs/blob/master/ADOPTERS.md) where you can also share your experience.
:::

### Open Source Cloud Native Storage for Kubernetes

<img src="/docs/assets/svg/b-cn.svg" alt="Cloud Native Storage Icon" style="width:200px;" align="right"> 
OpenEBS is cloud native storage for stateful applications on Kubernetes where "cloud native" means following a loosely coupled architecture. As such the normal benefits to cloud native, loosely coupled architectures apply. For example, developers and DevOps architects can use standard Kubernetes skills and utilities to configure, use, and manage the persistent storage needs.  

Some key aspects that make OpenEBS different compared to other traditional storage solutions:
- Built using the _micro-services architecture_ like the applications it serves. OpenEBS is itself deployed as a set of containers on Kubernetes worker nodes. Uses Kubernetes itself to orchestrate and manage OpenEBS components.
- Built completely in userspace making it highly portable to run across _any OS/platform_.
- Completely intent-driven, inheriting the same principles that drive the _ease of use_ with Kubernetes.
- OpenEBS supports a range of storage engines so that developers can deploy the storage technology appropriate to their application design objectives. Distributed applications like Cassandra can use the _LocalPV_ engine for lowest latency writes. Monolithic applications like MySQL and PostgreSQL can use _Mayastor built using NVMe and SPDK_ or _cStor based on ZFS_ for resilience. Streaming applications like Kafka can use the NVMe engine [Mayastor](https://github.com/openebs/Mayastor) for best performance in edge environments. 


<br>
<br>
<hr>

### Avoid Cloud Lock-in

<img src="/docs/assets/svg/b-no-lockin.svg" alt="Avoid Cloud Lock-in Icon" style="width:200px;" align="right">

Even though Kubernetes provides an increasingly ubiquitous control plane, concerns about data gravity resulting in lock-in and otherwise inhibiting the benefits of Kubernetes remain. With OpenEBS, the data can be written to the OpenEBS layer - if cStor, Jiva or Mayastor are used - and if so OpenEBS acts as a data abstraction layer. Using this data abstraction layer, data can be much more easily moved amongst Kubernetes environments, whether they are on premise and attached to traditional storage systems or in the cloud and attached to local storage or managed storage services.

<br>
<br>
<hr>


### Granular Policies Per Stateful Workload

<img src="/docs/assets/svg/b-granular.svg" alt="Workload Granular Policies Icon" style="width:200px;" align="right">

One reason for the rise of cloud native, loosely coupled architectures is that they enable loosely coupled teams. These small teams are enabled by cloud native architectures to move faster, free of most cross functional dependencies thereby unlocking innovation and customer responsiveness. OpenEBS also unlocks small teams by enabling them to retain their autonomy by virtue of deploying their own storage system. Practically, this means storage parameters are monitored on a workload and per volume basis and storage policies and settings are declared to achieve the desired result for a given workload. The policies are tested and tuned, keeping only the particular workload in mind, while other workloads are unaffected. Workloads - and teams - remain loosely coupled.  

<br>
<br>
<hr>

### Reduced Storage TCO up to 50% 

<img src="/docs/assets/svg/b-lowtco.svg" alt="Reduced Storage TCO Icon" style="width:200px;" align="right">

On most clouds, block storage is charged based on how much is purchased and not on how much is used; capacity is often over provisioned in order to achieve higher performance and in order to remove the risk of disruption when the capacity is fully utilized. Thin provisioning capabilities of OpenEBS can pool local storage or cloud storage and then grow the data volumes of stateful applications as needed. The storage can be added on the fly without disruption to the volumes exposed to the workloads or applications. Certain users have reported savings in excess of 60% due to the use of thin provisioning from OpenEBS.

<br>
<br>
<hr>


### Natively Hyperconverged on Kubernetes

<img src="/docs/assets/svg/b-hci.svg" alt="Natively HCI on K8s Icon" style="width:200px;" align="right">

Node Disk Manager (NDM) in OpenEBS can be used to enable disk management in a Kubernetes way by using Kubernetes constructs. Using NDM and OpenEBS, nodes in the Kubernetes cluster can be horizontally scaled without worrying about managing persistent storage needs of stateful applications. The storage needs (capacity planning, performance planning, and volume management) of a cluster can be automated using the volume and pool policies of OpenEBS thanks in part to the role played by NDM in identifying and managing underlying storage resources, including local disks and cloud volumes.

<br>
<br>
<hr>


### High Availability 

<img src="/docs/assets/svg/b-ha.svg" alt="High Availability Icon" style="width:200px;" align="right"> 

Because OpenEBS follows the CAS architecture, upon node failure the OpenEBS controller will be rescheduled by Kubernetes while the underlying data is protected via the use of one or more replicas. More importantly - because each workload can utilize its own OpenEBS - there is no risk of a system wide outage due to the loss of storage. For example, metadata of the volume is not centralized where it might be subject to a catastrophic generalized outage as is the case in many shared storage systems.  Rather the metadata is kept local to the volume. Losing any node results in the loss of volume replicas present only on that node. As the volume data is synchronously replicated at least on two other nodes, in the event of a node failure, the data continues to be available at the same performance levels. 




<br>
<br>
<hr>

## See Also:

### [OpenEBS Features](/docs/next/features.html)

### [Object Storage with OpenEBS](/docs/next/minio.html)

### [RWM PVs with OpenEBS](/docs/next/rwm.html)

### [Local storage for Prometheus ](/docs/next/prometheus.html)

<br>
<hr>
<br>
