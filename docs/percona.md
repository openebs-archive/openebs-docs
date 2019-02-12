---
id: percona
title: OpenEBS for Percona
sidebar_label: Percona
---
------

<img src="/docs/assets/o-percona.png" alt="OpenEBS and Prometheus" style="width:400px;">

## Introduction

Percona Server for MySQL is a free, fully compatible, enhanced and open source drop-in replacement for any MySQL database. in this solution , running a percona-mysql application pod which consumes OpenEBS cStor volume  to storge the database in a kubernetes cluster.

## Requirements

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

   If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). If cStor pool is already configured, go to the next step. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below.

3. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the [Configure StoragePool](/docs/next/configurepools.html) section. Since Percona-mysql is a depleoyement, it requires high availability of data. So cStor voume `replicaCount` is 3. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStoveVolume Replica count as 3 is provided in the configuration details below.

## Deployment of Percona with OpenEBS 

Sample  Percona deployement YAML is provided in the Configuration below. Create a YAML file called **percona-openebs-deployment.yaml** and add the YAML content to it.

Apply the **percona-openebs-deployment.yaml** using the below command  

```
kubectl apply -f percona-openebs-deployment.yaml
```

### Verify Percona Pods

Run the following to get the status of Percona-mysql pods.

```
kubectl get pods
```

Following is an example output.

```
NAME      READY     STATUS    RESTARTS   AGE
percona   1/1       Running   0          5m

```

## Sample Percona Deployment at openebs.ci

A [sample Percona server](https://www.openebs.ci/percona-cstor) at [https://openebs.ci](https://openebs.ci/)

Sample YAML  for running Percona-mysql using cStor are [here](https://github.com/openebs/e2e-infrastructure/tree/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/percona-cstor)



## Best Practices:



## Troubleshooting Guidelines



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
        value: "3"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
---
```

**percona-openebs-deployment.yaml**

```
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: percona
  namespace: percona-cstor	
  labels:
    app: percona
    type: workload
spec:
  replicas: 1
  selector: 
    matchLabels:
      name: percona 
  template: 
    metadata:
      labels: 
        name: percona
        type: workload
    spec:
      tolerations:
      - key: "ak"
        value: "av"
        operator: "Equal"
        effect: "NoSchedule"
      containers:
        - resources:
            limits:
              cpu: 0.5
          name: percona
          image: percona:latest
          args:
            - "--ignore-db-dir"
            - "lost+found"
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: k8sDem0
          ports:
            - containerPort: 3306
              name: percona
          volumeMounts:
            - mountPath: /var/lib/mysql
              name: percona-cstor-volume
      volumes:
        - name: percona-cstor-volume
          persistentVolumeClaim:
            claimName: percona-cstor-claim
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: percona-cstor-claim
  namespace: percona-cstor
spec:
  storageClassName: openebs-cstor-disk
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 30G
---
apiVersion: v1
kind: Service
metadata:
  name: percona-mysql
  namespace: percona-cstor
  labels:
    name: percona-mysql
spec:
  ports:
    - port: 3306
      targetPort: 3306
  selector:
      name: percona
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
