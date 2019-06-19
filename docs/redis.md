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

Redis is an open source in-memory remote database that supports many different data structures: strings, hashes, lists, sets, sorted sets, and more. It can be used as a database, a cache, and a message broker.  Redis is deployed generally as a StatefulSet on Kubernetes and requires persistent storage for each instance of Redis StorageManager. OpenEBS provides persistent volumes on the fly when StorageManagers are scaled up.

<hr>
<br>

## Deployment model

<img src="/docs/assets/svg/redis-deployment.svg" alt="OpenEBS and Redis" style="width:100%;">

<br>

<hr>

## Configuration Design

Redis is typically deployed as StatefulSet with persistent enabled with master-slave configuration and it requires a minimum of three nodes. Redis STS will run as one master and two slave format.

| Condition for selecting CAS Engine                           | CAS engine               |
| ------------------------------------------------------------ | ------------------------ |
| Redis can be deployed as a `replicaset` using device Local PV if the following conditions are met.<br>- Replication needs to be handled by the application itself.<br/>- Required disk equivalent performance.<br/>- Minimum a single unclaimed disk is available on the nodes.<br/>- Dedicated disk for Redis instances.<br/>- No other application can be provisioned if an only single disk is attached to the node.<br/>- Capacity usage is limited to the available disk capacity where the Local PV is provisioned. | OpenEBS device LocalPV   |
| Redis can be deployed as a `replicaset` using hostpath Local PV if the following conditions are met.<br>- Replication needs to be handled by the application itself.<br/>- Required filesystem equivalent performance where the hostpath is created.<br/>- Capacity usage is limited to the underlying storage capacity where the Local PV is provisioned.<br/>- Provision on default hostpath or customized hostpath. | OpenEBS hostpath LocalPV |

</br>

## Configuration workflow

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/1.0.0-RC2/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect to MayaOnline (Optional)** : Connecting the Kubernetes cluster to <a href="https://mayaonline.io" target="_blank">MayaOnline</a> provides good visibility of storage resources. MayaOnline has various **support options for enterprise customers**.

3. **Create Storage Class or Use default Storage Class**

   OpenEBS create two Storage Classes of Local PVs by default as `openebs-hostpath` and `openebs-device`.  One of these default StorageClass can be mentioned during the application provisioning with helm. More details can be read from [here](/1.0.0-RC2/docs/next/uglocalpv.html).

   A new StorageClass can be created for OpenEBS Local PV based hostpath by customizing different hostpath.

   A new StorageClass can be created for OpenEBS Local PV based  device by customizing the required filesystem for formatting the disk. For more details read from [here](/1.0.0-RC2/docs/next/localpv.html#how-to-use-openebs-local-pvs).

5. **Launch and Test Redis**

    Use stable Redis image with helm to deploy Redis STS in your cluster using the following command. In the following command, it will create a PVC with 8G size for data volume.

    ```
    helm install --name my-release stable/redis --set master.persistence.storageClass=<openebs_LocalPV_StorageClass>,slave.persistence.storageClass=<openebs_LocalPV_StorageClass>
    ```

    For more information on installation, see Redis [documentation](https://github.com/helm/charts/tree/master/stable/redis).

<br>

<hr>

### Verify the Redis Application and OpenEBS Volume

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

<hr>

## Post Deployment Operations

**Monitor OpenEBS Volume size** 

With latest OpenEBS version, OpenEBS Local PV doesn't enforce the capacity limit and set the PVC resource quotas.  So the application using the Local PV can write upto the max available space on the hostpath or the device. If it is device OpenEBS Local PV and if disk is a cloud disk,  more space can be availble on the OpenEBS volume by increasing the capacity of the cloud disk on the fly.

<br>

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