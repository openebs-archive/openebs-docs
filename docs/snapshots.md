---
id: snapshots
title: Configuring Snapshots
sidebar_label: Snapshots
---

------

`Feature status: Pre-Alpha /Experimental. Users are advised to use this feature with caution.`

## What is a Snapshot?

A storage snapshot is a set of reference markers for data at a particular point in time. A snapshot acts like a detailed table of contents, providing you with accessible copies of data that you can roll back to.

The possible operations of this feature is creating, restoring, and deleting a snapshot.

OpenEBS operator will deploy a snapshot-controller and a snapshot-provisioner container inside a single pod called snapshot-controller.

A snapshot-controller, when it starts, will create a CRD for `VolumeSnapshot` and `VolumeSnapshotData` custom resources. It will also watch for `VolumeSnapshotresources` and take snapshots of the volumes based on the referred snapshot plugin. 

Snapshot-provisioner will be used to restore a snapshot as a new persistent volume via dynamic provisioning.

With OpenEBS 0.6 release openebs-operator.yaml will deploy both snapshot-controller and snapshot-provisioner. You can obtain the yaml from [here](https://raw.githubusercontent.com/prateekpandey14/openebs/fd746f466c8d64d2d1163419aeb432bae03b0d84/k8s/openebs-operator.yaml). 

Once snapshot-controller is running, you will be able to see the created CustomResourceDefinitions (CRD) as in the following example.

```
$ kubectl get crd
NAME                                                         AGE
volumesnapshotdatas.volumesnapshot.external-storage.k8s.io   1m
volumesnapshots.volumesnapshot.external-storage.k8s.io       1m
```

## Creating a Snapshot

Before creating a snapshot, you must have a PersistentVolumeClaim for which you need to take a snapshot.

For example, you have deployed Percona application and you want to take a snapshot of the data and restore it later. Once you deploy Percona application, it's PVC will be created by the name specified in the application deployment yaml, for example `demo-vol1-claim`.  Below is a snippet of the application deployment yaml for your reference.

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


Once the Percona application is running, you can take a snapshot. After creating the VolumeSnapshot resource, snapshot-controller will attempt to create the actual snapshot by interacting with the snapshot APIs. If successful, the VolumeSnapshot resource is bound to a corresponding VolumeSnapshotData resource. To create a snapshot you must reference the PersistentVolumeClaim name in the snapshot specification that references the data you want to snapshot. The *snapshot.yaml* file example is as follows:

```
apiVersion: volumesnapshot.external-storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: snapshot-demo
  namespace: default
spec:
  persistentVolumeClaimName: demo-vol1-claim
```
The following command creates a snapshot named snapshot-demo.  

``` 
$ cd e2e/ansible/playbooks/feature/snapshots/kubectl_snapshot
$ kubectl apply -f snapshot.yaml
volumesnapshot "snapshot-demo" created
$ kubectl get volumesnapshot 
NAME            AGE 
snapshot-demo   18s
```

The output above shows that your snapshot was created successfully. You can also check the snapshot-controller’s logs to verify this by using the following commands. 

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

## Cloning and Restoring a Snapshot 

After creating a snapshot, you can restore it to a new Persitent Volume Claim. To do this you must create a special StorageClass implemented by snapshot-provisioner. We will then create a PersistentVolumeClaim referencing this StorageClass for dynamically provisioning new PersistentVolume. An annotation on the PersistentVolumeClaim will inform snapshot-provisioner about where to find the information it needs to deal with the OpenEBS ApiServer to restore the snapshot. 

A StorageClass can be defined as in the following example. Here, the provisioner field defines which provisioner should be used and what parameters should be passed to that provisioner when dynamic provisioning is invoked.

Such a StorageClass is necessary for restoring a Persistent Volume from an already created Volume Snapshot and Volume Snapshot Data.

You can use `$ vi restore-storageclass.yaml` to create the yaml and add the following entries.

```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: snapshot-promoter
provisioner: volumesnapshot.external-storage.k8s.io/snapshot-promoter
```

`annotations:` snapshot.alpha.kubernetes.io/snapshot: the name of the Volume Snapshot that will be restored.
`storageClassName:` Storage Class created by the admin for restoring Volume Snapshots.

Once the *restore-storageclass.yaml* is created, you have to deploy the yaml by using the following command.

```
$ kubectl apply -f restore-storageclass.yaml
```

You can now create a PersistentVolumeClaim that will use the StorageClass to dynamically provision a PersistentVolume that contains the information of your snapshot. Create a yaml file that will delpoy  a PersistentVolumeClaim  using the following details.  Use `$ vi restore-pvc.yaml` command to create the yaml and add the following details to the yaml.

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

Once the *restore-pvc.yaml* is created ,  you have to deploy the yaml by using the following command.

```
$ kubectl apply -f restore-pvc.yaml
```

Finally mount the **demo-snap-vol-claim** PersistentVolumeClaim into a percona-snapsot pod to see that the snapshot was restored. While deploying the percona-snapshot pod, you have to edit the deplyment yaml and mention the restore PersistentVolumeClaim name, volume name, and volume mount accordingly. An example for your reference is given below. You can create a yaml by using the command `$ vi percona-openebs-deployment-2.yaml` and add the following details.

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: percona2
  labels:
    name: percona
spec:
  replicas: 1
  selector:
    matchLabels:
      name: percona
  template:
    metadata:
      labels:
        name: percona
    spec:
      tolerations:
      - key: "ak"
        value: "av"
        operator: "Equal"
        effect: "NoSchedule"
      containers:
        - resources:
            limits:
              cpu: 0.5
          name: percona
          image: percona
          args:
            - "--ignore-db-dir"
            - "lost+found"
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: k8sDem0
          ports:
            - containerPort: 3306
              name: percona
          volumeMounts:
            - mountPath: /var/lib/mysql
              name: demo-snap-vol1
      volumes:
        - name: demo-snap-vol1
          persistentVolumeClaim:
            claimName: demo-snap-vol-claim
---
apiVersion: v1
kind: Service
metadata:
  name: percona-mysql
  labels:
    name: percona-mysql
spec:
  ports:
    - port: 3306
      targetPort: 3306
  selector:
      name: percona
```

Once *restore-storageclass.yaml* is created, you have to deploy the yaml using the following command.

```
$ kubectl apply -f percona-openebs-deployment-2.yaml
```

Once the percona-snapshot pod is in running state, you can check the integrity of files which were created earlier before taking the snapshot. 

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
