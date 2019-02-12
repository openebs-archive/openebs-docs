---
id: features
title: OpenEBS Features and Benefits
sidebar_label: Features and Benefits
---

------

<font size="6">OpenEBS features</font>

- [Containerized Storage for Containers](/docs/next/features.html#containerized-storage-for-containers)
- [Synchronus replication](/docs/next/features.html#synchronus-replication)
- [Snapshots and clones](/docs/next/features.html#snapshots-and-clones)
- [Backup and Restore](/docs/next/features.html#backup-and-restore)
- [Prometheus metrics and Grafana graphs](/docs/next/features.html#prometheus-metrics-for-workload-tuning)



<font size="6">OpenEBS benefits</font>

- [Granular policies per stateful workload](/docs/next/features.html#granular-policies-per-stateful-workload)

- [Avoid Cloud Lock-in](/docs/next/features.html#avoid-cloud-lock-in)
- [Reduced storage TCO upto 50%](/docs/next/features.html#reduced-storage-tco-upto-50)
- [Native Hyperconvergence on Kubernetes](/docs/next/features.html#native-hyperconvergence-on-kubernetes)
- [High availability - No Blast Radius](/docs/next/features.html#high-availability-no-blast-radius)
- [Free cross cloud visibility of stateful applications](http://localhost:3000/docs/next/features.html#free-cross-cloud-visibility-of-stateful-applications)



For more information on how OpenEBS is used in cloud native environments,  visit the [use cases](/docs/next/usecases.html) section.

<br>

OpenEBS features

### Containerized Storage for Containers

<p>
    <img src="/docs/assets/feature-cas.png" alt="Smiley face" 		style="float:right;width:150px;">
OpenEBS follows CAS architecture. Volumes provisioned through OpenEBS are always containerized. Each volume has a dedicated storage controller that increases the agility and granularity of persistent storage operations of the stateful applications. Benefits and more details on CAS architecture are found <a href="/docs/next/cas.html" target="_blank">here</a>
</p>



<br>

### Synchronus replication

<p>
    <img src="/docs/assets/feature-replication.png" alt="Smiley face" 		style="float:right;width:150px;">OpenEBS synchronously replicates the data volume replicas for high availability. The replication happens across Kubernetes zone resulting in the cloud native applciations to be highly available in cross AZ setups. This feature is especially becomes useful to build highly available stateful applications using local disks on cloud providers services such as GKE, EKS and AKS 
</p>


<br>

### Snapshots and clones

<p>
    <img src="/docs/assets/feature-snaps.png" alt="Smiley face" 		style="float:right;width:150px;">Copy-on-write snapshots are a key feature of OpenEBS. The snapshots are created instantaneously and there is no limit on the number of snapshots. The incremental snapshot capablity enables data migration and portability services across Kubernetes clusters and across different cloud providers or data centers, enabling a true multi-cloud data plane for stateful applications. Operations on snapshots and clones are performed in completely Kubernetes native method using the standard kubectl command
</p>



<br>

### Backup and Restore

<p>
    <img src="/docs/assets/feature-backup.png" alt="Smiley face" 		style="float:right;width:150px;">Backup and restore of OpenEBS volumes work with the recent Kubernetes backup and restore solution such as VMware velero (or HeptIO Ark). Data backup to object storage targets such as S3 or Minio can be built using OpenEBS incremental snapshot capability. This storage level snapshotting and backup saves a lot bandwidth and storage space as only the incremental data is used for backup. 
</p>



<br>

### Prometheus metrics for workload tuning

<p>
    <img src="/docs/assets/feature-prometheus.png" alt="Smiley face" 		style="float:right;width:150px;">OpenEBS volumes are instrumented for granular data metrics such as volume IOPS, throughput, latency and data patterns. As OpenEBS follows CAS architecture, Stateful applications can be tuned for better performance by observing the traffic data patterns on Prometheus and tweaking the storage policy parameters without worrying about neighboring workloads that are using OpenEBS
</p>



<br>





OpenEBS benefits



### Truely cloud native storage for Kubernetes

<p>
    <img src="/docs/assets/benefits-cn.png" alt="Smiley face" 		style="float:left;width:150px;"> With CAS architecture and being completely in user space, OpenEBS is a truely cloud native storage for stateful applications on Kubernetes. This greatly simplifies how persistent storage is used and managed by developers and DevOps architects. They use the standard Kubernetes skills and utilities to configure, use and manage the peristent storage needs.
</p>


<br>


### Avoid Cloud Lock-in

<p>
    <img src="/docs/assets/benefits-nolockin.png" alt="Smiley face" 		style="float:left;width:150px;">
Even with Kubernetes data gravity concerns exist on clouds. With Kubernetes stateful applications can can be moved across clouds, but with stateful applications, the data is written to cloud provider storage infrastructure and results in the cloud lock-in of the stateful applications. The OpenEBS, the data is written to the OpenEBS layer and it acts as the data abstraction layer. Using this data abstraction layer, data can be moved across Kubernetes layers eliminating the expensive cloud lock-in issue. 
</p>




<br>

### Granular policies per stateful workload, reduces TCO of storage administration

<p>
    <img src="/docs/assets/benefits-granular.png" alt="Smiley face" 		style="float:left;width:150px;">
Containerization of storage software and dedicating such controller for each volume brings in maximum granularity in storage policies. The storage parameters can be monitored on a per volume basis and storage policies can be dynamically updated at run time to achieve the desired result for a given workload. The policies are tested and tuned keeping only the particular workload in mind, neighboring workloads are affected. The operations and maintainance of storage is greatly reduced because of this dedicated storage stack per workload
</p>



<br>




### Reduced storage TCO upto 50% 

<p>
    <img src="/docs/assets/benefits-lowtco.png" alt="Smiley face" 		style="float:left;width:150px;">On most clouds, block storage on cloud is charged based on how much is purchased and not on how much is used. Thin provisioning feature of OpenEBS is useful in pooling the local storage or cloud storage and start giving out the data volumes to the stateful applications in whatever size they need. The storage can be added on the fly without any disruption to the volumes exposed to the workloads or applications. This process has shown cost savings of upto 50% in the medium to long term of running workloads on clouds.
</p>









### Native Hyperconvergence on Kubernetes

<p>
    <img src="/docs/assets/benefits-hc.png" alt="Smiley face" 		style="float:left;width:150px;">Node Disk Manager in OpenEBS enables disk management in a Kubernetes way or by using Kubernetes constructs. Using OpenEBS, nodes in the Kubernetes cluster can be horizontally scaled without worrying about managing persistent storage needs of stateful applications. The storage needs (capacity planning, performance planning, and volume managment) of a cluster can easily be automated using the volume and pool policies of OpenEBS. 
</p>


### High availability (No Blast Radius)

<p>
    <img src="/docs/assets/benefits-ha.png" alt="Smiley face" 		style="float:left;width:150px;">
    CAS architecture does not have the typical blast radius issue that is typically observed in the traditional storage systems. Metadata of the volume is not centralized and is kept local to the volume. Losing any node results in the loss of volume replicas present only on that node. As the volume data is synchronous replicated at least on to two other nodes, in the event of a node failure, 	the data continues to be available at the same performance levels.
</p>



​    

### Free cross cloud visibility of stateful applications

<p>
    <img src="https://mayaonline.io/assets/images/mayaonlin-with-mule.svg" alt="MayaOnline" 		style="float:left;width:200px;">
   MayaOnline is the SaaS service for OpenEBS enabled Kubernetes clusters that provide  comprehensive monitoring and management of OpenEBS volumes. Logs of all OpenEBS volume pods are instantly uploaded to MayaOnline and available for users through Kibana dashboard. Topology view on MayaOnline used very often to understand the Kubernetes resources when they are deployed at scale. 
</p>


<br>

<br>

## See Also:

## [Object Storage with OpenEBS](/docs/next/minio.html)

## [RWM PVs with OpenEBS](/docs/next/rwm.html)

## [Local storage for Prometheus ](/docs/next/prometheus.html)

<br>

<hr>



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
