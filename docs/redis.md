---
id: Redis
title: Using OpenEBS for Redis
sidebar_label: Redis StatefulSet
---
------

This section demonstrates the deployment of Redis as a StatefulSet in a Kubernetes cluster. You can spawn a Redis StatefulSet that will use OpenEBS as its persistent storage.

Deploying Redis as a StatefulSet
--------------------------------

Deploying Redis as a StatefulSet provides the following benefits.

-   Stable unique network identifiers
-   Stable persistent storage
-   Ordered graceful deployment and scaling
-   Ordered graceful deletion and termination

Deploying Redis with Persistent Storage
---------------------------------------

We are using OpenEBS cStor storage engine for running Redis. Before starting, check the status of the cluster using the following command.  

```
kubectl get nodes
```

The following output shows the status of the nodes in the cluster.

```
NAME                                            STATUS    ROLES     AGE       VERSION
gke-motest-prabhat-default-pool-8f4cdca6-f911   Ready     <none>    1h        v1.11.2-gke.18
gke-motest-prabhat-default-pool-8f4cdca6-jxdp   Ready     <none>    1h        v1.11.2-gke.18
gke-motest-prabhat-default-pool-8f4cdca6-txjn   Ready     <none>    1h        v1.11.2-gke.18
```

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

Download the Redis YML file from the OpenEBS repository using the following command. 

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/redis/redis-statefulset.yml
```

Change the storage-class to **openebs-cstor-sparse** from openebs-jiva-default in redis-statefulset.yml

```
volumeClaimTemplates:
  - metadata:
      name: datadir
      annotations:
        volume.beta.kubernetes.io/storage-class: openebs-cstor-sparse
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 5G
```

Apply the modified Redis YML file using the following command.

```
kubectl apply -f redis-statefulset.yml
```

Get the status of OpenEBS cStor running pods using the following command. 

```
kubectl get pods -n openebs
```

Output of above command will be similar to the following. In the following output, it will list the cStor target pod since this application uses default cStor StorageClass *openebs-cstor-sparse* , it will contain 3 cStor target pods. 

```
NAME                                                              READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-q8rt-645f65dbdb-nhhcv                           2/2       Running   0          1h
cstor-sparse-pool-r8yl-dd754f985-mz8xs                            2/2       Running   0          1h
cstor-sparse-pool-we1x-fd9dc97cf-jq7m6                            2/2       Running   0          1h
maya-apiserver-5565f79ddc-65sz6                                   1/1       Running   0          1h
openebs-ndm-8pwgd                                                 1/1       Running   0          1h
openebs-ndm-9b8mr                                                 1/1       Running   0          1h
openebs-ndm-mhzdl                                                 1/1       Running   0          1h
openebs-provisioner-5c65ff5d55-wpfmk                              1/1       Running   0          1h
openebs-snapshot-operator-9898bbb95-67lq7                         2/2       Running   0          1h
pvc-2b5f2c11-f91f-11e8-97c6-42010a80022c-target-865f55d897qhp86   3/3       Running   1          1h
pvc-47ddaa27-f91e-11e8-97c6-42010a80022c-target-777c455d9cd4t58   3/3       Running   0          1h
pvc-bb07a130-f91e-11e8-97c6-42010a80022c-target-7499c8577dpn7v8   3/3       Running   0          1h
```

Get the status of Redis running pods using the following command. 

```
kubectl get pods
```

Output of above command will be similar to the following.

```
NAME      READY     STATUS    RESTARTS   AGE
rd-0      1/1       Running   0          1h
rd-1      1/1       Running   0          1h
rd-2      1/1       Running   0          1h
```

Get the status of running StatefulSets using the following command. 

```
kubectl get statefulset
```

Output of above command will be similar to the following.

```
NAME      DESIRED   CURRENT   AGE
 rd        3         3         19h
```

Get the status of underlying persistent volume used by Redis StatefulSet using the following command. 

```
kubectl get pvc
```

Output of above command will be similar to the following.

```
NAME           STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS           AGE
datadir-rd-0   Bound     pvc-47ddaa27-f91e-11e8-97c6-42010a80022c   5G         RWO            openebs-cstor-sparse   1h
datadir-rd-1   Bound     pvc-bb07a130-f91e-11e8-97c6-42010a80022c   5G         RWO            openebs-cstor-sparse   1h
datadir-rd-2   Bound     pvc-2b5f2c11-f91f-11e8-97c6-42010a80022c   5G         RWO            openebs-cstor-sparse   1h
```

Get the status of persistent volumes using the following command. Here replica count is 3 . So 3 PVs will be created.

```
kubectl get pv
```

Output of above command will be similar to the following.

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                  STORAGECLASS           REASON    AGE
pvc-2b5f2c11-f91f-11e8-97c6-42010a80022c   5G         RWO            Delete           Bound     default/datadir-rd-2   openebs-cstor-sparse             1h
pvc-47ddaa27-f91e-11e8-97c6-42010a80022c   5G         RWO            Delete           Bound     default/datadir-rd-0   openebs-cstor-sparse             1h
pvc-bb07a130-f91e-11e8-97c6-42010a80022c   5G         RWO            Delete           Bound     default/datadir-rd-1   openebs-cstor-sparse             1h
```

Get the status of the services using the following command. 

```
kubectl get svc
```

Output of above command will be similar to the following.

```
NAME         TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)    AGE
kubernetes   ClusterIP   10.7.240.1   <none>        443/TCP    15d
redis        ClusterIP   None         <none>        6379/TCP   1h
```

Get the status of the services running in openebs namespace using the following command. 

```
kubectl get svc -n openebs
```

Output of above command will be similar to the following.

```
NAME                                       TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)                               AGE
maya-apiserver-service                     ClusterIP   10.7.245.229   <none>        5656/TCP                              1h
pvc-2b5f2c11-f91f-11e8-97c6-42010a80022c   ClusterIP   10.7.253.110   <none>        3260/TCP,7777/TCP,6060/TCP,9500/TCP   1h
pvc-47ddaa27-f91e-11e8-97c6-42010a80022c   ClusterIP   10.7.254.40    <none>        3260/TCP,7777/TCP,6060/TCP,9500/TCP   1h
pvc-bb07a130-f91e-11e8-97c6-42010a80022c   ClusterIP   10.7.251.213   <none>        3260/TCP,7777/TCP,6060/TCP,9500/TCP   1h
```


Checking Redis Replication
--------------------------

Set a key:value pair in the Redis master using the following command. 

```
kubectl exec rd-0 -- /opt/redis/redis-cli -h rd-0.redis SET replicated:test true
OK
```

Retrieve value of the key from a Redis slave using the following command. 

```
kubectl exec rd-2 -- /opt/redis/redis-cli -h rd-0.redis GET replicated:test
```

If the output of the above command is **true** then the replication is in sync.


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
