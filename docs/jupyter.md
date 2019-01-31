---
id: Jupyter
title: Using OpenEBS volumes for Jupyter
sidebar_label: Jupyter
---
------

This section provides detailed instructions on how to run a jupyter pod on OpenEBS storage in a Kubernetes cluster and uses a *jupyter ui editor* to generate load in order to illustrate input/output traffic on
the storage.

Run Jupyter Pod with OpenEBS Storage
------------------------------------

In this example,OpenEBS cStor storage engine is used for running  Couchbase. Before starting, check the status of the cluster using the following command. 

```
kubectl get nodes
```

The following output shows the status of the nodes in the cluster.

```
NAME                                         STATUS    ROLES     AGE       VERSION
gke-ranjith-080-default-pool-8d4e3480-b50p   Ready     <none>    2d        v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-qsvn   Ready     <none>    2d        v1.9.7-gke.11
gke-ranjith-080-default-pool-8d4e3480-rb03   Ready     <none>    2d        v1.9.7-gke.11

```

Also make sure that you have deployed OpenEBS in your cluster. If not deployed, you can install from [here](/docs/next/quickstartguide.html).

You can check the status of OpenEBS pods by running following command.

```
kubectl get pod -n openebs
```

Output of above command will be similar to the following.

```
NAME                                        READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-l8oc-75464957d5-p4m4n     2/2       Running   0          1h
cstor-sparse-pool-m7ld-87db7797c-hbsv2      2/2       Running   0          1h
cstor-sparse-pool-md1e-944849559-7pjcf      2/2       Running   0          1h
maya-apiserver-7bc857bb44-9w7hx             1/1       Running   0          1h
openebs-ndm-gfk85                           1/1       Running   0          1h
openebs-ndm-h4rt6                           1/1       Running   0          1h
openebs-ndm-pxjcb                           1/1       Running   0          1h
openebs-provisioner-b9fb58d6d-t475j         1/1       Running   0          1h
openebs-snapshot-operator-bb5697c8d-7jfqd   2/2       Running   0          1h
```

Download the following file from OpenEBS repo and change the **storageClassName** under **PersistentVolumeClaim** -> ***spec*** from *openebs-jiva-default* to *openebs-cstor-sparse*. 

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/jupyter/demo-jupyter-openebs.yaml
```

After the modification on the downloaded file, you can run following command to install the Jupyter application on cStor volume.

    kubectl apply -f demo-jupyter-openebs.yaml

The above command creates the following, which can be verified using the corresponding kubectl commands.

- Launches a Jupyter Server, with the specified notebook file from github. You can run the following command to check the same.

  ```
  kubectl get deployments
  ```

  Output of above command will be similar to the following.

  ```
  NAME             DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
  jupyter-server   1         1         1            0           1m
  ```

- Creates an OpenEBS Volume and mounts to the Jupyter Server Pod (/mnt/data) . You can check the PVC details by running the following command.

  ```
  kubectl get pvc
  ```

  Output of above command will be similar to the following.

  ```
  NAME                     STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS           AGE
  jupyter-data-vol-claim   Bound     pvc-61c8ae2d-f879-11e8-9883-42010a8000b7   5G         RWO            openebs-cstor-sparse   2m
  ```

  Verify that the OpenEBS storage pods are created and the jupyter pod is running successfully using the following commands.

  ```
  kubectl get pods -n openebs
  ```

  Output of above command will be similar to the following.

  ```
  NAME                                                              READY     STATUS    RESTARTS   AGE
  cstor-sparse-pool-l8oc-75464957d5-p4m4n                           2/2       Running   0          1h
  cstor-sparse-pool-m7ld-87db7797c-hbsv2                            2/2       Running   0          1h
  cstor-sparse-pool-md1e-944849559-7pjcf                            2/2       Running   0          1h
  maya-apiserver-7bc857bb44-9w7hx                                   1/1       Running   0          1h
  openebs-ndm-gfk85                                                 1/1       Running   0          1h
  openebs-ndm-h4rt6                                                 1/1       Running   0          1h
  openebs-ndm-pxjcb                                                 1/1       Running   0          1h
  openebs-provisioner-b9fb58d6d-t475j                               1/1       Running   0          1h
  openebs-snapshot-operator-bb5697c8d-7jfqd                         2/2       Running   0          1h
  pvc-61c8ae2d-f879-11e8-9883-42010a8000b7-target-74f84b65bc64nj5   3/3       Running   1          9m
  ```

  Verify that the jupyter pod is running successfully using the following commands.

  ```
  kubectl get pods
  ```

  Output of above command will be similar to the following.

  ```
  NAME                             READY     STATUS    RESTARTS   AGE
  jupyter-server-68d4ddc48-rtvk6   1/1       Running   0          10m
  ```

- Exposes the Jupyter Server to external world via the <http://>\<NodeIP\>:32424 . NodeIP is any of the nodes external IP. You can get the external IP using the following command.

  ```
  kubectl get nodes -o wide
  ```

  Output of above command will be similar to the following.

  ```
  NAME                                         STATUS    ROLES     AGE       VERSION         INTERNAL-IP   EXTERNAL-IP      OS-IMAGE             KERNEL-VERSION    CONTAINER-RUNTIME
  gke-ranjith-080-default-pool-8d4e3480-b50p   Ready     <none>    2d        v1.9.7-gke.11   10.128.0.45   35.226.27.47     Ubuntu 16.04.5 LTS   4.15.0-1017-gcp   docker://17.3.2
  gke-ranjith-080-default-pool-8d4e3480-qsvn   Ready     <none>    2d        v1.9.7-gke.11   10.128.0.43   35.239.82.64     Ubuntu 16.04.5 LTS   4.15.0-1017-gcp   docker://17.3.2
  gke-ranjith-080-default-pool-8d4e3480-rb03   Ready     <none>    2d        v1.9.7-gke.11   10.128.0.38   35.188.181.146   Ubuntu 16.04.5 LTS   4.15.0-1017-gcp   docker://17.3.2
  ```

  Take External IP of any of the Nodes and provide in the browser. 

  Example:

   <http://>35.226.27.47:32424

  **Note:**

  It may take some time for the pods to start as the images must be pulled and instantiated. This is also dependent on the network speed.

  The jupyter server dashboard can be accessed on the Kubernetes node port as in the following screen.

![image](/docs/assets/Jupyter.png)

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
