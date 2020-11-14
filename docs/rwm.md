---
id: rwm
title: Provisioning Read-Write-Many (RWM) PVCs
sidebar_label: Read-Write-Many (RWM)
---
------

NFS server provisioner stable helm chart is widely used for deploying NFS servers on Kubernetes cluster. This server provides PVCs in RWM mode so that multiple web applications can access the data in a shared fashion. OpenEBS cStor volumes are used as persistent backend storage for these nfs servers to provide a scalable and manageable RWM shared storage solution. 



<br><br>

<img src="/v220/docs/assets/svg/rwm-single.svg" alt="OpenEBS and NFS provisioner" style="width:100%;">

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

Select or <a href="/v220/docs/next/ugcstor.html#creating-cStor-storage-pools">create a cStor pool</a> that satisfies the performance, and availability requirements

<br>

**Select or create a cStor storage Class**

<a href="/v220/docs/next/ugcstor.html#creating-cStor-storage-class">Create a storage class</a> to point to the above selected pool and also select number of replicas and default size of the volume. 

<br>

**Create a namespace for deploying NFS server provisioner**

```
kubectl create ns <ns-nfs-wordpress1>
```

<br>

**Deploy NFS server provisioner**

Deploy NFS server provisioner into the above namespace using stable helm chart. Pass the following main parameter values. 

 - **namespace**:  Namespace for the NFS server provisioner which you have created in the previous section.
 - **name:** Release name for helm installation.
 - **persistence.storageClass:** StorageClass used for provisioning cStor volume.
 - **persistence.size:** cStor volume size which will be used for running nfs provisioner.
 - **storageClass.name:** Provide a name for NFS StorageClass to be created which can be used by the web application PVCs.

```
helm install stable/nfs-server-provisioner --namespace=<ns-nfs-wordpress1> --name=<release-name> --set=persistence.enabled=true,persistence.storageClass=<openebs-cstor-sc>,persistence.size=<cStor-volume-size>,storageClass.name=<nfs-sc-name>,storageClass.provisionerName=openebs.io/nfs
```

An example helm install command is

```
helm install stable/nfs-server-provisioner --namespace=nfs-wp-provisioner --name=openebs-nfs-wordpress --set=persistence.enabled=true,persistence.storageClass=openebs-cstor-disk,persistence.size=5Gi,storageClass.name=wordpress-nfs-sc1,storageClass.provisionerName=openebs.io/nfs
```

**Note:**  It is recommended that the OpenEBS storage class specifies 10% more space than what is required by the RWM PVC. For example, if RWM PVC requires 100G, then provision cStor volume with 110G.

<br>

**Provision RWX volume using the PVC**

Use the StorageClass which is created in above command and create a new PVC and use the volume in your applications.

<br>

<hr>

<br>



## Setting up multiple NFS servers

When multiple NFS shares are needed, use multiple NFS provisioners. Each NFS server manages one NFS server. Same or different OpenEBS StorageClass can be used for multiple NFS provisioners.



<img src="/v220/docs/assets/svg/rwm-multiple.svg" alt="OpenEBS and NFS provisioner" style="width:100%;">



<br>

<hr>

<br>





## See Also:

### [cStor Overview](/v220/docs/next/cstor.html)

### [cStorPools](/v220/docs/next/ugcstor.html#creating-cStor-storage-pools)

### [Setting up Object Storage](/v220/docs/next/minio.html)

<br>

<hr>

<br>

​
