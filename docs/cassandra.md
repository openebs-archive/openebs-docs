---
id: cassandra
title: OpenEBS for Cassandra
sidebar_label: Cassandra
---
------

<img src="/docs/assets/o-cassandra.png" alt="OpenEBS and Prometheus" style="width:400px;">

## Introduction

<br>

Apache Cassandra is a distributed NoSQL database management system designed to handle large amounts of data across nodes, providing high availability with no single point of failure. It uses asynchronous masterless replication allowing low latency operations for all clients. Cassandra is deployed usually as a `statefulset` on Kubernetes and requires persistent storage for each instance of Cassandra. OpenEBS provides persistent volumes on the fly when Cassandra instances are scaled up.

<br>

**Advantages of using OpenEBS for Cassandra database:**

- No need to manage the local disks, they are managed by OpenEBS
- Large size PVs can be provisioned by OpenEBS and Cassandra
- Start with small storage and add disks as needed on the fly. Sometimes Cassandra instances are scaled up because of capacity on the nodes. With OpenEBS persistent volumes, capacity can be thin provisioned and disks can be added to OpenEBS on the fly without disruption of service 
- Cassandra sometimes need highly available storage, in such cases OpenEBS volumes can be configured with 3 replicas.
- If required, take backup of the Cassandra data periodically and back them up to S3 or any object storage so that restoration of the same data is possible to the same or any other Kubernetes cluster

<br>

*Note: Cassandra can be deployed both as `deployment` or as `statefulset`. When Cassandra deployed as `statefulset`, you don't need to replicate the data again at OpenEBS level. When Cassandra is deployed as `deployment`, consider 3 OpenEBS replicas, choose the StorageClass accordingly.*



<br>

<hr>

<br>





## Deployment model 

<br>

<img src="/docs/assets/svg/cassandra-deployment.svg" alt="OpenEBS and ElasticSearch" style="width:100%;">

<br>

As shown above, OpenEBS volumes need to be configured with three replicas for high availability. This configuration work fine when the nodes (hence the cStor pool) is deployed across Kubernetes zones.



<br>

<hr>

<br>



## Configuration workflow

<br>

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect to MayaOnline (Optional)** : Connecting the Kubernetes cluster to <a href="https://mayaonline.io" target="_blank">MayaOnline</a> provides good visibility of storage resources. MayaOnline has various **support options for enterprise customers**.

3. **Configure cStor Pool**

   After OpenEBS installation, cStor pool has to be configured. If cStor Pool is not configured in your OpenEBS cluster, this can be done from [here](/docs/next/ugcstor.html#creating-cStor-storage-pools). During cStor Pool creation, make sure that the maxPools parameter is set to >=3. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below. If cStor pool is already configured, go to the next step.

4. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on given cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies are defined. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes.  Since Cassandra is a StatefulSet application, it requires only one replication at the storage level. So cStor volume `replicaCount` is 1. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStorVolume Replica count as 1 is provided in the configuration details below.

5. **Launch and test Cassandra**

   Create a sample  `cassandra-statefulset.yaml` file in the Configuration details section. This can be applied to deploy Cassandra database  with OpenEBS. Run `kubectl apply -f cassandra-statefulset.yaml` to see Cassandra running. This will configure required PVC also.

   In other way , you can use Cassandra image with helm to deploy Cassandra in your cluster using the following command.

   ```
   helm install --namespace "cassandra" -n "cassandra" --storage-class=openebs-cstor-disk incubator/cassandra
   ```



<br>

<hr>
<br>



## Post deployment Operations

<br>

**Monitor OpenEBS Volume size** 

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. However, an alert can be setup for volume size threshold using MayaOnline.

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just Cassandra database alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. See [cStorPool metrics](/docs/next/ugcstor.html#monitor-pool). 



<br>

<hr>

<br>





## Configuration details

<br>

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



<br>

## See Also:

<br>

### [OpenEBS architecture](/docs/next/architecture.html)

### [OpenEBS use cases](/docs/next/usecases.html)

### [cStor pools overview](/docs/next/cstor.html#cstor-pools)



<br>

<hr>
<br>



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