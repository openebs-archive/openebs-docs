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

Redis is an open source (BSD licensed), in-memory **data structure store**, used as a database, cache and message broker.  Redis is deployed usually as a `statefulset` on Kubernetes and requires persistent storage for each instance of Redis StorageManager instance. OpenEBS provides persistent volumes on the fly when StorageManagers are scaled up.

<br>

**Advantages of using OpenEBS for Redis:**

- No need to manage the local disks, they are managed by OpenEBS
- Large size PVs can be provisioned by OpenEBS and Redis
- Start with small storage and add disks as needed on the fly. Sometimes Redis instances are scaled up because of capacity on the nodes. With OpenEBS persistent volumes, capacity can be thin provisioned and disks can be added to OpenEBS on the fly without disruption of service 
- Redis sometimes need highly available storage, in such cases OpenEBS volumes can be configured with 3 replicas.
- If required, take backup of the Redis data periodically and back them up to S3 or any object storage so that restoration of the same data is possible to the same or any other Kubernetes cluster

<br>

*Note: Redis can be deployed both as `deployment` or as `statefulset`. When Redis deployed as `statefulset`, you don't need to replicate the data again at OpenEBS level. When Redis is deployed as `deployment`, consider 3 OpenEBS replicas, choose the StorageClass accordingly.*

<br>

<hr>

<br>

## Deployment model

<br>

<img src="/docs/assets/svg/redis-deployment.svg" alt="OpenEBS and Redis" style="width:100%;">

<br>

<hr>

<br>

## Configuration workflow

<br>

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/v140/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect to Director Online (Optional)** : Connecting the Kubernetes cluster to <a href="https://director.mayadata.io" target="_blank">Director Online</a> provides good visibility of storage resources. Director Online has various **support options for enterprise customers**.

3. **Configure cStor Pool**

   After OpenEBS installation, cStor pool has to be configured. If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](/v140/docs/next/ugcstor.html#creating-cStor-storage-pools). Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below. During cStor Pool creation, make sure that the maxPools parameter is set to >=3. If cStor pool is already configured, go to the next step. 

4. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on given cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies are defined. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes.  Since Redis is a StatefulSet, it requires storage replication factor as 1. So cStor volume `replicaCount` is >=1. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStoveVolume Replica count as 1 is provided in the configuration details below.

5. **Launch and test Redis**

    Use stable Redis image with helm to deploy Redis in your cluster using the following command. In the following command, it will create a PVC with 8G size for data volume.

    ```
    helm install --set master.persistence.storageClass=openebs-cstor-disk stable/redis
    ```

    For more information on installation, see Redis [documentation](https://github.com/helm/charts/tree/master/stable/redis).

<br>

<hr>

<br>

## Reference at [openebs.ci](https://openebs.ci/)

<br>

A live deployment of Redis using OpenEBS volumes as highly available data storage can be seen at the website [www.openebs.ci](https://openebs.ci/)

Deployment YAML spec files for Redis and OpenEBS resources are found [here](https://github.com/openebs/e2e-infrastructure/blob/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/redis-cstor/redis-statefulset.yaml)

[OpenEBS-CI dashboard of Redis](https://openebs.ci/redis-cstor)



<br>

<hr>

<br>



## Post deployment Operations

<br>

**Monitor OpenEBS Volume size** 

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. However, an alert can be setup for volume size threshold using Director Online.

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just Redis database alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. See [cStorPool metrics](/v140/docs/next/ugcstor.html#monitor-pool).



<br>

<hr>

<br>





## Configuration details

<br>

**openebs-config.yaml**

```
#Use the following YAMLs to create a cStor Storage Pool.
# and associated storage class.
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  poolSpec:
    poolType: striped
  # NOTE - Appropriate disks need to be fetched using `kubectl get disks`
  #
  # `Disk` is a custom resource supported by OpenEBS with `node-disk-manager`
  # as the disk operator
# Replace the following with actual disk CRs from your cluster `kubectl get disks`
# Uncomment the below lines after updating the actual disk names.
  disks:
    diskList:
# Replace the following with actual disk CRs from your cluster from `kubectl get disks`
#   - disk-184d99015253054c48c4aa3f17d137b1
#   - disk-2f6bced7ba9b2be230ca5138fd0b07f1
#   - disk-806d3e77dd2e38f188fdaf9c46020bdc
#   - disk-8b6fb58d0c4e0ff3ed74a5183556424d
#   - disk-bad1863742ce905e67978d082a721d61
#   - disk-d172a48ad8b0fb536b9984609b7ee653
---
```

**openebs-sc-disk.yaml**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
      - name: ReplicaCount
        value: "1"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
---
```

<br>

<hr>

<br>

## See Also:

<br>

### [OpenEBS architecture](/v140/docs/next/architecture.html)

### [OpenEBS use cases](/v140/docs/next/usecases.html)

### [cStor pools overview](/v140/docs/next/cstor.html#cstor-pools)



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
