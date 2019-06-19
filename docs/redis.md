---
id: redis
title: OpenEBS for Redis
sidebar_label: Redis
---
------

<img src="/docs/assets/svg/o-redis.svg" alt="OpenEBS and Redis" style="width:400px;">

<br>

## Introduction

<br>

Redis is an open source in-memory remote database that supports many different data structures: strings, hashes, lists, sets, sorted sets, and more. It can be used as a database, a cache, and a message broker.  Redis is deployed either as a deployment or as a statefulset. When deployed as a deployment, the data of Redis StorageManager is usually replicated using cStor or Jiva. When deployed as statefulset, the replication and state management of data is managed by Redis itself and there is no replication required at the storage layer. Any CAS engine can be used for providing persistent volume to a statefulset instance depending on the expected performance and ease of use. 



## Which engine to choose for Redis?

The general guidelines for choosing a CAS engine is given [here](/docs/next/casengines.html#when-to-choose-which-cas-engine). In general, for production large scale deployments of Redis where low latency is a key requirement, OpenEBS hostpath LocalPV or OpenEBS device LocalPV is recommended.

[Deploying Redis using cStor](/docs/next/redis.html#deploying-redis-using-cstor)

[Deploying Redis using Jiva](/docs/next/redis.html#deploying-redis-using-java)

[Deploying Redis using OpenEBS hostpath LocalPV](/docs/next/redis.html#deploying-redis-using-openebs-hostpath-localpv)

[Deploying Redis using OpenEBS device LocalPV](/docs/next/redis.html#deploying-redis-using-openebs-device-localpv)





<br>

<hr>

<br>

## Deploying Redis using cStor

<img src="/docs/assets/svg/redis-cstor-deployment.svg" alt="OpenEBS and Redis" style="width:100%;">



**Key points:**

- Redis is deployed as `deployment` and cStor volumes have three replicas, with each replica on a cStorPool instance which is created of multiple disks in RAID or Stripe.
- Capacity of cStor volumes can be thin provisioned or expanded dynamically.
- Allocate enough memory for cStorPool pods to get good read performance. 

### Deployment workflow

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/1.0.0-RC2/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect the cluster to MayaOnline (Optional)** : Connecting the Kubernetes cluster to <a href="https://mayaonline.io" target="_blank">MayaOnline</a> provides good visibility of storage resources. MayaOnline has various support options for enterprise customers.

3. **Create a cStorPool**

   If you already have a cStorPool and want to reuse it, you can simply create a new StorageClass refering to the same pool. Otherwise, create a new cStorPool with at least 3 pool instances. It is recommeded to provide at least 4GB of memory to cStorPools while running Redis volumes on them. 

4. **Create a cStor Storage Class**

   <<what storage policies need to be specified for Redis ? >>

   /docs/next/ugcstor.html#cstor-storage-policies

   

5. **Launch and Test Redis**

   Use stable Redis image with helm to deploy Redis STS in your cluster using the following command. In the following command, it will create a PVC with 8G size for data volume.

   ```
   helm install --name my-release stable/redis --set master.persistence.storageClass=<openebs_LocalPV_StorageClass>,slave.persistence.storageClass=<openebs_LocalPV_StorageClass>
   ```

   For more information on installation, see Redis [documentation](https://github.com/helm/charts/tree/master/stable/redis).

<br>

### Verifying Redis deployment

After deploying Redis using helm command, you can verify the status of application and OpenEBS volume.

Verify application pod status using the following command.

```
kubectl get pods
```

Output will be similar to the following.

```
NAME                        READY   STATUS    RESTARTS   AGE
my-release-redis-master-0   1/1     Running   0          36m
my-release-redis-slave-0    1/1     Running   0          36m
my-release-redis-slave-1    1/1     Running   0          35m
```

Verify PVC status using the following command.

```
kubectl get pvc
```

Output will be similar to the following.

```
NAME                                   STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
redis-data-my-release-redis-master-0   Bound    pvc-b8730fe4-86d6-11e9-b316-42010a800052   8Gi        RWO            openebs-hostpath   36m
redis-data-my-release-redis-slave-0    Bound    pvc-b8803f18-86d6-11e9-b316-42010a800052   8Gi        RWO            openebs-hostpath   36m
redis-data-my-release-redis-slave-1    Bound    pvc-c13ccb54-86d6-11e9-b316-42010a800052   8Gi        RWO
```

Verify PV status using the following command.

```
kubectl get pv
```

Output will be similar to the following.

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                          STORAGECLASS       REASON   AGE
pvc-b8730fe4-86d6-11e9-b316-42010a800052   8Gi        RWO            Delete           Bound    default/redis-data-my-release-redis-master-0   openebs-hostpath            36m
pvc-b8803f18-86d6-11e9-b316-42010a800052   8Gi        RWO            Delete           Bound    default/redis-data-my-release-redis-slave-0    openebs-hostpath            36m
pvc-c13ccb54-86d6-11e9-b316-42010a800052   8Gi        RWO            Delete           Bound    default/redis-data-my-release-redis-slave-1    openebs-hostpath            36m
```

Verify service status of Redis application.

```
kubectl get svc
```

Output will be similar to the following.

```
NAME                        TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
kubernetes                  ClusterIP   10.43.240.1     <none>        443/TCP    5h13m
my-release-redis-headless   ClusterIP   None            <none>        6379/TCP   36m
my-release-redis-master     ClusterIP   10.43.245.246   <none>        6379/TCP   36m
my-release-redis-slave      ClusterIP   10.43.244.9     <none>        6379/TCP   36m
```

<br>

### Post Deployment Operations

##### Expand OpenEBS Volume size 

##### Expanding cStor Pool size

##### Backup and Restore

<br>

<hr>

<br>



## Deploying Redis using Java

<img src="/docs/assets/svg/redis-jiva-deployment.svg" alt="OpenEBS and Redis" style="width:100%;">

<br>

<hr>

<br>

## Deploying Redis using OpenEBS hostpath LocalPV

<img src="/docs/assets/svg/redis-lpv-hp-deployment.svg" alt="OpenEBS and Redis" style="width:100%;">

<br>

<hr>

<br>

## Deploying Redis using OpenEBS device LocalPV

<img src="/docs/assets/svg/redis-lpv-device-deployment.svg" alt="OpenEBS and Redis" style="width:100%;">

<br>

<hr>

## Configuration Design

Redis is typically deployed as StatefulSet with persistent enabled with master-slave configuration and it requires a minimum of three nodes. Redis STS will run as one master and two slave format.

| Condition for selecting CAS Engine                           | CAS engine               |
| ------------------------------------------------------------ | ------------------------ |
| This option will provision one Redis STS application on a dedicated device attached to the node. Minimum one unclaimed disk should be present on all the 3 Nodes. With the dedicated disk, application can consume the entire disk space. If it is a cloud disk, volume space can be increased by expanding the underlying disk capacity. With this approach, the performance will be equivalent to the disk being used. Replication needs to be handle by the Redis STS itself. No other applications can be provisioned if the node is having a single disk. | OpenEBS device LocalPV   |
| This option will provision one Redis STS application on the default hostpath or provided hostpath where the mount path must be exists on the Node. With this approach, the performance will be equivalent to the file system where the hostpath is created. Here volume capacity is limited to the capacity available on the disk where the hostpath is configured. Replication needs to be handle by the Redis STS itself. | OpenEBS hostpath LocalPV |

</br>



## See Also:

<br>

### [OpenEBS architecture](/1.0.0-RC2/docs/next/architecture.html)

### [OpenEBS use cases](/1.0.0-RC2/docs/next/usecases.html)

### [Understanding Local PV Concepts](/1.0.0-RC2/docs/next/localpv.html)

### [Local PV Guide](/1.0.0-RC2/docs/next/uglocalpv.html)



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