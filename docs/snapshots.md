---
id: snapshots
title: Configuring Snapshots
sidebar_label: Snapshots
---

------

`Feature status: Alpha / Experimental.`

## What is a Snapshot?

A storage snapshot is a set of reference markers for data at a particular point in time. A snapshot acts as a detailed table of contents, providing you with accessible copies of data that you can roll back to.

OpenEBS operator will deploy following components during *openebs-operator-0.7.0.yaml* installation.

1. A snapshot-controller
2. a snapshot-provisioner

A snapshot-controller, when it starts, will create a CRD for `VolumeSnapshot` and `VolumeSnapshotData` custom resources. It will also watch for `VolumeSnapshotresources` and take snapshots of the volumes based on the referred snapshot plugin.

A snapshot-provisioner will be used to restore a snapshot as a new Persistent Volume(PV) via dynamic provisioning.

The possible operations of this feature are creating, restoring, and deleting a snapshot.

## Creating a Snapshot

Before creating a snapshot, you must note down the exact name of the *PersistentVolumeClaim*(PVC) for which you need to take a snapshot. You can get the PVC name by running following command.

```
kubectl get pvc -n <namespace>
```

Following is an example output.

```
NAME              STATUS    VOLUME                               CAPACITY   ACCESS MODES   STORAGECLASS           AGE
demo-vol1-claim   Bound     default-demo-vol1-claim-1246175738   5G         RWO            openebs-jiva-default   2h
```

Download the *snapshot.yaml* to create snapshot of the corresponding PVC

```
wget https://raw.githubusercontent.com/openebs/external-storage/release/openebs/ci/snapshot/snapshot.yaml
```

Edit the *snapshot.yaml* with your corresponding PVC name which you are going to take snapshot. You can also edit the snapshot name. In this example, it will take the snapshot of PVC called `demo-vol1-claim` and snapshot name as `snapshot-demo`

After modifying the *snapshot.yaml*, apply the *snapshot.yaml* using the following command.

```
kubectl apply -f snapshot.yaml <namespace>
```

**Note:** If you are deploying in default namespace, you don't have to explicitly put the default namespace.

Following is an example output of the above command.

```
NAME            AGE
snapshot-demo   48s
```

## Cloning and Restoring a Snapshot

After creating a snapshot, you can restore it to a new PVC. For creating new PVC using this snapshot, it needs a different *storageclass* to be used. There will be a default storage class called **openebs-snapshot-promoter** will create during the installation of *openebs-operator-0.7.0.yaml*.

So, this will create a PVC referencing to this default  *storageclass* for dynamically provisioning new PV.

A *storageclass*  for creating new PVC from snapshot can be defined as in the following example. Here, the provisioner field defines which provisioner should be used and what parameters should be passed to that provisioner when dynamic provisioning is invoked.

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: demo-snap-vol-claim
  annotations:
    snapshot.alpha.kubernetes.io/snapshot: snapshot-demo
spec:
  storageClassName: snapshot-promoter
  accessModes: [ "ReadWriteOnce" ]
  resources:
    requests:
      storage: 5Gi
```

You can have your own storage class defined or you can use default storageclass . You can use the following command to download *snapshot_claim.yaml* which will be used to create new PVC from snapshot.

```
wget https://raw.githubusercontent.com/openebs/external-storage/release/openebs/ci/snapshot/snapshot_claim.yaml
```

You can edit this *snapshot_claim.yaml* with required name for new PVC. Once you are done with modification of the file, apply the file using the following command.

```
kubectl apply -f snapshot_claim.yaml <namespace>
```

**Note:** If you are deploying in default namespace,you don't have to explicitly put the default namespace.

This example yaml have the new PVC name as *demo-snap-vol-claim*.  Following is an example output of above command.

```
persistentvolumeclaim "demo-snap-vol-claim" created
```

You can check the PVC details by running the following command.

```
kubectl get pvc <namespace>
```

**Note:** If you deployed in default namespace,you don't have to explicitly put the default namespace.

Following is an example output of above command.

```
NAME                  STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS                AGE
demo-snap-vol-claim   Bound     pvc-87a7b6b0-b67a-11e8-b7c2-42010a800213   5Gi        RWO                openebs-snapshot-promoter   2m
demo-vol1-claim       Bound     default-demo-vol1-claim-1246175738         5G         RWO                openebs-jiva-default        3h
```

If you are running any application, you can mount the **demo-snap-vol-claim** PersistentVolumeClaim into a new application pod to get the contents at the point the snapshot was taken. While deploying the new application pod with this new restored PVC, you have to edit the application deployment yaml and mention the restored PersistentVolumeClaim name, volume name, and volume mount accordingly.  

## Deleting a Snapshot

You can delete a snapshot that you have created which will also delete the corresponding Volume Snapshot Data resource from Kubernetes. The following command will delete the *snapshot.yaml* file.

```
kubectl delete -f snapshot.yaml
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
