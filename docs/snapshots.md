---
id: snapshots
title: Configuring Snapshot
sidebar_label: snapshots
---

------

# Snapshots

### What is a Snapshot?

A storage snapshot is a set of reference markers for data at a particular point in time. A snapshot acts like a detailed table of contents, providing you with accessible copies of data that you can roll back to.

The possible operations of this feature is creating, restoring, and deleting a snapshot.

OpenEBS operator will deploy each of Snapshot-controller and snapshot-provisioner container inside the single pod called snapshot-controller.

Snapshot-controller will create a CRD for VolumeSnapshot and VolumeSnapshotData CustomResources when it starts and will also watch for VolumeSnapshotresources and take snapshots of the volumes based on the referred snapshot plugin. 

Snapshot-provisioner will be used to restore a snapshot as a new persistent volume via dynamic provisioning.

With OpenEBS 0.6 release openebs-operator.yaml will deploy both snapshot-controller and snapshot-provisioner. You can obtain the yaml from here [openebs-operator.yaml](https://raw.githubusercontent.com/prateekpandey14/openebs/fd746f466c8d64d2d1163419aeb432bae03b0d84/k8s/openebs-operator.yaml) 

Once Snapshot-controller is running, you will be able to see the created CustomResourceDefinitions (CRD) as in the following example.

```
$ kubectl get crd
NAME                                                         AGE
volumesnapshotdatas.volumesnapshot.external-storage.k8s.io   1m
volumesnapshots.volumesnapshot.external-storage.k8s.io       1m
```

### Creating a Snapshot

Before creating a snapshot you must have a PersistentVolumeClaim for which you need to take a snapshot.

For example, you have deployed Percona application and you want to take a snapshot of the data and restore it later. Once you deploy percona the application its PVC will be created by the namespecified in the application deployment yaml, for example `demo-vol1-claim`.  Pasting the snippet of application deployment yaml for reference.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-percona
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
```


Once Percona application is in running state you are ready to take a snapshot. Once you create the VolumeSnapshot resource, snapshot-controller will attempt to create the actual snapshot by interacting with the snapshot API’s. If successful, the VolumeSnapshot resource is bound to a corresponding VolumeSnapshotData resource. To create snapshot we need to reference the PersistentVolumeClaim name in snapshot specification that references the data we want to snapshot. The snapshot.yaml file example is as follows:

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
$ cd e2e/ansible/playbooks/feature/snapshots/kubectl_snapshot
$ kubectl apply -f snapshot.yaml
volumesnapshot "snapshot-demo" created
$ kubectl get volumesnapshot 
NAME            AGE 
snapshot-demo   18s
```

The output above shows that your snapshot was created successfully. You can also check the snapshot-controller’s logs to verify this by using the below commands. 

```
$ kubectl get volumesnapshot -o yaml
 apiVersion: v1
 items:
   - apiVersion: volumesnapshot.external-storage.k8s.io/v1
  kind: VolumeSnapshot
  metadata:
    clusterName: ""
    creationTimestamp: 2018-01-24T06:58:38Z
    generation: 0
    labels:
      SnapshotMetadata-PVName: pvc-f1c1fdf2-00d2-11e8-acdc-54e1ad0c1ccc
      SnapshotMetadata-Timestamp: "1516777187974315350"
    name: snapshot-demo
    namespace: default
    resourceVersion: "1345"
    selfLink: /apis/volumesnapshot.external-storage.k8s.io/v1/namespaces/default/volumesnapshots/fastfurious
    uid: 014ec851-00d4-11e8-acdc-54e1ad0c1ccc
  spec:
    persistentVolumeClaimName: demo-vol1-claim
    snapshotDataName: k8s-volume-snapshot-2a788036-00d4-11e8-9aa2-54e1ad0c1ccc
  status:
    conditions:
    - lastTransitionTime: 2018-01-24T06:59:48Z
      message: Snapshot created successfully
      reason: ""
      status: "True"
      type: Ready
    creationTimestamp: null
```



```
$ kubectl get volumesnapshotdata -o yaml
apiVersion: volumesnapshot.external-storage.k8s.io/v1
  kind: VolumeSnapshotData
  metadata:
    clusterName: ""
    creationTimestamp: 2018-01-24T06:59:48Z
    name: k8s-volume-snapshot-2a788036-00d4-11e8-9aa2-54e1ad0c1ccc
    namespace: ""
    resourceVersion: "1344"
    selfLink: /apis/volumesnapshot.external-storage.k8s.io/v1/k8s-volume-snapshot-2a788036-00d4-11e8-9aa2-54e1ad0c1ccc
    uid: 2a789f5a-00d4-11e8-acdc-54e1ad0c1ccc
  spec:
    openebsVolume:
      snapshotId: pvc-f1c1fdf2-00d2-11e8-acdc 54e1ad0c1ccc_1516777187978793304
    persistentVolumeRef:
      kind: PersistentVolume
      name: pvc-f1c1fdf2-00d2-11e8-acdc-54e1ad0c1ccc
    volumeSnapshotRef:
      kind: VolumeSnapshot
      name: default/snapshot-demo
  status:
    conditions:
    - lastTransitionTime: null
      message: Snapshot created successfully
      reason: ""
      status: "True"
      type: Ready
    creationTimestamp: null
kind: List
metadata:
  resourceVersion: ""
  selfLink: ""
```

Once you have taken a snapshot, you can create a clone from the snapshot and restore your data.

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
