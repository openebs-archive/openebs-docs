---
id: MongoDB
title: Using OpenEBS volumes for MongoDB
sidebar_label: MongoDB
---
------

This section provides detailed instructions which allow you to perform the following tasks.

-   Run a MongoDB StatefulSet on OpenEBS storage in a Kubernetes cluster
-   Generate standard OLTP load on MongoDB using a custom Sysbench tool
-   Test data replication across the MongoDB instances

1. ### Run OpenEBS Operator

   For the prerequisites and running OpenEBS Operator, see [Running OpenEBS Operator](/docs/next/runOpenEBSoperator.html).

2. ### Deploy Mongo-StatefulSet with OpenEBS Storage

   Use OpenEBS as persistent storage for the MongoDB StatefulSet by selecting an OpenEBS storage class in the persistent volume claim. A sample MongoDB SatefulSet yaml (with container attributes and pvc
   details) is available in the OpenEBS git repository.

   The number of replicas in the StatefulSet can be modified as required. The following example uses three replicas. The replica count can be edited in the StatefulSet specification. 

       apiVersion: apps/v1beta1
        kind: StatefulSet
        metadata:
         name: mongo
        spec:
         serviceName: "mongo"
         replicas: 3
         template:
       metadata:
         labels:
           role: mongo
           environment: test
          .
          .
   Apply the mongo-statefulset.yml using the following commands.

   ```
   test@Master:~$ kubectl apply -f mongo-statefulset.yml
   
   service "mongo" created
   
   statefulset "mongo" created
   ```

   

Verify that MongoDB replicas, mongo headless service and OpenEBS persistent volumes comprising of the controller and replica pods are successfully deployed and are in *Running* state. 

    test@Master:~$ kubectl get pods
    NAME                                                             READY     STATUS    RESTARTS   AGE
    maya-apiserver-1089964587-x5q15                                  1/1       Running   0          8m
    mongo-0                                                          2/2       Running   0          2m
    mongo-1                                                          2/2       Running   0          2m
    mongo-2                                                          2/2       Running   0          1m
    openebs-provisioner-1149663462-5pdcq                             1/1       Running   0          8m
    pvc-0d39583c-bad7-11e7-869d-000c298ff5fc-ctrl-4109100951-v2ndc   1/1       Running   0          2m
    pvc-0d39583c-bad7-11e7-869d-000c298ff5fc-rep-1655873671-50f8z    1/1       Running   0          2m
    pvc-0d39583c-bad7-11e7-869d-000c298ff5fc-rep-1655873671-ctp0q    1/1       Running   0          2m
    pvc-21da76b6-bad7-11e7-869d-000c298ff5fc-ctrl-2618026111-z5hzt   1/1       Running   0          2m
    pvc-21da76b6-bad7-11e7-869d-000c298ff5fc-rep-187343257-9w46n     1/1       Running   0          2m
    pvc-21da76b6-bad7-11e7-869d-000c298ff5fc-rep-187343257-sd5hl     1/1       Running   0          2m
    pvc-3a9ca1ec-bad7-11e7-869d-000c298ff5fc-ctrl-2347166037-vsc2t   1/1       Running   0          1m
    pvc-3a9ca1ec-bad7-11e7-869d-000c298ff5fc-rep-849715916-3w1c7     1/1       Running   0          1m
    pvc-3a9ca1ec-bad7-11e7-869d-000c298ff5fc-rep-849715916-f2f3p     1/1       Running   0          1m
    
    test@Master:~$ kubectl get svc
    NAME                                                CLUSTER-IP       EXTERNAL-IP PORT(S)             AGE
    kubernetes                                          10.96.0.1        <none>      443/TCP             19h
    maya-apiserver-service                              10.103.216.160   <none>      5656/TCP            8m
    mongo                                               None             <none>      27017/TCP           3m
    pvc-0d39583c-bad7-11e7-869d-000c298ff5fc-ctrl-svc   10.105.60.71     <none>      3260/TCP,9501/TCP   3m
    pvc-21da76b6-bad7-11e7-869d-000c298ff5fc-ctrl-svc   10.105.178.143   <none>      3260/TCP,9501/TCP   2m
    pvc-3a9ca1ec-bad7-11e7-869d-000c298ff5fc-ctrl-svc   10.110.104.42    <none>      3260/TCP,9501/TCP   1m

**Note:**

It may take some time for the pods to start as the images must be pulled and instantiated. This is also dependent on the network speed.

3. ### Generate Load on the MongoDB Instance

   In this example, you will be using a mongo-loadgen.yaml to create load on mongo-0.mongo pod.

   The mongo-loadgen.yaml  can be created with below entries.

   ```
   apiVersion: batch/v1
   kind: Job
   metadata:
     name: mongo-loadgen
   spec:
     template:
       metadata:
         name: mongo-loadgen
       spec:
         restartPolicy: Never
         containers:
         - name: mongo-loadgen
           image: openebs/tests-sysbench-mongo
           command: ["/bin/bash"]
           args: ["-c", "./sysbench/sysbench --mongo-write-concern=1 --mongo-url='mongodb://mongo-0.mongo' --mongo-database-name=sbtest --test=./sysbench/tests/mongodb/oltp.lua --oltp_table_size=100 --oltp_tables_count=10 --num-threads=10 --rand-type=pareto --report-interval=10 --max-requests=0 --max-time=600 --oltp-point-selects=10 --oltp-simple-ranges=1 --oltp-sum-ranges=1 --oltp-order-ranges=1 --oltp-distinct-ranges=1 --oltp-index-updates=1 --oltp-non-index-updates=1 --oltp-inserts=1 run"]
           tty: true
   ```

**Note:** While creating mongo-loadgen.yaml,in the --mongo-url section user has to mention your pod mongo pod name. Here in this example its mongo-0.mongo.

```
vi mongo-loadgen.yaml
```



> --mongo-url='mongodb://mongo-0.mongo'

Now run the below commands.

```
kubectl apply -f mongo-statefulset.yml
```

To check the pod status rum the below command.

```
kubectl get pods
```


Once all your pods are running run the below command.

```
kubectl apply -f mongo-loadgen.yaml
```

Now Mongo-DB is running . To run Mongo-DB with xfs file system please follow the steps mentioned in link below.

https://github.com/openebs/openebs/issues/1446

### Verifying MongoDB Replication

- Log in to the primary instance of the MongoDB S through the in-built Mongo shell and verify that the **sbtest** test database is created by Sysbench in the previous procedure. 


    test@Master:~$ kubectl exec -it mongo-0 /bin/bash
    root@mongo-0:/# mongo
    
    MongoDB shell version v3.4.9
    connecting to: mongodb://127.0.0.1:27017
    MongoDB server version: 3.4.9
    :
    rs0:PRIMARY> show dbs
    admin   0.000GB
    local   0.006GB
    sbtest  0.001GB

* Run the replication status command on the master/primary instance of  the S. In the output, verify that the values (timestamps) for **optimeDate** on both members are similar. 

  ```
  rs0:PRIMARY> rs.status()

  {

  "set" : "rs0", 

  "date" : ISODate("2017-10-23T07:26:36.679Z"),

  "myState" : 1, 

  "term" : NumberLong(1), 

  "heartbeatIntervalMillis" : NumberLong(2000), 

  "optimes" : { 
  "lastCommittedOpTime" : { 
  		"ts" : Timestamp(1508743595, 51), 
  		"t" : NumberLong(1) 
  }, 
  "appliedOpTime": { 
  	"ts" : Timestamp(1508743596, 40), 
  	"t" : NumberLong(1) 
  },
  "durableOpTime" : { 
  	"ts" : Timestamp(1508743595, 71), 
  	"t" : NumberLong(1) 
  } 
  }, 

  "members" : [ 
  { 
  	"_id" : 0, 
  	"name" : "10.44.0.3:27017", 
  	"health" : 1, 
  	"state" : 1, 
  	"stateStr" : "PRIMARY", 
  	"uptime" : 243903, 
  	"optime" : { 
  		"ts" : Timestamp(1508743596, 40), 
  		 "t" : NumberLong(1) 
  	}, 
  	"optimeDate" : ISODate("2017-10-23T07:26:36Z"), 
  	"electionTime" : Timestamp(1508499738, 2), 
  	"electionDate" : ISODate("2017-10-20T11:42:18Z"), 
  	"configVersion" : 5, 
  	"self" : true 
  }, 
  { 
  	"_id" : 1, 
  	"name" : "10.36.0.6:27017", 
  	"health" : 1,
  	"state" : 2, 
  	"stateStr" : "SECONDARY", 
  	"uptime" : 243756, 
  	"optime" : { 
  		"ts" : Timestamp(1508743595, 51), 
  		"t" : NumberLong(1) 
  },
  "optimeDurable" : { 
  	"ts" : Timestamp(1508743595, 34), 
  	"t" : NumberLong(1) 
  }, 
  "optimeDate" : ISODate("2017-10-23T07:26:35Z"),
  "optimeDurableDate" : ISODate("2017-10-23T07:26:35Z"),
  "lastHeartbeat" : ISODate("2017-10-23T07:26:35.534Z"),
  "lastHeartbeatRecv" : ISODate("2017-10-23T07:26:34.894Z"),
  "pingMs" : NumberLong(6), 
  "syncingTo" : "10.44.0.3:27017",
  "configVersion" : 5 
  }, 
  { 
  	"_id" : 2, 
  	"name" : "10.44.0.7:27017",
  	"health" : 1, 
  	"state" : 2, 
  	"stateStr" : "SECONDARY", 
  	"uptime" : 243700, 
  	"optime" : { 
  		"ts" : Timestamp(1508743595, 104), 
  		"t" : NumberLong(1) 
  	}, 
  	"optimeDurable" : { 
  		"ts" : Timestamp(1508743595, 34), 
  		"t" : NumberLong(1) 
  	}, 
  	"optimeDate" : ISODate("2017-10-23T07:26:35Z"), 
  	"optimeDurableDate" : ISODate("2017-10-23T07:26:35Z"), 
  	"lastHeartbeat" : ISODate("2017-10-23T07:26:35.949Z"), 
  	"lastHeartbeatRecv" : ISODate("2017-10-23T07:26:35.949Z"), 
  	"pingMs" : NumberLong(0),
  	"syncingTo" : "10.44.0.3:27017", 
  	"configVersion" : 5 
  	} 
  ], 
  "ok" : 1
  }
  ```

* You could further confirm the presence of the database with the same size on secondary instances (for example, mongo-1).

**Note:**

By default, the databases cannot be viewed on the secondary instance through the show dbs command, unless we set the slave context. 

    rs0:SECONDARY> rs.slaveOk()
    rs0:SECONDARY> show dbs
    admin   0.000GB
    local   0.005GB
    sbtest  0.001GB
* The time lag between the MongoDB instances can be found using the following command, which can be executed on either instance. 

    rs0:SECONDARY> rs.printSlaveReplicationInfo()
    source: 10.36.0.6:27017
         syncedTo: Mon Oct 23 2017 07:28:27 GMT+0000 (UTC)
         0 secs (0 hrs) behind the primary
    source: 10.44.0.7:27017
         syncedTo: Mon Oct 23 2017 07:28:27 GMT+0000 (UTC)
         0 secs (0 hrs) behind the primary

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
