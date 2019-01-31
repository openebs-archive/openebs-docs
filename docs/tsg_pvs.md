---
id: tsgpvs
title: Troubleshooting OpenEBS Persistent Volumes
sidebar_label: Persistent Volumes
---

------

This section captures steps to troubleshoot and resolve some errors faced while using OpenEBS Persistent Volumes (PVs). The procedures and commands used in this document are mostly generic and are applicable to any common Linux platform/Kubernetes environment.

## Application pod is stuck in ContainerCreating state after deployment  

### Troubleshooting the issue and Workaround:

- Obtain the output of the `kubectl describe pod <application_pod>` and check the events.

- If the error message *executable not found in $PATH* is found, check whether the iSCSI initiator utils are installed on the node/kubelet container (rancherOS, coreOS). If not, install the same and retry deployment.

- If the warning message *FailedMount: Unable to mount volumes for pod <>: timeout expired waiting for volumes to attach/mount* is persisting use the following procedure.
  1. Check whether the Persistent Volume Claim/Persistent Volume (PVC/PV) are created successfully and the OpenEBS controller and replica pods are running. These can be verified using the `kubectl get pvc,pv` and `kubectl get pods` command.

  2. If the OpenEBS volume pods are not created, and the PVC is in pending state, check whether the storageclass referenced by the application PVC is available/installed. This can be confirmed using the `kubectl get sc` command. If this storageclass is not created, or improperly created without the appropriate attributes, recreate the same and re-deploy the application.

     **Note:** Ensure that the older PVC objects are deleted before re-deployment.

  3. If the PV is created (in bound state), but replicas are not running or are in pending state, perform a `kubectl describe <replica_pod>` and check the events. If the events indicate *FailedScheduling due to Insufficient cpu, NodeUnschedulable or MatchInterPodAffinity and PodToleratesNodeTaints*, check the following:

     - replica count is equal to or lesser than available schedulable nodes
     - there are enough resources on the nodes to run the replica pods
     - whether nodes are tainted and if so, whether they are tolerated by the OpeneEBS replica pods

     Ensure that the above conditions are met and the replica rollout is successful. This will ensure application enters running state.

  4. If the PV is created and OpenEBS pods are running, use the `iscsiadm -m session` command on the node (where the pod is scheduled) to identify whether the OpenEBS iSCSI volume has been attached/logged-into. If not, verify network connectivity between the nodes.

  5. If the session is present, identify the SCSI device associated with the session using the command `iscsiadm -m session -P 3`. Once it is confirmed that the iSCSI device is available (check the output of `fdisk -l` for the mapped SCSI device), check the kubelet and system logs including the iscsid and kernel (syslog) for information on the state of this iSCSI device. If inconsistencies are observed, execute the filesyscheck on the device `fsck -y /dev/sd<>`. This will mount the volume to the node.


- In OpenShift deployments, you can face this issue with the OpenEBS replica pods continuously restarting, that is, they are in crashLoopBackOff state. This is due to the default "restricted" security context settings. Edit the following settings using `oc edit scc restricted` to get the application pod running.
  - *allowHostDirVolumePlugin: true*
  - *runAsUser: runAsAny*

## Application pod enters CrashLoopBackOff state

This issue is due to failed application operations in the container. Typically this is caused due to failed writes on the mounted PV. To confirm this, check the status of the PV mount inside the application pod.

### Troubleshooting the issue:

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

 ### Workaround/Recovery:

  The procedure to ensure application recovery in the above cases is as follows:

  1. Resolve the system issues which caused the iSCSI disruption/RO device condition. Depending on the cause, the resolution steps may include recovering the failed nodes, ensuring replicas are brought back on the same nodes as earlier, fixing the network problems and so on.

  2. Ensure that the OpenEBS volume controller and replica pods are running successfully with all replicas in *RW mode*. Use the command `curl GET http://<ctrl ip>:9501/v1/replicas | grep createTypes`  to confirm.

  3. If anyone of the replicas are still in RO mode, wait for the synchronization to complete. If all the replicas are in RO mode (this may occur when all replicas re-register into the controller within short intervals), you must restart the OpenEBS volume controller using the `kubectl delete pod <pvc-ctrl>`  command . Since it is a Kubernetes deployment, the controller pod is restarted successfully. Once done, verify that all replicas transition into *RW mode*.

  4. Un-mount the stale iscsi device mounts on the application node. Typically, these devices are mounted in the `/var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/<target-portal:iqn>-lun-0`  path.

 ```
 Example:
 umount /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.39.241.26:
 3260-iqn.2016-09.com.openebs.jiva:mongo-jiva-mongo-persistent-storage-mongo-0-3481266901-lun-0

 umount /var/lib/kubelet/pods/ae74da97-c852-11e8-a219-42010af000b6/volumes/kuber
 netes.io~iscsi/mongo-jiva-mongo-persistent-storage-mongo-0-3481266901
 ```

  5. Identify whether the iSCSI session is re-established after failure. This can be verified using `iscsiadm -m session`, with the device mapping established using `iscsiadm -m session -P 3` and `fdisk -l`. **Note:** Sometimes, it is observed that there are stale device nodes (scsi device names) present on the Kubernetes node. Unless the logs confirm that a re-login has occurred after the system issues were resolved, it is recommended to perform the following step after doing a purge/logout of the existing session using `iscsiadm -m node -T <iqn> -u`.

  6. If the device is not logged in again, ensure that the network issues/failed nodes/failed replicas are resolved, the device is discovered, and the session is re-established. This can be achieved using the commands `iscsiadm -m discovery -t st -p <ctrl svc IP>:3260` and `iscsiadm -m node -T <iqn> -l` respectively.

  7. Identify the new SCSI device name corresponding to the iSCSI session (the device name may or may not be the same as before).

  8. Re-mount the new disk into the mountpoint mentioned earlier using the  `mount -o rw,relatime,data=ordered /dev/sd<> <mountpoint>` command. If the re-mount fails due to inconsistencies on the device (unclean filesystem), perform a filesyscheck `fsck -y /dev/sd<>`.

  9. Ensure that the application uses the newly mounted disk by forcing it to restart on the same node. Use the command  `docker stop <id>`  of the application container on the node. Kubernetes will automatically restart the pod to ensure the "desirable" state.

     While this step may not be necessary most times (as the application is already undergoing periodic restarts as part of the CrashLoop cycle), it can be performed if the application pod's next restart is scheduled with an exponential back-off delay.

**Notes:**  

1. The above procedure works for applications that are either pods or deployments/statefulsets. In case of the latter, the application pod can be restarted
(i.e., deleted) after step-4 (iscsi logout) as the deployment/statefulset controller will take care of rescheduling the application on a same/different node with the volume.

2. In environments where the kubelet runs in a container, perform the following steps as part of the recovery procedure for a Volume-Read only issue.

- Confirm that the OpenEBS target does not exist as a Read Only device by the OpenEBS controller and that all replicas are in Read/Write mode.
- Un-mount the iSCSI volume from the node in which the application pod is scheduled.
- Perform the following iSCSI operations from inside the kubelet container.
  - Logout
  - Rediscover
  - Login
- Re-mount the iSCSI device (may appear with a new SCSI device name) on the node.
- Verify if the application pod is able to start using/writing into the newly mounted device.

3. Once the application is back in "Running" state post recovery by following steps 1-9, if existing/older data is not visible (i.e., it comes up as a fresh instance), it is possible that the application pod is using the docker container filesystem instead of the actual PV (observed sometimes due to the reconciliation attempts by Kubernetes to get the pod to a desired state in the absence of the mounted iSCSI disk).
This can be checked by performing a `df -h` or `mount` command inside the application pods. These commands should show the scsi device `/dev/sd*` mounted on the specified mount point. If not, the application pod can be forced to use the PV by restarting it (deployment/statefulset) or performing  a docker stop of the application container on the node (pod).

4. In case of `XFS` formatted volumes, perform the following steps once the iSCSI target is available in RW state & logged in:

   - Un-mount the iSCSI volume from the node in which the application pod is scheduled. This may cause the application to 
     enter running state by using the local mount point.
   - Mount to volume to a new (temp) directory to replay the metadata changes in the log 
   - Unmount the volume again
   - Perform `xfs_repair /dev/<device>`. This fixes if any file system related errors on the device
   - Perform application pod deletion to facilitate fresh mount of the volume. At this point, the app pod may be stuck on 
     terminating OR containerCreating state. This can be resolved by deleting the volume folder (w/ app content) on the local directory.

## Stale data seen post application pod reschedule on other nodes

- Sometimes, stale application data is seen on the OpenEBS volume mounts after application pod reschedules. Typically, these applications are Kubernetes deployments, with the reschedule to other nodes occurring due to rolling updates.
- This occurs due to the iSCSI volume mounts and sessions staying alive/persisting on the nodes even after the pod terminates. This behavior is observed on some versions of GKE clusters (1.7.x).
- Ideally, the kubelet (iSCSI volume plugin) should bring down mounts and iscsi sessions once the application has been deleted on the node. If not, it can result in data being read off the node's page (mount) cache whenever the application is re-scheduled onto it, even though the volume is being updated while on a different node.

### Workaround:

1. Un-mount the device and logout from the existing iSCSI session on stale (non-owning) node.
2. Re-login and re-mount the volume on the current/scheduled (owning) node.
3. Ensure application pod uses the new mount by restarting it using docker stop.

## Application and OpenEBS pods terminate/restart under heavy I/O load

This is caused due to lack of resources on the Kubernetes nodes, which causes the pods to evict under loaded conditions as the node becomes *unresponsive*. The pods transition from *Running* state to *unknown* state followed by *Terminating* before restarting again.

### Troubleshooting the issue:

The above cause can be confirmed from the `kubectl describe pod` which displays the termination reason as *NodeControllerEviction*. You can get more information from the kube-controller-manager.log on the Kubernetes master.

### Workaround:

You can resolve this issue by upgrading the Kubernetes cluster infrastructure resources (Memory, CPU).

## Delete did not re-claim the disk size

Deleting OpenEBS Persistent Volume and Persistent Volume Claim did not change the disk size of the node available

### Workaround:

To reclaim space currently, you must perform a manual delete `rm -rf` of the files in */var/openebs* (or whichever path the storage pool is created on). For more information, see [this](https://github.com/openebs/openebs/issues/1436).


## Recover data from Jiva replica

This document contains notes on how to recover data from a backed up replica files. OpenEBS Jiva volumes save the data in /var/openebs/pvc-id/. All the replicas contain identical data. Before performing a cluster re-build, it suffices to have a backup of data from one of the replica's /var/openebs/pvc-id/ path.

The following procedure helps recovering data in the scenario where replicas get scheduled on nodes where data does not exist.

### Step 1: Run a sample application that generates some data.

In the following example, executing the busybox.yaml file brings up the busybox pod that saves hostname and date into the mounted OpenEBS volume.

```
kubectl apply -f https://raw.githubusercontent.com/kmova/bootstrap/master/gke-openebs/jiva-recovery/busybox.yaml
```

Wait for the busybox application to run and exec into it to check if data is generated. You can add some additional content if required.

Note the following details:
- PV id `kubectl get pv` (say _source-pv-id_ ).
- nodes on which PV replica pods are running `kubectl get pods -o wide | grep source-pv-id` (say _replica-hostname_).

Delete the busybox pod  using the `kubectl delete -f https://raw.githubusercontent.com/kmova/bootstrap/master/gke-openebs/jiva-recovery/busybox.yaml` command. Note that the data folders will remain on the nodes even though the pod and PVs are deleted.


### Step 2: Setup a Recovery PVC

Deploy a Recovery PVC with a **single replica** using the following command.

```
kubectl apply -f https://raw.githubusercontent.com/kmova/bootstrap/master/gke-openebs/jiva-recovery/recovery-pvc.yaml
```

Note the following details:
- PV id `kubectl get pv` (say _recovery-pv-id_ ).
- PV replica deployment name `kubectl get deploy | grep recovery-pv-id` (say _recovery-replica-deploy_ ).
- Recovery PVC  namespace, if you have changed it to something other than default. (say _recovery-replica-ns_).


### Step 3: Patch the Recovery PV Replica to stick to the _replica-hostname_

Replace **replica hostname** in patch-replica-dep-nodename.json with the _replica-hostname_ that was obtained in **Step 1**. It is the node where source/backed up replica data is available. If the backup data is available on a remote machine, you can set the hostname to the current node where Replica is running.

```
wget https://raw.githubusercontent.com/kmova/bootstrap/master/gke-openebs/jiva-recovery/patch-replica-dep-nodename.json

kubectl patch deploy -n <replica-replica-ns> <recovery-replica-deploy>  -p "$(cat patch-replica-dep-nodename.json)"
```

After the patch is applied, you will notice that the replica pod is restarted on the hostname specified. Since this replica deployment is patched, you will see an orphaned replica set `kubectl get rs`. You can go ahead and delete it.

### Step 4: Copy the backup data into Recovery Replica

 Execute the following commands.

```
a. ssh into the node  (_replica-hostname_)
b. cd /var/openebs/recovery-pv-id/ (/var/openebs if you are using default pool.)
c. sudo rm -rf *
d. copy contents from earlier volume (/var/openebs/source-pv-id  or from remote server) into /var/openebs/recovery-pv-id/
e. You will see *peer.details*, *revision.counter*, *volume.meta* and a bunch of *.img* and *.meta* files.
f. edit peer.details to set ReplicaCount=1
g. exit
```

### Step 5: Restart the Volume Pods

- `kubectl delete replica-pod`. Note that it gets rescheduled on the same node (_replica-hostname_).
- `kubectl delete controller-pod`. Wait for these pods to get back to running state.

### Step 6: Use the recovery volume to retrieve the data.

You can either launch the source application or a recovery application that now makes use of this recovery volume. In this example, using the busybox-recovery pod displays the file content which is the same as the one generated by the source application.

```
kubectl apply -f https://raw.githubusercontent.com/kmova/bootstrap/master/gke-openebs/jiva-recovery/busybox-recover.yaml
```

You can also exec into this application to check the content, retrieve the files, or use the application to check the content.

## Application pod is not able to mount the cStor volume in OpenEBS 0.7

In OpenEBS 0.7, unit for mentioning size in PVC should be using "G". Till OpenEBS 0.7 version, it can be used both "G" and "Gi" as the unit for mentioning size. Once you change the size in PVC as per the recommended way, your application pod will run by consuming cStor volume. 

## Jiva replica pods consume high memory utilisation and warnings in the logs

In OpenEBS older version,Jiva replica pods are consuming high memory and displays following error messages in all replica pods. This occurs every minute. 

```
time="2018-07-20T15:39:56Z" level=info msg="New connection from: 10.32.3.18:39608"
time="2018-07-20T15:39:56Z" level=error msg="Failed to read: Wrong API version received: 0xc4200f7d18"
```
### Troubleshooting the issue:

The above problem could be due to prometheus monitoring tool is trying to connect to all Jiva replica pods on 9503. By default, prometheus montioring tool polls all ports defined by all pods. In OpenEBS, Jiva controller is exporting the volume metric.  

### Workaround:

Set the following annotation to false in all the replica pods.
```
prometheus.io/scrape:"false" 
```

<!-- Hotjar Tracking Code for https://docs.openebs.io -->
<script>


```
   (function(h,o,t,j,a,r){
           h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
           h._hjSettings={hjid:785693,hjsv:6};
           a=o.getElementsByTagName('head')[0];
           r=o.createElement('script');r.async=1;
           r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
           a.appendChild(r);
   })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
```


</script>

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
