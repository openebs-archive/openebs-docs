---
id: mongo
title: OpenEBS for MongoDB
sidebar_label: MongoDB
---

<img src="/docs/assets/svg/o-mongo.svg" alt="OpenEBS and MongoDB" style="width:400px;">

## Introduction

MongoDB is a cross-platform document-oriented database. Classified as a NoSQL database, MongoDB eschews the traditional table-based relational database structure in favor of JSON-like documents with dynamic schemas, making the integration of data in certain types of applications easier and faster. In this solution, running a MongoDB StatefulSet application on OpenEBS cStor volume using helm chart.



## Deployment model



<img src="/docs/assets/svg/mongo-deployment.svg" alt="OpenEBS and Mongo" style="width:100%;">



## Configuration workflow

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect to MayaOnline (Optional)** : Connecting the Kubernetes cluster to [MayaOnline](https://staging-docs.openebs.io/docs/next/app.mayaonline.io) provides good visibility of storage resources. MayaOnline has various **support options for enterprise customers**.

3. **Configure cStor Pool**

   After OpenEBS installation, cStor pool has to be configured.If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html).  During cStor Pool creation, make sure that the maxPools parameter is set to >=3. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below. If cStor pool is already configured, go to the next step. 

4. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on given cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies are defined. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes.  Since MongoDB is a StatefulSet, it requires only single storage replica. So cStor voume `replicaCount` is >=1. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStoveVolume Replica count as 1 is provided in the configuration details below.

5. **Launch and test MongoDB**

   Use stable MongoDB chart with helm to deploy MongoDB application in your cluster using the following command. In the following command, it will create PVC with 8Gi size with a storage replication factor 1.

   ```
   helm install --name my-release --set persistence.storageClass=openebs-cstor-disk stable/mongodb
   ```

   For more information on installation, see MongoDB [documentation](https://github.com/helm/charts/tree/master/stable/mongodb).



## Reference at [openebs.ci](https://openebs.ci/)

A live deployment of MongoDB using OpenEBS volumes can be seen at the website [www.openebs.ci](https://openebs.ci/)

Deployment YAML spec files for MongoDB and OpenEBS resources are found [here](https://github.com/openebs/e2e-infrastructure/blob/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/mongo-cstor/mongo-cstor-mongo.yaml)

[OpenEBS-CI dashboard of MongoDB](https://openebs.ci/mongo-cstor)



## Post deployment Operations

**Monitor OpenEBS Volume size**

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. However, an alert can be setup for volume size threshold using MayaOnline.

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just MongoDB application alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold.



## Best Practices:

**Maintain volume replica quorum always**

**Maintain cStor pool used capacity below 80%**



## Troubleshooting Guidelines

**Read-Only volume**

**Snapshots were failing**



## Configuration details

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

## See Also:



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
