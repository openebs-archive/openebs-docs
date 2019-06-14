---
id: rwm
title: Provisioning Read-Write-Many (RWM) PVCs
sidebar_label: Read-Write-Many (RWM)
---
------

NFS server provisioner stable helm chart is widely used for deploying NFS servers on Kubernetes cluster. This server provides PVCs in RWM mode so that multiple web applications can access the data in a shared fashion. OpenEBS cStor volumes are used as persistent backend storage for these nfs servers to provide a scalable and manageable RWM shared storage solution. 



<br><br>

<img src="/docs/assets/svg/rwm-single.svg" alt="OpenEBS and NFS provisioner" style="width:100%;">

<br>	

Below are advantage of using NFS provisioner over OpenEBS cStor volumes 

- NFS data is replicated, highly available across zones if configured accordingly
- Data is thin provisioned. Persistent volume mounts are configured at the required size and cStor physical pools can be started with as low as one disk per pool instance and grow as the storage is used up



<br>

<hr>

<br>



## Setting up a single NFS server

<br>

**Select or create a cStor pool**

Select or <a href="/1.0.0-RC2/docs/next/ugcstor.html#creating-cStor-storage-pools">create a cStor pool</a> that satisfies the performance, and availability requirements

<br>

**Select or create a cStor storage Class**

<a href="/1.0.0-RC2/docs/next/ugcstor.html#creating-cStor-storage-class">Create a storage class</a> to point to the above selected pool and also select number of replicas and default size of the volume

<br>

**Create a namespace for deploying NFS server provisioner**

```
kubectl create ns <ns-nfs-wordpress1>
```

<br>

**Deploy NFS server provisioner**

Deploy NFS server provisioner into the above namespace using stable helm chart. Pass the following main parameter values. 

 - OpenEBS StorageClass to be used for the persistent data storage
 - NFS StorageClass to be created which can be used by the web application PVCs
 - Namespace for the NFS server provisioner which you have created in the previous section.

```
 helm install stable/nfs-server-provisioner --namespace=<ns-nfs-wordpress1> --name=<provisioner-name> --set=persistence.enabled=true,persistence.storageClass=openebs-cstor-sparse,persistence.size=5Gi,storageClass.name=<nfs-sc-name>
```

An example helm install command is

<font color="maroon" >```helm install stable/nfs-server-provisioner --namespace=nfs-wp-provisioner --name=openebs-nfs-wordpress --set=persistence.enabled=true,persistence.storageClass=openebs-sc-cstor-pool1,persistence.size=5Gi,storageClass.name=wordpress-nfs-sc1```</font>

<br>

**Provision RWX volume using the PVC**

Use the above storage class and create a new PVC and mount it inside the pod at a required mount point.



<br>

<hr>

<br>



## Setting up multiple NFS servers

When multiple NFS shares are needed, use multiple NFS provisioners. Each NFS server manages one NFS server. Same or different OpenEBS StorageClass can be used for multiple NFS provisioners.



<img src="/docs/assets/svg/rwm-multiple.svg" alt="OpenEBS and NFS provisioner" style="width:100%;">



<br>

<hr>

<br>





## See Also:

### [cStor Overview](/1.0.0-RC2/docs/next/cstor.html)

### [cStorPools](/1.0.0-RC2/docs/next/ugcstor.html#creating-cStor-storage-pools)

### [Setting up Object Storage](/1.0.0-RC2/docs/next/minio.html)

<br>

<hr>

<br>

​	

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
