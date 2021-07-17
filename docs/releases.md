---
id: releases
title: OpenEBS Releases
sidebar_label: Releases
---

------

## 2.11.0 - Jul 15 2021
<br><font size="4">Latest Release</font><br/> (Recommended)<br/>

OpenEBS v2.11 is another maintenance release before moving towards 3.0 primarily focusing on enhancing the E2E tests, build, release workflows, and documentation. This release also includes enhancements to improve the user experience and fixes for bugs reported by users and E2E tools. There has been some significant progress made on the alpha features as well. 

---

**Deprecation Notice**:  Jiva and cStor `out-of-tree external` provisioners will be deprecated by Dec 2021 in favor of the corresponding CSI Drivers. The out of tree provisioners for Jiva and cStor will stop working from Kubernetes 1.22 and forward as the version of the custom resources used by those provisioners will be deprecated. We strongly recommend you plan for migrating your volumes to [cStor CSI](https://github.com/openebs/upgrade/blob/master/docs/migration.md) or [Jiva CSI](https://github.com/openebs/upgrade/blob/master/docs/migration.md#migrating-jiva-external-provisioned-volumes-to-jiva-csi-volumes-experimental) as early as possible.  

If you have any questions or need help with the migration please reach out to us on our Kubernetes Community slack channel [#openebs](https://kubernetes.slack.com/archives/CUAKPFU78).

---

### Key Improvements
- [CLI](https://github.com/openebs/openebsctl/blob/develop/README.md) has been enhanced to provide additional information about OpenEBS storage components like: 
  - Block devices managed by OpenEBS  (`kubectl openebs get bd`)
  - Jiva Volumes 
  - LVM Local PV Volumes
  - ZFS Local PV Volumes
- [Monitoring helm chart](https://github.com/openebs/monitoring) has been updated to include a workload dashboard for LVM Local PV. In addition new alert rules related to PVC status are supported. 
- [LVM Local PV](https://github.com/openebs/lvm-localpv) has been enhanced to allow users to configure the size that should be reserved for LVM snapshots. By default, the size reserved for a snapshot is equal to the size of the volume. In cases, where snapshots are created for backup purposes, the snapshots may not require the entire space. This feature helps in creating snapshots on VGs that don't have enough space to reserve full capacity for snapshots. 
- [LVM Local PV](https://github.com/openebs/lvm-localpv) now allows for specifying the custom topology keys via ENV variable, instead of caching the values on restart. The caching can result in driver storing an out-dated topology key, if the administrator misses to restart the driver pods. Specifying the topology key via ENV allows users to know the current key and if there is a change, requires for a ENV modification that will force a restart of all the drivers.
- [NFS Provisioner](https://github.com/openebs/dynamic-nfs-provisioner) has been updated with several new features like:
  - Ability to configure the LeaseTime and GraceTime for the NFS server to tune the restart times
  - Added a prometheus metrics end point to report volume creation and failure events 
  - Added a configuration option to allow users to specify the GUID to set on the NFS server to allow non-root applications to access NFS share
  - Allow specifying a different namespace than provisioner namespace to create NFS volume related objects. 
  - Allow specifying the node affinity for NFS server deployment
- [Rawfile Local PV](https://github.com/openebs/rawfile-localpv) has been enhanced to support xfs filesystem.


### Key Bug Fixes

### Backward Incompatibilities

- Kubernetes 1.18 or higher release is recommended as this release uses features of Kubernetes that will not be compatible with older Kubernetes releases. 
- OpenEBS has deprecated arch-specific container images in favor of multi-arch container images. For example, images like `cstor-pool-arm64:x.y.x` should be replaced with corresponding multi-arch image `cstor-pool:x.y.x`.

### Component versions

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners. The status of the various components as of v2.11.0 are as follows:

- CSI Drivers 
    - [Mayastor](https://docs.openebs.io/docs/next/ugmayastor.html) 0.8.1 (beta)
    - [cStor](https://github.com/openebs/cstor-operators) 2.11.0 (beta)
    - [Jiva](https://github.com/openebs/jiva-operator) 2.11.0 (beta) 
    - [Local PV ZFS](https://github.com/openebs/zfs-localpv) 1.9.0 (stable)
    - [Local PV LVM](https://github.com/openebs/lvm-localpv) 0.7.0 (beta)
    - [Local PV Rawfile](https://github.com/openebs/rawfile-localpv) 0.5.0 (beta)
    - [Local PV Partitions](https://github.com/openebs/device-localpv) 0.4.0 (alpha)
- Out-of-tree provisioners 
  - [Jiva](https://docs.openebs.io/docs/next/jiva.html) 2.11.0 (stable)
  - [Local PV hostpath](https://docs.openebs.io/docs/next/uglocalpv-hostpath.html) 2.11.0 (stable)
  - [Local PV device](https://docs.openebs.io/docs/next/uglocalpv-device.html) 2.11.0 (stable)
  - [cStor](https://docs.openebs.io/docs/next/cstor.html) 2.11.0 (beta)
  - [Dynamic NFS Volume](https://github.com/openebs/dynamic-nfs-provisioner) 0.5.0 (alpha)
- Other components
  - [NDM](https://github.com/openebs/node-disk-manager) 1.6.0 (beta)

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.11.0)
- [Install Steps](/docs/next/quickstart.html)
- [Upgrade Steps](/docs/next/upgrade.html)

## 2.10.0 - Jun 15 2021

OpenEBS v2.10 is another maintenance release before moving towards 3.0 primarily focusing on enhancing the E2E tests, build, release workflows, and documentation. This release also includes enhancements to improve the user experience and fixes for bugs reported by users and E2E tools. There has been some significant progress made on the alpha features as well. 

---

**Deprecation Notice**:  Jiva and cStor `out-of-tree external` provisioners will be deprecated by Dec 2021 in favor of the corresponding CSI Drivers. The out of tree provisioners for Jiva and cStor will stop working from Kubernetes 1.22 and forward as the version of the custom resources used by those provisioners will be deprecated. We strongly recommend you plan for migrating your volumes to [cStor CSI](https://github.com/openebs/upgrade/blob/master/docs/migration.md) or [Jiva CSI](https://github.com/openebs/upgrade/blob/master/docs/migration.md#migrating-jiva-external-provisioned-volumes-to-jiva-csi-volumes-experimental) as early as possible.  

If you have any questions or need help with the migration please reach out to us on our Kubernetes Community slack channel [#openebs](https://kubernetes.slack.com/archives/CUAKPFU78).

---

### New Capabilities 

- [kubectl plugin for openebs](https://github.com/openebs/openebsctl/blob/develop/README.md) to help manage OpenEBS components. This release includes support for displaying details about:
  - cStor Pools and volumes, 
  - Jiva Volumes. 
- [OpenEBS monitoring add-on](https://github.com/openebs/monitoring) A set of Grafana dashboards and Prometheus alerts for OpenEBS, packaged as helm chart. This release includes support for:
  - cStor overview dashboard
  - cStor Pools, Replicas and Volumes Dashboard
  - Jiva Volume Dashboard
  - Alerts for Volume crossing capacity threshold
  
A very special thanks to @cncf and 2021 LFX Mentees @ParthS007, @rahul799 for contributing to the above features!!

### Key Improvements
- Enhanced the [OpenEBS Helm Chart](https://github.com/openebs/charts/tree/master/charts/openebs#openebs-helm-chart) to support installing CSI Drivers for cStor, Jiva, ZFS Local PV, and LVM Local PV. The user will need to use custom `values.yaml` to install the specific projects. You can read more about these additional options [here](https://github.com/openebs/charts/tree/master/charts/openebs#below-charts-are-dependent-charts-of-this-chart).
- Enhanced [ZFS Local PV](https://github.com/openebs/zfs-localpv) to support [CSI StorageCapacity based scheduling](https://kubernetes.io/docs/concepts/storage/storage-capacity/#enabling-storage-capacity-tracking). https://github.com/openebs/zfs-localpv/pull/335
- Enhanced [Jiva CSI Operator](https://github.com/openebs/jiva-operator) to automatically create a new Jiva replica when a node running a Jiva replica is removed. A new replica will be created only when the volume has a quorum.  https://github.com/openebs/jiva-operator/pull/97
- Enhanced [LVM Local PV](https://github.com/openebs/lvm-localpv/) to support the online expansion of `btrfs` formatted volume. https://github.com/openebs/lvm-localpv/pull/85
- Enhanced [Dynamic NFS Provisioner](https://github.com/openebs/dynamic-nfs-provisioner) to allow users to customize the NFS server with additional configuration parameters in the storage class. This release supports configuring NFS Lease and Grace timeouts for release locks from the NFS connection. The docker image location for the NFS Server can also be customized. https://github.com/openebs/dynamic-nfs-provisioner/pull/47 

### Key Bug Fixes
- [Local PV] Fixed an issue in CSI Controllers of LVM Local PV and Device Local PV that could potentially cause stale Volume custom resources to be created in cases where PVC gets deleted prior to completion of the create volume request. https://github.com/openebs/lib-csi/pull/11
- [Dynamic NFS] Fixed an issue with Liveness probe in the NFS provisioner. https://github.com/openebs/dynamic-nfs-provisioner/pull/41
- Several fixes to docs were also included in this release. 
- OpenEBS participated in the CNCF BugBash program in KubeCon EU 2021 and has received more than [90 PRs](https://github.com/search?o=asc&q=is%3Aopen+is%3Apr+label%3Aevent%2Fkubecon-eu21-bugbash+org%3Aopenebs&s=created&state=closed&type=Issues). This release includes several PRs from the program that were accepted after the 2.9 release. 

### Backward Incompatibilities

- Kubernetes 1.18 or higher release is recommended as this release uses features of Kubernetes that will not be compatible with older Kubernetes releases. 
- OpenEBS has deprecated arch-specific container images in favor of multi-arch container images. For example, images like `cstor-pool-arm64:x.y.x` should be replaced with corresponding multi-arch image `cstor-pool:x.y.x`.

### Component versions

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners. The status of the various components as of v2.10.0 are as follows:

- CSI Drivers 
    - [Mayastor](https://docs.openebs.io/docs/next/ugmayastor.html) 0.8.0 (beta)
    - [cStor](https://github.com/openebs/cstor-operators) 2.10.0 (beta)
    - [Jiva](https://github.com/openebs/jiva-operator) 2.10.0 (beta) 
    - [Local PV ZFS](https://github.com/openebs/zfs-localpv) 1.8.0 (stable)
    - [Local PV LVM](https://github.com/openebs/lvm-localpv) 0.6.0 (beta)
    - [Local PV Rawfile](https://github.com/openebs/rawfile-localpv) 0.4.4 (beta)
    - [Local PV Partitions](https://github.com/openebs/device-localpv) 0.3.0 (alpha)
- Out-of-tree provisioners 
  - [Jiva](https://docs.openebs.io/docs/next/jiva.html) 2.10.0 (stable)
  - [Local PV hostpath](https://docs.openebs.io/docs/next/uglocalpv-hostpath.html) 2.10.0 (stable)
  - [Local PV device](https://docs.openebs.io/docs/next/uglocalpv-device.html) 2.10.0 (stable)
  - [cStor](https://docs.openebs.io/docs/next/cstor.html) 2.10.0 (beta)
  - [Dynamic NFS Volume](https://github.com/openebs/dynamic-nfs-provisioner) 0.4.0 (alpha)
- Other components
  - [NDM](https://github.com/openebs/node-disk-manager) 1.5.0 (beta)

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.10.0)
- [Install Steps](/docs/next/quickstart.html)
- [Upgrade Steps](/docs/next/upgrade.html)

## 2.9.0 - May 15 2021

OpenEBS v2.9 is another maintenance release before moving towards 3.0 primarily focusing on enhancing the E2e tests and build/release workflows. This release includes fixes for user-reported critical bugs as well as fixes and enhancements to improve the E2e test coverage. There has been some significant progress made on the alpha features as well. 


### Key Improvements

- Enhanced [ZFS Local PV](https://github.com/openebs/zfs-localpv) to use a custom node label called `openebs.io/nodeid` to set the node affinity for the provisioned volume. By default, the value will be the same as `kubernetes.io/hostname`.  Using a custom label like this will help in quickly migrating the volumes to a new node in cases where a node fails and the user needs to move the underlying disks to a new node in the cluster. After moving the disks, the user can set the `openebs.io/nodeid` with the value used in the previous node. (https://github.com/openebs/zfs-localpv/issues/304). You can read more about this feature [here](https://github.com/openebs/zfs-localpv/blob/master/docs/faq.md#8-how-to-migrate-pvs-to-the-new-node-in-case-old-node-is-not-accessible).
- Enhanced [cStor Velero plugin](https://github.com/openebs/velero-plugin/pull/154) to allow users to specify a custom timeout for completing snapshot operations. The timeout can be configured via the `restApiTimeout ` field in VolumeSnapshotLocation. See [example](https://github.com/openebs/velero-plugin/blob/master/example/06-volumesnapshotlocation.yaml). (https://github.com/openebs/velero-plugin/issues/148)
- Added helm chart for [LVM Local PV](https://github.com/openebs/lvm-localpv/tree/master/deploy/helm/charts). 
- Enhanced [LVM Local PV](https://github.com/openebs/lvm-localpv/blob/master/docs/storageclasses.md) to allow users to specify a pattern string of volume groups from which LVM Local PV should be provisioned. This feature will help in cases where a node can have multiple volume groups or volume group names across the cluster have to be unique. (https://github.com/openebs/lvm-localpv/pull/28)

### Key Bug Fixes
- [cStor] Fixed an issue where helm chart pre-delete webhook was using a deprecated `hyperkube` image. Moved to `kubectl` images from [bitnami](https://hub.docker.com/r/bitnami/kubectl). (https://github.com/openebs/openebs/issues/3383)
- [cStor] Fixed an issue where some of the cStor operators were using deprecated `ubuntu 16.04` as the base image. Moved to `ubuntu 18.04`.(https://github.com/openebs/openebs/issues/3386)
- Several fixes to docs were also included in this release. 
- OpenEBS participated in the CNCF BugBash program in KubeCon EU 2021 and has received more than [90 PRs, out of which 50+](https://github.com/search?o=asc&q=is%3Aopen+is%3Apr+label%3Aevent%2Fkubecon-eu21-bugbash+org%3Aopenebs&s=created&state=closed&type=Issues) were accepted. 

### Backward Incompatibilities

- Kubernetes 1.18 or higher release is recommended as this release uses features of Kubernetes that will not be compatible with older Kubernetes releases. 
- OpenEBS has deprecated arch-specific container images in favor of multi-arch container images. For example, images like `cstor-pool-arm64:x.y.z` should be replaced with corresponding multi-arch image `cstor-pool:x.y.z`.

### Component versions

OpenEBS is a collection of data engines and operators to create different types of replicated and local persistent volumes for Kubernetes Stateful workloads. Kubernetes volumes can be provisioned via CSI Drivers or using Out-of-tree Provisioners. The status of the various components as of v2.9.0 are as follows:

- CSI Drivers 
    - [Mayastor](https://docs.openebs.io/docs/next/ugmayastor.html) 0.8.0 (beta)
    - [cStor](https://github.com/openebs/cstor-operators) 2.9.0 (beta)
    - [Jiva](https://github.com/openebs/jiva-operator) 2.9.0 (beta) 
    - [Local PV ZFS](https://github.com/openebs/zfs-localpv) 1.7.0 (stable)
    - [Local PV LVM](https://github.com/openebs/lvm-localpv) 0.5.0 (beta)
    - [Local PV Rawfile](https://github.com/openebs/rawfile-localpv) 0.4.4 (beta)
    - [Local PV Partitions](https://github.com/openebs/device-localpv) 0.2.0 (alpha)
- Out-of-tree provisioners 
  - [Jiva](https://docs.openebs.io/docs/next/jiva.html) 2.9.0 (stable)
  - [Local PV hostpath](https://docs.openebs.io/docs/next/uglocalpv-hostpath.html) 2.9.0 (stable)
  - [Local PV device](https://docs.openebs.io/docs/next/uglocalpv-device.html) 2.9.0 (stable)
  - [cStor](https://docs.openebs.io/docs/next/cstor.html) 2.9.0 (beta)
  - [Dynamic NFS Volume](https://github.com/openebs/dynamic-nfs-provisioner) 0.3.0 (alpha)
- Other components
  - [NDM](https://github.com/openebs/node-disk-manager) 1.4.1 (beta)



**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.9.0)
- [Install Steps](/docs/next/quickstart.html)
- [Upgrade Steps](/docs/next/upgrade.html)

## 2.8.0 - Apr 16 2021

OpenEBS v2.8 is the another maintenance release before moving towards 3.0, and includes fixes and enhancements geared towards migrating non CSI volumes to CSI and improvements to E2e. This release also includes some key user-requested bug fixes and enhancements.

### Component versions

The latest release versions of each of the engine are as follows:

- [Mayastor](https://mayastor.gitbook.io/introduction/) 0.8.0
- [cStor](https://github.com/openebs/cstor-operators) 2.8.0
- [Jiva](https://docs.openebs.io/docs/next/jivaguide.html) 2.8.0
- [Local PV hostpath](https://docs.openebs.io/docs/next/uglocalpv-hostpath.html) 2.8.0
- [Local PV device](https://docs.openebs.io/docs/next/uglocalpv-device.html) 2.8.0
- [Local PV ZFS](https://github.com/openebs/zfs-localpv) 1.6.0
- [Local PV LVM](https://github.com/openebs/lvm-localpv) 0.4.0
- [Local PV Rawfile](https://github.com/openebs/rawfile-localpv) 0.4.4
- [Dynamic NFS Volume](https://github.com/openebs/dynamic-nfs-provisioner) 0.2.0

### Key Improvements

- Updated the Kubernetes resources like CRDs, RBAC, CSIDriver, and Admission Controller used by OpenEBS project to v1, as the corresponding beta or alpha versioned objects will be deprecated in Kubernetes 1.22. _This change requires that OpenEBS 2.8 release be used with Kubernetes 1.18 or higher._ 
- Jiva CSI driver is promoted to _beta_. For instructions on how to set up and use the Jiva CSI driver, please see. https://github.com/openebs/jiva-operator. Major updates in this release include: 
   * [Upgrade](https://github.com/openebs/upgrade/blob/master/docs/upgrade.md#jiva-csi-volumes) support for Jiva volumes provisioned via CSI Driver
   * [Migration](https://github.com/openebs/upgrade/blob/master/docs/migration.md#migrating-jiva-external-provisioned-volumes-to-jiva-csi-volumes-experimental) of external-provisioner provisioned Jiva volumes to Jiva CSI Driver. 
   * [E2e tests](https://github.com/openebs/e2e-tests/pull/620) for Jiva CSI volumes
- Enhanced [ZFS Local PV](https://github.com/openebs/zfs-localpv) to allow users to set up custom finalizers on ZFS volumes. This will provide control to users to plug-in custom volume life-cycle operations. (https://github.com/openebs/zfs-localpv/issues/302)
- Enhanced [ZFS Local PV](https://github.com/openebs/zfs-localpv) volume creation with ImmediateBinding to attempt to pick a new node for volume, if the selected node couldn't provision the volume. (https://github.com/openebs/zfs-localpv/pull/270)
- [LVM Local PV](https://github.com/openebs/lvm-localpv) is promoted to beta.  For instructions on how to set up and use the Local PV LVM CSI driver, please see. https://github.com/openebs/lvm-localpv. Major updates in this release include: 
  * Enhance the capacity reporting feature by updating _lvmetad_ cache, prior to reporting the current status. 
  * [E2e tests](https://github.com/openebs/lvm-localpv/pull/41) updated with resiliency tests. 
- [OpenEBS Rawfile Local PV](https://github.com/openebs/rawfile-localpv) is promoted to beta. For instructions on how to set up and use, please see. https://github.com/openebs/rawfile-localpv

### Key Bug Fixes
- [Local PV - Device] Fixed an issue causing the Local PV provisioner to error out if the user had manually deleted the BDC. (https://github.com/openebs/openebs/issues/3363)
- [NDM] Fixed an issue causing a crash in NDM after a block device was resized. (https://github.com/openebs/openebs/issues/3362)
- Several fixes to docs were also included in this release. 
 
### Backward Incompatibilities

- Kubernetes 1.18 or higher release is recommended as this release contains the following updates that will not be compatible with older Kubernetes releases. 
  * The CSI components have been upgraded to: 
      * k8s.gcr.io/sig-storage/csi-attacher:v3.1.0
      * k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.1.0
      * k8s.gcr.io/sig-storage/csi-provisioner:v2.1.0
      * k8s.gcr.io/sig-storage/csi-provisioner:v2.1.1 (for Mayastor CSI volumes)
      * k8s.gcr.io/sig-storage/csi-resizer:v1.1.0
      * k8s.gcr.io/sig-storage/csi-snapshotter:v4.0.0
      * k8s.gcr.io/sig-storage/snapshot-controller:v4.0.0
      * k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.3 (for cStor CSI volumes)
      * k8s.gcr.io/sig-storage/snapshot-controller:v3.0.3 (for cStor CSI volumes)

- If you are upgrading from a version of cStor operators older than 2.6 to this version, you will need to manually delete the cStor CSI driver object prior to upgrading. `kubectl delete csidriver cstor.csi.openebs.io`. For complete details on how to upgrade your cStor operators, see https://github.com/openebs/upgrade/blob/master/docs/upgrade.md#cspc-pools.

- The CRD API version has been updated for the cStor custom resources to v1. If you are upgrading via the helm chart, you might have to make sure that the new CRDs are updated. https://github.com/openebs/cstor-operators/tree/master/deploy/helm/charts/crds


**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.8.0)
- [Upgrade Steps](/docs/next/upgrade.html)

## 2.7.0 - Mar 16 2021


OpenEBS v2.7 is a maintenance release geared towards preparing for better structuring of the code and improving on the E2e frameworks. This release also includes some key user-requested bug fixes and enhancements. 

The latest release versions of each of the engine are as follows:
- [Mayastor](https://mayastor.gitbook.io/introduction/) 0.8.1
- [cStor](https://github.com/openebs/cstor-operators) 2.7.0
- [Jiva](https://docs.openebs.io/docs/next/jivaguide.html) 2.7.0
- [Local PV host path](https://docs.openebs.io/docs/next/uglocalpv-hostpath.html) 2.7.0
- [Local PV device](https://docs.openebs.io/docs/next/uglocalpv-device.html) 2.7.0
- [Local PV ZFS](https://github.com/openebs/zfs-localpv) 1.5.0
- [Local PV LVM](https://github.com/openebs/lvm-localpv) 0.3.0
- [Local PV Rawfile](https://github.com/openebs/rawfile-localpv) 0.4.4
- [Dynamic NFS Volume](https://github.com/openebs/dynamic-nfs-provisioner) 0.2.0

Here are some of the key highlights in this release.

### Key Improvements

- [Mayastor] Several bug fixes to the Mayastor volumes and preparing to support ANA. See [Mayastor release notes](https://github.com/openebs/Mayastor/releases/tag/v0.8.1). 
- [Jiva] Hardening the Jiva CSI driver (introduced for alpha testing) with automated E2e tests and fixing some of the issues found in the e2e tests. The driver is available for alpha testing. For instructions on how to set up and use the Jiva CSI driver, please see. https://github.com/openebs/jiva-operator.
- [LVM Local PV](https://github.com/openebs/lvm-localpv) is enhanced with additional features and some key bug fixes like:
  * Support for creating CSIStorageCapacity objects to allow dynamic provisioning based on available capacity.
  * Enhance the provisioning workflow to handle capacity exhaustion on LVM group and allow the volume to be re-scheduled to another node.
  * Automated E2e tests for provisioning and resize features. 
- [ZFS Local PV](https://github.com/openebs/zfs-localpv) added support for performing backup/restore on encrypted ZFS pools. 


### Key Bug Fixes
- Fixed an issue with Mayastor where an error in creating a nexus could cause a hang. 
- Fixed an issue with cStor that was causing a crash in arm64 due to invalid uzfs zc_nvlist_dst_size handling. 
- Fixed an issue where NDM would not automatically de-activate a removed disk when GPTBasedUUID was enabled. 
- Fixes an issue where Rawfile Local PV volume deletion would not delete the provisioned PV folders.
- Fixes an issue which caused resize on btrfs filesystems on top of Rawfile Local PV was failing. 
- Several fixes to docs were also included in this release. 
 

### Backward Incompatibilities

- Kubernetes 1.17 or higher release is recommended as this release contains the following updates that will not be compatible with older Kubernetes releases. 
  * The CSI components have been upgraded to: 
      * k8s.gcr.io/sig-storage/csi-attacher:v3.1.0
      * k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.1.0
      * k8s.gcr.io/sig-storage/csi-provisioner:v2.1.0
      * k8s.gcr.io/sig-storage/csi-provisioner:v2.1.1 (for Mayastor CSI volumes)
      * k8s.gcr.io/sig-storage/csi-resizer:v1.1.0
      * k8s.gcr.io/sig-storage/csi-snapshotter:v4.0.0
      * k8s.gcr.io/sig-storage/snapshot-controller:v4.0.0
      * k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.3 (for cStor CSI volumes)
      * k8s.gcr.io/sig-storage/snapshot-controller:v3.0.3 (for cStor CSI volumes)
- If you are upgrading from a version of cStor operators older than 2.6 to this version, you will need to manually delete the cStor CSI driver object prior to upgrading. `kubectl delete csidriver cstor.csi.openebs.io`. For complete details on how to upgrade your cStor operators, see https://github.com/openebs/upgrade/blob/master/docs/upgrade.md#cspc-pools.
- The CRD API version has been updated for the cStor custom resources to v1. If you are upgrading via the helm chart, you might have to make sure that the new CRDs are updated. https://github.com/openebs/cstor-operators/tree/master/deploy/helm/charts/crds
- The e2e pipelines include upgrade testing only from 1.6 and higher releases to 2.7. If you are running on release older than 1.6, OpenEBS recommends you upgrade to the latest version as soon as possible.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.6.0)
- [Upgrade Steps](/docs/next/upgrade.html)


## 2.6.0 - Feb 15 2021

<br><font size="4">Latest Release</font><br/> (Recommended)<br/>

OpenEBS v2.6 contains some key enhancements and several fixes for the issues reported by the user community across all 9 types of OpenEBS volumes.

- 3 replicated types - [Mayastor](https://mayastor.gitbook.io/introduction/), [cStor](https://github.com/openebs/cstor-operators) and [Jiva](https://docs.openebs.io/docs/next/jivaguide.html). 
- 5 types of Local PV backed by [host path](https://docs.openebs.io/docs/next/uglocalpv-hostpath.html), [device](https://docs.openebs.io/docs/next/uglocalpv-device.html), [ZFS](https://github.com/openebs/zfs-localpv), [LVM](https://github.com/openebs/lvm-localpv) and [Rawfile](https://github.com/openebs/rawfile-localpv), and 
- [RWX volumes using NFS](https://github.com/openebs/dynamic-nfs-provisioner). 

Here are some of the key highlights in this release.

### New capabilities

- OpenEBS is introducing a new CSI driver for dynamic provisioning of Jiva volumes. This driver is released as alpha and currently supports the following additional features compared to the non-CSI jiva volumes. 
   * Jiva Replicas are backed by OpenEBS host path volumes
   * Auto-remount of volumes that are marked read-only by iSCSI client due to intermittent network issues
   * Handle the case of multi-attach error sometimes seen on on-premise clusters
   * A custom resource for Jiva volumes to help with easy access to the volume status
   
  For instructions on how to set up and use the Jiva CSI driver, please see. https://github.com/openebs/jiva-operator.

### Key Improvements

- Several bug fixes to the Mayastor volumes along with improvements to the API documentation. See [Mayastor release notes](https://github.com/openebs/Mayastor/releases/tag/v0.7.1). 
- Enhanced the [NFS Dynamic Provisioner](https://github.com/openebs/dynamic-nfs-provisioner) to support using Cluster IP for dynamically provisioned NFS server. It was observed that on some of the Kubernetes clusters the kubelet or the node trying to mount the NFS volume was unable to resolve the cluster local service. 
- [ZFS Local PV](https://github.com/openebs/zfs-localpv) added support for resizing of the raw block volumes. 
- [LVM Local PV](https://github.com/openebs/lvm-localpv) is enhanced with additional features and some key bug fixes like:
  * Raw block volume support
  * Snapshot support
  * Ability to schedule based on the capacity of the volumes provisioned
  * Ensure that LVM volume creation and deletion functions are idempotent
- NDM partition discovery was updated to fetch the device details from it's parent block device.


### Key Bug Fixes
- Fixed an issue with cStor helm chart w.r.t to CVC operator service that was causing velero restores to fail. (https://github.com/openebs/cstor-operators/pull/239)
- Fixed an issue with cStor CSPC validation causing failures in creating pools with ZFS supported compression algorithms. (https://github.com/openebs/cstor-operators/issues/237)
- Fixed an issue with the cStor validation webhook not getting deleted in K8s 1.20+ when the OpenEBS namespace is deleted. https://github.com/openebs/openebs/issues/3338)
- Fixed an issue with Jiva replicas attempting duplicate registration if the Pod IP of the replica changes. (https://github.com/openebs/openebs/issues/3323)
- Fixed an issue where Jiva cleanup jobs can't be executed when cluster PSP is restrictive. (https://github.com/openebs/openebs/issues/3331)
- Fixed an issue where cStor pool migration from SPC to CSPC could result in pool failure when migration takes time and the user tries to restart the SPC pool. (https://github.com/openebs/upgrade/issues/82)
- Fixed an issue with NDM partition discovery causing errors when partitions were present on top of filtered devices like OS disk. (https://github.com/openebs/openebs/issues/3321)
 

### Backward Incompatibilities

- Kubernetes 1.17 or higher release is recommended as this release contains the following updates that will not be compatible with older Kubernetes releases. 
  * The CSI components have been upgraded to: 
      * k8s.gcr.io/sig-storage/csi-attacher:v3.1.0
      * k8s.gcr.io/sig-storage/csi-node-driver-registrar:v2.1.0
      * k8s.gcr.io/sig-storage/csi-provisioner:v2.1.0
      * k8s.gcr.io/sig-storage/csi-resizer:v1.1.0
      * k8s.gcr.io/sig-storage/csi-snapshotter:v4.0.0
      * k8s.gcr.io/sig-storage/snapshot-controller:v4.0.0
      * k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.3 (for cStor CSI volumes)
      * k8s.gcr.io/sig-storage/snapshot-controller:v3.0.3 (for cStor CSI volumes)

- If you are upgrading from an older version of cStor operators to this version, you will need to manually delete the cStor CSI driver object prior to upgrading. `kubectl delete csidriver cstor.csi.openebs.io`. For complete details on how to upgrade your cStor operators, see https://github.com/openebs/upgrade/blob/master/docs/upgrade.md#cspc-pools.

- The CRD API version has been updated for the cStor custom resources to v1. If you are upgrading via the helm chart, you might have to make sure that the new CRDs are updated. https://github.com/openebs/cstor-operators/tree/master/deploy/helm/charts/crds

- The e2e pipelines include upgrade testing only from 1.5 and higher releases to 2.6. If you are running on release older than 1.5, OpenEBS recommends you upgrade to the latest version as soon as possible. 

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.6.0)
- [Upgrade Steps](/docs/next/upgrade.html)



<br>

## 2.5.0 - Jan 15 2021


### New capabilities

- OpenEBS has support for multiple storage engines, and the feedback from users has shown that users tend to only use a few of these engines on any given cluster depending on the workload requirements. As a way to provide more flexibility for users, we are introducing separate helm charts per engine. With OpenEBS 2.5 the following helm charts are supported. 
  * [openebs](https://openebs.github.io/charts/) - This is the most widely deployed that has support for Jiva, cStor, and Local PV hostpath and device volumes. 
  * [zfs-localpv](https://openebs.github.io/zfs-localpv/) - Helm chart for ZFS Local PV CSI driver.
  * [cstor-operators](https://openebs.github.io/cstor-operators/) - Helm chart for cStor CSPC Pools and CSI driver.
  * [dynamic-localpv-provisioner](https://openebs.github.io/dynamic-localpv-provisioner/) - Helm chart for only installing Local PV hostpath and device provisioners. 
  
  (Special shout out to @sonasingh46, @shubham14bajpai, @prateekpandey14, @xUnholy, @akhilerm for continued efforts in helping to build the above helm charts.)
 
- OpenEBS is introducing a new CSI driver for dynamic provisioning to Kubernetes Local Volumes backed by LVM. This driver is released as alpha and currently supports the following features. 
   * Create and Delete Persistent Volumes 
   * Resize Persistent Volume
   
  For instructions on how to set up and use the LVM CSI driver, please see. https://github.com/openebs/lvm-localpv 


### Key Improvements

- Enhanced the ZFS Local PV scheduler to support spreading the volumes across the nodes based on the capacity of the volumes that are already provisioned. After upgrading to this release, capacity-based spreading will be used by default. In the previous releases, the volumes were spread based on the number of volumes provisioned per node. https://github.com/openebs/zfs-localpv/pull/266.

- Added support to configure image pull secrets for the pods launched by OpenEBS Local PV Provisioner and cStor (CSPC) operators. The image pull secrets (comma separated strings) can be passed as an environment variable (OPENEBS_IO_IMAGE_PULL_SECRETS) to the deployments that launch these additional pods.  The following deployments need to be updated. 
  * For Local PVs, the deployments `openebs-localpv-provisioner` and `openebs-ndm-operator`
  * For cStor CSI based PVs, the deployments `cspc-operator` and `cvc-operator`
  (Special thanks to @allenhaozi for helping with this fix. https://github.com/openebs/dynamic-localpv-provisioner/pull/22)

- Added support to allow users to specify custom node labels for allowedTopologies under the cStor CSI StorageClass. https://github.com/openebs/cstor-csi/pull/135

### Key Bug Fixes
- Fixed an issue that could cause Jiva replica to fail to initialize if there was an abrupt shutdown of the node where the replica pod is scheduled during the Jiva replica initialization. https://github.com/openebs/jiva/pull/337.
- Fixed an issue that was causing Restore (with automatic Target IP configuration enabled) to fail if cStor volumes are created with Target Affinity with application pod. https://github.com/openebs/velero-plugin/issues/141.
- Fixed an issue where Jiva and cStor volumes will remain in `pending` state on Kubernetes 1.20 and above clusters. K8s 1.20 has deprecated `SelfLink` option which causes this failure with older Jiva and cStor Provisioners. https://github.com/openebs/openebs/issues/3314
- Fixed an issue with cStor CSI Volumes that caused the Pods using cStor CSI Volumes on unmanaged Kubernetes clusters to remain in the pending state due to multi-attach error. This was caused due to cStor being dependent on the CSI VolumeAttachment object to determine where to attach the volume. In the case of unmanaged Kubernetes clusters, the VolumeAttachment object was not cleared by Kubernetes from the failed node and hence the cStor would assume that volume was still attached to the old node. 

### Backward Incompatibilities

- Kubernetes 1.17 or higher release is recommended as this release contains the following updates that will not be compatible with older Kubernetes releases. 
  * The CRD version has been upgraded to `v1`. (Thanks to the efforts from @RealHarshThakur, @prateekpandey14, @akhilerm)
  * The CSI components have been upgraded to: 
     * quay.io/k8scsi/csi-node-driver-registrar:v2.1.0
     * quay.io/k8scsi/csi-provisioner:v2.1.0
     * quay.io/k8scsi/snapshot-controller:v4.0.0
     * quay.io/k8scsi/csi-snapshotter:v4.0.0
     * quay.io/k8scsi/csi-resizer:v1.1.0
     * quay.io/k8scsi/csi-attacher:v3.1.0
     * k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.3 (for cStor CSI volumes)
     * k8s.gcr.io/sig-storage/snapshot-controller:v3.0.3 (for cStor CSI volumes)

- If you are upgrading from an older version of cStor operators to this version, you will need to manually delete the cstor CSI driver object prior to upgrade. `kubectl delete csidriver cstor.csi.openebs.io`. For complete details on how to upgrade your cStor operators, see https://github.com/openebs/upgrade/blob/master/docs/upgrade.md#cspc-pools.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.5.0)
- [Upgrade Steps](/docs/next/upgrade.html)

<br>

## 2.4.0 - Dec 15 2020



### New capabilities
- ZFS Local PV has now been graduated to stable with all the supported features and upgrade tests automated via e2e testing. ZFS Local PV is best suited for distributed workloads that require resilient local volumes that can sustain local disk failures. You can read more about using the ZFS Local volumes at https://github.com/openebs/zfs-localpv and check out how ZFS Local PVs are used in production at [Optoro](https://github.com/openebs/openebs/blob/master/adopters/optoro/README.md).

- OpenEBS is introducing a new NFS dynamic provisioner to allow the creation and deletion of NFS volumes using Kernel NFS backed by block storage. This provisioner is being actively developed and released as alpha. This new provisioner allows users to provision OpenEBS RWX volumes where each volume gets its own NFS server instance. In the previous releases, OpenEBS RWX volumes were supported via the [Kubernetes NFS Ganesha and External Provisioner](https://docs.openebs.io/docs/next/rwm.html) - where multiple RWX volumes share the same NFS Ganesha Server. You can read more about the new OpenEBS Dynamic Provisioner at https://github.com/openebs/dynamic-nfs-provisioner.


### Key Improvements

- Added support for specifying a custom node affinity label for OpenEBS Local Hostpath volumes. By default, OpenEBS Local Hostpath volumes use `kubernetes.io/hostname` for setting the PV Node Affinity. Users can now specify a custom label to use for PV Node Affinity. Custom node affinity can be specified in the Local PV storage class as follows: 
  ```
  kind: StorageClass
  metadata:
    name: openebs-hostpath
    annotations:
      openebs.io/cas-type: local
      cas.openebs.io/config: |
        - name: StorageType
          value: "hostpath"
        - name: NodeAffinityLabel
          value: "openebs.io/custom-node-id"
  provisioner: openebs.io/local
  volumeBindingMode: WaitForFirstConsumer
  reclaimPolicy: Delete
  ```
  This will help with use cases like:
  - Deployments where `kubernetes.io/hostname` is not unique across the cluster (Ref: https://github.com/openebs/openebs/issues/2875)
  - Deployments, where an existing Kubernetes node in the cluster running Local volumes is replaced with a new node, and storage attached to the old node, is moved to a new node. Without this feature, the Pods using the older node will remain in the pending state.  
- Added a configuration option to the Jiva volume provisioner to skip adding replica node affinity. This will help in deployments where replica nodes are frequently replaced with new nodes causing the replica to remain in the pending state. The replica node affinity should be used in cases where replica nodes are not replaced with new nodes or the new node comes back with the same node-affinity label. (Ref: https://github.com/openebs/openebs/issues/3226). The node affinity for jiva volumes can be skipped by specifying the following ENV variable in the OpenEBS Provisioner Deployment. 
   ```
        - name: OPENEBS_IO_JIVA_PATCH_NODE_AFFINITY
          value: "disabled"
   ```
- Enhanced OpenEBS Velero plugin (cStor) to automatically set the target IP once the cStor volumes is restored from a backup.  (Ref: https://github.com/openebs/velero-plugin/pull/131). This feature can be enabled by updating the VolumeSnapshotLocal using `configuration option autoSetTargetIP` as follows:
  ```
  apiVersion: velero.io/v1
  kind: VolumeSnapshotLocation
  metadata:
    ...
  spec:
    config:
      ...
      ...
      autoSetTargetIP: "true"
  ```
  (Huge thanks to @zlymeda for working on this feature which involved coordinating this fix across multiple repositories).
- Enhanced the OpenEBS Velero plugin used to automatically create the target namespace during restore, if the target namespace doesn't exist. (Ref: https://github.com/openebs/velero-plugin/issues/137).
- Enhanced the OpenEBS helm chart to support Image pull secrets. https://github.com/openebs/charts/pull/174
- Enhance OpenEBS helm chart to allow specifying resource limits on OpenEBS control plane pods. https://github.com/openebs/charts/issues/151
- Enhanced the NDM filters to support discovering LVM devices both with `/dev/dm-X` and `/dev/mapper/x` patterns. (Ref: https://github.com/openebs/openebs/issues/3310).

### Key Bug Fixes

- Fixed an issue that was causing Jiva Target to crash due to fetching stats while there was an ongoing IO. (Ref: https://github.com/openebs/jiva/pull/334). 
- Fixed an issue where Jiva volumes failed to start if PodSecurityPolicies were setup. (Ref: https://github.com/openebs/openebs/issues/3305). 
- Fixed an issue where helm chart `--dry-run` would fail due to admission webhook checks. (Ref: https://github.com/openebs/maya/issues/1771). 
- Fixed an issue where NDM would fail to discover block devices on encountering an issue with block device, even if there were other good devices on the node. (Ref: https://github.com/openebs/openebs/issues/3051).
- Fixed an issue where NDM failed to detect OS disk on `cos` nodes, where the root partition entry was set as `root=/dev/dm-0`. (Ref: https://github.com/openebs/node-disk-manager/pull/516). 

### Backward Incompatibilities

- Velero has updated the configuration for specifying a different node selector during restore. The configuration changes from `velero.io/change-pvc-node` to `velero.io/change-pvc-node-selector`. ( Ref: https://github.com/openebs/velero-plugin/pull/139)

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.4.0)
- [Upgrade Steps](/docs/next/upgrade.html)


<br>

## 2.3.0 - Nov 15 2020

### New capabilities

- OpenEBS has support for multiple storage engines, and the feedback from users has shown that users tend to only use a few of these engines on any given cluster depending on the workload requirements. As a way to provide more flexibility for users, we are introducing separate helm charts per engine. With OpenEBS 2.5 the following helm charts are supported. 
  * [openebs](https://openebs.github.io/charts/) - This is the most widely deployed that has support for Jiva, cStor, and Local PV hostpath and device volumes. 
  * [zfs-localpv](https://openebs.github.io/zfs-localpv/) - Helm chart for ZFS Local PV CSI driver.
  * [cstor-operators](https://openebs.github.io/cstor-operators/) - Helm chart for cStor CSPC Pools and CSI driver.
  * [dynamic-localpv-provisioner](https://openebs.github.io/dynamic-localpv-provisioner/) - Helm chart for only installing Local PV hostpath and device provisioners. 
  
  (Special shout out to @sonasingh46, @shubham14bajpai, @prateekpandey14, @xUnholy, @akhilerm for continued efforts in helping to build the above helm charts.)
 
- OpenEBS is introducing a new CSI driver for dynamic provisioning to Kubernetes Local Volumes backed by LVM. This driver is released as alpha and currently supports the following features. 
   * Create and Delete Persistent Volumes 
   * Resize Persistent Volume
   
  For instructions on how to set up and use the LVM CSI driver, please see. https://github.com/openebs/lvm-localpv 


### Key Improvements

- Enhanced the ZFS Local PV scheduler to support spreading the volumes across the nodes based on the capacity of the volumes that are already provisioned. After upgrading to this release, capacity-based spreading will be used by default. In the previous releases, the volumes were spread based on the number of volumes provisioned per node. https://github.com/openebs/zfs-localpv/pull/266.

- Added support to configure image pull secrets for the pods launched by OpenEBS Local PV Provisioner and cStor (CSPC) operators. The image pull secrets (comma separated strings) can be passed as an environment variable (OPENEBS_IO_IMAGE_PULL_SECRETS) to the deployments that launch these additional pods.  The following deployments need to be updated. 
  * For Local PVs, the deployments `openebs-localpv-provisioner` and `openebs-ndm-operator`
  * For cStor CSI based PVs, the deployments `cspc-operator` and `cvc-operator`
  (Special thanks to @allenhaozi for helping with this fix. https://github.com/openebs/dynamic-localpv-provisioner/pull/22)

- Added support to allow users to specify custom node labels for allowedTopologies under the cStor CSI StorageClass. https://github.com/openebs/cstor-csi/pull/135

### Key Bug Fixes
- Fixed an issue that could cause Jiva replica to fail to initialize if there was an abrupt shutdown of the node where the replica pod is scheduled during the Jiva replica initialization. https://github.com/openebs/jiva/pull/337.
- Fixed an issue that was causing Restore (with automatic Target IP configuration enabled) to fail if cStor volumes are created with Target Affinity with application pod. https://github.com/openebs/velero-plugin/issues/141.
- Fixed an issue where Jiva and cStor volumes will remain in `pending` state on Kubernetes 1.20 and above clusters. K8s 1.20 has deprecated `SelfLink` option which causes this failure with older Jiva and cStor Provisioners. https://github.com/openebs/openebs/issues/3314
- Fixed an issue with cStor CSI Volumes that caused the Pods using cStor CSI Volumes on unmanaged Kubernetes clusters to remain in the pending state due to multi-attach error. This was caused due to cStor being dependent on the CSI VolumeAttachment object to determine where to attach the volume. In the case of unmanaged Kubernetes clusters, the VolumeAttachment object was not cleared by Kubernetes from the failed node and hence the cStor would assume that volume was still attached to the old node. 

### Backward Incompatibilities

- Kubernetes 1.17 or higher release is recommended as this release contains the following updates that will not be compatible with older Kubernetes releases. 
  * The CRD version has been upgraded to `v1`. (Thanks to the efforts from @RealHarshThakur, @prateekpandey14, @akhilerm)
  * The CSI components have been upgraded to: 
     * quay.io/k8scsi/csi-node-driver-registrar:v2.1.0
     * quay.io/k8scsi/csi-provisioner:v2.1.0
     * quay.io/k8scsi/snapshot-controller:v4.0.0
     * quay.io/k8scsi/csi-snapshotter:v4.0.0
     * quay.io/k8scsi/csi-resizer:v1.1.0
     * quay.io/k8scsi/csi-attacher:v3.1.0
     * k8s.gcr.io/sig-storage/csi-snapshotter:v3.0.3 (for cStor CSI volumes)
     * k8s.gcr.io/sig-storage/snapshot-controller:v3.0.3 (for cStor CSI volumes)

- If you are upgrading from an older version of cStor Operators to this version, you will need to manually delete the cstor CSI driver object prior to upgrade. `kubectl delete csidriver cstor.csi.openebs.io`. For complete details on how to upgrade your cStor Operators, see https://github.com/openebs/upgrade/blob/master/docs/upgrade.md#cspc-pools.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.5.0)
- [Upgrade Steps](/docs/next/upgrade.html)

<br>

## 2.4.0 - Dec 15 2020

### New capabilities
- ZFS Local PV has now been graduated to stable with all the supported features and upgrade tests automated via e2e testing. ZFS Local PV is best suited for distributed workloads that require resilient local volumes that can sustain local disk failures. You can read more about using the ZFS Local volumes at https://github.com/openebs/zfs-localpv and check out how ZFS Local PVs are used in production at [Optoro](https://github.com/openebs/openebs/blob/master/adopters/optoro/README.md).

- OpenEBS is introducing a new NFS dynamic provisioner to allow the creation and deletion of NFS volumes using Kernel NFS backed by block storage. This provisioner is being actively developed and released as alpha. This new provisioner allows users to provision OpenEBS RWX volumes where each volume gets its own NFS server instance. In the previous releases, OpenEBS RWX volumes were supported via the [Kubernetes NFS Ganesha and External Provisioner](https://docs.openebs.io/docs/next/rwm.html) - where multiple RWX volumes share the same NFS Ganesha Server. You can read more about the new OpenEBS Dynamic Provisioner at https://github.com/openebs/dynamic-nfs-provisioner.


### Key Improvements

- Added support for specifying a custom node affinity label for OpenEBS Local Hostpath volumes. By default, OpenEBS Local Hostpath volumes use `kubernetes.io/hostname` for setting the PV Node Affinity. Users can now specify a custom label to use for PV Node Affinity. Custom node affinity can be specified in the Local PV storage class as follows: 
  ```
  kind: StorageClass
  metadata:
    name: openebs-hostpath
    annotations:
      openebs.io/cas-type: local
      cas.openebs.io/config: |
        - name: StorageType
          value: "hostpath"
        - name: NodeAffinityLabel
          value: "openebs.io/custom-node-id"
  provisioner: openebs.io/local
  volumeBindingMode: WaitForFirstConsumer
  reclaimPolicy: Delete
  ```
  This will help with use cases like:
  - Deployments where `kubernetes.io/hostname` is not unique across the cluster (Ref: https://github.com/openebs/openebs/issues/2875)
  - Deployments, where an existing Kubernetes node in the cluster running Local volumes is replaced with a new node, and storage attached to the old node, is moved to a new node. Without this feature, the Pods using the older node will remain in the pending state.  
- Added a configuration option to the Jiva volume provisioner to skip adding replica node affinity. This will help in deployments where replica nodes are frequently replaced with new nodes causing the replica to remain in the pending state. The replica node affinity should be used in cases where replica nodes are not replaced with new nodes or the new node comes back with the same node-affinity label. (Ref: https://github.com/openebs/openebs/issues/3226). The node affinity for jiva volumes can be skipped by specifying the following ENV variable in the OpenEBS Provisioner Deployment. 
   ```
        - name: OPENEBS_IO_JIVA_PATCH_NODE_AFFINITY
          value: "disabled"
   ```
- Enhanced OpenEBS Velero plugin (cStor) to automatically set the target IP once the cStor volumes is restored from a backup.  (Ref: https://github.com/openebs/velero-plugin/pull/131). This feature can be enabled by updating the VolumeSnapshotLocal using `configuration option autoSetTargetIP` as follows:
  ```
  apiVersion: velero.io/v1
  kind: VolumeSnapshotLocation
  metadata:
    ...
  spec:
    config:
      ...
      ...
      autoSetTargetIP: "true"
  ```
  (Huge thanks to @zlymeda for working on this feature which involved coordinating this fix across multiple repositories).
- Enhanced the OpenEBS Velero plugin used to automatically create the target namespace during restore, if the target namespace doesn't exist. (Ref: https://github.com/openebs/velero-plugin/issues/137).
- Enhanced the OpenEBS helm chart to support Image pull secrets. https://github.com/openebs/charts/pull/174
- Enhance OpenEBS helm chart to allow specifying resource limits on OpenEBS control plane pods. https://github.com/openebs/charts/issues/151
- Enhanced the NDM filters to support discovering LVM devices both with `/dev/dm-X` and `/dev/mapper/x` patterns. (Ref: https://github.com/openebs/openebs/issues/3310).

### Key Bug Fixes

- Fixed an issue that was causing Jiva Target to crash due to fetching stats while there was an ongoing IO. (Ref: https://github.com/openebs/jiva/pull/334). 
- Fixed an issue where Jiva volumes failed to start if PodSecurityPolicies were setup. (Ref: https://github.com/openebs/openebs/issues/3305). 
- Fixed an issue where helm chart `--dry-run` would fail due to admission webhook checks. (Ref: https://github.com/openebs/maya/issues/1771). 
- Fixed an issue where NDM would fail to discover block devices on encountering an issue with block device, even if there were other good devices on the node. (Ref: https://github.com/openebs/openebs/issues/3051).
- Fixed an issue where NDM failed to detect OS disk on `cos` nodes, where the root partition entry was set as `root=/dev/dm-0`. (Ref: https://github.com/openebs/node-disk-manager/pull/516). 

### Backward Incompatibilities

- Velero has updated the configuration for specifying a different node selector during restore. The configuration changes from `velero.io/change-pvc-node` to `velero.io/change-pvc-node-selector`. ( Ref: https://github.com/openebs/velero-plugin/pull/139)

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.4.0)
- [Upgrade Steps](/docs/next/upgrade.html)


<br>

## 2.3.0 - Nov 15 2020

### New capabilities

- ARM64 support (declared beta) for OpenEBS Data Engines - cStor, Jiva, Local PV (hostpath and device), ZFS Local PV.
  - A significant improvement in this release is the support for multi-arch container images for amd64 and arm64. The multi-arch images are available on the docker hub and will enable the users to run OpenEBS in the Kubernetes cluster that has a mix of arm64 and amd64 nodes.
  - In addition to ARM64 support, Local PV (hostpath and device) multi-arch container images include support for arm32 and power system.
  - The arch-specific container images like `<image name>-amd64:<image-tag>`, are also made available from docker hub and quay to support backward compatibility to users running OpenEBS deployments with arch-specific images.
  - To upgrade your volumes to multi-arch containers, make sure you specify the `to-image` to the multi-arch image available from docker or your own copy of it.

- Enhanced the cStor Velero Plugin to help with automating the restore from an incremental backup. Restoring an incremental backup involves restoring the full backup (also called base backup and subsequent incremental backups till the desired incremental backup. With this release, the user can set a new parameter(`restoreAllIncrementalSnapshots`) in the `VolumeSnapshotLocation` to automate the restore of the required base and incremental backups. For detailed instructions to try this feature, please refer to this [doc](https://github.com/openebs/velero-plugin#creating-a-restore-from-scheduled-remote-backup). 

- OpenEBS Mayastor is seeing tremendous growth in terms of users trying it out and providing feedback. A lot of work in this release has gone into fixing issues, enhancing the e2e tests and control plane, and adding initial support for snapshots. For further details on enhancements and bug fixes in Mayastor, please refer to [Mayastor](https://github.com/openebs/Mayastor/).

### Key Improvements

- Enhanced Node Disk Manager (NDM) to discover dm devices like loopback devices, `luks` encrypted devices, and create Block Device resources.  
- Enhanced the NDM block device tagging feature to reserve a block device from being assigned to Local PV (device) or cStor data engines. The block device can be reserved by specifying an empty value for the block device tag.
- Added support to install ZFS Local PV using Kustomize. Also updated the default upgrade strategy for the ZFS CSI driver to run in parallel instead of rolling upgrades.
- Several enhancements and fixes from the Community towards OpenEBS documentation, build and release scripts from the Hacktoberfest participation. 

### Key Bug Fixes

- Fixed an issue with the upgrade of cStor and Jiva volumes in cases where volumes are provisioned without enabling monitoring side car.
- Fixed an issue with the upgrade that would always set the image registry as`quay.io/openebs`, when upgrade job doesn't specify the registry location. The upgrade job will now fallback to the registry that is already configured on the existing pods.


**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.3.0)
- [Upgrade Steps](/docs/next/upgrade.html)

<br>

## 2.2.0 - Oct 15 2020

### New capabilities

- OpenEBS ZFS Local PV adds support for Incremental Backup and Restore by enhancing the OpenEBS Velero Plugin. For detailed instructions to try this feature, please refer to this [doc](https://github.com/openebs/zfs-localpv/blob/master/docs/backup-restore.md). 

- OpenEBS Mayastor instances now expose a gRPC API which is used to enumerate block disk devices attached to the host node, as an aid to the identification of suitable candidates for inclusion within storage Pools during configuration. This functionality is also accessible within the `mayastor-client` diagnostic utility. For further details on enhancements and bug fixes in Mayastor, please refer to [Mayastor release notes](https://github.com/openebs/Mayastor/releases/tag/v0.5.0).


### Key Improvements

- Enhanced the Velero Plugin to restore ZFS Local PV into a different cluster or a different node in the cluster. This feature depends on the Velero `velero.io/change-pvc-node: RestoreItemAction` feature.  https://github.com/openebs/velero-plugin/pull/118.

- The Kubernetes custom resources for managing cStor Backup and Restore have been promoted to v1. This change is backward compatible with earlier resources and transparent to users. When the SPC resources are migrated to CSPC, the related Backup/Restore resources on older volumes are also upgraded to v1. https://github.com/openebs/upgrade/pull/59.

- Enhanced the SPC to CSPC migration feature with multiple usability fixes like supporting migrating multiple volumes in parallel. https://github.com/openebs/upgrade/pull/52, ability to detect the changes in the underlying virtual disk resources (BDs) and automatically update them in CSPC https://github.com/openebs/upgrade/pull/53. Prior to this release, when migrating to CSPC, the user need to manually update the BDs. 

- Enhanced the Velero Plugin to use custom certificates for S3 object storage. https://github.com/openebs/velero-plugin/pull/115.

- Enhanced cStor Operators to allow users to specify the name of the new node for a previously configured cStor Pool. This will help with scenarios where a Kubernetes node can be replaced with a new node but can be attached with the block devices from the old node that contain cStor Pool and the volume data. https://github.com/openebs/cstor-operators/pull/167.

- Enhanced NDM OS discovery logic for nodes that use `/dev/root` as the root filesystem. https://github.com/openebs/node-disk-manager/pull/492.

- Enhanced NDM OS discovery logic to support excluding multiple devices that could be mounted as host filesystem directories. https://github.com/openebs/node-disk-manager/issues/224.

### Key Bug Fixes

- Fixes an issue where NDM could cause data loss by creating a partition table on an uninitialized iSCSI volume. This can happen due to a race condition between NDM pod initializing and iSCSI volume initializing after a node reboot and if the iSCSI volume is not fully initialized when NDM probes for device details. This issue has been observed with NDM 0.8.0 released with OpenEBS 2.0 and has been fixed in OpenEBS 2.1.1 and OpenEBS 2.2.0 (latest) release. 


**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.2.0)
- [Upgrade Steps](/docs/next/upgrade.html)

<br>

## 2.1.0 - Sept 15 2020


### New capabilities:
- OpenEBS ZFS Local PV adds support for Backup and Restore by enhancing the OpenEBS Velero Plugin. For detailed instructions to try this feature, please refer to this [doc](https://github.com/openebs/zfs-localpv/blob/master/docs/backup-restore.md). 
- OpenEBS Mayastor continues its momentum by enhancing support for Rebuild and other fixes. For detailed instructions on how to get started with Mayastor please refer to this [Quickstart guide](https://mayastor.gitbook.io/introduction/).


### Key Improvements:

- Enhanced the Velero Plugin to perform Backup of a volume and Restore of another volume to run simultaneously. 
- Added a validation to restrict OpenEBS Namespace deletion if there are pools are volumes are configured. The validation is added via Kubernetes admission webhook.  
- Added support to restrict creation of cStor Pools (via CSPC) on Block Devices that are tagged (or reserved). 
- Enhanced the NDM to automatically create a block device tag on the discovered device if the device matches a certain path name pattern. 

### Key Bug Fixes:

- Fixes an issue where local backup and restore of cStor volumes provisioned via CSI were failing. 
- Fixes an issue where cStor CSI Volume remount would fail intermittently when application pod is restarted or after recovering from a network loss between application pod and target node. 
- Fixes an issue where BDC cleanup by NDM would cause a panic, if the bound BD was manually deleted. 


**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.1.0)
- [Upgrade Steps](/docs/next/upgrade.html)

## 2.0.0 - Aug 15 2020


### Key Improvements:

- OpenEBS cStor provisioning with the new schema and CSI drivers has been declared as _beta_. For detailed instructions on how to get started with new cStor Operators please refer to the [Quick start guide](https://github.com/openebs/cstor-operators).
- Significant improvements to NDM in supporting (and better handling) of partitions and virtual block devices across reboots. 
- Enhanced the Jiva target controller to track the internal snapshots and re-claim the space.
- Support for enabling/disabling leader election mechanism which involves interacting with kube-apiserver. In deployments where provisioners are configured with single replicas, the leader election can be disabled. The default value is enabled. The configuration is controlled via environment variable "LEADER_ELECTION" in operator yaml or via helm value (enableLeaderElection).

### Key Bug Fixes:

- Fixes an issue where NDM would fail to wipe the filesystem of the released sparse block device. 
- Fixes an issue with the mounting of XFS cloned volume. 
- Fixes an issue when PV with fsType: ZFS will fail if the capacity is not a multiple of record size specified in StorageClass. 

### Other Updates:

- OpenEBS Mayastor continues its momentum by adding support for Rebuild, NVMe-oF Support, enhanced supportability, and several other fixes. For detailed instructions on how to get started with Mayastor please refer to this [Quickstart guide](https://github.com/openebs/Mayastor/blob/develop/deploy/README.md).
- Continuing the focus on additional integration and e2e tests for all engines, more documentation. 


**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v2.0.0)
- [Upgrade Steps](/docs/next/upgrade.html)

## 1.12.0 - Jul 15 2020


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
- The first release of OpenEBS Mayastor developed using NVMe based architecture, targeting at addressing performance requirements of IO-intensive workloads is ready for alpha testing. For detailed instructions on how to get started with Mayastor please refer to this [Quickstart guide](https://github.com/openebs/Mayastor/blob/master/doc/quick.md). 
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



<br>

## See Also:

### [OpenEBS Upgrade](/docs/next/upgrade.html)

### [Deprecated OpenEBS 1.x Releases](/docs/next/releases-0x.html)

### [Deprecated OpenEBS 0.x Releases](/docs/next/releases-0x.html)

### [OpenEBS FAQ](/docs/next/faq.html)

### [Container Attached Storage or CAS](/docs/next/cas.html)

<br><hr>

<br>

