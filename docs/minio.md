---
id: minio
title: OpenEBS for Minio
sidebar_label: Minio
---
------

<img src="/docs/assets/o-minio.png" alt="OpenEBS and Minio" style="width:400px;">

<br>

## Introduction

<br>

Cloud native Object storage is easy to deploy with Minio and OpenEBS. Both run in user space and do not have any kernel dependencies. Minio and OpenEBS start with a very simple configuration of few gigabytes and scale on demand to very high capacities.



**Advantages of using OpenEBS for this Object storage solution:**

- PVCs to Minio are dynamically provisioned out of a dedicated or shared storage pool. You don't need to have dedicated disks On-Premise or on cloud to launch Object storage solution
- Adding more storage to the Kubernetes cluster with OpenEBS is seamless and done along with adding a Kubernetes node. Auto scaling of Minio instances is easy to do On-Premise as you do it on cloud platforms.
- Storage within a node or pool instance can also be scaled up on demand. 
- Complete management of disks under Minio are managed by OpenEBS, leading to production grade deployment of object storage

<br>

<hr>
<br>

## Deployment model

<br>

<img src="/docs/assets/svg/minio-deployment.svg" alt="OpenEBS and Minio" style="width:100%;">

<br>

<hr>
<br>

## Configuration workflow

<br>

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

    After OpenEBS installation, cStor pool has to be configured. If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](/docs/next/ugcstor.html#creating-cStor-storage-pools). Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below. During cStor Pool creation, make sure that the maxPools parameter is set to >=4. If cStor pool is already configured, go to the next step. 

4. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on given cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies are defined. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes.  Since Minio is a deployment, it requires high availability of data. So cStor volume `replicaCount` is >=4. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStor volume replica count as 4 is provided in the configuration details below.

5. **Launch and test Minio**

    Use stable minio image with helm to deploy Minio in your cluster using the following command. In the following command, it will create PVC with 10G size.

    ```
    helm install --name=minio-test --set mode=distributed,accessKey=minio,secretKey=minio123,persistence.storageClass=openebs-cstor-disk,service.type=NodePort,persistence.enabled=true stable/minio
    ```

    For more information on installation, see Minio [documentation](https://github.com/helm/charts/tree/master/stable/minio).

<br>

<hr>

<br>

## Post deployment Operations

<br>

**Monitor OpenEBS Volume size** 

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. 

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just Minio alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. See [cStorPool metrics](/docs/next/ugcstor.html#monitor-pool) 

<br>

<hr>

<br>

## Configuration details

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
  # NOTE - Appropriate disks need to be fetched using `kubectl get bd -n openebs`
  #
  # `Block devices` is a custom resource supported by OpenEBS with `node-disk-manager`
  # as the disk operator
# Replace the following with actual disk CRs from your cluster `kubectl get bd -n openebs`
# Uncomment the below lines after updating the actual disk names.
   blockDevices:
    blockDeviceList:
# Replace the following with actual disk CRs from your cluster from `kubectl get disks`
#    - blockdevice-69cdfd958dcce3025ed1ff02b936d9b4
#    - blockdevice-891ad1b581591ae6b54a36b5526550a2
#    - blockdevice-ceaab442d802ca6aae20c36d20859a0b

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

