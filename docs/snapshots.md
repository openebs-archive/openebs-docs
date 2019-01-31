---
id: snapshots
title: Configuring Snapshots
sidebar_label: Snapshots
---

------


## What is a Snapshot?

A storage snapshot is a set of reference markers for data at a particular point in time. A snapshot acts as a detailed table of contents, providing you with accessible copies of data that you can roll back to.

OpenEBS operator will deploy following components during *openebs-operator* installation.

1. A snapshot-controller
2. A snapshot-provisioner

A snapshot-controller, when it starts, will create a CRD for `VolumeSnapshot` and `VolumeSnapshotData` custom resources. It will also watch for `VolumeSnapshotresources` and take snapshots of the volumes based on the referred snapshot plugin.

A snapshot-provisioner will be used to restore a snapshot as a new Persistent Volume(PV) via dynamic provisioning.

The possible operations of this feature are creating, restoring, and deleting a snapshot.  The following section describes about the way to taking snapshot on both type of storage engine:Jiva and cStor.

### **Things to Remember**

The following instruction will be applicable for both Jiva and cStor before taking snapshot.

1. Snapshot will be taken in *default* namespace by default. Namespace of both Source PVC and new PVC (Creating from snapshot) must be same. You can do the modification in the following YAMLs before taking snapshot and creating new PVC from the snapshot.
2. Source PVC size and new PVC size (Creating from snapshot) must be same.

## Jiva Snapshot feature

### Creating a Snapshot

Before creating a snapshot, you must note down the exact name of the *PersistentVolumeClaim*(PVC) for which you need to take a snapshot. You can get the PVC name by running following command.

```
kubectl get pvc -n <namespace>
```

Following is an example output.

```
NAME              STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS           AGE
demo-vol1-claim   Bound     pvc-01f7d743-f229-11e8-aee9-42010a800145   4G         RWO            openebs-jiva-default   2m
```

Download the *snapshot.yaml* to create snapshot of the corresponding PVC

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/jiva/snapshot.yaml
```

Edit the *snapshot.yaml* with your corresponding PVC name which you are going to take snapshot. You can also edit the snapshot name. In this example, it will take the snapshot of PVC called `demo-vol1-claim` and snapshot name as `snapshot-demo-jiva`.

After modifying the *snapshot.yaml*, apply the *snapshot.yaml* using the following command.

```
kubectl apply -f snapshot.yaml
```

Following is an example output of the above command.

```
volumesnapshot.volumesnapshot.external-storage.k8s.io/snapshot-demo-jiva created
```

To get to know the details of snapshot, you can use following command.

```
kubectl get volumesnapshot
```

Output of the above command will be similar to the following.

```
NAME                 AGE
snapshot-demo-jiva   37m
```

To get to know the status of snapshot data, you can use the following command

```
kubectl get volumesnapshotdata
```

Output of the above command will be similar to the following.

```
NAME                                                       AGE
k8s-volume-snapshot-6acfb054-f22a-11e8-8239-0a580a4c000e   2m
```

### Cloning and Restoring a Snapshot

After creating a snapshot, you can restore it to a new PVC. For creating new PVC using the created snapshot, it needs different *storageclass* to be used. There will be a default storage class called **openebs-snapshot-promoter** will be created during the installation of *openebs-operator*

So, this will create a PVC referencing to this default  *storageclass* for dynamically provisioning new PV.

A *storageclass*  for creating new PVC from snapshot can be defined as in the following example. Here, the provisioner field defines which provisioner should be used and what parameters should be passed to that provisioner when dynamic provisioning is invoked. 

```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: snapshot-promoter
provisioner: volumesnapshot.external-storage.k8s.io/snapshot-promoter
```

Following is the sample *snapshot_claim.yaml* file which can be used to create new PVC from the snapshot which you have taken in the previous step. 

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: demo-snap-vol-claim-jiva
  namespace: default
  annotations:
    snapshot.alpha.kubernetes.io/snapshot: snapshot-demo-jiva
spec:
  storageClassName: openebs-snapshot-promoter
  accessModes: [ "ReadWriteOnce" ]
  resources:
    requests:
      storage: 4Gi
```

You can have your own storage class defined or you can use default storageclass . You can use the following command to download *snapshot_claim.yaml* which can be customized and use for creating a new PVC from snapshot.

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/jiva/snapshot_claim.yaml
```

You must given the snapshot name and required name for new PVC in this *snapshot_claim.yaml* YAML file. Once you have done with modification of the file, apply the file using the following command.

```
kubectl apply -f snapshot_claim.yaml
```

In this example yaml new PVC name as *demo-snap-vol-claim* and snapshot name as *snapshot-demo-jiva*  .  Following is an example output of above command.

```
persistentvolumeclaim/demo-snap-vol-claim-jiva created
```

**Note:** 

1. Size of volume in Source PVC and snapshot PVC must be equal. You must give the same size of source PVC in the *snapshot_claim.yaml* before applying the same.

You can get the details of newly created PVC from the snapshot using the following command.

```
kubectl get pvc -n <namespace>
```

Following is an example output of above command.

```
NAME                       STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS                AGE
demo-snap-vol-claim-jiva   Bound     pvc-58c73bfd-f22c-11e8-aee9-42010a800145   4Gi        RWO            openebs-snapshot-promoter   42s
demo-vol1-claim            Bound     pvc-01f7d743-f229-11e8-aee9-42010a800145   4G         RWO            openebs-jiva-default        24m
```

If you are running any application, you can mount the **demo-snap-vol-claim** PersistentVolumeClaim into a new application pod to get the contents at the point of the snapshot was taken. While deploying the new application pod with this new restored PVC, you have to edit the application deployment YAML and mention the restored PVC name, volume name, and volume mount accordingly.  

### Deleting a Snapshot

You can delete a snapshot that you have created which will also delete the corresponding Volume Snapshot Data resource from Kubernetes. The following command will delete the *snapshot.yaml* file.

```
kubectl delete -f snapshot.yaml -n <namespace>
```

This will not affect any `PersistentVolumeClaims` or `PersistentVolumes` you have already provisioned using the snapshot. On the other hand, deleting any `PersistentVolumeClaims` or `PersistentVolumes` that you have used to take a snapshot or have been provisioned using a snapshot will not delete the snapshot from the OpenEBS backend. You have to delete them manually.



## cStor Snapshot feature

### Creating a Snapshot

Before creating a snapshot, you must note down the exact name of the *PersistentVolumeClaim*(PVC) for which you need to take a snapshot. You can get the PVC name by running following command.

```
kubectl get pvc -n <namespace>
```

Following is an example output.

```
NAME                    STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS           AGE
demo-cstor-vol1-claim   Bound     pvc-c2a42bcc-f6cd-11e8-9883-42010a8000b7   4G         RWO            openebs-cstor-sparse   7s
```

Download the *snapshot.yaml* to create snapshot of the corresponding PVC

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/cstor/snapshot.yaml
```

Edit the *snapshot.yaml* with your corresponding PVC name which you are going to take snapshot. You can also edit the snapshot name. In this example, it will take the snapshot of PVC called `demo-cstor-vol1-claim` and  snapshot name as `snapshot-demo-cstor`.

After modifying the *snapshot.yaml*, apply the *snapshot.yaml* using the following command. 

```
kubectl apply -f snapshot.yaml
```

Following is an example output of the above command.

```
volumesnapshot.volumesnapshot.external-storage.k8s.io/snapshot-demo-cstor created
```

To get to know the details of snapshot, you can use following command.

```
kubectl get volumesnapshot
```

Output of the above command will be similar to the following.

```
NAME                  AGE
snapshot-demo-cstor   19m
```

To get to know the status of snapshot data, you can use the following command. 

```
kubectl get volumesnapshotdata
```

Output of the above command will be similar to the following.

```
NAME                                                       AGE
k8s-volume-snapshot-73c5486f-f6d0-11e8-b04d-0a580a4c0208   44s
```

### Cloning and Restoring a Snapshot

After creating a snapshot, you can restore it to a new PVC. For creating new PVC using the created snapshot, it needs different *storageclass* to be used. There will be a default storage class called **openebs-snapshot-promoter** will be created during the installation of *openebs-operator*

So, this will create a PVC referencing to this default  *storageclass* for dynamically provisioning new PV.

A *storageclass*  for creating new PVC from snapshot can be defined as in the following example. Here, the provisioner field defines which provisioner should be used and what parameters should be passed to that provisioner when dynamic provisioning is invoked. 

```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: snapshot-promoter
provisioner: volumesnapshot.external-storage.k8s.io/snapshot-promoter
```

Following is the sample *snapshot_claim.yaml* file which can be used to create new PVC from the snapshot which you have taken in the previous step. 

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: demo-snap-vol-claim-cstor
  namespace: default
  annotations:
    snapshot.alpha.kubernetes.io/snapshot: snapshot-demo-cstor
spec:
  storageClassName: openebs-snapshot-promoter
  accessModes: [ "ReadWriteOnce" ]
  resources:
    requests:
      storage: 4G
```

You can have your own storage class defined or you can use default storageclass . You can use the following command to download *snapshot_claim.yaml* which can be customized and use for creating a new PVC from snapshot.

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/cstor/snapshot_claim.yaml
```

You must given the snapshot name and required name for new PVC in this *snapshot_claim.yaml* YAML file. In this example yaml new PVC name as *demo-snap-vol-claim* and snapshot name as *snapshot-demo-jiva*  . Once you have done with modification of the file, apply the file using the following command. 

```
kubectl apply -f snapshot_claim.yaml
```

Following is an example output of above command.

```
persistentvolumeclaim/demo-snap-vol-claim-cstor created
```

**Note:** 

1. Size of volume in Source PVC and snapshot PVC must be equal. You must give the same size of source PVC in the *snapshot_claim.yaml* before applying the same.

You can get the details of newly created PVC from the snapshot using the following command.

```
kubectl get pvc -n <namespace>
```

Following is an example output of above command.

```
NAME                        STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS                AGE
demo-cstor-vol1-claim       Bound     pvc-743678ac-f6cf-11e8-9883-42010a8000b7   4G         RWO            openebs-cstor-sparse        53m
demo-snap-vol-claim-cstor   Bound     pvc-e5116635-f6d6-11e8-9883-42010a8000b7   4G         RWO            openebs-snapshot-promoter   29s
```

If you are running any application, you can mount the **demo-snap-vol-claim-cstor** PVC into a new application pod to get the contents at the point of snapshot has taken. While deploying the new application pod with this new restored PVC, you have to edit the application deployment yaml and mention the restored PersistentVolumeClaim name, volume name, and volume mount accordingly.  

### Deleting a Snapshot

You can delete a snapshot that you have created which will also delete the corresponding Volume Snapshot Data resource from Kubernetes. The following command will delete the *snapshot.yaml* file.

```
kubectl delete -f snapshot.yaml -n <namespace>
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

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
