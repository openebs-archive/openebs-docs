---
id: localpv
title: OpenEBS Local PV 
sidebar_label: Local PV
---
------

<br>

## Overview

OpenEBS provides Dynamic PV provisioners for [Kubernetes Local Volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local). A local volume implies that storage is available only from a single node.  A local volume represents a mounted local storage device such as a disk, partition or directory. 

As the Local Volume is accessible only from a single node, local volumes are subject to the availability of the underlying node and are not suitable for all applications. If a node becomes unhealthy, then the local volume will also become inaccessible, and a Pod using it will not be able to run. Applications using local volumes must be able to tolerate this reduced availability, as well as potential data loss, depending on the durability characteristics of the underlying disk.


## Use Cases

Examples of good workloads that can benefit from local volumes are: 

- Replicated databases like MongoDB, Cassandra
- Stateful workloads that can be configured with their own high-availability configuration like Elastic, MinIO 
- Edge workloads that typically run on a single node or in Single node Kubernetes Clusters.

OpenEBS helps users to take local volumes into production by providing features that are currently missing in Kubernetes like:

- Dynamic PV Provisioners for local volumes.
- Local Volumes backed by hostpath on filesystems like Ext3, XFS or ZFS.
- Monitoring the health of underlying devices or storage used to create Local Volumes. 
- Capacity management features like over-provisioning and/or quota enforcement. 
- Make use of the underlying storage capabilities like snapshot, clone, compression and so forth when local volumes are backed by advanced filesystem like ZFS. 
- Backup and Restore via Velero. 
- Secure the local volumes via LUKS or by using in-build encryption support of the underlying filesystem like ZFS.

## Quick Start Guides

OpenEBS provides different types of Local Volumes that can be used to provide locally mounted storage to Kubernetes Stateful workloads. Follow these guides to get started with each type of Local Volume. 

- [OpeneBS Local PV using Hostpath](/docs/next/uglocalpv-hostpath.html)
- [OpeneBS Local PV using Block Devices](/docs/next/uglocalpv.html)


## When to use OpenEBS Local PVs

- High performance is needed by those applications which manage their own replication, data protection and other features such as snapshots and clones.
- When local disks need to be managed dynamically and monitored for impending notice of them going bad.



## When not to use OpenEBS Local PVs

- When applications expect replication from storage.
- When the volume size may need to be changed dynamically but the underlying disk is not resizable. 


## Limitations (or Roadmap items ) of OpenEBS Local PVs

- Size of the Local PV cannot be increased dynamically. LVM type of functionality inside Local PVs is a potential feature in roadmap.
- Disk quotas are not enforced by Local PV. An underlying device or hostpath can have more data than requested by a PVC or storage class. Enforcing the capacity is a roadmap feature.
- Enforce capacity and PVC resource quotas on the local disks or host paths.
- SMART statistics of the managed disks is also a potential feature in roadmap.

<br>

<hr>

## See Also:

### [OpenEBS Architecture](/docs/next/architecture.html)

### [Understanding NDM](/docs/next/ndm.html)

### [Local PV Hostpath User Guide](/docs/next/uglocalpv-hostpath.html)

### [Local PV Device User Guide](/docs/next/uglocalpv.html)

<br>

<hr>

<br>

