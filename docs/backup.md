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
  will not visible in the restic daemonset pod on the same node
- Create required storage provider configuration to store the backup data
- Create required OpenEBS storage pools and  storage classes 



## Install Velero (Formerly known as ARK)

Follow the instructions at <a href="https://heptio.github.io/velero/v0.10.0/" target="_blank">Velero documentation</a> to install and configure Velero. 

The helm chart is available at<a href="https://github.com/helm/charts/tree/master/stable/ark" target="_blank">https://github.com/helm/charts/tree/master/stable/ark</a>  

At the end of Velero setup, Restic will be successfully running and ready for taking backup of any application. 

## Steps for backup

If you have configured Velero with restic then `velero backup` command invokes restic internally and  copies the data from the given application including the entire data from the associated persistent volumes in that application and backs it up to the configured storage location such as S3 or <a href="/docs/next/minio.html" target="_blank">Minio</a>. 

If you are using OpenEBS velero-plugin then `velero backup` command invokes velero-plugin internally and takes a snapshot of CStor volume data and send it to remote storage location as mentioned in  *volumesnapshotlocation*.

Take the backup using the below command.

```
velero backup create <backup-name> -l app=<app-label-selector>
```

Verify backup is taken successfully

```
velero backup describe bbb-01
```

## Steps for restore

Velero backup can be restored onto a new cluster or to the same cluster. An OpenEBS PVC **with the same name as the original PVC** needs to be created and made available before the restore command is performed. The target cluster OpenEBS EBS PVC can be from a different StorageClass and cStorPool, but only the PVC name has to be same.

If you are doing restore of CStor volume using OpenEBS velero-plugin, then you must need to create the same namespace and StorageClass configuration of the source PVC first in your target cluster.

On the target cluster, restore the application using the below command

```
velero restore create <restore-name> --from-backup <backup-name> -l app=<app-label-selector>
```

 Verify the restore 

```
velero restore describe <restore-name> --volume-details
```

Once the restore is completed to the PVC, attach the PVC to the target application. 

If you are doing restore with Velero-plugin then after restore, you need to update the target ip for CVR.

## Scheduling backups

Using `velero schedule` command, periodic backups are taken. 

In case of velero-plugin, this periodic backups are incremental backups which saves storage space and backup time. To restore periodic backup with velero-plugin, refer [here](https://github.com/openebs/velero-plugin/blob/v0.9.x/README.md) for more details. The following command will schedule the backup as per the cron time mentioned .

```
velero schedule create <backup-schedule-name> --schedule "0 * * * *" -l app=<app-label-selector>
```

Get the details of backup using the following command

```
velero backup get
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
