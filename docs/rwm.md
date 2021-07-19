---
id: rwm
title: Provisioning Read-Write-Many (RWX) PVCs
sidebar_label: Read-Write-Many (RWX)
---
------

NFS server provisioner stable helm chart is widely used for deploying NFS servers on Kubernetes cluster. This server provides PVCs in RWX mode so that multiple web applications can access the data in a shared fashion. OpenEBS cStor volumes are used as persistent backend storage for these nfs servers to provide a scalable and manageable RWX shared storage solution. 

:::note OpenEBS Dynamic NFS Provisioner
OpenEBS includes an alpha version of OpenEBS Dynamic NFS provisioner that allows users to create an NFS PV that sets up an new Kernel NFS instance for each PV on top of users choice of backend storage. 

This project is currently under active development. For getting started and getting involved in developing this project, check out https://github.com/openebs/dynamic-nfs-provisioner.

The rest of this document contains instructions about the NFS server provisioner maintained by the Kubernetes SIGs community.
:::



<br><br>

<a href="/docs/assets/svg/rwm-single.svg" target="_blank"><img src="/docs/assets/svg/rwm-single.svg" alt="OpenEBS and NFS provisioner" style="width:100%;"></a>

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

Select or <a href="/docs/next/ugcstor.html#creating-cStor-storage-pools">create a cStor pool</a> that satisfies the performance, and availability requirements

<br>

**Select or create a cStor storage Class**

<a href="/docs/next/ugcstor.html#creating-cStor-storage-class">Create a storage class</a> to point to the above selected pool and also select number of replicas and default size of the volume. 

<br>

**Download help repo for nfs-provisioner**
```
helm repo add openebs-nfs https://openebs.github.io/dynamic-nfs-provisioner
helm repo update
```

**Create a namespace for deploying NFS server provisioner**

```
kubectl create ns <ns-nfs-wordpress1>
```

<br>

**Deploy NFS server provisioner**

Deploy NFS server provisioner into the above namespace using stable helm chart. Pass the following main parameter values. 

 - **namespace**:  Namespace for the NFS server provisioner which you have created in the previous section.
 - **nfsStorageClass.backendStorageClass:** StorageClass used for provisioning cStor volume.

```
helm install <RELEASE_NAME> openebs-nfs/nfs-provisioner --namespace=<ns-nfs-wordpress1>  --set-string nfsStorageClass.backendStorageClass="openebs-cstor-sc"
```

An example helm install command is

```
helm install openebs-nfs openebs-nfs/nfs-provisioner --namespace=<ns-nfs-wordpress1>  --set-string nfsStorageClass.backendStorageClass="openebs-cstor-sc"
```

Above command will install the nfs-provisioner in `ns-nfs-wordpress1` namespace and creates nfs storage class `openebs-kernel-nfs`.

**Note:**  It is recommended that the OpenEBS storage class specifies 10% more space than what is required by the RWX PVC. For example, if RWX PVC requires 100G, then provision cStor volume with 110G.

<br>

**Provision RWX volume using the PVC**

Use the StorageClass which is created in above command and create a new PVC and use the volume in your applications.

<br>

<hr>

<br>



## Setting up multiple NFS servers

When multiple NFS shares are needed, use multiple NFS provisioners. Each NFS server manages one NFS server. Same or different OpenEBS StorageClass can be used for multiple NFS provisioners.



<a href="/docs/assets/svg/rwm-multiple.svg" target="_blank"><img src="/docs/assets/svg/rwm-multiple.svg" alt="OpenEBS and NFS provisioner" style="width:100%;"></a>



<br>

<hr>

<br>





## See Also:

### [cStor Overview](/docs/next/cstor.html)

### [cStorPools](/docs/next/ugcstor.html#creating-cStor-storage-pools)

### [Setting up Object Storage](/docs/next/minio.html)

<br>

<hr>

<br>

​
