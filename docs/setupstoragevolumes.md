---
id: setupstoragevolumes
title: Setting up Peristent Storage Volumes
sidebar_label: Storage Volumes
---

------

### Storage Volumes

An OpenEBS Volume comprises of Target and Replica component. There can be one or more Replicas. The Replica component accesses the underlying disk resources for storing the data. Target component is used by an application. Storage volumes must be persistent with the application.

OpenEBS storage provides several features that can be customised for each volume. Some of the features that can be customised per application are as follows:

- Number of replications
- Zone or node affinity
- Snapshot scheduling
- Volume expansion policy
- Replication policy


There are two types of storage volumes in OpenEBS.

```
Jiva storage volume 
Cstor storage volume
```


### Jiva Storage Volume


Jiva storage engine creates Jiva volume. By default, OpenEBS Jiva volume runs with 3 replicas.
This sample PVC yaml uses storage class openebs-jiva-default created as part of openebs-operator.yaml installation.

You can create the Jiva volume by using the following command.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-jiva-default.yaml
```

Get the Jiva pvc details by running the following command.

```
kubectl get pvc
```

Get the Jiva pv details by running the following command.

```
kubectl get pv
```

This pvc name is used in application yaml to run application using OpenEBS Jiva volume.

Jiva volume can also be created dynamically. you must change the storage class name to **openebs-jiva-default** from **openebs-standard** in the percona-openebs-deployment.yaml and then apply the yaml as mentioned below.

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/percona/percona-openebs-deployment.yaml
kubectl apply -f percona-openebs-deployment.yaml
```      

### Cstor Storage Volume


Cstor storage engine creates Cstor volume. By default, OpenEBS cStor volume will be running with 3 replicas. 
This sample PVC yaml uses storage class openebs-cstor-sparse created as part of openebs-operator.yaml installation.

You can create the Cstor volume by running the following command.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-cstor-default.yaml
```

If you want to create cStor volume on cStor Pool created using external disks, you can find the details at [Cstor vol](/docs/next/deploycstor.html).


Get the Cstor pvc details by running the following command.

```
kubectl get pvc
```

Get the Cstor pv details by running the following command.

```
kubectl get pv
```

This pvc name is used in the application yaml to run the application using OpenEBS cStor volume.

Cstor volume can also be created dynamically. you must change the storage class name to **openebs-cstor-sparse** from **openebs-standard** in the percona-openebs-deployment.yaml and then apply the yaml as mentioned below.

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/percona/percona-openebs-deployment.yaml
kubectl apply -f percona-openebs-deployment.yaml
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
