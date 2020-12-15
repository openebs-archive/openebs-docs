---
id: minio
title: OpenEBS for MinIO
sidebar_label: MinIO
---
------

<img src="/v230/docs/assets/o-minio.png" alt="OpenEBS and MinIO" style="width:400px;">

<br>

## Introduction


[MinIO](https://github.com/minio/minio) is a high performance distributed object storage server, designed for large-scale private cloud infrastructure. MinIO is designed in a cloud-native manner to scale sustainably in multi-tenant environments. Orchestration platforms like Kubernetes provide a perfect cloud-native environment to deploy and scale MinIO. MinIO can be provisioned with OpenEBS volumes using various OpenEBS storage engines such as [Local PV](https://docs.openebs.io/docs/next/localpv.html), [cStor](https://docs.openebs.io/docs/next/cstor.html), or [Jiva](https://docs.openebs.io/docs/next/jiva.html) based on the application requirement.



**Advantages of using OpenEBS underneath MinIO Object Storage:**

- PVCs to MinIO are dynamically provisioned from a dedicated or shared storage pool. Therefore, the requirement of dedicated disks on bare-metalserver or on a cloud environment to launch an object storage solution can be avoided.
- Adding more storage to the Kubernetes cluster with OpenEBS is seamless and done along with adding a Kubernetes node. The auto-scaling of MinIO instances on-premises is as easy as cloud platforms.
- Storage within a node or pool instance can also be scaled up on demand. 
- Complete management of disks under MinIO is managed by OpenEBS, leading to production-grade deployment of object storage.

<br>



## Deployment model

<br>

<img src="/v230/docs/assets/minio-choose-engine.png" alt="OpenEBS and MinIO" style="width:400px;">

<br>



## Configuration workflow


1. Identify the installation method for MinIO
2. Install OpenEBS
3. Select OpenEBS storage engine 
4. Create a new StorageClass or use default StorageClass based on the storage engine
5. Launch MinIO application by using the corresponding StorageClass
  
<h3><a class="anchor" aria-hidden="true" id="install-openebs"></a>Identify the installation method for MinIO</h3>

MinIO can be installed by following the below two options:

- Standalone mode

  This method installs one single application, which is a Deployment kind. In standalone mode, MinIO will not maintain the data replication at the application level. Therefore if a user needs replication at the storage level, then the user needs to identify the OpenEBS storage engine, which supports storage level replication. 

- Distributed mode

  MinIO can provide the replication of data by itself in distributed mode. This method installs MinIO application, which is a StatefulSet kind. It requires a minimum of four (4) nodes to setup MinIO in distributed mode. A distributed MinIO setup with 'n' number of disks/storage has your data safe as long as n/2 or more disks/storage are online. Users should maintain a minimum (n/2 + 1) disks/storage to create new objects. So based on the requirement, the user can choose the appropriate OpenEBS storage engine to run MinIO in distributed mode.

For more information on installation, see MinIO [documentation](https://docs.min.io/docs/deploy-minio-on-kubernetes.html).


<h3><a class="anchor" aria-hidden="true" id="install-openebs"></a>Install OpenEBS</h3>

If OpenEBS is not installed in your Kubernetes cluster, this can be done following the installation instructions [here](https://docs.openebs.io/docs/next/installation.html). If OpenEBS is already installed, skip to the next step.

<h3><a class="anchor" aria-hidden="true" id="install-openebs"></a>Select OpenEBS storage engine </h3>

Choosing a storage engine depends entirely on the application workload as well as it's current and future growth in capacity and/or performance. Additional details of the storage engines can be found [here](https://docs.openebs.io/docs/next/casengines.html#when-to-choose-which-cas-engine). You can refer to one of the storage engine sections below based on your selection.

- [Local PV](https://docs.openebs.io/docs/next/localpv.html)
- [cStor](https://docs.openebs.io/docs/next/cstor.html)
- [Jiva](https://docs.openebs.io/docs/next/jiva.html)

The following is a quick summary of considerations for choosing a storage engine for MinIO:

- If the use-case requires higher performance and does not require replication at the storage level, then OpenEBS **Local PV** is the recommended storage engine. If Local PV device-based StorageClass is used, then only one MinIO application on the Node can be consumed. If it is Local PV hostpath-based StorageClass, then other than MinIO, other applications can be provisioned on the same hostpath location.

- If the use-case requires storage level replication, Day 2 Operations such that snapshot & clone, volume & storage pool capacity expansion, scaling up / scaling down of volume replicas, then **cStor** is the recommended storage engine. If MinIO is running in distributed mode and requires medium performance but requires Day 2 operations, then cStor with Single replica of volume can be used.

- If the use-case is a small workload running on the cluster, has a small capacity requirement, and the application is not taking replication by itself, then **Jiva** is recommended.


<h3><a class="anchor" aria-hidden="true" id="install-openebs"></a>Create a new StorageClass or use the default StorageClass</h3>

Based on the OpenEBS storage engine selection, the user has to create a Storage Class with required storage policies on it, or they can use the default StorageClass created as part of OpenEBS installation. For example, if the selected OpenEBS storage engine is cStor and MinIO deploying in distributed mode, the user can create a cStor storage pool on each of the four (4) nodes and then use the corresponding `StoragePoolClaim` name in the StorageClass with `replicaCount` as `1`. 

The steps for the creation of StorageClass can be found below:

- [cStor](https://docs.openebs.io/docs/next/ugcstor.html#creating-cStor-storage-class)
- [Local PV hostpath](https://docs.openebs.io/docs/next/uglocalpv-hostpath.html), [Local PV device](https://docs.openebs.io/docs/next/uglocalpv-device.html), [Local PV with Customized hostpath](https://docs.openebs.io/docs/next/uglocalpv-hostpath.html#create-storageclass)
- [Jiva](https://docs.openebs.io/docs/next/jivaguide.html#create-a-sc)


<h3><a class="anchor" aria-hidden="true" id="install-openebs"></a>Launch MinIO application by using the corresponding StorageClass</h3>

<h4><a class="anchor" aria-hidden="true" id="minio-localpv"></a>MinIO on Local PV</h4>

MinIO can be provisioned on OpenEBS Local PV either on hostpath or on block Device. Local PV can be used if low-latency is a must requirement, and if the application can handle the replication by itself in `distributed mode` and/or application does not require replication at all in `standalone mode`.

**In Standalone mode:**

Local PV can be provisioned by following of the options below:

- Hostpath-based

  In this case, Local PV volume will be provisioned on the hostpath created on the node where the application has been scheduled. A persistent volume (PV) will be created with a specified size on `/var/openebs/local` directory on the same node when it uses default StorageClass  `openebs-hostpath`. 
  Customizing the basepath can also be done using the steps provided [here](https://docs.openebs.io/docs/next/uglocalpv.html#configure-hostpath). Using the customized basepath, user can mount the device and use this mounted directory into the basepath field in the StorageClass.

  
  <img src="/v230/docs/assets/svg/Local-PV-standalone-default-minio.svg" alt="OpenEBS and MinIO Standalone localpv hostpath" style="width:400px;">


  After creating the StorageClass with required information, MinIO application can be launched using Local PV hostpath by running below command:
  ```
  helm install --name=minio-test --set accessKey=minio,secretKey=minio123,persistence.storageClass=openebs-hostpath,service.type=NodePort,persistence.enabled=true stable/minio
  ```
  Or
  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/minio/minio-standalone-localpv-hostpath-default.yaml
  ```

  This will create a MinIO application running with one replica of a PV with 10Gi on default Local PV hostpath `/var/openebs/local/` directory on the node where the application pod has scheduled, if basepath is not customized.

- Device-based 

  In this case, Local PV volume will be provisioned on the node where the application has scheduled and any of the unclaimed and active blockdevices available on the same node. Local PV devices will use the entire blockdevice for the MinIO application. The blockdevice can be mounted or raw device on the node where your application is scheduled and this blockdevice cannot be used by another application. If there are limited blockdevices attached to some of the nodes, then users can use `nodeSelector` in the application YAML to provision application on a particular node where the available blockdevice is present.

  
  <img src="/v230/docs/assets/svg/Local-PV-standalone-device-minio.svg" alt="OpenEBS and MinIO Standalone localpv device" style="width:400px;">
  
  
  MinIO application can be launched using Local PV device by running below command:
  ```
  helm install --name=minio-test --set accessKey=minio,secretKey=minio123,persistence.storageClass=openebs-device,service.type=NodePort,persistence.enabled=true stable/minio
  ```
  Or
  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/minio/minio-standalone-localpv-device.yaml
  ```
  This will create a single MinIO application on a single disk that is attached to the same node where the application is scheduled.

<font size="5">Accessing MinIO</font>

In a web browser, MinIO application can be accessed using the following address:

https://<Node_external_ip>:<Node_port>

**Note:**
- Node external IP address can be obtained by running `kubectl get node -o wide`
- Node port can be obtained by running `kubectl get svc -l app=minio`

**In Distributed mode:**

Local PV can be provisioned by following of the options below:

- Hostpath-based

  In this case, Local PV volume will be provisioned on the hostpath on the node, where the application is getting scheduled. A PV will be created with a specified size inside `/var/openebs/local` directory on all four (4) nodes when it uses default Storage Class  `openebs-hostpath`. 
  Customizing the basepath can also be done using the steps provided [here](https://docs.openebs.io/docs/next/uglocalpv.html#configure-hostpath). Using the customized basepath, user can mount the device and use this mounted directory into the basepath field in the StorageClass.

  
  <img src="/v230/docs/assets/svg/Local-PV-Distributed-hostpath-minio.svg" alt="OpenEBS and MinIO Distributed localpv hostpath" style="width:400px;">

  
  MinIO application can be launched using hostpath based Local PV by running below command:

  ```
  helm install --name=minio-test --set mode=distributed,accessKey=minio,secretKey=minio123,persistence.storageClass=openebs-hostpath,service.type=NodePort,persistence.enabled=true stable/minio
  ```
  Or
  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/minio/minio-distributed-localpv-hostpath-default.yaml
  ```
  This will create a MinIO application with replica count four (4) running with a single replica of PV with 10Gi for all the four application instances on default Local PV hostpath `/var/openebs/local/` directory on the nodes where the application has been scheduled, if basepath is not customized.

- Device-based 

  In this case, Local PV volume will be provisioned on the node where the application has scheduled and any of the unclaimed and active blockdevices available on the same node. Local PV devices will use the entire blockdevice for MinIO application. The blockdevice can be mounted or raw device on the node where your application is scheduled and this blockdevice cannot be used by another application. If you have limited blockdevices attached to some nodes, then users can use `nodeSelector` in the application YAML to provision application on a particular node where the available blockdevice is present. Since MinIO is in distributed mode, it requires a minimum of four (4) nodes and a single unclaimed external disk should be attached to each of these four nodes.
  
  
  <img src="/v230/docs/assets/svg/Local-PV-Distributed-device-minio.svg" alt="OpenEBS and MinIO Distributed localpv device" style="width:400px;">
  
  
  MinIO application can be launched using device-based Local PV by running below command:
  
   ```
  helm install --name=minio-test --set mode=distributed,accessKey=myaccesskey,secretKey=mysecretkey,persistence.storageClass=openebs-device,service.type=NodePort,persistence.enabled=true stable/minio
   ```
  Or
  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/minio/minio-distributed-localpv-device-default.yaml
  ```
  This will create a MinIO application running with one replica on each of the four (4) nodes. This means one PVC with 10Gi will be created on each of suitable blockdevice on these 4 nodes. 

<font size="5">Accessing MinIO</font>

In a web browser, MinIO application can be accessed using the following address:

https://<Node_external_ip>:<Node_port>

**Note:**
- Node external IP address can be obtained by running `kubectl get node -o wide`
- Node port can be obtained by running `kubectl get svc -l app=minio`


<h4><a class="anchor" aria-hidden="true" id="minio-cstor"></a>MinIO on cStor</h4>

cStor can be used if MinIO deployment cannot provide the replication of data by itself or it requires storage replication, moderate performance and Day 2 operations support such as volume/pool capacity expansion, disk replacement, snapshot, clones, scaling up and scaling down of volume replicas. cStor support the creation of a storage pool using multiple disks on the nodes which can be used to provision multiple volumes and on-demand pool capacity expansion can be achieved by adding more disks to the pool or expanding the size of the cloud disks. cStor also provides additional features such as thin provisioning, storage level snapshot and clone capability. 

The steps for provisioning MinIO application in both method using cStor volume can be done by follows:

**In Standalone mode:**

The cStor volume can be provisioned using the following steps;

- Creating cStor pools.
  This will create a StoragePoolClaim which will define multiple storage pools. cStor StoragePoolClaim can be created using the steps provided [here](https://docs.openebs.io/docs/next/ugcstor.html#creating-cStor-storage-pools). For example, the SPC name used in this example is `cstor-disk-pool`. This has to be mentioned in the StorageClass which is going to be created in the next step. It is required a minimum of 3 nodes with disks attached to it for maintaining the quorum and the storage level replication.
  
- Creating a cStor StorageClass which uses StoragePoolClaim name created in the previous step, `replicaCount` which defines the number of storage volume replicas and required other [storage policies](https://docs.openebs.io/docs/next/ugcstor.html#cstor-storage-policies). StorageClass be created using the steps provided [here](https://docs.openebs.io/docs/next/ugcstor.html#creating-cStor-storage-class). For example, StorageClass used in this example is `openebs-sc`. Use this SC name in the application deployment command. The replica count mentioned in this StorageClass should be minimum three (3).

   
  <img src="/v230/docs/assets/svg/cstor-standalone-minio.svg" alt="OpenEBS and MinIO standalone cStor " style="width:400px;">
  
 
- Launch MinIO application using the following command. You may change the StorageClass name as per the one created in the previous step.

  ```
  helm install --name=minio-test --set accessKey=myaccesskey,secretKey=mysecretkey,persistence.storageClass=openebs-sc,service.type=NodePort,persistence.enabled=true  stable/minio
  ```
  Or
  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/minio/minio-standalone-cstor.yaml
  ```

This will create a MinIO application on cStor volume with 3 replicas and capacity of 10Gi on cStor pool.

**In Distributed mode:**

The cStor volume can be provisioned using the following steps.

- Creating cStor pools. 
  This will create a StoragePoolClaim, which will define multiple storage pools. cStor StoragePoolClaim can be created using the steps provided [here](https://docs.openebs.io/docs/next/ugcstor.html#creating-cStor-storage-pools). For example, the SPC name used in this example is `cstor-disk-pool`. This has to be mentioned in the Storage Class, which is going to be created in the next step. MinIO in distributed mode can be able to perform replication by itself, so only one replica at storage level is enough. MinIO on cStor will give a medium performance and can be able to do resize of volume and snapshot and clone capability.
  
- Creating a cStor StorageClass 
  The StorageClass uses StoragePoolClaim name created in the previous step, replicaCount, which defines the number of storage volume replicas and other required [storage policies](https://docs.openebs.io/docs/next/ugcstor.html#cstor-storage-policies). StorageClass can be created using the steps provided [here](https://docs.openebs.io/docs/next/ugcstor.html#creating-cStor-storage-class). For example, StorageClass used in this example is `openebs-sc-rep1`. Use this SC name in the application deployment command. The replica count mentioned in this StorageClass is one (1).
   
      
  <img src="/v230/docs/assets/svg/cstor-distributed-minio.svg" alt="OpenEBS and MinIO Distributed cStor " style="width:400px;">
   
   
- Launch MinIO application using the following command. You may change the StorageClass name as per the one created in the previous step.
  
  ```
  helm install --name=minio-test --set mode=distributed,accessKey=myaccesskey,secretKey=mysecretkey,persistence.storageClass=openebs-sc-rep1,service.type=NodePort,persistence.enabled=true  stable/minio
  ```
  Or
  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/minio/minio-distributed-cstor.yaml
  ```
  This will create a MinIO application with four (4) application replicas with single replica of cStor volume and capacity of 10Gi on cStor pool.

<font size="5">Accessing MinIO</font>

In a web browser, MinIO application can be accessed using the following address:

https://<Node_external_ip>:<Node_port>

**Note:**
- Node external IP address can be obtained by running `kubectl get node -o wide`
- Node port can be obtained by running `kubectl get svc -l app=minio`


<h4><a class="anchor" aria-hidden="true" id="minio-cstor"></a>MinIO on Jiva</h4>

Jiva can be chosen for smaller capacity workloads in general and if it requires storage level replication but does not need snapshots and clones. Jiva volume can be provisioned using default StorageClass `openebs-jiva-default` which will create PV under `/var/openebs/` or it can be created on an external mounted disk on the worker node. 

**In Standalone mode:**

The steps for provisioning MinIO application in standalone mode using Jiva volume can be done by following steps. Users can use either the default storage pool or with a storage pool created using an external mounted disk.

- Default Storage Pool
  
  - Use the default Storage pool `default`. The default storage pool will be created on the OS disk using the sparse disk once OpenEBS is installed. For using default Storage Pool, user can simply use default StroageClass `openebs-jiva-default` in the PVC spec of the application.
       
  
  <img src="/v230/docs/assets/svg/JIVA-standalone-default-pool-minio.svg" alt="OpenEBS and MinIO standalone jiva default " style="width:400px;"> 
   
         
  - Launch MinIO application using the following command. User can include the default StorageClass name in the following command:
    ```
    helm install --name=minio-test --set accessKey=myaccesskey,secretKey=mysecretkey,persistence.storageClass=openebs-jiva-default,service.type=NodePort,persistence.enabled=true  stable/minio
    ```
    
    or
    
    ```
    kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/minio/minio-standalone-jiva-default.yaml
    ```
    
    This will create a MinIO application on a PV with a replication factor of three (3) Jiva volume and capacity of 10Gi on default Jiva pool created on OS disk.
  
-  Storage Pool using External disk
  
   - Creating a Jiva pool using a single mounted disk. The mount path should be the same on all the Node where the Jiva volume replica will be provisioned. The steps for creating a Jiva pool are mentioned [here](https://docs.openebs.io/docs/next/jivaguide.html#create-a-pool).
   
   - Create/use a StorageClass, which uses Jiva Storage pool created with a mounted disk in the previous step. For example, StorageClass used in this example is `openebs-jiva-sc`. Use this SC name in the application deployment command.
     
         
  <img src="/v230/docs/assets/svg/JIVA-standalone-storage-pool-minio.svg" alt="OpenEBS and MinIO standalone jiva storage pool " style="width:400px;">
     
      
   - Launch MinIO application using the following command. You may change the StorageClass name as per the one created in the previous step.
     ```
     helm install --name=minio-test --set accessKey=myaccesskey,secretKey=mysecretkey,persistence.storageClass=openebs-jiva-sc,service.type=NodePort,persistence.enabled=true  stable/minio
     ```
     Or
     ```
     kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/minio/minio-standalone-jiva-storagepool.yaml
     ```
     
     This will create a MinIO application on a PV with a replication factor of 3 Jiva volume and capacity of 10Gi on a Jiva pool created on external disks.

<font size="5">Accessing MinIO</font>

In a web browser, MinIO application can be accessed using the following address:

https://<Node_external_ip>:<Node_port>

**Note:**
- Node external IP address can be obtained by running `kubectl get node -o wide`
- Node port can be obtained by running `kubectl get svc -l app=minio`

<br>

## Post deployment Operations


**Monitor OpenEBS Volume size** 

Currently, cStor CSPC only support volume expansion and this work is under active development (https://github.com/openebs/cstor-csi) and remains Alpha as of September 1 2020. Therefore it is recommended that sufficient size is allocated during the initial configuration on OpenEBS volume. 

**Monitor cStor Pool size**

In case you are using cStor storage engine, in most of the cases the cStor pool may not be dedicated to just MinIO alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. See [cStorPool metrics](/v230/docs/next/ugcstor.html#monitor-pool).

<br>
<hr>

## See Also:

### [OpenEBS use cases](/v230/docs/next/usecases.html)

### [Understanding NDM](/v230/docs/next/ugndm.html)

### [cStor concepts](/v230/docs/next/cstor.html)

### [Jiva concepts](/v230/docs/next/jivaguide.html)

### [Local PV concepts](/v230/docs/next/localpv.html)







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
