---
id: ugcstor
title: cStor User Guide
sidebar_label: cStor
---
------



<font size="5">User operations</font>

[Provisioning a cStor volume](#provisioning-a-cStor-volume)

[Monitoring a cStor Volume](#monitoring-a-cStor-Volume)

[Expanding a cStor Volume](#expanding-a-cStor-volume)

[Backup and Restore](#backup-and-restore)

[Snapshot and Clone of a cStor Volume](#snapshot-and-clone-of-a-cStor-volume)

[Upgrading the software version of a cStor volume](#Upgrading-the-software-version-of-a-cStor-volume)

[Deleting a cStor Volume](#deleting-a-cStor-volume)



<font size="5">Admin operations</font>

[Creating cStor storage pools](#creating-cStor-storage-pools)

[Setting Pool Policies](#setting-pool-policies)

[Creating cStor storage classes](#creating-cStor-storage-class)

[Setting Storage Polices](#cstor-storage-policies)

[Setting Performance Tunings](#setting-performance-tunings)

[Upgrade the software version of a cStor pool](#Upgrade-the-software-version-of-a-cStor-pool)

[Expanding cStor pool to a new node](#expanding-cStor-pool-to-a-new-node)

[Expanding size of a cStor pool instance on a node by expanding the size of cloud disks](#expanding-size-of-a-cStor-pool-instance-on-a-node-add)

[Expanding size of a cStor pool instance on a node by add physical or virtual disks to a pool instance](#expanding-size-of-a-cStor-pool-instance-on-a-node-add-disk)

[Moving a Disk to a New Node](#Moving-a-disk-to-New-Node)





<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations</h2>

<br>

<h3><a class="anchor" aria-hidden="true" id="provisioning-a-cStor-volume"></a>Provisioning a cStor volume</h3>

For provisioning a cStor Volume, it requires a cStor Storage Pool and a StorageClass. The configuration and verification of a cStor Storage pool can be checked from [here](#creating-cStor-storage-pools). The configuration and verification of a StorageClass can be checked from [here](#creating-cStor-storage-class).

Use a similar PVC spec or volumeClaimTemplate to use a StorageClass that is pointing to a pool with real disks. Consider the following parameters while provisioning OpenEBS volumes on real disks.

**AccessModes:** cStor provides iSCSI targets, which are appropriate for RWO (ReadWriteOnce) access mode and is suitable for all types of databases. For webscale applications like WordPress or any for any other NFS needs, you need RWM (ReadWriteMany) access mode. For RWM, you need NFS provisioner to be deployed along with cStor. See <a href="/docs/next/rwm.html" target="_blank">how to provision RWM PVC with OpenEBS </a>.

**Size:** cStor supports thin provisioning by default, which means you can request any size of the volume through the PVC and get it provisioned. Resize of the volume is not fully supported through the OpenEBS control plane in the current release (OpenEBS 0.9.0) and is active development, see [roadmap](/docs/next/cstor.html#cstor-roadmap) for more details. Hence it is recommended to give good amount of buffer to the required size of the volume so that you don't need to resize immediately or in the very short time period. 

The following shows the example PVC configuration for a Deployment and a StatefulSet application which uses a configured StorageClass to provision a cStor Volume. The provided StorageClass name will contain the StoragePoolClaim name and the cStor Volume will provisioned on a StoragePool associated to the StroagePoolClaim.

<font size="4">**Example configuration for requesting OpenEBS volume for a Deployment**</font>

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: cstor-pvc-mysql-large
spec:
  storageClassName: openebs-cstor-pool1-3-replicas
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Gi
```

<font size="4">**Example configuration for requesting OpenEBS volume for a StatefulSet**</font>

```
spec:
  volumeClaimTemplates:
  - metadata:
      name: elasticdb-vol-openebs
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 500Gi
      storageClassName: openebs-cstor-pool1-1-replica
```



<h3><a class="anchor" aria-hidden="true" id="monitoring-a-cStor-Volume"></a>Monitoring a cStor Volume</h3>

By default the `VolumeMonitor` is set to ON in the cStor StorageClass. Volume metrics are exported when this parameter is set to ON. Following metrics are supported by cStor as of the current release.

```
openebs_actual_used # Actual volume size used
openebs_connection_error_total # Total no of connection errors
openebs_connection_retry_total # Total no of connection retry requests
openebs_degraded_replica_count # Total no of degraded/ro replicas
openebs_healthy_replica_count # Total no of healthy replicas
openebs_logical_size # Logical size of volume
openebs_parse_error_total # Total no of parsing errors
openebs_read_block_count # Read Block count of volume
openebs_read_time # Read time on volume
openebs_reads # Read Input/Outputs on Volume
openebs_sector_size # sector size of volume
openebs_size_of_volume # Size of the volume requested
openebs_total_read_bytes # Total read bytes
openebs_total_replica_count # Total no of replicas connected to cas
openebs_total_write_bytes # Total write bytes
openebs_volume_status # Status of volume: (1, 2, 3, 4) = {Offline, Degraded, Healthy, Unknown}
openebs_volume_uptime # Time since volume has registered
openebs_write_block_count # Write Block count of volume
openebs_write_time # Write time on volume
openebs_writes # Write Input/Outputs on Volume
```

Grafana charts can be built for the above Prometheus metrics. Some metrics OpenEBS volumes are available automatically at MayaOnline when you connect the Kubernetes cluster to it. See an example screenshot below.



<img src="/docs/assets/svg/volume-monitor.svg" alt="OpenEBS configuration flow" style="width:100%">



<h3><a class="anchor" aria-hidden="true" id="snapshot-and-clone-of-a-cStor-volume"></a>Snapshot and Clone of a cStor Volume</h3>

An OpenEBS snapshot is a set of reference markers for data at a particular point in time. A snapshot act as a detailed table of contents, with accessible copies of data that user can roll back to the required point of instance. Snapshots in OpenEBS are instantaneous and are managed through `kubectl`.

During the installation of OpenEBS, a snapshot-controller and a snapshot-provisioner are setup which assist in taking the snapshots. During the snapshot creation, snapshot-controller creates `VolumeSnapshot` and `VolumeSnapshotData` custom resources. A snapshot-provisioner is used to restore a snapshot as a new Persistent Volume(PV) via dynamic provisioning.

in this section the steps for the creation, clone and deletion a snapshot is provided.

<h4><a class="anchor" aria-hidden="true" id="creating-a-cStor-snapshot"></a>Creating a cStor Snapshot</h4>

The following steps will help you to create a snapshot of a cStor volume. For creating the snapshot, you need to create a YAML specification and provide the required PVC name into it. The only prerequisite check is  to be performed is to ensure that there is no stale entries of snapshot and snapshot data before creating a new snapshot.

- Copy the following YAML specification into a file called *snapshot.yaml*.

  ```
  apiVersion: volumesnapshot.external-storage.k8s.io/v1
  kind: VolumeSnapshot
  metadata:
    name: snapshot-cstor-volume
    namespace: <Source_PVC_namespace>
  spec:
    persistentVolumeClaimName: cstor-vol1-claim
  ```

- Edit the *snapshot.yaml* which is created in previous step to update 

  - `name` :-  Name of snapshot which is going to create
  - `namespace`  :- Namespace of source PVC 
  - `persistentVolumeClaimName` :-  Source PVC  which you are going to take the snapshot. 

- Run the following command to create the snapshot of the provided PVC.

  ```
  kubectl apply -f snapshot.yaml -n <namespace>
  ```

  The above command creates a snapshot of the cStor volume and two new CRDs. To list the snapshots, use the following command

  ```
  kubectl get volumesnapshot
  kubectl get volumesnapshotdata
  ```

  **Note**: All cStor snapshots should be created in the same namespace of source PVC. 

<h4><a class="anchor" aria-hidden="true" id="Cloning-a-cStor-snapshot"></a>Cloning a cStor Snapshot</h4>

Once the snapshot is created, restoration from a snapshot or cloning the snapshot is done through a two step process. First create a PVC that refers to the snapshot and then use the PVC to create a new PV. This PVC must refer to a storage class called `openebs-snapshot-promoter`. 

- Copy the following YAML specification into a file called *snapshot_claim.yaml*.

  ```
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: vol-claim-cstor-snapshot
    namespace: <Source_PVC_namespace>
    annotations:
      snapshot.alpha.kubernetes.io/snapshot: snapshot-cstor-volume
  spec:
    storageClassName: openebs-snapshot-promoter
    accessModes: [ "ReadWriteOnce" ]
    resources:
      requests:
        storage: 4G
  ```

- Edit the YAML file to update 

  - `name` :- Name of the clone PVC
  - `namespace` :- Same namespace of source PVC 
  - The annotation `snapshot.alpha.kubernetes.io/snapshot` :- Name of the snapshot
  - `storage` :- The size of the volume being cloned or restored. This should be same as source PVC.

  **Note**: Size and namespace should be same as the original PVC from which the snapshot was created.

- Run the following command to create a cloned PVC. 

  ```
  kubectl apply -f snapshot_claim.yaml -n <namespace>
  ```

- Get the details of newly created PVC for the snapshot.

  ```
  kubectl get pvc -n <namespace>
  ```

- Mount the above PVC in an application YAML to browse the data from the clone.

**Note:** For deleting the corresponding source volume, it is mandatory to delete the associated clone volumes of this source volume. The source volume deletion will fail if any associated clone volume is present on the cluster.

<h4><a class="anchor" aria-hidden="true" id="deleting-a-cStor-Snapshot"></a>Deleting a cStor Snapshot</h4>

Delete the snapshot using the kubectl command  by providing the the same YAML specification that was used to create the snapshot.

```
kubectl delete -f snapshot.yaml -n <namespace>
```

This will not affect any `PersistentVolumeClaims` or `PersistentVolumes` that were already provisioned using the snapshot. On the other hand, deleting any `PersistentVolumeClaims` or `PersistentVolumes` that were provisioned using the snapshot will not delete the snapshot from the OpenEBS backend.



<h3><a class="anchor" aria-hidden="true" id="expanding-a-cStor-volume"></a>Exapnding a cStor Volume</h3>

OpenEBS control plane does not support increasing the size of volume seamlessly. Increasing the size of a provisioned volume requires support from Kubernetes kubelet as the existing connection has to be remounted to reflect the new volume size. This can also be tackled with the new CSI plugin where the responsibility of the mount, unmount and remount actions will be held with the vendor CSI plugin rather than the kubelet itself.

OpenEBS team is working on both the CSI plugin as well as the feature to resize the provisioned volume when the PVC is patched for new volume size. See [Roadmap](/docs/next/cstor.html#cstor-roadmap) for more details.



<h3><a class="anchor" aria-hidden="true" id="backup-and-restore"></a>Backup and Restore</h3>

OpenEBS volume can be backed up and restore along with application using OpenEBS velero plugin. It helps for taking backup of OpenEBS volumes and then restoration of the data whenever it needed. The steps for taking backup and restore is given [here](/docs/next/backup.html).



<h3><a class="anchor" aria-hidden="true" id="Upgrading-the-software-version-of-a-cStor-volume"></a>Upgrading the software version of a cStor volume</h3>

The steps are mentioned in Upgrade section. For upgrade cStorVolume, ensure that cStor Pool image is support this cStor volume image.  The steps for upgrading the cStor volume can be find from [here](docs/next/upgrade.html).



<h3><a class="anchor" aria-hidden="true" id="deleting-a-cStor-volume"></a>Deleting a cStor Volume</h3>

The cStor volume can be deleted by deleting the corresponding PVC. This can be done by using the following command.

```
kubectl delete pvc <PVC_name> -n <PVC_namespace>
```

The successful deletion of a cStor volume can be verified by running the following commands and ensure there is no entries of particular volume exists as part of the output.

Verify the PVC is deleted successfully using the following command.

```
kubectl get pvc -n <namespace>
```

Verify the PV is deleted successfully using the following command.

```
kubectl get pv
```

Verify the cStorVolumeReplica(CVR) is deleted successfully using the following command.

```
kubectl get cvr -n <openebs_installed_namespace>
```

Verify corresponding cStor Volume target also deleted successfully using the following command.

```
kubectl get pod -n <openebs_installed_namespace> | grep <pvc_name>
```



<br>

<hr>
<br>

<h2><a class="anchor" aria-hidden="true" id="admin-operations"></a>Admin Operations</h2>

<br>

<h3><a class="anchor" aria-hidden="true" id="creating-cStor-storage-pools"></a>Creating cStor Storage Pools</h3>

The cStorStoragePool can be created by specifying the blockDeviceList. The following section will describe about the steps in detail. 

<h4><a class="anchor" aria-hidden="true" id="manual-mode"></a>Create a cStorPool by specifying blockDeviceList </h4>

**Overview**

1. Get the details of blockdevices attached in the cluster.
2. Create a StoragePoolClaim configuration YAML and update the required details.
3. Apply the StoragePoolClaim configuration YAML to create the cStorStoragePool.

**Step1:**

Get all the blockdevices attached in the cluster. The following command will get the list of blockdevices attached in the cluster. Modify the following command  with appropriate namespace where the openebs is installed. The default namespace where openebs is getting installed is `openebs`.

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

From the output, you will get the hostname and other blockdevice details such as State,Path,Claim State,Capacity etc.

**Step2:** 

Create a StoragePoolClaim configuration YAML file called `cstor-pool1-config.yaml` with the following content. In the following YAML, `PoolResourceRequests` value is set to `2Gi` and `PoolResourceLimits` value is set to `4Gi`. The resources will be shared for all the volume replicas that resides on the pool. The value of these resources can be 2Gi to 4Gi per pool on a given node for a better performance. These values can be changed as per the Node configuration for better performance. Refer [setting pool policies](#setting-pool-policies) for more details on the pool policies applicable for cStor.

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

  Select the list of unclaimed blockDevice CRs in each participating nodes and enter them under `blockDeviceList`. 

  To get the list of blockDevice CRs, use `kubectl get blockdevice -n openebs`. 

  To know the details of the blockdevice such as hostname wher this disk is attached, claim status,  a given blockDevice is attached , use `kubectl describe blockdevice <blockDevice-cr>`.

  You must enter all the blockDevice CRs manually together from the selected nodes. 

  When the `poolType` = `mirrored` , ensure the blockDevice CRs selected from each node are in even number.  The data is striped across mirrors. For example, if 4x1TB blockDevice are selected on `node1`, the raw capacity of the pool instance of `cstor-disk-pool` on `node1` is 2TB. 

  When the `pooltype` = `striped` the number of blockDevice CRs from each node can be in any number, the data is striped across each blockDevice. For example, if 4x1TB blockDevices are selected on `node1`, the raw capacity of the pool instance of `cstor-disk-pool` on that `node1` is 4TB. 

  The number of selected blockDevice CRs across nodes need not be same. The claimed blockDevice CRs can be added to the pool spec dynamically as the used capacity gets filled up. 

  Note: Some of the pool expansion features of the cStorpools are under development. See [pool day2 operations](#day-2-operations-on-cstorpools)

- `type`

  This value can be either `sparse` or `blockdevice`.  If you are creating a sparse pool using the sparse disk based blockDevice which are created as part of applying openebs operator YAML, then choose type as `sparse`. For other blockDevices, choose type as `blockdevice`.

**Step3:**

After the StoragePoolClaim configuration YAML spec is created, run the following command to create the pool instances on nodes.

```
kubectl apply -f cstor-pool1-config.yaml
```

If the pool creation is successful, you will see the example result as shown below.

<div class="co">storagepoolclaim.openebs.io "cstor-disk-pool" created</div>

**Note:** The cStor pool can be horizontally scale up on new OpenEBS Node by editing  the corresponding pool configuration YAML with the new disks name under `blockDeviceList` and update the `maxPools` count accordingly. More details can be found [here](/docs/next/operations.html#with-disklist). Some other pool expansion methods are listed [here](/docs/next/tasks.html) which is currently required manual intervention.

<br>

<h3><a class="anchor" aria-hidden="true" id="setting-pool-policies"></a>Setting Pool Policies</h3>

This section captures the policies supported for cStorPools in `StoragePoolClaim` under `cas.openebs.io/config` in the name and value pair format. 


<h4><a class="anchor" aria-hidden="true" id="PoolResourceLimits-Policy"></a>PoolResourceLimits Policy</h4>

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

<h4><a class="anchor" aria-hidden="true" id="PoolResourceRequests-Policy"></a>PoolResourceRequests Policy</h4>

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

<h4><a class="anchor" aria-hidden="true" id="Tolerations"></a>Tolerations</h4>

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

<h4><a class="anchor" aria-hidden="true" id="AuxResourceLimits-Policy"></a>AuxResourceLimits Policy</h4>

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

<h4><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h4>

This feature is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars. Requests have to be specified in the format expected by Kubernetes.

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



<h3><a class="anchor" aria-hidden="true" id="creating-cStor-storage-class"></a>Creating cStor Storage Class</h3>

StorageClass definition is an important task in the planning and execution of OpenEBS storage. As detailed in the CAS page, the real power of CAS architecture is to give an independent or a dedicated storage engine like cStor for each workload, so that granular policies can be applied to that storage engine to tune the behaviour or performance as per the workload's need. In OpenEBS policies to the storage engine (in this case it is cStor) through the `annotations` specified in the `StorageClass` interface. 

<h4><a class="anchor" aria-hidden="true" id="steps-to-create-a-cStor-storageclass"></a>Steps to Create a cStor StorageClass</h4>

**Step1:** Decide the cStorPool and get the StoragePoolClaim name associated to it.

**Step2:** Which application uses it? Decide the replicaCount based on it.

**Step3:** Are there any other storage policies to be applied to the StorageClass? Refer to the [storage policies section](#cstor-storage-policies) for more details on the storage policies applicable for cStor.

**Step4:** Create a YAML spec file <storage-class-name.yaml> from the master template below, update the pool, replica count and other policies and create the class using `kubectl apply -f <storage-class-name.yaml>` command.

**Step5:** Verify the newly created StorageClass using `kubectl describe sc <storage-class-name>`

<h4><a class="anchor" aria-hidden="true" id="example-configuration-of-openEBS-storageClass"></a>Example Configuration of OpenEBS StorageClass</h4>

You can create a new StorageClass YAML called **openebs-sc-rep1.yaml** and add content to it from below. The following will create a StorageClass of OpenEBS volume replica of `1`, Storage Pool as `cstor-pool2` and CAS type as `cstor`.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sparse-sc-statefulset
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-pool2"
      - name: ReplicaCount
        value: "1"
provisioner: openebs.io/provisioner-iscsi
```



<h3><a class="anchor" aria-hidden="true" id="cstor-storage-policies"></a>Setting Storage Policies</h3>

Below table lists the storage policies supported by cStor. These policies should be built into StorageClass and apply them through PersistentVolumeClaim or VolumeClaimTemplates interface.

| cStor Storage Policy                                         | Mandatory | Default                                     | Purpose                                                      |
| ------------------------------------------------------------ | --------- | ------------------------------------------- | ------------------------------------------------------------ |
| [ReplicaCount](#Replica-Count-Policy)                        | No        | 3                                           | Defines the number of cStor volume replicas                  |
| [VolumeControllerImage](#Volume-Controller-Image-Policy)     |           | quay.io/openebs/cstor-volume-mgmt:1.0.0-RC1 | Dedicated side car for command management like taking snapshots etc. Can be used to apply a specific issue or feature for the workload |
| [VolumeTargetImage](#Volume-Target-Image-Policy)             |           | value:quay.io/openebs/cstor-istgt:1.0.0-RC1 | iSCSI protocol stack dedicated to the workload. Can be used to apply a specific issue or feature for the workload |
| [StoragePoolClaim](#Storage-Pool-Claim-Policy)               | Yes       | N/A (a valid pool must be provided)         | The cStorPool on which the volume replicas should be provisioned |
| [VolumeMonitor](#Volume-Monitor-Policy)                      |           | ON                                          | When ON, a volume exporter sidecar is launched to export Prometheus metrics. |
| [VolumeMonitorImage](#Volume-Monitoring-Image-Policy)        |           | quay.io/openebs/m-exporter:1.0.0-RC1        | Used when VolumeMonitor is ON. A dedicated metrics exporter to the workload. Can be used to apply a specific issue or feature for the workload |
| [FSType](#Volume-File-System-Type-Policy)                    |           | ext4                                        | Specifies the filesystem that the volume should be formatted with. Other values are `xfs` |
| [TargetNodeSelector](#Target-NodeSelector-Policy)            |           | Decided by Kubernetes scheduler             | Specify the label in `key: value` format to notify Kubernetes scheduler to schedule cStor target pod on the nodes that match label |
| [TargetResourceLimits](#Target-ResourceLimits-Policy)        |           | Decided by Kubernetes scheduler             | CPU and Memory limits to cStor target pod                    |
| [TargetResourceRequests](#TargetResourceRequests)            |           | Decided by Kubernetes scheduler             | Configuring resource requests that need to be available before scheduling the containers. |
| [TargetTolerations](#TargetTolerations)                      |           | Decided by Kubernetes scheduler             | Configuring the tolerations for target.                      |
| [AuxResourceLimits](#AuxResourceLimits-Policy)               |           | Decided by Kubernetes scheduler             | Configuring resource limits on the volume pod side-cars.     |
| [AuxResourceRequests](#AuxResourceRequests-Policy)           |           | Decided by Kubernetes scheduler             | Configure minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. |
| [Target Affinity](#Target-Affinity-Policy)                   |           | Decided by Kubernetes scheduler             | The policy specifies the label KV pair to be used both on the cStor target and on the application being used so that application pod and cStor target pod are scheduled on the same node. |
| [Target Namespace](#Target-Namespace)                        |           | openebs                                     | When service account name is specified, the cStor target pod is scheduled in the application's namespace. |
| [cStorStoragePool Replica Anti-Affinity](#cStorStoragePool-Anti-Affinity) |           | Decided by Kubernetes scheduler             | For StatefulSet applications, to distribute single replica volume on  separate nodes . |

<br>

<h4><a class="anchor" aria-hidden="true" id="Replica-Count-Policy"></a>Replica Count Policy</h4>

You can specify the cStor volume replica count using the *ReplicaCount* property. In the following example, the ReplicaCount is specified as 3. Hence, three cStor volume replicas will be created.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaCount
        value: "3"
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Controller-Image-Policy"></a>Volume Controller Image Policy</h4>

You can specify the cStor Volume Controller Image using the *value* for *VolumeControllerImage* property. This will help you choose the volume management image.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: VolumeControllerImage
        value: quay.io/openebs/cstor-volume-mgmt:1.0.0-RC1
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Target-Image-Policy"></a>Volume Target Image Policy</h4>

You can specify the cStor Target Image using the *value* for *VolumeTargetImage* property. This will help you choose the cStor istgt target image.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: VolumeTargetImage
        value:quay.io/openebs/cstor-istgt:1.0.0-RC1
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="Storage-Pool-Claim-Policy"></a>Storage Pool Claim Policy</h4>

You can specify the cStor Pool Claim name using the *value* for *StoragePoolClaim* property. This will help you choose cStor storage pool where OpenEBS volume will be created. Following is the default StorageClass template where cStor volume will be created on default cStor Sparse Pool.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Monitor-Policy"></a>Volume Monitor Policy</h4>

You can specify the cStor volume monitor feature which can be set using *value* for the *VolumeMonitor* property.  By default, volume monitor is enabled.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - enabled: "true"
        name: VolumeMonitor
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Monitoring-Image-Policy"></a>Volume Monitoring Image Policy</h4>

You can specify the monitoring image policy for a particular volume using *value* for *VolumeMonitorImage* property. The following sample storage class uses the Volume Monitor Image policy.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: VolumeMonitorImage
        value: quay.io/openebs/m-exporter:1.0.0-RC1
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="Volume-File-System-Type-Policy"></a>Volume File System Type Policy</h4>

You can specify the file system type for the cStor volume where application will consume the storage using *value* for *FSType*. The following is the sample storage class. Currently OpenEBS support ext4 as the default file system and it also supports XFS.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: FSType
        value: ext4
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="Target-NodeSelector-Policy"></a>Target NodeSelector Policy</h4>

You can specify the *TargetNodeSelector* where Target pod has to be scheduled using the *value* for *TargetNodeSelector*. In following example, `node: apnode ` is the node label.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetNodeSelector
        value: |-
            node: appnode
    openebs.io/cas-type: cstor

```

<h4><a class="anchor" aria-hidden="true" id="Target-ResourceLimits-Policy"></a>Target ResourceLimits Policy</h4>

You can specify the *TargetResourceLimits* to restrict the memory and cpu usage of target pod within the given limit  using the *value* for *TargetResourceLimits* .

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceLimits
        value: |-
            memory: 1Gi
            cpu: 100m
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="TargetResourceRequests"></a>TargetResourceRequests Policy </h4>

You can specify the *TargetResourceRequests* to specify resource requests that need to be available before scheduling the containers. 

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceRequests
        value: "none"
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="TargetTolerations"></a>TargetTolerations Policy </h4>

You can specify the *TargetTolerations* to specify the tolerations for target. 

```
- name: TargetTolerations
  value: |-
     t1:
       key: "key1"
       operator: "Equal"
       value: "value1"
       effect: "NoSchedule"
     t2:
       key: "key1"
       operator: "Equal"
       value: "value1"
       effect: "NoExecute"
```

<h4><a class="anchor" aria-hidden="true" id="AuxResourceLimits-Policy"></a>AuxResourceLimits Policy</h4>

You can specify the *AuxResourceLimits* which allow you to set limits on side cars. 

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name:  AuxResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 100m
    openebs.io/cas-type: cstor
```

<h4><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h4>

This feature is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars. Requests have to be specified in the format expected by Kubernetes

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceRequests
        value: |-
            memory: 0.5Gi
            cpu: 100m
    openebs.io/cas-type: cstor

```

<h4><a class="anchor" aria-hidden="true" id="Target-Affinity-Policy"></a>Target Affinity Policy</h4>

The StatefulSet workloads access the OpenEBS storage volume  by connecting to the Volume Target Pod. This policy can be used to co-locate volume target pod on the same node as workload.

The configuration for implementing this policy is different for deployment and StatefulSet applications.

<h5><a class="anchor" aria-hidden="true" id="for-statefulset-applications"></a>For StatefulSet Applications</h5>

In the case of provisioning StatfulSet applications with replication factor of  greater than "1" and volume replication factor of euqal to "1", for a given OpenEBS volume, target and replica related to that volume should be scheduled on the same node where the application resides. This feature can be achieved by using either of the following approaches.

**Approach 1:**

In this approach, modification is required on StatefulSet spec and corresponding StorageClass being referred in the StatefulSet spec. Add [openebs.io/sts-target-affinity](http://openebs.io/sts-target-affinity): <[metadata.name](http://metadata.name/) of STS> label in StatefulSet spec to the following fields.

- spec.selector.matchLabels  
- spec.template.labels

**Example snippet:**

```
apiVersion: apps/v1
kind: StatefulSet
metadata:
name: test-application
labels:
  app: test-application
spec:
serviceName: test-application
replicas: 1
selector:
  matchLabels:
    app: test-application
    openebs.io/sts-target-affinity: test-application
template:
  metadata:
    labels:
      app: test-application
      openebs.io/sts-target-affinity: test-application
```

Do the following changes in the StorageClass that is referred by the claimTemplates of this StatefulSet.

- Set volumeBindingMode to WaitForFirstConsumer

**Example snippet:**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
name: cstor-sts
annotations:
  openebs.io/cas-type: cstor
  cas.openebs.io/config: |
    - name: ReplicaCount
      value: "1"
    - name: StoragePoolClaim
      value: "cstor-sparse-pool" 
provisioner: openebs.io/provisioner-iscsi
volumeBindingMode: WaitForFirstConsumer
```

**Approach 2:**

This approach is useful when user/tool does not have control over the StatefulSet spec. in this case, it requires a new StorageClass per StatefulSet application.

Add following changes in the StorageClass that is referred to by the claimTemplates of this StatefulSet.

- Add [openebs.io/sts-target-affinity](http://openebs.io/sts-target-affinity): <[metadata.name](http://metadata.name/) of STS> label to the following fields.
  - metadata.labels
- Set volumeBindingMode to WaitForFirstConsumer

**Example snippet:**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
name: cstor-sts
labels:
  openebs.io/sts-target-affinity: test-application # name of StatefulSet application
annotations:
  openebs.io/cas-type: cstor
  cas.openebs.io/config: |
    - name: ReplicaCount
      value: "1"
    - name: StoragePoolClaim
      value: "cstor-sparse-pool" 
provisioner: openebs.io/provisioner-iscsi
volumeBindingMode: WaitForFirstConsumer
```

**Note:** It is recommended to do application pod stickiness for seamless working of the above approaches. Example YAML spec for STS can be get from [here](https://raw.githubusercontent.com/openebs/openebs/12be2bbdb244d50c8c0fd48b59d520f86aa3a4a6/k8s/demo/mongodb/demo-mongo-cstor-taa.yaml).

<h5><a class="anchor" aria-hidden="true" id="for-deployment-applications"></a>For Deployment Applications</h5>

This feature makes use of the Kubernetes Pod Affinity feature that is dependent on the Pod labels. User will need to add the following label to both Application and PVC.

```
labels:
  openebs.io/target-affinity: <application-unique-label>
```

You can specify the Target Affinity in both application and OpenEBS PVC using the following way For Application Pod, it will be similar to the following.

```
apiVersion: v1
kind: Pod
metadata:
  name: fio-cstor
  labels:
    name: fio-cstor
    openebs.io/target-affinity: fio-cstor
```

The following is the sample snippet of the PVC to use Target affinity.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: fio-cstor-claim
  labels:
    openebs.io/target-affinity: fio-cstor
```

**Note**: This feature works only for cases where there is a 1-1 mapping between a application and PVC. 

<h4><a class="anchor" aria-hidden="true" id="Target-Namespace"></a>Target Namespace</h4>

By default, the cStor target pods are scheduled in a dedicated *openebs* namespace. The target pod also is provided with OpenEBS service account so that it can access the Kubernetes Custom Resource called `CStorVolume` and `Events`.
This policy, allows the Cluster administrator to specify if the Volume Target pods should be deployed in the namespace of the workloads itself. This can help with setting the limits on the resources on the target pods, based on the namespace in which they are deployed.
To use this policy, the Cluster administrator could either use the existing OpenEBS service account or create a new service account with limited access and provide it in the StorageClass as follows:

```
annotations:
    cas.openebs.io/config: |
      - name: PVCServiceAccountName
        value: "user-service-account"  
```

The sample service account can be found [here](https://github.com/openebs/openebs/blob/master/k8s/ci/maya/volume/cstor/service-account.yaml).

<h4><a class="anchor" aria-hidden="true" id="cStorStoragePool-Anti-Affinity"></a>cStorStoragePool Replica Anti-Affinity</h4>

This policy will adds the ability in cStor to correlate and hence distribute single replica volumes across pools which are in turn deployed in separate nodes when application consuming all these volumes is deployed as a StatefulSet.  

Below are supported anti-affinity features:

- `openebs.io/replica-anti-affinity: <unique_identification_of_app_in_cluster>`
- `openebs.io/preferred-replica-anti-affinity: <unique_identification_of_app_in_cluster>`

Below is an example of a statefulset YAML spec that makes use of `openebs.io/replica-anti-affinity`:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
      - name: ReplicaCount
        value: "1"
    openebs.io/cas-type: cstor
  name: openebs-cstor-pool-sts
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
volumeBindingMode: Immediate
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: busybox1
  name: busybox1
spec:
  clusterIP: None
  selector:
    app: busybox1
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: busybox1
  labels:
    app: busybox1
spec:
  serviceName: busybox1
  replicas: 1
  selector:
    matchLabels:
      app: busybox1
      openebs.io/replica-anti-affinity: busybox1
  template:
    metadata:
      labels:
        app: busybox1
        openebs.io/replica-anti-affinity: busybox1
    spec:
      terminationGracePeriodSeconds: 1800
      containers:
      - name: busybox1
        image: ubuntu
        imagePullPolicy: IfNotPresent
        command:
          - sleep
          - infinity
        volumeMounts:
        - name: busybox1
          mountPath: /busybox1
  volumeClaimTemplates:
  - metadata:
      name: busybox1
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: openebs-cstor-pool-sts
      resources:
        requests:
          storage: 2Gi
```



<h3><a class="anchor" aria-hidden="true" id="Upgrade-the-software-version-of-a-cStor-pool"></a>Upgrade the Software Version of a cStor pool</h3>

The steps for upgrading cStor Pool is mentioned in Upgrade section. Refer [Upgrade](docs/next/upgrade.html) section for more details.



<h3><a class="anchor" aria-hidden="true" id="setting-performance-tunings"></a>Setting Performance Tunings</h3>

Allow users to set available performance tunings in StorageClass based on their workload. Below are the tunings that are required:

- cStor target queue depth
  - This limits the ongoing IO count from client. Default is 32.
- cStor target worker threads
  - Sets the **number of threads** that are working on above queue. It is mentioned by `Luworkers`.Default value is 6.
- cStor volume replica worker threads
  - This Is associated with cStorVolumeReplica.
  - It is mentioned by `ZvolWorkers`.
  - Defaults to the number of cores on the machine.

**Note:**  These configuration can be only used during volume provisioning. Default values will be used in case of "Invalid/None" values has been provided using configuration.

**Example Configuration:**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
name: openebs-cstor-pool
annotations:
  openebs.io/cas-type: cstor
  cas.openebs.io/config: |
    - name: StoragePoolClaim
      value: "sparse-claim-auto"
    - name: QueueDepth
      value: "20"
    - name: Luworkers
      value: "10"
    - name: ZvolWorkers
      value: "4"
provisioner: openebs.io/provisioner-iscsi
```

**Note:** For sequential workload, setting `luworkers` to 1 is good. For random workload,  default setting to 6 is good.



<h3><a class="anchor" aria-hidden="true" id="expanding-cStor-pool-to-a-new-node"></a>Expanding cStor Pool to a New Node</h3>

cStorPools can be horizontally scaled when needed typically when a new Kubernetes node is added or when the existing cStorPool instances become full with cStorVolumes. This feature is added in 0.8.1.

The steps for expanding the pool to new nodes is given below. 

<h4><a class="anchor" aria-hidden="true" id="With-specifiying-blockDeviceList"></a>With specifiying blockDeviceList</h4>

If you are following this approach, you should have created cStor Pool initially using the steps provided [here](https://staging-docs.openebs.io/docs/next/configurepools.html#manual-mode). For expanding pool onto a new OpenEBS node, you have to edit corresponding pool configuration(SPC) YAML with the required disks names under the `blockDeviceList` and update the `maxPools` count .

**Step 1:** Edit the existing pool configuration spec that you originally used and apply it (OR) directly edit the in-use spec file using `kubectl edit spc <SPC Name>`.

**Step 2:** Add the new disks names from the new Nodes under the `blockDeviceList` . You can use `kubectl get blockdevice -n <openebs_namespace>`to obtains the disk CRs.

**Step 3:** Update the `maxPools` count to the new value. If existing `maxPools` count is 3 and one new node is added, then `maxPools` will be 4.

**Step 4:** Apply or save the configuration file and a new cStorPool instance will be created on the expected node.

**Step 5:** Verify the new pool creation by checking

- If a new cStor Pool POD is created (`kubectl get pods -n openebs | grep <pool name>`)
- If a new cStorPool CR is created (`kubectl get csp`)



<h3><a class="anchor" aria-hidden="true" id="expanding-size-of-a-cStor-pool-instance-on-a-node-add-disk"></a>Expanding Size of a cStor Pool Instance on a Node (by adding physical/virtual disks to a pool instance)</h3>

A pool instance is local to a node. A pool instance can be started with as small as one disk (in `striped` mode) or two disks (in `mirrored`) mode. cStor pool instances support thin provisioning of data, which means that provisioning of any volume size will be successful from a given cstorPool config.

However, as the actual used capacity of the pool is utilized, more disks need to be added. Currently the steps for adding more disks to the existing pool is done through manual operations.You can add more disks to the existing StoragePool with the steps provide [here](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_add_disks_to_spc.md). 



<h3><a class="anchor" aria-hidden="true" id="expanding-size-of-a-cStor-pool-instance-on-a-node-add)"></a>Expanding size of a cStor Pool Instance on a Node (by expanding the size of cloud disks)</h3>

There are many cases where cStor Volume has to be increased. For example, capacity might be completely filled up and there by application pod will be in `crashloopbackoff` state of `running` state based on the liveness probe in the application. Another scenario is before starting more load on this volume, it can also expand the capacity of the volume to make sure the uninterrupted running of the application. the steps for expanding the cStor volume is mentioned [here](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_volume_resize.md).



<h3><a class="anchor" aria-hidden="true" id="Moving-a-disk-to-New-Node"></a>Moving a Disk to New Node</h3>

This feature can be do by some set of manual steps. In this section, you can detach the disk from the old node (if necessary) and attach to the new node. This can be done from the steps provided [here](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_move_disk.md). 

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
