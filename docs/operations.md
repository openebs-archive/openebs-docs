---
id: operations
title: Day2 operations in OpenEBS
sidebar_label: Day 2 Operations
---
------

Day2 operations on OpenEBS are broadly categorised as  : 



- <a href="/docs/next/operations.html#openebs-snapshots-and-clones">Taking snapshots/clones</a> 
- <a href="/docs/next/backup.html">Backup and Restore</a>
- <a href="#expanding-the-size-of-a-volume">Volume size increase</a>
- <a href="#expanding-the-size-of-a-pool-instance">Add disks to existing pool instance</a>
- <a href="#expanding-the-pool-to-more-nodes">Adding new pool instances to the current pool</a>
- <a href="/docs/next/configuresc.html#creating-a-new-storageclass">Creating new storage classes</a>
- <a href="/docs/next/upgrade.html">Upgrading OpenEBS</a>
- <a href="/docs/next/k8supgrades.html">Upgrading stateful applications or Kubernetes</a>



## OpenEBS Snapshots and Clones

An OpenEBS snapshot is a set of reference markers for data at a particular point in time. A snapshot acts as a detailed table of contents,  with accessible copies of data that user can roll back to.  Snapshots in OpenEBS are instantaneous and are managed through `kubectl`.

During installation of OpenEBS, a snapshot-controller and a snapshot-provisioner are setup which assist in taking the snapshots. During the snapshot creation, snapshot-controller creates  `VolumeSnapshot` and `VolumeSnapshotData` custom resources. A snapshot-provisioner is used to restore a snapshot as a new Persistent Volume(PV) via dynamic provisioning.



For managing snapshots with Jiva, refer to  <a href="/docs/next/jivaguide.html">Jiva user guide</a> 



<br>

### Creating a cStor Snapshot

**Pre-requisites:** A sample YAML specification and the pvc name

- Copy the following YAML specification into a file called *snapshot.yaml* or download it from  <a href="https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/cstor/snapshot.yaml" target="_blank">here</a> 

- ```
  apiVersion: volumesnapshot.external-storage.k8s.io/v1
  kind: VolumeSnapshot
  metadata:
    name: snapshot-cstor-volume
    namespace: default
  spec:
    persistentVolumeClaimName: cstor-vol1-claim
  ```

- Edit the YAML file to update  `name`  and  `persistentVolumeClaimName`

- Run the following command to create snapshot

```
kubectl apply -f snapshot-openebs-pvc.yaml
```

This command creates a snapshot of the cStor volume and two new CRDs. To list the snapshots, use the following command

```
kubectl get volumesnapshot
kubectl get volumesnapshotdata
```

*Note*: All cStor snapshots are created in the ` default` namespace.





<br><br>

### Cloning  a cStor Snapshot

Once the snapshot is created, restoration from a snapshot or cloning the snapshot is done through a two step process. First create a PVC that refers to the snapshot and then use the PVC to create a new PV. This PVC should refer to a storage class called `openebs-snapshot-promoter`. 

- Copy the following YAML specification into a file called *snapshot_claim.yaml* or download it from  <a href="https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/cstor/snapshot_claim.yaml" target="_blank">here</a> 

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

- Edit the YAML file to update 

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



- Mount the above PVC in an application YAML to browse the data from the clone

<br><br>

### Deleting a cStor Snapshot

Delete the snapshot using the kubectl command and the same YAML specification that was to create the snapshot

```
kubectl delete -f snapshot.yaml -n <namespace>
```

This will not affect any `PersistentVolumeClaims` or `PersistentVolumes` that were already provisioned using the snapshot. On the other hand, deleting any `PersistentVolumeClaims` or `PersistentVolumes` that were provisioned using the snapshot will not delete the snapshot from the OpenEBS backend.

<br>

<hr>

<br>



## Expanding the size of a pool instance

A pool instance is local to a node. A pool instance can be started with as small as one disk (in `striped` mode) or two disks (in `mirrored`) mode. cStor pool instances support thin provisioning of data, which means that provisioning of any volume size will be successful from a given cstorPool config. 

However, as the actual used capacity of the pool is utilized, more disks need to be added. In 0.8.0, the feature to add more disks to pool instance is not supported. This feature is under active development. See [roadmap](/docs/next/cstor.html#cstor-roadmap) for more details.

<br>

<hr>

<br>

## Expanding the pool to more nodes

When a new node is added, you may want to expand the cStor pool config to extend to that node so that a new pool instance is created on the new node. Typical procedure would be to add new disk CRs to `diskList` and `kubectl` apply the `<castor-pool-config.yaml>`.  See [roadmap](/docs/next/cstor.html#cstor-roadmap) for more details.

<br>

<hr>

<br>

## Expanding the size of a volume

OpenEBS control plane does not support increasing the size of volume seamlessly. Increasing the size of a provisioned volume requires support from Kubernetes' kubelet as the existing connection has to be remounted to reflect the new volume size. This can also be tackled with the new CSI plugin where the responsibility of the mount, unmount and remount actions will be held with the vendor CSI plugin rather than the kubelet itself.



OpenEBS team is working on both the CSI plugin as well as the feature to resize the provisioned volume when the PVC is patched for new volume size. See [roadmap](/docs/next/cstor.html#cstor-roadmap) for more details.

<br>

<hr>

<br>

## See Also:



<br>

### [cStor roadmap](/docs/next/cstor.html#cstor-roadmap)

### [Understand cStorPools](/docs/next/cstor.html#cstor-pools)

### [Connecting to MayaOnline](/docs/next/mayaonline.html)

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
