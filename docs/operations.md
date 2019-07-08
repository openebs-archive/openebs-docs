---
id: operations
title: Day2 operations in OpenEBS
sidebar_label: Day 2 Operations
---
------

Day2 operations on OpenEBS are broadly categorised as  : 



- <a href="/docs/next/operations.html#openebs-snapshots-and-clones">Taking Snapshots / Clones</a> 
- <a href="/docs/next/backup.html">Backup and Restore</a>
- <a href="#expanding-the-size-of-a-volume">Volume Size Increase</a>
- <a href="#expanding-the-size-of-a-pool-instance">Add disks to existing pool instance</a>
- <a href="#expanding-the-pool-to-more-nodes">Adding new pool instances to the current pool</a>
- <a href="/docs/next/configuresc.html#creating-a-new-storageclass">Creating new storage classes</a>
- <a href="/docs/next/upgrade.html">Upgrading OpenEBS</a>
- <a href="/docs/next/k8supgrades.html">Upgrading Stateful applications or Kubernetes</a>



## OpenEBS Snapshots and Clones

An OpenEBS snapshot is a set of reference markers for data at a particular point in time. A snapshot acts as a detailed table of contents,  with accessible copies of data that user can roll back to.  Snapshots in OpenEBS are instantaneous and are managed through `kubectl`.

During installation of OpenEBS, a snapshot-controller and a snapshot-provisioner are setup which assist in taking the snapshots. During the snapshot creation, snapshot-controller creates  `VolumeSnapshot` and `VolumeSnapshotData` custom resources. A snapshot-provisioner is used to restore a snapshot as a new Persistent Volume(PV) via dynamic provisioning.



For managing snapshots with Jiva, refer to  <a href="/v082/docs/next/jivaguide.html">Jiva user guide</a>.

<br>

### Creating a cStor Snapshot

**Pre-requisites:** A sample YAML specification and the pvc name

- Copy the following YAML specification into a file called *snapshot.yaml* or download it from  <a href="https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/cstor/snapshot.yaml" target="_blank">here</a> 

  ```
  apiVersion: volumesnapshot.external-storage.k8s.io/v1
  kind: VolumeSnapshot
  metadata:
    name: snapshot-cstor-volume
    namespace: default
  spec:
    persistentVolumeClaimName: cstor-vol1-claim
  ```

- Edit the YAML file to update  `name` of Snapshot  and  `persistentVolumeClaimName` of the PVC  which you are going to take the snapshot. 

- Run the following command to create snapshot.

  ```
  kubectl apply -f snapshot.yaml -n <namespace>
  ```

  This command creates a snapshot of the cStor volume and two new CRDs. To list the snapshots, use the following command

  ```
  kubectl get volumesnapshot
  kubectl get volumesnapshotdata
  ```

  **Note**: All cStor snapshots are created in the ` default` namespace. Also make sure that there is no stale entries of snapshot and snapshot data.

<br>

### Cloning  a cStor Snapshot

Once the snapshot is created, restoration from a snapshot or cloning the snapshot is done through a two step process. First create a PVC that refers to the snapshot and then use the PVC to create a new PV. This PVC should refer to a storage class called `openebs-snapshot-promoter`. 

- Copy the following YAML specification into a file called *snapshot_claim.yaml* or download it from <a href="https://raw.githubusercontent.com/openebs/openebs/master/k8s/ci/maya/snapshot/cstor/snapshot_claim.yaml" target="_blank">here</a>.

  ```
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

  - `name` :- Name of the clone PVC
  - The annotation `snapshot.alpha.kubernetes.io/snapshot` :- Name of the snapshot
  - The size of the volume being cloned or restored.

  **Note**: Size and namespace should be same as the original volume from which the snapshot was created.

- Run the following command to create a cloned PVC. 

  ```
  kubectl apply -f snapshot_claim.yaml -n <namespace>
  ```

- Get the details of newly created PVC for the snapshot.

  ```
  kubectl get pvc -n <namespace>
  ```

- Mount the above PVC in an application YAML to browse the data from the clone.

**Note:** For deleting the corresponding source volume, it is mandatory to delete the associated clone volumes of the source volume. The source volume deletion will fail if any associated clone volume is present on the cluster.

<br>

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

However, as the actual used capacity of the pool is utilized, more disks need to be added. In 0.8.0, the feature to add more disks to pool instance is not supported. This feature is under active development. See [Roadmap](/v082/docs/next/cstor.html#cstor-roadmap) for more details.

<br>

<hr>

<br>

## Expanding the pool to more nodes

cStorPools can be horizontally scaled when needed typically when a new Kubernetes node is added or when the existing cStorPool instances become full with cStorVolumes. This feature is added in 0.8.1.  The configuration changes are different based on how  the cStorPool was  initially created - either by  *specifying diskList* or by *without specifying diskList* in the pool configuration YAML or spc-config.yaml. 

The steps for expanding the pool to new nodes is given below. Select the appropriate approach that you have followed during the initial cStorPool creation.



<h3><a class="anchor" aria-hidden="true" id="with-disklist"></a>With specifiying diskList</h3>

If you are following this approach, you should have created cStor Pool initially using the steps provided [here](/v082/docs/next/configurepools.html#manual-mode). For expanding pool onto a new OpenEBS node, you have to edit corresponding pool configuration(SPC) YAML with the required disks names under the `diskList` and update the `maxPools` count . 



**Step 1:** Edit the existing pool configuration spec that you originally used and apply it (OR) directly edit the in-use spec file  using `kubectl edit spc <SPC Name>`.

**Step 2:** Add the new disks names from the new Nodes under the `diskList` . You can use `kubectl get disks` to obtains the disk CRs.

**Step 3:** Update the `maxPools` count to the new value. If existing `maxPools` count is 3 and one new node is added, then `maxPools` will be 4.

**Step 4:**  Apply or save the configuration file and a new cStorPool instance will be created on the expected node.

**Step 5:** Verify the new pool creation by checking 

- If a new cStor Pool POD is created (`kubectl get pods -n openebs | grep <pool name>`)
- If a new cStorPool CR is created (`kubectl get csp`)



<h3><a class="anchor" aria-hidden="true" id="without-disklist"></a>Without specifiying diskList</h3>

If you are following  this approach, you should have created cStor Pool initially using the steps provided [here](/v082/docs/next/configurepools.html#auto-mode). For expanding pool on new OpenEBS node, you have to edit corresponding pool configuration(SPC) YAML with updating the `maxPools` count. 

**Step 1:** Edit the existing pool configuration spec that you originally used and apply it (OR) directly edit the in-use spec file  using `kubectl edit spc <SPC Name>`.

**Step 2:** Update the `maxPools` count to the new value. If existing `maxPools` count is 3 and one new node is added, then `maxPools` will be 4.

**Step 3:** Apply or save the configuration file and a new cStorPool instance will be created.

**Step 4:** Verify the new pool creation by checking 

- If a new cStor Pool POD is created (`kubectl get pods -n openebs | grep <pool name>`)
- If a new cStorPool CR is created (`kubectl get csp`)



<br>

<hr>

<br>


## Expanding the size of a volume

OpenEBS control plane does not support increasing the size of volume seamlessly. Increasing the size of a provisioned volume requires support from Kubernetes' kubelet as the existing connection has to be remounted to reflect the new volume size. This can also be tackled with the new CSI plugin where the responsibility of the mount, unmount and remount actions will be held with the vendor CSI plugin rather than the kubelet itself.

OpenEBS team is working on both the CSI plugin as well as the feature to resize the provisioned volume when the PVC is patched for new volume size. See [Roadmap](/v082/docs/next/cstor.html#cstor-roadmap) for more details.

<br>

<hr>

<br>

## See Also:



<br>

### [cStor Roadmap](/v082/docs/next/cstor.html#cstor-roadmap)

### [Understand cStorPools](/v082/docs/next/cstor.html#cstor-pools)

### [Connecting to MayaOnline](/v082/docs/next/mayaonline.html)

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
