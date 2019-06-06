---
id: configurepools
title: Configuring Storage Pools
sidebar_label:Configure StoragePools
---
------

<br>

<img src="/docs/assets/svg/2-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>



<font size="6">Summary:</font>

[Creating a New Pool](#creating-a-new-pool)

[Pool Policies](#pool-policies)

[Day 2 Operations on cStorPools](#day-2-operations-on-cstorpools)

[Verifying Pool Status](#verifying-pool-status)

[Monitoring Pool](#monitoring-pool)

[Sparse Pool Deep Drive](#sparse-pool-deepdive)



*Note: This page describes how to create, use and maintain cStorPools. For details about Jiva pools, see [Jiva user guide](/docs/next/jivaguide.html)* 

<br>

<hr>

## Creating a new pool

The cStorStoragePool can be created by specifying the blockDeviceList. The following section will describe about the steps in detail. 

<h3><a class="anchor" aria-hidden="true" id="manual-mode"></a>Create a cStorPool by specifying diskList </h3>

<h4><a class="anchor" aria-hidden="true" id="overview-manual"></a>Overview </h4>

1. Get the details of blockdevices attached in the cluster.
2. Claim the required blockdevices for creating the cStorStoragePool.
3. Create a StoragePoolClaim configuration YAML and update the reqruied details.
4. Apply the StoragePoolClaim configuration YAML to create the cStorStoragePool.

**Step1:**

Get all the blockdevices attached in the cluster. The following command will get the list of blockdevices attached in the cluster. Modify the following command  with appropriate namespace where the openebs is installed. The default openebs namespace is `openebs`.

```
kubectl get blockdevice -n <openebs_namespace>
```

Example:

```
kubectl get blockdevice -n openebs
```

The output will be similar to the following.

<div class="co">NAME                                           SIZE          CLAIMSTATE   STATUS   AGE
blockdevice-1c10eb1bb14c94f02a00373f2fa09b93   42949672960   Unclaimed    Active   1m
blockdevice-77f834edba45b03318d9de5b79af0734   42949672960   Unclaimed    Active   1m
blockdevice-936911c5c9b0218ed59e64009cc83c8f   42949672960   Unclaimed    Active   1m</div>

The details of blockdevice can be get using the following command. 

```
 kubectl describe blockdevice <blockdevicename> -n <openebs_namespace>
```

Example:

```
kubectl describe blockdevice blockdevice-77f834edba45b03318d9de5b79af0734 -n openebs 
```

From the output, you will get the hostaname and other blockdevice details such as State,Path,Claim State,Capacity etc.

For doing Step2, get the hostname associated for each blockdevice.

**Step2:**

Create a BlockDeviceClaim configuration YAML and update the required the details.

* name
  * Name for the BlockDeviceClaim. For example, `test-blockdeviceclaim2`
* namespace
  * Namespace where the openebs is installed. For example, `openebs`
* driveType 
  * It should be HDD,SSD or sparse disks. For example, `HDD`
* blockDeviceName
  * The name of the Blockdevice . For example, `blockdevice-77f834edba45b03318d9de5b79af0734`
* hostName
  * The Hostname where the corresponding blockdevice is attached. For example,` gke-md-doc-default-pool-7e1d0504-bld4`
* capacity 
  * This is the requesting capacity for the blockdevice. It is recommended to put value less than or equal to size of block device. For example, `10Gi`.

The following is the sample BlockDeviceClaim configuration YAML. Create BlockDeviceClaim configuration YAML file using the following configuration and update the above mentioned fields.

```
apiVersion: openebs.io/v1alpha1
kind: BlockDeviceClaim
metadata:
  name: <blockdeviceclaim_name>
  namespace: <openebs_namespace>
spec:
  driveType: <BlockDevice_type>
  blockDeviceName: <BlockDevice_name>
  hostName: <node_name_where_blockedevice_is_attached>
  requirements:
    requests:
      capacity: <less than or equal to size of block device>
```

**Note:** For claiming sparse based blockdevice, create a BlockDeviceClaim configuration YAML which is given below and update the following required the details. 

- name
  - Name for the BlockDeviceClaim. For example, `test-blockdeviceclaim3`
- namespace
  - Namespace where the openebs is installed. For example, `openebs`
- blockDeviceName
  - Blockdevice name. For example, `sparse-6a88f56064960b4e9d80665963b4aa00`

The following is the sample BlockDeviceClaim configuration YAML. Create BlockDeviceClaim configuration YAML file using the following configuration and update the above mentioned fields.

```
apiVersion: openebs.io/v1alpha1
kind: BlockDeviceClaim
metadata:
  name: <blockdeviceclaim_name>
  namespace: <openebs_namespace>
spec:
  driveType: sparse
  blockDeviceName: <blockedevice_name_of_sparse_disk>	 
```

**Step3:** 

Apply the updated BlockDeviceClaim configuration YAML using the following command.

```
kubectl apply -f <BlockDeviceClaim_YAML>
```

Example:

```
kubectl apply -f bdc1.yaml
```

The output will be similar to the following.

<div class="co">blockdeviceclaim.openebs.io/test-blockdeviceclaim1 created</div>

Repeat the above procedure for each of the required BlockDevices which can be used for creating cStorStoragePool once the blockdevice is claimed. Only claimed blockdevice can be used for creating cStorStoragePool.

**Step4:**

Create a StoragePoolClaim configuration YAML file called `cstor-pool1-config.yaml` with the following content. In the following YAML, `PoolResourceRequests` value is set to `2Gi` and `PoolResourceLimits` value is set to `4Gi`. The resources will be shared for all the volume replicas that resides on the pool. The value of these resources can be 2Gi to 4Gi per pool on a given node for a better performance. These values can be changed as per the Node configuration for better performance. 

```
#Use the following YAMLs to create a cStor Storage Pool.
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk-pool
  annotations:
    cas.openebs.io/config: |
      - name: PoolResourceRequests
        value: |-
            memory: 2Gi
      - name: PoolResourceLimits
        value: |-
            memory: 4Gi
spec:
  name: cstor-disk-pool
  type: blockdevice
  maxPools: 3
  poolSpec:
    poolType: striped
  blockdevices:
    blockDeviceList:
    - blockdevice-936911c5c9b0218ed59e64009cc83c8f
    - blockdevice-77f834edba45b03318d9de5b79af0734
    - blockdevice-1c10eb1bb14c94f02a00373f2fa09b93
---
```

In the above file, change the following parameters as required.

- `poolType`

  This filed  represents how the data will be written to the disks on a given pool instance on a node. Supported values are `striped` or `mirrored`.

  Note: In OpenEBS, the pool instance do not extend beyond a node. The replication happens at volume level but not at pool level. See [volumes and pools relationship](/docs/next/cstor.html#relationship-between-cstor-volumes-and-cstor-pools) in cStor for a deeper understanding.

- `maxPools`

  This value represents the maximum number cStorPool instances to be created. In other words if `maxPools` is `3`,  then three nodes are randomly chosen based on the blockDevice name provided in `blockDeviceList` by OpenEBS and one cStorPool instance each will be created on them with provided blockDevice. If even number of blockDevices are available per Node and `poolType` as mirrored, then cStorPool instances will be created using mirrored manner. If many blockDevices are added on each of the Node and chosen `poolType` as `striped` , the cStorPool instance will created using the mentioned disks on each Node.

  This value should be less than or equal to the total number of Nodes in the cluster.

- `blockDeviceList`

  Select the list of claimed blockDevice CRs in each participating nodes and enter them under `blockDeviceList`. To get the list of blockDevice claimed CRs, use `kubectl get blockdeviceclaim -n openebs`. To know which node a given claimed blockDevice CR belongs, use `kubectl describe blockDevice <blockDevice-cr>`

  You must enter all the blockDevice CRs manually together from the selected nodes. 

  When the `poolType` = `mirrored` , ensure the blockDevice CRs selected from each node are in even number.  The data is striped across mirrors. For example, if 4x1TB blockDevice are selected on `node1`, the raw capacity of the pool instance of `cstor-disk-pool` on `node1` is 2TB. 

  When the `pooltype` = `striped` the number of blockDevice CRs from each node can be in any number, the data is striped across each blockDevice. For example, if 4x1TB blockDevices are selected on `node1`, the raw capacity of the pool instance of `cstor-disk-pool` on that `node1` is 4TB. 

  The number of selected blockDevice CRs across nodes need not be same. The claimed blockDevice CRs can be added to the pool spec dynamically as the used capacity gets filled up. 

  Note: Some of the pool expansion features of the cStorpools are under development. See [pool day2 operations](#day-2-operations-on-cstorpools)

- `type`

  This value can be either `sparse` or `blockdevice`.  If you are creating a sparse pool using the sparse disk based blockDevice which are created as part of applying openebs operator YAML, then while configuring the `StoragePoolClaim`, choose type as `sparse`. For other blockDevices, choose type as `blockdevice`.

**Step5:**

After the StoragePoolClaim configuration YAML spec is created, run the following command to create the pool instances on nodes.

```
kubectl apply -f cstor-pool1-config.yaml
```

If the pool creation is successful, you will see the example result as shown below.

<div class="co">storagepoolclaim.openebs.io "cstor-disk-pool" created</div>

**Note:** The cStor pool can be horizontally scale up on new OpenEBS Node by editing  the corresponding pool configuration YAML with the new disks name under `blockDeviceList` and update the `maxPools` count accordingly. More details can be found [here](/docs/next/operations.html#with-disklist). Some other pool expansion methods are listed [here](/docs/next/tasks.html) which is currently required manual intervention.

<br>

<hr>
<br>

## Pool Policies

This section captures the policies supported for cStorPools in `StoragePoolClaim` under `spec`  in the name and value pair format. 



<h3><a class="anchor" aria-hidden="true" id="PoolResourceLimits-Policy"></a>PoolResourceLimits Policy</h3>

This feature allow you to set the limits on memory and cpu for pool pods. The resource and limit value should be in the same format as expected by Kubernetes. The `name` of SPC can be changed if you need.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name: PoolResourceLimits
        value: |-
            memory: 4Gi
spec:
  name: cstor-disk
  type: disk
```





<h3><a class="anchor" aria-hidden="true" id="PoolResourceRequests-Policy"></a>PoolResourceRequests Policy</h3>

This feature allow you to specify resource requests that need to be available before scheduling the containers. If not specified, the default values are used. The `name` of SPC can be changed if you need.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name: PoolResourceRequests
        value: |-
            memory: 2Gi
spec:
  name: cstor-disk
  type: disk
```





<h3><a class="anchor" aria-hidden="true" id="Tolerations"></a>Tolerations</h3>

cStor pool pods can be ensure that pods are not scheduled onto inappropriate nodes. This can be acheived using taint and tolerations method. If Nodes are tainted to schedule the pods which are tolerating the taint, then cStor pool pods also can be scheduled using this method.  Tolerations are applied to cStor pool pods, and allow (but do not require) the pods to schedule onto nodes with matching taints.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name: Tolerations
        value: |-
          t1:
            effect: NoSchedule
            key: nodeA
            operator: Equal
          t2:
            effect: NoSchedule
            key: app
            operator: Equal
            value: storage
spec:
  name: cstor-disk
  type: disk
  maxPools: 3
  poolSpec:
    poolType: striped
```





<h3><a class="anchor" aria-hidden="true" id="AuxResourceLimits-Policy"></a>AuxResourceLimits Policy</h3>

You can specify the *AuxResourceLimits* which allow you to set limits on side cars. 

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name:  AuxResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 100m
    openebs.io/cas-type: cstor
```





<h3><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h3>

This feature is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars. Requests have to be specified in the format expected by Kubernetes

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceRequests
        value: |-
            memory: 0.5Gi
            cpu: 100m
    openebs.io/cas-type: cstor
```



<br>

<hr>

<br>

## Day 2 operations on cStorPools

With latest release,only some day2 operations are supported. Many of day2 operations are under active development. See [cStor roadmap](/docs/next/cstor.html#cstor-roadmap) for more details. 

**Note:** *All pools created using 0.8.1 will receive the pool expansion capabilities when those features are available in future releases.* 

<br>

<hr>

<br>

## Verifying pool status

<br>

Detailed metrics for cStorPool are under development. See [cStor Roadmap](/docs/next/cstor.html#cstor-roadmap) for more details. 

At the moment, status of cStor pools is obtained via the standard `kubectl get` and `kubectl describe` commands of pool  custom resources (spc, csp)

**StoragePoolClaim status**

```
 kubectl get spc
```

Following is an example output. 

<div class="co">NAME          AGE
cstor-pool2   1m
</div>


**cStorStoragePool status**

Once StoragePoolClaim is created, corresponding cStorStoragePool will be created. This can be check using the following command.

```
kubectl get csp
```

Following is an example output.

<div class="co">NAME               ALLOCATED   FREE      CAPACITY   STATUS    TYPE      AGE
cstor-pool2-ww4f   77K         39.7G     39.8G      Healthy   striped   53s
</div>


**cStorStoragePool pods status**

Once cStorStoragePool is created, corresponding pool pods will be created and running. This can be verified using the following command.

```
kubectl get pods -n openebs
```

Following is an example output. 

<div class="co">NAME                                          READY     STATUS    RESTARTS   AGE
cstor-pool2-ww4f-74bc496f67-82m6z             3/3       Running   0          1m
maya-apiserver-6d9858ffc9-x6rlp               1/1       Running   0          4h
openebs-admission-server-56665784df-xwt8h     1/1       Running   0          4h
openebs-localpv-provisioner-94f6477bb-fwmnm   1/1       Running   0          4h
openebs-ndm-crz9z                             1/1       Running   0          4h
openebs-ndm-l7mbd                             1/1       Running   1          4h
openebs-ndm-nvlrg                             1/1       Running   0          4h
openebs-provisioner-5dbd679f8c-pqphv          1/1       Running   0          4h
openebs-snapshot-operator-66d89b9bcf-6dkj7    2/2       Running   0          4h
</div>

In the above example output, name starts with `cstor-pool2-\*` are the cStorStoragePool pods. It must be in running state to provision cStor Volumes.

**Note:** By default, OpenEBS cStorStoragePool pods will be running in `openebs` namespace.



cStor provides storage scalability along with ease of deployment and usage. cStor can handle multiple disks with different size per Node and create different storage pools. You can use these storage pools to create cStor volumes which you can utilize to run your stateful applications.

<br>

<hr>
<br>

<h2><a class="anchor" aria-hidden="true" id="monitoring-pool"></a>Monitor Pools</h2>

A new sidecar will run once a cStor pool pod is created.This sidecar will collect the metrics of the corresponding cStorStoragePool. Following metrics are supported by cStor to export the cStorStoragePool usage statistics as Prometheus metrics.

```
openebs_volume_replica_available_size # Available size of volume replica on a pool
openebs_volume_replica_used_size # Used size of volume replica on a pool
openebs_dispatched_io_count # Dispatched IO's count
openebs_free_pool_capacity # Free capacity in pool
openebs_inflight_io_count # Inflight IO's count
openebs_maya_exporter_version # A metric with a constant '1' value labeled by commit and version from which maya-exporter was built.
openebs_pool_size # Size of pool
openebs_pool_status # Status of pool (0, 1, 2, 3, 4, 5, 6)= {"Offline", "Online", "Degraded", "Faulted", "Removed", "Unavail", "NoPoolsAvailable"}
openebs_read_latency # Read latency on replica
openebs_rebuild_bytes # Rebuild bytes
openebs_rebuild_count # Rebuild count
openebs_rebuild_status # Status of rebuild on replica (0, 1, 2, 3, 4, 5, 6)= {"INIT", "DONE", "SNAP REBUILD INPROGRESS", "ACTIVE DATASET REBUILD INPROGRESS", "ERRORED", "FAILED", "UNKNOWN"}
openebs_replica_status # Status of replica (0, 1, 2, 3) = {"Offline", "Healthy", "Degraded", "Rebuilding"}
openebs_total_rebuild_done # Total number of rebuild done on replica
openebs_sync_count # Total number of sync on replica
openebs_sync_latency # Sync latency on replica
openebs_total_failed_rebuild # Total number of failed rebuilds on replica
openebs_total_read_bytes # Total read in bytes
openebs_total_read_count # Total read io count
openebs_total_rebuild_done # Total number of rebuild done on replica
openebs_total_write_bytes # Total write in bytes
openebs_total_write_count # Total write io count
openebs_used_pool_capacity # Capacity used by pool
openebs_used_pool_capacity_percent # Capacity used by pool in percent
openebs_used_size Used # size of pool and volume
openebs_volume_status # Status of volume (0, 1, 2, 3) = {"Offline", "Healthy", "Degraded", "Rebuilding"}
openebs_write_latency # Write latency on replica
openebs_zfs_command_error # zfs command error counter
openebs_zfs_list_command_error # zfs list command error counter
openebs_zfs_parse_error # zfs parse error counter
openebs_zfs_list_failed_to_initialize_libuzfs_client_error_counter # Total no of failed to initialize libuzfs client error in zfs list command
openebs_zfs_list_no_dataset_available_error_counter #  Total number of no datasets error in zfs list command
openebs_zfs_list_parse_error # Total number of zfs list parse errors 
openebs_zfs_list_request_reject_count # Total number of rejected requests of zfs list
openebs_zfs_stats_command_error # Total number of zfs command errors
openebs_zfs_stats_parse_error_counter # Total number of zfs stats parse errors
openebs_zfs_stats_reject_request_count # Total number of rejected requests of zfs stats
openebs_zpool_list_command_error # Total number of zpool command error counter
openebs_zpool_list_failed_to_initialize_libuzfs_client_error_counter # Total number of initialize libuzfs client error
openebs_zpool_list_incomplete_stdout_error # Total number of incomplete stdout errors
openebs_zpool_list_no_pool_available_error  # Total number of no pool available errors
openebs_zpool_list_parse_error_count # Total number of parsing errors
openebs_zpool_list_reject_request_count # Total number of rejected requests of zpool command
```

</br>

<hr>

<h2><a class="anchor" aria-hidden="true" id="sparse-pool-deepdive"></a>Sparse Pool Deep Dive</h2>

OpenEBS installation process creates the following defaults : 

- One sparse disk is created on each node in the cluster  once you enable the  `OPENEBS_IO_INSTALL_DEFAULT_CSTOR_SPARSE_POOL` ENV in the openebs operator YAML file before it is getting applied.
- After the previous step, a ready to use cStorPool config called `cstor-sparse-pool` will be created .  This `cstor-sparse-pool` config has a `cStorStoragePool` instance on every node of the cluster. 
- One StorageClass called `openebs-cstor-sparse` that points to `cstor-sparse-pool` will be created.
- This default StorageClass can be used for running application on cStorSparsePool.

<img src="/docs/assets/svg/sparsepool.svg" alt="OpenEBS configuration flow" style="width:100%">

`kubectl describe StorageClass openebs-cstor-sparse` provides the relationship  details

<div class="co">
Name:            openebs-cstor-sparse
IsDefaultClass:  No
Annotations:     cas.openebs.io/config=- name: StoragePoolClaim
  value: "cstor-sparse-pool"
  -name: ReplicaCount
  value: "3"
,openebs.io/cas-type=cstor
Provisioner:           openebs.io/provisioner-iscsi
Parameters:            <none>
AllowVolumeExpansion:  <unset>
MountOptions:          <none>
ReclaimPolicy:         Delete
VolumeBindingMode:     Immediate
Events:                <none>
</div>

<br>

<hr>

<br>

## See Also:



### [Understand cStorPools ](/docs/next/cstor.html#cstor-pools)

### [cStorPool use case for Prometheus](/docs/next/prometheus.html)

### [cStor roadmap](/docs/next/cstor.html#cstor-roadmap)



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