---
id: cstor
title: cStor Overview
sidebar_label: cStor
---

------

cStor is the recommended storage engine in OpenEBS. cStor was originally introduced in OpenEBS 0.7 release and has been tested well in the community and in production deployments. The primary function of cStor is to serve the iSCSI block storage using the underlying disks in a cloud native way. cStor is a very light weight and feature rich storage engine. It provides enterprise grade features such as synchrous data replication, snapshots, clones, thin provisioning of data, high resiliency of data, data consistency and on-demand increase of capacity or performance. 

When the stateful application desires the storage to provide high availability of data, cStor is configured to have 3 replicas where data is written synchronously to all the three replicas. As shown below, the cStor target is replicating the data to Node1 (R1), Node3(R2) and Node4(R3). The data is written to the three repicas before the response is sent back to the application. It is important to note that the replicas R1, R2 and R3 are copies of the same data written to by the target, data is not striped across replicas or across nodes.

<br><img src="/docs/assets/cstor-for-deployment.png" alt="cStor components" width="900"/>

<br>



When the stateful application itself is taking care of data replication, it is typically deployed as a Kubernetes *statefulset*. For a statefulset, it is typical to configure cStor to have one replica.

<br><img src="/docs/assets/cstor-for-statefulset.png" alt="cStor components" width="900"/>

<br>



cStor has two main components:

(a) **cStor Pool Pods:** cStor Pool Pods are responsible for persisting the data on to the disks. The cStor Pool Pods are instantiated on a node and are provided with one or more disks on which data will be saved. Each cStor Pool Pod - can save data of one or more cStor Volumes. cStor Pool Pod - carves out space for each volume replica, manages the snapshots and clones of the replica. A set of such cStor Pool Pods form a single Storage Pool. The administrator will have to create a Storage Pool of type cStor - before creating a StorageClass for cStor Volumes. 

(b) **cStor Target Pods:**  When a cStor Volume is provisioned, it creates a new cStor Target Pod that is responsible for exposing the iSCSI LUN. cSTor Target Pod receives the data from the workloads, and then passes it on to the respective cStor Volume Replicas (on cStor Pools). cStor Target Pod handles the synchronous replication and quorum management of its replicas. 

## cStor targets 

cStor target runs in a pod and exposes an iSCSI lun on 3260 port. It also exports the volume metrics that can be scraped by Prometheus. 

## cStor pools

A cStor pool is local to a node in OpenEBS.  A pool on a node is an aggregation of set of disks which are attached to that node. A pool contains replicas of different volumes, with not more than one replica of a given volume. OpenEBS scheduler at run time decides to schedule a replica in a pool according to a policy. A pool can be expanded dynamically without affecting the volumes residing in it. An advantage of this capability is the thin provisioning of cStor volumes. A cStor volume size can be much higher at the provisioning time than the actual capacity available in the pool.

 <br><img src="/docs/assets/cstor-pool.png" alt="cStor components" width="400"/>

<br>



A pool is an important OpenEBS component for the Kubernetes administrators in the design and planning of storage classes  which are the primary interfaces to consume the persistent storage by applications or application developers. 

<br>**Benefits of a cStor pool**

- Aggregation of disks to increase the available capacity and/or performance on demand

- Thin provisioning of capacity. Volumes can be allocated more capacity than what is available in the node
- When the pool is configured in mirror mode, High Availability of storage is achieved when disk loss happens 

### Relationship between cStor volumes and cStor pools

cStor pools are a group of individual pools with one pool on each participating node. Individual pools in the group are named as pool instances and corresponding pod for each pool instance is referred to as  cStor pool pod.  The pools are totally independent from each other in that each is a different pool in itself and could host different number of volumes. They simply contain volume replicas.  For example, replica3 of pool1 in Node3 has two volumes whereas the other two pool replicas have only one volume each. The pool replicas are related to each other only at the level of target where target decides where to host the volume/data replicas/copies. 

Replication of data does not happen at the pool level. Synchronous data replication and rebuilding happen at volume level by the cStor target. Volume replicas are scheduled to be deployed on cStor pools located on different nodes. In the example figure below, a pool configuration is defined as having three replicas or three independent pools .

<img src="/docs/assets/cstorpools.png" alt="cStor Pools in OpenEBS" width="700"/>

<br>

### Relationship among PVC, PV, Storage Class, cStor pool and disks

Storage administrators or DevOps administrators first build cStor pools using discovered disks on the designated OpenEBS nodes. Once pools are built, they are used to design and build storage clases. Application developers then use PVC and storage class to obtain a PV for the applications. 

<img src="/docs/assets/pvcspc.png" alt="PVC and Storage Pool relationship" width="700"/>

<br>

### cStor pool spec details

A cStor pool spec consists of

- Number of pools
- List of nodes that host the pools
- List of disks on each node that constitute the pool on that given node
- RAID type within the pool (currently stripe and mirror are supported). Refer to the [cStor Pool roadmap](/docs/next/cStorPools.html#cstor-pool-feature-roadmap) to find the status of RAIDz1 support

**Number of pools:** It is good to start with 3 pools as the number of volume replicas will be typically three or one. However, the number of pools are fixed in OpenEBS 0.8 version. Support for increasing the pool replicas on the fly is in the [cStor Pool roadmap](/docs/next/cStorPools.html#cstor-pool-feature-roadmap)  . At the time of cStor pool creation, individual and independent pools are created on the specified nodes. 

**List of nodes that host the pools:** This information and the number of pool replicas are implicitly provided by analyzing the provided disk CRs in the spec file. For example, if the spec file has 3 disk CRs, which belong to 3 different nodes, it implicitly means the number of pool replicas are 3 and the list of nodes taken from the disk CR metadata.

**List of disks:** This is perhaps the most important information in the pool specification. The disk CRs need to be listed and carefully taken by first determining the list of nodes and the number of disks on each node. 

**Type of pool:** This is also another important configuration information in the pool specification. It defines how the disks are pooled together within a node. Possible configurations are 

- STRIPE
- MIRROR
- RAIDZ1 (Roadmap)
- RAIDZ2 (Roadmap)

***Note:*** A pool cannot be extended beyond a node. When the pool type is STRIPE, it should not be assumed that data is striped across the nodes. The data is striped across the disks within a the pool on that given node. As mentioned in the data replication section, the data is synchronously replicated to as many number of pools as the number of volume replicas irrespective of the type of pool.  

<br>

### Operations on cStor Pool 

cStor Pool is an important component in the storage management. It is fundamental to storage planning especially in the context of hyperconvergence planning. The following are the different operations that can be performed on cStor Pools.



**Create a Pool :** Create a new pool with all the configuration. It is typical to start a pool with 3 pool instances on three nodes. Currently RAID types supported for a given pool instance are STRIPE and MIRROR. A pool needs to be created before storage classes are created. So, pool creation is the first configuration step in the OpenEBS configuration process.

**Add a new pool instance** : (Not supported in OpenEBS 0.8, refer to the  [cStor roadmap](/docs/next/cstor.html#cstor-roadmap)  ) .A new pool instance may need to be added for many different reasons. Few example scenarios  are:

- New node is being added to the Kubernetes cluster and the disks in the new node need to be considered for persistent volumes storage
- An existing pool instance is full in capacity and it cannot be expanded as either local disks or network disks are not available. Hence, a new pool instance may be needed for hosting the new volume replicas.
- An existing pool instance is fully utilized in performance and it cannot be expanded either because CPU is saturated or more local disks are not available or more network disks or not available. A new pool instance may be added and move some of the existing volumes to the new pool instance to free up some disk IOs on this instance. 

**Expand a given pool instance :** (Not supported in OpenEBS 0.8, refer to the [cStor roadmap](/docs/next/cstor.html#cstor-roadmap)  ).  cStor Pools support thin provisioning, which means that the volume replica that resides on a given cStor pool can be given much bigger size or quota than the physical storage capacity available in the pool. When the actual capacity becomes nearly full (80% or more for example), the pool instance is expanded by adding a set of disks to it. If the pool instance's disk RAID type is STRIPE, then the disks can be added in any multiples of disks (1 disk or more) at a time, but if the type is any of the RAIDZx, then the expansion is done by adding any multiples of RAIDZ groups (1 group or more). 

**Delete a pool instance** : (Not supported in OpenEBS 0.8, refer to the  [cStor roadmap](/docs/next/cstor.html#cstor-roadmap) . When a Kubernetes node needs to be drained in a planned manner, then the volume replicas in the pool instance that resides on that node need to be drained by moving them to other pool instance(s). Once all the volume replicas are drained, the pool instance is deleted.



## cStor Volume snapshots

cStor snapshots are taken instantaneously as they are point-in-time copy of the volume data. OpenEBS supports standard Kubernetes API to take snapshots and restore volumes from snapshots. 

Example specification for a snapshot is shown below. 

*Note that the snapshot is taken on a PVC and not on PV.* 

```
apiVersion: volumesnapshot.external-storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: snapshot-vol1
  namespace: default
spec:
  persistentVolumeClaimName: cstor-vol1-1r-claim
```

When the above snapshot specification is run through *kubectl*  it creates two Kubernetes resources. 

- Volume snapshot
- Volume snapshot data 

Following command is used to list the snapshots in a given namespace 

```
kubectl get volumesnapshots -n <namespace>
```



*Note 1: When cStor volume has three replicas, creation of volume snapshots is possible when the volume is in quorum, which means the at least two of the replicas are online and fully synced.* 



<br><img src="/docs/assets/snapshot-scope.png" alt="cStor components" width="800"/>

<br>

## cStor volume clones

Clones in cStor are also instantaneous. They are created in the same namespace as that of the snapshot and belong to the same cStor Pool. In Kubernetes storage architecture, clone is same as creating a new PV out of a snapshot. 

Example specification for creating a clone out of snapshot

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: demo-snap-vol-claim-cstor
  namespace: default
  annotations:
    snapshot.alpha.kubernetes.io/snapshot: snapshot-demo-cstor
spec:
  storageClassName: openebs-snapshot-promoter
```



For Statefulsets, snapshots are created against each PV. For creating a clone, any one snapshot is used in the volumeClaimTemplates specification. Kubernetes will launch the PVs for all the statefulset pods from the chosen snapshot.  Example specificaiton for creating a clone out of snapshot for a statefulset application is shown below.

  

```
volumeClaimTemplates:

- metadata:
  name: elasticsearch-logging-clone
  annotations:
    snapshot.alpha.kubernetes.io/snapshot: snapshot-20181121103439-078f
  spec:
    storageClassName: openebs-snapshot-promoter
```

*Note: One can mix and match the snapshots between deployments and statefulsets while cloning. For example, a snapshot taken using the PVC of a deployment can be used to clones for statefulset.*

<br>

## cStor cli

| CLI command                        | Purpose or remarks                                           |
| ---------------------------------- | ------------------------------------------------------------ |
| kubectl get spc                    | Get the list of storage pool claims (SPC is the spec for each cStor storage pool) |
| kubectl get csp                    | Get the list of storage pools (cstor storage pools). One SPC refers to one or more CSPs. If there are two pools - cstor-ssd-pool on 3 nodes and cstor-sas-pool on 4 nodes, then there will be two SPCs and 7 CSPs |
| kubectl get disks --labels         | Get the list of all disk CRs in the entire cluster           |
| kubectl get cStorVolume -n openebs | Get the list of cStor volumes in the entire cluster          |
| kubectl get cvr -n openebs         | Get the list of cStor volumes in the entire cluster          |
| kubectl get volumesnapshot         | Get the list of volumesnapshots in the entire cluster        |



## High availability of cStor

cStor volumes when deployed in 3 replica mode provide high availability of the data as long as the replicas are in quorum. At least two replicas need to be healthy to call the volume is in quorum. In a 3 replica setup, if the second replica becomes unavailable because of the pool failure or unavailability, the volume is set to read-only by the target. When the volume replicas are back online, they are rebuilt one by one and the volume is set to read-write as soon as the quorum is achieved. 



## Monitoring cStor pools and volumes

The easiest way to monitor cStor pools and volumes is through MayaOnline. The volume metrics are scraped and uploaded to MayaOnline where users can browse historical volume performance. MayaOnline also provides the topology view where detailed live status of Volumes, snapshots, clones, pools and disks is obtained. Through the topology view , users get granular details of each of these Kubernetes resources in an intuitive graphical user interface. 



Links to screenshots of some of the cStor resources in MayaOnline are shown below.

[Pool topology view](/docs/next/mayaonline.html#cstor-pool-view)

[Volume POD topology view](/docs/next/mayaonline.html#cstor-volume-pod-view)

[Volume CR topology view](/docs/next/mayaonline.html#cstor-custom-resources-view)

<br>

## Thin provisioning in cStor

cStor supports thin provisioning of volumes. By default, a volume is provisioned with whatever capacity that is mentioned in storage class. Capacity of the pool can be expanded on demand by adding more disks to the cStor pool. cStor architecture also supports the resizing of a provisoned volume on the fly, eventhough this feature is not fully functional yet and is part of the roadmap.

<br>

## Performance testing of cStor

Performance testing includes setting up the pools, storage classes and iSCSI server tunables. Some best practices include 

- Number of replicas - For statefulsets, when the application is doing the required replication, one replica at volume may be sufficient
- Network latency - Latency between the pods and zones (if the replicas are placed across AZs) plays a major role in the performance results and it needs to be in the expected range

### Seeking help or contact support

As cStor volume has a dedicated iSCSI stack, it can be tuned with number of worker threads and other advanced parameters depending on the type of workload.  

- Connect the Kubernetes cluster to MayaOnline. It is free and provides seamless monitoring of OpenEBS volumes
- Contact OpenEBS community on [Slack](https://slack.openebs.io) and seek further help



## Known limitations

**After a node shutdown, I see application stuck in container creating waiting for PV to be attached.:**

When a Kubernetes node is involved in an unplanned shutdown like a power loss or software hang etc, the PVs which are mounted on that node will not be mounted by Kubelet till the timeout of 30 minutes or 1800 seconds. In such scenarios, the application will lose connectivity to persistent storage. This limitation of Kubernetes will be resolved for OpenEBS PVs when the CSI driver support is available for OpenEBS. With OpenEBS CSI driver in place, the unavailability of the node can be detected by the CSI driver node agent and do the force mount of the PV on the new node

**Cannot disable thin provisioning**

By default, cStor supports thin provisioning, which means that when a storage class or PVC specifies the size of the volume and the pool from which the volume must be provisioned, and volume of that size is provisioned irrespective of whether that much free space is available in the pool or not. There is no option to specify thick provision while requesting a volume provisioning

**Ephemeral storage use case** 

Consider a situation where the Kubernetes nodes consist of ephemeral local disks (like in EKS and GKE) and the cStor volume replica count is 3. Losing a node will bring up a new node with new empty local disks.  In OpenEBS 0.8.0, this situation will not result in rebuilding the cStor volumes onto the new pool of the newly brought up node. Instead it is considered just as a new node. The functionality of checking if the new node has the same Kubernetes label as the original one and rebuilding the data on that node is in the near-term cStor roadmap.

Note: It is common to reboot the nodes during Kubernetes upgrades and it may force the above situation if the nodes have local disks which are ephemeral in nature. It is NOT recommended to use OpenEBS cStor in such scenarios. OpenEBS 0.8.1 release is expected to have this support.

**Delayed snapshots**

In cStor, snapshots are taken only when the volume replicas are in quorum. For example, as soon as the volume is provisioned on cStor, the volume will be in ready state but the quorum attainment may take  few minutes. Snapshot commands during this period will be delayed or queued till the volumes replicas attain quorum. The snapshot commands received by the target are also delayed when the cStor volume is marked read-only because of no-quorum.



## Troubleshooting areas

Following are most commonly observed areas of troubleshooting

1. **iSCSI tools are not installed or iSCSI.d service is not running**

   **Symptom:**

   If iSCSI tools are not installed on the nodes, after lauching the application with PVC pointing to OpenEBS provisioner,  you may observe the application is in "ContainerCreating" state. 

   `kubectl describe pod <app pod> ` may give an error that looks like the following

   ```
   MountVolume.WaitForAttach failed for volume "pvc-33408bf6-2307-11e9-98c4-000d3a028f9a" : executable file not found in $PATH
   ```

   **Resolution**: 

   Install iSCSI tools and make sure iSCSI service is running. See [iSCSI installation](/docs/next/prerequisites.html#steps-for-configuring-and-verifying-open-iscsi)

2. **Multi-attach error is seen in the logs**

   **Symptom:**

   In a node failure case, it is sometimes observed that the application pods that were running on the node that went down are moved, the cStor target pods are also moved to other nodes, but the application throws up an error similar to below:

   ```
   Warning  FailedAttachVolume  4m15s  attachdetach-controller            
   Multi-Attach error for volume "pvc-d6d52184-1f24-11e9-bf1d-0a0c03d0e1ae" 
   Volume is already exclusively attached to one node and can't be attached to another
   ```

   **Resolution :**

   This is because of the Kubernetes limitation [explained above](/docs/next/cstor.html#known-limitations). OpenEBS CSI driver will resolve this issue. See [roadmap](/docs/next/cstor.html#cstor-roadmap). In this situation if the node is stuck in a non-responsive state and if the node has to be permanently deleted, remove it from the cluster.  

3. **Application is in ContainerCreating state, observed connection refused error**

   **Symptom:**

   Application is seen to be in the `ContainerCreating` state, with kubectl describe showing `Connection refused` error to the cStor PV. 

   **Resolution**: 

   This error eventually could get rectified on the further retries, volume gets mounted and application is started. This error is usually seen when cStor target takes some time to initialize  on low speed networks as it takes time to download cStor image binaries from repositories ( or )  or because the cstor target is waiting for the replicas to connect and establish quorum. If the error persists beyond 5 minutes, logs need to be verified, contact support or seek help on the community [slack](https://slack.openebs.io).

   

   

## cStor roadmap

| Feature                                                      | Release           |
| ------------------------------------------------------------ | ----------------- |
| cStor pool creation and initial use with either stripe mode or RAIDZ0 (mirror) mode | 0.8.0             |
| Support for RAIDZ1 in cStorPool                              | 0.9.0             |
| Support for RAIDZ2 in cStorPool                              | 0.9.0             |
| Expanding a given pool replica (add disks to a pool after it is created) | 0.9.0             |
| Adding a new cStorPool replica (CSP autoscaling)             | Not scheduled yet |
| Deleting a pool replica                                      | Not scheduled yet |
| CSI driver support                                           | 0.9.0             |
| Ephemeral disk/pool support for rebuilding                   | 0.8.1             |



## Advanced concepts in cStor

### Custom resources related to cStor

<br><img src="/docs/assets/cstor-cr.png" alt="cStor custom resources" width="900"/>

<br>

**Storage Pool Claim or SPC:**

Pool specification or Pool aggregate that holds all CSPs together

**cStor Storage Pool or CSP :** 

Points to an individual cStor pool on one node. There will also be a cStor-Pool-Pod corresponding to each CSP custom resource. *When a new node is added to Kubernetes node and configured to host a cStor pool, a new CSP CR and cStor-Pool-Pod are provisioned on that node and CVRs are migrated from other nodes for volume rebalancing. (CSP auto scaling feature is in the roadmap)* 

**cStor Volume or CV :** 

Points to an individual persistent volume. For each PV provisioned through CAS=cStor, there will be a corresponding CV custom resource

**cStor Volume Replica or CVR :** 

Each CV will have as many CVRs as the number of replicas configured in the cStor storage class. 

**Disks :**

Each discovered disk on a node is added as a disk CR. This is needed to identify a disk uniquely across the Kubernetes cluster. SPC secification contains the information about the disks CRs that correspond to a CSP on that given node

## See Also:

#### [Storage Engines in OpenEBS](/docs/next/storageengine.html)

#### [Provisioning cStor volumes](/docs/next/deploycstor.html)



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
