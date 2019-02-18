---
id: troubleshooting
title: Troubleshooting OpenEBS
sidebar_label: Troubleshooting
---
------

<font size="5">General guidelines for troubleshooting</font>

Connecting Kubernetes cluster to MayaOnline is the simplest and easiest way to monitor OpenEBS resources and volumes. Logs of OpenEBS pods available at MayaOnline are helpful for troubleshooting. Topology views of OpenEBS custom resources provide the live status which are helpful in the troubleshooting process.



**Steps for troubleshooting:**

- Join <a href="https://slack.openebs.io" target="_blank">OpenEBS slack </a>community
- Connect Kubernetes cluster to MayaOnline and observe the following
  - Any alerts that may be relevant to the issue under troubleshooting 
  - Logs that throw up any errors
  - Status of custom resources of OpenEBS volumes in the topology view
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>

<font size="5">Areas of troubleshooting</font>

**Installation**

[Installation failed because insufficient user rights](#install-failed-user-rights)

[iSCSI client is not setup on Nodes. Application Pod is in ContainerCreating state.](#install-failed-iscsi-not-configured)

[Why does OpenEBS provisioner pod restart continuously?](#openebs-provsioner-restart-continuously)

[OpenEBS installation fails on Azure](#install-failed-azure-no-rbac-set).

[A multipath.conf file claims all SCSI devices in OpenShift](#multipath-conf-claims-all-scsi-devices-openshift)

**Volume provisioning**

[Appliation complaining ReadOnly filesystem](#application-read-only)

[Application pods are not running when OpenEBS volumes are provisioned on Rancher](#application-pod-not-running-Rancher)

[Application pod is stuck in ContainerCreating state after deployment](#application-pod-stuck-after-deployment)

[Creating cStor pool fails on CentOS when there are partitions on the disk](#cstor-pool-failed-centos-partion-disk)

[Application pod enters CrashLoopBackOff state](#application-crashloopbackoff)

[cStor pool pods are not running](#cstor-pool-pod-not-running)

[OpenEBS Jiva PVC is not provisioning in 0.8.0](#Jiva-provisioning-failed-080)

[Recovery procedure for Read-only volume where kubelet is running in a container](#recovery-readonly-when-kubelet-is-container)

[Recovery procedure for Read-only volume for XFS formatted volumes](#recovery-readonly-xfs-volume)



**Upgrades**



**Kubernetes related**

[Kubernetes node reboots because of increase in memory consumed by Kubelet](#node-reboot-when-kubelet-memory-increases)

[Application and OpenEBS pods terminate/restart under heavy I/O load](#Pods-restart-terminate-when-heavy-load)



## Installation

<h3><a class="anchor" aria-hidden="true" id="install-failed-user-rights"></a>Installation failed because insufficient user rights</h3>



text goes here



<h3><a class="anchor" aria-hidden="true" id="install-failed-iscsi-not-configured"></a>iSCSI client is not setup on Nodes. Pod is in ContainerCreating state.</h3>

<Todo>

<h3><a class="anchor" aria-hidden="true" id="openebs-provsioner-restart-continuously"></a>Why does OpenEBS provisioner pod restart continuously?</h3>

<Todo>

<h3><a class="anchor" aria-hidden="true" id="install-failed-azure-no-rbac-set"></a>OpenEBS installation fails on Azure</h3>

On AKS, while installing OpenEBS using Helm,  you may seen the following error.

```
$ helm installstable/openebs --name openebs --namespace openebs
Error: release openebsfailed: clusterroles.rbac.authorization.k8s.io "openebs" isforbidden: attempt to grant extra privileges:[PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["nodes"],APIGroups:["*"], Verbs:["list"]}PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["watch"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["get"]}PolicyRule{Resources:["nodes/proxy"], APIGroups:["*"],Verbs:["list"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["watch"]}PolicyRule{Resources:["namespaces"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["services"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["pods"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["deployments"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["events"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["endpoints"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["persistentvolumes"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["persistentvolumeclaims"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["storageclasses"],APIGroups:["storage.k8s.io"], Verbs:["*"]}PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["list"]} PolicyRule{NonResourceURLs:["/metrics"],Verbs:["get"]}] user=&{system:serviceaccount:kube-system:tiller6f3172cc-4a08-11e8-9af5-0a58ac1f1729 [system:serviceaccounts system:serviceaccounts:kube-systemsystem:authenticated] map[]} ownerrules=[]ruleResolutionErrors=[clusterroles.rbac.authorization.k8s.io"cluster-admin" not found]
```

**Troubleshooting**

You must enable RBAC on Azure before OpenEBS installation. For more details, see [Prerequisites](https://github.com/openebs/openebs-docs/blob/master/docs/next/prerequisites.html).

<h3><a class="anchor" aria-hidden="true" id="multipath-conf-claims-all-scsi-devices-openshift"></a>A multipath.conf file claims all SCSI devices in OpenShift</h3>

A multipath.conf file without either find_multipaths or a manual blacklist claims all SCSI devices.

**<font size="4">Workaround</font>:**

1. Add the find_multipaths line to */etc/multipath.conf* file similar to the following snippet.

   ```
   defaults {
       user_friendly_names yes
       find_multipaths yes
   }
   ```

2. Run `multipath -w /dev/sdc` command (replace the devname with your persistent devname).



<font size="6" color="green">Volume provisioning</font>

<h3><a class="anchor" aria-hidden="true" id="application-read-only"></a> Appliation complaining ReadOnly filesystem</h3>

<Todo>

<h3><a class="anchor" aria-hidden="true" id="application-pod-not-running-Rancher"></a>Application pods are not running when OpenEBS volumes are provisioned on Rancher</h3>

The setup environment where the issue occurs is rancher/rke with bare metal hosts running CentOS. After installing OpenEBS, OpenEBS pods are running, but application pod is in *ContainerCreating* state. The output of `kubectl get pods` is displayed as follows.

```
NAME                                                             READY     STATUS              RESTARTS   AGE
nginx-deployment-57849d9f57-gvzkh                                0/1       ContainerCreating   0          2m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-ctrl-58dcdf997f-n4kd9   2/2       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-gq4z6    1/1       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-hwx52    1/1       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-vs97n    1/1       Running             0          8m
```

**Troubleshooting**

SCSI package is installed on both Host and RKE kubelet.

```
[root@node-34622 ~]# iscsiadm -V
iscsiadm version 6.2.0.874-7
[root@node-34622 ~]# docker exec kubelet iscsiadm -V
iscsiadm version 2.0-874
```

If output returns iscsiadm version for both commands, then you have to remove iSCSI from the node. You will find the resolution method from [here](/docs/next/iscsiclient.html#aks).

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
     - whether nodes are tainted and if so, whether they are tolerated by the OpeneEBS replica pods

     Ensure that the above conditions are met and the replica rollout is successful. This will ensure application enters running state.

  4. If the PV is created and OpenEBS pods are running, use the `iscsiadm -m session` command on the node (where the pod is scheduled) to identify whether the OpenEBS iSCSI volume has been attached/logged-into. If not, verify network connectivity between the nodes.

  5. If the session is present, identify the SCSI device associated with the session using the command `iscsiadm -m session -P 3`. Once it is confirmed that the iSCSI device is available (check the output of `fdisk -l` for the mapped SCSI device), check the kubelet and system logs including the iscsid and kernel (syslog) for information on the state of this iSCSI device. If inconsistencies are observed, execute the filesyscheck on the device `fsck -y /dev/sd<>`. This will mount the volume to the node.

- In OpenShift deployments, you may face this issue with the OpenEBS replica pods continuously restarting, that is, they are in crashLoopBackOff state. This is due to the default "restricted" security context settings. Edit the following settings using `oc edit scc restricted` to get the application pod running.

  - *allowHostDirVolumePlugin: true*
  - *runAsUser: runAsAny*

<h3><a class="anchor" aria-hidden="true" id="cstor-pool-failed-centos-partion-disk"></a>Creating cStor pool fails on CentOS when there are partitions on the disk.</h3>

Creating cStor pool fails with the following error message:

```
E0920 14:51:17.474702       8 pool.go:78] Unable to create pool: /dev/disk/by-id/ata-WDC_WD2500BPVT-00JJ
```

sdb and sdc are used for pool.

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
   
   umount /var/lib/kubelet/pods/ae74da97-c852-11e8-a219-42010af000b6/volumes/kuber
   netes.io~iscsi/mongo-jiva-mongo-persistent-storage-mongo-0-3481266901
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

cstor disk pods are not coming up now. On checking the pool pod logs, it says `/dev/xvdg is in use and contains a xfs filesystem.`

**Workaround:**

cStor can consume disks that are attached (are visible to OS as SCSI devices) to the Nodes and no need of format these disks. This means disks should not have any filesystem and it should be unmounted on the Node. It is optional to wipe out the data from the disk if you use existing disks for cStor pool creation.

<h3><a class="anchor" aria-hidden="true" id="Jiva-provisioning-failed-080"></a>OpenEBS Jiva PVC is not provisioning in 0.8.0</h3>

Even all OpenEBS pods are in running state, unable to provision JIva volume if you install through helm.

**Troubleshooting:**

Check the latest logs showing in the OpenEBS provisioner logs. If the particular PVC creation entry is not coming on the OpenEBS provisioner pod, then restart the OpenEBS provisioner pod. From 0.8.1 version, liveness probe feature will check the OpenEBS provisioner pod status periodically and ensure its availability for OpenEBS PVC creation.

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



<font size="6" color="orange">Upgrades</font>

<hr>
<br>
<Todo>


<font size="6" color="red">Kubernetes related</font>

<hr>
<h3><a class="anchor" aria-hidden="true" id="node-reboot-when-kubelet-memory-increases"></a>Kubernetes node reboots because of increase in memory consumed by Kubelet</h3>

<To do>

<h3><a class="anchor" aria-hidden="true" id="Pods-restart-terminate-when-heavy-load"></a>Application and OpenEBS pods terminate/restart under heavy I/O load</h3>

This is caused due to lack of resources on the Kubernetes nodes, which causes the pods to evict under loaded conditions as the node becomes *unresponsive*. The pods transition from *Running* state to *unknown* state followed by *Terminating* before restarting again.

**Troubleshooting**

The above cause can be confirmed from the `kubectl describe pod` which displays the termination reason as *NodeControllerEviction*. You can get more information from the kube-controller-manager.log on the Kubernetes master.

**Workaround:**

You can resolve this issue by upgrading the Kubernetes cluster infrastructure resources (Memory, CPU).

<br>



<br><br>

## See Also:

### [FAQs](/docs/next/faq.html)

### [Seek support or help](/docs/next/support.html)

### [Latest release notes]()

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
