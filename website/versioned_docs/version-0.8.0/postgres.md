---
id: version-0.8.0-postgres
title: OpenEBS for PostgreSQL
sidebar_label: PostgreSQL
original_id: postgres
---
------

<img src="/docs/assets/o-postgres.png" alt="OpenEBS and PostgreSQL" style="width:400px;">	

<br>

## Introduction

<br>

The PostgreSQL container used in the StatefulSet is sourced from [CrunchyData](https://github.com/CrunchyData/crunchy-containers). CrunchyData provides cloud agnostic PostgreSQL container technology that is designed for production workloads with cloud native High Availability, Disaster Recovery, and monitoring. PostgreSQL is deployed usually as a `statefulset` on Kubernetes and requires persistent storage for each instance of PostgreSQL StorageManager instance. OpenEBS provides persistent volumes on the fly when StorageManagers are scaled up.

<br>

**Advantages of using OpenEBS for PostgreSQL database:**

- No need to manage the local disks, they are managed by OpenEBS
- Large size PVs can be provisioned by OpenEBS and PostgreSQL
- Start with small storage and add disks as needed on the fly. Sometimes PostgreSQL instances are scaled up because of capacity on the nodes. With OpenEBS persistent volumes, capacity can be thin provisioned and disks can be added to OpenEBS on the fly without disruption of service 
- PostgreSQL sometimes need highly available storage, in such cases OpenEBS volumes can be configured with 3 replicas.
- If required, take backup of the PostgreSQL data periodically and back them up to S3 or any object storage so that restoration of the same data is possible to the same or any other Kubernetes cluster

<br>

*Note: PostgreSQL can be deployed both as `deployment` or as `statefulset`. When PostgreSQL deployed as `statefulset`, you don't need to replicate the data again at OpenEBS level. When PostgreSQL is deployed as `deployment`, consider 3 OpenEBS replicas, choose the StorageClass accordingly.*

<br>

<hr>

<br>

## Deployment model 

<br>

<img src="/docs/assets/svg/postgresql-deployment.svg" alt="OpenEBS and ElasticSearch" style="width:100%;">

As shown above, OpenEBS volumes need to be configured with single replica. This configuration work fine when the nodes (hence the cStor pool) is deployed across Kubernetes zones.

<br>

<hr>

<br>

## Configuration workflow

<br>

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect to MayaOnline (Optional)** : Connecting  the Kubernetes cluster to <a href="app.mayaonline.io" target="_blank">MayaOnline</a> provides good visibility of storage resources. MayaOnline has various **support options for enterprise customers**.

3. **Configure cStor Pool**

   If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). As PostgreSQL is a StatefulSet application, it requires single storage replication factor. During cStor Pool creation, make sure that the maxPools parameter is set to >=3. If cStor pool is already configured, go to the next step. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below.

4. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the [Configure StoragePool](/docs/next/configurepools.html) section. Since PostgreSQL is a StatefulSet application, it requires only one replication at the storage level. So cStor volume `replicaCount` is 1. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStorVolume Replica count as 1 is provided in the configuration details below.

5. **Launch and test PostgreSQL**

   Install PostgreSQL on OpenEBS volume using the following command.

   ```
   helm install --name my-release --storage-class=openebs-cstor-disk replication.slaveReplicas=2 stable/postgresql
   ```

<br>

<hr>

<br>

## Reference at <a href="https://openebs.ci" target="_blank">openebs.ci</a>

<br>

A live deployment of PostgreSQL using OpenEBS volumes can be seen at the website <a href="https://openebs.ci">www.openebs.ci</a>

Deployment YAML spec files for PostgreSQL and OpenEBS resources are found <a href="https://github.com/openebs/e2e-infrastructure/tree/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/postgresql-cstor" target="_blank">here</a>

 <a href="https://openebs.ci/postgresql-cstor" target="_blank">OpenEBS-CI dashboard of PostgreSQL





<br>

<hr>

<br>



## Post deployment Operations

<br>

**Monitor OpenEBS Volume size** 

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. However, an alert can be setup for volume size threshold using MayaOnline.

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just PostgreSQL database alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. See [cStorPool metrics](/docs/next/configurepools.html#verifying-pool-status) 



<br>

<hr>

<br>





## Configuration Details

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

### [OpenEBS architecture](/docs/next/architecture.html)

### [OpenEBS use cases](/docs/next/usecases.html)

### [cStor pools overview](/docs/next/cstor.html#cstor-pools)



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