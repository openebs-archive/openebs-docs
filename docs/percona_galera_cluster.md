---
id: PerconaGalera
title: Using OpenEBS for Percona Galera Cluster
sidebar_label: Percona Galera Cluster
---

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

The deployment specification YAMLs are available at *OpenEBS/k8s/demo/galera-xtradb-cluster/deployments*. Run the following commands in the given order. 

    test@Master:~/openebs$ cd k8s/demo/galera-xtradb-cluster/
    test@Master:~/openebs/k8s/demo/galera-xtradb-cluster$ ls -ltr
    total 16
    -rw-rw-r-- 1 test test 1802 Oct 30 17:44 pxc-node3.yaml
    -rw-rw-r-- 1 test test 1802 Oct 30 17:44 pxc-node2.yaml
    -rw-rw-r-- 1 test test 1797 Oct 30 17:44 pxc-node1.yaml
    -rw-rw-r-- 1 test test  174 Oct 30 17:44 pxc-cluster-service.yaml
    
    test@Master:~/openebs/k8s/demo/galera-xtradb-cluster$ kubectl apply -f pxc-cluster-service.yaml
    service "pxc-cluster" created
    testk@Master:~/openebs/k8s/demo/galera-xtradb-cluster$
    
    testk@Master:~/openebs/k8s/demo/galera-xtradb-cluster$ kubectl apply -f pxc-node1.yaml
    service "pxc-node1" created
    deployment "pxc-node1" created
    persistentvolumeclaim "datadir-claim-1" created

Wait until the pxc-node1 YAML is processed and repeat the step with pxc-node2 and pxc-node3 YAMLs.

Verify that all the replicas are up and running using the following command. :

    test@Master:~/galera-deployment$ kubectl get pods
    NAME                                                             READY     STATUS    RESTARTS   AGE
    maya-apiserver-2245240594-r7mj7                                  1/1       Running   0          2d
    openebs-provisioner-4230626287-nr6h4                             1/1       Running   0          2d
    pvc-235b15a5-bd1f-11e7-9be8-000c298ff5fc-ctrl-2525793473-nv88z   1/1       Running   0          12m
    pvc-235b15a5-bd1f-11e7-9be8-000c298ff5fc-rep-144100677-2rm8b     1/1       Running   0          12m
    pvc-235b15a5-bd1f-11e7-9be8-000c298ff5fc-rep-144100677-gmn51     1/1       Running   0          12m
    pvc-82885a9c-bd1e-11e7-9be8-000c298ff5fc-ctrl-2555717164-sspqn   1/1       Running   0          16m
    pvc-82885a9c-bd1e-11e7-9be8-000c298ff5fc-rep-3501200001-p9778    1/1       Running   0          16m
    pvc-82885a9c-bd1e-11e7-9be8-000c298ff5fc-rep-3501200001-x3nxs    1/1       Running   0          16m
    pvc-cc94c5eb-bd1f-11e7-9be8-000c298ff5fc-ctrl-15702123-tn460     1/1       Running   0          7m
    pvc-cc94c5eb-bd1f-11e7-9be8-000c298ff5fc-rep-4137665767-0lhjb    1/1       Running   0          7m
    pvc-cc94c5eb-bd1f-11e7-9be8-000c298ff5fc-rep-4137665767-h8r6j    1/1       Running   0          7m
    pxc-node1-2984138107-zjf22                                       1/1       Running   0          16m
    pxc-node2-1007987438-q831l                                       1/1       Running   0          12m
    pxc-node3-82203929-mh5p9                                         1/1       Running   0          7m

Deployment Guidelines
---------------------

- OpenEBS recommends creating the Galera cluster with at least 3 nodes/replicas. Go to the following URL for details <https://www.percona.com/blog/2015/06/23/percona-xtradb-cluster-pxc-how-many-nodes-do-you-need/>.


-   You must deploy the service/pod for the primary node first, wait for it to be processed before starting the secondary/other nodes. Deploying all YAMLs together can cause the pods to restart repeatedly. The reason as stated in the Kubernetes documentation is "If there is a node in wsrep\_cluster\_address without a backing galera node there will be nothing to obtain SST from which will cause the node to shut itself down and the container in question to exit and relaunch".

Test Replication in the Galera Cluster
--------------------------------------

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

* On the pxc-node1, create a test database with some content using the following commands. 

    test@Master:~/galera-deployment$ kubectl exec -it pxc-node1-2984138107-zjf22 /bin/bash
    root@pxc-node1-2984138107-zjf22:/# mysql -uroot -p -h pxc-cluster
    Enter password:
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 5
    Server version: 5.6.24-72.2-56-log Percona XtraDB Cluster (GPL), Release rel72.2, Revision 43abf03, WSREP version 25.11, wsrep_25.11
    
    Copyright (c) 2009-2015 Percona LLC and/or its affiliates
    Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.
    
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective owners.
    
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
    mysql> create database testdb;
    Query OK, 1 row affected (0.10 sec)
    
    mysql> use testdb;
    Database changed
    
    mysql> CREATE TABLE Hardware (Name VARCHAR(20),HWtype VARCHAR(20),Model VARCHAR(20));
    Query OK, 0 rows affected (0.11 sec)
    
    mysql> INSERT INTO Hardware (Name,HWtype,Model) VALUES ('TestBox','Server','DellR820');
    Query OK, 1 row affected (0.06 sec)
    
    ```
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

    test@Master:~/galera-deployment$ kubectl exec -it pxc-node2-1007987438-q831l /bin/bash
    root@pxc-node2-1007987438-q831l:/#
    root@pxc-node2-1007987438-q831l:/#
    root@pxc-node2-1007987438-q831l:/# mysql -uroot -p -h pxc-cluster
    Enter password:
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 4
    Server version: 5.6.24-72.2-56-log Percona XtraDB Cluster (GPL), Release rel72.2, Revision 43abf03, WSREP version 25.11, wsrep_25.11
    
    Copyright (c) 2009-2015 Percona LLC and/or its affiliates
    Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.
    
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective owners.
    
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
    ```
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
    5 rows in set (0.00 sec)
    mysql> use testdb;
    Database changed
    mysql> show tables;
    +------------------+
    | Tables_in_testdb |
    +------------------+
    | Hardware         |
    +------------------+
    1 row in set (0.00 sec)
    
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

* Verify the multi-master capability of the cluster, by writing additional tables into the database using the following command. Use a node other than node1, for example node3. 

    test@Master:~/galera-deployment$ kubectl exec -it pxc-node3-82203929-mh5p9 /bin/bash
    root@pxc-node3-82203929-mh5p9:/#
    root@pxc-node3-82203929-mh5p9:/#
    root@pxc-node3-82203929-mh5p9:/# mysql -uroot -p -h pxc-cluster;
    Enter password:
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 6
    Server version: 5.6.24-72.2-56-log Percona XtraDB Cluster (GPL), Release rel72.2, Revision 43abf03, WSREP version 25.11, wsrep_25.11
    
    Copyright (c) 2009-2015 Percona LLC and/or its affiliates
    Copyright (c) 2000, 2015, Oracle and/or its affiliates. All rights reserved.
    
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective owners.
    
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
```
    mysql>
    
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
    5 rows in set (0.00 sec)
    
    mysql> use testdb;
    Reading table information for completion of table and column names
    You can turn off this feature to get a quicker startup with -A
    
    Database changed
    mysql>
    
    mysql> INSERT INTO Hardware (Name,HWtype,Model) VALUES ('ProdBox','Server','DellR720');
    Query OK, 1 row affected (0.03 sec)
    
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
