---
id: Kafka
title: Using OpenEBS for OpenEBS
sidebar_label: Kafka
---
------

### Deploying Kafka as a StatefulSet

This section provides detailed instructions on how to run a Kafka application with OpenEBS as a persistent storage in a Kubernetes cluster. 

In this example, OpenEBS cStor storage engine is used for running Kafka StatefulSet application. Before starting, check the status of the cluster using the following command. 

```
kubectl get nodes
```

The following output shows the status of the nodes in the cluster.

```
gke-ranjith-080-default-pool-8d4e3480-b50p   Ready     <none>    2d        v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-qsvn   Ready     <none>    2d        v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-rb03   Ready     <none>    2d        v1.9.7-gke.11
```

Also make sure that you have deployed OpenEBS in your cluster. If not deployed, you can install from [here](https://docs.openebs.io/docs/next/quickstartguide.html).

You can check the status of OpenEBS pods by running following command.

```
kubectl get pod -n openebs
```

Output of above command will be similar to the following.

```
NAME                                        READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-l8oc-75464957d5-p4m4n     2/2       Running   0          2h
cstor-sparse-pool-m7ld-87db7797c-hbsv2      2/2       Running   0          2h
cstor-sparse-pool-md1e-944849559-7pjcf      2/2       Running   0          2h
maya-apiserver-7bc857bb44-9w7hx             1/1       Running   0          2h
openebs-ndm-gfk85                           1/1       Running   0          2h
openebs-ndm-h4rt6                           1/1       Running   0          2h
openebs-ndm-pxjcb                           1/1       Running   0          2h
openebs-provisioner-b9fb58d6d-t475j         1/1       Running   0          2h
openebs-snapshot-operator-bb5697c8d-7jfqd   2/2       Running   0          2h
```

Download the following files from OpenEBS repo to the Kubernetes master node.

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/kafka/02-namespace.yml
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/kafka/03-zookeeper.yaml
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/kafka/04-kafka-config.yml
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/kafka/05-service-kafka.yml
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/kafka/06-kafka-statefulset.yml
```

Edit **03-zookeeper.yaml** by changing the **storageClassName** under **volumeClaimTemplates**-> spec from *openebs-jiva-default* to *openebs-cstor-sparse*. 

Similarly, edit **06-kafka-statefulset.yml** by changing **storageClassName** under **volumeClaimTemplates**-> spec from *openebs-jiva-default* to *openebs-cstor-sparse*. 

A sample Kafka pod yaml (with container attributes and pvc details) is available in the OpenEBS git repository. Download the following files from OpenEBS repo and change the **storageClassName** under **PersistentVolumeClaim** -> ***spec*** from *openebs-jiva-default* to *openebs-cstor-sparse*. 

After the modification on the required downloaded files, you can run following commands to install the Kafka application on cStor volume.

```
 kubectl apply -f 02-namespace.yml
 kubectl apply -f 03-zookeeper.yml
 kubectl apply -f 04-kafka-config.yml
 kubectl apply -f 05-service-kafka.yml
 kubectl apply -f 06-kafka-statefulset.yml
```
Running the above commands creates 3 node Zookeeper ensemble and a 3 node Kafka cluster which uses OpenEBS volumes.

**Note:** Kafka is a distributed system that uses Zookeeper to track the status of Kafka cluster nodes. 

Check if the Kafka pods are running by running the following command.
```
kubectl get -n kafka pods
```
Output of above command will be similar to the following.

```

```



To obtain the status of underlying persistent volumes used by Kafka, run the following command.

```
devops@ubuntu:~/openebs/k8s/demo/kafka$ kubectl get pvc -n kafka
NAME           STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS    AGE
data-kafka-0   Bound     pvc-e2d08251-179c-11e8-9948-42010a800208   10G        RWO            openebs-kafka   6h
data-kafka-1   Bound     pvc-85073cda-179d-11e8-9948-42010a800208   10G        RWO            openebs-kafka   5h
data-kafka-2   Bound     pvc-b008e3bc-179d-11e8-9948-42010a800208   10G        RWO            openebs-kafka   5h
datadir-zk-0   Bound     pvc-ced395d9-179c-11e8-9948-42010a800208   2G         RWO            openebs-zk      6h
datadir-zk-1   Bound     pvc-f94a635f-179c-11e8-9948-42010a800208   2G         RWO            openebs-zk      6h
datadir-zk-2   Bound     pvc-29b2a134-179d-11e8-9948-42010a800208   2G         RWO            openebs-zk      6h
```
Check the status of the Kafka service by running the following command.

```
devops@ubuntu:~/openebs/k8s/demo/kafka$ kubectl get svc -n kafka
NAME                                                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)             AGE
broker                                              ClusterIP   None            <none>        9092/TCP            6h
pvc-29b2a134-179d-11e8-9948-42010a800208-ctrl-svc   ClusterIP   10.19.250.186   <none>        3260/TCP,9501/TCP   6h
pvc-85073cda-179d-11e8-9948-42010a800208-ctrl-svc   ClusterIP   10.19.247.169   <none>        3260/TCP,9501/TCP   6h
pvc-b008e3bc-179d-11e8-9948-42010a800208-ctrl-svc   ClusterIP   10.19.253.188   <none>        3260/TCP,9501/TCP   5h
pvc-ced395d9-179c-11e8-9948-42010a800208-ctrl-svc   ClusterIP   10.19.252.128   <none>        3260/TCP,9501/TCP   6h
pvc-e2d08251-179c-11e8-9948-42010a800208-ctrl-svc   ClusterIP   10.19.249.153   <none>        3260/TCP,9501/TCP   6h
pvc-f94a635f-179c-11e8-9948-42010a800208-ctrl-svc   ClusterIP   10.19.250.218   <none>        3260/TCP,9501/TCP   6h
zk-headless                                         ClusterIP   None            <none>        2888/TCP,3888/TCP   6h
```
Check the statefulsets by running the following command.

```
devops@ubuntu:~/openebs/k8s/demo/kafka$ kubectl get statefulset -n kafka
NAME      DESIRED   CURRENT   AGE
kafka     3         3         6h
zk        3         3         6h
```

### Verifying Zookeeper

To verify the Zookeeper ensemble, use the following procedure.

```
devops@ubuntu:~ /openebs/k8s/demo/kafka$ kubectl exec -n kafka -it zk-0 -- /opt/zookeeper/bin/zkCli.sh create /foo bar
WATCHER::
WatchedEvent state:SyncConnected type:None path:null
Created /foo
```

Running the above command creates the foo bar in a Zookeeper pod zk-0.

Get the new foo bar in some other Zookeeper pod by running the below commands.

```
devops@ubuntu:~/openebs/k8s/demo/kafka$ kubectl exec -n kafka -it zk-0 -- /opt/zookeeper/bin/zkCli.sh get /foo bar
WATCHER::
WatchedEvent state:SyncConnected type:None path:null
bar
cZxid = 0x100000028
ctime = Thu Feb 22 07:52:32 UTC 2018
mZxid = 0x100000028
mtime = Thu Feb 22 07:52:32 UTC 2018
pZxid = 0x100000028
cversion = 0
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 3
numChildren = 0
```

### Verifying Kafka Pods

Verify if Kafka cluster is running by sending messages from one cluster to the other by running the following command.

```
devops@ubuntu:~/openebs/k8s/demo/kafka$ kubectl exec -n kafka -it kafka-0 -- bash
root@kafka-0:/opt/kafka#
```
Let us create a topic named "OpenEBS" with three partitions and three replicas.


```
root@kafka-0:/opt/kafka# bin/kafka-topics.sh --zookeeper zk-headless.kafka.svc.cluster.local:2181 --create --if-not-exists --topic OpenEBS-maya --partitions 3 --replication-factor 3

Created topic "OpenEBS"
```

We can now see the OpenEBS topic if we run the following command.

```
root@kafka-0:/opt/kafka# bin/kafka-topics.sh --list --zookeeper zk-headless.kafka.svc.cluster.local:2181

OpenEBS
```

Describe the topic that you created by running the following command. 

```
root@kafka-0:/opt/kafka# bin/kafka-topics.sh --describe --zookeeper zk-headless.kafka.svc.cluster.local:2181 --topic openEBS

Topic:openEBS   PartitionCount:3        ReplicationFactor:3     Configs:
        Topic: openEBS        Partition: 0    Leader: 0       Replicas: 0,1,2 Isr: 0,1,2
        Topic: openEBS        Partition: 1    Leader: 1       Replicas: 1,2,0 Isr: 1,2,0
        Topic: openEBS        Partition: 2    Leader: 2       Replicas: 2,0,1 Isr: 2,0,1
```

Running the above command describes the topic. The first line displays a summary of all the partitions. Each additional line displays information about the partition. 

- "leader" is the node responsible for all reads and writes for the given partition. Each node will be the leader for a randomly selected portion of the partitions.
- "replicas" is the list of nodes that replicate the log for this partition regardless of whether they are the leader or if they are currently alive.
- "isr" is the set of "in-sync" replicas. This is the subset of the replicas list that is currently alive and caught-up to the leader.

#### Sending messages

Let us publish a few messages to our new topic by running the following commands.

```
root@kafka-0:/opt/kafka# bin/kafka-console-producer.sh --broker-list kafka-0.broker.kafka.svc.cluster.local:9092,kafka-1.broker.kafka.svc.cluster.local:9092,kafka-2.broker.kafka.svc.cluster.local:9092 --topic OpenEBS

[2018-02-26 06:24:31,135] INFO Kafka version : 0.11.0.0 (org.apache.kafka.common.utils.AppInfoParser)
[2018-02-26 06:24:31,135] INFO Kafka commitId : cb8625948210849f (org.apache.kafka.common.utils.AppInfoParser)

> Hello OpenEBS!
> Hello MayaData!
```

#### Receiving Messages

Let us consume messages sent earlier. To start receiving messages, open the new terminal, and run the following commands.

```
devops@ubuntu:~/openebs/k8s/demo/kafka$ kubectl exec -n kafka -it kafka-1 -- bash
root@kafka-1:/opt/kafka#
```

```
root@kafka-1:/opt/kafka# bin/kafka-console-consumer.sh --zookeeper zk-headless.kafka-0.svc.cluster.local:2181 --topic OpenEBS --from-beginning

[2018-02-26 06:58:19,464] INFO [ConsumerFetcherThread-console-consumer-47539_kafka-1-1519628298757-110beddd-0-1]: Starting (kafka.consumer.ConsumerFetcherThread)

Hello OpenEBS!
Hello MayaData!
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
