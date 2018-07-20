---
id: CockroachDB
title: Using OpenEBS for CockroachDB
sidebar_label: CockroachDB
---
------

CockroachDB is a distributed SQL database built on a transactional and strongly-consistent key-value store. It scales horizontally; survives disk, machine, rack, and even datacenter failures with minimal latency
disruption and no manual intervention; supports strongly-consistent ACID transactions; and provides a familiar SQL API for structuring, manipulating, and querying data.

This section demonstrates the deployment of CockroachDB as a StatefulSet in a Kubernetes cluster. You will be able to spawn a CockroachDB StatefulSet that will use OpenEBS as its persistent storage.

Benefits of Deploying CockroachDB as a StatefulSet
--------------------------------------------------

Deploying CockroachDB as a StatefulSet provides the following benefits.

-   Stable unique network identifiers
-   Stable persistent storage
-   Ordered graceful deployment and scaling
-   Ordered graceful deletion and termination

Deploying CockroachDB with Persistent Storage
---------------------------------------------

Before starting, check the status of the cluster using the following command. 

    ubuntu@kubemaster-01:~$ kubectl get nodes
    NAME            STATUS    ROLES     AGE       VERSION
    kubemaster-01   Ready     master    1d        v1.9.4
    kubeminion-01   Ready     <none>    1d        v1.9.4
    kubeminion-02   Ready     <none>    1d        v1.9.4
    kubeminion-03   Ready     <none>    1d        v1.9.4

Also make sure that you have deployed OpenEBS in your cluster.

```
ubuntu@kubemaster-01:~/openebs/k8s$ kubectl get pods -n openebs
NAME                                           READY     STATUS    RESTARTS   AGE
maya-apiserver-17fd5l776d-wvxrp                1/1       Running   0          4m
openebs-provisioner-24ab929502-461s7           1/1       Running   0          4m
openebs-snapshot-controller-6449b4cdcc-34fx4   2/2       Running   0          4m
```

Do ssh to kubemaster and download and apply the CockroachDB YAMLs from the OpenEBS repository
using the following commands. 

    git clone https://github.com/openebs/openebs.git
    cd openebs/k8s/demo/cockroachDB/

```
kubectl apply -f cockroachdb-sc.yaml
kubectl apply -f cockroachdb-sts.yaml
kubectl apply -f cockroachdb-svc.yaml
```

Get the status of running pods using the following command. 

    ubuntu@kubemaster-01:~/openebs/k8s/demo/cockroachDB$ kubectl get pods
    NAME                                                             READY     STATUS    RESTARTS   AGE
    cockroachdb-0                                                    1/1       Running   0          24m
    cockroachdb-1                                                    1/1       Running   0          23m
    cockroachdb-2                                                    1/1       Running   0          18m
    pvc-24b487f3-79f2-11e8-bc7b-02b983f0a4db-ctrl-5c447d79c9-ghvr9   2/2       Running   0          18m
    pvc-24b487f3-79f2-11e8-bc7b-02b983f0a4db-rep-546b8496c5-6spc9    1/1       Running   0          18m
    pvc-24b487f3-79f2-11e8-bc7b-02b983f0a4db-rep-546b8496c5-grgkb    1/1       Running   0          18m
    pvc-24b487f3-79f2-11e8-bc7b-02b983f0a4db-rep-546b8496c5-mk5mk    1/1       Running   0          18m
    pvc-40e2c0ce-79f1-11e8-bc7b-02b983f0a4db-ctrl-6cd77d978f-zmwsz   2/2       Running   0          24m
    pvc-40e2c0ce-79f1-11e8-bc7b-02b983f0a4db-rep-648fb8d7b4-c6wm8    1/1       Running   0          24m
    pvc-40e2c0ce-79f1-11e8-bc7b-02b983f0a4db-rep-648fb8d7b4-jr859    1/1       Running   0          24m
    pvc-40e2c0ce-79f1-11e8-bc7b-02b983f0a4db-rep-648fb8d7b4-rhshx    1/1       Running   0          24m
    pvc-78d2841a-79f1-11e8-bc7b-02b983f0a4db-ctrl-74b5c5889c-tkj9l   2/2       Running   0          23m
    pvc-78d2841a-79f1-11e8-bc7b-02b983f0a4db-rep-769cd58f5-kfwnn     1/1       Running   0          23m
    pvc-78d2841a-79f1-11e8-bc7b-02b983f0a4db-rep-769cd58f5-kmz4h     1/1       Running   0          23m
    pvc-78d2841a-79f1-11e8-bc7b-02b983f0a4db-rep-769cd58f5-nd5mj     1/1       Running   0          23m

Get the status of running StatefulSet using the following command. 

    ubuntu@kubemaster-01:~/openebs/k8s/demo/cockroachDB$ kubectl get statefulset
    NAME          DESIRED   CURRENT   AGE
    cockroachdb   3         3         25m

Get the status of underlying persistent volume used by CockroachDB
StatefulSet using the following command. 

    ubuntu@kubemaster-01:~/openebs/k8s/demo/cockroachDB$ kubectl get pvc
    NAME                    STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS          AGE
    datadir-cockroachdb-0   Bound     pvc-40e2c0ce-79f1-11e8-bc7b-02b983f0a4db   10G        RWO            openebs-cockroachdb   25m
    datadir-cockroachdb-1   Bound     pvc-78d2841a-79f1-11e8-bc7b-02b983f0a4db   10G        RWO            openebs-cockroachdb   23m
    datadir-cockroachdb-2   Bound     pvc-24b487f3-79f2-11e8-bc7b-02b983f0a4db   10G        RWO            openebs-cockroachdb   18m

Get the status of persistent volumes using following command. Here replica count is 3 . So 3 PVs will be created.

```
ubuntu@kubemaster-01:~/openebs/k8s/demo/cockroachDB$ kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                           STORAGECLASS          REASON    AGE
pvc-24b487f3-79f2-11e8-bc7b-02b983f0a4db   10G        RWO            Delete           Bound     default/datadir-cockroachdb-2   openebs-cockroachdb             18m
pvc-40e2c0ce-79f1-11e8-bc7b-02b983f0a4db   10G        RWO            Delete           Bound     default/datadir-cockroachdb-0   openebs-cockroachdb             25m
pvc-78d2841a-79f1-11e8-bc7b-02b983f0a4db   10G        RWO            Delete           Bound     default/datadir-cockroachdb-1   openebs-cockroachdb             23m
```

Get the status of the services using the following command. 

    ubuntu@kubemaster-01:~/openebs/k8s/demo/cockroachDB$ kubectl get svc
    NAME                                                TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)              AGE
    cockroachdb                                         ClusterIP   None             <none>        26257/TCP,8080/TCP   25m
    cockroachdb-public                                  ClusterIP   10.96.125.27     <none>        26257/TCP,8080/TCP   25m
    kubernetes                                          ClusterIP   10.96.0.1        <none>        443/TCP              1d
    pvc-24b487f3-79f2-11e8-bc7b-02b983f0a4db-ctrl-svc   ClusterIP   10.104.104.197   <none>        3260/TCP,9501/TCP    19m
    pvc-40e2c0ce-79f1-11e8-bc7b-02b983f0a4db-ctrl-svc   ClusterIP   10.97.181.169    <none>        3260/TCP,9501/TCP    25m
    pvc-78d2841a-79f1-11e8-bc7b-02b983f0a4db-ctrl-svc   ClusterIP   10.97.93.255     <none>        3260/TCP,9501/TCP    24m

Testing your Database
---------------------

### Using the built-in SQL Client

​1. Launch a temporary interactive pod and start the built-in SQL client
inside it using the following command. 

```
kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never -- sql --insecure --host=cockroachdb-public
```

2. Run some basic CockroachDB SQL statements as follows: 

```
    > CREATE DATABASE bank;
    > CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
    > INSERT INTO bank.accounts VALUES (1, 1000.50);
    > SELECT * FROM bank.accounts;

    +----+---------+
    | id | balance |
    +----+---------+
    |  1 |  1000.5 |
    +----+---------+
    (1 row)
```

​3. Exit the SQL shell using the following command.

```
    >\q
```

Using a Load Generator
----------------------

1. Download and apply the CockroachDB load generator from the OpenEBS repository using the following commands.

```
cd openebs/k8s/demo/cockroachDB/
kubectl apply -f cockroachdb-lg.yaml
```

2. Get the status of the job using the following command. 

```
ubuntu@kubemaster:~kubectl get jobs 
NAME DESIRED SUCCESSFUL AGE
cockroachdb-lg 1 0 2m
```

This is a Kubernetes Job YAML. It creates a database named test with a table named kv containing random k:v pairs. The Kubernetes Job will run for a duration of 5 minutes, which is a configurable value in the YAML.

3.  Launch a temporary interactive pod and start the built-in SQL client inside it using the following command. 

```
ubuntu@kubemaster:~kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never -- sql --insecure --host=cockroachdb-public
```

6. Set the default database as test and display the contents of the kv table as follows: 

```
    > SHOW DATABASES;
    +--------------------+
    |      Database      |
    +--------------------+
    | crdb_internal      |
    | information_schema |
    | pg_catalog         |
    | system             |
    | test               |
    +--------------------+
    (5 rows)
    
    Time: 7.084556ms
    
    > SET DATABASE=test;
    SET
    
    Time: 6.169867ms
    
    test> SELECT * FROM test.kv LIMIT 10;
    +----------------------+--------+
    |          k           |   v    |
    +----------------------+--------+
    | -9223282596810038725 | "\x85" |
    | -9223116438301212725 | "\xb4" |
    | -9222613679950113217 | *      |
    | -9222209701222264670 | G      |
    | -9222188216226059435 | j      |
    | -9221992469291086418 | y      |
    | -9221747069894991943 | "\x82" |
    | -9221352569080615127 | "\x1e" |
    | -9221294188251221564 | "\xe3" |
    | -9220587135773113226 | "\x94" |
    +----------------------+--------+
    (10 rows)
    
    Time: 98.004199ms
    
    test> SELECT COUNT(*) FROM test.kv;
    +----------+
    | count(*) |
    +----------+
    |    59814 |
    +----------+
    (1 row)
    
    Time: 438.68592ms
```

​7. Exit the SQL shell using the following command. 

```
>\q
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
