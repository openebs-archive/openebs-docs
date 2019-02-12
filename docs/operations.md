---
id: operations
title: Day2 operations in OpenEBS
sidebar_label: Day 2 Operations
---
------

Day2 operations on OpenEBS are broadly categorised as  : 



- <a href="/docs/next/operations.html#openebs-snapshots-and-clones">Taking snapshots/clones</a> 
- <a href="/docs/next/backup.html">Backup and Restore</a>
- <a href="/docs/next/backup.html">Volume size increase</a>
- <a href="/docs/next/backup.html">Pool size increase</a>
- <a href="/docs/next/backup.html">Adding new pool instances to the current pool</a>
- <a href="/docs/next/backup.html">Creating new storage classes</a>
- <a href="/docs/next/backup.html">Upgrading OpenEBS</a>
- <a href="/docs/next/backup.html">Upgrading stateful applications or Kubernetes</a>



## OpenEBS snapshots and clones

An OpenEBS snapshot is a set of reference markers for data at a particular point in time. A snapshot acts as a detailed table of contents,  with accessible copies of data that user can roll back to.  Snapshots in OpenEBS are instantaneous and are managed through `kubectl`.

During installation of OpenEBS, a snapshot-controller and a snapshot-provisioner are setup which assist in taking the snapshots. During the snapshot creation, snapshot-controller creates  `VolumeSnapshot` and `VolumeSnapshotData` custom resources. A snapshot-provisioner is used to restore a snapshot as a new Persistent Volume(PV) via dynamic provisioning.



For managing snapshots with Jiva, refer to  <a href="/docs/next/jivaguide.html">Jiva user guide</a> 



<br>

### Creating a cStor Snapshot

**Pre-requisites:** A sample yaml specification and the pvc name

- Copy the following yaml specification into a file called *snapshot.yaml* or download it from  <a href="https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/cstor/snapshot.yaml" target="_blank">here</a> 

- ```
  apiVersion: volumesnapshot.external-storage.k8s.io/v1
  kind: VolumeSnapshot
  metadata:
    name: snapshot-cstor-volume
    namespace: default
  spec:
    persistentVolumeClaimName: cstor-vol1-claim
  ```

- Edit the yaml file to update  `name`  and  `persistentVolumeClaimName`

- Run the following command to create snapshot

```
kubectl apply -f snapshot-openebs-pvc.yaml
```

This command creates a snapshot of the cStor volume and two new CRDs. To list the snapshots, use the following command

```
kubectl get volumesnapshot
kubectl get volumesnapshotdata
```

*Note*: All cStor snapshots are created in the` default` namespace.





<br><br>

### Cloning  a cStor Snapshot

Once the snapshot is created, restoration from a snapshot or cloning the snapshot is done through a two step process. First creat a PVC that refers to the snapshot and then use the PVC to create a new PV. This PVC should refer to a storage class called `openebs-snapshot-promoter`. 

- Copy the following yaml specification into a file called *snapshot_claim.yaml* or download it from  <a href="https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/cstor/snapshot_claim.yaml" target="_blank">here</a> 

- ```
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: vol-claim-cstor-snapshot
    namespace: default
    annotations:
      snapshot.alpha.kubernetes.io/snapshot: snapshot-cstor-volume
  spec:
    storageClassName: openebs-snapshot-promoter
    accessModes: [ "ReadWriteOnce" ]
    resources:
      requests:
        storage: 4G
  ```

- Edit the yaml file to update 

  - name of the pvc
  - the annotation `snapshot.alpha.kubernetes.io/snapshot:`
  - size of the volume being cloned or restored

*Note:* Size and namespace should be same as the original volume from which the snapshot was created

- Run the following command to create a PVC 

```
kubectl apply -f snapshot_claim.yaml
```

- Get the details of newly created PVC for the snapshot 

```
kubectl get pvc -n <namespace>
```



- Mount the above PVC in an application yaml to browse the data from the clone

<br><br>

### Deleting a cStor Snapshot

Delete the snapshot using the kubectl command and the same yaml spacification that was to create the snapshot

```
kubectl delete -f snapshot.yaml -n <namespace>
```

This will not affect any `PersistentVolumeClaims` or `PersistentVolumes` that were already provisioned using the snapshot. On the other hand, deleting any `PersistentVolumeClaims` or `PersistentVolumes` that were provisioned using the snapshot will not delete the snapshot from the OpenEBS backend.





<br>

## See Also:



<br>

<hr>

<br>



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
