---
id: castemplate
title: CAS Templates
sidebar_label: CAS Templates
---




OpenEBS control plane provides CAS templates as an approach to provision persistent volumes that make use of CAS storage engine. CAS Template (CAST) allows operators to specify the desired state of storage and also acts to converge towards this desired state which means creating and updating appropriate Kubernetes resources. CAS template based provisioning forms a part of Kubernetes PVC to PV state transition.

OpenEBS dynamic storage provisioner along with maya api service works towards accomplishing the goal of provisioning CAS storage volume via CAS template. This storage volume is exposed as a PV object which is consumed by a Kubernetes application.

Download the following yaml files to deploy the CAST Volume.

```
wget https://raw.githubusercontent.com/AmitKumarDas/community/6ce9621d992ba669f9079c59fc4d07498bd523f5/feature-demos/cas-templates/crudops/openebs-operator.yaml
```

```
wget https://raw.githubusercontent.com/AmitKumarDas/community/6ce9621d992ba669f9079c59fc4d07498bd523f5/feature-demos/cas-templates/crudops/cas-template-create.yaml
```

```
wget https://raw.githubusercontent.com/AmitKumarDas/community/6ce9621d992ba669f9079c59fc4d07498bd523f5/feature-demos/cas-templates/crudops/cas-run-tasks.yaml
```

Install OpenEBS in your k8s cluster by applying the *openebs-operator.yaml* file.

```
kubectl apply -f openebs-operator.yaml
```

The operator installs control plane components such as maya-apiserver, openebs-provisioner, storage pool and also deploys the default storage class templates.

```
root@ubuntu-16:~$ kubectl get pods
NAME                                   READY     STATUS    RESTARTS   AGE
maya-apiserver-587554dd45-s8bg9        1/1       Running   0          10m
openebs-provisioner-55ff5cd67f-68m6b   1/1       Running   0          10m
```

```
root@ubuntu-16:~$ kubectl get sc
NAME                 PROVISIONER                    AGE
openebs-standard     openebs.io/provisioner-iscsi   10m
standard (default)   k8s.io/minikube-hostpath       5d
```

```
root@ubuntu-16:~$ kubectl get sp
NAME      AGE
ssd       10m
```

Now you are ready to apply the CAS template which creates a default template.

```
kubectl apply -f cas-template-create.yaml
```

The CAS Template is created and you can check using the following command.

```
kubectl get cast
```

Apply the following yaml to create template tasks which will deploy the configmap related to CAS template.

```
kubectl apply -f cas-run-tasks.yaml
```

The default CAS template is now deployed in your k8s cluster. This template can be used while provisioning persistent CAST volume. To provision CAST template volume and run your application, modify the storage class as "openebs-standard" in your application pvc yaml and apply it. The default CAS Template values are as follows:

| Property        | Value              |
| --------------- | ------------------ |
| VolumeMonitor   | true               |
| ControllerImage | openebs/jiva:0.5.0 |
| ReplicaImage    | openebs/jiva:0.5.0 |
| ReplicaCount    | 1                  |
| StoragePool     | ssd                |

Also these values will have Taint toleration, Eviction toleration, and Node-affinity toleration fields. You can customize the key-value pair of above tolerations based on the taints applied on the Nodes. 

### Deploy a Test CAST volume

You can test a CAS Template by deploying one persistent volume.

Download test pvc.yaml by running the following command.

```
wget https://raw.githubusercontent.com/AmitKumarDas/community/6ce9621d992ba669f9079c59fc4d07498bd523f5/feature-demos/cas-templates/crudops/pvc.yaml
```

Apply the pvc.yaml file to create persistent CAST volume using the following command.

```
kubectl apply -f pvc.yaml
```

The CAST volume is created with default template values as in the following example.

```
root@ubuntu-16:~$ kubectl get pvc
NAME              STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
casvolume-claim   Bound     pvc-f4df0b24-6890-11e8-a3dc-000c296fd8d3   1Gi        RWO            openebs-standard   9s

root@ubuntu-16:~$ kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                     STORAGECLASS       REASON    AGE
pvc-f4df0b24-6890-11e8-a3dc-000c296fd8d3   6Gi        RWO            Delete           Bound     default/casvolume-claim   openebs-standard             10s
```



Volume Pods are also created as per the default values in the CAS Template as in the following example.

```
root@ubuntu-16:~$ kubectl get pods
NAME                                                             READY     STATUS    RESTARTS   AGE
maya-apiserver-587554dd45-s8bg9                                  1/1       Running   0          14m
openebs-provisioner-55ff5cd67f-68m6b                             1/1       Running   0          14m
pvc-f4df0b24-6890-11e8-a3dc-000c296fd8d3-ctrl-745445b5b5-whbbn   2/2       Running   0          30s
pvc-f4df0b24-6890-11e8-a3dc-000c296fd8d3-rep-57478cd89f-44v8s    1/1       Running   0          30s
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
