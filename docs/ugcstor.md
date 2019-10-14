---
id: ugcstor
title: cStor User Guide
sidebar_label: cStor
---
------

<br>

<img src="/docs/assets/svg/3-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>

This user guide section provides the operations need to performed by the User and the Admin for configuring cStor related tasks. 

<font size="5">User operations</font>

[Provisioning a cStor volume](#provisioning-a-cStor-volume)

[Monitoring a cStor Volume](#monitoring-a-cStor-Volume)

[Backup and Restore](#backup-and-restore)

[Snapshot and Clone of a cStor Volume](#snapshot-and-clone-of-a-cStor-volume)

[Upgrading the software version of a cStor volume](#Upgrading-the-software-version-of-a-cStor-volume)


[Provisioning sample application with cStor](#Provisioning-sample-application-with-cstor)

[Deleting a cStor Volume](#deleting-a-cStor-volume)

[Patching pool deployment by adding or modifying resource limit and requests](#patching-pool-deployment-resource-limit)



<font size="5">Admin operations</font>

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



<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations</h2>
<h3><a class="anchor" aria-hidden="true" id="provisioning-a-cStor-volume"></a>Provisioning a cStor volume</h3>
For provisioning a cStor Volume, it requires a cStor Storage Pool and a StorageClass. The configuration and verification of a cStor Storage pool can be checked from [here](#creating-cStor-storage-pools). The configuration and verification of a StorageClass can be checked from [here](#creating-cStor-storage-class).

Use a similar PVC spec or volumeClaimTemplate to use a StorageClass that is pointing to a pool with real disks. Consider the following parameters while provisioning OpenEBS volumes on real disks.

**AccessModes:** cStor provides iSCSI targets, which are appropriate for RWO (ReadWriteOnce) access mode and is suitable for all types of databases. For webscale applications like WordPress or any for any other NFS needs, you need RWM (ReadWriteMany) access mode. For RWM, you need NFS provisioner to be deployed along with cStor. See how to provision <a href="/docs/next/rwm.html" target="_blank">RWM PVC with OpenEBS </a>.

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

<h4><a class="anchor" aria-hidden="true" id="prerequisties-bkp-restore"></a>Prerequisites</h3>

- Latest tested Velero version is 1.0.0.
- Create required storage provider configuration to store the backup.
- Create required OpenEBS storage pools and storage classes on destination cluster.
- Add a common label to all the resources associated to the application that you want to backup. For example, add an application label selector in associated components such as PVC,SVC etc.

<h4><a class="anchor" aria-hidden="true" id="install-velero"></a>Install Velero (Formerly known as ARK)</h3>

Follow the instructions at [Velero documentation](<https://velero.io/docs/v1.0.0/>) to install and configure Velero. 

<h4><a class="anchor" aria-hidden="true" id="steps-for-backup"></a>Steps for Backup</h3>

Velero is a utility to back up and restore your Kubernetes resource and persistent volumes.

To do backup/restore of OpenEBS cStor volumes through Velero utility, you need to install and configure OpenEBS velero-plugin. If you are using OpenEBS velero-plugin then `velero backup` command invokes velero-plugin internally and takes a snapshot of cStor volume data and send it to remote storage location as mentioned in `06-volumesnapshotlocation.yaml`.  The configuration of `06-volumesnapshotlocation.yaml` can be  done in the next section.

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

**Note**: `SNAPSHOT_LOCATION` should be the same as you configured in the  `06-volumesnapshotlocation.yaml`. You can use `--selector` as a flag in backup command  to filter specific resources or use a combo of `--include-namespaces` and `--exclude-resources` to exclude specific resources in the specified namespace. More details can be read from [here](https://heptio.github.io/velero/v0.11.0/api-types/backup.html).

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

**Note:** After restoring, you need to set `targetip` for the volume in pool pod.  Target IP of the PVC can be find from running the following command.

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

After executing the above command, exit from the container session.

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
The steps are mentioned in Upgrade section. For upgrading cStorVolume, ensure that cStor Pool image is support this cStor volume image.  It should also recommended to upgrade the corresponding pool before upgrading cStor volume. The steps for upgrading the cStor volume can be find from [here](/docs/next/upgrade.html).

<h3><a class="anchor" aria-hidden="true" id="Provisioning-sample-application-with-cstor"></a>Provisioning sample application with cStor</h3>
<br>
Before provisioning an application ensure that the following steps are completed.
<ol>
<li>
Ensure the blockdevices are mounted as per requirement. 
To know more about blockdevices mount status <a href="/docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume" target="_blank">click here</a>.
</li>
<li>
<b>Create StoragePool</b> specifying the Blockdevices that are to be used.
To know the detailed steps for creation of StoragePool <a href="/docs/next/ugcstor.html#creating-cStor-storage-pools" target="_blank">click here.</a>
The name specified under `metadata` in the <b>StoragePoolClaim</b> YAML needs to be mentioned in StorageClass YAML (in the next step).
</blockquote>
</li>
<li>
Next, you have to <b>create StorageClass</b>, specifying the `StoragePoolClaim` under `annotations` in the <b>StorageClass</b> YAML.
To know the step-wise procedure for creation of StorageClass <a href="/docs/next/ugcstor.html#creating-cStor-storage-class" target="_blank">click here</a>.
</li>
<li>
Once all the above steps have been successfully  implemented copy the following YAML into a file, say <b>demo-busybox-cstor.yaml</b>. You can  specify StorageClass specified in previous step under spec in <b>PersistentVolumeClaim</b> YAML. In this example, StorageClass name is `openebs-sc-statefulset`.
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
  labels:
    "volumeprovisioner.mapi.openebs.io/replica-topology-key-domain": "failure-domain.bethttps://docs.google.com/document/d/1SuIH4YxdyZm-8A3nzYtiyWW_w4TIPVWEhLsAMpDUA5E/edit?usp=sharinga.kubernetes.io"
    "volumeprovisioner.mapi.openebs.io/replica-topology-key-type": "zone"
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
To <b>verify</b> whether the application is successfully deployed or not, execute the following command:<br>

```
kubectl get pods 
```

The application pods should be running state. The output would look something like this,

```
NAME                       READY   STATUS    RESTARTS   AGE
busybox-66db7d9b88-kkktl   1/1     Running   0          2m16s
``` 
</li>
</ol>
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
NAME                                           NODENAME                                     SIZE          CLAIMSTATE   STATUS   AGE
blockdevice-1c10eb1bb14c94f02a00373f2fa09b93   gke-ranjith-doc-default-pool-d42b4f66-f4h9   42949672960   Unclaimed    Active   2h
blockdevice-77f834edba45b03318d9de5b79af0734   gke-ranjith-doc-default-pool-d42b4f66-657s   42949672960   Unclaimed    Active   2h
blockdevice-936911c5c9b0218ed59e64009cc83c8f   gke-ranjith-doc-default-pool-d42b4f66-2xjl   42949672960   Unclaimed    Active   2h
sparse-594e4d85702609036152811ba95b0c79        gke-ranjith-doc-default-pool-d42b4f66-2xjl   10737418240   Unclaimed    Active   2h
sparse-8ed8e05ac4d94f987f66109830a26923        gke-ranjith-doc-default-pool-d42b4f66-657s   10737418240   Unclaimed    Active   2h
sparse-f560ead09869a194dbc84e3653b07d7b        gke-ranjith-doc-default-pool-d42b4f66-f4h9   10737418240   Unclaimed    Active   2h </div>

The details of blockdevice can be get using the following command. 

```
 kubectl describe blockdevice <blockdevicename> -n <openebs_namespace>
```

Example:

```
kubectl describe blockdevice blockdevice-77f834edba45b03318d9de5b79af0734 -n openebs 
```

From the output, you will get the hostname and other blockdevice details such as State,Path,Claim State,Capacity etc.

**Note:** Identify block devices which are unclaimed, unmounted on node and does not contain any filesystem. The above command will help to find these information. More information about the disk mount status on node can be read from [here](/docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume).

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
    - blockdevice-936911c5c9b0218ed59e64009cc83c8f
    - blockdevice-77f834edba45b03318d9de5b79af0734
    - blockdevice-1c10eb1bb14c94f02a00373f2fa09b93
---
```

In the above file, change the following parameters as required.

- `poolType`

  This field  represents how the data will be written to the disks on a given pool instance on a node. Supported values are `striped`, `mirrored`, `raidz` and `raidz2`.

  Note: In OpenEBS, the pool instance does not extend beyond a node. The replication happens at volume level but not at the pool level. See [volumes and pools relationship](/docs/next/cstor.html#relationship-between-cstor-volumes-and-cstor-pools) in cStor for a deeper understanding.

- `blockDeviceList`

  Select the list of selected unclaimed blockDevice CRs which are unmounted and does not contain a filesystem in each participating nodes and enter them under `blockDeviceList`. 

  To get the list of blockDevice CRs, use `kubectl get blockdevice -n openebs`. 

  You must enter all selected blockDevice CRs manually together from the selected nodes. 

  When the `poolType` = `mirrored` , ensure the blockDevice CRs selected from each node are in even number.  The data is striped across mirrors. For example, if 4x1TB blockDevice are selected on `node1`, the raw capacity of the pool instance of `cstor-disk-pool` on `node1` is 2TB. 

  When the `poolType` = `striped` the number of blockDevice CRs from each node can be in any number, the data is striped across each blockDevice. For example, if 4x1TB blockDevices are selected on `node1`, the raw capacity of the pool instance of `cstor-disk-pool` on that `node1` is 4TB. 

  When the `poolType` = `raidz`, ensure that the number of  blockDevice CRs selected from each node are like 3,5,7 etc. The data is written with parity. For example, if 3x1TB blockDevice are selected on node1, the raw capacity of the pool instance of `cstor-disk-pool` on node1 is 2TB. 1 disk will be used as a parity disk.
  
  When the `poolType` = `raidz2`, ensure that the number of  blockDevice CRs selected from each node are like 6,8,10 etc. The data is written with dual parity. For example, if 6x1TB blockDevice are selected on node1, the raw capacity of the pool instance of `cstor-disk-pool` on node1 is 4TB. 2 disks will be used for parity.
  
  
  
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

**Note:** The cStor pool can be horizontally scale up on new OpenEBS Node by editing  the corresponding pool configuration YAML with the new disks name under `blockDeviceList` . More details can be found [here](/docs/next/ugcstor.html#expanding-cStor-pool-to-a-new-node).  If you find any issues, check common issues added in [troubleshooting](/docs/next/troubleshooting.html) section.

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
provisioner: openebs.io/provisioner-iscsi
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
provisioner: openebs.io/provisioner-iscsi
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

| cStor Storage Policy                                         | Mandatory | Default                                 | Purpose                                                      |
| ------------------------------------------------------------ | --------- | --------------------------------------- | ------------------------------------------------------------ |
| [ReplicaCount](#Replica-Count-Policy)                        | No        | 3                                       | Defines the number of cStor volume replicas                  |
| [VolumeControllerImage](#Volume-Controller-Image-Policy)     |           | quay.io/openebs/cstor-volume-mgmt:1.2.0 | Dedicated side car for command management like taking snapshots etc. Can be used to apply a specific issue or feature for the workload |
| [VolumeTargetImage](#Volume-Target-Image-Policy)             |           | value:quay.io/openebs/cstor-istgt:1.2.0 | iSCSI protocol stack dedicated to the workload. Can be used to apply a specific issue or feature for the workload |
| [StoragePoolClaim](#Storage-Pool-Claim-Policy)               | Yes       | N/A (a valid pool must be provided)     | The cStorPool on which the volume replicas should be provisioned |
| [VolumeMonitor](#Volume-Monitor-Policy)                      |           | ON                                      | When ON, a volume exporter sidecar is launched to export Prometheus metrics. |
| [VolumeMonitorImage](#Volume-Monitoring-Image-Policy)        |           | quay.io/openebs/m-exporter:1.2.0        | Used when VolumeMonitor is ON. A dedicated metrics exporter to the workload. Can be used to apply a specific issue or feature for the workload |
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
provisioner: openebs.io/provisioner-iscsi
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
        value: quay.io/openebs/cstor-volume-mgmt:1.2.0
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
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
        value:quay.io/openebs/cstor-istgt:1.2.0
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
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
provisioner: openebs.io/provisioner-iscsi
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
provisioner: openebs.io/provisioner-iscsi
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
        value: quay.io/openebs/m-exporter:1.2.0
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
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
provisioner: openebs.io/provisioner-iscsi
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
provisioner: openebs.io/provisioner-iscsi
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
provisioner: openebs.io/provisioner-iscsi
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
  annotations:
    cas.openebs.io/config: |
      - name:  AuxResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 100m
    openebs.io/cas-type: cstor
provisioner: openebs.io/provisioner-iscsi
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
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Target-Affinity-Policy"></a>Target Affinity Policy</h4>
The StatefulSet workloads access the OpenEBS storage volume  by connecting to the Volume Target Pod. This policy can be used to co-locate volume target pod on the same node as workload.

The configuration for implementing this policy is different for deployment and StatefulSet applications.

<h5><a class="anchor" aria-hidden="true" id="for-statefulset-applications"></a>For StatefulSet Applications</h5>
In the case of provisioning StatfulSet applications with replication factor of  greater than "1" and volume replication factor of euqal to "1", for a given OpenEBS volume, target and replica related to that volume should be scheduled on the same node where the application resides. This feature can be achieved by using either of the following approaches.

**Approach 1:**

In this approach, modification is required on StatefulSet spec and corresponding StorageClass being referred in the StatefulSet spec. Add openebs.io/sts-target-affinity: <metadata.name of STS> label in StatefulSet spec to the following fields.

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
  name: openebs-cstor-perf
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
The steps for upgrading cStor Pool is mentioned in Upgrade section. Refer [Upgrade](/docs/next/upgrade.html) section for more details.


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
If you are following this approach, you should have created cStor Pool initially using the steps provided [here](/docs/next/ugcstor.html#creating-cStor-storage-pools). For expanding pool onto a new OpenEBS node, you have to edit corresponding pool configuration(SPC) YAML with the required block device names under the `blockDeviceList` .

**Step 1:** Edit the existing pool configuration spec that you originally used and apply it (OR) directly edit the in-use spec file using `kubectl edit spc <SPC Name>`.

**Step 2:** Add the new disks names from the new Nodes under the `blockDeviceList` . You can use `kubectl get blockdevice -n <openebs_namespace>`to obtains the disk CRs.

**Step 3:** Apply or save the configuration file and a new cStorPool instance will be created on the expected node.

**Step 4:** Verify the new pool creation by checking

- If a new cStor Pool POD is created (`kubectl get pods -n openebs | grep <pool name>`)
- If a new cStorPool CR is created (`kubectl get csp`)



<h3><a class="anchor" aria-hidden="true" id="expanding-size-of-a-cStor-pool-instance-on-a-node-add-disk"></a>Expanding Size of a cStor Pool Instance on a Node (by adding physical/virtual disks to a pool instance)</h3>
A pool instance is local to a node. A pool instance can be started with as small as one disk (in `striped` mode) or two disks (in `mirrored`) mode. cStor pool instances support thin provisioning of data, which means that provisioning of any volume size will be successful from a given cstorPool config.

However, as the actual used capacity of the pool is utilized, more disks need to be added. Currently the steps for adding more disks to the existing pool is done through manual operations.You can add more disks to the existing StoragePool with the steps provide [here](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_add_disks_to_spc.md). 



<h3><a class="anchor" aria-hidden="true" id="expanding-size-of-a-cStor-pool-instance-on-a-node-add"></a>Expanding size of a cStor Pool Instance on a Node (by expanding the size of cloud disks)</h3>
When you have a cloud disk and which is used for the creation of cStor Storage pool and when you want to expand the existing cStor pool capacity, you can expand the size of the cloud disk and reflect the change in the corresponding cStor storage pool. There by the cStor pool capacity can be increased. The steps for doing this activity is documented [here](https://gist.github.com/prateekpandey14/f2a30b3f246fd5b44fdfb545185f78b4).


<h3><a class="anchor" aria-hidden="true" id="expanding-size-of-a-cStor-volume"></a>Expanding the cStor Volume Capacity</h3>
OpenEBS control plane does not support increasing the size of volume seamlessly. Increasing the size of a provisioned volume requires support from Kubernetes kubelet as the existing connection has to be remounted to reflect the new volume size. This can also be tackled with the new CSI plugin where the responsibility of the mount, unmount and remount actions will be held with the vendor CSI plugin rather than the kubelet itself.

OpenEBS team is working on both the CSI plugin as well as the feature to resize the provisioned volume when the PVC is patched for new volume size. Currently this is a manual operation and the steps for expanding the cStor volume is mentioned [here](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_volume_resize.md).

<br>

## See Also:



### [Understand cStorPools ](/docs/next/cstor.html#cstor-pools)

### [cStorPool use case for Prometheus](/docs/next/prometheus.html)

### [cStor roadmap](/docs/next/cstor.html#cstor-roadmap)


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
