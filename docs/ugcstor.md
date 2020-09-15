---
id: ugcstor
title: cStor User Guide
sidebar_label: cStor
---
------

<br>

<img src="/v200/docs/assets/svg/3-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>

This user guide section provides the operations need to performed by the User and the Admin for configuring cStor related tasks. 

   :::note 
   With OpenEBS 2.0, the recommended approach to provision cStor Pools is to use cStorPoolCluster(CSPC). For detailed instructions on how to get started with new cStor Operators please refer to the [Quickstart guide on Github](https://github.com/openebs/cstor-operators).
   :::

## User operations

[Provisioning a cStor volume](#provisioning-a-cStor-volume)

[Monitoring a cStor Volume](#monitoring-a-cStor-Volume)

[Backup and Restore](#backup-and-restore)

[Snapshot and Clone of a cStor Volume](#snapshot-and-clone-of-a-cStor-volume)

[Upgrading the software version of a cStor volume](#Upgrading-the-software-version-of-a-cStor-volume)

[Provisioning sample application with cStor](#Provisioning-sample-application-with-cstor)

[Deleting a cStor Volume](#deleting-a-cStor-volume)

[Patching pool deployment by adding or modifying resource limit and requests](#patching-pool-deployment-resource-limit)




## Admin operations

[Creating cStor storage pools](#creating-cStor-storage-pools)

[Setting Pool Policies](#setting-pool-policies)

[Creating cStor storage classes](#creating-cStor-storage-class)

[Setting Storage Polices](#cstor-storage-policies)

[Monitoring a cStor Pool](#monitor-pool)

[Setting Performance Tunings](#setting-performance-tunings)

[Upgrade the software version of a cStor pool](#Upgrade-the-software-version-of-a-cStor-pool)

[Expanding cStor pool to a new node](#expanding-cStor-pool-to-a-new-node)

[Expanding size of a cStor pool instance on a node by expanding the size of cloud disks](#expanding-size-of-a-cStor-pool-instance-on-a-node-add)

[Expanding size of a cStor pool instance on a node by add physical/virtual disks to a pool instance](#expanding-size-of-a-cStor-pool-instance-on-a-node-add-disk)

[Expanding the cStor Volume Capacity](#expanding-size-of-a-cStor-volume)

[Scaling up cStor Volume Replica](#scaling-up-of-cvr)

[Scaling down cStor Volume Replica](#scaling-down-of-cstor-volume-replica)



<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations</h2>



<h3><a class="anchor" aria-hidden="true" id="provisioning-a-cStor-volume"></a>Provisioning a cStor volume</h3>


For provisioning a cStor Volume, it requires a cStor Storage Pool and a StorageClass. The configuration and verification of a cStor Storage pool can be checked from [here](#creating-cStor-storage-pools). The configuration and verification of a StorageClass can be checked from [here](#creating-cStor-storage-class).

Use a similar PVC spec or volumeClaimTemplate to use a StorageClass that is pointing to a pool with real disks. Consider the following parameters while provisioning OpenEBS volumes on real disks.

**AccessModes:** cStor provides iSCSI targets, which are appropriate for RWO (ReadWriteOnce) access mode and is suitable for all types of databases. For webscale applications like WordPress or any for any other NFS needs, you need RWM (ReadWriteMany) access mode. For RWM, you need NFS provisioner to be deployed along with cStor. See how to provision <a href="/v200/docs/next/rwm.html" target="_blank">RWM PVC with OpenEBS </a>.

**Size:** cStor supports thin provisioning by default, which means you can request any size of the volume through the PVC and get it provisioned. Resize of the volume is not fully supported through the OpenEBS control plane in the current release and it is under active development, see [roadmap](/v200/docs/next/cstor.html#cstor-roadmap) for more details. Hence it is recommended to give good amount of buffer to the required size of the volume so that you don't need to resize immediately or in a very short time period. 

The following shows the example PVC configuration for a Deployment and a StatefulSet application which uses a configured StorageClass to provision a cStor Volume. The provided StorageClass should have been configured with StoragePoolClaim property, so the cStor Volume will be provisioned on the StoragePools associated to the StoragePoolClaim.

<font size="4">**Example configuration for requesting OpenEBS volume for a Deployment**</font>

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: cstor-pvc-mysql-large
spec:
  storageClassName: openebs-sc-statefulset
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

Grafana charts can be built for the above Prometheus metrics. 


<h3><a class="anchor" aria-hidden="true" id="snapshot-and-clone-of-a-cStor-volume"></a>Snapshot and Clone of a cStor Volume</h3>


An OpenEBS snapshot is a set of reference markers for data at a particular point in time. A snapshot act as a detailed table of contents, with accessible copies of data that user can roll back to the required point of instance. Snapshots in OpenEBS are instantaneous and are managed through `kubectl`.

During the installation of OpenEBS, a snapshot-controller and a snapshot-provisioner are setup which assist in taking the snapshots. During the snapshot creation, snapshot-controller creates `VolumeSnapshot` and `VolumeSnapshotData` custom resources. A snapshot-provisioner is used to restore a snapshot as a new Persistent Volume(PV) via dynamic provisioning.

In this section the steps for the creation, clone and deletion a snapshot is provided.



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



<h3><a class="anchor" aria-hidden="true" id="backup-and-restore"></a>Backup and Restore</h3>


OpenEBS volume can be backed up and restored along with the application using OpenEBS velero plugin. It helps the user for backing up the OpenEBS volumes to third party storage location and restore the data whenever it is required. The steps for taking backup and restore are as follows.

<h4><a class="anchor" aria-hidden="true" id="prerequisties-bkp-restore"></a>Prerequisites</h4>

- Latest tested Velero version is 1.4.0.
- Create required storage provider configuration to store the backup.
- Create required OpenEBS storage pools and storage classes on destination cluster.
- Add a common label to all the resources associated to the application that you want to backup. For example, add an application label selector in associated components such as PVC,SVC etc.

<h4><a class="anchor" aria-hidden="true" id="install-velero"></a>Install Velero (Formerly known as ARK)</h3>

Follow the instructions at [Velero documentation](<https://velero.io/docs/v1.4/>) to install and configure Velero.

<h4><a class="anchor" aria-hidden="true" id="steps-for-backup"></a>Steps for Backup</h3>

Velero is a utility to back up and restore your Kubernetes resource and persistent volumes.

To do backup/restore of OpenEBS cStor volumes through Velero utility, you need to install and configure OpenEBS velero-plugin. OpenEBS velero-plugin can be installed using the below command:
```
velero plugin add openebs/velero-plugin:latest
```

Above command will install the latest OpenEBS velero-plugin image.

If you are using OpenEBS velero-plugin then `velero backup` command invokes velero-plugin internally and takes a snapshot of cStor volume data and send it to remote storage location as mentioned in `06-volumesnapshotlocation.yaml`.  The configuration of `06-volumesnapshotlocation.yaml` can be  done in the next section.

<h4><a class="anchor" aria-hidden="true" id="configure-volumesnapshotlocation"></a>Configure Volumesnapshot Location</h3>

To take a backup of cStor volume through Velero, configure `VolumeSnapshotLocation` with provider `openebs.io/cstor-blockstore`. Sample YAML file for volumesnapshotlocation can be found at `06-volumesnapshotlocation.yaml` from the `openebs/velero-plugin` [repo](https://github.com/openebs/velero-plugin/tree/master/example).

Sample spec for configuring volume snapshot location.

```
apiVersion: velero.io/v1
kind: VolumeSnapshotLocation
metadata:
  name: <LOCATION_NAME>
  namespace: velero
spec:
  provider: openebs.io/cstor-blockstore
  config:
    bucket: <YOUR_BUCKET>
    prefix: <PREFIX_FOR_BACKUP_NAME>
    backupPathPrefix: <PREFIX_FOR_BACKUP_PATH>
    namespace: <openebs_installed_namespace>
    provider: <GCP_OR_AWS>
    region: <AWS_REGION or minio>
```

The following are the definition for each parameters.

- name : Provide a snapshot location name. Eg: gcp-default
- bucket : Provide the bucket name created on the cloud provider. Eg: gcpbucket
- prefix : Prefix for backup name. Eg: cstor
- backupPathPrefix: Prefix for backup path. Eg: newbackup. This should be same as `prefix` mentioned in `05-backupstoragelocation.yaml` for keeping all backups at same path.  For more details , please refer [here](https://velero.io/docs/v1.0.0/api-types/backupstoragelocation/). 
- namespace : (Optional) Provide the namespace where OpenEBS is installed. OpenEBS velero plugin will automatically take the OpenEBS installed namespace in the absence of this parameter. 
- Provider : Provider name. Eg: gcp or aws
- region : Provide region name if cloud provider is AWS or use `minio` if it is a MinIO bucket.

For configuring parameters for `AWS` or `MinIO` in `volumesnapshotlocation`, refer [here](https://velero.io/docs/v1.0.0/api-types/backupstoragelocation/) for more details.

Example for GCP configuration:

```
---
apiVersion: velero.io/v1
kind: VolumeSnapshotLocation
metadata:
  name: gcp-default
  namespace: velero
spec:
  provider: openebs.io/cstor-blockstore
  config:
    bucket: gcpbucket
    prefix: cstor
    namespace: openebs
    backupPathPrefix: newbackup
    provider: gcp
```

After creating the `06-volumesnapshotlocation.yaml` with the necessary details, apply the YAML using the following command. 

```
kubectl apply -f 06-volumesnapshotlocation.yaml
```

Currently supported `volumesnapshotlocations` for velero-plugin are AWS, GCP and MinIO.

<h4><a class="anchor" aria-hidden="true" id="managing-backup"></a>Managing Backups</h3>

Take the backup using the below command. Here, you need to get the label of the application.

```
velero backup create <backup-name> -l app=<app-label-selector> --snapshot-volumes --volume-snapshot-locations=<SNAPSHOT_LOCATION>
```

**Note**: `SNAPSHOT_LOCATION` should be the same as you configured in the  `06-volumesnapshotlocation.yaml`. You can use `--selector` as a flag in backup command  to filter specific resources or use a combo of `--include-namespaces` and `--exclude-resources` to exclude specific resources in the specified namespace. More details can be read from [here](https://heptio.github.io/velero/v0.12.0/api-types/backup.html).

Example: 

```
velero backup create new1 -l app=minio --snapshot-volumes --volume-snapshot-locations=gcp-default
```

The above command shown in example will take backup of all resources which has a common label `app=minio`.  

After taking backup, verify if backup is taken successfully by using following command.

```
velero get backup
```

The following is a sample output.

```
NAME             STATUS                      CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
new1             Completed                   2019-06-13 12:44:26 +0530 IST   29d       default            app=minio
```

From the example mentioned in [configure-volumesnapshotlocation](#configure-volumesnapshotlocation), backup files of cStor volumes will be stored at `gcpbucket/newbackup/backups/new1/cstor-<pv_name>-new1`

You will get more details about the backup using the following command.

```
velero backup describe <backup_name> 
```

Example:

```
velero backup describe new1
```

Once the backup is completed you should see the `Phase` marked as `Completed` and `Persistent Volumes` field shows the number of successful snapshots.

<h4><a class="anchor" aria-hidden="true" id="steps-for-restore"></a>Steps for Restore</h3>

Velero backup can be restored onto a new cluster or to the same cluster. An OpenEBS PVC *with the same name as the original PVC* will be created and application will run using the restored OpenEBS volume.

**Prerequisites**

- Create the same namespace and StorageClass configuration of the source PVC in your target cluster. 
- If the restoration happens on same cluster where Source PVC was created, then ensure that application and its corresponding components such as Service, PVC,PV and cStorVolumeReplicas are deleted successfully.

On the target cluster, restore the application using the below command. 

```
velero restore create <restore-name> --from-backup <backup-name> --restore-volumes=true
```

Example:

```
velero restore create new_restore --from-backup new1 --restore-volumes=true 
```

The restoration job details can be obtained using the following command.

```
velero restore get
```

Once the restore job is completed you should see the corresponding restore job is marked as `Completed`.

**Note:** After restoring, you need to set `targetip` for the volume in all pool pods. This means, if there are 3 cStor pools of same SPC, then you need to set `targetip` for the volume in all the 3 pool pods. Target IP of the PVC can be find from running the following command.

```
kubectl get svc -n <openebs_installed namespace>
```

Output will be similar to the following

```
NAME                                       TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)                               AGE
admission-server-svc                       ClusterIP   10.4.40.66    <none>        443/TCP                               9h
maya-apiserver-service                     ClusterIP   10.4.34.15    <none>        5656/TCP                              9h
pvc-9b43e8a6-93d2-11e9-a7c6-42010a800fc0   ClusterIP   10.4.43.221   <none>        3260/TCP,7777/TCP,6060/TCP,9500/TCP   8h
```

In this case, `10.4.43.221` is the service IP of the PV. This target ip is required after login to the pool pod. The steps for updating target ip is as follows: 

```
kubectl exec -it <POOL_POD> -c cstor-pool -n openebs -- bash 
```

After entering the `cstor-pool` container, get the dataset name from the output of following command.

```
zfs list | grep <pv_name>
```

Update the `targetip` for the corresponding dataset using the following command. 

```
zfs set io.openebs:targetip=<PVC SERVICE IP> <POOL_NAME/VOLUME_NAME>
```

After executing the above command, exit from the container session. The above procedure has to be performed on all the other cStor pools of the same SPC. 

Verify application status using the following command. Now the application should be running.

```
kubectl get pod -n <namespace>
```

Verify PVC status using the following command.

```
kubectl get pvc -n <namespace>
```

<h4><a class="anchor" aria-hidden="true" id="scheduling-backup"></a>Scheduling backups</h3>

Using `velero schedule` command, periodic backups are taken.

In case of velero-plugin, this periodic backups are incremental backups which saves storage space and backup time. To restore periodic backup with velero-plugin, refer [here](https://github.com/openebs/velero-plugin/blob/v0.9.x/README.md) for more details. The following command will schedule the backup as per the cron time mentioned .

```
velero schedule create <backup-schedule-name> --schedule "0 * * * *" --snapshot-volumes volume-snapshot-locations=<SNAPSHOT_LOCATION> -l app=<app-label-selector>
```

Note: `SNAPSHOT_LOCATION`  should be the same as you configured by using `06-volumesnapshotlocation.yaml`

Get the details of backup using the following command

```
velero backup get
```

During the first backup iteration of a schedule, full data of the volume will be backed up. After taking the full backup in the first schedule, then it will take the incremental backup as part of the next iteration.

<h4><a class="anchor" aria-hidden="true" id="restore-from-schedule"></a>Restore from a Scheduled Backup</h3>

Since the backups taken are incremental for a schedule, order of restoring data is important. You need to restore data in the order of the backups created.

For example, below are the available backups for a schedule.

```
NAME                   STATUS      CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
sched-20190513104034   Completed   2019-05-13 16:10:34 +0530 IST   29d       gcp                <none>
sched-20190513103534   Completed   2019-05-13 16:05:34 +0530 IST   29d       gcp                <none>
sched-20190513103034   Completed   2019-05-13 16:00:34 +0530 IST   29d       gcp                <none>
```

Restoration of data need to be done in following way:

```
velero restore create --from-backup sched-20190513103034 --restore-volumes=true
velero restore create --from-backup sched-20190513103534 --restore-volumes=true
velero restore create --from-backup sched-20190513104034 --restore-volumes=true
```

<h4><a class="anchor" aria-hidden="true" id="deletion-backup"></a>Deletion of Backups</h3>

To delete a single backup which is not created from scheduled backup, use the following command.

```
velero backup delete <backup_name>
```

Note: the deletion of backup will not delete the snapshots created as part of backup from the cStor Storage pool. This can be deleted by following manual steps .

1. First verify the cStor backups created for corresponding cStor volume. To obtain the cStor backups of cStor volume, use the following command by providing the corresponding backup name.

   ```
   kubectl get  cstorbackups  -n <backup_namespace> -l openebs.io/backup=<backup_name>  -o=jsonpath='{range .items[*]}{.metadata.labels.openebs\.io/persistent-volume}{"\n"}{end}'
   ```

2. Delete the corresponding cStor backups using the following command.

   ```
   kubectl delete cstorbackups -n <backup_namespace> -l openebs.io/backup=<backup_name>
   ```

3. To delete the cStor backup completed jobs, use the following command.

   ```
   kubectl delete cstorbackupcompleted -n <backup_namespace> -l openebs.io/backup=<backup_name>
   ```

The deletion of Velero backup schedule doesn't destroy the backup created during the schedule. User need to delete a scheduled backup manually. Use the above steps to delete the scheduled backups.



<h3><a class="anchor" aria-hidden="true" id="Upgrading-the-software-version-of-a-cStor-volume"></a>Upgrading the software version of a cStor volume</h3>


The steps are mentioned in Upgrade section. For upgrading cStorVolume, ensure that cStor Pool image is support this cStor volume image.  It should also recommended to upgrade the corresponding pool before upgrading cStor volume. The steps for upgrading the cStor volume can be find from [here](/v200/docs/next/upgrade.html).

<h3><a class="anchor" aria-hidden="true" id="Provisioning-sample-application-with-cstor"></a>Provisioning sample application with cStor</h3>


Before provisioning an application ensure that all the below mentioned steps are carried out:
<ol>
<li>
Ensure that the filesystem is mounted as per requirement. 
To know more about mount status <a href="/v200/docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume" target="_blank">click here</a>.
</li>
<li>
<b>Create StoragePool</b> specifying the Blockdevices that are to be used.
To know the detailed steps for creation of StoragePool <a href="/v200/docs/next/ugcstor.html#creating-cStor-storage-pools" target="_blank">click here.</a>
The name specified under <b>metadata</b> in the <b>StoragePoolClaim</b> YAML needs to be mentioned in <b>StorageClass</b> YAML (in the next step).
Using this StoragePool 
 create StorageClass by referring <a href="/v200/docs/next/ugcstor.html#creating-cStor-storage-class" target="_blank"> here</a>.
</li>
<li>
Once all the above actions have been successfully executed, You can deploy Busybox with cStor volume as follows:
Copy the below spec into a file, say <b>demo-busybox-cstor.yaml</b> and update  <b>storageClassName</b>  to <b>openebs-sc-statefulset</b>.
<br>

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: busybox
  labels:
    app: busybox
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
  selector:
    matchLabels:
      app: busybox
  template:
    metadata:
      labels:
        app: busybox
    spec:
      containers:
      - resources:
           limits:
            cpu: 0.5
        name: busybox
        image: busybox
        command: ['sh', '-c', 'echo Container 1 is Running ; sleep 3600']
        imagePullPolicy: IfNotPresent
        ports:
         - containerPort: 3306
           name: busybox
        volumeMounts:
        - mountPath: /var/lib/mysql
          name: demo-vol1
      volumes:
       - name: demo-vol1
         persistentVolumeClaim:
          claimName: demo-vol1-claim
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-sc-statefulset
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Gi
---
apiVersion: v1
kind: Service
metadata:
  name: busybox-mysql
  labels:
    name: busybox-mysql
spec:
  ports:
    - port: 3306
      targetPort: 3306
  selector:
      name: busybox
```
<br>
Now execute the above yaml file using the below-mentioned command

```
kubectl apply -f demo-busybox-cstor.yaml
```
</li>
<li>
To verify whether the application is successfully deployed, execute the following command:<br>

```
kubectl get pods 
```

The application pods should be running as displayed below:

```
NAME                       READY   STATUS    RESTARTS   AGE
busybox-66db7d9b88-kkktl   1/1     Running   0          2m16s
```
</li>
<li>
To verify whether the target pod is successfully deployed, execute the following command:<br>

```
kubectl get pod -n <openebs_installed_namespace> | grep <pvc_name>
```

The target pod should be running as displayed below:

```
NAME                                                              READY   STATUS    RESTARTS   AGE
pvc-3c8f3d76-0131-11ea-89a5-0cc47ab587b8-target-6566cc7885n4hdt   1/1     Running   0          2m16s
```
</li>
</ol>

> The resiliency of the application upon different undesired conditions such as forced reschedule, container crashes or slow network connectivity to cstor target pods can be verified by the following chaos experiments: <br>
> <a href="https://docs.litmuschaos.io/docs/next/openebs-target-pod-failure"> OpenEBS target pod failure </a> <br>
> <a href="https://docs.litmuschaos.io/docs/next/openebs-target-container-failure"> OpenEBS target (istgt) container failure </a> <br>
> <a href="https://docs.litmuschaos.io/docs/next/openebs-target-network-delay"> OpenEBS target network delay  </a>


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

Verify the PV is deleted successfully using the following command:

```
kubectl get pv
```

Verify if the cStorVolume is deleted successfully using the following command:

```
kubectl get cstorvolume -n <openebs_installed_namespace>
```

Verify if the cStorVolumeReplica(CVR) is deleted successfully using the following command:

```
kubectl get cvr -n <openebs_installed_namespace>
```

Verify corresponding cStor Volume target also deleted successfully using the following command:

```
kubectl get pod -n <openebs_installed_namespace> | grep <pvc_name>
```



<h3><a class="anchor" aria-hidden="true" id="patching-pool-deployment-resource-limit"></a>Patching pool deployment by adding or modifying resource limit and requests</h3>


1. Create a patch file called "patch.yaml" and add the following content to it. You can change the values based on the Node configuration. Recommended values are 4Gi for limits and 2Gi for requests.

   ```
   spec:
     template:
       spec:
         containers:
         - name: cstor-pool
           resources:
             limits:
               memory: 4Gi
             requests:
               memory: 2Gi
   ```

2. Get the pool deployment using the following command:
  
   ```
   kubectl get deploy -n openebs    
   ```
  
3. Patch the corresponding pool deployment using the following command.

   ```
   kubectl patch deployment <pool_deployment_name> --patch "$(cat patch.yaml)" -n <openebs_installed_namespace>
   ```

   Eg: 

   ```
   kubectl patch deployment <pool_deployment_name> --patch "$(cat patch.yaml)" -n openebs
   ```

   **Note:** After patching, the existing pool pod will be terminated and a new pool pod will be created. Repeat the same process for other deployments of the same pool as well one by one once new pool pod is created.

<br>

<hr>

<br>
<h2><a class="anchor" aria-hidden="true" id="admin-operations"></a>Admin Operations</h2>



<h3><a class="anchor" aria-hidden="true" id="creating-cStor-storage-pools"></a>Creating cStor Storage Pools</h3>


The cStorStoragePool can be created by specifying the blockDeviceList. The following section will describe the steps in detail. 

<h4><a class="anchor" aria-hidden="true" id="manual-mode"></a>Create a cStorPool by specifying blockDeviceList </h4>

**Overview**

1. Get the details of blockdevices attached in the cluster.
2. Create a StoragePoolClaim configuration YAML and update the required details.
3. Apply the StoragePoolClaim configuration YAML to create the cStorStoragePool.

**Step1:**

Get all the blockdevices attached in the cluster with the following command. Modify the following command  with appropriate namespace where the OpenEBS is installed. The default namespace where OpenEBS is getting installed is `openebs`.

```
kubectl get blockdevice -n <openebs_namespace>
```

Example:

```
kubectl get blockdevice -n openebs
```

The output will be similar to the following.

<div class="co">
NAME                                           NODENAME                                    SIZE          CLAIMSTATE   STATUS   AGE
blockdevice-1c10eb1bb14c94f02a00373f2fa09b93   gke-ranjith-14-default-pool-da9e1336-mbq9   42949672960   Unclaimed    Active   2m39s
blockdevice-77f834edba45b03318d9de5b79af0734   gke-ranjith-14-default-pool-da9e1336-d9zq   42949672960   Unclaimed    Active   2m47s
blockdevice-936911c5c9b0218ed59e64009cc83c8f   gke-ranjith-14-default-pool-da9e1336-9j2w   42949672960   Unclaimed    Active   2m55s </div>

The details of blockdevice can be get using the following command. 

```
 kubectl describe blockdevice <blockdevicename> -n <openebs_namespace>
```

Example:

```
kubectl describe blockdevice blockdevice-1c10eb1bb14c94f02a00373f2fa09b93 -n openebs 
```

From the output, you will get the hostname and other blockdevice details such as State,Path,Claim State,Capacity etc.

**Note:** Identify block devices which are unclaimed, unmounted on node and does not contain any filesystem. The above command will help to find these information. More information about the disk mount status on node can be read from [here](/v200/docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume).

**Step2:** 

Create a StoragePoolClaim configuration YAML file called `cstor-pool1-config.yaml` with the following content. In the following YAML, `PoolResourceRequests` value is set to `2Gi` and `PoolResourceLimits` value is set to `4Gi`. The resources will be shared for all the volume replicas that reside on a pool. The value of these resources can be 2Gi to 4Gi per pool on a given node for better performance. These values can be changed as per the Node configuration for better performance. Refer [setting pool policies](#setting-pool-policies) for more details on the pool policies applicable for cStor.

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
  type: disk
  poolSpec:
    poolType: striped
  blockDevices:
    blockDeviceList:
    - blockdevice-1c10eb1bb14c94f02a00373f2fa09b93
    - blockdevice-77f834edba45b03318d9de5b79af0734
    - blockdevice-936911c5c9b0218ed59e64009cc83c8f
---
```

In the above file, change the following parameters as required.

- `poolType`

  This field  represents how the data will be written to the disks on a given pool instance on a node. Supported values are `striped`, `mirrored`, `raidz` and `raidz2`.

  Note: In OpenEBS, the pool instance does not extend beyond a node. The replication happens at volume level but not at the pool level. See [volumes and pools relationship](/v200/docs/next/cstor.html#relationship-between-cstor-volumes-and-cstor-pools) in cStor for a deeper understanding.

- `blockDeviceList`

  Select the list of selected unclaimed blockDevice CRs which are unmounted and does not contain a filesystem in each participating nodes and enter them under `blockDeviceList`. 

  To get the list of blockDevice CRs, use `kubectl get blockdevice -n openebs`. 

  You must enter all selected blockDevice CRs manually together from the selected nodes. 

  When the `poolType` = `mirrored` , **ensure the number of blockDevice CRs selected from each node are an even number**.  The data is striped across mirrors. For example, if 4x1TB blockDevice are selected on `node1`, the raw capacity of the pool instance of `cstor-disk-pool` on `node1` is 2TB. 

  When the `poolType` = `striped`, **the number of blockDevice CRs from each node can be in any number**. The data is striped across each blockDevice. For example, if 4x1TB blockDevices are selected on `node1`, the raw capacity of the pool instance of `cstor-disk-pool` on that `node1` is 4TB. 

  When the `poolType` = `raidz`, **ensure that the number of  blockDevice CRs selected from each node are like 3,5,7 etc. The data is written with single parity**. For example, if 3x1TB blockDevice are selected on node1, the raw capacity of the pool instance of `cstor-disk-pool` on node1 is 2TB. 1 disk will be used as a parity disk.
  
  When the `poolType` = `raidz2`, **ensure that the number of  blockDevice CRs selected from each node are like 6,8,10 etc. The data is written with dual parity**. For example, if 6x1TB blockDevice are selected on node1, the raw capacity of the pool instance of `cstor-disk-pool` on node1 is 4TB. 2 disks will be used for parity.
  
  
  
  The number of selected blockDevice CRs across nodes need not be the same.  Unclaimed blockDevice CRs which are unmounted on nodes and does not contain any filesystem can be added to the pool spec dynamically as the used capacity gets filled up. 


- `type`

  This value can be either `sparse` or `disk`.  If you are creating a sparse pool using the sparse disk based blockDevice which are created as part of applying openebs operator YAML, then choose type as `sparse`. For other blockDevices, choose type as `disk`.

**Step3:**

After the StoragePoolClaim configuration YAML spec is created, run the following command to create the pool instances on nodes.

```
kubectl apply -f cstor-pool1-config.yaml
```

Verify cStor Pool configuration is created successfully using the following command.

```
kubectl get spc
```

The following is an example output.

```
NAME              AGE
cstor-disk-pool   20s
```

Verify if cStor Pool is created successfully using the following command.

```
kubectl get csp
```

The following is an example output.

```
NAME                   ALLOCATED   FREE    CAPACITY   STATUS    TYPE      AGE
cstor-disk-pool-2gcb   270K        39.7G   39.8G      Healthy   striped   1m
cstor-disk-pool-9q2f   270K        39.7G   39.8G      Healthy   striped   1m
cstor-disk-pool-ilz1   270K        39.7G   39.8G      Healthy   striped   1m
```

Verify if cStor pool pods are running using the following command.

```
kubectl get pod -n <openebs_installed_namespace> | grep -i <spc_name>
```

Example:

```
kubectl get pod -n openebs | grep cstor-disk-pool
```

Example Output:

```
cstor-disk-pool-2gcb-64876b956b-q8fgp          3/3     Running   0          2m30s
cstor-disk-pool-9q2f-b85ccf6f-6cpdm            3/3     Running   0          2m30s
cstor-disk-pool-ilz1-5587ff79bf-6djjf          3/3     Running   0          2m31s
```

If all pods are showing are running, then you can use these cStor pools for creating cStor volumes.

**Note:** The cStor pool can be horizontally scale up on new OpenEBS Node by editing  the corresponding pool configuration YAML with the new disks name under `blockDeviceList` . More details can be found [here](/v200/docs/next/ugcstor.html#expanding-cStor-pool-to-a-new-node).  If you find any issues, check common issues added in [troubleshooting](/docs/next/troubleshooting.html) section.

> The resiliency of the cStor storage pool can be verified via `litmus` using <a href="https://docs.litmuschaos.io/docs/next/cStor-pool-chaos/"> cStor-pool-chaos </a> experiment.


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

This feature allow you to specify pool resource requests that need to be available before scheduling the containers. If not specified, the default values are used. The following sample configuration will set memory as `2Gi` and ephemeral-stroage request value as `100Mi`. The memory  will be shared for all the volume replicas that reside on a pool. The memory can be `2Gi` to `4Gi` per pool on a given node for better performance. These values can be changed as per the node configuration for better performance. The below configuration also set the `cstor-pool` container with `100Mi` as `ephemeral-storage` requests which will avoid erraneous eviction by K8s. 

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
            ephemeral-storage: "100Mi"
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
            value: storage
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
```



<h4><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h4>

The below configuration will set the cstor-pool side-cars with memory as `0.5Gi`, cpu as `100m`. This also set the `cstor-pool` side-cars with ephemeral-storage request `50Mi` which will avoid erraneous eviction by K8s. 

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
            ephemeral-storage: "50Mi"
```



<h3><a class="anchor" aria-hidden="true" id="creating-cStor-storage-class"></a>Creating cStor Storage Class</h3>


StorageClass definition is an important task in the planning and execution of OpenEBS storage. As detailed in the CAS page, the real power of CAS architecture is to give an independent or a dedicated storage engine like cStor for each workload, so that granular policies can be applied to that storage engine to tune the behaviour or performance as per the workload's need. In OpenEBS policies to the storage engine (in this case it is cStor) through the `annotations` specified in the `StorageClass` interface. 



<h4><a class="anchor" aria-hidden="true" id="steps-to-create-a-cStor-storageclass"></a>Steps to Create a cStor StorageClass</h4>

**Step1:** Decide the cStorPool and get the StoragePoolClaim name associated to it.

**Step2:** Which application uses it? Decide the replicaCount based on your requirement. OpenEBS doesn't restrict the replica count to set, but only maximum up to 5 replicas are allowed. It depends how users configure it, but for the availability of volumes at least  (n/2 + 1) replicas should be up and connected to the target, where `n` is the `replicaCount`. The following are some example cases:

- If user configured replica count as 2, then always 2 replicas should be available to perform operations on volume.
- If replica count as 3 it should require at least 2 replicas should be available for volume to be operational. 
- If replica count as 5 it should require at least 3 replicas should be available for volume to be operational.

**Step3:** Are there any other storage policies to be applied to the StorageClass? Refer to the [storage policies section](#cstor-storage-policies) for more details on the storage policies applicable for cStor.

**Step4:** Create a YAML spec file <storage-class-name.yaml> from the master template below, update the pool, replica count and other policies and create the class using `kubectl apply -f <storage-class-name.yaml>` command.

**Step5:** Verify the newly created StorageClass using `kubectl describe sc <storage-class-name>`



<h4><a class="anchor" aria-hidden="true" id="example-configuration-of-openEBS-storageClass"></a>Example Configuration of OpenEBS StorageClass</h4>

You can create a new StorageClass YAML called **openebs-sc-rep3.yaml** and add content to it from below. By using this spec, a StorageClass will be created with 3 OpenEBS cStor replicas and will configure them on the pools associated with the `StoragePoolClaim:cstor-disk-pool` .

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sc-statefulset
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk-pool"
      - name: ReplicaCount
        value: "3"
provisioner: openebs.io/provisioner-iscsi
```



<h3><a class="anchor" aria-hidden="true" id="cstor-storage-policies"></a>Setting Storage Policies</h3>


Below table lists the storage policies supported by cStor. These policies should be built into StorageClass and apply them through PersistentVolumeClaim or VolumeClaimTemplates interface. `StoragePoolClaim` is the mandatory policy to be specified in all the storage class definitions.

| cStor Storage Policy                                         | Mandatory | Default                                 | Purpose                                                      |
| ------------------------------------------------------------ | --------- | --------------------------------------- | ------------------------------------------------------------ |
| [ReplicaCount](#Replica-Count-Policy)                        | No        | 3                                       | Defines the number of cStor volume replicas                  |
| [VolumeControllerImage](#Volume-Controller-Image-Policy)     |           | quay.io/openebs/cstor-volume-mgmt:2.0.0 | Dedicated side car for command management like taking snapshots etc. Can be used to apply a specific issue or feature for the workload |
| [VolumeTargetImage](#Volume-Target-Image-Policy)             |           | value:quay.io/openebs/cstor-istgt:2.0.0 | iSCSI protocol stack dedicated to the workload. Can be used to apply a specific issue or feature for the workload |
| [StoragePoolClaim](#Storage-Pool-Claim-Policy)               | Yes       | N/A (a valid pool must be provided)     | The cStorPool on which the volume replicas should be provisioned |
| [VolumeMonitor](#Volume-Monitor-Policy)                      |           | ON                                      | When ON, a volume exporter sidecar is launched to export Prometheus metrics. |
| [VolumeMonitorImage](#Volume-Monitoring-Image-Policy)        |           | quay.io/openebs/m-exporter:2.0.0        | Used when VolumeMonitor is ON. A dedicated metrics exporter to the workload. Can be used to apply a specific issue or feature for the workload |
| [FSType](#Volume-File-System-Type-Policy)                    |           | ext4                                    | Specifies the filesystem that the volume should be formatted with. Other values are `xfs` |
| [TargetNodeSelector](#Target-NodeSelector-Policy)            |           | Decided by Kubernetes scheduler         | Specify the label in `key: value` format to notify Kubernetes scheduler to schedule cStor target pod on the nodes that match label |
| [TargetResourceLimits](#Target-ResourceLimits-Policy)        |           | Decided by Kubernetes scheduler         | CPU and Memory limits to cStor target pod                    |
| [TargetResourceRequests](#TargetResourceRequests)            |           | Decided by Kubernetes scheduler         | Configuring resource requests that need to be available before scheduling the containers. |
| [TargetTolerations](#TargetTolerations)                      |           | Decided by Kubernetes scheduler         | Configuring the tolerations for target.                      |
| [AuxResourceLimits](#AuxResourceLimits-Policy)               |           | Decided by Kubernetes scheduler         | Configuring resource limits on the volume pod side-cars.     |
| [AuxResourceRequests](#AuxResourceRequests-Policy)           |           | Decided by Kubernetes scheduler         | Configure minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. |
| [Target Affinity](#Target-Affinity-Policy)                   |           | Decided by Kubernetes scheduler         | The policy specifies the label KV pair to be used both on the cStor target and on the application being used so that application pod and cStor target pod are scheduled on the same node. |
| [Target Namespace](#Target-Namespace)                        |           | openebs                                 | When service account name is specified, the cStor target pod is scheduled in the application's namespace. |
| [cStorStoragePool Replica Anti-Affinity](#cStorStoragePool-Anti-Affinity) |           | Decided by Kubernetes scheduler         | For StatefulSet applications, to distribute single replica volume on  separate nodes . |

<br>



<h4><a class="anchor" aria-hidden="true" id="Storage-Pool-Claim-Policy"></a>Storage Pool Claim Policy</h4>

You can specify the cStor Pool Claim name using the *value* for *StoragePoolClaim* property. This will help you choose cStor storage pool where OpenEBS volume will be created. Following is the default StorageClass template where cStor volume will be created on default cStor Sparse Pool.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sc-spc
  annotations:
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Replica-Count-Policy"></a>Replica Count Policy</h4>

You can specify the cStor volume replica count using the *ReplicaCount* property. You need to ensure that the replica count should not be more than the pools created in the respective StoragePoolClaim.  In the following example, the ReplicaCount is specified as 3. Hence, three cStor volume replicas will be created.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sc-rep3
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaCount
        value: "3"
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Controller-Image-Policy"></a>Volume Controller Image Policy</h4>

You can specify the cStor Volume Controller Image using the *value* for *VolumeControllerImage* property. This will help you choose the volume management image.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-mgmt-sc
  annotations:
    cas.openebs.io/config: |
      - name: VolumeControllerImage
        value: quay.io/openebs/cstor-volume-mgmt:2.0.0
      - name: StoragePoolClaim
        value: "cstor-disk-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Target-Image-Policy"></a>Volume Target Image Policy</h4>

You can specify the cStor Target Image using the *value* for *VolumeTargetImage* property. This will help you choose the cStor istgt target image.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-target-sc
  annotations:
    cas.openebs.io/config: |
      - name: VolumeTargetImage
        value:quay.io/openebs/cstor-istgt:2.0.0
      - name: StoragePoolClaim
        value: "cstor-disk-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Monitor-Policy"></a>Volume Monitor Policy</h4>

You can specify the cStor volume monitor feature which can be set using *value* for the *VolumeMonitor* property.  By default, volume monitor is enabled.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sc-monitoring
  annotations:
    cas.openebs.io/config: |
      - enabled: "true"
        name: VolumeMonitor
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Monitoring-Image-Policy"></a>Volume Monitoring Image Policy</h4>

You can specify the monitoring image policy for a particular volume using *value* for *VolumeMonitorImage* property. The following sample storage class uses the Volume Monitor Image policy.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sc-monitor-image
  annotations:
    cas.openebs.io/config: |
      - name: VolumeMonitorImage
        value: quay.io/openebs/m-exporter:2.0.0
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Volume-File-System-Type-Policy"></a>Volume File System Type Policy</h4>

You can specify the file system type for the cStor volume where application will consume the storage using *value* for *FSType*. The following is the sample storage class. Currently OpenEBS support ext4 as the default file system and it also supports XFS.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sc-fstype
  annotations:
    cas.openebs.io/config: |
      - name: FSType
        value: ext4
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Target-NodeSelector-Policy"></a>Target NodeSelector Policy</h4>

You can specify the *TargetNodeSelector* where Target pod has to be scheduled using the *value* for *TargetNodeSelector*. In following example, `node: appnode ` is the node label.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sc-targetselector
  annotations:
    cas.openebs.io/config: |
      - name: TargetNodeSelector
        value: |-
            node: appnode
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Target-ResourceLimits-Policy"></a>Target ResourceLimits Policy</h4>

You can specify the *TargetResourceLimits* to restrict the memory and cpu usage of target pod within the given limit  using the *value* for *TargetResourceLimits* .

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sc-target-resource
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceLimits
        value: |-
            memory: 1Gi
            cpu: 100m
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="TargetResourceRequests"></a>TargetResourceRequests Policy </h4>

You can specify the *TargetResourceRequests* to specify resource requests that need to be available before scheduling the containers. 

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: opeenbs-sc-tgt-request
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceRequests
        value: |-
            ephemeral-storage: "100Mi"
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
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
  name: openebs-sc-aux-limit
  annotations:
    cas.openebs.io/config: |
      - name:  AuxResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 100m
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h4>

This feature is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars. Requests have to be specified in the format expected by Kubernetes

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sc-aux-request
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceRequests
        value: |-
            memory: 0.5Gi
            cpu: 100m
            ephemeral-storage: "100Mi"
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Target-Affinity-Policy"></a>Target Affinity Policy</h4>

The StatefulSet workloads access the OpenEBS storage volume  by connecting to the Volume Target Pod. This policy can be used to co-locate volume target pod on the same node as workload.

The configuration for implementing this policy is different for deployment and StatefulSet applications.

<h5><a class="anchor" aria-hidden="true" id="for-statefulset-applications"></a>For StatefulSet Applications</h5>

In the case of provisioning StatfulSet applications with replication factor greater than "1" and volume replication factor equal to "1", for a given OpenEBS volume, target and replica related to that volume should be scheduled on the same node where the application pod resides. This feature can be achieved by using either of the following approaches.

**Approach 1:**

In this approach, modification is required on StatefulSet spec and corresponding StorageClass being used in the StatefulSet spec. Add `openebs.io/sts-target-affinity: <metadata.name of STS>` label in StatefulSet spec to the following fields.

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

Do the following changes in the StorageClass that is referred in the claimTemplates of this StatefulSet.

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

This approach is useful when user/tool does not have control over the StatefulSet spec. In this case, it requires a new StorageClass per StatefulSet application.

Add following changes in the StorageClass that is referred to by the claimTemplates of this StatefulSet.

- Add openebs.io/sts-target-affinity: <metadata.name of STS> label to the following fields.
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
        value: "3"
      - name: StoragePoolClaim
        value: "cstor-sparse-pool" 
provisioner: openebs.io/provisioner-iscsi
volumeBindingMode: WaitForFirstConsumer
```

**Note:** It is recommended to do application pod stickiness for seamless working of the above approaches. Example YAML spec for STS can be referred from [here](https://raw.githubusercontent.com/openebs/openebs/12be2bbdb244d50c8c0fd48b59d520f86aa3a4a6/k8s/demo/mongodb/demo-mongo-cstor-taa.yaml).

<h5><a class="anchor" aria-hidden="true" id="for-deployment-applications"></a>For Deployment Applications</h5>
This feature makes use of the Kubernetes Pod Affinity feature that is dependent on the Pod labels. User will need to add the following label to both Application and PVC.

```
labels:
  openebs.io/target-affinity: <application-unique-label>
```

You can specify the Target Affinity in both application and OpenEBS PVC using the following way. For Application Pod, it will be similar to the following.

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
  name: openebs-cstor-perf
  annotations:
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
      - name: ReplicaCount
        value: "3"
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


The steps for upgrading cStor Pool is mentioned in Upgrade section. Refer [Upgrade](/v200/docs/next/upgrade.html) section for more details.


<h3><a class="anchor" aria-hidden="true" id="monitor-pool"></a>Monitor a cStor Pool</h3>


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


<h3><a class="anchor" aria-hidden="true" id="setting-performance-tunings"></a>Setting Performance Tunings</h3>


Allow users to set available performance tunings in StorageClass based on their workload. Below are the tunings that are required:

- cStor target queue depth
  - This limits the ongoing IO count from client. Default is 32.
- cStor target worker threads
  - Sets the **number of threads** that are working on above queue. It is mentioned by `Luworkers`. Default value is 6. In case of better number of cores and RAM, this value can be 16. This means 16 threads will be running for each volume. 
- cStor volume replica worker threads
  - This Is associated with cStorVolumeReplica.
  - It is mentioned by `ZvolWorkers`.
  - Defaults to the number of cores on the machine.
  - In case of better number of cores and RAM, this value can be 16.

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
        value: "32"
      - name: Luworkers
        value: "16"
      - name: ZvolWorkers
        value: "16"
provisioner: openebs.io/provisioner-iscsi
```

**Note:** For sequential workload, setting `luworkers` to 1 is good. For random workload,  default setting to 6 is good.



<h3><a class="anchor" aria-hidden="true" id="expanding-cStor-pool-to-a-new-node"></a>Expanding cStor Pool to a New Node</h3>


cStorPools can be horizontally scaled when needed typically when a new Kubernetes node is added or when the existing cStorPool instances become full with cStorVolumes. This feature is added in 0.8.1.

The steps for expanding the pool to new nodes is given below. 

<h4><a class="anchor" aria-hidden="true" id="With-specifiying-blockDeviceList"></a>With specifiying blockDeviceList</h4>
If you are following this approach, you should have created cStor Pool initially using the steps provided [here](/v200/docs/next/ugcstor.html#creating-cStor-storage-pools). For expanding pool onto a new OpenEBS node, you have to edit corresponding pool configuration(SPC) YAML with the required block device names under the `blockDeviceList` .

**Step 1:** Edit the existing pool configuration spec that you originally used and apply it (OR) directly edit the in-use spec file using `kubectl edit spc <SPC Name>`.

**Step 2:** Add the new disks names from the new Nodes under the `blockDeviceList` . You can use `kubectl get blockdevice -n <openebs_namespace>`to obtains the disk CRs.

**Step 3:** Apply or save the configuration file and a new cStorPool instance will be created on the expected node.

**Step 4:** Verify the new pool creation by checking

- If a new cStor Pool POD is created (`kubectl get pods -n openebs | grep <pool name>`)
- If a new cStorPool CR is created (`kubectl get csp -n <openebs_installed_namespace>`)



<h3><a class="anchor" aria-hidden="true" id="expanding-size-of-a-cStor-pool-instance-on-a-node-add-disk"></a>Expanding Size of a cStor Pool Instance on a Node (by adding physical/virtual disks to a pool instance)</h3>


A pool instance is local to a node. A pool instance can be started with as small as one disk (in `striped` mode) or two disks (in `mirrored`) mode. cStor pool instances support thin provisioning of data, which means that provisioning of any volume size will be successful from a given cstorPool config.

However, as the actual used capacity of the pool is utilized, more disks need to be added. Currently the steps for adding more disks to the existing pool is done through manual operations.You can add more disks to the existing StoragePool with the steps provide [here](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_add_disks_to_spc.md). 



<h3><a class="anchor" aria-hidden="true" id="expanding-size-of-a-cStor-pool-instance-on-a-node-add"></a>Expanding size of a cStor Pool Instance on a Node (by expanding the size of cloud disks)</h3>


When you have a cloud disk and which is used for the creation of cStor Storage pool and when you want to expand the existing cStor pool capacity, you can expand the size of the cloud disk and reflect the change in the corresponding cStor storage pool. There by the cStor pool capacity can be increased. The steps for doing this activity is documented [here](https://gist.github.com/prateekpandey14/f2a30b3f246fd5b44fdfb545185f78b4).




<h3><a class="anchor" aria-hidden="true" id="expanding-size-of-a-cStor-volume"></a>Expanding the cStor Volume Capacity</h3>


OpenEBS control plane does not support increasing the size of volume seamlessly. Increasing the size of a provisioned volume requires support from Kubernetes kubelet as the existing connection has to be remounted to reflect the new volume size. This can also be tackled with the new CSI plugin where the responsibility of the mount, unmount and remount actions will be held with the vendor CSI plugin rather than the kubelet itself.

OpenEBS team is working on both the CSI plugin as well as the feature to resize the provisioned volume when the PVC is patched for new volume size. Currently this is a manual operation and the steps for expanding the cStor volume is mentioned [here](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_volume_resize.md).



<h3><a class="anchor" aria-hidden="true" id="scaling-up-of-cvr"></a>Scaling up cStor Volume Replica</h3>


This section provide the steps for scaling up the replica of a cStor volume.



<h4><a class="anchor" aria-hidden="true" id="prerequisites-for-cvr-scale-up"></a>Prerequisite for scaling up the replicas of cStor volume</h4>

- A cStor pool should be available and replica of this cStor volume should not be present on this cStor pool.
- OpenEBS version should be 1.3.0 or more.



<h4><a class="anchor" aria-hidden="true" id="overview-scale-up"></a>Overview</h4>

- Get the current replica count of the cStor volume which is mentioned in corresponding StorageClass.
- Find cStor pool(s) where existing cStor volume replica(s) is created.
- Find available cStor pools where new cStor volume replica should be created.
- Verify new cStor Volume Replica(s) is created for the particular volume on the available cStor pool(s). 




<h4><a class="anchor" aria-hidden="true" id="steps-to-perform-scale-up"></a>Steps to perform cStor volume replica scale up:</h4>

1. Get the current replica count of the cStor volume which is mentioned in corresponding StorageClass. Get the StorageClass name using the following command:

   ```
   kubectl get sc
   ```

   Example output:

   <div class="co">
   NAME                        PROVISIONER                                                AGE
   openebs-device              openebs.io/local                                           19m
   openebs-hostpath            openebs.io/local                                           19m
   openebs-jiva-default        openebs.io/provisioner-iscsi                               19m
   openebs-sc-cstor            openebs.io/provisioner-iscsi                               5m24s
   openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   19m
   standard (default)          kubernetes.io/gce-pd     
   </div>

   Perform the following command to get the details of corresponding StorageClass which is used for creating the cStor volume :

   ```
   kubectl get sc openebs-sc-cstor -o yaml
   ```

   In this example, cStor volume is created using this StorageClass `openebs-sc-cstor`.

   Example snippet of output:

   <div class="co">
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     annotations:
       cas.openebs.io/config: |
         - name: StoragePoolClaim
           value: "cstor-disk-pool"
         - name: ReplicaCount
           value: "1"
       kubectl.kubernetes.io/last-applied-configuration: |
         {"apiVersion":"storage.k8s.io/v1","kind":"StorageClass","metadata":{"annotations":{"cas.openebs.io/config":"- name: StoragePoolClaim\n  value: \"cstor-disk-pool\"\n- name: ReplicaCount\n  value: \"1\"\n","openebs.io/cas-type":"cstor"},"name":"openebs-sc-cstor"},"provisioner":"openebs.io/provisioner-iscsi"}
       openebs.io/cas-type: cstor
   </div>

   In the above example snippet, it is showing that current cStor volume replica count is **1**. 

2. Get the PVC details using the following command:

   ```
   kubectl get pvc
   ```

   Example output:

   <div class="co">
   NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
   demo-vol1-claim   Bound    pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8   500Gi      RWO            openebs-sc-cstor   3h18m
   </div>
   
   From the above output, get `VOLUME` name and use in the following command to get the details of corresponding cStor volume. All commands are peformed by considering above PVC.

   Get the details of cStor volume details using the following command:

   ```
   kubectl get cstorvolume -n openebs -l openebs.io/persistent-volume=pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8
   ```

   Example output:

   <div class="co">
   NAME                                       STATUS    AGE   CAPACITY
   pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8   Healthy   20m   500Gi
   </div>

   Get the details of existing cStor Volume Replica details using the following command:  

   ```
   kubectl get cvr -n openebs -l openebs.io/persistent-volume=pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8
   ```

   Example output:

   <div class="co">
   NAME                                                            USED    ALLOCATED   STATUS    AGE
   pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-hgt4   84.6M   2.88M       Healthy   20m
   </div>

3. Perform the following command to get complete details of the existing cStor volume replica:

   ```
   kubectl get cvr pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-hgt4 -n openebs -oyaml
   ```

   Example snippet of output:

   <div class="co">
   apiVersion: openebs.io/v1alpha1
   kind: CStorVolumeReplica
   metadata:
     annotations:
       cstorpool.openebs.io/hostname: gke-ranjith-scaleup-default-pool-48c9bf17-tb7w
       isRestoreVol: "false"
       openebs.io/storage-class-ref: |
         name: openebs-sc-cstor
         resourceVersion: 6080
     creationTimestamp: "2019-11-09T13:38:44Z"
     finalizers:
     - cstorvolumereplica.openebs.io/finalizer
     generation: 2341
     labels:
       cstorpool.openebs.io/name: cstor-disk-pool-hgt4
       cstorpool.openebs.io/uid: ca7b4943-02f4-11ea-b0f6-42010a8000f8
       cstorvolume.openebs.io/name: pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8
       openebs.io/cas-template-name: cstor-volume-create-default-1.4.0
       openebs.io/persistent-volume: pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8
       openebs.io/version: 1.4.0
     name: pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-hgt4
     namespace: openebs
     resourceVersion: "388286"
     selfLink: /apis/openebs.io/v1alpha1/namespaces/openebs/cstorvolumereplicas/pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-hgt4
     uid: 3fab1013-02f6-11ea-b0f6-42010a8000f8
   spec:
     capacity: 500G
     replicaid: C65AE27463F8646017D3F933C204925E
     targetIP: 10.0.59.89
     zvolWorkers: ""
   status:
   </div>
   
   Note down following parameters from the output. This is needed for creating new cStor Volume Replica  in step 7.
   
   - metadata.annotations.openebs.io/storage-class-ref|
   
     name:
   
   - metadata.labels.cstorvolume.openebs.io/name
   
   - metadata.labels.cstorvolume.openebs.io/persistent-volume
   
   - metadata.labels.cstorvolume.openebs.io/version
   
   - metadata.namespace
   
   - spec.capacity
   
   - spec.targetIP
   
   - versionDetails.desired
   
   - versionDetails.status.current

4. Perform the following command to get the cStor Pool where the existing cStor volume replica is created:

   ```
   kubectl get cvr pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-hgt4 -n openebs --show-labels |  awk '{print $6}'  | grep -i cstorpool | awk -F'[, ]' '{print $1}'
   ```

   Example output:

   <div class="co">
   cstorpool.openebs.io/name=cstor-disk-pool-hgt4
   </div>

5. Get the available cStor Pools for creating new cStor volume replica. The following command will get the other associated cStor pools details:

   ```
   kubectl get csp -l openebs.io/storage-pool-claim=cstor-disk-pool | grep -v cstor-disk-pool-hgt4
   ```

   Example output:

   <div class="co">
   NAME                   ALLOCATED   FREE    CAPACITY   STATUS    TYPE      AGE
   cstor-disk-pool-2phf   1.58M       39.7G   39.8G      Healthy   striped   36m
   cstor-disk-pool-zm8l   1.60M       39.7G   39.8G      Healthy   striped   36m
   </div>

   From the above example output, there are 2 cStor pools available, ie: cstor-disk-pool-2phf and cstor-disk-pool-zm8l. So it is possible to scale up the current volume replica count to 3 from 1.
   
   **Note:** If there are no cStor pools available to perform volume replica scale-up , then follow the [steps](#expanding-cStor-pool-to-a-new-node) to create new cStor pool by updating existing SPC configuration.

6. Perform the following command to get the details of the cStor Pool where new replica will be created:

   ```
   kubectl get csp -n openebs cstor-disk-pool-2phf -oyaml
   ```

   Example snippet of output:

   <div class="co">
   apiVersion: openebs.io/v1alpha1
   kind: CStorPool
   metadata:
     annotations:
       openebs.io/csp-lease: '{"holder":"openebs/cstor-disk-pool-2phf-5d68b6b7ff-nbslc","leaderTransition":1}'
     creationTimestamp: "2019-11-09T13:28:17Z"
     generation: 2196
     labels:
       kubernetes.io/hostname: gke-ranjith-scaleup-default-pool-48c9bf17-tjvs
       openebs.io/cas-template-name: cstor-pool-create-default-1.4.0
       openebs.io/cas-type: cstor
       openebs.io/storage-pool-claim: cstor-disk-pool
       openebs.io/version: 1.4.0
     name: cstor-disk-pool-2phf
     ownerReferences:
     - apiVersion: openebs.io/v1alpha1
       blockOwnerDeletion: true
       controller: true
       kind: StoragePoolClaim
       name: cstor-disk-pool
       uid: ca426d23-02f4-11ea-b0f6-42010a8000f8
     resourceVersion: "361683"
     selfLink: /apis/openebs.io/v1alpha1/cstorpools/cstor-disk-pool-2phf
     uid: ca657af1-02f4-11ea-b0f6-42010a8000f8
   </div>

   Note down following parameters from the output. This is needed for creating new cStor Volume Replica  in step 7.

   - metadata.annotations.cstorpool.openebs.io/hostname
   - metadata.labels.cstorpool.openebs.io/name
   - metadata.labels.cstorpool.cstorpool.openebs.io/uid

7. Create a CVR in the cStor pool identified in Step 5. Below is the template to create CVR on the identified cStor pool. The values in the template can be filled from CSP YAML related to identified cStor pool, and other CVRs of the volume.

   ```
   apiVersion: openebs.io/v1alpha1
   kind: CStorVolumeReplica
   metadata:
    annotations:
      cstorpool.openebs.io/hostname: <Kubernetes_nodename>
      isRestoreVol: "false"
      openebs.io/storage-class-ref: |
        name: <storage_class_name>
    finalizers: 
    - cstorvolumereplica.openebs.io/finalizer
    generation: 1
    labels:
      cstorpool.openebs.io/name: <csp_name>
      cstorpool.openebs.io/uid: <csp_uid>
      cstorvolume.openebs.io/name: <cstor_volume_name>
      openebs.io/cas-template-name: <existing-cStor-volume-cas-template>
      openebs.io/persistent-volume: <persistent_volume_name>
      openebs.io/version: <openebs_version>
    name: <cstor_volume_name>-<csp_name>
    namespace: openebs
   spec:
    capacity: <initial_capacity>
    targetIP: <target_service_ip>
    replicaid: "<md5sum_of_pvc_uid_and_csp_uid>"
   status:
    phase: Recreate
   versionDetails:
     autoUpgrade: false
     desired: <existing_cStor_volume_version>
     status:
       current: <existing_cStor_volume_version>
   ```

   - **<Kubernetes_nodename>**: Kubernetes node name where cStor pool exists and new CVR will be created on this Node. This can be obtained from step 6.

   - **<storage_class_name>:** Storageclass name used to create the cStor volume. It is also available in any existing CVR. This can be obtained from step 3.

   - **<csp_name>**:  Identified cStor pool name where new CVR will be created.  This can be obtained from step 6.

   - **<csp_uid>**:  UID of identified cStor pool name where new CVR will be created.  This can be obtained from step 6.

   - **<persistent_volume_name>**:  Kubernetes Persistent Volume name of the corresponding cStor volume. This can be obtained from step 3.

   - **<openebs_version>**:  Version of OpenEBS on which this volume exist. This can be obtained from step 3.

   - **<cstor_volume_name>**: Name of cStor volume. This can be get from step 3.

   - **<cstor_volume_name>-<csp_name>**:  This is the newe CVR name which is going to be created. This should be named as a combination of particular cStor volume name and identified cStor pool name. This can be get from step 3 and step 6.

   - **<initial_capacity>**:  Capacity of the cStor volume. This can be get from step 3.

   - **<target_service_ip>**:  `Targetip` of corresponding cStor volume. This can be get from step 3.

   - **<md5sum_of_pvc_uid_and_csp_uid>**:  It is the unique value referred to as  `replicaid` in the whole cluster.  This can be generated by running the following command:

     ```
     echo -n "<pvc-uid>-<csp-uid>" | md5sum | awk '{print toupper($1)}'
     ```

     Example command:

     ```
     echo -n "3f86fcdf-02f6-11ea-b0f6-42010a8000f8-ca657af1-02f4-11ea-b0f6-42010a8000f8" | md5sum | awk '{print toupper($1)}'
     ```

     In the above example pvc-uid is `3f86fcdf-02f6-11ea-b0f6-42010a8000f8` and `csp-uid` of identified cStor pool is `ca657af1-02f4-11ea-b0f6-42010a8000f8`

     Example output:

     <div class="co">113EB77418E30B1A3DA0D9374C4E943C
     </div>

     Example snippet of filled CVR YAML spec looks like below. :

     ```
     apiVersion: openebs.io/v1alpha1
     kind: CStorVolumeReplica
     metadata:
       annotations:
         cstorpool.openebs.io/hostname: gke-ranjith-scaleup-default-pool-48c9bf17-tjvs
         isRestoreVol: "false"
         openebs.io/storage-class-ref: |
           name: openebs-sc-cstor
       finalizers:
       - cstorvolumereplica.openebs.io/finalizer
       generation: 1
       labels:
         cstorpool.openebs.io/name: cstor-disk-pool-2phf
         cstorpool.openebs.io/uid: ca657af1-02f4-11ea-b0f6-42010a8000f8
         cstorvolume.openebs.io/name: pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8
         openebs.io/cas-template-name: cstor-volume-create-default-1.4.0
         openebs.io/persistent-volume: pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8
         openebs.io/version: 1.4.0
       name: pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-2phf
       namespace: openebs
     spec:
       capacity: 500Gi
       targetIP: 10.0.59.89
       replicaid: "113EB77418E30B1A3DA0D9374C4E943C"
     status:
       phase: Recreate
     versionDetails:
       autoUpgrade: false
       desired: 1.4.0
       status:
         current: 1.4.0
     ```

   In this example, CVR YAML spec is saved as `CVR2.yaml` .

8. Apply the updated CVR YAML spec to create the new replica of cStor volume using the following command:

   ```
   kubectl apply -f cvr2.yaml
   ```

   Example output:

   <div class="co">cstorvolumereplica.openebs.io/pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-2phf created
   </div>

9. Verify if new CVR is created successfully using the following command:

   ```
   kubectl get cvr -n openebs
   ```

   Example output:

   <div class="co">
   NAME                                                            USED   ALLOCATED   STATUS    AGE
   pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-2phf   6K     6K          Offline   32s
   pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-hgt4   158M   3.41M       Healthy   4h
   </div>

   From above output, new replica of the cStor volume is created and `STATUS` is showing as `Offline`. 

10. Update `Desired Replication Factor` in cStor volume with new replica count. This can be updated by editing corresponding cStor volume CR YAML.

    ```
    kubectl edit cstorvolume pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8 -n openebs
    ```

    The following is the snippet of updated cStor volume CR YAML:

    <div class="co">
    spec:
      capacity: 500Gi
      consistencyFactor: 1
      desiredReplicationFactor: 2
      iqn: iqn.2016-09.com.openebs.cstor:pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8
      nodeBase: iqn.2016-09.com.openebs.cstor
      replicaDetails:
        knownReplicas:
          C65AE27463F8646017D3F933C204925E: "11298477277091074483"
      replicationFactor: 1
    </div>

    In the above snippet, `desiredReplicationFactor` is updated to 2 from 1.
      Example output:

    <div class="co">
    cstorvolume.openebs.io/pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8 edited
    </div>

11. Verify if the rebuilding has started on new replica of the cStor volume. Once rebuilding has completed, it will update its `STATUS` as `Healthy`. Get the latest status of the CVRs using the folloiwng command:

    ```
    kubectl get cvr -n openebs
    ```

    Example output:

    <div class="co">
    NAME                                                            USED   ALLOCATED   STATUS    AGE
    pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-2phf   158M   3.40M       Healthy   8m13s
    pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8-cstor-disk-pool-hgt4   158M   3.41M       Healthy   4h7m
    </div>

12. Once the new replica of the cStor volume is in `Healthy ` state, check the following parameters of the cStor volume to ensure that details are updated properly. 
    
    - consistencyFactor
    - desiredReplicationFactor
    - spec.replicaDetails.knownReplicas
    - spec.replicationFactor
    - status.replicaDetails.knownReplicas
    - status.replicaStatuses
    
    The following command will get the details of cStor volume.

    ```
    kubectl describe cstorvolume cstorvolume pvc-3f86fcdf-02f6-11ea-b0f6-42010a8000f8 -n openebs
    ```
    
    Example snippet:
    
    <div class="co">
    API Version:  openebs.io/v1alpha1
    Kind:         CStorVolume
    ...
    ...

    Spec:
      Capacity:                    500G
      Consistency Factor:          2
      Desired Replication Factor:  2
      Replication Factor:          2
    ...
    ...

    Status:
      Capacity:              500G
      Phase:                 Healthy
      Replica Details:
        Known Replicas:
          C65AE27463F8646017D3F933C204925E: 11298477277091074483
          113EB77418E30B1A3DA0D9374C4E943C: 14689006053351698479
    ...
    ...
    </div>
    
    In the above snippet, `Consistency Factor` and `Replication Factor` is automatically updated and new replica is added under `Known Replicas` field.



<h3><a class="anchor" aria-hidden="true" id="scaling-down-of-cstor-volume-replica"></a>Scaling down cStor Volume Replica</h3>


This section provide the steps for scaling down the replica of a cStor volume.

<h4><a class="anchor" aria-hidden="true" id="prerequisites-cstor-scale-down"></a>Prerequisites</h4>

- All the other cStor volume replicas(CVR) should be in `Healthy` state except the cStor volume replica that is going to deleted(i.e deleting CVR can be in any state).

- There shouldn't be any ongoing scaleup process. Verify that `replicationFactor` should be equal to the `desiredReplicationFactor` from corresponding cStor volume CR specification. 

**Notes to remember:**

- Scaling down one replica at a time is recommended. This means, only one replica at a time should be removed.

<h4><a class="anchor" aria-hidden="true" id="Overview-scale-down"></a>Overview</h4>

- Get the details of corresponding cStor volume.
- Identify the replica of the cStor volume which needs to be removed.
- Modify the cStor volume specification with required change.
- Verify that the identified volume replica is removed successfully.
- Delete the CVR corresponding to the replicaID entry which was removed from cStor volume.

<h4><a class="anchor" aria-hidden="true" id="steps-cstor-scale-down"></a>Steps to perform scaling down of cStor volume replica</h4>

1. Perform the following command to get the details of PVC:
   ```
   kubectl get pvc
   ```
  
   From the output of above command, get `VOLUME` name and use in the following command to get the details of corresponding cStor volume. All commands are peformed by considering above PVC. 
  
   ```
   kubectl get cstorvolume -n openebs -l openebs.io/persistent-volume=pvc-ed6e893a-051d-11ea-a786-42010a8001c9
   ```
  
   Example output:
  
   <div class="co">
   NAME                                       STATUS    AGE    CAPACITY
   pvc-ed6e893a-051d-11ea-a786-42010a8001c9   Healthy   8m9s   500Gi
   </div>
  
   Perform the following command to get the details of the replicas of corresponding cStor volume:
   
   ```
   kubectl get cvr -n openebs -l openebs.io/persistent-volume=pvc-ed6e893a-051d-11ea-a786-42010a8001c9
   ```
  
   Example output:
  
   <div class="co">
   NAME                                                            USED    ALLOCATED   STATUS       AGE
   pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-c0tw   37.5M   2.57M       Healthy      8m16s
   pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-eav6   37.4M   2.57M       Healthy      8m16s
   pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-zcn7   37.4M   2.58M       Healthy      8m16s
   </div>
  
2. Identify the cStor volume replica from above output which needs to be removed. Then, perform the following command to get the `replicaid` of the corresponding cStor volume replica. In this example, identified cStor volume replica is `pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-c0tw`. 
  
   ```
   kubectl get cvr pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-c0tw -n openebs -oyaml | grep -i replicaid
   ```
  
   Example snippet:
  
   <div class="co">
     replicaid: 4858867E8F150C533A2CF30A5D5FD8C6
   </div>
   
   From the above output, `replicaid` of the identified cStor volume replica is `4858867E8F150C533A2CF30A5D5FD8C6`.
   
3. Modify the corresponding cStor volume specification to remove the identified cStor volume replica and update the `desiredReplicationFactor`. The cStor volume can be edited by using the following command:

   ```
   kubectl edit cstorvolume pvc-ed6e893a-051d-11ea-a786-42010a8001c9 -n openebs
   ```
  
   The following are the items need to be updated if you are scaling down the replica count from 3 to 2.
   
   In the below snippet, `desiredReplicationFactor` is updated to `2` from `3` and removed the `replicaid` entry of the identified volume replica `4858867E8F150C533A2CF30A5D5FD8C6` from `spec.replicaDetails.knownReplicas`. 
  
   Example snippet:
  
   <div class="co">
   spec:
     capacity: 500Gi
     consistencyFactor: 2
     desiredReplicationFactor: 2
     iqn: iqn.2016-09.com.openebs.cstor:pvc-ed6e893a-051d-11ea-a786-42010a8001c9
     nodeBase: iqn.2016-09.com.openebs.cstor
     replicaDetails:
       knownReplicas:
         2E93FCD50CFA2A0502BE29FF397FA661: "8687568470394952308"
         6E1C5FD9EC9C084234C440873D256E93: "7318762175148076215"
     replicationFactor: 3
     status: Init
     targetIP: 10.0.70.44
     targetPort: "3260"
     targetPortal: 10.0.70.44:3260
   status:
     capacity: 500Gi
     lastTransitionTime: "2019-11-12T07:32:38Z"
     lastUpdateTime: "2019-11-12T07:48:08Z"
     phase: Healthy
     replicaDetails:
       knownReplicas:
         2E93FCD50CFA2A0502BE29FF397FA661: "8687568470394952308"
         6E1C5FD9EC9C084234C440873D256E93: "7318762175148076215"
         4858867E8F150C533A2CF30A5D5FD8C6: "3588528959973203834"    
   </div>
  
4. Verify that the identified replica has been removed from the cStor volume. The following section can be checked to verify the updated details and removal event messages of the cStor volume.
   
   Removal event message can be checked by describe the corresponding cStor volume using the following command:
   
   ```
   kubectl describe cstorvolume pvc-ed6e893a-051d-11ea-a786-42010a8001c9 -n openebs
   ```
   
   Example snippet of output:
   
   <div class="co">
   Normal   Healthy     18m                pvc-ed6e893a-051d-11ea-a786-42010a8001c9-target-58d76bdbd-95hdh, gke-ranjith-scaledown-default-pool-0dece219-jt3d  Volume is in Healthy state
   Warning  FailUpdate  92s (x4 over 22m)  pvc-ed6e893a-051d-11ea-a786-42010a8001c9-target-58d76bdbd-95hdh, gke-ranjith-scaledown-default-pool-0dece219-jt3d  Ignoring changes on volume pvc-ed6e893a-051d-11ea-a786-42010a8001c9
   Normal   Updated     92s                pvc-ed6e893a-051d-11ea-a786-42010a8001c9-target-58d76bdbd-95hdh, gke-ranjith-scaledown-default-pool-0dece219-jt3d  Successfully updated the desiredReplicationFactor to 2
   </div>
  
   Verify the updated details of cStor volume using the following command:
  
   ```
   kubectl get cstorvolume pvc-ed6e893a-051d-11ea-a786-42010a8001c9 -n openebs -oyaml
   ```
  
   Example snippet of output:
  
   <div class="co">
   spec:
     capacity: 500Gi
     consistencyFactor: 2
     desiredReplicationFactor: 2
     iqn: iqn.2016-09.com.openebs.cstor:pvc-ed6e893a-051d-11ea-a786-42010a8001c9
     nodeBase: iqn.2016-09.com.openebs.cstor
     replicaDetails:
       knownReplicas:
         2E93FCD50CFA2A0502BE29FF397FA661: "8687568470394952308"
         6E1C5FD9EC9C084234C440873D256E93: "7318762175148076215"
     replicationFactor: 2
     status: Init
     targetIP: 10.0.70.44
     targetPort: "3260"
     targetPortal: 10.0.70.44:3260
   status:
     capacity: 500Gi
     lastTransitionTime: "2019-11-12T07:32:38Z"
     lastUpdateTime: "2019-11-12T07:49:38Z"
     phase: Healthy
     replicaDetails:
       knownReplicas:
         2E93FCD50CFA2A0502BE29FF397FA661: "8687568470394952308"
         6E1C5FD9EC9C084234C440873D256E93: "7318762175148076215"
     replicaStatuses:
   </div>
  
   From the output, the following values are auto updated:
   
   - replicationFactor : It is updated to 2.
   
   - status.replicaDetails.knownReplicas :  The `replicaid` entry of identified CVR is removed.
   
   The status of CVRs corresponding to the cStor volume can be obtained by running the following command:
  
   ```
   kubectl get cvr -n openebs -l openebs.io/persistent-volume=pvc-ed6e893a-051d-11ea-a786-42010a8001c9
   ```
  
   Example output:
  
   <div class="co">
   NAME                                                            USED    ALLOCATED   STATUS    AGE
   pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-c0tw   58.6M   2.81M       Offline   22m
   pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-eav6   59.5M   2.81M       Healthy   22m
   pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-zcn7   59.5M   2.81M       Healthy   22m
   </div>

   From above output, identified CVR status is changed to `Offline`. 

5. Delete the identified CVR which was removed from cStor volume using the following command:
  
   ```
   kubectl delete cvr pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-c0tw -n openebs
   ```
   
   Example output:
  
   <div class="co">
   cstorvolumereplica.openebs.io "pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-c0tw" deleted
   </div> 
  
   Get the latest CVR details of corresponding cStor volume using the following command:
  
   ```
   kubectl get cvr -n openebs -l openebs.io/persistent-volume=pvc-ed6e893a-051d-11ea-a786-42010a8001c9
   ```
  
   Example output:
   
   <div class="co">
   NAME                                                            USED    ALLOCATED   STATUS    AGE
   pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-eav6   61.8M   2.84M       Healthy   23m
   pvc-ed6e893a-051d-11ea-a786-42010a8001c9-cstor-disk-pool-zcn7   61.9M   2.84M       Healthy   23m
   </div>

<br>

## See Also:


### [Understand cStorPools ](/v200/docs/next/cstor.html#cstor-pools)

### [cStorPool use case for Prometheus](/v200/docs/next/prometheus.html)



### [cStor roadmap](/v200/docs/next/cstor.html#cstor-roadmap)


<br>

