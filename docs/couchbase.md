---
id: Couchbase
title: Using OpenEBS for Couchbase Server
sidebar_label: Couchbase Server
---
------

This section demonstrates the Couchbase deployment as a StatefulSet in a
Kubernetes cluster. You can spawn a Couchbase StatefulSet that will use
OpenEBS as its persistent storage.

Deploying Couchbase as a StatefulSet
------------------------------------

Deploying Couchbase as a StatefulSet provides the following benefits.

-   Stable unique network identifiers
-   Stable persistent storage
-   Ordered graceful deployment and scaling
-   Ordered graceful deletion and termination

Deploying Couchbase with Persistent Storage
-------------------------------------------

We are using OpenEBS cStor storage engine for running  Couchbase. Before starting, check the status of the cluster using the following command. 

```
kubectl get nodes
```

The following output shows the status of the nodes in the cluster.

```
NAME                                         STATUS    ROLES     AGE       VERSION
gke-ranjith-080-default-pool-8d4e3480-b50p   Ready     <none>    1d        v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-qsvn   Ready     <none>    1d        v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-rb03   Ready     <none>    1d        v1.9.7-gke.11
```

Also make sure that you have deployed OpenEBS in your cluster. If not deployed, you can install from [here](/docs/next/quickstartguide.html).

You can check the status of OpenEBS pods by running following command.

```
kubectl get pod -n openebs
```

Output of above command will be similar to the following.

```
NAME                                        READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-dh5u-6c798fff44-w9rrg     2/2       Running   0          1m
cstor-sparse-pool-hc30-6dcbfd59dd-t82g8     2/2       Running   0          1m
cstor-sparse-pool-l8pz-cbb88cc8-8hnrn       2/2       Running   0          1m
maya-apiserver-7bc857bb44-6vljb             1/1       Running   0          1m
openebs-ndm-b2sc5                           1/1       Running   0          1m
openebs-ndm-wws22                           1/1       Running   0          1m
openebs-ndm-x2lnx                           1/1       Running   0          1m
openebs-provisioner-b9fb58d6d-94plj         1/1       Running   0          1m
openebs-snapshot-operator-bb5697c8d-wdgmd   2/2       Running   0          1m
```

You can create a storage class YAML named *openebs-cstor-sparse-couchbase.yaml* and copy the following content to it. This YAML will create the storage class to be used for creating cStor Volume where Couchbase server will run.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-sparse-couchbase
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

Once you have copied the content, you can apply the *openebs-cstor-sparse-couchbase.yaml* using the following command.

```
kubectl apply -f openebs-cstor-sparse-couchbase.yaml
```

This will create the StorageClass named *openebs-cstor-sparse-couchbase*. You can get the details of StorageClass installed in your cluster using the following command.

```
kubectl get sc
```

Output of above command will be similar to the following.

```
NAME                             PROVISIONER                                                AGE
openebs-cstor-sparse             openebs.io/provisioner-iscsi                               1d
openebs-cstor-sparse-couchbase   openebs.io/provisioner-iscsi                               1m
openebs-jiva-default             openebs.io/provisioner-iscsi                               1d
openebs-snapshot-promoter        volumesnapshot.external-storage.k8s.io/snapshot-promoter   1d
```

Run the following command to install Couchbase services.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/couchbase/couchbase-service.yml
```

Create a YAML file named *couchbase-statefulset.yml* and copy the following sample YAML of Couchbase to the created file. In this YAML, openebs-cstor-sparse-couchbase is used the StorageClass. 

```
apiVersion: apps/v1beta1
kind: StatefulSet
metadata:
  name: couchbase
spec:
  serviceName: "couchbase"
  replicas: 2
  template:
    metadata:
      labels:
        app: couchbase
    spec:
      terminationGracePeriodSeconds: 0
      containers:
      - name: couchbase
        image: saturnism/couchbase:k8s-petset
        ports:
        - containerPort: 8091
        volumeMounts:
        - name: couchbase-data
          mountPath: /opt/couchbase/var
        env:
          - name: COUCHBASE_MASTER
            value: "couchbase-0.couchbase.default.svc.cluster.local"
          - name: AUTO_REBALANCE
            value: "false"
  volumeClaimTemplates:
  - metadata:
      name: couchbase-data
      annotations:
        volume.beta.kubernetes.io/storage-class: openebs-cstor-sparse-couchbase
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 5G
```

Now you can apply couchbase-statefulset.yml by running the following command. This will make  Couchbase server application running on cStor volume.

    kubectl apply -f couchbase-statefulset.yml

You can check the status of cassandra application pod running status using following command.

```
kubectl get pods
```

Output of above command will be similar to the following.

```
NAME          READY     STATUS    RESTARTS   AGE
couchbase-0   1/1       Running   0          33m
couchbase-1   1/1       Running   0          30m
```

You can check the status of OpenEBS  pod running status using following command.

```
kubectl get pods -n openebs
```

The StorageClass *openebs-cstor-sparse-couchbase*, that you have created have replica count as "1", so each cStor Pool contain one cStor volume. cStor volumes are communicated to one cStor target controller. Following output shows that there are 3 cStor target pods are running on each node.

```
NAME                                                              READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-dh5u-6c798fff44-w9rrg                           2/2       Running   0          47m
cstor-sparse-pool-hc30-6dcbfd59dd-t82g8                           2/2       Running   0          47m
cstor-sparse-pool-l8pz-cbb88cc8-8hnrn                             2/2       Running   0          47m
maya-apiserver-7bc857bb44-6vljb                                   1/1       Running   0          48m
openebs-ndm-b2sc5                                                 1/1       Running   0          48m
openebs-ndm-wws22                                                 1/1       Running   0          48m
openebs-ndm-x2lnx                                                 1/1       Running   0          48m
openebs-provisioner-b9fb58d6d-94plj                               1/1       Running   0          48m
openebs-snapshot-operator-bb5697c8d-wdgmd                         2/2       Running   0          48m
pvc-3257e0c2-f852-11e8-9883-42010a8000b7-target-845c8d44544jsqs   3/3       Running   0          30m
pvc-c524e6da-f851-11e8-9883-42010a8000b7-target-7875677cd6nskks   3/3       Running   0          33m
```

Get the status of running StatefulSets using the following command. 

    kubectl get statefulset

Output of above command will be similar to the following.

```
NAME        DESIRED   CURRENT   AGE
couchbase   2         2         33m
```

Get the status of underlying persistent volume used by Couchbase StatefulSet using the following command. 

    kubectl get pvc

Output of above command will be similar to the following.

```
NAME                         STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS                     AGE
couchbase-data-couchbase-0   Bound     pvc-c524e6da-f851-11e8-9883-42010a8000b7   5G         RWO            openebs-cstor-sparse-couchbase   34m
couchbase-data-couchbase-1   Bound     pvc-3257e0c2-f852-11e8-9883-42010a8000b7   5G         RWO            openebs-cstor-sparse-couchbase   31m
```

Get the status of the services using the following command. 

    kubectl get svc

Output of above command will be similar to the following.

```
NAME           TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
couchbase      ClusterIP   None            <none>        8091/TCP         35m
couchbase-ui   NodePort    10.79.244.140   <none>        8091:31066/TCP   35m
kubernetes     ClusterIP   10.79.240.1     <none>        443/TCP          1d
```

Launching Couchbase as a Server
-------------------------------

The Couchbase service YAML, creates a NodePort service type for making the Couchbase server available outside the cluster.

Get the node which is running the Couchbase server using the following command. 

    kubectl describe pod couchbase-0 | grep Node:

Output of above command will be similar to the following.

```
Node:           gke-ranjith-080-default-pool-8d4e3480-rb03/10.128.0.38
```

Get the node's External IP Address which is running the Couchbase server using the following command.

```
kubectl get nodes -o wide
```

Output of above command will be similar to the following.

```
NAME                                         STATUS    ROLES     AGE       VERSION         INTERNAL-IP   EXTERNAL-IP      OS-IMAGE             KERNEL-VERSION    CONTAINER-RUNTIME
gke-ranjith-080-default-pool-8d4e3480-b50p   Ready     <none>    1d        v1.9.7-gke.11   10.128.0.45   35.226.27.47     Ubuntu 16.04.5 LTS   4.15.0-1017-gcp   docker://17.3.2
gke-ranjith-080-default-pool-8d4e3480-qsvn   Ready     <none>    1d        v1.9.7-gke.11   10.128.0.43   35.239.82.64     Ubuntu 16.04.5 LTS   4.15.0-1017-gcp   docker://17.3.2
gke-ranjith-080-default-pool-8d4e3480-rb03   Ready     <none>    1d        v1.9.7-gke.11   10.128.0.38   35.188.181.146   Ubuntu 16.04.5 LTS   4.15.0-1017-gcp   docker://17.3.2
```

Get the port number from the Couchbase UI service using the following command. :

    kubectl describe svc couchbase-ui | grep NodePort:

Output of above command will be similar to the following.

```
NodePort:                 couchbase  31066/TCP
```

Go to the <http://35.188.181.146:31066> URL from your browser and perform the following procedure from the UI.

**Note:**

-   For Google Cloud Users, create Firewall Rules to perform tasks using Couchbase UI.
-   The NodePort is dynamically allocated and may vary in a different deployment.

1.  In the Couchbase Console, enter your credentials in the **Username** and **Password** fields and click **Sign In**. You can now see the console.[The default Username is *Administrator* and Password is *password*. Enter the credentials to see the console.]
2.  Click **Server Nodes** to see the number of Couchbase nodes that are part of the cluster. As expected, it displays only one node.
3.  Click **Data Buckets** to see a sample bucket that was created as part of the image.

You can now start using Couchbase.

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
