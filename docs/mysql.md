---
id: mysql
title: Managed database service like RDS
sidebar_label: MySQL
---
------

<img src="/docs/assets/o-mysql.png" alt="OpenEBS and MySQL" style="width:400px;">

## Introduction

The MySQL server is a database server used to persist the data and provide a query interface for it (SQL). in this solution, running a MySQL replication cluster application which consumes OpenEBS cStor volume  to store the database in a kubernetes cluster.



## Deployment model 



As shown above, OpenEBS volumes need to be configured with three replicas for high availability. This configuration work fine when the nodes (hence the cStor pool) is deployed across Kubernetes zones.



## Configuration workflow

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect to MayaOnline (Optional)** : Connecting  the Kubernetes cluster to <a href="app.mayaonline.io" target="_blank">MayaOnline</a> provides good visibility of storage resources. MayaOnline has various **support options for enterprise customers**.

3. **Configure cStor Pool** : After OpenEBS installation,  cStor pool has to be configured. As MySQL is a deployment, it need high availability at storage levele. OpenEBS cStor volume has to be configured with 3 replica. During cStor Pool creation, make sure that the maxPools parameter is set to >=3. If cStor Pool is already configured as required go to Step 4 to create MySQL StorageClass. 

4. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies  are defined. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. Since MySQL is a deployments, it requires high availability of data at storage level. So cStor volume `replicaCount` is 3. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStorVolume Replica count as 3 is provided in the configuration details below.

5. **Launch and test Mysql**:

   Run MySQL database application using the stable helm chart. The following command  will install MySQL database application in your cluster. This command will create a PVC of size 8Gi for running the database.

   ```
   helm install --name my-release --set persistence.storageClass=openebs-cstor-disk stable/mysql
   ```

    For more information about installation, see MySQL [documentation](https://github.com/helm/charts/tree/master/stable/mysql).


## Reference at <a href="https://openebs.ci" target="_blank">openebs.ci</a>

A live deployment of MySQL using OpenEBS volumes as highly available Database storage can be seen at the website <a href="https://openebs.ci">www.openebs.ci</a>



Deployment yaml spec files for MySQL and OpenEBS resources are found <a href="https://github.com/openebs/e2e-infrastructure/tree/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/prometheus-cstor" target="_blank">here</a>



 <a href="https://openebs.ci/prometheus-cstor" target="_blank">OpenEBS-CI dashboard of MySQL</a>



<a href="https://prometheuscstor.openebs.ci/" target="_blank">Live access to MySQL dashboard</a>



## Post deployment Operations

**Monitor OpenEBS Volume size** 

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. However, an alert can be setup for volume size threshold using MayaOnline.

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just MySQL alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. 

 

## Best Practices:

**Maintain volume replica quorum always**

**Maintain cStor pool used capacity below 80%**



## Troubleshooting Guidelines

**Read-Only volume**

**Snapshots were failing**



## Configuration Details

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
        value: "3"       
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
