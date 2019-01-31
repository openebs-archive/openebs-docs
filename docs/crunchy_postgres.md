---
id: CrunchyPostgres
title: Using OpenEBS for Crunchy Postgres
sidebar_label: Crunchy Postgres
---
------

This section provides instructions to run a PostgreSQL StatefulSet with OpenEBS storage and perform simple database operations to verify successful deployment.

About Crunchy Postgres
----------------------

The Postgres container used in the StatefulSet is sourced from CrunchyData.

CrunchyData provides cloud agnostic PostgreSQL container technology that is designed for production workloads with cloud native High Availability (HA), Disaster Recovery (DR), and monitoring.

Prerequisite
------------

A fully configured, preferably, multi-node Kubernetes cluster configured with the OpenEBS operator and OpenEBS storage classes. 

We are using OpenEBS cStor storage engine for running  Couchbase. Before starting, check the status of the cluster using the following command. 

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

Deploying the Crunchy-Postgres StatefulSet with OpenEBS Storage
---------------------------------------------------------------

The StatefulSet specification JSONs are available at *OpenEBS/k8s/demo/crunchy-postgres*.

The number of replicas in the StatefulSet can be modified in the *set.json* file. In this example uses two replicas, which includes one master and one slave. The Postgres pods are configured as primary/master or as replica/slave by a startup script which decides the role based on ordinality assigned to the pod. 

Run the following commands to get the files for running Crunchy-postgress application.

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-sa.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-service.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-primary-service.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-replica-service.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/run.sh
```

Once you have downloaded the files, you can do the following changes in *set.json* file.

You can change the **storageClassName** under **PersistentVolumeClaim** -> ***spec*** from *openebs-jiva-default* to *openebs-cstor-sparse*. 

After the modification done on required files, you can run the following command to change the permission on the run.sh file to install the Crunchy-postgress application.

```
 chmod +x run.sh
```

Now you can execute the following command to install the Crunchy-postgress application.

```
./run.sh
```

Verify that all the OpenEBS persistent volumes are created using the following command.

```
NAME             STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS           AGE
pgdata-pgset-0   Bound     pvc-10a7c731-f86b-11e8-9883-42010a8000b7   5G         RWO            openebs-cstor-sparse   17m
pgdata-pgset-1   Bound     pvc-80205b93-f86b-11e8-9883-42010a8000b7   5G         RWO            openebs-cstor-sparse   14m
```

Verify  that the Crunchy-Postgres services and pods are running using the following commands.

```
kubectl get pods
```

Output of above command will be similar to the following.

```
NAME      READY     STATUS    RESTARTS   AGE
pgset-0   1/1       Running   0          18m
pgset-1   1/1       Running   0          15m
```

You can get the services running status using the following command.

```
kubectl get svc
```

Output of above command will be similar to the following.

```
NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
kubernetes      ClusterIP   10.79.240.1     <none>        443/TCP    2d
pgset           ClusterIP   None            <none>        5432/TCP   20m
pgset-primary   ClusterIP   10.79.242.191   <none>        5432/TCP   20m
pgset-replica   ClusterIP   10.79.246.195   <none>        5432/TCP   19m
```

You can get the statefulset information status using the following command.

```
kubectl get statefulsets
```

Output of above command will be similar to the following.


    NAME      DESIRED   CURRENT   AGE
    pgset     2         2         20m

**Note:**

It may take some time for the pods to start as the images must be pulled and instantiated. This is also dependent on the network speed.

Verifying Successful Crunchy-Postgres Deployment
------------------------------------------------

You can verify the deployment using the following procedure.

-   Check cluster replication status between the Postgres primary and replica pods.
-   Create a table in the default database as Postgres user *testuser* on the primary pod
-   Check data synchronization on the replica pod for the table you have created
-   Verify that the table is not created on the replica pod

1. Install the PostgreSQL-Client 

    You can ssh to any of your Kubernetes Nodes and  install the PostgreSQL CLient Utility (psql) to perform database operations from the command line. 

   ```
   sudo apt-get install postgresql-client -y
   ```
2. Verify Cluster Replication Status on Crunchy-Postgres Cluster.

   Identify the IP Address of the primary (pgset-0) pod or the service (pgset-primary) .

   ```
   kubectl describe pod pgset-0 | grep IP
   ```

   Output of above command will be similar to the following.

   ```
   IP:             10.76.0.35
   ```

3.  Use the IP obtained from the above output in the following query and execute the following.

   ```
   psql -h 10.76.0.35 -U testuser postgres -c 'select * from pg_stat_replication'
   ```

   Output of above command will be similar to the following.

   ```
   pid | usesysid | usename | application_name | client_addr | client_hostname | client_port | backend_start | backend_xmin | state | sent_lsn | write_lsn | flush_lsn | replay_lsn | write_lag
   | flush_lag | replay_lag | sync_priority | sync_state
   -----+----------+-------------+------------------+-------------+-----------------+------------+-------------------------------+--------------+-----------+-----------+-----------+-----------+------------+-----------+-----------+------------+---------------+------------
   94 | 16391 | primaryuser | pgset-1 | 10.44.0.0 | | 60460 | 2018-12-05 09:29:21.990782-05 | |streaming | 0/3014278 | 0/3014278 | 0/3014278 | 0/3014278 | | | | 0 | async (1 row)
   ```

   The replica should be registered for *asynchronous* replication.

4.  Create a Table with Test Content on the Default Database

   The following queries should be executed on the primary pod. 

   ```
   $ psql -h 10.47.0.3 -U testuser postgres -c 'create table foo(id int)'
   Password for user testuser:
   CREATE TABLE
   test@Master:~/crunchy-postgres$ psql -h 10.47.0.3 -U testuser postgres -c 'insert into foo values (1)'
   Password for user testuser:
   INSERT 0 1
   ```

5.  Verify Data Synchronization on Replica

   Identify the IP Address of the replica (pgset-1) pod or the service (pgset-replica) using the following command.

   ````
    kubectl describe pod pgset-1 | grep IP
   ````

   Output of above command will be similar to the following.

   ```
   IP:             10.76.2.53
   ```

   Now use the above IP in the following command and execute the following command.

   ```
    psql -h 10.76.2.53 -U testuser postgres -c 'table foo'
   ```

   Output of above command will be similar to the following.

   ```
    id
   ----
     1
   (1 row)
   ```

   Verify that the table content is replicated successfully.

6. Verify Database Write is Restricted on Replica

   Attempt to create a new table on the replica using the following command and verify that the creation is unsuccessful. 

   ```
    psql -h 10.76.2.53 -U testuser postgres -c 'create table bar(id int)'
   ```

   Output of above command will be similar to the following.

   ```
   ERROR:  cannot execute CREATE TABLE in a read-only transaction
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
