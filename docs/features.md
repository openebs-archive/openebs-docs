---
id: features
title: OpenEBS Features
sidebar_label: Features
---

------

## Containerized Storage

OpenEBS follows CAS architecture. Volumes provisioned through OpenEBS are always containerized. Each volume has a dedicated storage controller that increases the agility and granularity of persistent storage operations of the stateful applications. Benefits and more details on CAS architecture are found [here](/docs/next/conceptcas.html).

## Avoid Cloud Lock-in

Avoiding vendor/cloud lock-in is the common goal for most of the users and enterprises and this goal has contributed significantly to the adoption of Kubernetes as it is the widely accepted orchestration platform for containers. However, data of the stateful application remains as the lock-in contributor either to a given technology or to a cloud. With CAS approach, orchestration is made possible in such a way that storage controllers can migrate the data in the background to anywhere and live migration becomes a fairly easy task. In other words, stateful workloads can be moved from a Kubernetes cluster to any other Kubernetes cluster.

## Simplified installation

[Installing](/docs/next/installation.html) OpenEBS on a Kubernetes cluster is very simple and straight forward. Installation is achieved through the OpenEBS operator or by using helm charts.    

## Enterprise Grade Replication and Data Protection 

OpenEBS supports synchronous replication for high availability and asynchronous replication through incremental snapshots for data protection. 

## Granular Volume Policies

Containerization of storage software and dedicating such controller for each volume brings in maximum granularity in storage policies. All storage policies can be configured as per volume. The storage parameters can be monitored on a per volume basis and storage policies can be dynamically updated at run time to achieve the desired result for a given workload. Control on storage throughput, IOPS, and latency increases with this level of granularity in the volume storage policies.

## Enables Hyperconvergence on Kubernetes

Node Disk Manager in OpenEBS enables disk management in a Kubernetes way or by using Kubernetes constructs. Using OpenEBS, nodes in the Kubernetes cluster can be horizontally scaled without worrying about managing persistent storage needs of stateful applications. The storage needs (capacity planning, performance planning, and volume managment) of a cluster can easily be automated using the volume and pool policies of OpenEBS. 

## Kubernetes Integrated Snapshots and Clones

OpenEBS implements the Kubernetes snapshot provisioner specification. Taking snapshots of a given volume and creating clones from a given snapshot are native to Kubernetes. 

## No Blast Radius

CAS architecture does not follow a typical distributed storage architecture with blast radius limitations. With synchronous replication happening from storage controller onto the storage replicas, the storage becomes highly available. The metadata of volume replicas are not shared among the nodes and is independently managed on each local node. If a node fails, the storage controller, which is a stateless container in this case, is spun on a node where second or third replica is running and data continues to be available. Hence, with CAS there is no blast radius effect that is typically seen in distributed storage systems such as Ceph, Glusterfs etc. in the event of node failures.

## Integration with Prometheus and Grafana

Prometheus is installed as a microservice by the OpenEBS operator during the initial setup. Prometheus monitoring for a given volume is controlled by a volume policy. With granular volume, disk-pool, and disk statistics, the Prometheus and Grafana tool combination will empower the OpenEBS user community immensely in persistent data monitoring.

## Integration with WeaveScope

Node Disk Manager components, volume pods, and other persistent storage structures of Kubernetes are being enabled for WeaveScope integration. With these enhancements, exploration, and traversal of these components will become significantly easier.

## Configurable Storage Engines

OpenEBS provides two storage engines - Jiva and cStor. Architecturally, both provide containerized volumes and features and performance capabilities vary. Users can choose either Jiva or cStor by configuring a policy parameter. The volume parameter in a storage class decides which storage engine to use. 

## Free Tier Access to MayaOnline

MayaOnline is the SaaS service for OpenEBS enabled Kubernetes clusters required for comprehensive monitoring and management of OpenEBS volumes. All users of OpenEBS have a permanent free tier in [MayaOnline](https://www.mayaonline.io).









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
