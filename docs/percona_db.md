---
id: PerconaDB
title: Using OpenEBS for PerconaDB
sidebar_label: PerconaDB
---
------

This section provides detailed instructions on how to run a *percona-mysql* application pod on OpenEBS storage in a Kubernetes cluster and uses a *mysql-client* container to generate load (in the
form of insert and select DB queries) in order to illustrate input/output traffic on the storage.

## Deploying  Percona-MySQL with Persistent Storage

We are using OpenEBS cStor storage engine for running  Percona-MySQL. Before starting, check the status of the cluster using the following command. 

```
kubectl get nodes
```

The following output shows the status of the nodes in the cluster

```
NAME                                                STATUS    ROLES     AGE       VERSION
gke-doc-update-chandan-default-pool-80bd877e-50r3   Ready     <none>    6h        v1.11.3-gke.18
gke-doc-update-chandan-default-pool-80bd877e-5jqh   Ready     <none>    6h        v1.11.3-gke.18
gke-doc-update-chandan-default-pool-80bd877e-jhc9   Ready     <none>    6h        v1.11.3-gke.18
```

Also make sure that you have deployed OpenEBS in your cluster. If not deployed, you can install from [here](/docs/next/quickstartguide.html).

You can check the status of OpenEBS pods by running following command.

```
kubectl get pod -n openebs
```

Get the default StorageClasses installed during the OpenEBS operator installation. You can run the following command to get the StorageClass details.

```
kubectl get sc
```

Output of above command will be similar to the following.

```
NAME                        PROVISIONER                                                AGE
openebs-cstor-sparse        openebs.io/provisioner-iscsi                               6h
openebs-jiva-default        openebs.io/provisioner-iscsi                               6h
openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   6h
standard (default)          kubernetes.io/gce-pd                                       6h
```

Use OpenEBS as persistent storage for the percona pod by selecting an OpenEBS storage class in the
persistent volume claim. Create a YAML file named *percona-mysql.yaml* and copy the following sample YAML to the created file.

```
---
apiVersion: v1
kind: Pod
metadata:
  name: percona
  labels:
    name: percona
spec:
  securityContext:
    fsGroup: 999
  containers:
  - resources:
      limits:
        cpu: 0.5
    name: percona
    image: percona
    args:
      - "--ignore-db-dir"
      - "lost+found"
    env:
      - name: MYSQL_ROOT_PASSWORD
        value: k8sDem0
    ports:
      - containerPort: 3306
        name: percona
    volumeMounts:
    - mountPath: /var/lib/mysql
      name: demo-vol1
  volumes:
  - name: demo-vol1
    persistentVolumeClaim:
      claimName: demo-vol1-claim
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-cstor-sparse
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
```

Apply the *percona-mysql.yaml* using the following commands.

    kubectl apply -f percona-mysql.yaml

Output of the above command we will be similar to the below one.

```
pod "percona" created
persistentvolumeclaim "demo-vol1-claim" created
```

Verify that the Percona-MySQL pod is running successfully using the following commands.

    kubectl get pods

You should get the below output for the above command.

```
NAME      READY     STATUS    RESTARTS   AGE
percona   1/1       Running   0          5m
```

Running a Database Client Container to Generate SQL Load
------------------------------------------------------

To test the pod, you can run a Kubernetes job, in which a mysql client container runs a load generation script (which in turn performs simple sql queries) to simulate storage traffic. Run the following procedure on any node in the Kubernetes cluster.

Get the IP address of the percona application pod. You can obtain this by executing kubectl describe on the percona pod.

```
kubectl describe pod percona | grep IP
```

Output will be similar to the following.

```
IP:                 10.80.1.7
```

Now create a loadgen yaml file named *sql-loadgen.yaml*  and add the following content to the yaml file.

```
---
apiVersion: batch/v1
kind: Job
metadata:
  name: sql-loadgen
spec:
  template:
    metadata:
      name: sql-loadgen
    spec:
      restartPolicy: Never
      containers:
      - name: sql-loadgen
        image: openebs/tests-mysql-client
        command: ["/bin/bash"]
        args: ["-c", "timelimit -t 300 sh MySQLLoadGenerate.sh 10.80.1.7 > /dev/null 2>&1; exit 0"]
        tty: true 
```

Edit the following line in *sql-loadgen.yaml* to pass the desired load duration and percona pod IP as arguments. In this example, the job performs sql queries on pod with IP address **10.80.1.7** for **300sec**.

    args: ["-c", "timelimit -t 300 sh MySQLLoadGenerate.sh 10.80.1.7 > /dev/null 2>&1; exit 0"]

Run the load generation job using the following command.

    kubectl apply -f sql-loadgen.yaml

Output will be similar to the below one.

```
job.batch "sql-loadgen" created
```

Viewing Performance and Storage Consumption Statistics Using mayactl
--------------------------------------------------------------------

Performance and capacity usage statistics on the OpenEBS storage volume can be viewed by executing the following *mayactl* command inside the maya-apiserver pod. 

Use the bellow command to find maya-apiserver pod.

```
kubectl get pods -n openebs
```

Output of the above command will be similar to the following output.

```
NAME                                                              READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-j7db-66db8b8978-22cjb                           2/2       Running   0          27m
cstor-sparse-pool-x8tc-5dc749b998-bqrlp                           2/2       Running   0          27m
cstor-sparse-pool-xw2b-6695585858-4sskq                           2/2       Running   0          27m
maya-apiserver-5565f79ddc-2bjjq                                   1/1       Running   0          28m
openebs-ndm-54r98                                                 1/1       Running   0          28m
openebs-ndm-6p5bt                                                 1/1       Running   0          28m
openebs-ndm-wvlch                                                 1/1       Running   0          28m
openebs-provisioner-5c65ff5d55-rkwj9                              1/1       Running   0          28m
openebs-snapshot-operator-9898bbb95-2tsxz                         2/2       Running   0          28m
pvc-1e5df1da-f95c-11e8-bd75-42010a800229-target-59b84ff4f8cmkpn   3/3       Running   0          22m
```

Start an interactive bash console for the maya-apiserver container using the following command.

    kubectl exec -it maya-apiserver-5565f79ddc-2bjjq /bin/bash

Lookup the storage volume name using the *volume list* command

    mayactl volume list

Output will be similar to the below one.

```
Namespace  Name                                      Status   Type   Capacity
---------  ----                                      ------   ----   --------
openebs    pvc-1e5df1da-f95c-11e8-bd75-42010a800229  Running  cstor  5G
```

Get the performance and capacity usage statistics using the *volume stats* command.

    mayactl volume stats --volname pvc-1e5df1da-f95c-11e8-bd75-42010a800229 -n openebs

Output will be similar to the following.

```
Portal Details :
---------------
IQN     :   iqn.2016-09.com.openebs.cstor:pvc-1e5df1da-f95c-11e8-bd75-42010a800229
Volume  :   pvc-1e5df1da-f95c-11e8-bd75-42010a800229
Portal  :   localhost
Size    :   5.000000

Performance Stats :
--------------------
r/s      w/s      r(MB/s)      w(MB/s)      rLat(ms)      wLat(ms)
----     ----     --------     --------     ---------     ---------
0        0        0.000        0.000        0.000         0.000

Capacity Stats :
---------------
LOGICAL(GB)      USED(GB)
------------     ---------
0.000            0.015
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
