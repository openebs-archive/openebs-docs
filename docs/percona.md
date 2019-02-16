---
id: percona
title: OpenEBS for Percona
sidebar_label: Percona
---
------

<img src="/docs/assets/o-percona.png" alt="OpenEBS and Percona" style="width:400px;">

## Introduction

Percona Server for MySQL is a free, fully compatible, enhanced and open source drop-in replacement for any MySQL database. In this solution , running a Percona-MySQL application pod which consumes OpenEBS cStor volume  to store the database in a kubernetes cluster.

## Deployment model 

<img src="/docs/assets/svg/percona-deployment.svg" alt="OpenEBS and Percona" style="width:100%;">

As shown above, OpenEBS volumes need to be configured with three replicas for high availability. This configuration work fine when the nodes (hence the cStor pool) is deployed across Kubernetes zones.



## Configuration workflow

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect to MayaOnline (Optional)** : Connecting  the Kubernetes cluster to <a href="app.mayaonline.io" target="_blank">MayaOnline</a> provides good visibility of storage resources. MayaOnline has various **support options for enterprise customers**.

3. **Configure cStor Pool**

   If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). If cStor pool is already configured, go to the next step. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below.

4. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies  are defined. In this solution we using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. Since Percona-MySQL is a deployment, it requires high availability of data at Storage level. So cStor volume `replicaCount` is 3. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStoveVolume Replica count as 3 is provided in the configuration details below.

5. **Configure PVC** : Percona deployment needs a volume with a replication factor as 3. See PVC example spec below.

6. **Launch and test Percona**:

   Run `kubectl apply -f percona-openebs-deployment.yaml` to deploy Percona application. For more information, see Percona documentation. In other way,  you can use stable Percona image with helm to deploy Percona in your cluster using the following command.

   ```
    helm install --name my-release --storage-class=openebs-sc-disk.yaml stable/percona 
   ```

## Reference at openebs.ci

A [sample Percona server](https://www.openebs.ci/percona-cstor) at [https://openebs.ci](https://openebs.ci/)

Sample YAML  for running Percona-mysql using cStor are [here](https://raw.githubusercontent.com/openebs/e2e-infrastructure/d536275e8c3d78f5c8ce1728b07eee26653b5056/production/percona-cstor/percona-openebs-deployment.yaml)

<a href="https://openebs.ci/percona-cstor" target="_blank">OpenEBS-CI dashboard of Percona</a>

## Post deployment Operations

**Monitor OpenEBS Volume size** 

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. However, an alert can be setup for volume size threshold using MayaOnline.

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just Prometheus alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. 

 

## Best Practices:

**Maintain volume replica quorum always**

**Maintain cStor pool used capacity below 80%**



## Troubleshooting guidelines 

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
        value: "3"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
---
```

**percona-pvc.yaml**

```
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
