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
   The recommended approach to provision cStor Pools is to use cStorPoolCluster(CSPC), the detailed steps have been provided in this document. However, OpenEBS also supports provisioning of cStor Pools using StoragePoolClaim (SPC). For detailed instructions, refer to the <a href="https://docs.openebs.io/v260/docs/next/ugcstor.html" target="_blank">cStor User guide(SPC)</a>.<br>
   :::

## User operations


## Admin operations

[Expanding a cStor volume](#expanding-a-cstor-volume)

[Performance Tunings in cStor Pools](#performance-tunings-in-cstor-pools)

<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations</h2>

<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>Admin operations</h2>

### <a class="anchor" aria-hidden="true" id="expanding-a-cstor-volume"></a>Expanding a cStor volume

OpenEBS cStor introduces support for expanding an iSCSI PV using the CSI provisioner. Provided cStor is configured to function as a CSI provisioner, you can expand iSCSI PVs that have been created by cStor CSI Driver. This feature is supported with Kubernetes versions 1.16 and above.
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
  name: cstor-sparse-auto
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
    name: claim-csi-123
  namespace: default
  resourceVersion: "766"
  selfLink: /api/v1/namespaces/default/persistentvolumeclaims/claim-csi-123
  uid: 849bd646-6d3f-4a87-909e-2416d4e00904
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```
Now, we can validate the resize has worked correctly by checking the size of the PVC, PV, or describing the pvc to get all events.

```
$ kubectl describe pvc cstor-pvc
```
```
Name:          claim-csi-123
Namespace:     default
StorageClass:  cstor-sparse-auto
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
  name: demo-pool-cluster
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
      - cspiBlockDevices:
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
  name: demo-pool-cluster
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
      - cspiBlockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-2

      dataRaidGroups:
      - cspiBlockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f39
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f40

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-3

      dataRaidGroups:
      - cspiBlockDevices:
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
  name: demo-pool-cluster
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
      - cspiBlockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-2

      dataRaidGroups:
      - cspiBlockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f39
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f40

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-3

      dataRaidGroups:
      - cspiBlockDevices:
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
  name: demo-pool-cluster
  namespace: openebs
spec:

  priorityClassName: high-priority 

  pools:
    - nodeSelector:
        kubernetes.io/hostname: worker-node-1

      dataRaidGroups:
      - cspiBlockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-2

      dataRaidGroups:
      - cspiBlockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f39
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f40

      poolConfig:
        dataRaidGroupType: mirror

    - nodeSelector:
        kubernetes.io/hostname: worker-node-3

      dataRaidGroups:
      - cspiBlockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f42
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f43

      poolConfig:
        dataRaidGroupType: mirror
        priorityClassName: utlra-priority
```
<font size="4">**Example configuration for Compression:**</font>
Compression values can be set at pool level only. There is no override mechanism like it was there in case of tolerations, resources, auxResources and priorityClass. Compression value must be one of on,off,lzjb,gzip,gzip-[1-9],zle and lz4.

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
      - cspiBlockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror
        compression: lz
```
<font size="4">**Example configuration for Read Only Threshold:**</font>
RO threshold can be set in a similar manner like compression. ROThresholdLimit is the threshold(percentage base) limit for pool read only mode. If ROThresholdLimit(%) amount of pool storage is consumed then the pool will be set to readonly. If ROThresholdLimit is set to 100 then entire pool storage will be used. By default it will be set to 85% i.e when unspecified on the CSPC.ROThresholdLimit value will be 0 < ROThresholdLimit <= 100. Following CSPC yaml has the ReadOnly Threshold percentage specified.

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
      - cspiBlockDevices:
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f36
          - blockDeviceName: blockdevice-ada8ef910929513c1ad650c08fbe3f37

      poolConfig:
        dataRaidGroupType: mirror

        roThresholdLimit : 70
```