---
id: cassandra
title: Using OpenEBS as statefulset storage for Cloud Native Cassandra
sidebar_label: Cassandra
---
------

<img src="/docs/assets/o-cassandra.png" alt="OpenEBS and Prometheus" style="width:400px;">

## Introduction

Apache Cassandra is a free and open-source distributed NoSQL database management system designed to handle large amounts of data across nodes, providing high availability with no single point of failure. It uses asynchronous masterless replication allowing low latency operations for all clients. In this solution, running a Cassandra StatefulSet application on OpenEBS cStor volume and perform simple database operations to verify successful deployment.

## Requirements

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

   If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). If cStor pool is already configured, go to the next step. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below.

3. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the [Configure StoragePool](/docs/next/configurepools.html) section. Since Cassandea is a StaefulSet application, it requires only one replication at the storage level. So cStor volume `replicaCount` is 1. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStorVolume Replica count as 1 is provided in the configuration details below.

## Deployment of Cassandra with openEBS

In this solution ,the number of replicas in the Statefulset can be modified as required. This example uses 3 application replicas. This means 3 Cassandra pods will be created after it successful deployment. 

Run the following command to install Cassandra services.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/cassandra/cassandra-service.yaml	
```

Now,you must create a new file called **cassandra-statefulset.yaml** and add the content from **cassandra-statefulset.yaml** shows in the Configuration details section below to this new file.

Once you added the contents to the new **cassandra-statefulset.yaml**,  you can run the following command to install Cassandra StatefulSet application.

```
kubectl apply -f cassandra-statefulset.yaml
```

## Verify Cassandra Pods

Run the following to get the status of Cassandra pods.

```
kubectl get pods
```

Following is an example output.

```
NAME          READY     STATUS    RESTARTS   AGE
cassandra-0   1/1       Running   0          8m
cassandra-1   1/1       Running   0          6m
cassandra-2   1/1       Running   0          2m
```

### Verify PostgreSQL services

The verification procedure can be carried out in a series of steps, starting from listing the functional replicas to by creating and deleting test data in the Cassandra database.

**Step 1:** Install the Cqlsh Utility

Cqlsh is a Python based utility that enables you to execute Cassandra Query Language (CQL). CQL is a declarative language that enables users to query Cassandra using semantics similar to SQL.

Install the python-minimal and python-pip apt packages (if not available) and perform a pip install of Csqlsh using the following commands.

```
sudo apt-get install -y python-minimal python-pip 
pip install cqlsh
```

**Step 2**: Verify Replica Status on Cassandra

Run the following command to login to one of the Cassandra application pod.

```
kubectl exec cassandra-0 -- nodetool status
```

Output of above command will be similar to the following.

```
Datacenter: DC1-K8Demo
======================
Status=Up/Down
|/ State=Normal/Leaving/Joining/Moving
--  Address     Load       Tokens       Owns (effective)  Host ID                               Rack
UN  10.72.1.11  101.04 KiB  32           74.3%             646261c2-25ea-4b16-9a93-0085da95d9a7  Rack1-K8Demo
UN  10.72.0.13  65.66 KiB  32           64.6%             8a2cc1a9-58bf-4cb3-8c57-8e92549e390f  Rack1-K8Demo
UN  10.72.2.14  65.62 KiB  32           61.1%             4b296349-818b-4ee5-b1e0-da99bf0b1062  Rack1-K8Demo
```

A status of "UN" implies Up and Normal. The "Owns" column suggests the data distribution percentage for the content placed into the Cassandra keyspaces. In the current example, a replica count of cStor Volume repliac as 1 and Cassandra application as 3 is chosen due to which the data is evenly distributed and copies are maintained.

**Step 3**: Create a Test Keyspace with Tables

Identify the IP Address of any of the Cassandra replicas. This is available from the output of the nodetool status command executed in the previous step.

Login to the CQL shell using the Cqlsh utility using the following command.



## Best Practices:



## Troubleshooting Guidelines



## Configuration details

**openebs-config.yaml**

```
#Use the following YAMLs to create a cStor Storage Pool.
# and associated storage class.
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  poolSpec:
    poolType: striped
  # NOTE - Appropriate disks need to be fetched using `kubectl get disks`
  #
  # `Disk` is a custom resource supported by OpenEBS with `node-disk-manager`
  # as the disk operator
# Replace the following with actual disk CRs from your cluster `kubectl get disks`
# Uncomment the below lines after updating the actual disk names.
  disks:
    diskList:
# Replace the following with actual disk CRs from your cluster from `kubectl get disks`
#   - disk-184d99015253054c48c4aa3f17d137b1
#   - disk-2f6bced7ba9b2be230ca5138fd0b07f1
#   - disk-806d3e77dd2e38f188fdaf9c46020bdc
#   - disk-8b6fb58d0c4e0ff3ed74a5183556424d
#   - disk-bad1863742ce905e67978d082a721d61
#   - disk-d172a48ad8b0fb536b9984609b7ee653
---
```

**openebs-sc-disk.yaml**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
      - name: ReplicaCount
        value: "1"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
---
```

**cassandra-statefulset.yaml**

```
apiVersion: apps/v1beta1
kind: StatefulSet
metadata:
  name: cassandra
  labels:
    app: cassandra
spec:
  serviceName: cassandra
  replicas: 3
  selector:
    matchLabels:
      app: cassandra
  template:
    metadata:
      labels:
        app: cassandra
    spec:
      containers:
      - name: cassandra
        image: gcr.io/google-samples/cassandra:v11
        imagePullPolicy: Always
        ports:
        - containerPort: 7000
          name: intra-node
        - containerPort: 7001
          name: tls-intra-node
        - containerPort: 7199
          name: jmx
        - containerPort: 9042
          name: cql
        resources:
          limits:
            cpu: "500m"
            memory: 1Gi
          requests:
           cpu: "500m"
           memory: 1Gi
        securityContext:
          capabilities:
            add:
              - IPC_LOCK
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "PID=$(pidof java) && kill $PID && while ps -p $PID > /dev/null; do sleep 1; done"]
        env:
          - name: MAX_HEAP_SIZE
            value: 512M
          - name: HEAP_NEWSIZE
            value: 100M
          - name: CASSANDRA_SEEDS
            value: "cassandra-0.cassandra.default.svc.cluster.local"
          - name: CASSANDRA_CLUSTER_NAME
            value: "K8Demo"
          - name: CASSANDRA_DC
            value: "DC1-K8Demo"
          - name: CASSANDRA_RACK
            value: "Rack1-K8Demo"
          - name: CASSANDRA_AUTO_BOOTSTRAP
            value: "false"
          - name: POD_IP
            valueFrom:
              fieldRef:
                fieldPath: status.podIP
        readinessProbe:
          exec:
            command:
            - /bin/bash
            - -c
            - /ready-probe.sh
          initialDelaySeconds: 15
          timeoutSeconds: 5
        # These volume mounts are persistent. They are like inline claims,
        # but not exactly because the names need to match exactly one of
        # the stateful pod volumes.
        volumeMounts:
        - name: cassandra-data
          mountPath: /cassandra_data
  volumeClaimTemplates:
  - metadata:
      name: cassandra-data
      annotations:
        volume.beta.kubernetes.io/storage-class: openebs-cstor-disk
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 5G
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
