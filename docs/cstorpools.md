---
id: cStorPools
title: cStor Pools 
sidebar_label: cStor Pools
---

------

## Introduction to cStor Pools

A cStor pool is local to a node in OpenEBS and it refers to aggregation of disks that are attached to that node. It is an important subject for the Kubernetes administrators in the design and planning of storage classes  which are the primary interfaces to the persistent volumes or to the persistent storage needs. cStor pools have multiple benefits

- Aggregation of disks to increase the available capacity and performance on the fly
- Thin provisioning of capacity. Volumes can be allocated more capacity than what is available in the node
- When the pool is configured in mirror mode, High Availability of storage is achieved when disk loss happens 

The cStor Pools are represented as Kubernetes custom resources called *csp*. A cStor Pool is constructed through a Storage Pool Claim specification by the storage administrator. 

![PVC and Storage Pool relationship](/docs/assets/pvcspc.png)



Node Disk Manager or NDM which runs as a daemonset would have discovered all the locally connected disks and created disk CRs. Administrator uses these disk CRs to construct the storage pool claim specification and creates a cStor Pool CR, which are referred in turn in the storage class specification as shown above.

## Data replication and pools in cStor

Synchronous data replication and rebuilding happen at volume level by the cStor target. Volume replicas are scheduled to be deployed on cStor pools located on different nodes. In the given example figure below, a pool configuration is defined as having three replicas or three independent pools . The pool replicas are totally independent from each other in that each is a different pool in itself and could host different number of volumes. For example, replica3 of pool1 in Node3 has two volumes whereas the other two pool replicas have only one volume each. The pool replicas are related to each other only at the level of target where target decides where to host the volume/data replicas/copies.



![cStor Pools in OpenEBS](/docs/assets/cstorpools.png)



## Anatomy of a cStor pool

A cStor pool spec consists of

- Number of pool replicas
- List of nodes that host the pools
- List of disks on each node that constitute the pool on that given node
- Type of pool (currently stripe and mirror are supported). Refer to the [cStor Pool roadmap](/docs/next/cStorPools.html#cstor-pool-feature-roadmap) to find the status of RAIDz1 support

**Number of pool replicas:** It is good to start with 3 pool replicas as the number of volume replicas will be typically three or one. Number of replicas are fixed in OpenEBS 0.8 version. Support for increasing the pool replicas on the fly is in the [cStor Pool roadmap](/docs/next/cStorPools.html#cstor-pool-feature-roadmap)  . At the time of cStor pool creation, individual and independent pools are created on the specified nodes. 

**List of nodes that host the pools:** This information and the number of pool replicas are implicitly provided by analyzing the provided disk CRs in the spec file. For example, if the spec file has 3 disk CRs, which belong to 3 different nodes, it implicitly means the number of pool replicas are 3 and the list of nodes taken from the disk CR metadata.

**List of disks:** This is perhaps the most important information in the pool specification. The disk CRs need to be listed and carefully taken by first determining the list of nodes and the number of disks on each node. 

**Type of pool:** This is also another important configuration information in the pool specification. It defines how the disks are pooled together within a node. Possible configurations are 

- STRIPE
- MIRROR
- RAIDZ1 (Roadmap)
- RAIDZ2 (Roadmap)

***Note:*** A pool cannot be extended beyond a node. When the pool type is STRIPE, it should not be assumed that data is striped across the nodes. The data is striped across the disks within a the pool on a given node. As mentioned in the data replication section, the data is synchronously replicated to as many number of pools as the number of volume replicas irrespective of the type of pool.  

## Operations on cStor Pool 

cStor Pool is an important component in the storage management. It is fundamental to storage planning especially in the context of hyperconvergence planning. The following are the different operations that can be performed on cStor Pools.

![Operations on cStor Pools](/docs/assets/poolops.png)

**Create a Pool :** Create a new pool with all the configuration. It is typically to start a pool with 3 pool replicas on three nodes. Currently pool types supported are STRIPE and MIRROR. A pool needs to be created before storage classes are created. So, pool creation is the first configuration step in the OpenEBS configuration.

**Add a new pool replica** : (Not supported in OpenEBS 0.8, refer to the  [cStor Pool roadmap](/docs/next/cStorPools.html#cstor-pool-feature-roadmap)  ) .A new pool replica may need to be added for many different reasons. Some of them could be 

- New node is being added to the Kubernetes cluster and the disks in the new node need to be considered for persistent volumes storage
- An existing pool replica is full in capacity and it cannot be expanded as either local disks or network disks are not available. Hence, new volumes need to be provisioned on new pool replicas.
- An existing pool replica is fully utilized in performance and it cannot be expanded either because CPU is saturated or more local disks are not available or more network disks or not available. Hence new volumes need to be provisioned on new pool replicas. 

**Expand a given pool replica :** (Not supported in OpenEBS 0.8, refer to the [cStor Pool roadmap](/docs/next/cStorPools.html#cstor-pool-feature-roadmap)  .  cStor Pools support thin provisioning, which means that the volume replica that resides on a given cStor pool can be given much bigger size or quota than the physical storage capacity available in the pool. When the actual capacity becomes nearly full (80% or more for example), the pool replica is expanded by adding a set of disks to it. If the pool replica type is stripe, then the disks can be added in any multiples of disks (1 disk or more) at a time, but if the type is any of the RAIDZx, then the expansion is done by adding any multiples of RAIDZ groups (1 group or more). 

**Delete a pool replica** : (Not supported in OpenEBS 0.8, refer to the  [cStor Pool roadmap](/docs/next/cStorPools.html#cstor-pool-feature-roadmap) . When a Kubernetes node needs to be drained in a planned manner, then the data needs to be moved to another node first. Typical procedure would be to move the volume replicas on the pool replica to be moved on the fly to another pool and then delete the current pool replica.



## Basic command line options to work with cStor Pools

As cStor Pools are implemented as Kubernetes custom resources, kubectl command line interface is used interact with them. These commands are cluster scoped and do not need the namespace argument. useful commands are

```
kubectl get spc
```

```
kubectl get csp
```

```
kubectl get disks
```

 

## cStor Pool feature roadmap

| Feature                                                      | Release           |
| ------------------------------------------------------------ | ----------------- |
| cStor pool creation and initial use with either stripe mode or RAIDZ0 (mirror) mode | 0.8.0             |
| Support for RAIDZ1                                           | 0.9.0             |
| Support for RAIDZ2                                           | Not scheduled yet |
| Adding a new pool replica                                    | 0.9.0             |
| Expanding a given pool replica (add disks to a pool after it is created) | Not scheduled yet |
| Deleting a pool replica                                      | Not scheduled yet |



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
