---
id: Snapshot
title: Configuring Snapshot
sidebar_label: Snapshot
---

------

## Snapshot

What is a Snapshot?

A storage snapshot is a set of reference markers for data at a particular point in time. A snapshot acts like a detailed table of contents, providing you with accessible copies of data that you can roll back to.

The possible operations of this feature is creating, restoring, and deleting a snapshot.

Snapshot-controller will create a CRD for VolumeSnapshot and VolumeSnapshotData CustomResources when it starts and will also watch for VolumeSnapshotresources and take snapshots of the volumes based on the referred snapshot plugin. 

Snapshot-provisioner will be used to restore a snapshot as a new persistent volume via dynamic provisioning.

OpenEBS operator will deploy each of Snapshot-controller and snapshot-provisioner container inside the single pod 
called snapshot-controller as in the following example.

```


```
Once Snapshot-controller is running, you will be able to see the created CustomResourceDefinitions (CRD) as in the following example.

```

```

### Creating a Snapshot

Before creating a snapshot you must have a PersistentVolumeClaim for which you need to take a snapshot of. 

For example, you have deployed Percona and you want to take a snapshot of the data and restore it later.

```

```


Once Percona application is in running state (which also creates a PVC by default), you are ready to take a snapshot. Once you create the VolumeSnapshot resource below, snapshot-controller will attempt to create the actual snapshot by interacting with the snapshot API’s. If successful, the VolumeSnapshot resource is bound to a corresponding VolumeSnapshotData resource. To create snapshot we need to reference the PersistentVolumeClaim name in snapshot specifciation that references the data we want to snapshot. The snapshot.yaml file example is as follows:

```
apiVersion: volumesnapshot.external-storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: snapshot-demo
  namespace: default
spec:
  persistentVolumeClaimName: demo-vol1-claim
```
The following command creates the snapshot named snapshot-demo.  

``` 
$ kubectl create -f snapshot.yaml
volumesnapshot "snapshot-demo" created
$ kubectl get volumesnapshot 
NAME            AGE 
snapshot-demo   18s

```
 
The output below shows that your snapshot was created successfully. You can also check the snapshot-controller’s logs to verify this. 

```

```


### Restoring a Snapshot 






### Deleting a Snapshot

You can delete snapshot you have taken which will also delete the corresponding Volume Snapshot Data resource from Kubernetes. The following command will delete the *snapshot.yaml* file.

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
