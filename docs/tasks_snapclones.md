---
id: tasks_snapclones
title: OpenEBS tasks around snapshots and clones
sidebar_label: Snapshots and Clones
---
------

## Snapshots using Kubectl
For taking a snapshot, you must have a PersistentVolumeClaim for which you need to take snapshot. Once you delpoy the application , it's 
PVC will be created by the name specified in the application deployment yaml.
Once the application is running, you take a snapshot. To take a snapshot you must reference the PersistentVolumeClaim name in the snapshot specification that references the data for which you want to take snapshot. An example of `snapshot.yaml` file given below.

```
apiVersion: volumesnapshot.external-storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: snapshot-demo
  namespace: default
spec:
  persistentVolumeClaimName: demo-vol1-claim
```
Here snapshot-demo is the snapshot name and demo-vol1-claim is the PVC name for which you are taking the snapshot.
You can now take a snapshot using the command below.
```
kubectl apply -f snapshot.yaml
```
The command below will show the snapshots that has already been taken.
```
kubectl get volumesnapshot
```
For more details on snapshots please click [here](https://docs.openebs.io/docs/next/snapshots.html).


## Clones using Kubectl
Once you have created a snapshot, you can restore it to a new PVC. For this you must have a separate StorageClass implemented by snapshot-provisioner. Then you can create a PVC referencing to this StorageClass for dynamically provisioning new PersistentVolume. 

You can create a separate StorageClass by using the the below contents in an yaml file. For example we have created 'restore-storageclass.yaml'
```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: snapshot-promoter
provisioner: volumesnapshot.external-storage.k8s.io/snapshot-promoter
```

Once the yaml has heen created, you have to deploy the yaml using the command below.
```
kubectl apply -f restore-storageclass.yaml
```

Next you have to you have to create a PVC that will use the StorageClass to dynamically provision a PersistentVolume. You have to create a yaml file that will deploy a PVC using the below entries. Here for example we have created restore-pvc.yaml. The PVC that will be creaed here will be named as demo-snap-vol-claim
```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: demo-snap-vol-claim
  annotations:
    snapshot.alpha.kubernetes.io/snapshot: snapshot-demo
spec:
  storageClassName: snapshot-promoter
  accessModes: ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

Then you can deploy the restore-pvc.yaml by using the command below.
```   
kubectl apply -f restore-pvc.yaml
```

Now you have to mount the demo-snap-vol-claim PVC into a similar application pod for which snapshot was taken. While deploying the pod, you have to mention the PVC name, volume naame, volume mount accordingly.

For more details on clone please click [here](https://docs.openebs.io/docs/next/snapshots.html#cloning-and-restoring-a-snapshot).

## Snapshots using MayaOnline

## Clone using MayaOnline







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
