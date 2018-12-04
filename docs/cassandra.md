---
id: Cassandra
title: Using OpenEBS for Cassandra
sidebar_label: Cassandra
---
------

This page provides detailed instructions to run a Cassandra StatefulSet with OpenEBS cStor storage engine and perform some simple database operations to verify successful deployment.

About Cassandra
---------------

Apache Cassandra is a free and open-source distributed NoSQL database management system. It is designed to handle large amounts of data across nodes, providing high availability with no single point of failure. It uses asynchronous masterless replication allowing low latency operations for all clients.

Prerequisite
------------

We are using OpenEBS cStor storage engine for running  Cassandra StatefulSet. Before starting, check the status of the cluster using the following command. 

```
kubectl get nodes
```

The following output shows the status of the nodes in the cluster

```
NAME                                         STATUS    ROLES     AGE       VERSION
gke-ranjith-080-default-pool-8d4e3480-b50p   Ready     <none>    22h       v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-qsvn   Ready     <none>    22h       v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-rb03   Ready     <none>    22h       v1.9.7-gke.11
```

Also make sure that you have deployed OpenEBS in your cluster. If not deployed, you can install from [here](https://docs.openebs.io/docs/next/quickstartguide.html).

You can check the status of OpenEBS pods by running following command.

```
kubectl get pod -n openebs
```

Output of above command will be similar to the following.

```
NAME                                                              READY     STATUS        RESTARTS   AGE
cstor-sparse-pool-k0b1-5877cfdf6d-pb8n5                           2/2       Running       0          5h
cstor-sparse-pool-z8sr-668f5d9b75-z9547                           2/2       Running       0          5h
cstor-sparse-pool-znj9-6b84f659db-hwzvn                           2/2       Running       0          5h
maya-apiserver-7bc857bb44-qpjr4                                   1/1       Running       0          5h
openebs-ndm-9949m                                                 1/1       Running       0          5h
openebs-ndm-pnm25                                                 1/1       Running       0          5h
openebs-ndm-stkjp                                                 1/1       Running       0          5h
openebs-provisioner-b9fb58d6d-tdpx7                               1/1       Running       0          5h
openebs-snapshot-operator-bb5697c8d-qlglr                         2/2       Running       0          5h
```

Deploying the Cassandra StatefulSet with OpenEBS Storage
--------------------------------------------------------

You can create a storage class YAML named *openebs-cstor-sparse-cassandra.yaml* and copy the following content to it. This YAML will create the storage class to be used for creating cStor Volume where Cassandra application will run.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-sparse-cassandra
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
      - name: ReplicaCount
        value: "1"
     #- name: TargetResourceLimits
      #  value: |-
      #      memory: 1Gi
      #      cpu: 200m
      #- name: AuxResourceLimits
      #  value: |-
      #      memory: 0.5Gi
      #      cpu: 50m
provisioner: openebs.io/provisioner-iscsi
```

Once you have copied the content, you can apply the *openebs-cstor-sparse-cassandra.yaml* using the following command.

```
kubectl apply -f openebs-cstor-sparse-cassandra.yaml
```

Output of above command will be similar to the following.

```
storageclass.storage.k8s.io/openebs-cstor-sparse-cassandra created
```

You can check the status of the StorageClasses using the following command.

```
kubectl get sc
```

Output of above command will be similar to the following.

```
NAME                             PROVISIONER                                                AGE
openebs-cstor-sparse             openebs.io/provisioner-iscsi                               1d
openebs-cstor-sparse-cassandra   openebs.io/provisioner-iscsi                               4s
openebs-jiva-default             openebs.io/provisioner-iscsi                               1d
openebs-snapshot-promoter        volumesnapshot.external-storage.k8s.io/snapshot-promoter   1d
standard (default)               kubernetes.io/gce-pd                                       1d
```

Download the following file from OpenEBS repo and change the **volume.beta.kubernetes.io/storage-class** under **volumeClaimTemplates** -> ***metadata*** -> **annotations** from *openebs-jiva-default* to *openebs-cstor-sparse-cassandra*. 

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/cassandra/cassandra-statefulset.yaml
```

**Example:**

Following is the snippet on which you have to change the storage-class.

```
  volumeClaimTemplates:
  - metadata:
      name: cassandra-data
      annotations:
        volume.beta.kubernetes.io/storage-class: openebs-cstor-sparse-cassandra
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 5G
```

After the modification on the downloaded file, you can run following commands to install the Percona galera DB application on cStor volume.

Run the following command to install Cassandra services.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/cassandra/cassandra-service.yaml
```





    test@Master:~$ cd openebs/k8s/demo/cassandra
    test@Master:~/openebs/k8s/demo/cassandra$ ls -ltr
    total 8
    -rw-rw-r-- 1 karthik karthik  165 Oct 30 12:19 cassandra-service.yaml
    -rw-rw-r-- 1 karthik karthik 2382 Nov 11 14:09 cassandra-statefulset.yaml	
    
    test@Master:~/openebs/k8s/demo/cassandra$ kubectl apply -f cassandra-service.yaml
    service "cassandra" configured

```
test@Master:~/openebs/k8s/demo/cassandra$ kubectl apply -f cassandra-statefulset.yaml
statefulset "cassandra" created
```

Verify that all the OpenEBS persistent volumes are created and the Cassandra headless service and replicas are running. 

    test@Master:~/openebs/k8s/demo/cassandra$ kubectl get pods
    NAME                                                             READY     STATUS    RESTARTS   AGE
    cassandra-0                                                      1/1       Running   0          4h
    cassandra-1                                                      1/1       Running   0          4h
    maya-apiserver-3416621614-g6tmq                                  1/1       Running   1          8d
    openebs-provisioner-4230626287-503dv                             1/1       Running   1          8d
    pvc-1c16536c-c6bc-11e7-a0eb-000c298ff5fc-ctrl-599202565-2kdff    1/1       Running   0          4h
    pvc-1c16536c-c6bc-11e7-a0eb-000c298ff5fc-rep-3068892500-22ccd    1/1       Running   0          4h
    pvc-1c16536c-c6bc-11e7-a0eb-000c298ff5fc-rep-3068892500-lhwdw    1/1       Running   0          4h
    pvc-e7d18817-c6bb-11e7-a0eb-000c298ff5fc-ctrl-1103031005-8vv82   1/1       Running   0          4h
    pvc-e7d18817-c6bb-11e7-a0eb-000c298ff5fc-rep-3006965094-cntx5    1/1       Running   0          4h
    pvc-e7d18817-c6bb-11e7-a0eb-000c298ff5fc-rep-3006965094-mhsjt    1/1       Running   0          4h

```
test@Master:~/openebs/k8s/demo/cassandra$ kubectl get svc
NAME                                                CLUSTER-IP       EXTERNAL-IP   PORT(S)             AGE
cassandra                                           None             <none>        9042/TCP            5h
kubernetes                                          10.96.0.1        <none>        443/TCP             14d
maya-apiserver-service                              10.102.92.217    <none>        5656/TCP            14d
pvc-1c16536c-c6bc-11e7-a0eb-000c298ff5fc-ctrl-svc   10.107.177.156   <none>        3260/TCP,9501/TCP   4h
pvc-e7d18817-c6bb-11e7-a0eb-000c298ff5fc-ctrl-svc   10.108.47.234    <none>        3260/TCP,9501/TCP   4h
```



**Note:**

It may take some time for the pods to start as the images must be pulled and instantiated. This is also dependent on the network speed.

Verifying Successful Cassandra Deployment
-----------------------------------------

You can verify the deployment starting from listing the functional replicas to creating and deleting test data in the Cassandra database.

### 1. Install the Cqlsh Utility

Cqlsh is a Python based utility that enables you to execute Cassandra Query Language (CQL). CQL is a declarative language that enables users to query Cassandra using semantics similar to SQL.

Install the python-minimal and python-pip apt packages (if not available) and perform a pip install of Csqlsh using the following commands. 

    sudo apt-get install -y python-minimal python-pip 
    pip install cqlsh

**Note:**

Installing Csqlsh may take a few minutes (typically, the cassandra-driver package takes time to download and setup).

### 2. Verify Replica Status on Cassandra

```
test@Master:~$ kubectl exec cassandra-0 -- nodetool status
Datacenter: DC1-K8Demo
======================
Status=Up/Down
|/ State=Normal/Leaving/Joining/Moving
--  Address    Load       Tokens       Owns (effective)  Host ID                               Rack
UN  10.36.0.6  103.83 KiB  32           100.0%           e013c19d-9c6f-49cd-838e-c69eb310f88e  Rack1-K8Demo
UN  10.44.0.3  83.1 KiB    32           100.0%           1d2e3b79-4b0b-4bf9-b435-fcfa8be8a603  Rack1-K8Demo
```



A status of "UN" implies Up and Normal. The "Owns" column suggests the data distribution percentage for the content placed into the Cassandra keyspaces. In the current example, a replica count of 2 is chosen due to which the data is evenly distributed and copies are maintained.

### 3. Create a Test Keyspace with Tables

- Identify the IP Address of any of the Cassandra replicas, for example, Cassandra-0. This is available from the output of the nodetool status command executed in the previous step.

-   Login to the CQL shell using the Cqlsh utility using the following command.

    ```
    test@Master:~$ cqlsh 10.44.0.3 9042 --cqlversion="3.4.2"
    Connected to K8Demo at 10.44.0.3:9042.
    [cqlsh 5.0.1 | Cassandra 3.9 | CQL spec 3.4.2 | Native protocol v4]
    Use HELP for help.
    cqlsh>
    ```

-   Create a keyspace with replication factor 2 using the following commands.

    ```
    cqlsh> create keyspace hardware with replication = { 'class' : 'SimpleStrategy' , 'replication_factor' : 2 };
    cqlsh> describe keyspaces;
    system_schema  system_auth  system  hardware  system_distributed  system_traces
    ```

-   Create a table with test content and view the data using the following commands.

    ```
    cqlsh> use hardware;
    cqlsh:hardware> create table inventory (id uuid,Name text,HWtype text,Model text,PRIMARY KEY ((id), Name));
    cqlsh:hardware> insert into inventory (id, Name, HWType, Model) values (5132b130-ae79-11e4-ab27-0800200c9a66, 'TestBox', 'Server', 'DellR820');
    cqlsh:hardware> select * from inventory;
    id                                   | name    | hwtype | model
    ---------------------------------------+---------+--------+----------
    5132b130-ae79-11e4-ab27-0800200c9a66 | TestBox | Server | DellR820
    (1 rows) 
    ```

-   Flush the data to ensure it is written to a disk from the memtable (memory) using the following command.

    ```
    test@Master:$ kubectl exec cassandra-0 -- nodetool flush hardware
    ```

4. Delete the Test Keyspace
- Verify the masterless nature of Cassandra StatefulSet by deleting the keyspace from another replica, in this example, Cassandra-1. 


    test@Master:~$ cqlsh 10.36.0.6 9042 --cqlversion="3.4.2"
    cqlsh> use hardware;
    cqlsh:hardware> select * from Inventory;
    
    id                                   | name    | hwtype | model
    --------------------------------------+---------+--------+----------
    5132b130-ae79-11e4-ab27-0800200c9a66 | TestBox | Server | DellR820
    
    (1 rows)
    
    cqlsh> drop keyspace hardware;
- Verify that the keyspace is deleted successfully using the following command. 


    cqlsh> describe keyspaces
    system_traces  system_schema  system_auth  system  system_distributed

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
