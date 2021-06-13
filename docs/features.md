---
id: features
title: OpenEBS Features
sidebar_label: Features
---

------

## OpenEBS Features

<br>
- [Containerized storage for containers](#containerized-storage-for-containers)
- [Synchronous replication](#synchronous-replication)
- [Snapshots and clones](#snapshots-and-clones)
- [Backup and restore](#backup-and-restore)
- [Prometheus metrics and Grafana dashboard](#prometheus-metrics-for-workload-tuning)
<br>

:::tip
For information on how OpenEBS is used in production,  visit the [use cases](/docs/next/usecases.html) section or see examples of users and their stories on the OpenEBS Adopters section [here](https://github.com/openebs/openebs/blob/master/ADOPTERS.md) where you can also share your experience.
:::


### Containerized Storage for Containers

<img src="/docs/assets/svg/f-cas.svg" alt="Containerized Storage Icon" style="width:200px;" align="right">

OpenEBS is an example of Container Attached Storage or CAS. Volumes provisioned through OpenEBS are always containerized. Each volume has a dedicated storage controller that increases the agility and granularity of persistent storage operations of the stateful applications. Benefits and more details on CAS architecture are found <a href="/docs/next/cas.html" target="_blank">here</a>.

<br>
<br>
<hr>

### Synchronous Replication

<img src="/docs/assets/svg/f-replication.svg" alt="Synchronous Replication Icon" style="width:200px;" align="right">
Synchronous Replication is an optional and popular feature of OpenEBS.  When used with the Jiva, cStor and Mayastor storage engines, OpenEBS can synchronously replicate the data volumes for high availability. The replication happens across Kubernetes zones resulting in high availability for cross AZ setups. This feature is especially useful to build highly available stateful applications using local disks on cloud providers services such as GKE, EKS and AKS. 

<br>
<br>
<hr>

### Snapshots and Clones

<img src="/docs/assets/svg/f-snapshots.svg" alt="Snapshots and Clones Icon" style="width:200px;" align="right">

Copy-on-write snapshots are another optional and popular feature of OpenEBS. When using the cStor engine, snapshots are created instantaneously and there is no limit on the number of snapshots. The incremental snapshot capability enhances data migration and portability across Kubernetes clusters and across different cloud providers or data centers. Operations on snapshots and clones are performed in completely Kubernetes native method using the standard kubectl commands.  Common use cases include efficient replication for back-ups and the use of clones for troubleshooting or development against a read only copy of data.  

<br>
<br>
<hr>

### Backup and Restore

<img src="/docs/assets/svg/f-backup.svg" alt="Backup and Restore Icon" style="width:200px;" align="right">

The backup and restore of OpenEBS volumes works with Kubernetes backup and restore solutions such as Velero (formerly Heptio Ark) via open source OpenEBS Velero-plugins. Data backup to object storage targets such as AWS S3, GCP Object Storage or MinIO are frequently deployed using the OpenEBS incremental snapshot capability. This storage level snapshot and backup saves a significant amount of bandwidth and storage space as only incremental data is used for backup.

<br>
<br>
<hr>

### Prometheus Metrics for Workload Tuning

<img src="/docs/assets/svg/f-prometheus.svg" alt="Prometheus and Tuning Icon" style="width:200px;" align="right">

OpenEBS volumes are instrumented for granular data metrics such as volume IOPS, throughput, latency and data patterns. As OpenEBS follows the CAS pattern, stateful applications can be tuned for better performance by observing the traffic data patterns on Prometheus and modifying the storage policy parameters without worrying about neighboring workloads that are using OpenEBS thereby minimizing the incidence of "noisy neighbor" issues.  

<br>
<br>
<hr>


## See Also:

### [OpenEBS Benefits](/docs/next/benefits.html)

### [Object Storage with OpenEBS](/docs/next/minio.html)

### [Read Write Many (RWX) PVs with OpenEBS](/docs/next/rwm.html)

### [Local storage for Prometheus ](/docs/next/prometheus.html)

<br>
<hr>
<br>
