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

We are using OpenEBS cStor storage engine for running  CockroachDB. Before starting, check the status of the cluster using the following command. 

```
kubectl get nodes
```

The following output shows the status of the nodes in the cluster

    NAME                                         STATUS    ROLES     AGE       VERSION
    gke-ranjith-080-default-pool-8d4e3480-b50p   Ready     <none>    22h       v1.9.7-gke.11
    gke-ranjith-080-default-pool-8d4e3480-qsvn   Ready     <none>    22h       v1.9.7-gke.11
    gke-ranjith-080-default-pool-8d4e3480-rb03   Ready     <none>    22h       v1.9.7-gke.11

Also make sure that you have deployed OpenEBS in your cluster. If not deployed, you can install from [here](/docs/next/quickstartguide.html).

You can check the status of OpenEBS pods by running following command.

```
kubectl get pod -n openebs
```

Output of above command will be similar to the following.

```
NAME                                        READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-k0b1-5877cfdf6d-pb8n5     2/2       Running   0          5m
cstor-sparse-pool-z8sr-668f5d9b75-z9547     2/2       Running   0          5m
cstor-sparse-pool-znj9-6b84f659db-hwzvn     2/2       Running   0          5m
maya-apiserver-7bc857bb44-qpjr4             1/1       Running   0          6m
openebs-ndm-9949m                           1/1       Running   0          6m
openebs-ndm-pnm25                           1/1       Running   0          6m
openebs-ndm-stkjp                           1/1       Running   0          6m
openebs-provisioner-b9fb58d6d-tdpx7         1/1       Running   0          6m
openebs-snapshot-operator-bb5697c8d-qlglr   2/2       Running   0          6m

```

Get the default StorageClasses installed during the OpenEBS operator installation. You can run the following command to get the StorageClass details.

```
kubectl get sc
```

Output of above command will be similar to the following.

```
NAME                        PROVISIONER                                             AGE
openebs-cstor-sparse        openebs.io/provisioner-iscsi                            15h
openebs-jiva-default        openebs.io/provisioner-iscsi                            15h
openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter15h
standard (default)          kubernetes.io/gce-pd                                    15h
```

Create a YAML file named *cockroachdb-sts.yaml* and copy the following sample YAML of cockroach DB to the created file.

```
---
apiVersion: policy/v1beta1
kind: PodDisruptionBudget
metadata:
  name: cockroachdb-budget
  labels:
    app: cockroachdb
spec:
  selector:
    matchLabels:
      app: cockroachdb
  minAvailable: 67%
---
apiVersion: apps/v1beta1
kind: StatefulSet
metadata:
  name: cockroachdb
spec:
  serviceName: "cockroachdb"
  replicas: 3
  template:
    metadata:
      labels:
        app: cockroachdb
    spec:
      # Init containers are run only once in the lifetime of a pod, before
      # it's started up for the first time. It has to exit successfully
      # before the pod's main containers are allowed to start.
      # This particular init container does a DNS lookup for other pods in
      # the set to help determine whether or not a cluster already exists.
      # If any other pods exist, it creates a file in the cockroach-data
      # directory to pass that information along to the primary container that
      # has to decide what command-line flags to use when starting CockroachDB.
      # This only matters when a pod's persistent volume is empty - if it has
      # data from a previous execution, that data will always be used.
      #
      # If your Kubernetes cluster uses a custom DNS domain, you will have
      # to add an additional arg to this pod: "-domain=<your-custom-domain>"
      initContainers:
      - name: bootstrap
        image: cockroachdb/cockroach-k8s-init:0.2
        imagePullPolicy: IfNotPresent
        args:
        - "-on-start=/on-start.sh"
        - "-service=cockroachdb"
        env:
        - name: POD_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        volumeMounts:
        - name: datadir
          mountPath: /cockroach/cockroach-data
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - cockroachdb
              topologyKey: kubernetes.io/hostname
      containers:
      - name: cockroachdb
        image: cockroachdb/cockroach:v1.1.1
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 26257
          name: grpc
        - containerPort: 8080
          name: http
        volumeMounts:
        - name: datadir
          mountPath: /cockroach/cockroach-data
        command:
          - "/bin/bash"
          - "-ecx"
          - |
            # The use of qualified `hostname -f` is crucial:
            # Other nodes aren't able to look up the unqualified hostname.
            CRARGS=("start" "--logtostderr" "--insecure" "--host" "$(hostname -f)" "--http-host" "0.0.0.0" "--cache" "25%" "--max-sql-memory" "25%")
            # We only want to initialize a new cluster (by omitting the join flag)
            # if we're sure that we're the first node (i.e. index 0) and that
            # there aren't any other nodes running as part of the cluster that
            # this is supposed to be a part of (which indicates that a cluster
            # already exists and we should make sure not to create a new one).
            # It's fine to run without --join on a restart if there aren't any
            # other nodes.
            if [ ! "$(hostname)" == "cockroachdb-0" ] || \
               [ -e "/cockroach/cockroach-data/cluster_exists_marker" ]
            then
              # We don't join cockroachdb in order to avoid a node attempting
              # to join itself, which currently doesn't work
              # (https://github.com/cockroachdb/cockroach/issues/9625).
              CRARGS+=("--join" "cockroachdb-public")
            fi
            exec /cockroach/cockroach ${CRARGS[*]}
      # No pre-stop hook is required, a SIGTERM plus some time is all that's
      # needed for graceful shutdown of a node.
      terminationGracePeriodSeconds: 60
      volumes:
      - name: datadir
        persistentVolumeClaim:
          claimName: datadir
  volumeClaimTemplates:
  - metadata:
      name: datadir
    spec:
      storageClassName: openebs-cstor-sparse
      accessModes:
        - "ReadWriteOnce"
      resources:
        requests:
          storage: 10G
```

Once you have copied the above content to *cockroachdb-sts.yaml*, you can run the following command to create cockroach DB StatefulSet application on OpenEBS cStor volume.

```
kubectl apply -f cockroachdb-sts.yaml
```

Run the following command to install the cockroach DB services.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/cockroachDB/cockroachdb-svc.yaml
```

Get the status of OpenEBS cStor running pods using the following command. 

```
kubectl get pods -n openebs
```

Output of above command will be similar to the following. In the following output, it will list the cStor target pod since this application uses default cStor StorageClass *openebs-cstor-sparse* , it will contain 3 cStor target pods.

```
NAME                                                              READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-k0b1-5877cfdf6d-pb8n5                           2/2       Running   0          2h
cstor-sparse-pool-z8sr-668f5d9b75-z9547                           2/2       Running   0          2h
cstor-sparse-pool-znj9-6b84f659db-hwzvn                           2/2       Running   0          2h
maya-apiserver-7bc857bb44-qpjr4                                   1/1       Running   0          2h
openebs-ndm-9949m                                                 1/1       Running   0          2h
openebs-ndm-pnm25                                                 1/1       Running   0          2h
openebs-ndm-stkjp                                                 1/1       Running   0          2h
openebs-provisioner-b9fb58d6d-tdpx7                               1/1       Running   0          2h
openebs-snapshot-operator-bb5697c8d-qlglr                         2/2       Running   0          2h
pvc-327d56fd-f79b-11e8-9883-42010a8000b7-target-6cb76bddbdnlghb   3/3       Running   1          10m
pvc-99b7e698-f79b-11e8-9883-42010a8000b7-target-77f47b997fsftlj   3/3       Running   0          7m
pvc-cc43a7cf-f79a-11e8-9883-42010a8000b7-target-ff8f9455-2j2tf    3/3       Running   1          13m
```

Get the status of cockroach DB running pods using the following command. 

```
kubectl get pods
```

Output of above command will be similar to the following.

    NAME            READY     STATUS    RESTARTS   AGE
    cockroachdb-0   1/1       Running   0          11m
    cockroachdb-1   1/1       Running   0          9m
    cockroachdb-2   1/1       Running   0          6m

Get the status of running StatefulSet using the following command. 

    kubectl get statefulset

Output of above command will be similar to the following.

```
NAME          DESIRED   CURRENT   AGE
cockroachdb   3         3         15m
```

Get the status of underlying persistent volume used by CockroachDB StatefulSet using the following command. 

    kubectl get pvc

Output of above command will be similar to the following.

```
NAME                    STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS           AGE
datadir-cockroachdb-0   Bound     pvc-cc43a7cf-f79a-11e8-9883-42010a8000b7   10G        RWO            openebs-cstor-sparse   16m
datadir-cockroachdb-1   Bound     pvc-327d56fd-f79b-11e8-9883-42010a8000b7   10G        RWO            openebs-cstor-sparse   13m
datadir-cockroachdb-2   Bound     pvc-99b7e698-f79b-11e8-9883-42010a8000b7   10G        RWO            openebs-cstor-sparse   10m
```

Get the status of persistent volumes using following command. Here replica count is 3 . So 3 PVs will be created.

```
kubectl get pv
```

Output of above command will be similar to the following.

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                           STORAGECLASS           REASON    AGE
pvc-327d56fd-f79b-11e8-9883-42010a8000b7   10G        RWO            Delete           Bound     default/datadir-cockroachdb-1   openebs-cstor-sparse             14m
pvc-99b7e698-f79b-11e8-9883-42010a8000b7   10G        RWO            Delete           Bound     default/datadir-cockroachdb-2   openebs-cstor-sparse             11m
pvc-cc43a7cf-f79a-11e8-9883-42010a8000b7   10G        RWO            Delete           Bound     default/datadir-cockroachdb-0   openebs-cstor-sparse             17m
```

Get the status of the services using the following command. 

    kubectl get svc

Output of above command will be similar to the following.

```
NAME                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)              AGE
cockroachdb          ClusterIP   None            <none>        26257/TCP,8080/TCP   17m
cockroachdb-public   ClusterIP   10.79.248.113   <none>        26257/TCP,8080/TCP   17m
kubernetes           ClusterIP   10.79.240.1     <none>        443/TCP              1d
```

Testing your Database
---------------------

### Using the built-in SQL Client

1. Launch a temporary interactive pod and start the built-in SQL client inside it using the following command. 

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

3. Exit the SQL shell using the following command.

   ```
   >\q
   ```

Using a Load Generator
----------------------

1. Apply the following command to run the load generator on the cockroah DB.

   ```
   kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/cockroachDB/cockroachdb-lg.yaml
   ```

2. Get the status of the job using the following command. 

   ```
   kubectl get jobs 
   ```

   Output of above command will be similar to the following.

   ```
   NAME             DESIRED   SUCCESSFUL   AGE
   cockroachdb-lg   1         0            1m
   ```

   This is a Kubernetes Job YAML. It creates a database named test with a table named kv containing random k:v pairs. The Kubernetes Job will run for a duration of 5 minutes, which is a configurable value in the YAML.

3. Launch a temporary interactive pod and start the built-in SQL client inside it using the following command. 

   ```
   kubectl run cockroachdb -it --image=cockroachdb/cockroach --rm --restart=Never -- sql --insecure --host=cockroachdb-public
   ```

4. Set the default database as test and display the contents of the kv table as follows: 

   ```
   > SHOW DATABASES;
   	   Database
   +--------------------+
     bank
     crdb_internal
     information_schema
     pg_catalog
     system
     test
   (6 rows)
   
   Time: 3.045054ms
   
   warning: no current database set. Use SET database = <dbname> to change, CREATE DATABASE to make a new database.
   
   > SET DATABASE=test;
   SET
   
   Time: 3.857271ms	
   
   test> SELECT * FROM test.kv LIMIT 10;
             k           |  v
   +----------------------+------+
     -9216119115622842486 | 8
     -9206152770853840714 | \247
     -9205724507541454650 |
     -9205526224994689231 | 5
     -9204533060278342786 | \271
     -9203959952813934916 | \350
     -9196373679797218795 | q
     -9193940766777406791 | \217
     -9193519308956379951 | y
     -9189847179460993095 | \276
   (10 rows)
   
   Time: 5.63456ms
   
   test> SELECT COUNT(*) FROM test.kv;
    count(*)
   +----------+
     6155
   (1 row)
   
   Time: 15.628847ms
   ```

5. Exit the SQL shell using the following command. 

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

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
