---
id: releases
title: OpenEBS Releases
sidebar_label: Releases
---

------

<br>



## 1.12.0 - Jul 15 2020

<br><font size="4">Latest Release</font><br/> (Recommended)<br/>

### Key Improvements:

- Refactor and add multi-arch image generation support on the NDM repo.
- Support specifying the webhook validation policy to fail/ignore via ENV (`ADMISSION_WEBHOOK_FAILURE_POLICY`) on admission server deployment.
- Enhanced NDM Operator to attach events to BDC CR while processing BDC operations.
- Add support for btrfs as an additional FS Type.
- Add support for a shared mount on ZFS Volume to support RWX use cases.
 

### Key Bug Fixes:

- Fixes a panic on maya-apiserver caused due to PVC names longer than 63 chars.
- Fixes an issue where the upgrade was failing some pre-flight checks when the maya-apiserver was deployed in HA mode.
- Fixes an issue where the upgrade was failing if the deployment rollout was taking longer than 5 min.

### Other Updates:

- OpenEBS Mayastor continues its momentum by adding support for Rebuild, NVMe-oF Support, enhanced supportability, and several other fixes. For detailed instructions on how to get started with Mayastor please refer to this [Quickstart guide](https://github.com/openebs/Mayastor/blob/develop/deploy/README.md).
- OpenEBS ZFS Local PV has been declared as _beta_. For detailed instructions on how to get started with ZFS Local PV please refer to the [Quick start guide](https://github.com/openebs/zfs-localpv).
- OpenEBS cStor CSI support is marked as feature-complete and further releases will focus on additional integration and e2e tests. For detailed instructions on getting started with CSI driver for cStor, please refer to the [Quick start guide](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md)

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v1.12.0)
- [Upgrade Steps](/docs/next/upgrade.html)


## 1.11.0 - Jun 15 2020

**New capabilities:**

- OpenEBS Mayastor continues its momentum by adding support for Rebuild, NVMe-oF Support, enhanced supportability and several other fixes. For detailed instructions on how to get started with Mayastor please refer to this [Quickstart guide](https://github.com/openebs/Mayastor/blob/master/doc/quick.md).
- OpenEBS ZFS Local PV has been declared as _beta_. For detailed instructions on how to get started with ZFS Local PV please refer to the [Quick start guide](https://github.com/openebs/zfs-localpv).
- OpenEBS cStor CSI support is marked as feature-complete and further releases will focus on additional integration and e2e tests. 

**Key Improvements:**

- Enhanced helm charts to make NDM `filterconfigs.state` configurable.
- Added configuration to exclude `rbd` devices from being used for creating Block Devices.
- Added support to display FSType information in Block Devices.
- Add support to mount ZFS datasets using legacy mount property to allow for multiple mounts on a single node.
- Add additional automation tests for validating ZFS Local PV and cStor Backup/Restore.

**Key Bug Fixes:**

- Fixes an issue where volumes meant to be filesystem datasets got created as zvols due to misspelled case for StorageClass parameter.
- Fixes an issue where the read-only option was not being set of ZFS volumes.
- Fixes an issue where incorrect pool name or other parameters in Storage Class would result in stale ZFS Volume CRs being created.
- Fixes an issue where the user configured ENV variable for MAX_CHAIN_LENGTH was not being read by Jiva.
- Fixes an issue where cStor Pool was being deleted forcefully before the replicas on cStor Pool were deleted. This can cause data loss in situations where SPCs are incorrectly edited by the user, and a cStor Pool deletion is attempted.
- Fixes an issue where a failure to delete the cStor Pool on the first attempt will leave an orphaned cStor custom resource (CSP) in the cluster.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v1.11.0)
- [Upgrade Steps](/docs/next/upgrade.html)

## 1.10.0 - May 15 2020

**New capabilities**
- The first release of OpenEBS Mayastor developed using NVMe based architecture, targetted at addressing performance requirements of IO-intensive workloads is ready for alpha testing. For detailed instructions on how to get started with Mayastor please refer to this [Quickstart guide](https://github.com/openebs/Mayastor/blob/master/doc/quick.md). 
- Enhancements to OpenEBS ZFS Local PV that includes resolving issues found during scale testing, fully functional CSI driver, and sample Grafana Dashboard for monitoring metrics on ZFS Volumes and Pools. For detailed instructions on how to get started with ZFS Local PV please refer to the [Quick start guide](https://github.com/openebs/zfs-localpv). 

**Key Improvements**
- Added support for cloning a cStor volume into a different namespace using remote Backup.
- Added support to enable/disable the installations of CRDs from within the OpenEBS containers.
- Optimizing the Helm values for air-gapped environments. 
- Add support for specifying custom node labels in StorageClass allowedTopologies. Supported by ZFS Local PV.

**Key Bug Fixes**
- Fixes an issue BlockDevice objects were getting created for transient devices.
- Fixes an issue where the deletion of a failed Backup would cause a panic to the Velero Plugin.
- Fixes an issue with ZFS Local PV driver registration on microk8s snap.
- Fixes an issue with pod creation problems due to slow mounting/attaching. |

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v1.10.0)
- [Upgrade Steps](/v1100/docs/next/upgrade.html)


## 1.9.0 - Apr 15 2020

**Key Improvements**
- Added support for cloning a cStor volume into a different namespace.
- Added support to upgrade multiple volumes using a single command.
- Added support for reserving block devices that can be used by Local PV.
- Added support to migrate Jiva related Kubernetes objects from PVC namespace to OpenEBS. After migration, the administrator can tighten RBAC policies for OpenEBS Service Account.
- Added support for taking out faulty Jiva replica without causing a restart to other healthy replicas.

**Key Bug Fixes**
- Fixes an issue where scheduled remote backups result in consuming extra capacity on the local storage pools. Support for re-claiming the capacity on the cStor Pools, by deleting the snapshots that have been successfully backed up to a remote location.
- Fixes an issue where some of the OpenEBS containers were using an older unsupported alpine image for base docker image.
- Fixes an issue where the Backup of cStor volumes with 50G or higher capacity to MinIO or AWS can fail.
- Fixes an issue where Jiva replica can fail to initialize due to partially written metadata file, caused by node/pod restart.
- Fixes an issue where labels added to BlockDevices were not retained for NDM pod is restarted.
- Fixes an issue where Jiva cleanup jobs were not scheduled due to nodes being tainted.
- Fixes a panic in Local PV provisioner, while processing a PV delete request with a hostname that is no longer present in the cluster.
- Fixes an issue where volumeBindingMode: WaitForFirstConsumer will make provisioning fail for cStor.

**Alpha Features**
- Support for generating automated ARM images cStor, Local PV provisioner and control plane components.
- Support for generating ppc64le images for Local PV provisioner and Jiva components.
- Support for automated e2e testing for ZFS Local PV and fixing issues reported by the alpha users.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.9.0)
- [Upgrade Steps](/v190/docs/next/upgrade.html)

## 1.8.0 - Mar 15 2020

**Key Changes**
- Added support for configuring capacity threshold limit for a cStor Pool. The default threshold limit is set at 85%. The threshold setting has been introduced to avoid a scenario where pool capacity is fully utilized, resulting in failure of all kinds of operations - including pool expansion.
- Validated that OpenEBS cStor can be used with K3OS(k3os-v0.9.0).
- Fixes an issue where Jiva volumes could cause data loss when a node restarts during an ongoing space reclamation at its replica.
- Fixes an issue where cStor restore from scheduled backup fails, if the first scheduled backup was aborted.
- Fixes an issue where upgrade scripts were failing on Mac.
- Fixes documentation references to deprecated `disk` custom resource in example YAMLs.
- Fixes documentation to include a troubleshooting section to work with api server ports blocked due to advanced network configuration.

**Alpha Features**
- Support for generating automated ARM builds for Jiva.
- Support for generating automated ppc64le builds for Node Disk Manager.
- Support for volume expansion of ZFS Local PV and add automated e2e tests.
- Support for declarative scale up and down of cstor volume replicas, increasing the e2e coverage and fixing the issue uncovered.
- Incorporate the feedback on the cStor Custom Resource Schema and work towards v1 schema.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.8.0)
- [Upgrade Steps](/v180/docs/next/upgrade.html)


## 1.7.0 - Feb 15 2020

**Change summary:**
- Fixes an issue where Jiva Replicas could get stuck in WO or NA state, when the size of the replica data grows beyond 300GB.
- Fixes an issue where unused custom resources from older versions are left in the etcd, even after openebs is upgraded. 
- Fixes an issue where cleanup of Jiva volumes on OpenShift 4.2 environment was failing.
- Fixes an issue where custom resources used by cStor Volumes fail to get deleted when the underlying pool was removed prior to deleting the volumes.
- Fixes an issue where a cStor Volume Replica would be incorrectly marked as invalid due to a race condition caused between a terminating and its corresponding newly launched pool pods. 

**Alpha Features**
- Support for generating automated ARM builds for NDM.
- Support for managing snapshot and clones of ZFS Local PV.
- Support for setting up PDB and PriorityClasses on cStor Pool Pods. Increasing the e2e coverage and fixing the issue uncovered.
- Support for resizing Jiva Volume via CSI driver and other bug fixes.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.7.0)
- [Upgrade Steps](/v170/docs/next/upgrade.html)


## 1.6.0 - Jan 15 2020

**Change summary:**
- Add support for building cStor on ARM builds by moving cstor-pool-mgmt, cstor-volume-mgmt, maya-exporter and cspi-mgmt build scripts to their specific folders and add arm build scripts.
- Add support for provisioning Local PV hostpath when the nodes are tainted. It also handles the implementation of Local PV helper pods where the cleanup pod will be launched with the tolerations.
- Enhance the logging mechanism for cStor pool pods during pool import time. These changes of logs will help to identify the existence of bad disk on the node.
- Support for enabling core dump by adding an ENV variable ENABLE_COREDUMP= “1” for cStor pool pod to control whether cores need to be dumped in case of process crashes. By default, dumping cores will be disabled. Make sure this environment variable is not enabled if mountPoint of `SparseDir` has been changed in CAS Templates.
- Enhance upgrade logs by providing pool and volume status information during the upgrade and also helps in estimating the time taken for deployment pods to come up.
-  Improves Jiva rebuilding process by checkpointing the io numbers. Now only those snapshots will be synced which has less no of io’s.
- Fixes an issue with Jiva controller by removing WO replica if new replica with greater revision count get added to controller.
- Disable core dump in NDM daemon by default. This can be enabled by setting an ENV variable `ENABLE_COREDUMP` to `1`. Core files will be stored inside /var/openebs/ndm/core.
- Fixes issues in default core dumping location for NDM. System core pattern which is common for all processes on the node will not be modified. NDM will dump the cores in a location under openebs base directory. NDM process will be launched from the openebs directory, so core files will get automatically written to the $PWD, without requiring to change the core pattern.
- Fixes an issue in NDM which caused cleanup pods not being scheduled on nodes with taints, causing BD to be stuck in release state. The fix will add tolerations for the node taints to the cleanup pod.
- Fixes an issue in `cstor-velero plugin` for getting the StorageClass name from the annotation if StorageClass is mentioned in PVC Annotation, not in PVC spec.
- Fixes an issue while cloning an filesystem based cStor volume, get the FStype info from the CAS config instead of using the default ext4 FSType.
- Fixes an issue during upgrade where image tag contains multiple “:”. This usually happens where the proxy image URL is used which can contain multiple “:”.

**Alpha Features**
- Adding support to have the ZFS Local PV Provisioner in HA mode. Default replica count is set 1 and by changing the replica count will enable a new Provisioner pod with anti-affinity so that no two pods get scheduled on the same node.
- Adding volume metric information for ZFS Local PV. These metrics can be collected using Prometheus.
- Add support for configuring volume policies such as tolerations, nodeSelector , priorityClass, resourceLimits for main and sidecar target pod containers of cStor CSI volume using CStorVolumePolicy resource.
- Add metrics support for cStor CSI volume which can be pulled by Prometheus to show the metrics in k8s cluster. Available metrics are `Total capacity`, `Used capacity` and `Available capacity` in Bytes.
- Add raw block volume support for cStor CSI volume to be attached as Raw Block Volume to pods.
- Add support for performing CSPC general validation in admission server. Some of the checks are included based on scenarios like use of duplicate block devices, duplicate nodes, block device should not be claimed by other CSPC/third party, the capacity validations of replacing block devices etc.
- Add support for new setting requests and limits to cStor pool pod sidecar containers via poolConfig. It will take default auxResource values if it is not specified in poolConfig for a particular pool. The default can be specified in `spec.auxResources.requests` and `spec.auxResources.limits`. These values will be applied for all the pool configuration mentioned in the CSPC spec. It is also possible to specify separate auxResource values to each pool separately by adding those details to the poolConfig for a particular pool.
- Configure Jiva CSI Driver to listen to custom ports for metrics.
- Add metrics support for Jiva CSI volume which can be pulled by Prometheus to show the metrics in k8s cluster. Available metrics are `Total capacity`, `Used capacity` and `Available capacity` in Bytes.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.6.0)
- [Upgrade Steps](/v160/docs/next/upgrade.html)


## 1.5.0 - Dec 15 2019

**Change summary:**
- Support BlockVolumeMode for OpenEBS Local PV backed by devices
- Support ZFS as a filesystem type for OpenEBS ZFS Local PV.
- Support for Block Device Replacement via the cStor YAML file (using new schema)
- Support resizing and remounting of Volumes when using cStor CSI Driver
- Support for generating of ARM builds for cStor Data Engine.
- Introduce block device hierarchy to NDM. 4 fields `Parent` ,`Partitions`, `Holders` and `Slaves` are used in defining the hierarchy tree of a device. Also, all the dependent devices of the discovered block device will be logged during the initial udev scan to get the disk level hierarchy of each node in the cluster. 
- Add support for applications to provision a "zfs" filesystem directly in the ZFS POOL storage which will get the optimal performance. 
- Enhanced the cStor pools to handle auto scale down scenarios to avoid shutting down the node where cStor pool is running. This is achieved by adding cluster-autoscaler.kubernetes.io/safe-to-evict": "false"  to the annotation of each cStor pool pod.
- Fixes an issue with liveness probe on `cstor-pool` container by adding a timeout setting for command execution. Setting the timeout value as 120 sec will kill the process if command exceeds more than 120 seconds.
- Fixes an issue in cStor CSI volume unit size conversion while transitioning from PVC to CVC storage capacity the way kubernetes handles, by converting to Gi.
- Fixes a bug where OpenEBS Local PV with hostpaths in OpenShift 4.1 environments was failing.
- Fixes a vulnerability issue with default helper pod image by using the latest tag for helper pods so new version of OpenEBS will automatically get updated with new images. |

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.5.0)
- [Upgrade Steps](/v150/docs/next/upgrade.html)


## 1.4.0 - Nov 15 2019

**Change summary:**
- Support for scale down of cStor volume replicas
- Support an alpha feature in NDM to add Prometheus exporter for exposing disk-level metrics. This Cluster level exporter gives details of blockdevice such as state, claim state etc.
- Support of setup arm builds for apiserver and local provisioner. The images  will be built on top of arm64v8/ubuntu:18.04.
- Supporting automated creation of TLS certificate signed by Kubernetes cluster root Certificate Authority for external admission-webhook-server. This will establish a trust to secure the communication between admission-webhook-server and kube-apiserver.
- Support the snapshot and clone feature in cStor volume provisioned via CSI provisioner. This feature will be available in alpha.
- Support of encryption feature in Local PV created on a  ZFS based storage pool.
- Support of adding topology information for Local PV on ZFS based storage pool. The details of appropriate ZFS storage pool can be mentioned in corresponding StorageClass via topology so that the scheduler will take care of scheduling the application on the appropriate node.
- Support for scheduling Local PV on appropriate ZFS storage pool on a node which has less number of Local PV volume provisioned in the given pool.
- Support of XFS file system for Local PV creation on ZFS based storage pools.
- Enhanced cStor volume description by fixing output of `knownreplicas` information which will help to maintain trusty/known replica information of the particular cStor volume in the cStor volume specification.
- Enhanced cStor volume replica status with additional 2 phases based on different scenarios. The additional phases are `NewReplicaDegraded ` and `ReconstructingNewReplica `.
- Enhanced `maya-exporter` by adding pool last sync time metric as `openebs_zpool_last_sync_time ` . This also modifies value of `openebs.io:livenesstimestamp` in cStor pool YAML to set date in epoch timestamp.
- Enhanced admission webhook server by adding missing labels in config,secret and service and will fatal out when a missing ENV's error and configs happen.
- Fixes a bug in Jiva where Jiva replica pods are stuck in `crashedloopbackoff` state after a restart.
- Fixes a bug in cStor target while rebuilding process in a single replica quorum case.
- Fixes a bug in NDM for device detection in KVM-based virtual machines.. A new disk model `QEMU_HARDDISK` is added to the list of disk models.
- Fixes a bug in NDM, where the os-disk filter was not able to exclude the blockdevices if the OS  was installed on an NVMe device.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.4.0)
- [Upgrade Steps](/v140/docs/next/upgrade.html)

## 1.3.0 - Oct 15 2019

**Change summary:**
- Add support to scaleup replicas, replica movement across  pools and replica replacement scenarios. This feature is in alpha state. This feature will work for cStor volumes which are created with existing SPC configuration.
- Availability of NDM on different platforms like amd64 and arm64. NDM can now also be compiled in ARM architecture using manual steps.
- Added support for provisioning CSI based volume using lease leader election API.
- Support of running OpenEBS in Kubernetes 1.16 version. The k8s v1.16 release will stop serving the deprecated API versions in favour of newer and more stable API versions.
- Support the addition of resource limit to cStor pool pod using with CSPC configuration. `resource` field on CSPC is used to pass resource limit and requests to `cstor-pool` container and `auxResource` field on CSPC is used to pass `resource limit` and `requests` to other 2 containers such as `cstor-mgmt` and `m-exporter`.
- Enhanced backup capability of openebs-velero plugin by checking the status of `Healthy` cStor Volume Replica. In the previous version, a check was performed for healthy CVR during setup only. There might be some chances of cStor pod restart and CVR becomes degraded when we trigger the backup.
- Enhanced CVC(cStor Volume Claim) CR by adding provisioning failure events while provisioning cStor volume using CSI provisioner. 
- Fixed a bug where cStor volume becoming read-only due to restart of  cstor-volume-mgmt container alone in the target pod.
- Fixed wrong status on CVR from Duplicate to Online. Duplicate state on CVR was blocking reconcile on the volume creation in ephemeral case.
- Fixed a bug in cStor storage pool YAML. The livenessProbe command  `zfs set io.openebs:livenesstimestamp`  sets the value of io.openebs:livenesstimestamp to the current timestamp. In previous versions, this value was not set properly because of some shell quoting  issues in the command.
- Fixed a bug where Jiva volume running on CentOS 7 / RHEL in OpenShift cluster is going to read-only when the controller pod is restarted either due to node restart or upgrades or any other reason. This is due to iSCSI default timeout is replaced with 5 sec if multipath support is enabled on the node.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.3.0)
- [Upgrade Steps](/v130/docs/next/upgrade.html)


## 1.2.0 - Sep 10 2019

**Change summary:**
- CSI Driver for cStor Volumes (currently in Alpha) has added support for resizing and volume expansion feature.
- The new version of cStor Schema has been introduced to address the user feedback in terms of ease of use for cStor provisioning as well as to make a way in the schema to perform Day 2 Operations using GitOps.
- Enhanced error logging of cStor storage pool with a new format for automatic alert generation.
- Enhanced Jiva internal snapshot deletion when a number of internal snapshots are more than 10. The deletion happens automatically one by one.
- Enhanced velero-plugin to support backup/restore for OpenEBS installed in a different namespace other than `openebs` namespace.
- Enhanced NDM to include NodeAttributes in BD and BDC. This will support storing of node name along with the hostname on the BD and BDC CRs.
- Fixes BlockDevice CRD by adding node name to the printer column. This feature will get the name of the node to which the BD is attached while performing `kubectl get bd -n <openebs_installed_namespace>`.
- Fixes a bug in Jiva when patching and clean up operation of Jiva deployments are failing on Nodes where `hostname` is not the same as `nodename`. The fix will set nodeSelector in deployment and clean-up job after converting the nodename into hostname.
- Support of provisioning Local PV in clusters where `nodename` and `hostname` are different.
- Support customization of default hostpath for Jiva and Local PV. With the current implementation, customization will not persisted when a restart happened on the Node where maya-apiserver pod is running or when maya-apiserver pod is restarted.
- Fixes a bug in NDM where all devices on a node were getting excluded when os-disk-exclude-filter is failed to find the device where OS is installed.
- Fixes a bug in snapshot controller where snapshot operation is not throwing any error for invalid `cas-type`. This fix will add `cas-type` validation before triggering the snapshot operations. The valid `cas-type` are cStor and Jiva.
- Fixes the bug where more than required BlockDevicesClaims are created for requested SPC in auto pool method.
- Fixes an issue in maya-api installer to skip re-apply of default SPC and SC resources if they were installed previously by older version(s) of maya or prior to mayaapi-server restart(s) 
- Fixes a bug in cStor pool when cStor Storage Pool management creates pool if pool import failed when a disk is not accessible momentarily just at the time of import. cStor storage pool will be in the pending state when this scenario occurs. This PR will fix cStor pool creation by looking on `Status.Phase` as `Init` or `PoolCreationFailed` to create the pool. If `Status.Phase` is any other string, cStor Storage Pool management will try to import the pool. This can cause impact to the current workflow of Ephemeral disks, which works as of now, as NDM can't detect it as different disk and recognizes as the previous disk.
- Fixes a bug during a cleanup operation performed on BlockDevice and clean up job is not getting canceled when the state of BlockDevice is changed from `Active` to other states. 
- Fixes a bug in NDM where cleanup jobs remain in pending state in Openshift cluster. The fix will add service account to cleanup jobs, so that clean-up job pods acquire privileged access to perform the action. 

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.2.0)
- [Upgrade Steps](/v120/docs/next/upgrade.html)


## 1.1.0 - Aug 03 2019

**Change summary:**
- Support for an alpha version of CSI driver with limited functionality for provisioning and de-provisioning of cStor volumes.
- Support for the upgrade of OpenEBS storage pools and volumes through Kubernetes Job. As a user, you no longer have to download scripts to upgrade from 1.0 to 1.1, like in earlier releases.
- Enhanced Prometheus metrics exported by Jiva for identifying whether an iSCSI Initiator is connected to Jiva target.
- Enhanced NDM operator capabilities for handling NDM CRDs installation and upgrade. Earlier this process was handled through maya-apiserver. 
- Enhanced velero-plugin to take backup based on the `openebs.io/cas-type:cstor` and it will skip backup for unsupported volumes(or storage providers).
- Enhanced velero-plugin to allow users to specify a `backupPathPrefix` for storing the volume snapshots in a custom location. This allows users to save/backup configuration and volume snapshot data under the same location.
- Added an ENV flag which can be used to disable default config creation. The default storage configuration can be modified after installation, but it is going to be overwritten by the OpenEBS API Server.The recommended approach for customizing is to create their own storage configuration using the default options as examples/guidance.
- Fixes an issue where rebuilding cStor volume replica failed if the cStor volume capacity was changed after the initial provisioning of the cStor volume.
- Fixes an issue with cStor snapshot taken during transition of replica's rebuild status.
- Fixes an issue where application file system was breaking due to the deletion of Jiva auto-generated snapshots.
- Fixes an issue where NDM pod was getting restarted while probing for details from the devices that had write cache supported.
- Fixes an issue in NDM where Seachest probe was holding open file descriptors to LVM devices and LVM devices were unable to detach from the Node due to NDM hold on device.
- Fixes a bug where backup was failing where `openebs operator` was installed through helm. `velero-plugin` was checking `maya-apiserver` name and it was different when you have installed via helm based method. Updated velero-plugin to check label of maya-apiserver service name.


**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.1.0)
- [Upgrade Steps](/v110/docs/next/upgrade.html)


## 1.0.0 - Jun 22 2019

**Change summary:**
- Introduced a cluster level component called NDM operator to manages the access to block devices, selecting & binding BD to BDC, cleaning up the data from the released BD.
- Support for using Block Devices for OpenEBS Local PV.
- Enhanced cStor Data Engine to allow interoperability of cStor Replicas across different versions.
- Enhanced the cStor Data Engine containers to contain troubleshooting utilities.
- Enhanced the metrics exported by cStor Pools to include details of the provisioning errors.
- Fixes an issue where cStor replica snapshots created for the rebuild were not deleted, causing space reclamation to fail.
- Fixes an issue where cStor volume used space was showing a very low value than actually used.
- Fixes an issue where Jiva replicas failed to register with its target if there was an error during initial registration.
- Fixes an issue where NDM would create a partitioned OS device as a block device.
- Fixes an issue where Jiva replica data was not clean up if the PVC and its namespace were deleted prior to scrub job completion.
- Fixes an issue where Velero Backup/Restore was not working with hostpath Local PVs.
- Upgraded the base ubuntu images for the containers to fix the security vulnerabilities reported in Ubuntu Xenial.
- Custom resource (Disk) used in earlier releases has been changed to Block Device. 

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/1.0.0)
- [Release Blog](https://openebs.io/blog/openebs-announces-the-availability-of-version-1-0/)
- [Upgrade Steps](/v100/docs/next/upgrade.html)



<br>

## See Also:

### [OpenEBS Upgrade](/docs/next/upgrade.html)

### [OpenEBS 0.x Releases](/docs/next/releases-0x.html)

### [OpenEBS FAQ](/docs/next/faq.html)

### [Container Attached Storage or CAS](/docs/next/cas.html)

<br><hr>

<br>

