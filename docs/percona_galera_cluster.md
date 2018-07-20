---
id: PerconaGalera
title: Using OpenEBS for Percona Galera Cluster
sidebar_label: Percona Galera Cluster
---
------

This section provides detailed instructions on how to perform the following tasks.

-   Run a 3-node Percona Galera cluster with OpenEBS storage in a Kubernetes environment
-   Test data replication across the Percona Xtradb mysql instances.

Galera Cluster
--------------

Percona XtraDB Cluster is an active/active highly available and scalable open source solution for MySQL clustering. It integrates Percona server and Percona XtraBackup with the Codership Galera library of MySQL high availability solutions in a single package. This folder contains the Kubernetes deployment specification YAMLs to setup the Galera cluster which includes the following.

-   A cluster service YAML which can be used for client connections (pxc-cluster)
-   The node deployment and service specification YAMLs to setup a 3-node replication cluster (pxc-node)

The image used in these pods is *capttofu/percona\_xtradb\_cluster\_5\_6:beta*. When deployment is 
created, following activities occur in the given order.

-   The Percona Xtradb containers start
-   Runs an entrypoint script which does the following.
    -   Installs the MySQL system tables
    -   Sets up users
    -   Builds a list of servers that is used with the galera parameter *wsrep\_cluster\_address*. This is a list of running nodes that Galera uses for electing a node to obtain Single State Transfer
        (SST).

For the prerequisites and running OpenEBS Operator, see Running OpenEBS Operator\_.

Deploying the Percona Galera Cluster with OpenEBS Storage
---------------------------------------------------------

The deployment specification YAMLs are available at *OpenEBS/k8s/demo/galera-xtradb-cluster/deployments*. 

Verify k8s cluster is running fine.

```
ubuntu@kubemaster-01:~/openebs/k8s/demo/galera-xtradb-cluster/deployments$ kubectl get nodes
NAME            STATUS    ROLES     AGE       VERSION
kubemaster-01   Ready     master    6h        v1.9.4
kubeminion-01   Ready     <none>    6h        v1.9.4
kubeminion-02   Ready     <none>    6h        v1.9.4
kubeminion-03   Ready     <none>    6h        v1.9.4
```

Verify OpenEBS pods are running fine with below command

```
ubuntu@kubemaster-01:~$ kubectl get pods -n openebs
NAME                                           READY     STATUS    RESTARTS   AGE
maya-apiserver-84fd4f776d-sq5sf                1/1       Running   0          20m
openebs-provisioner-74cb999586-fr9kf           1/1       Running   0         20m
openebs-snapshot-controller-6449b4cdbb-5n2qk   2/2       Running   0          20m
```

Clone latest OpenEBS repo and deploy your gallera application with OpenEBS.

```
git clone https://github.com/openebs/openebs.git
cd openebs/k8s/demo//galera-xtradb-cluster/deployments/
```

Run the following commands in the given order. 

```
kubectl apply -f pxc-cluster-service.yaml
```

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

Verify that all the replicas are up and running using the following command. :

    ubuntu@kubemaster-01:~/openebs/k8s/demo/galera-xtradb-cluster/deployments$ kubectl get pods
    NAME                                                             READY     STATUS    RESTARTS   AGE
    pvc-4e2ef5e4-7f81-11e8-9f2f-02b983f0a4db-ctrl-7fd86b86d-j9j62    2/2       Running   0          8m
    pvc-4e2ef5e4-7f81-11e8-9f2f-02b983f0a4db-rep-5f7664d5c7-5g98x    1/1       Running   0          8m
    pvc-4e2ef5e4-7f81-11e8-9f2f-02b983f0a4db-rep-5f7664d5c7-cv9r4    1/1       Running   0          8m
    pvc-4e2ef5e4-7f81-11e8-9f2f-02b983f0a4db-rep-5f7664d5c7-mv8nf    1/1       Running   0          8m
    pvc-b975e7cd-7f81-11e8-9f2f-02b983f0a4db-ctrl-68d7c9c478-pdd4w   2/2       Running   0          5m
    pvc-b975e7cd-7f81-11e8-9f2f-02b983f0a4db-rep-897675dc5-gmk5l     1/1       Running   0          5m
    pvc-b975e7cd-7f81-11e8-9f2f-02b983f0a4db-rep-897675dc5-hlksk     1/1       Running   0          5m
    pvc-b975e7cd-7f81-11e8-9f2f-02b983f0a4db-rep-897675dc5-jv9fn     1/1       Running   0          5m
    pvc-ebb3b0f7-7f81-11e8-9f2f-02b983f0a4db-ctrl-6b5ddddd88-srv42   2/2       Running   0          3m
    pvc-ebb3b0f7-7f81-11e8-9f2f-02b983f0a4db-rep-7c6784b7bd-2gntx    1/1       Running   0          3m
    pvc-ebb3b0f7-7f81-11e8-9f2f-02b983f0a4db-rep-7c6784b7bd-kxpp2    1/1       Running   0          3m
    pvc-ebb3b0f7-7f81-11e8-9f2f-02b983f0a4db-rep-7c6784b7bd-pxl6q    1/1       Running   0          3m
    pxc-node1-688f987789-rmvds                                       1/1       Running   0          8m
    pxc-node2-7f64f4cfd4-gt8sh                                       1/1       Running   0          5m
    pxc-node3-65ddfd699-xj4kc                                        1/1       Running   0          3m

Deployment Guidelines
---------------------

- OpenEBS recommends creating the Galera cluster with at least 3 nodes/replicas. Go to the following URL for details <https://www.percona.com/blog/2015/06/23/percona-xtradb-cluster-pxc-how-many-nodes-do-you-need/>.


-   You must deploy the service/pod for the primary node first, wait for it to be processed before starting the secondary/other nodes. Deploying all YAMLs together can cause the pods to restart repeatedly. The reason as stated in the Kubernetes documentation is "If there is a node in wsrep\_cluster\_address without a backing galera node there will be nothing to obtain SST from which will cause the node to shut itself down and the container in question to exit and relaunch".

Test Replication in the Galera Cluster
--------------------------------------

* Login to the database from any one of the node pod. It can be done by following command.

  `ubuntu@kubemaster-01:~/openebs/k8s/demo/galera-xtradb-cluster/deployments$ kubectl exec -it pxc-node1-688f987789-rmvds /bin/bash`

* Enter to mysql db and root user password for db is  ***c-krit***. 

  ```
  root@pxc-node1-688f987789-rmvds:/# mysql -uroot -p -h pxc-cluster;
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

* On the pxc-node1, create a test database with some content using the following commands. You have already entered into node1 using first step.

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

    ​

* Verify that this data is synchronized on the other nodes, for example, node2, using the following command.  

    ```
    ubuntu@kubemaster-01:~/openebs/k8s/demo/galera-xtradb-cluster/deployments$ kubectl exec -it pxc-node2-7f64f4cfd4-gt8sh /bin/bash

    root@pxc-node2-7f64f4cfd4-gt8sh:/# mysql -uroot -p -h pxc-cluster;
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
    ```

    ​

* Verify the multi-master capability of the cluster, by writing additional tables into the database using the following command. Use a node other than node1, for example node3. 

    ```
    ubuntu@kubemaster-01:~/openebs/k8s/demo/galera-xtradb-cluster/deployments$ kubectl exec -it pxc-node3-65ddfd699-xj4kc /bin/bash

    root@pxc-node3-65ddfd699-xj4kc:/# mysql -uroot -p -h pxc-cluster;
    Enter password:
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 12
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

    ​


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
