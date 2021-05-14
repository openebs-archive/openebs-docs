---
id: elasticsearch
title: OpenEBS for Elasticsearch
sidebar_label: Elasticsearch
---

<img src="/v280/docs/assets/o-elastic.png" alt="OpenEBS and Elasticsearch" style="width:400px;">

<br>

## Introduction

<br>

EFK is the most popular cloud native logging solution on Kubernetes for On-Premise as well as cloud platforms. In the EFK stack, Elasticsearch is a stateful application that needs persistent storage. Logs of production applications need to be stored for a long time which requires reliable and highly available storage.  OpenEBS and EFK together provides a complete logging solution.



Advantages of using OpenEBS for Elasticsearch database:

- All the logs data is stored locally and managed natively to Kubernetes
- Start with small storage and add disks as needed on the fly
- Logs are highly available. When a node fails or rebooted during upgrades, the persistent volumes from OpenEBS continue to be highly available. 
- If required, take backup of the Elasticsearch database periodically and back them up to S3 or any object storage so that restoration of the same logs is possible to the same or any other Kubernetes cluster

<br>

*Note: Elasticsearch can be deployed both as `deployment` or as `statefulset`. When Elasticsearch deployed as `statefulset`, you don't need to replicate the data again at OpenEBS level. When Elasticsearch is deployed as `deployment`, consider 3 OpenEBS replicas, choose the StorageClass accordingly.*

<br>

<hr>

<br>



## Deployment model

<br>



<img src="/v280/docs/assets/svg/elasticsearch-deployment.svg" alt="OpenEBS and Elasticsearch" style="width:100%;">

<br>

<hr>

<br>

## Configuration workflow

<br>

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/v280/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

   After OpenEBS installation, cStor pool has to be configured. If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](/v280/docs/next/ugcstor.html#creating-cStor-storage-pools).  During cStor Pool creation, make sure that the maxPools parameter is set to >=3. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below. If cStor pool is already configured, go to the next step. 

4. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on given cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies are defined. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes.  Since Elasticsearch is a StatefulSet, it requires only single storage replica. So cStor volume `replicaCount` is >=1. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStor volume replica count as 1 is provided in the configuration details below.

5. **Launch and test Elasticsearch**

   Use latest Elasticsearch chart with helm to deploy Elasticsearch in your cluster using the following command. In the following command, it will create PVC with 30G size.

   ```
   helm install --name es-test --set volumeClaimTemplate.storageClassName=openebs-cstor-disk elastic/Elasticsearch --version 6.6.0-alpha1
   ```

   For more information on installation, see Elasticsearch [documentation](https://github.com/elastic/helm-charts/tree/master/elasticsearch).

<br>

<hr>

<br>

## Reference at [openebs.ci](https://openebs.ci/)

<br>



A live deployment of Elasticsearch with Kibana using OpenEBS volumes can be seen at the website [www.openebs.ci](https://openebs.ci/)

Deployment YAML spec files for Elasticsearch and OpenEBS resources are found [here](https://github.com/openebs/e2e-infrastructure/blob/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/efk-server/Elasticsearch/es-statefulset.yaml)

[OpenEBS-CI dashboard of Elasticsearch](https://openebs.ci/logging)

[Live access to Elasticsearch dashboard](https://e2elogs.openebs.ci/app/kibana)



<br>

<hr>

<br>



## Post deployment Operations

<br>

**Monitor OpenEBS Volume size** 

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. 

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just Elasticsearch database alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. See [cStorPool metrics](/v280/docs/next/ugcstor.html#monitor-pool). 



<br>

<hr>

<br>





## Configuration details

<br>



**openebs-config.yaml**

```yaml
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
  # NOTE - Appropriate disks need to be fetched using `kubectl get blockdevices -n openebs`
  #
  # `Block devices` is a custom resource supported by OpenEBS with `node-disk-manager`
  # as the disk operator
# Replace the following with actual disk CRs from your cluster `kubectl get blockdevices -n openebs`
# Uncomment the below lines after updating the actual disk names.
  blockDevices:
    blockDeviceList:
# Replace the following with actual disk CRs from your cluster from `kubectl get blockdevices -n openebs`
#   - blockdevice-69cdfd958dcce3025ed1ff02b936d9b4
#   - blockdevice-891ad1b581591ae6b54a36b5526550a2
#   - blockdevice-ceaab442d802ca6aae20c36d20859a0b
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

### [OpenEBS architecture](/v280/docs/next/architecture.html)

### [OpenEBS use cases](/v280/docs/next/usecases.html)

### [cStor pools overview](/v280/docs/next/cstor.html#cstor-pools)



<br>

<hr>

<br>
