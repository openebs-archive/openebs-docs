---
id: jira
title: Using OpenEBS as storage for Jira on Kubernetes
sidebar_label: Jira
---
------

<img src="/v280/docs/assets/o-jira.png" alt="OpenEBS and Jira" style="width:400px;">	

## Introduction

Jira is a product designed to provide issue tracking and assist in moving tasks through the software development lifecycle.  For this example we are leveraging a container image created by Kelsey Hightower.  We will be creating a deployment and a service in this example.

## Requirements

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/v280/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

   If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](/v280/docs/next/ugcstor.html#creating-cStor-storage-pools).  Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the configuration details below. If cStor pool is already configured, go to the next step.

3. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. In this solution, we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the Step 3. Since Jira is a deployment application, it requires three replication at the storage level. So cStor volume `replicaCount` is 3. Sample YAML named **openebs-sc-disk.yaml** to consume cStor pool with cStor volume replica count as 3 is provided in the configuration details below.

## Deployment of Jira with OpenEBS

Next apply both the Jira deployment and service to your Kubernetes cluster.  There is an example at the bottom of this guide for both.

```
kubectl apply -f jira.yaml
```

## Verify Jira Pods

Run the following to get the status of PostgreSQL pods.

```
kubectl get pods
```

Following is an example output.

```
NAME                    READY   STATUS    RESTARTS   AGE
jira-5bd96c488d-2gj8p   1/1     Running   0          2d14h
```


## Configuration Details

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
        value: "3"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
---
```

**jira.yaml**

```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  labels:
    app: jira
  name: jira
spec:
  replicas: 1
  template:
    metadata:
      labels:
        app: jira
      name: jira
    spec:
      containers:
        - name: jira
          image: "doriftoshoes/jira:7.3.6"
          resources:
            requests:
              cpu: "2"
              memory: "2G"
          volumeMounts:
            - name: "jira-home"
              mountPath: /opt/jira-home
      volumes:
        - name: jira-home
          persistentVolumeClaim:
            claimName: demo-vol1-claim
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: jira
  name: jira
spec:
  ports:
    - port: 8080
      targetPort: 8080
  selector:
    app: jira
  type: LoadBalancer
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-cstor-disk
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10G

```
