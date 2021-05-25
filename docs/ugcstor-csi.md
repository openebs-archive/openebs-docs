---
id: ugcstor-csi
title: cStor User Guide
sidebar_label: cStor
---
------
<br>

<img src="/docs/assets/svg/3-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>
<br>

This user guide section provides the operations needed to be performed by the User and the Admin for configuring cStor related tasks. 

   :::note 
   The recommended approach to provision cStor Pools is to use CStorPoolCluster(CSPC), the detailed steps have been provided in this document. However, OpenEBS also supports provisioning of cStor Pools using StoragePoolClaim (SPC). For detailed instructions, refer to the <a href="https://docs.openebs.io/v260/docs/next/ugcstor.html" target="_blank">cStor User guide(SPC)</a>.<br>
   :::

<h2> User operations</h2>

[Snapshot and Clone of a cStor Volume](#snapshot-and-clone-of-a-cstor-volume)


<h2> Admin operations</h2>

[Creating cStor storage pools](#creating-cstor-storage-pool)

[Creating cStor storage classes](#creating-cstor-storage-classes)

[Expanding a cStor volume](#expanding-a-cstor-volume)

[Performance Tunings in cStor Pools](#performance-tunings-in-cstor-pools)

## <a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations

### <a class="anchor" aria-hidden="true" id="creating-cstor-storage-pool"></a>Snapshot and Clone of a cStor Volume

An OpenEBS snapshot is a set of reference markers for data at a particular point in time. A snapshot act as a detailed table of contents, with accessible copies of data that user can roll back to the required point of instance. Snapshots in OpenEBS are instantaneous and are managed through kubectl.

During the installation of OpenEBS, a snapshot-controller and a snapshot-provisioner are setup which assist in taking the snapshots. During the snapshot creation, snapshot-controller creates VolumeSnapshot and VolumeSnapshotData custom resources. A snapshot-provisioner is used to restore a snapshot as a new Persistent Volume(PV) via dynamic provisioning.
  #### Creating a cStor volume Snapshot 

  1. Before proceeding to create a cStor volume snapshot and use it further for restoration, it is necessary to create a <code>VolumeSnapshotClass</code>. Copy the following YAML specification into a file called <code>snapshot_class.yaml</code>.
```
kind: VolumeSnapshotClass
apiVersion: snapshot.storage.k8s.io/v1
metadata:
  name: csi-cstor-snapshotclass
  annotations:
    snapshot.storage.kubernetes.io/is-default-class: "true"
driver: cstor.csi.openebs.io
deletionPolicy: Delete
```
The deletion policy can be set as <code>Delete or Retain</code>. When it is set to Retain, the underlying physical snapshot on the storage cluster is retained even when the VolumeSnapshot object is deleted.
To apply, execute:
```
kubectl apply -f snapshot_class.yaml
```

**Note:** In clusters that only install <code>v1beta1</code> version of VolumeSnapshotClass as the supported version(eg. OpenShift(OCP) 4.5 ), the following error might be encountered.
 ```
 no matches for kind "VolumeSnapshotClass" in version "snapshot.storage.k8s.io/v1"
 ```
In such cases, the apiVersion needs to be updated to <code>apiVersion: snapshot.storage.k8s.io/v1beta1</code>

2.  For creating the snapshot, you need to create a YAML specification and provide the required PVC name into it. The only prerequisite check is to be performed is to ensure that there is no stale entries of snapshot and snapshot data before creating a new snapshot. Copy the following YAML specification into a file called <code>snapshot.yaml</code>. 
```
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: cstor-pvc-snap
spec:
  volumeSnapshotClassName: csi-cstor-snapshotclass
  source:
    persistentVolumeClaimName: cstor-pvc
``` 
 Run the following command to create the snapshot,
```
kubectl create -f snapshot.yaml
```
To list the snapshots, execute:
```
kubectl get volumesnapshots -n default
```
Sample Output:
```
NAME                        AGE
cstor-pvc-snap              10s
```
A VolumeSnapshot is analogous to a PVC and is associated with a <code>VolumeSnapshotContent</code> object that represents the actual snapshot. To identify the VolumeSnapshotContent object for the VolumeSnapshot execute:

```
kubectl describe volumesnapshots cstor-pvc-snap -n default
```
Sample Output:
```
Name:         cstor-pvc-snap
Namespace:    default
.
.
.
Spec:
  Snapshot Class Name:    cstor-csi-snapshotclass
  Snapshot Content Name:  snapcontent-e8d8a0ca-9826-11e9-9807-525400f3f660
  Source:
    API Group:
    Kind:       PersistentVolumeClaim
    Name:       cstor-pvc
Status:
  Creation Time:  2020-06-20T15:27:29Z
  Ready To Use:   true
  Restore Size:   5Gi

```

The <code>SnapshotContentName</code> identifies the <code>VolumeSnapshotContent</code> object which serves this snapshot. The <code>Ready To Use</code> parameter indicates that the Snapshot has been created successfully and can be used to create a new PVC.

**Note:** All cStor snapshots should be created in the same namespace of source PVC.
 
#### Cloning a cStor Snapshot

Once the snapshot is created, you can use it to create a PVC. In order to restore a specific snapshot, you need to create a new PVC that refers to the snapshot. Below is an example of a YAML file that restores and creates a PVC from a snapshot.

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: restore-cstor-pvc
spec:
  storageClassName: cstor-csi-disk
  dataSource:
    name: cstor-pvc-snap
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```
The <code>dataSource</code> shows that the PVC must be created using a VolumeSnapshot named <code>cstor-pvc-snap</code> as the source of the data. This instructs cStor CSI to create a PVC from the snapshot. Once the PVC is created, it can be attached to a pod and used just like any other PVC.

To verify the creation of PVC execute:
```
kubectl get pvc
```
Sample Output:
```
NAME                           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS              AGE
restore-cstor-pvc              Bound    pvc-2f2d65fc-0784-11ea-b887-42010a80006c   5Gi        RWO            cstor-csi-disk            5s
```
<hr>
<hr>

## <a class="anchor" aria-hidden="true" id="user-operations"></a>Admin operations

### <a class="anchor" aria-hidden="true" id="creating-cstor-storage-pool"></a>Creating cStor storage pools


  <b>Prerequisites:</b>

- The latest release of OpenEBS cStor must be installed using cStor Operator yaml.

  ``` 
  kubectl apply -f https://openebs.github.io/charts/cstor-operator.yaml
  ```
        
  All the NDM cStor operator pods must be in a running state. To get the status of the pods execute:

  ```
  kubectl get pod -n openebs
  ```

  Sample Output:
  ```
  NAME                                             READY   STATUS    RESTARTS    AGE
  cspc-operator-5fb7db848f-wgnq8                    1/1    Running       0      6d7h
  cvc-operator-7f7d8dc4c5-sn7gv                     1/1    Running       0      6d7h
  openebs-cstor-admission-server-7585b9659b-rbkmn   1/1    Running       0      6d7h
  openebs-cstor-csi-controller-0                    6/6    Running       0      6d7h
  openebs-cstor-csi-node-dl58c                      2/2    Running       0      6d7h
  openebs-cstor-csi-node-jmpzv                      2/2    Running       0      6d7h
  openebs-cstor-csi-node-tfv45                      2/2    Running       0      6d7h
  openebs-ndm-gctb7                                 1/1    Running       0      6d7h
  openebs-ndm-operator-7c8759dbb5-58zpl             1/1    Running       0      6d7h
  openebs-ndm-sfczv                                 1/1    Running       0      6d7h
  openebs-ndm-vgdnv                                 1/1    Running       0      6d7h
  ```

- Nodes must have disks attached to them. To get the list of attached blockdevices, execute:
    ```
    kubectl get bd -n openebs
    ```
   Sample Output:

   ```
   NAME                                          NODENAME         SIZE         CLAIMSTATE  STATUS   AGE
   blockdevice-01afcdbe3a9c9e3b281c7133b2af1b68  worker-node-3    21474836480   Unclaimed   Active   2m10s
   blockdevice-10ad9f484c299597ed1e126d7b857967  worker-node-1    21474836480   Unclaimed   Active   2m17s
   blockdevice-3ec130dc1aa932eb4c5af1db4d73ea1b  worker-node-2    21474836480   Unclaimed   Active   2m12s

   ```

<b>Creating a CStorPoolCluster:</b><br>

- Get all the node labels present in the cluster with the following command, these node labels will be required to modify the CSPC yaml.
   ```
   kubectl get node --show-labels
   ```
  Sample Output:
   ```
   NAME               STATUS   ROLES    AGE    VERSION   LABELS

   master             Ready    master   5d2h   v1.20.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=master,kubernetes.io/os=linux,node-role.kubernetes.io/master=

   worker-node-1      Ready    <none>   5d2h   v1.20.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=worker-node-1,kubernetes.io/os=linux

   worker-node-2      Ready    <none>   5d2h   v1.20.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=worker-node-2,kubernetes.io/os=linux

   worker-node-3      Ready    <none>   5d2h   v1.18.0   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/os=linux,kubernetes.io/arch=amd64,kubernetes.io/hostname=worker-node-3,kubernetes.io/os=linux
   ```

- Modify the CSPC yaml to use the worker nodes. Use the value from labels kubernetes.io/hostname=&lt; node_name &gt;. This label value and node name could be different in some platforms. In this case, the label values and node names are:
   <code>kubernetes.io/hostname:"worker-node-1"</code>, <code>kubernetes.io/hostname: "worker-node-2"</code> and <code>kubernetes.io/hostname: "worker-node-3"</code>.
- Modify CSPC yaml file to add a block device attached to the same node where the pool is to be provisioned. 

  Sample CSPC yaml:

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
  name: cstor-disk-pool
  namespace: openebs
spec:
  pools:
    - nodeSelector:
        kubernetes.io/hostname: "worker-node-1"
      dataRaidGroups:
        - blockDevices:
            - blockDeviceName: "blockdevice-10ad9f484c299597ed1e126d7b857967"
      poolConfig:
        dataRaidGroupType: "stripe"

    - nodeSelector:
        kubernetes.io/hostname: "worker-node-2" 
      dataRaidGroups:
        - blockDevices:
            - blockDeviceName: "blockdevice-3ec130dc1aa932eb4c5af1db4d73ea1b"
      poolConfig:
        dataRaidGroupType: "stripe"
   
    - nodeSelector:
        kubernetes.io/hostname: "worker-node-3"
      dataRaidGroups:
        - blockDevices:
            - blockDeviceName: "blockdevice-01afcdbe3a9c9e3b281c7133b2af1b68"
      poolConfig:
        dataRaidGroupType: "stripe"
```
We have named the configuration YAML file as <code>cspc.yaml</code>. Execute the following command for CSPC creation,

```
kubectl apply -f cspc.yaml
```
 
To verify the status of created CSPC, execute:
```
kubectl get cspc -n openebs
```
Sample Output:
```
NAME                   HEALTHYINSTANCES   PROVISIONEDINSTANCES   DESIREDINSTANCES     AGE
cstor-disk-pool        3                  3                      3                    2m2s
```
Check if the pool instances report their status as <b>ONLINE</b> using the below command:

```
kubectl get cspi -n openebs
```
Sample Output:

```
NAME                  HOSTNAME             ALLOCATED   FREE    CAPACITY   STATUS   AGE
cstor-disk-pool-vn92  worker-node-1        60k         9900M    9900M     ONLINE   2m17s
cstor-disk-pool-al65  worker-node-2        60k         9900M    9900M     ONLINE   2m17s
cstor-disk-pool-y7pn  worker-node-3        60k         9900M    9900M     ONLINE   2m17s
```
Once all the pods are in running state, these pool instances can be used for creation of cStor volumes.
<hr>

### <a class="anchor" aria-hidden="true" id="creating-cstor-storage-classes"></a>Creating cStor storage classes

StorageClass definition is an important task in the planning and execution of OpenEBS storage. The real power of CAS architecture is to give an independent or a dedicated storage engine like cStor for each workload, so that granular policies can be applied to that storage engine to tune the behaviour or performance as per the workload's need.
  
  #### Steps to create a cStor StorageClass:
   1. Decide the CStorPoolCluster for which you want to create a Storage Class.
   2. Decide the replicaCount based on your requirement/workloads. OpenEBS doesn't restrict the replica count to set, but a <b>maximum of 5</b> replicas are allowed. It depends how users configure it, but for the availability of volumes <b>at least (n/2 + 1) replicas</b> should be up and connected to the target, where n is the replicaCount. The Replica Count should be always less  than or equal to the number of cStor Pool Instances(CSPIs). The following are some example cases:
    <ul> 
    <li>If a user configured replica count as 2, then always 2 replicas should be available to perform operations on volume.</li>
    <li>If a user configured replica count as 3 it should require at least 2 replicas should be available for volume to be operational.</li>
     <li>If a user configured replica count as 5 it should require at least 3 replicas should be available for volume to be operational.</li>
    </ul>
   3. Create a YAML spec file <code>cstor-csi-disk.yaml</code> using the template given below. Update the pool, replica count and other policies. By using this sample configuration YAML, a StorageClass will be created with 3 OpenEBS cStor replicas and will configure themselves on the pool instances. 

      ```
      kind: StorageClass
      apiVersion: storage.k8s.io/v1
      metadata:
        name: cstor-csi-disk
      provisioner: cstor.csi.openebs.io
      allowVolumeExpansion: true
      parameters:
        cas-type: cstor
        # cstorPoolCluster should have the name of the CSPC
        cstorPoolCluster: cstor-disk-pool
        # replicaCount should be <= no. of CSPI
        replicaCount: "3"
      ``` 
To deploy the YAML, execute:
```
kubectl apply -f cstor-csi-disk.yaml
```
To verify, execute:

```
kubectl get sc
```
Sample Output:
```
NAME                        PROVISIONER                                                RECLAIMPOLICY   VOLUMEBINDINGMODE      ALLOWVOLUMEEXPANSION   AGE
cstor-csi                   cstor.csi.openebs.io                                       Delete          Immediate              true                   4s
```
<hr>

### <a class="anchor" aria-hidden="true" id="expanding-a-cstor-volume"></a>Expanding a cStor volume

OpenEBS cStor introduces support for expanding a PersistentVolume using the CSI provisioner. Provided cStor is configured to function as a CSI provisioner, you can expand PVs that have been created by cStor CSI Driver. This feature is supported with Kubernetes versions 1.16 and above.
<br>
For expanding a cStor PV, you must ensure the following items are taken care of:
<br>
<ul>
<li>The StorageClass must support volume expansion. This can be done by editing the StorageClass definition to set the allowVolumeExpansion: true.</li>
<li>To resize a PV, edit the PVC definition and update the spec.resources.requests.storage to reflect the newly desired size, which must be greater than the original size.</li>
<li>The PV must be attached to a pod for it to be resized. There are two scenarios when resizing an cStor PV:<br>
 <ul>
    <li>If the PV is attached to a pod, cStor CSI driver expands the volume on the storage backend, re-scans the device and resizes the filesystem.</li>
    <li>When attempting to resize an unattached PV, cStor CSI driver expands the volume on the storage backend. Once the PVC is bound to a pod, the driver re-scans the device and resizes the filesystem. Kubernetes then updates the PVC size after the expansion operation has successfully completed.</li>
 </ul>
</ul>
<br>
Below example shows the way for expanding cStor volume and how it works. For an already existing StorageClass, you can edit the StorageClass to include the <code>allowVolumeExpansion: true</code>  parameter.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: cstor-csi-disk
provisioner: cstor.csi.openebs.io
allowVolumeExpansion: true
parameters:
  replicaCount: "3"
  cstorPoolCluster: "cspc-disk-pool"
  cas-type: "cstor"
```

For example an application busybox pod is using the below PVC associated with PV. To get the status of the pod, execute: 

```
$ kubectl get pods
```

The following is a sample output:
```
NAME            READY   STATUS    RESTARTS   AGE
busybox         1/1     Running   0          38m
```

To list PVCs, execute:

```
$ kubectl get pvc
```
Sample Output:
```
NAME                           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS              AGE
cstor-pvc                      Bound    pvc-849bd646-6d3f-4a87-909e-2416d4e00904   5Gi        RWO            cstor-csi-disk            1d
```

To list PVs, execute:

```
$ kubectl get pv
```

Sample Output:

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                   STORAGECLASS        REASON   AGE
pvc-849bd646-6d3f-4a87-909e-2416d4e00904   5Gi        RWO            Delete           Bound    default/cstor-pvc       cstor-csi-disk               40m
```

<br>
To resize the PV that has been created from 5Gi to 10Gi, edit the PVC definition and update the spec.resources.requests.storage to 10Gi. It may take a few seconds to update the actual size in the PVC resource, wait for the updated capacity to reflect in PVC status (pvc.status.capacity.storage). It is internally a two step process for volumes containing a file system:
<br>
<ul>
 <li>Volume expansion</li>
 <li>FileSystem expansion</li>
</ul>

```
$ kubectl edit pvc cstor-pvc
```

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  annotations:
    pv.kubernetes.io/bind-completed: "yes"
    pv.kubernetes.io/bound-by-controller: "yes"
    volume.beta.kubernetes.io/storage-provisioner: cstor.csi.openebs.io
  creationTimestamp: "2020-06-24T12:22:24Z"
  finalizers:
  - kubernetes.io/pvc-protection
    name: cstor-pvc
  namespace: default
  resourceVersion: "766"
  selfLink: /api/v1/namespaces/default/persistentvolumeclaims/cstor-pvc
  uid: 849bd646-6d3f-4a87-909e-2416d4e00904
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```
Now, we can validate the resize has worked correctly by checking the size of the PVC, PV, or describing the pvc to get all events.

```
$ kubectl describe pvc cstor-pvc
```
```
Name:          cstor-pvc
Namespace:     default
StorageClass:  cstor-csi-disk
Status:        Bound
Volume:        pvc-849bd646-6d3f-4a87-909e-2416d4e00904
Labels:        <none>
Annotations:   pv.kubernetes.io/bind-completed: yes
               pv.kubernetes.io/bound-by-controller: yes
               volume.beta.kubernetes.io/storage-provisioner: cstor.csi.openebs.io
Finalizers:    [kubernetes.io/pvc-protection]
Capacity:      10Gi
Access Modes:  RWO
VolumeMode:    Filesystem
Mounted By:    busybox-cstor
Events:
  Type     Reason                      Age                From                                                                                      Message
  ----     ------                      ----               ----                                                                                      -------
  Normal   ExternalProvisioning        46m (x2 over 46m)  persistentvolume-controller                                                               waiting for a volume to be created, either by external provisioner "cstor.csi.openebs.io" or manually created by system administrator
  Normal   Provisioning                46m                cstor.csi.openebs.io_openebs-cstor-csi-controller-0_bcba3893-c1c4-4e86-aee4-de98858ec0b7  External provisioner is provisioning volume for claim "default/claim-csi-123"
  Normal   ProvisioningSucceeded       46m                cstor.csi.openebs.io_openebs-cstor-csi-controller-0_bcba3893-c1c4-4e86-aee4-de98858ec0b7  Successfully provisioned volume pvc-849bd646-6d3f-4a87-909e-2416d4e00904
  Warning  ExternalExpanding           93s                volume_expand                                                                             Ignoring the PVC: didn't find a plugin capable of expanding the volume; waiting for an external controller to process this PVC.
  Normal   Resizing                    93s                external-resizer cstor.csi.openebs.io                                                     External resizer is resizing volume pvc-849bd646-6d3f-4a87-909e-2416d4e00904
  Normal   FileSystemResizeRequired    88s                external-resizer cstor.csi.openebs.io                                                     Require file system resize of volume on node
  Normal   FileSystemResizeSuccessful  4s                 kubelet, 127.0.0.1                                                                        MountVolume.NodeExpandVolume succeeded for volume "pvc-849bd646-6d3f-4a87-909e-2416d4e00904"
```

```
$ kubectl get pvc
```

Sample Output:
```
NAME                           STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS              AGE
cstor-pvc                      Bound    pvc-849bd646-6d3f-4a87-909e-2416d4e00904   10Gi        RWO            cstor-csi-disk            1d
```

```
$ kubectl get pv
```

Sample Output:

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                   STORAGECLASS        REASON   AGE
pvc-849bd646-6d3f-4a87-909e-2416d4e00904   10Gi        RWO            Delete           Bound    default/cstor-pvc       cstor-csi-disk               40m
```
<hr>

### <a class="anchor" aria-hidden="true" id="performance-tunings-in-cstor-pools"></a>Performance Tunings in cStor Pools

Allow users to set available performance tunings in cStor Pools based on their workload. cStor pool(s) can be tuned via CSPC and is the recommended way to do it. Below are the tunings that can be applied:
<br>
 
**Resource requests and limits:** This ensures high quality of service when applied for the pool manager containers.  

**Toleration for pool manager pod:** This ensures scheduling of pool pods on the tainted nodes.

**Set priority class:** Sets the priority levels as required.

**Compression:** This helps in setting the compression for cStor pools.

**ReadOnly threshold:** Helps in specifying read only thresholds for cStor pools.
<br>

<font size="4">**Example configuration for Resource and Limits:**</font>

Following CSPC YAML specifies resources and auxResources that will get applied to all pool manager pods for the CSPC. Resources get applied to cstor-pool containers and auxResources gets applied to sidecar containers i.e. cstor-pool-mgmt and pool-exporter.
<br>
In the following CSPC YAML we have only one pool spec (@spec.pools). It is also possible to override the resource and limit value for a specific pool. 

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
  name: cstor-disk-pool
  namespace: openebs
spec:
  resources:
    requests:
      memory: "2Gi"
      cpu: "250m"
    limits:
      memory: "4Gi"
      cpu: "500m"

  auxResources:
    requests:
      memory: "500Mi"
      cpu: "100m"
    limits:
      memory: "1Gi"
      cpu: "200m"
  pools:
    - nodeSelector:
        kubernetes.io/hostname: worker-node-1

      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror
```

Following CSPC YAML explains how the resource and limits can be overridden. If you look at the CSPC YAML, there are no resources and auxResources specified at pool level for worker-node-1 and worker-node-2 but specified for worker-node-3. In this case, for worker-node-1 and worker-node-2 the resources and auxResources will be applied from @spec.resources and @spec.auxResources respectively but for worker-node-3 these will be applied from @spec.pools[2].poolConfig.resources and @spec.pools[2].poolConfig.auxResources respectively. 

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
  name: cstor-disk-pool
  namespace: openebs
spec:
  resources:
    requests:
      memory: "64Mi"
      cpu: "250m"
    limits:
      memory: "128Mi"
      cpu: "500m"
  auxResources:
    requests:
      memory: "50Mi"
      cpu: "400m"
    limits:
      memory: "100Mi"
      cpu: "400m"
  
  pools:
    - nodeSelector:
        kubernetes.io/hostname: worker-node-1
      dataRaidGroups:
        - blockDevices:
            - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
            - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37
      poolConfig:
        dataRaidGroupType: mirror
    
    - nodeSelector:
        kubernetes.io/hostname: worker-node-2
      dataRaidGroups:
        - blockDevices:
            - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f39
            - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f40
      poolConfig:
        dataRaidGroupType: mirror
    
    - nodeSelector:
        kubernetes.io/hostname: worker-node-3
      dataRaidGroups:
        - blockDevices:
            - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f42
            - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f43
      poolConfig:
        dataRaidGroupType: mirror
        resources:
          requests:
            memory: 70Mi
            cpu: 300m
          limits:
            memory: 130Mi
            cpu: 600m
        auxResources:
          requests:
            memory: 60Mi
            cpu: 500m
          limits:
            memory: 120Mi
            cpu: 500m

```

<font size="4">**Example configuration for Tolerations:**</font>

Tolerations are applied in a similar manner like resources and auxResources. The following is a sample CSPC YAML that has tolerations specified. For worker-node-1 and worker-node-2 tolerations are applied form @spec.tolerations but for worker-node-3 it is applied from @spec.pools[2].poolConfig.tolerations

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
  name: cstor-disk-pool
  namespace: openebs
spec:

  tolerations:
  - key: data-plane-node
    operator: Equal
    value: true
    effect: NoSchedule

  pools:
    - nodeSelector:
        kubernetes.io/hostname: worker-node-1

      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-2

      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f39
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f40

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-3

      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f42
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f43

      poolConfig:
        dataRaidGroupType: mirror
        tolerations:
        - key: data-plane-node
          operator: Equal
          value: true
          effect: NoSchedule

        - key: apac-zone
          operator: Equal
          value: true
          effect: NoSchedule
```

<font size="4">**Example configuration for Priority Class:**</font>

Priority Classes are also applied in a similar manner like resources and auxResources. The following is a sample CSPC YAML that has a priority class specified. For worker-node-1 and worker-node-2 priority classes are applied from @spec.priorityClassName but for worker-node-3 it is applied from @spec.pools[2].poolConfig.priorityClassName. Check more info about [priorityclass](https://kubernetes.io/docs/concepts/configuration/pod-priority-preemption/#priorityclass).

**Note:**
<ol>
 <li>Priority class needs to be created beforehand. In this case, high-priority and ultra-priority priority classes should exist.</li>
 <li>The index starts from 0 for @.spec.pools list.</li>
</ol>

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
  name: cstor-disk-pool
  namespace: openebs
spec:

  priorityClassName: high-priority 

  pools:
    - nodeSelector:
        kubernetes.io/hostname: worker-node-1

      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-2

      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f39
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f40

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-3

      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f42
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f43

      poolConfig:
        dataRaidGroupType: mirror
        priorityClassName: utlra-priority
```
<font size="4">**Example configuration for Compression:**</font>

Compression values can be set at <b>pool level only</b>. There is no override mechanism like it was there in case of tolerations, resources, auxResources and priorityClass. Compression value must be one of 
- on
- off
- lzjb
- gzip 
- gzip-[1-9]
- zle
- lz4

**Note:** lz4 is the default compression algorithm that is used if the compression field is left unspecified on the cspc. Below is the sample yaml which has compression specified.

```

apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
  name: demo-pool-cluster
  namespace: openebs
spec:
  pools:
    - nodeSelector:
        kubernetes.io/hostname: worker-node-1

      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror
        compression: lz4
```
<font size="4">**Example configuration for Read Only Threshold:**</font>

RO threshold can be set in a similar manner like compression. ROThresholdLimit is the threshold(percentage base) limit for pool read only mode. If ROThresholdLimit(%) amount of pool storage is consumed then the pool will be set to readonly. If ROThresholdLimit is set to 100 then entire pool storage will be used. By default it will be set to 85% i.e when unspecified on the CSPC.ROThresholdLimit value will be 0 < ROThresholdLimit <= 100. Following CSPC yaml has the ReadOnly Threshold percentage specified.

```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
  name: cstor-csi-disk
  namespace: openebs
spec:
  pools:
    - nodeSelector:
        kubernetes.io/hostname: worker-node-1

      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror

        roThresholdLimit : 70
```