---
id: alphafeatures
title: Alpha Features
sidebar_label: Alpha Features
---
------



This page provides an overview of OpenEBS components and features presently in Alpha version and under active development. These features are not recommended to be used in production. We suggest you to familiarize and try these features on test clusters and reach out to [OpenEBS Community](/v1110/docs/next/support.html) if you have any queries, feedback or need help on these features.

The list of alpha features include:
- [Mayastor](#mayastor)
- [ZFS Local PV](#zfs-local-pv)
- [cStor CSI Driver](#cstor-csi-driver)
- [NDM - Discover Partitions](#ndm-discover-partitions)
- [Support for ARM64](#support-for-arm64)

  :::note
  Upgrade is not supported for features in Alpha version.
  :::


## Mayastor

OpenEBS Mayastor developed using NVMe based architecture, targeted at addressing performance requirements of IO-intensive workloads is ready for alpha testing. For detailed instructions on how to get started with Mayastor please refer this [Quick-start guide](https://github.com/openebs/Mayastor/blob/develop/deploy/README.md).

The following features are supported:
- Creation of a Mayastor pool using block device attached to the node.
- CSI driver for managing Mayastor Volumes.
- Support for accessing the Mayastor Volumes using iSCSI and NBD
- Kubernetes Custom Resources for Mayastor Pool and Volumes, and Mayastor Storage Volume” (MSV) showing the status of the Volume.
- Support for Prometheus metrics and sample Grafana dashboard
- Workload protection via n-way synchronous replication (experimental)
- Shown to deliver significantly greater performance than Jiva and cStor engines

## ZFS Local PV

OpenEBS is developing a CSI driver for provisioning Local PVs that are backed by ZFS. ZFS Local PVs combine the ease of use of Local PVs with the stability and resiliency offered by ZFS against disk failures. As a Kubernetes SRE, you can setup ZFS Pools on the Kubernetes Worker nodes and make use of the OpenEBS ZFS Local PV to dynamically provision volumes backed by ZFS Datasets. 

For additional details and detailed instructions on how to get started with OpenEBS ZFS Local PV please refer this [Quickstart guide](https://github.com/openebs/zfs-localpv#usage).

The following features are supported:
- CSI driver for managing ZFS Local Volumes.
- Kubernetes Custom Resources for ZFS Local Volume showing the configuration and status of the Volume.
- Snapshots and Clones
- Scheduling Volumes based on the load per node. 
- Setup ZFS encryption
- Volume Resize
- Volume provisioned as Raw Block Mode
- Volume provisioned with Filesystem types - ZFS, XFS or Ext4
- Support for Prometheus metrics and sample Grafana dashboard


## cStor CSI Driver

OpenEBS cStor CSI Driver along with enhanced schema and cStor Operators that are aimed at automating the Day 2 Operations like:
- cStor Pool expansion by adding disk.
- Adding and removing cStor Pool.
- Replacing a failed/slow Block Device from cStor Pool with a new Block device.
- Scale-up/scale-down cStor Volume Replicas.
- cStor Volume capacity expansion.

For detailed instructions on how to get started with the new cStor operators please refer this [Quick-start guide](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md).


## NDM - Discover Partitions 

OpenEBS 1.10 added a feature in NDM to help with discovering partitions and virtual drives that don't have any uniquely identifiable attributes like a serial number or WWN. This feature makes use of the partition/filesystem id if it exists or will create a partition on an empty block device and use that partition id for unique identification. 

This feature is not yet ready for production use cases and can be enabled via a feature gate flag. The feature gate can be enabled by:
- adding an additional arg (`--feature-gates=GPTBasedUUID`) to NDM DaemonSet or 
- via Helm flag `featureGates.GPTBasedUUID.featureGateFlag=GPTBasedUUID`

## Support for ARM64 

OpenEBS 1.10 support arm64 images for cStor, Jiva and Local PV engines. The ARM64 version of OpenEBS can be deployed using the following [YAML](https://openebs.github.io/charts/openebs-operator-arm-dev.yaml). 

Active development is under way to support multi-arch images. If you would like to help out with testing or building the multi-arch images, please reach out to [OpenEBS Community](/v1110/docs/next/support.html).



<hr>

<br>
