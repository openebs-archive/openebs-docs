---
id: castemplate
title: CAS Template
sidebar_label: CAS Templates
---


OpenEBS control plane provides CAS templating as an approach to provision persistent volume that make use of CAS storage engine. CAS Template allows operators to specify the desired state of storage which in turn takes action to converge towards this desired state which means creating and updating kubernetes resources as appropriate. CAS template based provisioning forms a part of kubernetes PVC to PV state transition.

OpenEBS dynamic storage provisioner along with maya api service works towards accomplishing the goal of provisioning CAS storage volume via CAS template and  finally exposing this storage volume as a PV object to be consumed by a kubernetes application.

Download below yaml files to deploy CAST Volume.

```
wget https://raw.githubusercontent.com/AmitKumarDas/community/6ce9621d992ba669f9079c59fc4d07498bd523f5/feature-demos/cas-templates/crudops/openebs-operator.yaml
wget https://raw.githubusercontent.com/AmitKumarDas/community/6ce9621d992ba669f9079c59fc4d07498bd523f5/feature-demos/cas-templates/crudops/cas-template-create.yaml
wget https://raw.githubusercontent.com/AmitKumarDas/community/6ce9621d992ba669f9079c59fc4d07498bd523f5/feature-demos/cas-templates/crudops/cas-run-tasks.yaml
```

Install OpenEBS in your k8s cluster by applying the *openebs-operator.yaml* file.

```
root@ubuntu-16:~$ kubectl apply -f openebs-operator.yaml
```

This operator installs the control plane components such as maya-apiserver, openebs-provisioner,storage pool and also deploys the default storage class templates.

> root@ubuntu-16:~$ kubectl get pods
> NAME                                   READY     STATUS    RESTARTS   AGE
> maya-apiserver-587554dd45-s8bg9        1/1       Running   0          10m
> openebs-provisioner-55ff5cd67f-68m6b   1/1       Running   0          10m
>
> root@ubuntu-16:~$ kubectl get sc
> NAME                 PROVISIONER                    AGE
> openebs-standard     openebs.io/provisioner-iscsi   10m
> standard (default)   k8s.io/minikube-hostpath       5d
>
> ranjith@ubuntu-16:~$ kubectl get sp
> NAME      AGE
> ssd       10m

Now you are ready to apply CAS template which will create a default template.

```
root@ubuntu-16:~$ kubectl apply -f cas-template-create.yaml
castemplate.openebs.io "cast-standard-0.6.0" created

root@ubuntu-16:~$ kubectl get cast
NAME                  AGE
cast-standard-0.6.0   15s
```

Apply below yaml to create template tasks . This will deploy configmap related to CAS template.

```
root@ubuntu-16:~$ kubectl apply -f cas-run-tasks.yaml
configmap "volume-read-list-controller-service-0.6.0" created
configmap "volume-read-list-controller-pods-0.6.0" created
configmap "volume-read-list-replica-pods-0.6.0" created
configmap "volume-read-output-0.6.0" created
configmap "volume-create-output-0.6.0" created
configmap "volume-create-put-service-0.6.0" created
configmap "volume-create-get-path-0.6.0" created
configmap "volume-create-get-pvc-0.6.0" created
configmap "volume-create-list-replica-pods-0.6.0" created
configmap "volume-create-patch-replica-0.6.0" created
configmap "volume-create-put-controller-0.6.0" created
configmap "volume-create-put-replica-0.6.0" created
```

Now,default CAS template feature has deployed in your k8s cluster .This template can be used while provisioning  persistent CAST volume. To provision CAST template volume and run your application,  modify storage class as "openebs-standard"  in your application pvc yaml and apply it. Default CAS Template values are 

| Property        | Value              |
| --------------- | ------------------ |
| VolumeMonitor   | true               |
| ControllerImage | openebs/jiva:0.5.0 |
| ReplicaImage    | openebs/jiva:0.5.0 |
| ReplicaCount    | 1                  |
| StoragePool     | ssd                |

Also this will have Taint toleration,Eviction toleration and Node-affinity toleration field. You can customize the key-value pair of above tolerations based on the taints applied on the Nodes. 

### Deploy a Test CAST volume

You can test CAS Template by deploying one persistent volume.

```
root@ubuntu-16:~$ kubectl apply -f pvc.yaml
persistentvolumeclaim "casvolume-claim" created

```

This will create CAST volume with default template values.

```
root@ubuntu-16:~$ kubectl get pvc
NAME              STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
casvolume-claim   Bound     pvc-f4df0b24-6890-11e8-a3dc-000c296fd8d3   1Gi        RWO            openebs-standard   9s

root@ubuntu-16:~$ kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                     STORAGECLASS       REASON    AGE
pvc-f4df0b24-6890-11e8-a3dc-000c296fd8d3   6Gi        RWO            Delete           Bound     default/casvolume-claim   openebs-standard             10s

```

Volume Pods are also created as per the default values in CAS Template.

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
