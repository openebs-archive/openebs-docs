---
id: jira
title: Using OpenEBS as storage for Jira on Kubernetes
sidebar_label: Jira
---
------

<img src="/docs/assets/o-jira.png" alt="OpenEBS and Jira" style="width:400px;">	

## Introduction

Jira is a product designed to provide issue tracking and assist in moving tasks through the software development lifecycle.  For this example we are leveraging a container image created by Kelsey Hightower.  We will be creating a deployment and a service in this example.

## Requirements

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

   If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html).  Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the configuration details below. If cStor pool is already configured, go to the next step.

3. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. In this solution, we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the [Configure StoragePool](/docs/next/configurepools.html) section. Since Jira is a deployment application, it requires three replication at the storage level. So cStor volume `replicaCount` is 3. Sample YAML named **openebs-sc-disk.yaml** to consume cStor pool with cStorVolume Replica count as 3 is provided in the configuration details below.

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
          image: "gcr.io/hightowerlabs/jira:7.3.6-standalone"
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
