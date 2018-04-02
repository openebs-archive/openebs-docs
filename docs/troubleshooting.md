---
id: troubleshooting
title: OpenEBS - Troubleshooting
sidebar_label: Troubleshooting
---
The following topics are covered in this chapter.

* [Overview](#Overview)
* [Installation](#Installation)
* [Storage Classes](#StroageClasses)
* [Storage Pools](#StoragePools)
* [Accessing Logs](#AccessingLogs)
* <a class="flip" onclick=myshowfunction()>Persistent Volumes</a>
<script>
	function myshowfunction()
	{
		var element = document.getElementById("panel");
		if (element.style.display != "none")
		{
			element.style.display="none";
		}
		else
		{
			element.style.display="block";
		}
	}
</script>
<ul id="panel" style="display: none; margin-left: 20px">
	<li style="color: #f1584d"><a href="#ContainerCreating">Application pod is stuck in ContainerCreating state after deployment</a></li>
	<li style="color: #f1584d"><a href="#CrashLoopBackOff">Application pod enters CrashLoopBackOff state</li>
	<li style="color: #f1584d"><a href="#StaleData">Stale data seen post application pod reschedule on other nodes</li>
	<li style="color: #f1584d"><a href="#TerminateRestart">Application and OpenEBS pods terminate/restart under heavy I/O load</li>
</ul>

* [Recover from hardware failures](#RecoverHardwareFailures)
* [Recover from node failures](#RecoverNodeFailures)
* [Maintenance and cleanup](#MaintClean)
* [Miscellaneous](#Miscellaneous)

# Overview  <a name="Overview"></a>
This section provides information to help you troubleshoot common problems.

The list of OpenEBS issues and their workarounds are available either at the OpenEBS Slack channel or at the OpenEBS GitHub repository. Go to the following links to view the list of OpenEBS issues.

- [OpenEBS issues on Slack](https://openebs-community.slack.com/messages/C4VAJUVPG/)
- [OpenEBS issues on GitHub](https://github.com/openebs/openebs/issues)

If your problem is not answered in any of the above URLs, you can refer to the documentation where the Components and Architecture section explains the OpenEBS architecture and how each component works, while the [Setup](overview.html) section provides practical instructions for setting up OpenEBS. The sections under Troubleshooting covers troubleshooting the issues and workarounds. If the procedures provided are not helpful in resolving the problem, please raise an issue and/or join the #openebs-users slack channel. The team at OpenEBS will be happy to help !!

Contributions are welcome to add procedures for scenarios/environments not covered !!

## Bugs and Feature Requests

If you have what looks like a bug, or you would like to make a feature request, please use the [GitHub Issue Tracking System](https://github.com/openebs/openebs/issues).

Before you file an issue, please search existing issues to see if your issue is already covered.

# Installation <a name="Installation"></a>

Content to be added

# Storage Classes <a name="StorageClasses"></a>

Content to be added


# Storage Pools <a name="StoragePools"></a>

Content to be added

# Accessing Logs <a name="AccessingLogs"></a>

Content to be added

## Overview of OpenEBS Logger 

Logger is a Kubernetes job which can be run on a cluster to extract pod logs and cluster information. It helps in troubleshoot/debugging activities. Logger runs the logger container *openebs/logger* and it is recommended to run for a specific duration to capture logs while attempting to reproduce issues.

### Benefits

Following are the benefits of using Logger.

- The purpose of Logger is to obtain debug-information/quick logs in clusters where more standard logging frameworks like EFK are not already configured. Logger creates a simple support bundle which can be provided to debug teams.
- This may be the case with most "non-production/development" infrastructures.

### Where is the Logger found?

You can find the Logger file at [https://github.com/openebs/test-storage/blob/master/logger/debugjob.yaml](https://github.com/openebs/test-storage/blob/master/logger/debugjob.yaml).

### How does Logger work?

Logger uses the following tool/command to work.

- Logger uses a **stern** tool to collect the pod logs.
- It uses kubectl commands to extract cluster information.

### Prerequisite

Logger requires the *kubeconfig* file mounted as a configmap (passed to stern binary). *kubeconfig* file is generally found under */etc/kubernetes/admin.conf* or *~/.kube/config* path.

## Running Logger

The following procedure helps you run Logger.

1. In the logger job's command, edit the logging duration (-d) and pod regex (-r) to specify which pods' logs should be captured and for how long. 

  For example, in the  `./logger.sh -d 5 -r maya,openebs,pvc;` command, the logs for pods starting with literals "maya", "openebs" and "pvc" are captured for a period of 5 minutes.

   **Note:** The duration is arrived depending on the average time taken for the bug to manifest from the time a pod starts.

2. Create a Kubernetes job to run logger using the `kubectl apply -f debugjob.yaml` command.

3. This job will run for the duration specified in the previous steps.

4. The logs thus collected are placed in a logbundle (tarball) in */mnt* directory of the node in which the debug pod was scheduled.

5. Logs will be available in the node in which the debug pod/logger is scheduled when you run  a `kubectl get pod -o wide` command.

6. Attach this log support bundle while raising issues on the OpenEBS repository.

# Issues in Persistent Volumes <a name="PersistentVolumes"></a>

This section captures steps to troubleshoot and resolve some errors faced while using OpenEBS Persistent Volumes (PVs). The procedures and commands used in this document are mostly generic and are applicable on any common Linux platform/Kubernetes environment.

The following issues are covered in this section.

[Application pod is stuck in ContainerCreating state after deployment](#ContainerCreating)

[Application pod enters CrashLoopBackOff state](#CrashLoopBackOff)

[Stale data seen post application pod reschedule on other nodes](#StaleData)

[Application and OpenEBS pods terminate/restart under heavy I/O load](#TerminateRestart)

**Issue:**
## Application pod is stuck in *ContainerCreating* state after deployment <a name="ContainerCreating"></a>

**Troubleshooting the issue and Workaround:**
* Obtain the output of the kubectl describe pod <application_pod> and check the events.

* If the error message executable not found in $PATH is found, check whether the iSCSI initiator utils are installed on the node/kubelet container (rancherOS, coreOS). If not, install the same and retry deployment.

* If the warning message FailedMount: Unable to mount volumes for pod <>: timeout expired waiting for volumes to attach/mount is persisting use the following procedure.

  1. Check whether the Persistent Volume Claim/Persistent Volume (PVC/PV) are created successfully and the OpenEBS controller and replica pods are running. These can be verified using the kubectl get pvc,pv and kubectl get pods command.

  2. If the OpenEBS volume pods are not created, and the PVC is in pending state, check whether the storageclass referenced by the application PVC is available/installed. This can be confirmed using the kubectl get sc command. If this storageclass is not created, or improperly created without the appropriate attributes, recreate the same and re-deploy the application.

  **Note:** Ensure that the older PVC objects are deleted before re-deployment.

  3. If the PV is created (in bound state), but replicas are not running or are in pending state, perform a kubectl describe <replica_pod> and check the events. If the events indicate FailedScheduling due to Insufficient cpu, NodeUnschedulable or MatchInterPodAffinity and PodToleratesNodeTaints, check the following:

  * replica count is equal to or lesser than available schedulable nodes
  * there are enough resources on the nodes to run the replica pods
  * whether nodes are tainted and if so, whether they are tolerated by the OpeneEBS replica pods

Ensure that the above conditions are met and the replica rollout is successful. This will ensure application enters running state.

  4. If the PV is created and OpenEBS pods are running, use the iscsiadm -m session command on the node (where the pod is scheduled) to identify whether the OpenEBS iSCSI volume has been attached/logged-into. If not, verify network connectivity between the nodes.

  5. If the session is present, identify the SCSI device associated with the session using the command iscsiadm -m session -P 3. Once it is confirmed that the iSCSI device is available (check the output of fdisk -l for the mapped SCSI device), check the kubelet and system logs including the iscsid and kernel (syslog) for information on the state of this iSCSI device. If inconsistencies are observed, execute the filesyscheck on the device fsck -y /dev/sd<>. This will mount the volume to the node.

* In OpenShift deployments, you can face this issue with the OpenEBS replica pods continuously restarting, that is, they are in crashLoopBackOff state. This is due to the default "restricted" security context settings. Edit the following settings using oc edit scc restricted to get the application pod running.

  - allowHostDirVolumePlugin: true
  - runAsUser: runAsAny

**Issue:** 
## Application pod enters CrashLoopBackOff state <a name="CrashLoopBackOff"></a>
This issue is due to failed application operations in the container. Typically this is caused due to failed writes on the mounted PV. To confirm this, check the status of the PV mount inside the application pod.

**Troubleshooting the issue:**

* Perform a `kubectl exec -it <app> bash` (or any available shell) on the application pod and attempt writes on the volume mount. The volume mount can be obtained either from the application specification ("volumeMounts" in container spec) or by performing a `df -h` command in the controller shell (the OpenEBS iSCSI device will be mapped to the volume mount).

* The writes can be a attempted using a simple command like `echo abc > t.out` on the mount. If the writes fail with Read-only file system errors, it means the iSCSI connections to the OpenEBS volumes are lost. You can confirm by checking the node's system logs including iscsid, kernel (syslog) and the kubectl logs (`journalctl -xe, kubelet.log`).

* iSCSI connections usually fail due to the following.

  - flaky networks (can be confirmed by ping RTTs, packet loss etc.) or failed networks between -
    * OpenEBS PV controller and replica pods
    * Application and controller pods
  - Node failures
  - OpenEBS volume replica crashes or restarts due to software bugs

* In all the above cases, loss of the device for a period greater than the node iSCSI initiator timeout causes the volumes to be re-mounted as RO.

* In certain cases, the node/replica loss can lead to the replica quorum not being met (i.e., less than 51% of replicas available) for an extended period of time, causing the OpenEBS volume to be presented as a RO device.

**Workaround/Recovery:**
The procedure to ensure application recovery in the above cases is as follows:

1. Resolve the system issues which caused the iSCSI disruption/RO device condition. Depending on the cause, the resolution steps may include recovering the failed nodes, ensuring replicas are brought back on the same nodes as earlier, fixing the network problems and so on.

2. Ensure that the OpenEBS volume controller and replica pods are running successfully with all replicas in RW mode. Use the command `curl GET http://<ctrl ip>:9501/v1/replicas | grep createTypes` to confirm.

3. If any one of the replicas are still in RO mode, wait for the synchronization to complete. If all the replicas are in RO mode (this may occur when all replicas re-register into the controller within short intervals), you must restart the OpenEBS volume controller using the `kubectl delete pod <pvc-ctrl>` command . Since it is a Kubernetes deployment, the controller pod is restarted successfully. Once done, verify that all replicas transition into RW mode.

4. Un-mount the stale iscsi device mounts on the application node. Typically, these devices are mounted in the `/var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/<target-portal:iqn>-lun-0` path.

5. Identify whether the iSCSI session is re-established after failure. This can be verified using `iscsiadm -m session`, with the device mapping established using `iscsiadm -m session -P 3` and `fdisk -l`. **Note:** Sometimes, it has been observed that there are stale device nodes (scsi device names) present on the Kubernetes node. Unless the logs confirm that a re-login has occurred once the system issues were resolved, it is recommended to perform the following step after doing a purge/logout of the existing session using `iscsiadm -m node -T <iqn> -u`.

6. If the device is not logged in again, ensure that the network issues/failed nodes/failed replicas are resolved, device is discovered, and session is re-established. This can be achieved using the commands `iscsiadm -m discovery -t st -p <ctrl svc IP>:3260` and `iscsiadm -m node -T <iqn> -l` respectively.

7. Identify the new SCSI device name corresponding to the iSCSI session (the device name may or may not be the same as before).

8. Re-mount the new disk into the mountpoint mentioned earlier using the `mount -o rw,relatime,data=ordered /dev/sd<> <mountpoint>` command. If the re-mount fails due to inconsistencies on the device (unclean filesystem), perform a filesyscheck `fsck -y /dev/sd<>`.

9. Ensure that the application uses the newly mounted disk by forcing it to restart on the same node. Use the command `docker stop <id>` of the application container on the node. Kubernetes will automatically restart the pod to ensure the "desirable" state.

  While this step may not be necessary most times (as the application is already undergoing periodic restarts as part of the CrashLoop cycle), it can be performed if the application pod's next restart is scheduled with an exponential back-off delay.

**Note:** In environments where the kubelet runs in a container, perform the following steps as part of the recovery procedure for a Volume-Read only issue.

* Confirm that the OpenEBS target does not exist as a Read Only device by the OpenEBS controller and that all replicas are in Read/Write mode.
* Un-mount the iSCSI volume from the node in which the application pod is scheduled.
* Perform the following iSCSI operations from inside the kubelet container.
  - Logout
  - Rediscover
  - Login
* Re-mount the iSCSI device (may appear with a new SCSI device name) on the node.
* Verify if the application pod is able to start using/writing into the newly mounted device.

**Issue:**
## Stale data seen post application pod reschedule on other nodes <a name="StaleData"></a>

* Sometimes, stale application data is seen on the OpenEBS volume mounts after application pod reschedule. Typically, these applications are Kubernetes deployments, with the reschedule to other nodes occurring due to rolling updates.

* This occurs due to the iSCSI volume mounts and sessions staying alive/persisting on the nodes even after the pod terminates. This behavior is observed on some versions of GKE clusters (1.7.x).

* Ideally, the kubelet (iSCSI volume plugin) should bring down mounts and iscsi sessions once the application has been deleted on the node. If not, it can result in data being read off the node's page (mount) cache whenever the application is re-scheduled onto it, even though the volume is being updated while on a different node.

**Workaround:**
1. Un-mount the device and logout from the existing iSCSI session on stale (non-owning) node.
2. Re-login and re-mount the volume on the current/scheduled (owning) node.
3. Ensure application pod uses the new mount by restarting it using docker stop.

**Issue:**
## Application and OpenEBS pods terminate/restart under heavy I/O load <a name="TerminateRestart"></a>
This is caused due to lack of resources on the Kubernetes nodes, which causes the pods to evict under loaded conditions as the node becomes unresponsive. The pods transition from Running state to unknown state followed by Terminating before restarting again.

**Troubleshooting the issue:**
The above cause can be confirmed from the `kubectl describe pod` which displays the termination reason as NodeControllerEviction. You can get more information from the *kube-controller-manager.log* file on the Kubernetes master.

**Workaround:**
You can resolve this issue by upgrading the Kubernetes cluster infrastructure resources (Memory, CPU).

# Recover from hardware failures <a name="RecoverHardwareFailures"></a>

# Recover from node failures <a name="RecoverNodeFailures"></a>

# Maintenance and cleanup <a name="MaintClean"></a>

# Miscellaneous <a name="Miscellaneous"></a>


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
