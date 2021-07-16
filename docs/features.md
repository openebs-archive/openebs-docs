---
id: features
title: OpenEBS Features and Benefits
sidebar_label: Features and Benefits
---

------

| <font size="3">OpenEBS Features</font> | <font size="3">OpenEBS Benefits</font> |
|--------------------|--------------------|
| [Containerized storage for containers](#containerized-storage-for-containers) | [Granular policies per stateful workload](#granular-policies-per-stateful-workload) |
| [Synchronous replication](#synchronous-replication) | [Avoid Cloud Lock-in](#avoid-cloud-lock-in) |
| [Snapshots and clones](#snapshots-and-clones) | [Reduced storage TCO up to 50%](#reduced-storage-tco-up-to-50) |
| [Backup and restore](#backup-and-restore) | [Native HCI on Kubernetes](#natively-hyperconverged-on-kubernetes) |
| [Prometheus metrics and Grafana dashboard](#prometheus-metrics-for-workload-tuning) | [High availability - No Blast Radius](#high-availability) |


For more information on how OpenEBS is used in cloud native environments,  visit the [use cases](/v290/docs/next/usecases.html) section or see examples of users and their stories on the OpenEBS Adopters section [here](https://github.com/openebs/openebs/blob/master/ADOPTERS.md) where you can also share your experience.


<br>

## OpenEBS Features

<br>

### Containerized Storage for Containers

<img src="/v290/docs/assets/svg/f-cas.svg" alt="Containerized Storage Icon" style="width:200px;">

OpenEBS is an example of Container Attached Storage or CAS. Volumes provisioned through OpenEBS are always containerized. Each volume has a dedicated storage controller that increases the agility and granularity of persistent storage operations of the stateful applications. Benefits and more details on CAS architecture are found <a href="/v290/docs/next/cas.html" target="_blank">here</a>.

<hr>

<br>

### Synchronous Replication

<img src="/v290/docs/assets/svg/f-replication.svg" alt="Synchronous Replication Icon" style="width:200px;">
Synchronous Replication is an optional and popular feature of OpenEBS.  When used with the Jiva, cStor and Mayastor storage engines, OpenEBS can synchronously replicate the data volumes for high availability. The replication happens across Kubernetes zones resulting in high availability for cross AZ setups. This feature is especially useful to build highly available stateful applications using local disks on cloud providers services such as GKE, EKS and AKS. 

<hr>



<br>

### Snapshots and Clones

<img src="/v290/docs/assets/svg/f-snapshots.svg" alt="Snapshots and Clones Icon" style="width:200px;">

Copy-on-write snapshots are another optional and popular feature of OpenEBS. When using the cStor engine, snapshots are created instantaneously and there is no limit on the number of snapshots. The incremental snapshot capability enhances data migration and portability across Kubernetes clusters and across different cloud providers or data centers. Operations on snapshots and clones are performed in completely Kubernetes native method using the standard kubectl commands.  Common use cases include efficient replication for back-ups and the use of clones for troubleshooting or development against a read only copy of data.  

<hr>

<br>

### Backup and Restore

<img src="/v290/docs/assets/svg/f-backup.svg" alt="Backup and Restore Icon" style="width:200px;">

The backup and restore of OpenEBS volumes works with Kubernetes backup and restore solutions such as Velero (formerly Heptio Ark) via open source OpenEBS Velero-plugins. Data backup to object storage targets such as AWS S3, GCP Object Storage or MinIO are frequently deployed using the OpenEBS incremental snapshot capability. This storage level snapshot and backup saves a significant amount of bandwidth and storage space as only incremental data is used for backup.

<hr>

<br>

### Prometheus Metrics for Workload Tuning

<img src="/v290/docs/assets/svg/f-prometheus.svg" alt="Prometheus and Tuning Icon" style="width:200px;">

OpenEBS volumes are instrumented for granular data metrics such as volume IOPS, throughput, latency and data patterns. As OpenEBS follows the CAS pattern, stateful applications can be tuned for better performance by observing the traffic data patterns on Prometheus and modifying the storage policy parameters without worrying about neighboring workloads that are using OpenEBS thereby minimizing the incidence of "noisy neighbor" issues.  

<hr>
<br>

<br>

<br>





## OpenEBS Benefits



### Truly Cloud Native Storage for Kubernetes

<img src="/v290/docs/assets/svg/b-cn.svg" alt="Cloud Native Storage Icon" style="width:200px;"> 
OpenEBS is cloud native storage for stateful applications on Kubernetes where "cloud native" means following a loosely coupled architecture. As such the normal benefits to cloud native, loosely coupled architectures apply. For example, developers and DevOps architects can use standard Kubernetes skills and utilities to configure, use, and manage the persistent storage needs.  

<hr>

<br>


### Avoid Cloud Lock-in

<img src="/v290/docs/assets/svg/b-no-lockin.svg" alt="Avoid Cloud Lock-in Icon" style="width:200px;">

Even though Kubernetes provides an increasingly ubiquitous control plane, concerns about data gravity resulting in lock-in and otherwise inhibiting the benefits of Kubernetes remain. With OpenEBS, the data can be written to the OpenEBS layer - if cStor, Jiva or Mayastor are used - and if so OpenEBS acts as a data abstraction layer. Using this data abstraction layer, data can be much more easily moved amongst Kubernetes environments, whether they are on premise and attached to traditional storage systems or in the cloud and attached to local storage or managed storage services.

<hr>

<br>



### Granular Policies Per Stateful Workload

<img src="/v290/docs/assets/svg/b-granular.svg" alt="Workload Granular Policies Icon" style="width:200px;">

One reason for the rise of cloud native, loosely coupled architectures is that they enable loosely coupled teams. These small teams are enabled by cloud native architectures to move faster, free of most cross functional dependencies thereby unlocking innovation and customer responsiveness. OpenEBS also unlocks small teams by enabling them to retain their autonomy by virtue of deploying their own storage system. Practically, this means storage parameters are monitored on a workload and per volume basis and storage policies and settings are declared to achieve the desired result for a given workload. The policies are tested and tuned, keeping only the particular workload in mind, while other workloads are unaffected. Workloads - and teams - remain loosely coupled.  

<hr>

<br>




### Reduced Storage TCO up to 50% 

 <img src="/v290/docs/assets/svg/b-lowtco.svg" alt="Reduced Storage TCO Icon" style="width:200px;">

On most clouds, block storage is charged based on how much is purchased and not on how much is used; capacity is often over provisioned in order to achieve higher performance and in order to remove the risk of disruption when the capacity is fully utilized. Thin provisioning capabilities of OpenEBS can pool local storage or cloud storage and then grow the data volumes of stateful applications as needed. The storage can be added on the fly without disruption to the volumes exposed to the workloads or applications. Certain users have reported savings in excess of 60% due to the use of thin provisioning from OpenEBS.

<hr>

<br>

### Natively Hyperconverged on Kubernetes

<img src="/v290/docs/assets/svg/b-hci.svg" alt="Natively HCI on K8s Icon" style="width:200px;">

Node Disk Manager (NDM) in OpenEBS can be used to enable disk management in a Kubernetes way by using Kubernetes constructs. Using NDM and OpenEBS, nodes in the Kubernetes cluster can be horizontally scaled without worrying about managing persistent storage needs of stateful applications. The storage needs (capacity planning, performance planning, and volume management) of a cluster can be automated using the volume and pool policies of OpenEBS thanks in part to the role played by NDM in identifying and managing underlying storage resources, including local disks and cloud volumes.

<hr>
<br>


### High Availability 

<img src="/v290/docs/assets/svg/b-ha.svg" alt="High Availability Icon" style="width:200px;"> 

Because OpenEBS follows the CAS architecture, upon node failure the OpenEBS controller will be rescheduled by Kubernetes while the underlying data is protected via the use of one or more replicas. More importantly - because each workload can utilize its own OpenEBS - there is no risk of a system wide outage due to the loss of storage. For example, metadata of the volume is not centralized where it might be subject to a catastrophic generalized outage as is the case in many shared storage systems.  Rather the metadata is kept local to the volume. Losing any node results in the loss of volume replicas present only on that node. As the volume data is synchronously replicated at least on two other nodes, in the event of a node failure, the data continues to be available at the same performance levels. 


<hr>


<br>



<br>

## See Also:

### [Object Storage with OpenEBS](/v290/docs/next/minio.html)

### [RWM PVs with OpenEBS](/v290/docs/next/rwm.html)

### [Local storage for Prometheus ](/v290/docs/next/prometheus.html)

<br>

<hr>

<br>
