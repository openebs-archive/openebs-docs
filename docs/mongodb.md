---
id: MongoDB
title: MongoDB
sidebar_label: MongoDB
---

Running MongoDB on OpenEBS
--------------------------

This section provides detailed instructions which allow you to perform the following tasks.

-   Run a MongoDB StatefulSet on OpenEBS storage in a Kubernetes cluster
-   Generate standard OLTP load on MongoDB using a custom Sysbench tool
-   Test data replication across the MongoDB instances

1. ### Run OpenEBS Operator

   For the prerequisites and running OpenEBS Operator, see [Running OpenEBS Operator](http://openebs.readthedocs.io/en/latest/Usecases/run_openebs_operator.html).

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

    test@Master:~$ kubectl apply -f mongo-statefulset.yml
    service "mongo" created
    S "mongo" created

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

   In this example, you will be using a custom-built Sysbench framework integrated with support for OLTP tests MongoDB through the lua scripts. Sysbench is a multi-purpose benchmarking tool which can run DB benchmarks as well as regular raw/file device input/output.

### Installing Sysbench

The following procedure helps you install Sysbench.

* Download the appropriate branch of Percona-Lab's Sysbench fork with support for MongoDB integration on Kubernetes nodes. The Sysbench dependencies are installed in these Kubernetes nodes. (see, [Prerequisites](/docs/prerequisites.html)).

    git clone -b dev-mongodb-support-1.0 https://github.com/Percona-Lab/sysbench.git
* Enter the Sysbench local repository and perform the following commands in the given order.

    cd sysbench
    ./autogen.sh
    ./configure
    make
**Note:**

In case of errors where some header files belonging to the *libbson/libmongoc* packages are not found, update the include path. A workaround for this is to place all header files inside libbson-1.0 and
libmongoc-1.0 into /usr/include folder.

### Executing the Sysbench Benchmark

-   Identify the primary MongoDB instance name or IP (In the current S specification YAML, "mongo-0" is always configured as the primary instance that takes the client input/output)
-   Trigger the Sysbench command using the following command to -
    -   prepare the database
    -   add the collections
    -   perform the benchmark run

**Note:** Replace the mongo-url parameter based on the appropriate IP which can be obtained by kubectl describe pod mongo-0 | grep IP.

    test@Host02:~/sysbench$ ./sysbench/sysbench --mongo-write-concern=1 --mongo-url="mongodb://10.44.0.3" --mongo-database-name=sbtest --test=./sysbench/tests/mongodb/oltp.lua --oltp_table_size=100 --oltp_tables_count=10 --num-threads=10 --rand-type=pareto --report-interval=10 --max-requests=0 --max-time=600 --oltp-point-selects=10 --oltp-simple-ranges=1 --oltp-sum-ranges=1 --oltp-order-ranges=1 --oltp-distinct-ranges=1 --oltp-index-updates=1 --oltp-non-index-updates=1 --oltp-inserts=1 run

The parameters used for Sysbench can be modified based on system capability and storage definition to obtain realistic benchmark figures.

The benchmark output displayed is similar to the following: 

```
sysbench 1.0: multi-threaded system evaluation benchmark

Running the test with following options: 
Number of threads: 10 
Report intermediate results every 10 second(s) 
Initializing random number generator from current time

Initializing worker threads...

setting write concern to 1 
Threads started!

[ 10s] threads: 10, tps: 56.60, reads: 171.50, writes: 170.40, response time: 316.14ms (95%), errors: 0.00, reconnects: 0.00 
[ 20s] threads: 10, tps: 74.70, reads: 222.90, writes: 223.50, response time: 196.30ms (95%), errors: 0.00, reconnects: 0.00 
[ 30s] threads: 10, tps: 76.00, reads: 227.70, writes: 228.00, response time: 196.71ms (95%), errors: 0.00, reconnects: 0.00 
[ 40s] threads: 10, tps: 79.60, reads: 239.70, writes: 238.80, response time: 329.08ms (95%), errors: 0.00, reconnects: 0.00 
: 
: 
OLTP test statistics: 
	queries performed: 
		read: 154189 
		write: 154122 
		other: 51374 
		total: 359685 
	transactions: 51374 (85.61 per sec.) 
	read/write requests: 308311 (513.79 per sec.) 
	other operations: 51374 (85.61 per sec.) 
	ignored errors: 0 (0.00 per sec.) 
	reconnects: 0 (0.00 per sec.)

General statistics:   
	total time: 600.0703s 
	total number of events: 51374 
	total time taken by event execution: 6000.1853s 
	response time: 
		min: 26.11ms
		avg: 116.79ms 
		max: 2388.03ms 
		approx. 95 percentile: 224.00ms

Threads fairness:
	events (avg/stddev): 5137.4000/21.50 
	execution time (avg/stddev): 600.0185/0.02
```


While the benchmark is in progress, performance and capacity usage statistics on the OpenEBS storage volume can be viewed using the mayactl commands that must be executed on the maya-apiserver pod.

Run an interactive bash session for the maya-apiserver pod container. 

    test@Master:~$ kubectl exec -it maya-apiserver-1089964587-x5q15 /bin/bash
    root@maya-apiserver-1089964587-x5q15:/#

Obtain the list of OpenEBS persistent volumes created by the MongoDB S application YAML. :

    ​```
    root@maya-apiserver-1089964587-x5q15:/# maya volume list
    Name                                      Status
    pvc-0d39583c-bad7-11e7-869d-000c298ff5fc  Running
    pvc-21da76b6-bad7-11e7-869d-000c298ff5fc  Running
     :
     ```

View usage and input/output metrics for the required volume through the stats command.

    root@maya-apiserver-1089964587-x5q15:/# maya volume stats pvc-0d39583c-bad7-11e7-869d-000c298ff5fc
    IQN     : iqn.2016-09.com.openebs.jiva:pvc-0d39583c-bad7-11e7-869d-000c298ff5fc
    Volume  : pvc-0d39583c-bad7-11e7-869d-000c298ff5fc
    Portal  : 10.105.60.71:3260
    Size    : 5G
    
         Replica|   Status|   DataUpdateIndex|
                |         |                  |
       10.44.0.2|   Online|              4341|
       10.36.0.3|   Online|              4340|
    
    ----------- Performance Stats -----------
    
       r/s|   w/s|   r(MB/s)|   w(MB/s)|   rLat(ms)|   wLat(ms)|
         0|    14|     0.000|    14.000|      0.000|     71.325|
    
    ------------ Capacity Stats -------------
    
       Logical(GB)|   Used(GB)|
             0.214|      0.205|

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
