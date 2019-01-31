---
id: bluegreen
title: OpenEBS use case - Blue Green deployments
sidebar_label: Blue/Green strategy
---

------

## Recap: Blue-Green deployment strategy in the context of Kubernetes stateful applications

Upgrade procedure for stateful applications with B-G strategy will have the following assumptions

**Application Developers MUST  ensure that:**

- No columns or tables are deleted, which are required by the old (Blue) software version. 
- When the newer (Green)  version is running, the application should make sure the older columns and tables are also updated, so that on rollback to older version, the software can still access data without errors. 
- Monitoring with metrics that can deterministically decide the health of the system. 

**Operations MUST  ensure that SOP or Playbooks are in place that:** 

- Leverage the Storage Volume - Snapshot and Replication Capabilities are utilized to minimize data loss and data recovery times. (Beyond using the database replication/recovery features)
- Chaos Engineering is applied on the Stateful Workloads. Don’t be Shy! This is the only way you can prepare the DevOps for dealing with “Upgrade Stress”. 

An example of a B-G strategy is shown below.

![Blue-Green strategy: stateful example](/docs/assets/bg-stateful.png)

<!--TODO: Can we display the image to the right aligned and have the text on the left side ?-->

One assumption that is made for B/G to work properly is that software and database schema changes are designed to be backward compatible.  The sequence of steps in B/G strategy will be similar to what is outlined below

- Green Deployment is brought up with the newer version.  
- If there is a database, the replication is set up between Blue DB -> Green DB.  
- If there is no DB, then Blue Volume -> Green Volume replication should be enabled.  
- Take snapshots are taken on the Blue volume.  
- DB Schema changes are applied on the Green Volume.  
- Green is made active DB/Volume and User traffic is directed towards Green Deployment  
- On success, Blue is deleted and Green will be  changed as Blue.  
- On failure,  Take snapshot on Green Volume  Blue DB/Volume is made active (master) and traffic is directed towards Blue Deployment.

## Blue Green deployment issues with stateful applications

- Blue Green strategy is the preferred practice for live upgrades. In the cloud native environments, stateful applications need support of underlying storage infrastructure to carry out the B/G upgrade strategy. Below are few of the challenges faced today in K8S environments 
  - The storage solutions may not be fully cloud native. Though the legacy applications may have been moved to the micro services model, the storage solutions may not have been integrated completed to work seamlessly with Kubernetes. This makes the DevOps teams to continue to follow the legacy practices for storage during the upgrade of stateful applications.
  - Taking snapshots and making clones of persistent volumes has to be easy and efficient for the Blue Green strategy to work

## OpenEBS solution

Features of OpenEBS that help in B/G strategy are:

- Snapshots
- Clones
- Volume replications

The above features help DevOps automate the upgrade of different types of stateful applications. 

For the purpose of describing various scenarios of B/G strategy, the stateful applications are categorized as 

1. Direct stateful application (or) no database stateful application
2. A database stateful application with no replication capability at database level (e.g.: BoltDB)
3. A distributed database stateful application with replication capability at database level (e.g: Cassandra or RabbitMQ with federated message queues)

### B/G strategy for stateful applications which are not databases

In this case, a direct clone of the OpenEBS volume is created and synchronous replication connection is set up between the primary volume (Blue) and secondary volume (Green). The B/G strategy sequence for upgrade is performed as described below.

1. Stateful application (APP-V1) is connected to OpenEBS volume OE-V1
2. OE-V1 is cloned to OE-V2 and a synchronous replication data connection is set up between OE-V1 and OE-V2
3. Once OE-V2 is ready, new version of the application (APP-V2) is launched and load balancer is pointed to APP-V2. OpenEBS volume is switched to reverse replication mode, the data is now synchronized from OE-V2 to OE-V1. It is important to note that the data schema of APP-V1 and APP-V2 are backward compatible with each other so that both versions of application can work with data.
4. If there is any issue with the application version APP-V2 / Green copy, the load balancer is pointed to APP-V1, where the latest data is already available on OE-V1. The deployment is back on Blue copy.

### B/G strategy for databases with no replication capabilities

### B/G strategy for distributed databases



Direct Apps and Standalone Database Apps can make use of the Clone feature to remove manual sync operations and also speed up the time required to set up a replicated deployment. 

Masterless Database Apps can make use of the Snapshot and Clone features to quickly add upgrade or downgrade a node in the ring by inline restore of the snapshots.

All type of Stateful Apps can make use of the snapshot and clone an integral part of the recovery steps that become inevitable in a fast-paced engineering teams. Teams focus on velocity and are not afraid to make mistakes. There are procedures in place to recover quickly from Chaos!



## Example BG NoDB with OpenEBS:

For databases like Bolt DB, that do not provide replication and are intended for single node installations.Database is exposed as a Service (i.e, the Apps consume the database using a named service)Database (v1) is removed from Service and a Clone of the Volume (Vol2) is created from (Vol1). A new version of Database (v2) is launched using Vol2 and is attached to the service. On immediate failure, the service is reverted back to Database (v1) with Vol1 since no data passed through. For rollback at a later time, say the new version of Database wasn’t tested on actual data and needs to revert back to Database (v1). A new clone volume Vol3 is created from Vol2 and attached to Database (v1). 

![BG No DB Using OpenEBS](/docs/assets/bg-nodb.png)

## Example BG DB with OpenEBS:

Examples are either Cassandra or MySQL with master-slave or RabbitMQ with Federated Message Queues. Repeat the following till all the DB instances are upgraded. Launch a new Distributed Data Node by cloning the existing volume. (Cloning will help to speed up the rebuild time when data per node is large). Introduce the newer version of the node as either new node into the ring or as replica. The node can either replace an existing node or be added as a new node. On failure, either remove the new node if it was added as extra node or replace back with the old node. If the old node is added back, its data will be updated to latest state via the other nodes. 



## Summary:

While most storage systems provide the Snapshot, Clone and Replication constructs, OpenEBS extends these capabilities by - 

Providing Granular Volumes per Application vs other storages that share the same system/container for multiple volumes. OpenEBS has a Low Blast Radius, if not none!

That data by being granular is also made very portable!

OpenEBS supports Blue/Green Deployment (aka Seamless Upgrades). For example, upgrading the storage controller doesn’t impact all the Stateful workloads running on the OpenEBS storage. In other words, not all storage workloads need to be upgraded at once. 

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
