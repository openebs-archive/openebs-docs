---
id: mongo
title: OpenEBS for MongoDB
sidebar_label: MongoDB
---

<img src="/docs/assets/svg/o-mongo.svg" alt="OpenEBS and MongoDB" style="width:400px;">

## Introduction

MongoDB is a cross-platform document-oriented database. Classified as a NoSQL database, MongoDB eschews the traditional table-based relational database structure in favor of JSON-like documents with dynamic schemas, making the integration of data in certain types of applications easier and faster. 

MongoDB is usually deployed as `replicaset` in the production environment where it does not need replication at the storage level. You can deploy a standalone MongoDB instance also for testing and development purposes. In this latter case, persistent storage is required for each instance of MongoDB StorageManager instance. OpenEBS provides persistent volumes on the fly when StorageManagers are scaled up.

<br>

<hr>

## Deployment model

<img src="/docs/assets/svg/mongo-deployment.svg" alt="OpenEBS and Mongo" style="width:100%;">

<br>

<hr>
<br>

## Configuration Design

| Condition for selecting CAS Engine                           | CAS engine               |
| ------------------------------------------------------------ | ------------------------ |
| Mongo DB can be deployed as a `replicaset` using device Local PV if the following conditions are met.<br>- Replication needs to be handled by the application itself.<br/>- Required disk equivalent performance.<br/>- The minimum unclaimed single disk is available on the nodes.<br/>- Dedicated disks usage for Mogo DB instances.<br/>- No other application can be provisioned is single disk is attached to the node.<br/>- Capacity usage is limited to the available disk capacity where the Local PV is provisioned. | OpenEBS device LocalPV   |
| Mongo DB can be deployed as a `replicaset` using hostpath Local PV if the following conditions are met.<br/>- Replication needs to be handled by the application itself.<br/>- Required filesystem equivalent performance where the hostpath is created.<br/>- Capacity usage is limited to the underlying storage capacity where the Local PV is provisioned.<br/>- Provision on default hostpath or customized hostpath. | OpenEBS hostpath LocalPV |
| Mongo DB can be deployed as a standalone server using cStor if the following conditions are met.<br/>- Replication at the storage level. <br/>- Required Medium performance and it is tunable based on workload pattern.<br/>- Capable of taking snapshot and clone of volumes.<br/>- Volume capacity expansion. <br/>- More disks are present in the Node. Thereby capacity of volume expansion is possible by             adding more disk. | cStor                    |
| Mongo DB can be deployed as a standalone server using Jiva if the following conditions are met.<br/>- Replication at the storage level.<br/>- Required Medium performance.<br/>- Volume capacity expansion based on the available capacity on the provisioned disk.<br/>- Provision Jiva on an external disk that can be shared or a mounted filesystem path. | Jiva                     |

</br>

<hr>

## Configuration workflow

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/1.0.0-RC2/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect to MayaOnline (Optional)** : Connecting the Kubernetes cluster to <a href="https://mayaonline.io" target="_blank">MayaOnline</a> provides good visibility of storage resources. MayaOnline has various **support options for enterprise customers**.

3. In this step, need to select the required CAS engine based on the requirement.

   - **OpenEBS Local PV**

     If OpenEBS Local PV is chosen as the CAS engine, perform below procedure. You can either use default StorageClass or create a new StorageClass with appropriate customization. Once the corresponding StorageClass is selected, perform step 4.

     - **Use default Storage Class**

       OpenEBS create two Storage Classes of Local PVs by default as `openebs-hostpath` and `openebs-device`. One of these default StorageClass can be mentioned during the application provisioning with helm. More details can be read from [here](https://staging-docs.openebs.io/1.0.0-RC2/docs/next/uglocalpv.html).

     - **Create Storage Class**

       A new StorageClass can be created for OpenEBS Local PV based hostpath by customizing different hostpath. 

       (or)

       A new StorageClass can be created for OpenEBS Local PV based device by customizing the required filesystem for formatting the disk. For more details read from [here](https://staging-docs.openebs.io/1.0.0-RC2/docs/next/localpv.html#how-to-use-openebs-local-pvs).

   - **cStor**

     If Local PV is chosen as CAS engine, perform below procedure.

     - **Configure cStor Pool**

       After OpenEBS installation, cStor pool has to be configured. If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](/1.0.0-RC2/docs/next/ugcstor.html#creating-cStor-storage-pools).  During cStor Pool creation, ensure that at least one block device is taken from 3 nodes. This is to ensure the replication at the storage level with replica count as 3. If cStor pool is already configured, configure StorageClass to include the corresponding StoragePoolClaim name. 

     - **Create Storage Class**

       You must configure a StorageClass to provision cStor volume on given cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies are defined. By using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. StorageClass can be done from [here](/1.0.0-RC2/docs/next/ugcstor.html#creating-cStor-storage-class). If MongoDB is installed as a standalone server, then it requires replication at the storage level. So cStor volume `replicaCount` is 3. Use appropriate Storage Class name in the helm command in step 4.

   - **Jiva**

     - **Use default Storage Class**

       The default Storage Class for Jiva is `openebs-jiva-default`. Use this StorageClass for provisioning Jiva volume with replica count as 3.

     - **Create Storage Class**

       If you need to create a storage pool with an externally mounted disk and use this mounted path in new Storage Class for provisioning Jiva volume, this can be done from [here](/1.0.0-RC2/docs/next/jivaguide.html#create-a-pool). 

4. **Launch and Test MongoDB**

   In this example, Mongo DB is provisioned as `replicaset` and used `openebs-hostpath` as the StorageClass.

   ```
   helm install --name my-release stable/mongodb-replicaset --set persistentVolume.storageClass=openebs-hostpath 
   ```

   For more information on installation, see MongoDB [documentation](https://github.com/helm/charts/tree/master/stable/mongodb-replicaset).

<br>

<hr>

## Verify the Mongo DB Application and OpenEBS Volume

After deploying Mongo DB using helm command, you can verify the status of application and OpenEBS volume. In this example, Mongo DB is provisioned as `replicaset` and used `openebs-hostpath` as the StorageClass.

Verify application pod status using the following command.

```
kubectl get pods
```

Output will be similar to the following.

```
NAME                              READY   STATUS    RESTARTS   AGE
my-release-mongodb-replicaset-0   1/1     Running   0          3m27s
my-release-mongodb-replicaset-1   1/1     Running   0          2m38s
my-release-mongodb-replicaset-2   1/1     Running   0          119s
```

Verify PVC status using the following command.

```
kubectl get pvc
```

Output will be similar to the following.

```
NAME                                      STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
datadir-my-release-mongodb-replicaset-0   Bound    pvc-873d1d37-926a-11e9-9664-42010a800254   10Gi       RWO            openebs-hostpath   2m23s
datadir-my-release-mongodb-replicaset-1   Bound    pvc-a4b37f04-926a-11e9-9664-42010a800254   10Gi       RWO            openebs-hostpath   94s
datadir-my-release-mongodb-replicaset-2   Bound    pvc-bbf53110-926a-11e9-9664-42010a800254   10Gi       RWO            openebs-hostpath   55s
```

Verify PV status using the following command.

```
kubectl get pv
```

Output will be similar to the following.

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                             STORAGECLASS       REASON   AGE
pvc-873d1d37-926a-11e9-9664-42010a800254   10Gi       RWO            Delete           Bound    default/datadir-my-release-mongodb-replicaset-0   openebs-hostpath            2m18s
pvc-a4b37f04-926a-11e9-9664-42010a800254   10Gi       RWO            Delete           Bound    default/datadir-my-release-mongodb-replicaset-1   openebs-hostpath            87s
pvc-bbf53110-926a-11e9-9664-42010a800254   10Gi       RWO            Delete           Bound    default/datadir-my-release-mongodb-replicaset-2   openebs-hostpath      
```

Verify service status of Mongo DB application.

```
kubectl get svc
```

Output will be similar to the following.

```
NAME                                   TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)     AGE
kubernetes                             ClusterIP   10.0.0.1     <none>        443/TCP     3h7m
my-release-mongodb-replicaset          ClusterIP   None         <none>        27017/TCP   4m1s
my-release-mongodb-replicaset-client   ClusterIP   None         <none>        27017/TCP   4m1s
```

<br>

<hr>

## Post Deployment Operations

- cStor related operations can be obtained from [here](/1.0.0-RC2/docs/next/ugcstor.html).

<br>

<hr>

<br>

## See Also:

<br>

### [OpenEBS architecture](/1.0.0-RC2/docs/next/architecture.html)

### [OpenEBS use cases](/1.0.0-RC2/docs/next/usecases.html)

### [cStor User Guide](/1.0.0-RC2/docs/next/ugcstor.html)

### [Local PV User Guide](/1.0.0-RC2/docs/next/uglocalpv.html)

### [Jiva User Guide](/1.0.0-RC2/docs/next/jivaguide.html)



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
