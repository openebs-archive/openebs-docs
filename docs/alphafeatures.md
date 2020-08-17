---
id: alphafeatures
title: Alpha Features
sidebar_label: Alpha Features
---
------



This page provides an overview of OpenEBS components and features presently in Alpha version and under active development. These features are not recommended to be used in production. We suggest you to familiarize and try these features on test clusters and reach out to [OpenEBS Community](/docs/next/support.html) if you have any queries, feedback or need help on these features.

The list of alpha features include:
- [Mayastor](#mayastor)
- [Dynamic Local PV - Rawfile](#dynamic-local-pv-rawfile)
- [Support for ARM64](#support-for-arm64)

  :::note
  Upgrade is not supported for features in Alpha version.
  :::


## Mayastor

OpenEBS Mayastor developed using NVMe based architecture, targeted at addressing performance requirements of IO-intensive workloads is ready for alpha testing. For detailed instructions on how to get started with Mayastor please refer this [Quick-start guide](https://github.com/openebs/Mayastor/blob/develop/deploy/README.md).

The following features are supported:
- Creation of a Mayastor pool using block device attached to the node or by direct connection to existing iSCSI or NVMe-oF exports.
- CSI driver for managing Mayastor Volumes.
- Support for accessing the Mayastor Volumes using iSCSI and NVMe-oF TCP
- Kubernetes Custom Resources for Mayastor Pool and Volumes, and Mayastor Storage Volume” (MSV) showing the status of the Volume.
- Support for Prometheus metrics and sample Grafana dashboard
- Workload protection via n-way synchronous replication (experimental)
- Shown to deliver significantly greater performance than Jiva and cStor engines

## Dynamic Local PV - Rawfile

OpenEBS is developing a CSI driver for provisioning Local PVs that are backed by hostpath. 

For additional details and detailed instructions on how to get started with OpenEBS Local PV - Rawfile please refer this [Quickstart guide](https://github.com/openebs/rawfile-localpv).

## Support for ARM64 

Since version 1.10, OpenEBS supports arm64 images for cStor, Jiva and Local PV engines. The ARM64 version of OpenEBS can be deployed using the following [YAML](https://openebs.github.io/charts/openebs-operator-arm-dev.yaml). 

Active development is under way to support multi-arch images. If you would like to help out with testing or building the multi-arch images, please reach out to [OpenEBS Community](/docs/next/support.html).



<hr>

<br>
