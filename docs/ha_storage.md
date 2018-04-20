---
id: ha
title: High Availability Storage
sidebar_label: High Availability Storage
---
<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  Documentation for OpenEBS v0.5-old is no longer actively maintained. The version you are currently viewing is a static snapshot. For up-to-date documentation, see the [latest](https://docs.openebs.io) version.
</strong></p></center>

High Availability storage (HA storage) is a storage system that is continuously operational. Redundancy is a key feature of HA storage, as it allows data to be kept in more than one place and protects it.

OpenEBS Jiva Volume is a controller with one or more replicas. The controller is an iSCSI target whereas the replica plays the role of disk. The controller exposes the iSCSI target while the actual data is written. The controller and each individual replica run inside a dedicated container.

OpenEBS Jiva Volume controller exists as a single instance but there can be multiple instances of OpenEBS Jiva volume replicas. Persistent data is synchronized between replicas.

OpenEBS Jiva Volume HA is based on various scenarios as explained in the following sections.

OpenEBS Jiva Volume with two or more replicas and a single controller
---------------------------------------------------------------------

**NOTE:** In this deployment, each of the replicas get scheduled in a unique K8s node, that is, a K8s node will never have two replicas of an OpenEBS volume.

**Scenario 1** - When an OpenEBS volume controller POD crashes, the following occurs.

-   The controller gets re-scheduled as a new Kubernetes POD.
-   Policies are in place that ensures faster rescheduling.

**Scenario 2** - When a K8s node that hosts OpenEBS volume controller goes offline, the following occurs.

-   The controller gets re-scheduled as a new Kubernetes POD.
-   Policies are in place that ensures faster rescheduling.
-   If Kubernetes node is unavailable, the controller gets scheduled on one of the available nodes.

**Scenario 3** - When an OpenEBS volume replica POD crashes for reasons other than node not-ready and node un-reachable, the following occurs.

-   The replica is re-scheduled as a new Kubernetes POD.
-   The replica may or may not be re-scheduled on the same K8s node.
-   There is data loss with this newly scheduled replica if it gets re-scheduled on a different K8s node.

**Scenario 4** - When a K8s node that hosts OpenEBS volume replica goes offline, the following occurs.

-   There is no storage downtime as the other available replica displays inputs/outputs.
-   Policies are in place that does not allow re-scheduling of crashed replica (as replica is tied to a node's resources) to any other node.


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
