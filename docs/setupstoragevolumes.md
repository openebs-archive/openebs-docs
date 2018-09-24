---
id: setupstoragevolumes
title: Setting up Peristent Storage Volumes
sidebar_label: Storage Volumes
---

------

### Storage Volumes

A OpenEBS Volume comprises of a Target pod and Replica pod(s). There can be one or more Replica pods. The Replica pods are the ones that access the underlying disk resources for storing the data. Storage volumes need to be persistent to the application but they need to be volatile in the backend. 

OpenEBS storage provides several features that can be customized for each volume. Some of the features that could be customized per application are as follows:

- Number of replications
- Zone or node affinity
- Snapshot scheduling
- Volume expansion policy
- Replication policy


There are two type of storage volumes in OpenEBS.

```
Jiva storage volume 
Cstor storage volume
```


### Jiva Storage Volume


By default, OpenEBS Jiva volume runs with 3 replica count.
Following is the pvc yaml file to create Jiva volume on cStor sparse Pool. This sample PVC yaml will use default storage class openebs-jiva-default storage class created as part of openebs-operator.yaml installation.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-jiva-default
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4G
```

This pvc yaml can be applied by running following command.

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


### Cstor Storage Volume


By default, OpenEBS cStor volume will be running with 3 replica count.
Following is the sample pvc yaml file to create cStor volume on cStor sparse Pool.This sample PVC yaml will use default storage class openebs-cstor-sparse created as part of openebs-operator.yaml installation.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-cstor-vol1-claim
spec:
  storageClassName: openebs-cstor-sparse 
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4G
```

This pvc yaml can be applied by running following command.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-cstor-default.yaml
```

Following is the sample pvc yaml file to create cStor volume on cStor Pool created using external disks.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-cstor-disk-vol1-claim
spec:
  storageClassName: openebs-cstor-disk
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4G
```

This pvc yaml can be applied by running following command.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/sample-pv-yamls/pvc-standard-cstor-disk.yaml
```

Get the Cstor pvc details by running the following command.

```
kubectl get pvc
```

Get the Cstor pv details by running the following command.

```
kubectl get pv
```

This pvc name is used in application yaml to run application using OpenEBS cStor volume.
      
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
