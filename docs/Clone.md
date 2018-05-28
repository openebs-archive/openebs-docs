---
id: Clone
title: Creating Clone From Snapshot
sidebar_label: Clone
---

------
## Cloning and Restoring a Snapshot 

After creating a snapshot, you can restore it to a new Persitent Volume Claim. To do this you must create a special StorageClass implemented by snapshot-provisioner. We will then create a PersistentVolumeClaim referencing this StorageClass for dynamically provisioning new PersistentVolume. An annotation on the PersistentVolumeClaim will inform snapshot-provisioner on where to find the information it needs to deal with the OpenEBS Apiserver to restore the snapshot. 

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
      
A StorageClass can be defined as below. Here the provisioner field defines which provisioner should be used and what parameters should be passed to that provisioner when dynamic provisioning is invoked.

```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: snapshot-promoter
provisioner: volumesnapshot.external-storage.k8s.io/snapshot-promoter
```
Such Storage Class is necessary for restoring a Persistent Volume from already created Volume Snapshot and Volume Snapshot Data.

`annotations:` snapshot.alpha.kubernetes.io/snapshot: the name of the Volume Snapshot that will be restored.
`storageClassName:` Storage Class created by the admin for restoring Volume Snapshots.

## Deleting a Snapshot

You can delete snapshot you have taken which will also delete the corresponding Volume Snapshot Data resource from Kubernetes. The following command will delete the *snapshot.yaml* file.

```
kubectl apply -f snapshot.yaml
```

This will not affect any `PersistentVolumeClaims` or `PersistentVolumes` you have already provisioned using the snapshot. On the other hand, deleting any `PersistentVolumeClaims` or `PersistentVolumes` that you have used to take a snapshot or have been provisioned using a snapshot will not delete the snapshot from the OpenEBS backend. You have to delete them manually. 




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
