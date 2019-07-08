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



## Install Velero (ARK)

Follow the instructions at <a href="https://heptio.github.io/velero/v0.10.0/" target="_blank">Velero documentation</a> to install and configure Velero. 

The helm chart is available at<a href="https://github.com/helm/charts/tree/master/stable/ark" target="_blank">https://github.com/helm/charts/tree/master/stable/ark</a>  

At the end of Velero setup, Restic will be successfully running and ready for taking backup of any application. 

## Steps for backup

`ark backup` command invokes restic internally and copies the data from the given application including the entire data from the associated persistent volumes in that application and backs it up to the configured storage location such as S3 or <a href="/v082/docs/next/minio.html" target="_blank">Minio</a>. 

Take the backup using the below command 

```
ark backup create <backup-name> -l app=<app-label-selector>
```

Verify backup is taken successfully

```
ark backup describe bbb-01
```

## Steps for restore

Ark backup can be restored onto a new cluster or to the same cluster. An OpenEBS PVC **with the same name as the original PVC** needs to be created and made available before the restore command is performed. The target cluster OpenEBS EBS PVC can be from a different StorageClass and cStorPool, only the PVC name has to be same.



On the target cluster, restore the application using the below command

```
ark restore create <restore-name> --from-backup <backup-name> -l app=<app-label-selector>
```

 Verify the restore 

```
ark restore describe <restore-name> --volume-details
```



Once the restore is completed to the PVC, attach the PVC to the target application. 



## Scheduling backups

Using `ark schedule` command, periodic backups are taken. 

```
ark schedule create <backup-schedule-name> --schedule "0 * * * *" -l app=<app-label-selector>
```

Get the details of backup using the following command

```
ark backup get
```



## Roadmap

**OpenEBS ARK storage plugin** 

The above backup and restore procedure is done using Restic, where the entire data is copied and restored in a bulk manner. More efficient backup and restore possible through incremental data snapshots using the OpenEBS ARK storage plugin which is planned for OpenEBS 0.9 release

<br>

## See Also:

### [Setting up On-Premise Minio using OpenEBS](/v082/docs/next/minio.html)

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
