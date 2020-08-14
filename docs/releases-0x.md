---
id: releases-0x
title: OpenEBS 0.x Releases
sidebar_label: Releases 0.x
---

------

<br>

## 0.9.0 - May 24 2019

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::


**Change summary:**

- Enhanced the cStor Data Engine containers to contain troubleshooting utilities.
- Enhanced cStor Data Engine to allow interoperability of cStor Replicas across different versions. 
- Support for using Block Devices for OpenEBS Local PV.
- Support for Dynamic Provisioning of Local PV
- Enhanced the cStor Volumes to support Backup/Restore to S3 compatible storage using the incremental snapshots supported by cStor Volumes.
- Enhanced the cStor Volume Replica to support an anti-affinity feature that works across PVs.
- Enhanced the cStor Volume to support scheduling the cStor Volume Targets along side the application pods that interacts with the cStor Volume.
- Enhances the Jiva Volume provisioning to provide an option called DeployInOpenEBSNamespace.
- Enhanced the cStor Volume Provisioning to be customized for varying workload or platform type during the volume provisioning.
- Enhanced the cStor Pools to export usage statistics as prometheus metrics.
- Enhanced the Jiva Volume replica rebuild process by eliminating the need to do a rebuild if the Replica already has all the required data to serve the IO.
- Enhanced the Jiva Volume - replica provisioning to pin the Replica’s to the nodes where they are initially scheduled using Kubernetes nodeAffinity.
- Fixes an issue where NDM pods failed to start on nodes with selinux=on.
- Fixes an issue where cStor Volume with single replicas were shown to be in Degraded, rebuilding state.
- Fixes an issue where user was able to delete a PVC, even if there were clones created from it, resulting in data loss for the cloned volumes.
- Fixes an issue where cStor Volumes failed to provision if the `/var/openebs/` directory was not editable by cStor pods like in the case of SuSE Platforms.
- Fixes an issue where Jiva Volume - Target can mark a replica as offline if the replica takes longer than 30s to complete the sync/unmap IO.
- Fixes an issue with Jiva volume - space reclaim thread, that was erroring out with an exception if the replica is disconnected from the target. 

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/0.9) 

## 0.8.2 - Apr 15 2019

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Enhanced the metrics exported by cStor Pools to include details of the provisioning errors.
- Fixed an issue causing cStor Volume Replica CRs to be stuck, when the OpenEBS namespace was being deleted.
- Fixed an issue where a newly added cStor Volume Replica may not be successfully registered with the cStor target, if the cStor tries to connect to Replica before the replica is completely initialised.
- Fixed an issue with Jiva Volumes where target can mark the Replica as Timed out on IO, even when the Replica might actually be processing the Sync IO.
- Fixed an issue with Jiva Volumes that would not allow for Replicas to re-connect with the Target, if the initial Registration failed to successfully process the hand-shake request.
- Fixed an issue with Jiva Volumes that would cause Target to restart when a send diagnostic command was received from the client
- Fixed an issue causing PVC to be stuck in pending state, when there were more than one PVCs associated with an Application Pod
- Toleration policy support for cStorStoragePool.


**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/0.8.2)


## 0.8.1 - Feb 23 2019

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Ephemeral Disk Support
- Enhanced the placement of cStor volume replica in a distributed randomly between the available pools.
- Enhanced the NDM to fetch additional details about the underlying disks via SeaChest.
- Enhanced the NDM to add additional information to the DiskCRs like if the disks is partitioned or has a filesystem on it.
- Enhanced the OpenEBS CRDs to include custom columns to be displayed using  `kubectl get ` output of the CR. This feature requires K8s 1.11 or higher.
- Fixed an issue where cStor volume causes timeout for iSCSI discovery command and can potentially trigger a K8s vulnerability that can bring down a node with high RAM usage.

**Addition details:**
- [Release Blog](https://openebs.io/blog/openebs-releases-0-8-1-with-stability-fixes-and-improved-documentation/)
- [Release Notes](https://github.com/openebs/openebs/releases/tag/0.8.1) 


## 0.8.0 - Dec 07 2018

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- cStor Snapshot & Clone
- cStor volume & Pool runtime status
- Target Affinity for both Jiva & cStor
- Target namespace for cStor
- Enhance the volume metrics exporter
- Enhance Jiva to clear up internal snapshot taken during Replica rebuild
- Enhance Jiva to support sync and unmap IOs
- Enhance cStor for recreating pool by automatically selecting the disks.

**Additional details:**
- [Release Blog](https://openebs.io/blog/openebs-0-8-release-allows-you-to-snapshot-and-clone-cstor-volumes/)
- [Release Notes](https://github.com/openebs/openebs/releases/tag/0.8)

## 0.7.2 - Nov 20 2018

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Fixes an issue where cStor volume used space was showing a very low value than actually used.
- Fixes an issue where cStor replica snapshots created for the rebuild were not deleted, causing space reclamation to fail.
- Support for clearing space used by Jiva replica after the volume is deleted using Cron Job.
- Support for a storage policy that can disable the Jiva Volume Space reclaim.
- Support Target Affinity fort Jiva target Pod on the same node as the Application Pod.
- Enhanced Jiva related to internal snapshots for rebuilding Jiva.
- Enhanced exporting cStor volume metrics to prometheus

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/0.7.2)

## 0.7.0 - Sep 09 2018

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Enhanced NDM to discover block devices attached to Nodes.
- Alpha support for cStor Engine
- Naming convention of Jiva Storage pool as 'default' and StorageClass as 'openebs-jiva-default'
- Naming convention of cStor Storage pool as 'cstor-sparse-pool' and StorageClass as 'openebs-cstor-sparse'
- Support for specifying replica count,CPU/Memory Limits per PV,Choice of  Storage Engine, Nodes on which data copies should be copied.

**Additional details:**
- [Release Blog](https://openebs.io/blog/openebs-0-7-release-pushes-cstor-storage-engine-to-field-trials/)
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.7)


## 0.6.0 - Jul 20 2018

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Fixes an issue where jiva replica data was not clean up if the PVC and its namespace were deleted prior to scrub job completion.
- Fixes an issue where jiva replicas failed to register with its target if there was an error during initial registration.
- Integrate the Volume Snapshot capabilities with Kubernetes Snapshot controller.
- Enhance maya-apiserver to use CAS Templates for orchestrating new Storage Engines.
- Enhance mayactl to show details about replica and Node details where replicas are running.
- Enhance maya-apiserver to schedule Replica Pods on specific nodes using nodeSelector.
- Enhance e2e tests to simulate chaos at different layers such as - CPU, RAM, Disk, Network, and Node.
- Enhanced Jiva volume to handle more read only volume  scenarios


**Additional details:**
- [Release Blog](https://openebs.io/blog/openebs-0-6-serves-ios-amidst-chaos-and-much-more/)
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.6)

## 0.5.4 - May 14 2018

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Fixes an issue where NDM would create a partitioned OS device as a block device.
- Provision to specify filesystems other than ext4 (default).
- Support for XFS filesystem format for mongodb StatefulSet using OpenEBS Persistent Volume.
- Increased integration test & e2e coverage in the CI
- OpenEBS is now available as a stable chart from Kubernetes 


**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.4)

## 0.5.3 - Mar 14 2018

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Fixes an issue where jiva replica data was not clean up if the PVC and its namespace were deleted prior to scrub job completion.
- Fixed usage of StoragePool issue when RBAC settings are applied
- Enhanced memory consumption usage for Jiva Volume

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.3)

## 0.5.2 - Feb 07 2018

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Support to set non-SSL Kubernetes endpoints to use by specifying the ENV variables on  maya-apiserver and  openebs-provisioner.

**Additional details:**
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.2)

## 0.5.1 - Jan 10 2018

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Upgraded the base ubuntu images for the containers to fix the security vulnerabilities reported in Ubuntu Xenial.
- Support to use Jiva volume from CentOS iSCSI Initiator
- Support openebs-k8s-provisioner to be launched in non-default namespace


**Additional details:** 
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.1)

## 0.5.0 - Nov 30 2017

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Enhanced Storage Policy Enforcement Framework for Jiva.
- Extend OpenEBS API Server to expose volume snapshot API.
- Support for deploying OpenEBS via helm charts.
- Sample Prometheus configuration for collecting OpenEBS Volume Metrics.
- Sample Grafana OpenEBS Volume Dashboard - using the prometheus Metrics

**Additional details:**
- [Release Blog](https://openebs.io/blog/openebs-0-5-enables-storage-policies-for-kubernetes-persistent-volumes/)
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.0)

## 0.4.0 - Sep 08 2017

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Enhanced MAYA cli support for managing snapshots,usage statistics.
- Support OpenEBS Maya API Server uses the Kubernetes scheduler logic to place OpenEBS Volume Replicas on different nodes
- Support Extended deployment of OpenEBS in AWS.
- Support OpenEBS can be deployed in a minikube setup.
- Enhanced openebs-k8s-provisioner to recover from crashloopbackoff state

**Additional details:**
- [Release Blog](https://openebs.io/blog/quick-update-on-openebs-v0-4-a-developer-friendly-release/)
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.4.0)

## 0.3.0 - Jun 29 2017

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Support OpenEBS hyper-converged with Kubernetes Minion Nodes.
- Enable OpenEBS via the openebs-operator.yaml
- Supports creation of OpenEBS volumes using Dynamic Provisioner.
- Storage functionality and Orchestration/Management functionality is delivered as container images on DockerHub.

**Additional details:**
- [Release Blog](https://openebs.io/blog/openebs-on-the-growth-path-releases-0-3/)
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.3)

## 0.2.0 - Apr 07 2017

:::note Deprecation notice
This release has been deprecated. Please upgrade to the latest release. See [upgrade instructions](/v1120/docs/next/upgrade.html).
:::

**Change summary:**
- Integrated OpenEBS FlexVolume Driver and Dynamically Provision OpenEBS Volumes into Kubernetes.
- Support Maya api server to provides new AWS EBS-like API for provisioning Block Storage.
- Enhanced Maya api server to Hyper Converged with Nomad Scheduler.
- Backup/Restore Data from Amazon S3.
- Node Failure Resiliency Fixes

**Additional details:** 
- [Release Blog](https://openebs.io/blog/openebs-sprinting-ahead-0-2-released/)
- [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.2)

<br>



## See Also:

### [OpenEBS Upgrade](/v1120/docs/next/upgrade.html)

### [OpenEBS Releases](/v1120/docs/next/releases.html)

### [OpenEBS FAQ](/v1120/docs/next/faq.html)

### [Container Attached Storage or CAS](/v1120/docs/next/cas.html)

<br><hr>

<br>

