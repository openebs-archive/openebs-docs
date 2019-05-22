---
id: backup
title: Backup and Restore of OpenEBS volumes
sidebar_label: Backup and Restore
---
------

This document contains quick reference of the installation steps for both OpenEBS and heptio Ark which can be used for taking backup of OpenEBS volumes and then restoration of the data whenever it needed.



<img src="/docs/assets/ark-openebs.png" alt="drawing" width="800"/>



## Prerequisites



- Mount propagation feature has to be enabled on Kubernetes, otherwise the data written from the pods
  will not visible in the restic daemonset pod on the same node.
  
- Latest tested Velero version is 0.11.0.
  
- Create required storage provider configuration to store the backup data.

- Create required OpenEBS storage pools and  storage classes .

  

## Install Velero (Formerly known as ARK)

Follow the instructions at <a href="https://heptio.github.io/velero/v0.10.0/" target="_blank">Velero documentation</a> to install and configure Velero. 

The helm chart is available at<a href="https://github.com/helm/charts/tree/master/stable/ark" target="_blank">https://github.com/helm/charts/tree/master/stable/ark</a>  

At the end of Velero setup, Restic will be successfully running and ready for taking backup of any application. 

## Steps for backup

If you have configured Velero with restic then `velero backup` command invokes restic internally and copies the data from the given application including the entire data from the associated persistent volumes in that application and backs it up to the configured storage location such as S3 or <a href="/docs/next/minio.html" target="_blank">Minio</a>. 

If you are using OpenEBS velero-plugin then `velero backup` command invokes velero-plugin internally and takes a snapshot of CStor volume data and send it to remote storage location as mentioned in  *volumesnapshotlocation*.

<h3><a class="anchor" aria-hidden="true" id="Configure-Volumesnapshotlocation"></a>Configure Volumesnapshotlocation</h3>

To take a backup of CStor volume through Velero, configure `VolumeSnapshotLocation` with provider `openebs.io/cstor-blockstore`. Sample YAML file for volumesnapshotlocation can be found at `example/06-volumesnapshotlocation.yaml` from the clone repo.

```
spec:
  provider: openebs.io/cstor-blockstore
  config:
    bucket: <YOUR_BUCKET>
    prefix: <PREFIX_FOR_BACKUP_NAME>
    provider: <GCP_OR_AWS>
    region: <AWS_REGION>
```

You can configure a backup storage location(`BackupStorageLocation`) in similar way. Currently supported volumesnapshotlocations for velero-plugin are AWS and GCP.

<h3><a class="anchor" aria-hidden="true" id="Managing-backups"></a>Managing Backups</h3>

Take the backup using the below command.

```
velero backup create <backup-name> -l app=<app-label-selector> --snapshot-volumes --volume-snapshot-locations=<SNAPSHOT_LOCATION>
```

**Note**: `SNAPSHOT_LOCATION` should be the same as you configured by using `example/06-volumesnapshotlocation.yaml`.

Verify if backup is taken successfully by using following command.

```
velero backup describe bbb-01
```

Once the backup is completed you should see the backup marked as `Completed`.



## Steps for Restore

Velero backup can be restored onto a new cluster or to the same cluster. An OpenEBS PVC *with the same name as the original PVC* needs to be created and made available before the restore command is performed. The target cluster OpenEBS EBS PVC can be from a different StorageClass and cStorPool, but only the PVC name has to be same.

If you are doing restore of CStor volume using OpenEBS velero-plugin, then you must need to create the same namespace and StorageClass configuration of the source PVC first in your target cluster.

On the target cluster, restore the application using the below command

```
velero restore create <restore-name> --from-backup <backup-name> -restore-volumes=true -l app=<app-label-selector> 
```

With above command, plugin will create a CStor volume and the data from backup will be restored on this newly created volume.

**Note**: You need to mention `--restore-volumes=true` while doing a restore.

Verify if restore is taken successfully by using following command.

```
velero restore describe <restore-name> --volume-details
```

Once the restore is completed to the PVC, attach the PVC to the target application. 

If you are doing restore with Velero-plugin then after restore, you need to update the target ip for CVR.

**Note:** After restore is completed, you need to set `targetip` for the volume in pool pod. Steps to update targetip is as follow:

```
1. kubectl exec -it <POOL_POD> -c cstor-pool -n openebs -- bash
2. zfs set io.openebs:targetip=<PVC SERVICE IP> <POOL_NAME/VOLUME_NAME>
```



## Scheduling backups

Using `velero schedule` command, periodic backups are taken. 

In case of velero-plugin, this periodic backups are incremental backups which saves storage space and backup time. To restore periodic backup with velero-plugin, refer [here](https://github.com/openebs/velero-plugin/blob/v0.9.x/README.md) for more details. The following command will schedule the backup as per the cron time mentioned .

```
velero schedule create <backup-schedule-name> --schedule "0 * * * *" --snapshot-volumes volume-snapshot-locations=<SNAPSHOT_LOCATION> -l app=<app-label-selector>
```

`SNAPSHOT_LOCATION` should be the same as you configured by using `example/06-volumesnapshotlocation.yaml`

Get the details of backup using the following command

```
velero backup get
```

During the first backup iteration of a schedule, full data of the volume will be backed up. For later backup iterations of a schedule, only modified or new data from the previous iteration will be backed up.

<h3><a class="anchor" aria-hidden="true" id="To-restore-from-a-schedule"></a>Restore from a schedule</h3>

Since backups taken are incremental for a schedule, order of restoring data is important. You need to restore data in the order of the backups created.

For example, below are the available backups for a schedule:

```
NAME                   STATUS      CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
sched-20190513104034   Completed   2019-05-13 16:10:34 +0530 IST   29d       gcp                <none>
sched-20190513103534   Completed   2019-05-13 16:05:34 +0530 IST   29d       gcp                <none>
sched-20190513103034   Completed   2019-05-13 16:00:34 +0530 IST   29d       gcp                <none>
```

Restore of data need to be done in following way:

```
velero restore create --from-backup sched-20190513103034 --restore-volumes=true
velero restore create --from-backup sched-20190513103534 --restore-volumes=true
velero restore create --from-backup sched-20190513104034 --restore-volumes=true
```



## Roadmap

**Support for more backup storage location**

Current velero-plugin supports S3 and GCP backup storage location only. Support for other storage location is planned in the future release.

<br>

## See Also:

### [Setting up On-Premise Minio using OpenEBS](/docs/next/minio.html)

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
