---
id: features
title: OpenEBS Features and Benefits
sidebar_label: Features and Benefits
---

------

<font size="6">OpenEBS Features</font>

- [Containerized Storage for Containers](#containerized-storage-for-containers)
- [Synchronous replication](#synchronous-replication)
- [Snapshots and clones](#snapshots-and-clones)
- [Backup and Restore](#backup-and-restore)
- [Prometheus metrics and Grafana graphs](#prometheus-metrics-for-workload-tuning)



<font size="6">OpenEBS Benefits</font>

- [Granular policies per stateful workload](#granular-policies-per-stateful-workload)

- [Avoid Cloud Lock-in](#avoid-cloud-lock-in)
- [Reduced storage TCO upto 50%](#reduced-storage-tco-upto-50)
- [Native Hyperconvergence on Kubernetes](#native-hyperconvergence-on-kubernetes)
- [High availability - No Blast Radius](#high-availability)
- [Free cross cloud visibility of stateful applications](#free-cross-cloud-visibility-of-stateful-applications)



For more information on how OpenEBS is used in cloud native environments,  visit the [use cases](/v140/docs/next/usecases.html) section.





<br>

## OpenEBS Features

<br>

### Containerized Storage for Containers

<img src="/docs/assets/svg/f-cas.svg" alt="Smiley face" 		style="width:200px;">

OpenEBS follows CAS architecture. Volumes provisioned through OpenEBS are always containerized. Each volume has a dedicated storage controller that increases the agility and granularity of persistent storage operations of the stateful applications. Benefits and more details on CAS architecture are found <a href="/v140/docs/next/cas.html" target="_blank">here</a>.

<hr>

<br>

### Synchronous Replication

<img src="/docs/assets/svg/f-replication.svg" alt="Smiley face" style="width:200px;">
OpenEBS synchronously replicates the data volume replicas for high availability. The replication happens across Kubernetes zone resulting in the cloud native applications to be highly available in cross AZ setups. This feature is especially useful to build highly available stateful applications using local disks on cloud providers services such as GKE, EKS and AKS.

<hr>



<br>

### Snapshots and Clones

<img src="/docs/assets/svg/f-snapshots.svg" alt="Smiley face" style="width:200px;">

Copy-on-write snapshots are a key feature of OpenEBS. The snapshots are created instantaneously and there is no limit on the number of snapshots. The incremental snapshot capability enables data migration and portability services across Kubernetes clusters and across different cloud providers or data centers, enabling a true multi-cloud data plane for stateful applications. Operations on snapshots and clones are performed in completely Kubernetes native method using the standard kubectl command.

<hr>

<br>

### Backup and Restore

<img src="/docs/assets/svg/f-backup.svg" alt="Smiley face" style="width:200px;">

Backup and restore of OpenEBS volumes work with the recent Kubernetes backup and restore solution such as VMware velero (or HeptIO Ark). Data backup to object storage targets such as S3 or Minio can be built using OpenEBS incremental snapshot capability. This storage level snapshotting and backup saves a lot bandwidth and storage space as only the incremental data is used for backup.

<hr>

<br>

### Prometheus Metrics for Workload Tuning

<img src="/docs/assets/svg/f-prometheus.svg" alt="Smiley face" style="width:200px;">

OpenEBS volumes are instrumented for granular data metrics such as volume IOPS, throughput, latency and data patterns. As OpenEBS follows CAS architecture, Stateful applications can be tuned for better performance by observing the traffic data patterns on Prometheus and tweaking the storage policy parameters without worrying about neighbouring workloads that are using OpenEBS.

<hr>
<br>

<br>

<br>





## OpenEBS Benefits



### Truely Cloud Native Storage for Kubernetes

<img src="/docs/assets/svg/b-cn.svg" alt="Smiley face" style="width:200px;"> 
With CAS architecture and being completely in user space, OpenEBS is a truly cloud native storage for stateful applications on Kubernetes. This greatly simplifies how persistent storage is used and managed by developers and DevOps architects. They use the standard Kubernetes skills and utilities to configure, use and manage the persistent storage needs.

<hr>

<br>


### Avoid Cloud Lock-in

<img src="/docs/assets/svg/b-no-lockin.svg" alt="Smiley face" style="width:200px;">

Even with Kubernetes, data gravity concerns exist on clouds. With Kubernetes Stateful applications can be moved across clouds. But with Stateful applications, the data is written to cloud provider storage infrastructure and results in the cloud lock-in of the Stateful applications. With the OpenEBS, the data is written to the OpenEBS layer and it acts as the data abstraction layer. Using this data abstraction layer, data can be moved across Kubernetes layers eliminating the expensive cloud lock-in issue. 

<hr>

<br>



### Granular Policies Per Stateful Workload

<img src="/docs/assets/svg/b-granular.svg" alt="Smiley face" style="width:200px;">

Containerization of storage software and dedicating such controller for each volume brings in maximum granularity in storage policies. The storage parameters can be monitored on a per volume basis and storage policies can be dynamically updated at run time to achieve the desired result for a given workload. The policies are tested and tuned keeping only the particular workload in mind, neighbouring workloads are unaffected. The operations and maintenance of storage is greatly reduced because of this dedicated storage stack per workload.

<hr>

<br>




### Reduced Storage TCO upto 50% 

 <img src="/docs/assets/svg/b-lowtco.svg" alt="Smiley face" style="width:200px;">

On most clouds, block storage is charged based on how much is purchased and not on how much is used. Thin provisioning feature of OpenEBS is useful in pooling the local storage or cloud storage and start giving out the data volumes to the stateful applications in whatever size they need. The storage can be added on the fly without any disruption to the volumes exposed to the workloads or applications. This process has shown cost savings of upto 50% in the medium to long term of running workloads on clouds.

<hr>

<br>

### Native Hyperconvergence on Kubernetes

<img src="/docs/assets/svg/b-hci.svg" alt="Smiley face" style="width:200px;">

Node Disk Manager in OpenEBS enables disk management in a Kubernetes way or by using Kubernetes constructs. Using OpenEBS, nodes in the Kubernetes cluster can be horizontally scaled without worrying about managing persistent storage needs of stateful applications. The storage needs (capacity planning, performance planning, and volume management) of a cluster can easily be automated using the volume and pool policies of OpenEBS.

<hr>
<br>


### High Availability 

<img src="/docs/assets/svg/b-ha.svg" alt="High Availability" style="width:200px;"> 

There is no blast radius effect. CAS architecture does not have the blast radius issue that is typically observed in the traditional storage systems. Metadata of the volume is not centralized and is kept local to the volume. Losing any node results in the loss of volume replicas present only on that node. As the volume data is synchronously replicated at least on two other nodes, in the event of a node failure, the data continues to be available at the same performance levels.

<hr>

<br>

### Free Cross Cloud Visibility of Stateful Applications

<img src="/docs/assets/svg/b-crosscloud.svg" alt="Director Online" style="width:200px;">

Director Online is the SaaS service for OpenEBS enabled Kubernetes clusters that provide comprehensive monitoring and management of OpenEBS volumes. Logs of all OpenEBS volume pods are instantly uploaded to Director Online and available for users through Kibana dashboard. Topology view on Director Online is used very often to understand the Kubernetes resources when they are deployed at scale.

<hr>

<br>



<br>

## See Also:

### [Object Storage with OpenEBS](/v140/docs/next/minio.html)

### [RWM PVs with OpenEBS](/v140/docs/next/rwm.html)

### [Local storage for Prometheus ](/v140/docs/next/prometheus.html)

<br>

<hr>

<br>

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

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
