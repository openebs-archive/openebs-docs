---
id: mysql
title: Using OpenEBS as storage for MySQL on Kubernetes
sidebar_label: MySQL
---
------

<img src="/docs/assets/o-mysql.png" alt="OpenEBS and Prometheus" style="width:400px;">

## Introduction

The MySQL server is a database server used to persist the data and provide a query interface for it (SQL). in this solution, running a MySQL replication cluster application which consumes OpenEBS cStor volume  to store the database in a kubernetes cluster.

## Requirements

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

   If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). If cStor pool is already configured, go to the next step. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below.

3. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the [Configure StoragePool](/docs/next/configurepools.html) section. Since MySQL master and slave are deployments, it requires high availability of data. So cStor volume `replicaCount` is 3. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStorVolume Replica count as 3 is provided in the configuration details below.

## Deployment of MySQL with openEBS

Sample MySQL replication cluster deployment YAML which has mysql-master.yaml and mysql-slave.yaml is provided in the Configuration below. Create two YAML files for  **mysql-master.yaml** and **mysql-slave.yaml**  and add the YAML content to it.

Apply the **mysql-master.yaml** using the below command  

```
kubectl apply -f mysql-master.yaml
```

Apply the **mysql-slave.yaml** using the below command  

```
kubectl apply -f mysql-slave.yaml
```

## Verify MySQL Pods

Run the following to get the status of MySQL master and slave pods.

```
kubectl get pods
```

Following is an example output.

```
NAME                            READY     STATUS    RESTARTS   AGE
mysql-master-5c8444b547-g5tzx   1/1       Running   0          1h
mysql-slave-7d8db6796f-85xnk    1/1       Running   0          1h
```

### Verify MySQL services

Go to the master pod and execute the following commands to check the MySQL status.

```
kubectl exec -it mysql-master-5c8444b547-g5tzx bash
```

Once you enter into the pod, do the following.

```
root@mysql-master-5c8444b547-g5tzx:/# mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 4
Server version: 5.7.21-log MySQL Community Server (GPL)

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
4 rows in set (0.00 sec)

mysql> create database demo;
Query OK, 1 row affected (0.07 sec)

mysql> create database demo;
Query OK, 1 row affected (0.07 sec)

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| demo               |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.00 sec)

```

Now Go to the slave pod and execute the following commands to check the MySQL status.

```
kubectl exec -it mysql-slave-7d8db6796f-85xnk bash
```

Once you enter into the pod, do the following.

```
root@mysql-slave-7d8db6796f-85xnk:/# mysql -u root -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 4
Server version: 5.7.21-log MySQL Community Server (GPL)

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| demo               |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
5 rows in set (0.00 sec)

```

This shows master data is synced with slave.

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

mysql-master.yaml

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: mysql-master
  labels:
    name: mysql-master
spec:
  replicas: 1
  selector:
    matchLabels:
      name: mysql-master
  template:
    metadata:
      labels:
        name: mysql-master
    spec:
      containers:
        - name: master
          image: openebs/tests-mysql-master
          args:
            - "--ignore-db-dir"
            - "lost+found"
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: "test"
            - name: MYSQL_REPLICATION_USER
              value: 'demo'
            - name: MYSQL_REPLICATION_PASSWORD
              value: 'demo'
          volumeMounts:
            - mountPath: /var/lib/mysql
              name: demo-vol1
      volumes:
        - name: demo-vol1
          persistentVolumeClaim:
            claimName: demo-vol1-claim
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
      storage: 5G
---
apiVersion: v1
kind: Service
metadata:
  name: mysql-master
  labels:
    name: mysql-master
spec:
  ports:
    - port: 3306
      targetPort: 3306
  selector:
      name: mysql-master
```

mysql-slave.yaml

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: mysql-slave
  labels:
    name: mysql-slave
spec:
  replicas: 1
  selector:
    matchLabels:
      name: mysql-slave
  template:
    metadata:
      labels:
        name: mysql-slave
    spec:
      containers:
        - name: slave
          image: openebs/tests-mysql-slave
          args: 
            - "--ignore-db-dir"
            - "lost+found"
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: "test"
            - name: MYSQL_REPLICATION_USER
              value: 'demo'
            - name: MYSQL_REPLICATION_PASSWORD
              value: 'demo'
          volumeMounts: 
            - mountPath: /var/lib/mysql
              name: demo-vol2
      volumes:
        - name: demo-vol2     
          persistentVolumeClaim:
            claimName: demo-vol2-claim
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol2-claim
spec:
  storageClassName: openebs-cstor-disk
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
---
apiVersion: v1
kind: Service
metadata:
  name: mysql-slave
  labels:
    name: mysql-slave
spec:
  ports:
    - port: 3306
      targetPort: 3306
  selector:
      name: mysql-slave
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
