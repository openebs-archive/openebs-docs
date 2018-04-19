---
id: version-latest-features
title: OpenEBS Features
sidebar_label: Features
original_id: features
---

------

### Containerized Storage

OpenEBS follows CAS architecture. Volumes provisioned through OpenEBS are always containerized. Each volume has a dedicate storage controller that increases the agility and granularity of persistent storage operations of the stateful applications. Benefits and more details on CAS architecture are found [here](/docs/conceptcas.html)  

### Avoid cloud lock-in

Avoiding vendor/cloud lock-in is the common goal for most of the users and enterprises and this goal has contributed significantly to the adoption of Kubernetes as it is the widely accepted orchestration platform for containers. However, data of the stateful application data remains as the lock-in contributor either to a given technology or to a cloud. With CAS approach, orchestration is made possible in a way storage controllers can migrate the data in the background to anywhere and live migration becomes fairly easy task. In other words, stateful workloads can be moved from from Kubernetes cluster to any other Kubernetes cluster.

### Simplified installation

[Installing](/docs/installation.html) OpenEBS on a Kubernetes cluster is very simple and straight forward. Installation is achieved through the OpenEBS operator or using helm charts.    

### Enterprise grade replication and data protection 

OpenEBS supports synchronous replication for high availability and asynchronous replication through incremental snapshots for data protection. 

### Granular volume policies

Containerization of storage software and dedicating such controller for each volume brings in maximum granularity in storage policies. All storage policies can be configured as per volume. The storage parameters can be monitored on a per volume basis and storage policies can be dynamically updated at run time to achieve the desired result for a given workload. Control on storage throughput, IOPS and latency increases with this level of granularity in the volume storage policies.

### Enables Hyperconvergence on Kubernetes

Node Disk Manager in OpenEBS enables disk management in a Kubernetes way or by using Kubernetes constructs. Using OpenEBS, nodes in the Kubernetes cluster can be horizontally scaled without worrying about managing persistent storage needs of stateful applications. The storage needs (capacity planning, performance planning and volume managment) of the cluster can easily be automated using the volume and pool policies of OpenEBS. 

### Kubernestes integrated Snapshots and Clones

OpenEBS implements the Kubenetes snapshot provisioner specification. Taking snapshots of a given volume and creating clones from a given snapshot are native to Kubernetes. <Provide a link to the task of creating a snapshot and clone>

### No blast radius

CAS architecture does not follow a typical distributed storage architecture with blast radius limitations. With synchronous replication happening from storage controller onto the storage replicas, the storage becomes highly available. The metadata of replicas of a volumes are not shared among the nodes and is independently managed on each local node. If a node fails, the storage controller, which is a stateless container in this case, is spun on a node where second or third replica is running and data continues to be available. Hence, with CAS there is no blast radius effect that is typically seen distributed storage systems such as Ceph, Glusterfs etc in the event of node failures.

### Integration with Prometheus and Grafana

Prometheus is installed as a microservice by the OpenEBS operator during the initial setup. Prometheus monitoring for a given volume is controlled by a volume policy. With granular volume stats, disk-pool stats and disk stats, the prometheus and grafana tool combination will empower the OpenEBS user community immensely in persistent data monitoring.

### Integration with WeaveScope

Node Disk Manager components, volume pods, and other persistent storage structures of Kubernetes are being enabled for WeaveScope integration. With these enhancements, exploration and traversal of these components will become significantly easier

### Configurable storage engines

OpenEBS provides two storage engines - Jiva and cStor. Architecturally, both provide containerized volumes and features and performance capabilities vary. Users can choose either Jiva or cStor by configuring a policy parameter of the volume parameter in a storage class decides which storage engine to use. 

### Free tier access to MayaOnline

MayaOnline is the Saas service for OpenEBS enabled Kubernetes clusters for a comprehensive monitoring and management of OpenEBS volumes. All users of OpenEBS have permanent free tier in [MayaOnline](https://www.mayaonline.io)









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
