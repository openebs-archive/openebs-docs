---
id: PerconaGalera
title: Using OpenEBS for Percona Galera Cluster
sidebar_label: Percona Galera Cluster
---
------

This section provides detailed instructions on how to perform the following tasks.

- Run a 3-node Percona Galera cluster with OpenEBS storage in a Kubernetes environment
- Test data replication across the Percona Xtradb mysql instances.

## Galera Cluster

Percona XtraDB Cluster is an active/active highly available and scalable open source solution for MySQL clustering. It integrates Percona server and Percona XtraBackup with the Codership Galera library of MySQL high availability solutions in a single package. This folder contains the Kubernetes deployment specification YAMLs to setup the Galera cluster which includes the following.

- A cluster service YAML which can be used for client connections (pxc-cluster)
- The node deployment and service specification YAMLs to setup a 3-node replication cluster (pxc-node)

The image used in these pods is *capttofu/percona\_xtradb\_cluster\_5\_6:beta*. When deployment is 
created, following activities occur in the given order.

- The Percona Xtradb containers start
- Runs an entrypoint script which does the following.
    - Installs the MySQL system tables
    - Sets up users
    -   Builds a list of servers that is used with the galera parameter *wsrep\_cluster\_address*. This is a list of running nodes that Galera uses for electing a node to obtain Single State Transfer
        (SST).

For the prerequisites and running OpenEBS Operator, see Running OpenEBS Operator\_.

## Deploying the Percona Galera Cluster with OpenEBS Storage

We are using OpenEBS cStor storage engine for running Percona Galera Clsuter. Before starting, check the status of the cluster using the following command. 

```
kubectl get nodes
```

The following output shows the status of the nodes in the cluster.

```
NAME                                         STATUS    ROLES     AGE       VERSION
gke-ranjith-080-default-pool-8d4e3480-b50p   Ready     <none>    1d        v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-qsvn   Ready     <none>    1d        v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-rb03   Ready     <none>    1d        v1.9.7-gke.11
```

Also make sure that you have deployed OpenEBS in your cluster. If not deployed, you can install from [here](/docs/next/quickstartguide.html).

You can check the status of OpenEBS pods by running following command.

```
kubectl get pod -n openebs
```

Output of above command will be similar to the following.

```
NAME                                        READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-k0b1-5877cfdf6d-pb8n5     2/2       Running   0          3h
cstor-sparse-pool-z8sr-668f5d9b75-z9547     2/2       Running   0          3h
cstor-sparse-pool-znj9-6b84f659db-hwzvn     2/2       Running   0          3h
maya-apiserver-7bc857bb44-qpjr4             1/1       Running   0          3h
openebs-ndm-9949m                           1/1       Running   0          3h
openebs-ndm-pnm25                           1/1       Running   0          3h
openebs-ndm-stkjp                           1/1       Running   0          3h
openebs-provisioner-b9fb58d6d-tdpx7         1/1       Running   0          3h
openebs-snapshot-operator-bb5697c8d-qlglr   2/2       Running   0          3h
```

Run the following command to install Percoan Galera services. 

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/galera-xtradb-cluster/deployments/pxc-cluster-service.yaml
```

Download the following files from OpenEBS repo and change the **storageClassName** under **PersistentVolumeClaim** -> ***spec*** from *openebs-jiva-default* to *openebs-cstor-sparse*. 

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/galera-xtradb-cluster/deployments/pxc-node1.yaml
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/galera-xtradb-cluster/deployments/pxc-node2.yaml
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/galera-xtradb-cluster/deployments/pxc-node3.yaml
```

After the modification on the downloaded files, you can run following commands to install the Percona galera DB application on cStor volume.

```
kubectl apply -f pxc-node1.yaml
```

Wait until the pxc-node1.yaml is processed and repeat the step with pxc-node2 .

```
kubectl apply -f pxc-node2.yaml
```

Wait until the pxc-node2.yaml is processed and repeat the step with pxc-node3 .

```
kubectl apply -f pxc-node3.yaml
```

Get the status of OpenEBS cStor running pods using the following command. 

```
kubectl get pods -n openebs
```

Output of above command will be similar to the following. In the following output, it will list the cStor target pod since this application uses default cStor StorageClass;*openebs-cstor-sparse* ,so it will contain 3 cStor target pods.

    NAME                                                              READY     STATUS    RESTARTS   AGE
    cstor-sparse-pool-k0b1-5877cfdf6d-pb8n5                           2/2       Running   0          4h
    cstor-sparse-pool-z8sr-668f5d9b75-z9547                           2/2       Running   0          4h
    cstor-sparse-pool-znj9-6b84f659db-hwzvn                           2/2       Running   0          4h
    maya-apiserver-7bc857bb44-qpjr4                                   1/1       Running   0          4h
    openebs-ndm-9949m                                                 1/1       Running   0          4h
    openebs-ndm-pnm25                                                 1/1       Running   0          4h
    openebs-ndm-stkjp                                                 1/1       Running   0          4h
    openebs-provisioner-b9fb58d6d-tdpx7                               1/1       Running   0          4h
    openebs-snapshot-operator-bb5697c8d-qlglr                         2/2       Running   0          4h
    pvc-3fc3477a-f7ad-11e8-9883-42010a8000b7-target-65f9c49dc725xgf   3/3       Running   0          8m
    pvc-79f9051d-f7ac-11e8-9883-42010a8000b7-target-b47f7fdb7-kplwh   3/3       Running   0          13m
    pvc-f1c0ef41-f7ab-11e8-9883-42010a8000b7-target-78fd89c875jwpxx   3/3       Running   0          17m

Get the status of percona galera DB running pods using the following command. 

```
kubectl get pods
```

Output of above command will be similar to the following.

```
NAME                         READY     STATUS    RESTARTS   AGE
pxc-node1-688f987789-9tvz5   1/1       Running   0          18m
pxc-node2-7f64f4cfd4-qrsz8   1/1       Running   0          15m
pxc-node3-65ddfd699-nk62z    1/1       Running   0          9m
```

## Deployment Guidelines

- OpenEBS recommends creating the Galera cluster with at least 3 nodes/replicas. Go [here](https://www.percona.com/blog/2015/06/23/percona-xtradb-cluster-pxc-how-many-nodes-do-you-need) for details.

- You must deploy the service/pod for the primary node first, wait for it to be processed before starting the secondary/other nodes. Deploying all YAMLs together can cause the pods to restart repeatedly. The reason as stated in the Kubernetes documentation is "If there is a node in wsrep\_cluster\_address without a backing galera node there will be nothing to obtain SST from which will cause the node to shut itself down and the container in question to exit and relaunch".

## Test Replication in the Galera Cluster

* Login to the database from any one of the node pod. It can be done by following command.

  ```
  kubctl exec -it <percona galera DB pod> /bin/bash
  ```

  **Example:**

  ```
   kubectl exec -it pxc-node1-688f987789-9tvz5 /bin/bash
  ```

* Enter to mysql db and root user password for db is  ***c-krit***. 

  ```
  root@pxc-node1-688f987789-9tvz5:/# mysql -uroot -p -h pxc-cluster;
  Enter password:
  Welcome to the MySQL monitor.  Commands end with ; or \g.
  Your MySQL connection id is 6
  Server version: 5.6.24-72.2-56-log Percona XtraDB Cluster (GPL), Release rel72.2, Revision 43abf03, WSREP version 25.11, wsrep_25.11
  
  Copyright (c) 2009-2015 Percona LLC and/or its affiliates
  Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.
  
  Oracle is a registered trademark of Oracle Corporation and/or its
  affiliates. Other names may be trademarks of their respective
  owners.
  
  Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
  ```

* Check the replication cluster size on any of the nodes using the following command. 

  ```
   mysql> show status like 'wsrep_cluster_size';
      +--------------------+-------+
      | Variable_name      | Value |
      +--------------------+-------+
      | wsrep_cluster_size | 3     |
      +--------------------+-------+
      1 row in set (0.01 sec)
  ```

* Currently you are inside node1. You can  create a test database with some content using the following mysql commands. 

    ```
    mysql> create database testdb;
    Query OK, 1 row affected (0.10 sec)
    
    mysql> use testdb;
    Database changed
    
    mysql> CREATE TABLE Hardware (Name VARCHAR(20),HWtype VARCHAR(20),Model VARCHAR(20));
    Query OK, 0 rows affected (0.11 sec)
    
    mysql> show tables;
    +------------------+
    | Tables_in_testdb |
    +------------------+
    | Hardware         |
    +------------------+
    1 row in set (0.00 sec)
    
    mysql> INSERT INTO Hardware (Name,HWtype,Model) VALUES ('TestBox','Server','DellR820');
    Query OK, 1 row affected (0.06 sec)
    
    mysql> select * from Hardware;
    
    +---------+--------+----------+
    | Name    | HWtype | Model    |
    +---------+--------+----------+
    | TestBox | Server | DellR820 |
    +---------+--------+----------+
    1 row in set (0.00 sec)
    
    mysql> exit
    Bye
    ```

* Verify that this data is synchronized on the other nodes, for example, node2, using the following command. 

    ```
    kubectl exec -it pxc-node2-7f64f4cfd4-qrsz8 /bin/bash
    ```

    Now you are inside the node2 pod.

    ```
    root@pxc-node2-7f64f4cfd4-qrsz8:/# mysql -uroot -p -h pxc-cluster;
    Enter password:
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 7
    Server version: 5.6.24-72.2-56-log Percona XtraDB Cluster (GPL), Release rel72.2, Revision 43abf03, WSREP version 25.11, wsrep_25.11
    Copyright (c) 2009-2015 Percona LLC and/or its affiliates
    Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective
    owners.
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
    mysql> show status like 'wsrep_cluster_size';
    +--------------------+-------+
    | Variable_name      | Value |
    +--------------------+-------+
    | wsrep_cluster_size | 3     |
    +--------------------+-------+
    1 row in set (0.01 sec)
    
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | information_schema |
    | mysql              |
    | performance_schema |
    | test               |
    | testdb             |
    +--------------------+
    5 rows in set (0.01 sec)
    
    mysql> use testdb;
    Reading table information for completion of table and column names
    You can turn off this feature to get a quicker startup with -A
    Database changed
    
    mysql> select * from Hardware;
    +---------+--------+----------+
    | Name    | HWtype | Model    |
    +---------+--------+----------+
    | TestBox | Server | DellR820 |
    +---------+--------+----------+
    1 row in set (0.00 sec)
    
    mysql> exit
    Bye
    ```

* Verify the multi-master capability of the cluster, by writing additional tables into the database using the following command. Use a node other than node1, for example node3.  You can login to node3 pod using the following command.

    ```
    kubectl exec -it pxc-node3-65ddfd699-nk62z /bin/bash
    ```

    Now you are inside the Node3 pod. You can perform following mysql command to verify your database.

    ```
    root@pxc-node3-65ddfd699-nk62z:/# mysql -uroot -p -h pxc-cluster;
    Enter password:
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 5
    Server version: 5.6.24-72.2-56-log Percona XtraDB Cluster (GPL), Release rel72.2, Revision 43abf03, WSREP version 25.11, wsrep_25.11
    
    Copyright (c) 2009-2015 Percona LLC and/or its affiliates
    Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.
    
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective
    owners.
    
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
    mysql>
    mysql>  show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | information_schema |
    | mysql              |
    | performance_schema |
    | test               |
    | testdb             |
    +--------------------+
    5 rows in set (0.00 sec)
    
    mysql> show status like 'wsrep_cluster_size';
    +--------------------+-------+
    | Variable_name      | Value |
    +--------------------+-------+
    | wsrep_cluster_size | 3     |
    +--------------------+-------+
    1 row in set (0.00 sec)
    
    mysql> use testdb;
    Reading table information for completion of table and column names
    You can turn off this feature to get a quicker startup with -A
    
    Database changed
    mysql>  select * from Hardware;
    +---------+--------+----------+
    | Name    | HWtype | Model    |
    +---------+--------+----------+
    | TestBox | Server | DellR820 |
    +---------+--------+----------+
    1 row in set (0.00 sec)
    
    mysql> INSERT INTO Hardware (Name,HWtype,Model) VALUES ('ProdBox','Server','DellR720');
    Query OK, 1 row affected (0.06 sec)
    
    mysql> select * from Hardware;
    +---------+--------+----------+
    | Name    | HWtype | Model    |
    +---------+--------+----------+
    | TestBox | Server | DellR820 |
    | ProdBox | Server | DellR720 |
    +---------+--------+----------+
    2 rows in set (0.00 sec)
    
    mysql> exit
    Bye
    ```

* Verify that this data is synchronized on the other nodes, for example, node2, using the following command. 

    ```
    kubectl exec -it pxc-node2-7f64f4cfd4-qrsz8 /bin/bash
    ```

    Now you are inside the Node2 pode.

    ```
    root@pxc-node2-7f64f4cfd4-qrsz8:/# mysql -uroot -p -h pxc-cluster;
    Enter password:
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 7
    Server version: 5.6.24-72.2-56-log Percona XtraDB Cluster (GPL), Release rel72.2, Revision 43abf03, WSREP version 25.11, wsrep_25.11
    Copyright (c) 2009-2015 Percona LLC and/or its affiliates
    Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective
    owners.
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
    mysql> use testdb;
    Database changed
    
    mysql> INSERT INTO Hardware (Name,HWtype,Model) VALUES ('ProdBox','Server','DellR720');
    Query OK, 1 row affected (0.10 sec)
    
    mysql> select * from Hardware;
    +---------+--------+----------+
    | Name    | HWtype | Model    |
    +---------+--------+----------+
    | TestBox | Server | DellR820 |
    | ProdBox | Server | DellR720 |
    +---------+--------+----------+
    2 rows in set (0.00 sec)
    
    mysql> exit
    Bye
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
