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
| [Snapshots and clones](#snapshots-and-clones) | [Reduced storage TCO up to 50%](#reduced-storage-tco-upto-50) |
| [Backup and restore](#backup-and-restore) | [Native HCI on Kubernetes](#native-hyperconvergence-on-kubernetes) |
| [Prometheus metrics and Grafana dashboard](#prometheus-metrics-for-workload-tuning) | [High availability - No Blast Radius](#high-availability) |


For more information on how OpenEBS is used in cloud native environments,  visit the [use cases](/docs/next/usecases.html) section.


<br>

## OpenEBS Features

<br>

### Containerized Storage for Containers

<img src="/docs/assets/svg/f-cas.svg" alt="Containerized Storage Icon" style="width:200px;">

OpenEBS follows CAS architecture. Volumes provisioned through OpenEBS are always containerized. Each volume has a dedicated storage controller that increases the agility and granularity of persistent storage operations of the stateful applications. Benefits and more details on CAS architecture are found <a href="/docs/next/cas.html" target="_blank">here</a>.

<hr>

<br>

### Synchronous Replication

<img src="/docs/assets/svg/f-replication.svg" alt="Synchronous Replication Icon" style="width:200px;">
OpenEBS, when used with Jiva, cStor and Mayastor storage engines, synchronously replicates the data volume replicas for high availability. The replication happens across Kubernetes zone resulting in the cloud native applications to be highly available in cross AZ setups. This feature is especially useful to build highly available stateful applications using local disks on cloud providers services such as GKE, EKS and AKS.

<hr>



<br>

### Snapshots and Clones

<img src="/docs/assets/svg/f-snapshots.svg" alt="Snapshots and Clones Icon" style="width:200px;">

Copy-on-write snapshots are a key feature of OpenEBS (cStor). The snapshots are created instantaneously and there is no limit on the number of snapshots. The incremental snapshot capability enables data migration and portability services across Kubernetes clusters and across different cloud providers or data centers, enabling a true multi-cloud data plane for stateful applications. Operations on snapshots and clones are performed in completely Kubernetes native method using the standard kubectl commands.

<hr>

<br>

### Backup and Restore

<img src="/docs/assets/svg/f-backup.svg" alt="Backup and Restore Icon" style="width:200px;">

Backup and restore of OpenEBS volumes work with the recent Kubernetes backup and restore solutions such as Velero (formerly Heptio Ark) using OpenEBS Velero-plugin. Data backup to object storage targets such as AWS S3, GCP Object Storage or MinIO can be built using OpenEBS incremental snapshot capability. This storage level snapshotting and backup saves a lot of bandwidth and storage space as only the incremental data is used for backup.

<hr>

<br>

### Prometheus Metrics for Workload Tuning

<img src="/docs/assets/svg/f-prometheus.svg" alt="Prometheus and Tuning Icon" style="width:200px;">

OpenEBS volumes are instrumented for granular data metrics such as volume IOPS, throughput, latency and data patterns. As OpenEBS follows CAS architecture, Stateful applications can be tuned for better performance by observing the traffic data patterns on Prometheus and tweaking the storage policy parameters without worrying about neighboring workloads that are using OpenEBS.

<hr>
<br>

<br>

<br>





## OpenEBS Benefits



### Truly Cloud Native Storage for Kubernetes

<img src="/docs/assets/svg/b-cn.svg" alt="Cloud Native Storage Icon" style="width:200px;"> 
With CAS architecture and being entirely in user space, OpenEBS is a truly cloud native storage for stateful applications on Kubernetes. This dramatically simplifies how persistent storage is used and managed by developers and DevOps architects. They use the standard Kubernetes skills and utilities to configure, use and manage the persistent storage needs.

<hr>

<br>


### Avoid Cloud Lock-in

<img src="/docs/assets/svg/b-no-lockin.svg" alt="Avoid Cloud Lockin Icon" style="width:200px;">

Even with Kubernetes, data gravity concerns exist on clouds. With Kubernetes, stateful applications can be moved across clouds. But with stateful applications, the data is written to cloud provider storage infrastructure and results in the cloud lock-in of the stateful applications. With the OpenEBS, the data is written to the OpenEBS layer and it acts as the data abstraction layer. Using this data abstraction layer, data can be moved across Kubernetes layers eliminating the expensive cloud lock-in issue.

<hr>

<br>



### Granular Policies Per Stateful Workload

<img src="/docs/assets/svg/b-granular.svg" alt="Workload Granular Policies Icon" style="width:200px;">

Containerization of storage software and dedicating such a controller for each volume brings in maximum granularity in storage policies. The storage parameters can be monitored on a per-volume basis and storage policies can be dynamically updated at run time to achieve the desired result for a given workload. The policies are tested and tuned, keeping only the particular workload in mind, neighboring workloads are unaffected. The operations and maintenance of storage are greatly reduced because of this dedicated storage stack per workload.

<hr>

<br>




### Reduced Storage TCO up to 50% 

 <img src="/docs/assets/svg/b-lowtco.svg" alt="Reduced Storage TCO Icon" style="width:200px;">

On most clouds, block storage is charged based on how much is purchased and not on how much is used. The thin provisioning feature of OpenEBS is useful in pooling the local storage or cloud storage and start giving out the data volumes to the stateful applications in whatever size they need. The storage can be added on the fly without any disruption to the volumes exposed to the workloads or applications. This process has shown cost savings of up to 50% in the medium to the long term of running workloads on clouds.

<hr>

<br>

### Natively Hyperconvergenced on Kubernetes

<img src="/docs/assets/svg/b-hci.svg" alt="Natively HCI on K8s Icon" style="width:200px;">

Node Disk Manager (NDM) in OpenEBS enables disk management in a Kubernetes way or by using Kubernetes constructs. Using OpenEBS, nodes in the Kubernetes cluster can be horizontally scaled without worrying about managing persistent storage needs of stateful applications. The storage needs (capacity planning, performance planning, and volume management) of a cluster can easily be automated using the volume and pool policies of OpenEBS.

<hr>
<br>


### High Availability 

<img src="/docs/assets/svg/b-ha.svg" alt="High Availability Icon" style="width:200px;"> 

There is no blast radius effect. CAS architecture does not have the blast radius issue that is typically observed in the traditional storage systems. Metadata of the volume is not centralized and is kept local to the volume. Losing any node results in the loss of volume replicas present only on that node. As the volume data is synchronously replicated at least on two other nodes, in the event of a node failure, the data continues to be available at the same performance levels.


<hr>


<br>



<br>

## See Also:

### [Object Storage with OpenEBS](/docs/next/minio.html)

### [RWM PVs with OpenEBS](/docs/next/rwm.html)

### [Local storage for Prometheus ](/docs/next/prometheus.html)

<br>

<hr>

<br>
