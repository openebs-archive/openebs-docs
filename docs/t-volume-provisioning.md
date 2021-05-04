---
id: t-volume-provisioning
title: Troubleshooting OpenEBS - Provisioning
sidebar_label: Volume Provisioning
---
------

<font size="5">General guidelines for troubleshooting</font>

- Contact <a href="/docs/next/support.html" target="_blank">OpenEBS Community</a> for support.
- Search for similar issues added in this troubleshooting section.
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>
<hr>
<br>

[Unable to create persistentVolumeClaim due to certificate verification error](#admission-server-ca)

[Application complaining ReadOnly filesystem](#application-read-only)

[Application pods are not running when OpenEBS volumes are provisioned on Rancher](#application-pod-not-running-Rancher)

[Application pod is stuck in ContainerCreating state after deployment](#application-pod-stuck-after-deployment)

[Creating cStor pool fails on CentOS when there are partitions on the disk](#cstor-pool-failed-centos-partition-disk)

[Application pod enters CrashLoopBackOff state](#application-crashloopbackoff)

[cStor pool pods are not running](#cstor-pool-pod-not-running)

[OpenEBS Jiva PVC is not provisioning in 0.8.0](#Jiva-provisioning-failed-080)

[Recovery procedure for Read-only volume where kubelet is running in a container](#recovery-readonly-when-kubelet-is-container)

[Recovery procedure for Read-only volume for XFS formatted volumes](#recovery-readonly-xfs-volume)

[Unable to clone OpenEBS volume from snapshot](#unable-to-clone-from-snapshot)

[Unable to mount XFS formatted volumes into Pod](#unable-to-mount-xfs-volume)

[Unable to create or delete a PVC](#unable-to-create-or-delete-a-pvc)

[Unable to provision cStor on DigitalOcean](#unable-to-provision-openebs-volume-on-DigitalOcean)

[Persistent volumes indefinitely remain in pending state](#persistent-volumes-indefinitely-remain-in-pending-state)

<br>
<hr>
<br>

<h3><a class="anchor" aria-hidden="true" id="application-read-only"></a> Application complaining ReadOnly filesystem</h3>


Application sometimes complain about the underlying filesystem has become ReadOnly.

**Troubleshooting**

This can happen for many reasons. 

- The cStor target pod is evicted because of resource constraints and is not scheduled within time 
- Node is rebooted in adhoc manner (or unscheduled reboot) and Kubernetes is waiting for Kubelet to respond to know if the node is rebooted and the pods on that node need to be rescheduled. Kubernetes can take up to 30 minutes as timeout before deciding the node is going to stay offline and pods need to be rescheduled. During this time, the iSCSI initiator at the application pod has timeout and marked the underlying filesystem as ReadOnly
- cStor target has lost quorum because of underlying node losses and target has marked the lun as ReadOnly

Go through the Kubelet logs and application pod logs to know the reason for marking the ReadOnly and take appropriate action. [Maintaining volume quorum](/docs/next/k8supgrades.html) is necessary during Kubernetes node reboots. 

<h3><a class="anchor" aria-hidden="true" id="admission-server-ca"></a>Unable to create persistentVolumeClaim due to certificate verification error</h3>


An issue can appear when creating a PersistentVolumeClaim:

```
Error from server (InternalError):Internal error occurred: failed calling webhook "admission-webhook.openebs.io": Post https://admission-server-svc.openebs.svc:443/validate?timeout=30s: x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "admission-server-ca")
```

**Troubleshooting**

By default OpenEBS chart generates TLS certificates used by the `openebs-admission-controller`, while this is handy, it requires the admission controller to restart on each `helm upgrade` command. For most of the use cases, the admission controller would have restarted to update the certificate configurations, if not , then user will get the above mentioned error.

**Workaround**

This can be fixed by restarting the admission controller:

```
kubectl -n openebs get pods -o name | grep admission-server | xargs kubectl -n openebs delete
```



<h3><a class="anchor" aria-hidden="true" id="application-pod-not-running-Rancher"></a>Application pods are not running when OpenEBS volumes are provisioned on Rancher</h3>



The setup environment where the issue occurs is rancher/rke with bare metal hosts running CentOS. After installing OpenEBS, OpenEBS pods are running, but application pod is in *ContainerCreating* state. It consume Jiva volume. The output of `kubectl get pods` is displayed as follows.

```
NAME                                                             READY     STATUS              RESTARTS   AGE
nginx-deployment-57849d9f57-12345                                0/1       ContainerCreating   0          2m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-ctrl-58dcdf997f-n4kd9   2/2       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-gq4z6    1/1       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-hwx52    1/1       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-vs97n    1/1       Running             0          8m
```

**Troubleshooting**

Make sure the following prerequisites are done.

1. Verify iSCSI initiator is installed on nodes and services are running. 
2. Added extra_binds under kubelet service in cluster YAML

More details are mentioned [here](/docs/next/prerequisites.html#rancher).



<h3><a class="anchor" aria-hidden="true" id="application-pod-stuck-after-deployment"></a>Application pod is stuck in ContainerCreating state after deployment</h3>

**Troubleshooting**

- Obtain the output of the `kubectl describe pod <application_pod>` and check the events.

- If the error message *executable not found in $PATH* is found, check whether the iSCSI initiator utils are installed on the node/kubelet container (rancherOS, coreOS). If not, install the same and retry deployment.

- If the warning message *FailedMount: Unable to mount volumes for pod <>: timeout expired waiting for volumes to attach/mount* is persisting use the following procedure.

  1. Check whether the Persistent Volume Claim/Persistent Volume (PVC/PV) are created successfully and the OpenEBS controller and replica pods are running. These can be verified using the `kubectl get pvc,pv` and `kubectl get pods`command.

  2. If the OpenEBS volume pods are not created, and the PVC is in pending state, check whether the storageclass referenced by the application PVC is available/installed. This can be confirmed using the `kubectl get sc` command. If this storageclass is not created, or improperly created without the appropriate attributes, recreate the same and re-deploy the application.

     **Note:** Ensure that the older PVC objects are deleted before re-deployment.

  3. If the PV is created (in bound state), but replicas are not running or are in pending state, perform a `kubectl describe <replica_pod>` and check the events. If the events indicate *FailedScheduling due to Insufficient cpu, NodeUnschedulable or MatchInterPodAffinity and PodToleratesNodeTaints*, check the following:

     - replica count is equal to or lesser than available schedulable nodes
     - there are enough resources on the nodes to run the replica pods
     - whether nodes are tainted and if so, whether they are tolerated by the OpenEBS replica pods

     Ensure that the above conditions are met and the replica rollout is successful. This will ensure application enters running state.

  4. If the PV is created and OpenEBS pods are running, use the `iscsiadm -m session` command on the node (where the pod is scheduled) to identify whether the OpenEBS iSCSI volume has been attached/logged-into. If not, verify network connectivity between the nodes.

  5. If the session is present, identify the SCSI device associated with the session using the command `iscsiadm -m session -P 3`. Once it is confirmed that the iSCSI device is available (check the output of `fdisk -l` for the mapped SCSI device), check the kubelet and system logs including the iscsid and kernel (syslog) for information on the state of this iSCSI device. If inconsistencies are observed, execute the filesyscheck on the device `fsck -y /dev/sd<>`. This will mount the volume to the node.

- In OpenShift deployments, you may face this issue with the OpenEBS replica pods continuously restarting, that is, they are in crashLoopBackOff state. This is due to the default "restricted" security context settings. Edit the following settings using `oc edit scc restricted` to get the application pod running.

  - *allowHostDirVolumePlugin: true*
  - *runAsUser: runAsAny*



<h3><a class="anchor" aria-hidden="true" id="cstor-pool-failed-centos-partition-disk"></a>Creating cStor pool fails on CentOS when there are partitions on the disk.</h3>


Creating cStor pool fails with the following error message:

```
E0920 14:51:17.474702       8 pool.go:78] Unable to create pool: /dev/disk/by-id/ata-WDC_WD2500BOOM-00JJ
```

sdb and sdc are used for cStor pool creation.

```
core@k8worker02 ~ $ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINT
sda           8:0    0 111.8G  0 disk
|-sda1        8:1    0   128M  0 part  /boot
|-sda2        8:2    0     2M  0 part
|-sda3        8:3    0     1G  0 part
| `-usr     254:0    0  1016M  1 crypt /usr
|-sda4        8:4    0     1G  0 part
|-sda6        8:6    0   128M  0 part  /usr/share/oem
|-sda7        8:7    0    64M  0 part
`-sda9        8:9    0 109.5G  0 part  /
sdb           8:16   0 111.8G  0 disk
sdc           8:32   0 232.9G  0 disk
|-sdc1        8:33   0     1G  0 part
`-sdc2        8:34   0 231.9G  0 part
 |-cl-swap 254:1    0   7.8G  0 lvm
 |-cl-home 254:2    0 174.1G  0 lvm
 `-cl-root 254:3    0    50G  0 lvm
```

**Troubleshooting**

1. Clear the partitions on the portioned disk.

2. Run the following command on the host machine to check any LVM handler on the device.

   ```
   sudo dmsetup info -C
   ```

   Output of the above command will be similar to the following.

   ```
   Name             Maj Min Stat Open Targ Event  UUID                                                                 
   usr              254   0 L--r    1    1      0 CRYPT-VERITY-959135d6b3894b3b8125503de238d5c4-usr                   
   centos-home      254   2 L--w    0    1      0 LVM-1kqWMeQWqH3qTsiHhYw3ygAzOvpfDL58dDmziWBI0panwOGRq2rp9PjpmE6qdf1V
   centos-swap      254   1 L--w    0    1      0 LVM-1kqWMeQWqH3qTsiHhYw3ygAzOvpfDL58UIVFhLkzvE1mk7uCy2nePlktBHfTuTYF
   centos-root      254   3 L--w    0    1      0 LVM-1kqWMeQWqH3qTsiHhYw3ygAzOvpfDL58WULaIYm0X7QmrwQaWYxz1hTwzWocAwYJ
   ```

   If the output is similar to the above, you must remove the handler on the device.

   ```
   sudo dmsetup remove centos-home
   sudo dmsetup remove centos-swap
   sudo dmsetup remove centos-root
   ```



<h3><a class="anchor" aria-hidden="true" id="application-crashloopbackoff"></a>Application pod enters CrashLoopBackOff states</h3>


Application pod enters CrashLoopBackOff state

This issue is due to failed application operations in the container. Typically this is caused due to failed writes on the mounted PV. To confirm this, check the status of the PV mount inside the application pod.

**Troubleshooting**

- Perform a `kubectl exec -it <app>` bash (or any available shell) on the application pod and attempt writes on the volume mount. The volume mount can be obtained either from the application specification ("volumeMounts" in container spec) or by performing a `df -h` command in the controller shell (the OpenEBS iSCSI device will be mapped to the volume mount).
- The writes can be attempted using a simple command like `echo abc > t.out` on the mount. If the writes fail with *Read-only file system errors*, it means the iSCSI connections to the OpenEBS volumes are lost. You can confirm by checking the node's system logs including iscsid, kernel (syslog) and the kubectl logs (`journalctl -xe, kubelet.log`).
- iSCSI connections usually fail due to the following.
  - flaky networks (can be confirmed by ping RTTs, packet loss etc.) or failed networks between -
    - OpenEBS PV controller and replica pods
    - Application and controller pods
  - Node failures
  - OpenEBS volume replica crashes or restarts due to software bugs
- In all the above cases, loss of the device for a period greater than the node iSCSI initiator timeout causes the volumes to be re-mounted as RO.
- In certain cases, the node/replica loss can lead to the replica quorum not being met (i.e., less than 51% of replicas available) for an extended period of time, causing the OpenEBS volume to be presented as a RO device.

**Workaround/Recovery**

The procedure to ensure application recovery in the above cases is as follows:

1. Resolve the system issues which caused the iSCSI disruption/RO device condition. Depending on the cause, the resolution steps may include recovering the failed nodes, ensuring replicas are brought back on the same nodes as earlier, fixing the network problems and so on.

2. Ensure that the OpenEBS volume controller and replica pods are running successfully with all replicas in *RW mode*. Use the command `curl GET http://<ctrl ip>:9501/v1/replicas | grep createTypes` to confirm.

3. If anyone of the replicas are still in RO mode, wait for the synchronization to complete. If all the replicas are in RO mode (this may occur when all replicas re-register into the controller within short intervals), you must restart the OpenEBS volume controller using the `kubectl delete pod <pvc-ctrl>` command . Since it is a Kubernetes deployment, the controller pod is restarted successfully. Once done, verify that all replicas transition into *RW mode*.

4. Un-mount the stale iscsi device mounts on the application node. Typically, these devices are mounted in the `/var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/<target-portal:iqn>-lun-0` path.

   Example:

   ```
   umount /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.39.241.26:
   3260-iqn.2016-09.com.openebs.jiva:mongo-jiva-mongo-persistent-storage-mongo-0-3481266901-lun-0
   
   umount /var/lib/kubelet/pods/ae74da97-c852-11e8-a219-42010af000b6/volumes/kubernetes.io~iscsi/mongo-jiva-mongo-persistent-storage-mongo-0-3481266901
   ```

5. Identify whether the iSCSI session is re-established after failure. This can be verified using `iscsiadm -m session`, with the device mapping established using `iscsiadm -m session -P 3` and `fdisk -l`. **Note:** Sometimes, it is observed that there are stale device nodes (scsi device names) present on the Kubernetes node. Unless the logs confirm that a re-login has occurred after the system issues were resolved, it is recommended to perform the following step after doing a purge/logout of the existing session using `iscsiadm -m node -T <iqn> -u`.

6. If the device is not logged in again, ensure that the network issues/failed nodes/failed replicas are resolved, the device is discovered, and the session is re-established. This can be achieved using the commands `iscsiadm -m discovery -t st -p <ctrl svc IP>:3260` and `iscsiadm -m node -T <iqn> -l` respectively.

7. Identify the new SCSI device name corresponding to the iSCSI session (the device name may or may not be the same as before).

8. Re-mount the new disk into the mountpoint mentioned earlier using the `mount -o rw,relatime,data=ordered /dev/sd<> <mountpoint>` command. If the re-mount fails due to inconsistencies on the device (unclean filesystem), perform a filesyscheck `fsck -y /dev/sd<>`.

9. Ensure that the application uses the newly mounted disk by forcing it to restart on the same node. Use the command`docker stop <id>` of the application container on the node. Kubernetes will automatically restart the pod to ensure the "desirable" state.

   While this step may not be necessary most times (as the application is already undergoing periodic restarts as part of the CrashLoop cycle), it can be performed if the application pod's next restart is scheduled with an exponential back-off delay.

**Notes:**

1. The above procedure works for applications that are either pods or deployments/statefulsets. In case of the latter, the application pod can be restarted (i.e., deleted) after step-4 (iscsi logout) as the deployment/statefulset controller will take care of rescheduling the application on a same/different node with the volume.



<h3><a class="anchor" aria-hidden="true" id="cstor-pool-pod-not-running"></a>cStor pool pods are not running</h3>


The cStor disk pods are not coming up after it deploy with the YAML. On checking the pool pod logs, it says `/dev/xvdg is in use and contains a xfs filesystem.`

**Workaround:**

cStor can consume disks that are attached (are visible to OS as SCSI devices) to the Nodes and no need of format these disks. This means disks should not have any filesystem and it should be unmounted on the Node. It is also recommended to wipe out the disks if you are using an used disk for cStor pool creation. The following steps will clear the file system from the disk.

```
sudo umount <block device path>
wipefs -a <block device path>
```

The following is an example output of `lsblk` on node.

<div class="co">
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
loop0     7:0    0   89M  1 loop /snap/core/7713
loop1     7:1    0   18M  1 loop /snap/amazon-ssm-agent/1480
xvda    202:0    0  128G  0 disk
└─xvda1 202:1    0  128G  0 part /
xvdf    202:80   0   50G  0 disk /home/openebs-ebs
</div>

From the above output, it shows that `/dev/xvdf` is mounted on `/home/openebs-ebs`. The following commands will unmount disk first and then remove the file system.

```
sudo umount /dev/xvdf
wipefs -a /dev/xvdf
```

After performing the above commands, verify the disk status using `lsblk` command:

Example output:

<div class="co">
ubuntu@ip-10-5-113-122:~$ lsblk
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
loop0     7:0    0   89M  1 loop /snap/core/7713
loop1     7:1    0   18M  1 loop /snap/amazon-ssm-agent/1480
xvda    202:0    0  128G  0 disk
└─xvda1 202:1    0  128G  0 part /
xvdf    202:80   0   50G  0 disk
</div>


<h3><a class="anchor" aria-hidden="true" id="Jiva-provisioning-failed-080"></a>OpenEBS Jiva PVC is not provisioning in 0.8.0</h3>


Even all OpenEBS pods are in running state, unable to provision Jiva volume if you install through helm.

**Troubleshooting:**

Check the latest logs showing in the OpenEBS provisioner logs. If the particular PVC creation entry logs are not coming on the OpenEBS provisioner pod, then restart the OpenEBS provisioner pod. From 0.8.1 version, liveness probe feature will check the OpenEBS provisioner pod status periodically and ensure its availability for OpenEBS PVC creation.



<h3><a class="anchor" aria-hidden="true" id="recovery-readonly-when-kubelet-is-container"></a>Recovery procedure for Read-only volume where kubelet is running in a container.</h3>


In environments where the kubelet runs in a container, perform the following steps as part of the recovery procedure for a Volume-Read only issue.

1. Confirm that the OpenEBS target does not exist as a Read Only device by the OpenEBS controller and that all replicas are in Read/Write mode.
   - Un-mount the iSCSI volume from the node in which the application pod is scheduled.
   - Perform the following iSCSI operations from inside the kubelet container.
     - Logout
     - Rediscover
     - Login
   - Perform the following iSCSI operations from inside the kubelet container.
   - Re-mount the iSCSI device (may appear with a new SCSI device name) on the node.
   - Verify if the application pod is able to start using/writing into the newly mounted device.
2. Once the application is back in "Running" state post recovery by following steps 1-9, if existing/older data is not visible (i.e., it comes up as a fresh instance), it is possible that the application pod is using the docker container filesystem instead of the actual PV (observed sometimes due to the reconciliation attempts by Kubernetes to get the pod to a desired state in the absence of the mounted iSCSI disk). This can be checked by performing a `df -h` or `mount` command inside the application pods. These commands should show the scsi device `/dev/sd*` mounted on the specified mount point. If not, the application pod can be forced to use the PV by restarting it (deployment/statefulset) or performing a docker stop of the application container on the node (pod).



<h3><a class="anchor" aria-hidden="true" id="recovery-readonly-xfs-volume"></a>Recovery procedure for Read-only volume for XFS formatted volumes</h3>


In case of `XFS` formatted volumes, perform the following steps once the iSCSI target is available in RW state & logged in:

- Un-mount the iSCSI volume from the node in which the application pod is scheduled. This may cause the application to enter running state by using the local mount point.
- Mount to volume to a new (temp) directory to replay the metadata changes in the log
- Unmount the volume again
- Perform `xfs_repair /dev/<device>`. This fixes if any file system related errors on the device
- Perform application pod deletion to facilitate fresh mount of the volume. At this point, the app pod may be stuck on `terminating` OR `containerCreating` state. This can be resolved by deleting the volume folder (w/ app content) on the local directory.



<h3><a class="anchor" aria-hidden="true" id="unable-to-clone-from-snapshot"></a>Unable to clone OpenEBS volume from snapshot</h3>


Taken a snapshot of a PVC successfully. But unable to clone the volume from the snapshot.

**Troubleshooting:**

Logs from snapshot-controller pods  are follows.

```
ERROR: logging before flag.Parse: I0108 18:11:54.017909      1 volume.go:73] OpenEBS volume provisioner namespace openebs
I0108 18:11:54.181897      1 snapshot-controller.go:95] starting snapshot controller
I0108 18:11:54.200069      1 snapshot-controller.go:167] Starting snapshot controller
I0108 18:11:54.200139      1 controller_utils.go:1027] Waiting for caches to sync for snapshot-controller controller
I0108 18:11:54.300430      1 controller_utils.go:1034] Caches are synced for snapshot-controller controller
I0108 23:12:26.170921      1 snapshot-controller.go:190] [CONTROLLER] OnAdd /apis/volumesnapshot.external-storage.k8s.io/v1/namespaces/default/volumesnapshots/xl-release-snapshot, Snapshot &v1.VolumeSnapshot{TypeMeta:v1.TypeMeta{Kind:"", APIVersion:""}, Metadata:v1.ObjectMeta{Name:"xl-release-snapshot", GenerateName:"", Namespace:"default", SelfLink:"/apis/volumesnapshot.external-storage.k8s.io/v1/namespaces/default/volumesnapshots/xl-release-snapshot", UID:"dc804d0d-139a-11e9-9561-005056949728", ResourceVersion:"2072353", Generation:1, CreationTimestamp:v1.Time{Time:time.Time{wall:0x0, ext:63682585945, loc:(*time.Location)(0x2a17900)}}, DeletionTimestamp:(*v1.Time)(nil), DeletionGracePeriodSeconds:(*int64)(nil), Labels:map[string]string(nil), Annotations:map[string]string{"kubectl.kubernetes.io/last-applied-configuration":"{\"apiVersion\":\"volumesnapshot.external-storage.k8s.io/v1\",\"kind\":\"VolumeSnapshot\",\"metadata\":{\"annotations\":{},\"name\":\"xl-release-snapshot\",\"namespace\":\"default\"},\"spec\":{\"persistentVolumeClaimName\":\"xlr-data-pvc\"}}\n"}, OwnerReferences:[]v1.OwnerReference(nil), Initializers:(*v1.Initializers)(nil), Finalizers:[]string(nil), ClusterName:""}, Spec:v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:""}, Status:v1.VolumeSnapshotStatus{CreationTimestamp:v1.Time{Time:time.Time{wall:0x0, ext:0, loc:(*time.Location)(nil)}}, Conditions:[]v1.VolumeSnapshotCondition(nil)}}
I0108 23:12:26.210135      1 desired_state_of_world.go:76] Adding new snapshot to desired state of world: default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728
E0108 23:12:26.288184      1 snapshotter.go:309] No conditions for this snapshot yet.
I0108 23:12:26.295175      1 snapshotter.go:160] No VolumeSnapshotData objects found on the API server
I0108 23:12:26.295224      1 snapshotter.go:458] findSnapshot: snapshot xl-release-snapshot
I0108 23:12:26.355476      1 snapshotter.go:469] findSnapshot: find snapshot xl-release-snapshot by tags &map[].
I0108 23:12:26.355550      1 processor.go:183] FindSnapshot by tags: map[string]string(nil)
I0108 23:12:26.355575      1 snapshotter.go:449] syncSnapshot: Creating snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 ...
I0108 23:12:26.355603      1 snapshotter.go:491] createSnapshot: Creating snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 through the plugin ...
I0108 23:12:26.373908      1 snapshotter.go:497] createSnapshot: Creating metadata for snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728.
I0108 23:12:26.373997      1 snapshotter.go:701] In updateVolumeSnapshotMetadata
I0108 23:12:26.380908      1 snapshotter.go:721] updateVolumeSnapshotMetadata: Metadata UID: dc804d0d-139a-11e9-9561-005056949728 Metadata Name: xl-release-snapshot Metadata Namespace: default Setting tags in Metadata Labels: map[string]string{"SnapshotMetadata-Timestamp":"1546989146380869451", "SnapshotMetadata-PVName":"pvc-5f9bd5ec-1398-11e9-9561-005056949728"}.
I0108 23:12:26.391791      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:""}
I0108 23:12:26.391860      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:""}
I0108 23:12:26.392281      1 snapshotter.go:742] updateVolumeSnapshotMetadata: returning cloudTags [map[string]string{"kubernetes.io/created-for/snapshot/namespace":"default", "kubernetes.io/created-for/snapshot/name":"xl-release-snapshot", "kubernetes.io/created-for/snapshot/uid":"dc804d0d-139a-11e9-9561-005056949728", "kubernetes.io/created-for/snapshot/timestamp":"1546989146380869451"}]
I0108 23:12:26.392661      1 snapshot.go:53] snapshot Spec Created:
{"metadata":{"name":"pvc-5f9bd5ec-1398-11e9-9561-005056949728_xl-release-snapshot_1546989146392411824","namespace":"default","creationTimestamp":null},"spec":{"casType":"jiva","volumeName":"pvc-5f9bd5ec-1398-11e9-9561-005056949728"}}
I0108 23:12:26.596285      1 snapshot.go:84] Snapshot Successfully Created:
{"apiVersion":"v1alpha1","kind":"CASSnapshot","metadata":{"name":"pvc-5f9bd5ec-1398-11e9-9561-005056949728_xl-release-snapshot_1546989146392411824"},"spec":{"casType":"jiva","volumeName":"pvc-5f9bd5ec-1398-11e9-9561-005056949728"}}
I0108 23:12:26.596362      1 snapshotter.go:276] snapshot created: &{<nil> <nil> <nil> <nil> <nil> 0xc420038a00}. Conditions: &[]v1.VolumeSnapshotCondition{v1.VolumeSnapshotCondition{Type:"Ready", Status:"True", LastTransitionTime:v1.Time{Time:time.Time{wall:0xbf056976a38b90b7, ext:18032657942280, loc:(*time.Location)(0x2a17900)}}, Reason:"", Message:"Snapshot created successfully"}}
I0108 23:12:26.596439      1 snapshotter.go:508] createSnapshot: create VolumeSnapshotData object for VolumeSnapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728.
I0108 23:12:26.596478      1 snapshotter.go:533] createVolumeSnapshotData: Snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728. Conditions: &[]v1.VolumeSnapshotCondition{v1.VolumeSnapshotCondition{Type:"Ready", Status:"True", LastTransitionTime:v1.Time{Time:time.Time{wall:0xbf056976a38b90b7, ext:18032657942280, loc:(*time.Location)(0x2a17900)}}, Reason:"", Message:"Snapshot created successfully"}}
I0108 23:12:26.604409      1 snapshotter.go:514] createSnapshot: Update VolumeSnapshot status and bind VolumeSnapshotData to VolumeSnapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728.
I0108 23:12:26.604456      1 snapshotter.go:860] In bindVolumeSnapshotDataToVolumeSnapshot
I0108 23:12:26.604472      1 snapshotter.go:862] bindVolumeSnapshotDataToVolumeSnapshot: Namespace default Name xl-release-snapshot
I0108 23:12:26.608792      1 snapshotter.go:877] bindVolumeSnapshotDataToVolumeSnapshot: Updating VolumeSnapshot object [&v1.VolumeSnapshot{TypeMeta:v1.TypeMeta{Kind:"", APIVersion:""}, Metadata:v1.ObjectMeta{Name:"xl-release-snapshot", GenerateName:"", Namespace:"default", SelfLink:"/apis/volumesnapshot.external-storage.k8s.io/v1/namespaces/default/volumesnapshots/xl-release-snapshot", UID:"dc804d0d-139a-11e9-9561-005056949728", ResourceVersion:"2072354", Generation:2, CreationTimestamp:v1.Time{Time:time.Time{wall:0x0, ext:63682585945, loc:(*time.Location)(0x2a17900)}}, DeletionTimestamp:(*v1.Time)(nil), DeletionGracePeriodSeconds:(*int64)(nil), Labels:map[string]string{"SnapshotMetadata-Timestamp":"1546989146380869451", "SnapshotMetadata-PVName":"pvc-5f9bd5ec-1398-11e9-9561-005056949728"}, Annotations:map[string]string{"kubectl.kubernetes.io/last-applied-configuration":"{\"apiVersion\":\"volumesnapshot.external-storage.k8s.io/v1\",\"kind\":\"VolumeSnapshot\",\"metadata\":{\"annotations\":{},\"name\":\"xl-release-snapshot\",\"namespace\":\"default\"},\"spec\":{\"persistentVolumeClaimName\":\"xlr-data-pvc\"}}\n"}, OwnerReferences:[]v1.OwnerReference(nil), Initializers:(*v1.Initializers)(nil), Finalizers:[]string(nil), ClusterName:""}, Spec:v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}, Status:v1.VolumeSnapshotStatus{CreationTimestamp:v1.Time{Time:time.Time{wall:0x0, ext:0, loc:(*time.Location)(nil)}}, Conditions:[]v1.VolumeSnapshotCondition{v1.VolumeSnapshotCondition{Type:"Ready", Status:"True", LastTransitionTime:v1.Time{Time:time.Time{wall:0xbf056976a38b90b7, ext:18032657942280, loc:(*time.Location)(0x2a17900)}}, Reason:"", Message:"Snapshot created successfully"}}}}]
I0108 23:12:26.617060      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:""}
I0108 23:12:26.617102      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0108 23:12:26.617118      1 desired_state_of_world.go:76] Adding new snapshot to desired state of world: default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728
I0108 23:12:26.617449      1 snapshotter.go:202] In waitForSnapshot: snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 snapshot data k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7
I0108 23:12:26.620951      1 snapshotter.go:241] waitForSnapshot: Snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 created successfully. Adding it to Actual State of World.
I0108 23:12:26.620991      1 actual_state_of_world.go:74] Adding new snapshot to actual state of world: default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728
I0108 23:12:26.621005      1 snapshotter.go:526] createSnapshot: Snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 created successfully.
I0109 00:11:54.211526      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 00:11:54.211695      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 01:11:54.211693      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 01:11:54.211817      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 02:11:54.211890      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 02:11:54.212010      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 03:11:54.212062      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 03:11:54.212201      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 04:11:54.212249      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc",
```

**Resolution:**

This can be happen due to the stale entries of snapshot and snapshot data. By deleting those entries will resolve this issue. 



<h3><a class="anchor" aria-hidden="true" id="unable-to-mount-xfs-volume"></a>Unable to mount XFS formatted volumes into Pod</h3>


I created PVC with FSType as `xfs`. OpenEBS PV is successfully created and I have verified that iSCSI initiator is available on the Application node. But application pod is unable to mount the volume.

**Troubleshooting:**

 Describing application pod is showing following error:

```
Events:
  Type     Reason                  Age                From                     Message
  ----     ------                  ----               ----                     -------
  Warning  FailedScheduling        58s (x2 over 59s)  default-scheduler        pod has unbound PersistentVolumeClaims (repeated 4 times)
  Normal   Scheduled               58s                default-scheduler        Successfully assigned redis-master-0 to node0
  Normal   SuccessfulAttachVolume  58s                attachdetach-controller  AttachVolume.Attach succeeded for volume "pvc-a036d681-8fd4-11e8-ad96-de1a202c9007"
  Normal   SuccessfulMountVolume   55s                kubelet, node0           MountVolume.SetUp succeeded for volume "default-token-12345"
  Warning  FailedMount             24s (x4 over 43s)  kubelet, node0           MountVolume.WaitForAttach failed for volume "pvc-a036d681-8fd4-11e8-ad96-de1a202c9007" : failed to get any path for iscsi disk, last err seen:
iscsi: failed to sendtargets to portal 10.233.27.8:3260 output: iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: connection login retries (reopen_max) 5 exceeded
iscsiadm: No portals found
, err exit status 21
  Warning  FailedMount  8s (x2 over 17s)  kubelet, node0  MountVolume.MountDevice failed for volume "pvc-a036d681-8fd4-11e8-ad96-de1a202c9007" : executable file not found in $PATH
```

kubelet had following errors during mount process:
```
kubelet[687]: I0315 15:14:54.179765     687 mount_linux.go:453] `fsck` error fsck from util-linux 2.27.1
kubelet[687]: fsck.ext2: Bad magic number in super-block while trying to open /dev/sdn
kubelet[687]: /dev/sdn:
kubelet[687]: The superblock could not be read or does not describe a valid ext2/ext3/ext4
kubelet[687]: filesystem.  If the device is valid and it really contains an ext2/ext3/ext4
```
And dmesg was showing errors like:
```
[5985377.220132] XFS (sdn): Invalid superblock magic number
[5985377.306931] XFS (sdn): Invalid superblock magic number
```

**Resolution:**

This can happen due to `xfs_repair` failure on the application node. Make sure that the application node has `xfsprogs` package installed. 

```
apt install xfsprogs
```



<h3><a class="anchor" aria-hidden="true" id="unable-to-create-or-delete-a-pvc"></a>Unable to create or delete a PVC</h3>


User is unable to create a new PVC or delete an existing PVC. While doing any of these operation, the following error is coming on the PVC.

```
Error from server (InternalError): Internal error occurred: failed calling webhook "admission-webhook.openebs.io": Post https://admission-server-svc.openebs.svc:443/validate?timeout=30s: Bad Gateway
```

**Workaround:**

When a user creates or deletes a PVC, there are validation triggers and a request has been intercepted by the admission webhook controller after authentication/authorization from kube-apiserver.
By default admission webhook service has been configured to 443 port and the error above suggests that either port 443 is not allowed to use in cluster or admission webhook service has to be allowed in k8s cluster Proxy settings.

<hr>


User is unable to create a new PVC or delete an existing PVC. While doing any of these operation, the following error is coming on the PVC.

```
Error from server (InternalError): Internal error occurred: failed calling webhook "admission-webhook.openebs.io": Post https://admission-server-svc.openebs.svc:443/validate?timeout=30s: Bad Gateway
```

**Workaround:**

When a user creates or deletes a PVC, there are validation triggers and a request has been intercepted by the admission webhook controller after authentication/authorization from kube-apiserver.
By default admission webhook service has been configured to 443 port and the error above suggests that either port 443 is not allowed to use in cluster or admission webhook service has to be allowed in k8s cluster Proxy settings.


<br>
<h3><a class="anchor" aria-hidden="true" id="unable-to-provision-openebs-volume-on-DigitalOcean"></a>Unable to provision OpenEBS volume on DigitalOcean</h3>
<br>
User is unable to provision cStor or jiva volume on DigitalOcean, encountering error thrown from iSCSI PVs: 
<br>

```
MountVolume.WaitForAttach failed for volume “pvc-293d3560-a5c3–41d5–8911–67f33115b8ee” : executable file not found in $PATH
```

**Resolution :**

To avoid this issue, the Kubelet Service needs to be updated to mount the required packages to establish iSCSI connection to the target. Kubelet Service on all the nodes in the cluster should be updated.
<blockquote>
 The exact mounts may vary depending on the OS. <br><br>The following steps have been verified on:<br>
1. Digital Ocean Kubernetes Release: 1.15.3-do.2<br>
2. Nodes running OS Debian Release: 9.11
</blockquote>



 Add the below lines (volume mounts) to the file on each of the nodes:
 ```
 /etc/systemd/system/kubelet.service 
 ```
```
-v /sbin/iscsiadm:/usr/bin/iscsiadm \
-v /lib/x86_64-linux-gnu/libisns-nocrypto.so.0:/lib/x86_64-linux-gnu/libisns-nocrypto.so.0 \
```

<b>Restart the kubelet service using the following commands:</b>
```
systemctl daemon-reload
service kubelet restart
```

To know more about provisioning cStor volume on DigitalOcean<a href="/docs/next/prerequisites.html#do"> click here</a>
<hr>


<br>
<h3><a class="anchor" aria-hidden="true" id="persistent-volumes-indefinitely-remain-in-pending-state"></a>Persistent volumes indefinitely remain in pending state</h3>
<br>
If users have a strict firewall setup on their Kubernetes nodes, the provisioning of a PV from a storageclass backed by a cStor storage pool may fail. The pool can be created without any issue and even the storage class is created, but the PVs may stay in pending state indefinitely.
<br>

The output from the `openebs-provisioner` might look as follows:

```
$ kubectl -n openebs logs openebs-provisioner-796dc9d598-k86qn
...
I1117 13:12:43.103813       1 volume.go:73] OpenEBS volume provisioner namespace openebs
I1117 13:12:43.109157       1 leaderelection.go:187] attempting to acquire leader lease  openebs/openebs.io-provisioner-iscsi...
I1117 13:12:43.117628       1 leaderelection.go:196] successfully acquired lease openebs/openebs.io-provisioner-iscsi
I1117 13:12:43.117999       1 event.go:221] Event(v1.ObjectReference{Kind:"Endpoints", Namespace:"openebs", Name:"openebs.io-provisioner-iscsi", UID:"09e04e2b-302a-454d-a160-fa384cbc69fe", APIVersion:"v1", ResourceVersion:"1270", FieldPath:""}): type: 'Normal' reason: 'LeaderElection' openebs-provisioner-796dc9d598-k86qn_f0833d66-093b-11ea-a950-0a580a2a0009 became leader
I1117 13:12:43.122149       1 controller.go:636] Starting provisioner controller openebs.io/provisioner-iscsi_openebs-provisioner-796dc9d598-k86qn_f0833d66-093b-11ea-a950-0a580a2a0009!
I1117 13:12:43.222583       1 controller.go:685] Started provisioner controller openebs.io/provisioner-iscsi_openebs-provisioner-796dc9d598-k86qn_f0833d66-093b-11ea-a950-0a580a2a0009!
I1117 13:17:11.170266       1 controller.go:991] provision "default/mongodb" class "openebs-storageclass-250gb": started
I1117 13:17:11.177260       1 event.go:221] Event(v1.ObjectReference{Kind:"PersistentVolumeClaim", Namespace:"default", Name:"mongodb", UID:"a764b1c0-105f-4f7c-a32d-88275622cb15", APIVersion:"v1", ResourceVersion:"2375", FieldPath:""}): type: 'Normal' reason: 'Provisioning' External provisioner is provisioning volume for claim "default/mongodb"
E1117 13:17:41.177346       1 volume.go:164] Error when connecting to maya-apiserver Get http://10.43.83.204:5656/latest/volumes/pvc-a764b1c0-105f-4f7c-a32d-88275622cb15: dial tcp 10.43.83.204:5656: i/o timeout
E1117 13:17:41.177446       1 cas_provision.go:111] Unexpected error occurred while trying to read the volume: Get http://10.43.83.204:5656/latest/volumes/pvc-a764b1c0-105f-4f7c-a32d-88275622cb15: dial tcp 10.43.83.204:5656: i/o timeout
W1117 13:17:41.177555       1 controller.go:750] Retrying syncing claim "default/mongodb" because failures 0 < threshold 15
E1117 13:17:41.177620       1 controller.go:765] error syncing claim "default/mongodb": failed to provision volume with StorageClass "openebs-storageclass-250gb": Get http://10.43.83.204:5656/latest/volumes/pvc-a764b1c0-105f-4f7c-a32d-88275622cb15: dial tcp 10.43.83.204:5656: i/o timeout
...
```

**Workaround:**

This issue has currently only been observed, if the underlying node uses a network bridge and if the setting `net.bridge.bridge-nf-call-iptables=1` in the `/etc/sysctl.conf` is present. The aforementioned setting is required in some Kubernetes installations, such as the Rancher Kubernetes Engine (RKE).

To avoid this issue, open the port `5656/tcp` on the nodes that run the OpenEBS API pod. Alternatively, removing the network bridge _might_ work.

<br>
<hr>
<br>


## See Also:

### [FAQs](/docs/next/faq.html)

### [Seek support or help](/docs/next/support.html)

### [Latest release notes](/docs/next/releases.html)

<br>
<hr>
<br>

