---
id: Snapshot
title: Configuring Snapshot
sidebar_label: Snapshot
---

------

# Snapshot

### What is a Snapshot?

A storage snapshot is a set of reference markers for data at a particular point in time. A snapshot acts like a detailed table of contents, providing you with accessible copies of data that you can roll back to.

The possible operations of this feature is creating, restoring, and deleting a snapshot.

Snapshot-controller will create a CRD for VolumeSnapshot and VolumeSnapshotData CustomResources when it starts and will also watch for VolumeSnapshotresources and take snapshots of the volumes based on the referred snapshot plugin. 

Snapshot-provisioner will be used to restore a snapshot as a new persistent volume via dynamic provisioning.

OpenEBS operator will deploy each of Snapshot-controller and snapshot-provisioner container inside the single pod 
called snapshot-controller as in the following example.

```
apiVersion: v1
kind: ServiceAccount
metadata:
  name: snapshot-controller-runner
  namespace: default
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRole
metadata:
  name: snapshot-controller-role
  namespace: default
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "delete"]
  - apiGroups: [""]
    resources: ["persistentvolumes"]
    verbs: ["get", "list", "watch", "create", "delete"]
  - apiGroups: [""]
    resources: ["persistentvolumeclaims"]
    verbs: ["get", "list", "watch", "update"]
  - apiGroups: ["storage.k8s.io"]
    resources: ["storageclasses"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["list", "watch", "create", "update", "patch"]
  - apiGroups: ["apiextensions.k8s.io"]
    resources: ["customresourcedefinitions"]
    verbs: ["create", "list", "watch", "delete"]
  - apiGroups: ["volumesnapshot.external-storage.k8s.io"]
    resources: ["volumesnapshots"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: ["volumesnapshot.external-storage.k8s.io"]
    resources: ["volumesnapshotdatas"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: [""]
    resources: ["services"]
    verbs: ["get"]
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1beta1
metadata:
  name: snapshot-controller
  namespace: default
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: snapshot-controller-role
subjects:
- kind: ServiceAccount
  name: snapshot-controller-runner
  namespace: default
---
kind: Deployment
apiVersion: extensions/v1beta1
metadata:
  name: snapshot-controller
  namespace: default
spec:
  replicas: 1
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: snapshot-controller
    spec:
      serviceAccountName: snapshot-controller-runner
      containers:
        - name: snapshot-controller
          image: openebs/snapshot-controller:ci
          imagePullPolicy: Always
        - name: snapshot-provisioner
          image: openebs/snapshot-provisioner:ci
          imagePullPolicy: Always

```
Once Snapshot-controller is running, you will be able to see the created CustomResourceDefinitions (CRD) as in the following example.

```
$ kubectl get crd
NAME                                                         AGE
volumesnapshotdatas.volumesnapshot.external-storage.k8s.io   1m
volumesnapshots.volumesnapshot.external-storage.k8s.io       1m
```

### Creating a Snapshot

Before creating a snapshot you must have a PersistentVolumeClaim for which you need to take a snapshot of. 

For example, you have deployed Percona and you want to take a snapshot of the data and restore it later.

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
kubectl get volumesnapshotdata -o yaml
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



### Restoring a Snapshot 






### Deleting a Snapshot

You can delete snapshot you have taken which will also delete the corresponding Volume Snapshot Data resource from Kubernetes. The following command will delete the *snapshot.yaml* file.

This will not affect any `PersistentVolumeClaims` or `PersistentVolumes` you have already provisioned using the snapshot. On the other hand, deleting any `PersistentVolumeClaims` or `PersistentVolumes` that you have used to take a snapshot or have been provisioned using a snapshot will not delete the snapshot from the OpenEBS backend. You have to delete them manually. 

```
$ cd openebs/e2e/ansible/playbooks/feature/snapshots/kubectl_snapshot
$ kubectl delete -f snapshot.yaml
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
