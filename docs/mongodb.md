---
id: MongoDB
title: Using OpenEBS volumes for MongoDB
sidebar_label: MongoDB
---
------

This section provides detailed instructions which allow you to perform the following tasks.

-   Run a MongoDB StatefulSet on OpenEBS storage in a Kubernetes cluster
-   Generate standard OLTP load on MongoDB using a custom Sysbench tool
-   Test data replication across the MongoDB instances.

### Deploy Mongo-StatefulSet with OpenEBS Storage

We are using OpenEBS cStor storage engine for running  Mongo Database. Before starting, check the status of the cluster using the following command. 

```
kubectl get nodes
```

The following output shows the status of the nodes in the cluster.

```
NAME                                                  STATUS    ROLES     AGE       VERSION
gke-doc-update-cluster-c-default-pool-59cb533c-hw5s   Ready     <none>    18h       v1.11.3-gke.18
gke-doc-update-cluster-c-default-pool-59cb533c-knfl   Ready     <none>    18h       v1.11.3-gke.18
gke-doc-update-cluster-c-default-pool-59cb533c-pnjk   Ready     <none>    18h       v1.11.3-gke.18
```

Also make sure that you have deployed OpenEBS in your cluster. If not deployed, you can install from [here](/docs/next/quickstartguide.html).

Use OpenEBS as persistent storage for the MongoDB StatefulSet by selecting an OpenEBS storage class in the persistent volume claim. A sample MongoDB SatefulSet YAML (with container attributes and pvc
details) is available in the OpenEBS git repository.

Get the default StorageClasses installed during the OpenEBS operator installation. You can run the following command to get the StorageClass details.

```
kubectl get sc
```

Output of above command will be similar to the following.

```
NAME                      PROVISIONER                                                AGE
openebs-cstor-sparse      openebs.io/provisioner-iscsi                               18h
openebs-jiva-default      openebs.io/provisioner-iscsi                               18h
openebs-snapshot-promoter volumesnapshot.external-storage.k8s.io/snapshot-promoter    18h
standard (default)        kubernetes.io/gce-pd                                       18h
```

Create a YAML file named *mongo-statefulset.yaml* and copy the following sample YAML of Mongo DB to the created file.

```
# Create a StorageClass suited for Mongo StatefulSet
# Since Mongo takes care of replication, one replica will suffice
# Can be configured with Anti affinity topology key of hostname (default)
#  or across zone.
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-sparse-mongo
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: ReplicaCount
        value: "1"
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
      - name: FSType
        value: "xfs"
      #- name: ReplicaAntiAffinityTopoKey
      #  value: failure-domain.beta.kubernetes.io/zone
provisioner: openebs.io/provisioner-iscsi
---
# Headless service for stable DNS entries of StatefulSet members.
apiVersion: v1
kind: Service
metadata:
 name: mongo
 labels:
   name: mongo
spec:
 ports:
 - port: 27017
   targetPort: 27017
 clusterIP: None
 selector:
   role: mongo
---
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
       #This label will be used by openebs to place in replica
       # pod anti-affinity to make sure data of different mongo
       # instances are not co-located on the same node
       openebs.io/replica-anti-affinity: vehicle-db
   spec:
     terminationGracePeriodSeconds: 10
     containers:
       - name: mongo
         image: mongo
         command:
           - mongod
           - "--replSet"
           - rs0
           - "--smallfiles"
           - "--noprealloc"
           - "--bind_ip_all"
         ports:
           - containerPort: 27017
         volumeMounts:
           - name: mongo-persistent-storage
             mountPath: /data/db
       - name: mongo-sidecar
         image: cvallance/mongo-k8s-sidecar
         env:
           - name: MONGO_SIDECAR_POD_LABELS
             value: "role=mongo,environment=test"
 volumeClaimTemplates:
 - metadata:
     name: mongo-persistent-storage
   spec:
     storageClassName: openebs-cstor-sparse-mongo
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 5G
```

Apply the *mongo-statefulset.yaml* using the following commands.

```
kubectl apply -f mongo-statefulset.yaml
```

Output will be similar to following one.

```
storageclass.storage.k8s.io "openebs-cstor-sparse" configured
service "mongo" created
statefulset.apps "mongo" created		
```

Verify that MongoDB replicas, mongo headless service and OpenEBS persistent volumes comprising of the controller and replica pods are successfully deployed and are in *Running* state. 

```
kubectl get pods
```

Output will be similar to following one.

```
NAME                  READY     STATUS    RESTARTS   AGE
mongo-0               2/2       Running   0          10m
mongo-1               2/2       Running   0          7m
mongo-2               2/2       Running   0          4m
```

Verify that MongoDB services using the following command.

```kubectl get svc
kubectl get svc
```

Output will be similar to following one.

```
NAME         TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)     AGE
kubernetes   ClusterIP   10.83.240.1   <none>        443/TCP     20h
mongo        ClusterIP   None          <none>        27017/TCP   1h
```

**Note:** It may take some time for the pods to start as the images must be pulled and instantiated. This is also dependent on the network speed.

### Generate Load on the MongoDB Instance

In this example, you will be using a mongo-loadgen.yaml to create load on mongo-0.mongo pod.

The *mongo-loadgen.yaml*  can be created with below entries.

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

**Note:** While creating *mongo-loadgen.yaml*, in the --mongo-url section user has to mention your pod mongo pod name. Edit the *mongo-loadgen.yaml* . Here in this example its mongo-0.mongo.

> --mongo-url='mongodb://mongo-0.mongo'

To check the pod status run the below command.

```
kubectl get pods
```


Once all your pods are running run the below command.

```
kubectl apply -f mongo-loadgen.yaml
```

Output will be similar to below one.

```
job.batch "mongo-loadgen" created
```

Now Mongo-DB is running . To run Mongo-DB with xfs file system you can follow the steps mentioned [here](https://github.com/openebs/openebs/issues/1446).

### Verifying MongoDB Replication

- Log in to the primary instance of the MongoDB S through the in-built Mongo shell and verify that the **sbtest** test database is created by Sysbench in the previous procedure. 

  kubectl exec -it mongo-0 /bin/bash
  Use the below command to check MongoDb status.

  ```
  mongo
  ```

  Output observed will be similar to below one.

  ```
  MongoDB shell version v3.4.9
  connecting to: mongodb://127.0.0.1:27017
  MongoDB server version: 3.4.9
  :
  rs0:PRIMARY> show dbs
  admin   0.000GB
  local   0.006GB
  sbtest  0.001GB
  ```

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

  **Note:** By default, the databases cannot be viewed on the secondary instance through the show database command, unless we set the slave context. 

  ```
  rs0:SECONDARY> rs.slaveOk()
  rs0:SECONDARY> show dbs
  admin   0.000GB
  local   0.005GB
  sbtest  0.001GB
  ```

* The time lag between the MongoDB instances can be found using the following command, which can be executed on either instance. 

    ```
    rs0:SECONDARY> rs.printSlaveReplicationInfo()
    source: 10.36.0.6:27017
         syncedTo: Mon Oct 23 2017 07:28:27 GMT+0000 (UTC)
         0 secs (0 hrs) behind the primary
    source: 10.44.0.7:27017
         syncedTo: Mon Oct 23 2017 07:28:27 GMT+0000 (UTC)
         0 secs (0 hrs) behind the primary
    ```

* The way the PVCs are associated with a deployment in a StatefulSet are different and don't follow the same process as a Deployment. The StatefulSet internally creates the PVC objects. Also currently a delete StatefulSet doesn't delete the corresponding PVCs created. You should delete them manually.

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
