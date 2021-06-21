---
id: casengines
title: OpenEBS Data Engines
sidebar_label: Data Engines
---

------

## Overview 

<br/>
OpenEBS Data Engine is the core component that acts as an end-point for serving the IO to the applications. 
<br/>
<img src="/docs/assets/app-engine-node-capabilities.svg" alt="drawing" width="50%" align="right"/>

Stateful Applications and their capabilities have changed drastically as they have adopted the cloud native and micro-services patterns. This change has led to a shift in the needs of what applications need from the storage layer. For instance, `etcd` is itself an Stateful workload that runs within Kubernetes and all it needs is a fast local storage. The availability and durability aspects are built into the `etcd` implementation itself. 

OpenEBS provides a set of Data Engines, where each of the engines is built and optimized for different needs of the application and the capabilities available on the Kubernetes nodes.

Platform SRE or administrators typically select one or more [data engines](#data-engine-capabilities) to be used in their Kubernetes cluster. The selection of the data engines depend on the following two aspects:
- [Node Resources or Capabilities](#node-capabilities)
- [Stateful Application Capabilities](#stateful-workload-capabilities)

<br/>

## Node Capabilities

Node Resources or Capabilities refer to the CPU, RAM, Network and Storage available to Kubernetes nodes. To run a stateful workloads and what data engines to be used depend on a few aspects like:
- Are the nodes ephemeral? During upgrades is the same node made available or a new node provisioned in its place? Do the nodes have ephemeral storage (Virtual Disks) or storage devices (Disks, Cloud/SAN Volumes)?
- What type of storage devices are attached to node - HDDs or SSDs, how are they connected and how many?
- How much RAM or CPU can be allocated to providing the storage services?

Depending on the node or cluster capabilities, the recommended engines are:

| Node Capabilities                             | Jiva    |  cStor   |  Mayastor  | LocalPV  | 
| ----------------------------------------------| :---:   | :------: | :--------: | :------: |
| Single node cluster                           | No      |   No     | No         | Yes      |
| NVMe (high performant) Storage Devices        | No      |   No     | Yes        | Yes      |
| Large/medium node instances(>4 CPU, >8GB  RAM)| No      |   No     | Yes        | Yes      |
| Multi node cluster                            | Yes     |   Yes    | Yes        | Yes      |
| Persistent Storage Devices (Cloud/SAN/DAS)    | Yes     |   Yes    | Yes        | Yes      |
| SAS/SATA Storage Devices or HDD               | Yes     |   Yes    | Yes        | Yes      |
| Small node instances (<4 CPU, <8GB RAM)       | Yes     |   Yes    | Yes        | Yes      |
| Ephemeral Nodes                               | Yes     |   Yes    | Yes        | No       |
| Ephemeral Storage Devices                     | Yes     |   Yes    | Yes        | No       |

## Stateful Workload Capabilities

State is an integral part of any application often times, used without realizing that it actually exists. Examples of Stateful Applications include SQL/NoSQL Database, Object and Key/Value stores, Message Bus, Storage systems optimized to store Logs and Metrics, Code/Container/Configuration Repositories, and many more. Each stateful applications comes with a certain capabilities and depends on the storage for complimentary capabilities. For example:
- Stateful workloads like MongoDB have availability features like protecting against node failures built into them. Such systems will expect the Data engines to provide capacity and performance required with the data consistency/durability at the block level.
- Stateful workloads like Cassandra can benefit from the availability features from the data engines as it might help speed up the rebuild times required to rebuild a failed cassandra node. However this comes at the cost of using extra storage by the data engines. 
- With serverless and cloud native becoming mainstream a key shift has been in terms of the capacity required and the duration for which that capacity may be required. These are applications that are launched as part of the DevSecOps pipelines where a PostgreSQL or other types of systems may be launched to run for a few minutes, hours or days and then the resulting information is saved in another storage system and this instance is itself deprovisioned. 

Depending on the Stateful workload capabilities, the recommended engines are:
| Stateful Workload Capabilities                       | Jiva    |  cStor   |  Mayastor  | LocalPV  | 
| -----------------------------------------------------| :---:   | :------: | :--------: | :------: |
| Pod can be pinned to a single node                   | Yes     |   Yes    | Yes        | Yes      |
| Pod are short lived and can be restarted on same node| Yes     |   Yes    | Yes        | Yes      |
| Pod when moved can rebuild its data                  | Yes     |   Yes    | Yes        | Yes      |
| Pod when moved to new node, can't rebuild its data   | Yes     |   Yes    | Yes        | No       |
| Pod need resiliency against device faults/error      | Yes     |   Yes    | Yes        | No*      |
| Pod needs to move across nodes in cluster            | Yes     |   Yes    | Yes        | No       |
| Needs need incremental snapshots and backups         | No      |   Yes    | Yes**      | No       |

Notes:
- __*__ Some flavors of Local PV support RAID/Mirroing to protect against disk failures
- --**__ Support for incremental snapshots/backups is not yet implemented in Mayastor 


## Data Engine Capabilities

Data Engines are what maintain the actual state generated by the Stateful applications and are concerned about providing enough storage capacity to store the state and ensure that state remains intact over its lifetime. For instance state can be generated once, accessed over a period of next few minutes or days or modified or just left to be retrieved after many months or years. The capabilities provided by the data engines can be classified as follows:

All OpenEBS Data Engines support:
- Dynamic Provisioning of Persistent Volumes
- Strong Data Consistency 

Below table identifies few differences among the different OpenEBS CAS engines. 

| Feature                                      | Jiva    |  cStor   |  Mayastor  | LocalPV  | 
| -------------------------------------------- | :---:   | :------: | :--------: | :------: |
| Near disk performance                        |  No     |   No     | Yes        | Yes      |
| Full Backup and Restore using Velero         |  Yes    |   Yes    | Yes        | Yes      |
| Synchronous replication                      |  Yes    |   Yes    | Yes        | No       |
| Protect against node failures (replace node) |  Yes    |   Yes    | Yes        | No       |
| Use with ephemeral storage on nodes          |  Yes    |   Yes    | Yes        | No       |
| Thin Provisioning                            |  Yes    |   Yes    | Yes        | Yes**    |
| Suitable for high capacity (>50GB) workloads |  No*    |   Yes    | Yes        | Yes**    |
| On demand capacity expansion                 |  No     |   Yes    | Planned    | Yes**    |
| Snapshots                                    |  No     |   Yes    | Planned    | Yes**    |
| Clones                                       |  No     |   Yes    | Planned    | Yes**    |
| Disk pool or aggregate support               |  No*    |   Yes    | Planned    | Yes**    |
| Disk resiliency (RAID support )              |  No*    |   Yes    | Planned    | Yes**    |
| Incremental Backups                          |  No     |   Yes    | Planned    | No**     |


Notes:
- _*_ In case of Jiva data engine, the data is saved in sparse files within a mounted hostpath. This impacts the following:
  - Disk level pooling or RAID has to be taken care by the Administrator by using LVM or md-raid and then mount the resulting volume for use by Jiva engine. 
  - As the capacity of the volume increases - the rebuild times of the volumes will increase. This can result in volumes becoming inaccessible if more than one node in the cluster fails at the same time. 

- _**_ In case of Local PV - there are multiple flavors which determine the availability of the features. For example: 
  - Disk Pool or Resiliency is only available for LVM and ZFS based Local PVs. 
  - Snapshot feature is only available for LVM and ZFS based Local PVs. 
  - Clone feature is only available for ZFS based Local PVs. 
  - ZFS based local PV support a plugin based incremental Backups, while the remaining types of Local PV only support Restic based full backup.

<br/>

OpenEBS data engines can be classified into two categories.

## Local Engines

OpenEBS Local Engines can create persistent volumes or PVs out of local disks or hostpaths or using the volume managers like LVM or ZFS on the Kubernetes worker nodes. Local Engines are well suited for cloud native applications that have the availability, scalability features built into them. Local Engines are also well suited for stateful workloads that are short lived like Machine Learning jobs or Edge cases where there is a single node Kubernetes cluster. 

Depending on the type of storage attached to the Kubernetes worker nodes and your preference of local filesystem, you can select from different flavors of Dynamic [Local PV](/docs/next/localpv.html) - Hostpath, Device, LVM, ZFS or Rawfile.
- [Local PV hostpath](/docs/next/uglocalpv-hostpath.html)
- [Local PV device](/docs/next/uglocalpv-device.html)
- [ZFS Local PV](https://github.com/openebs/zfs-localpv)
- [LVM Local PV](https://github.com/openebs/lvm-localpv)
- [Rawfile Local PV](https://github.com/openebs/rawfile-localpv)

:::note
Local Volumes are only available from the the node on which the persistent volume is created. If that node fails, the application pod will not be re-scheduled to another node.
:::


## Replicated Engines

Replicated Volumes as the name suggests, are those that can synchronously replicate the data to multiple nodes. These engines provide protection against node failures, by allowing the volume to be accessible from one of the other nodes where the data was replicated to. The replication can also be setup across availability zones helping applications move across availability zones.  Replicated Volumes also are capable of enterprise storage features like snapshots, clone, volume expansion and so forth. 

Depending on the type of storage attached to your Kubernetes worker nodes and application performance requirements, you can select from [Jiva](/docs/next/jiva.html), [cStor](/docs/next/cstor.html) or [Mayastor](/docs/next/mayastor.html). 

- [Mayastor](/docs/next/ugmayastor.html)
- [cStor](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md)
- [Jiva](https://github.com/openebs/jiva-operator)

:::note
An important aspect of the OpenEBS Data Layer is that each volume replica is a full copy of the data. This leads to the following capacity constraints that need to be kept in mind when using OpenEBS replicated volumes.
- Volumes can only be provisioned with capacity that can be accommodated in a single node by a single storage device or a pool of devices. Volume replica data will not be stripped or sharded across different nodes.
- Depending on the number of replicas configured, OpenEBS will use as many Volume Replicas. Example: A 10GB volume with 3 replicas will result in using 10GB on 3 different nodes where replicas are provisioned.
- Volume Replicas are thin provisioned, so the used capacity will increase only when the applications really write data into Volumes.
- When Volume Snapshots is taken, the snapshot is taken on all its healthy volume replicas
:::

<br>

## When to choose which CAS engine?

As indicated in the above table, each storage engine has it's own advantage. Choosing an engine depends completely on your platform (resources and type of storage), the application workload as well as it's current and future growth in capacity and/or performance. Below guidelines provide some help in choosing a particular engine.



### Ideal conditions for choosing cStor: 

- When you want synchronous replication of data and have multiple disks on the nodes.
- When you are managing storage for multiple applications from a common pool of local or network disks on each node. Features such as thin provisioning, on demand capacity expansion of the pool and volume and on-demand performance expansion of the pool will help manage the storage layer. cStor is used to build Kubernetes native storage services similar to AWS EBS or Google PD on the Kubernetes clusters running on-premise.
- When you need storage level snapshot and clone capability. 
- When you need enterprise grade storage protection features like data consistency, resiliency (RAID protection).



### Ideal conditions for choosing Jiva:

- When you want synchronous replication of data and have a single local disk or a single managed disk such as cloud disks (EBS, GPD) and you don't need snapshots or clones feature.
- Jiva is easiest to manage as disk management or pool management is not in the scope of this engine. A Jiva pool is a mounted path of a local disk or a network disk or a virtual disk or a cloud disk. 
- Jiva is a preferred engine than cStor when
  - Your application does not require snapshots and clones features.
  - When you do not have free disks on the node. Jiva can be used on a ` hostdir` and still achieve replication.
  - When you do not need to expand storage dynamically on local disk. Adding more disks to a Jiva pool is not possible, so the size of Jiva pool is fixed if it on a physical disk. However if the underlying disk is a virtual or network or cloud disk then, it is possible to change the Jiva pool size on the fly.
- Capacity requirements are small. 



### Ideal conditions for choosing OpenEBS hostpath LocalPV:

- When applications are managing replication themselves and there is no need of replication at storage layer. In most such situations, the applications are deployed as `statefulset`.
- When higher performance than Jiva or cStor is desired.
- hostpath is recommended when dedicated local disks are not available for a given application or dedicated storage is not needed for a given application. If you want to share a local disk across many applications host path LocalPV is the right approach.



### Ideal conditions for choosing OpenEBS device LocalPV:

- When applications are managing replication themselves and there is no need of replication at storage layer. In most such situations, the applications are deployed as `statefulset`

- When higher performance than Jiva or cStor is desired.
- When higher performance than hostpath LocalPV is desired.
- When near disk performance is a need. The volume is dedicated to write a single SSD or NVMe interface to get the highest performance.


### Summary

A short summary is provided below.

- LocalPV is preferred if your application is in production and does not need storage level replication.
- cStor is preferred if your application is in production and requires storage level replication.
- Jiva is preferred if your application is small, requires storage level replication but does not need snapshots or clones.
- Mayastor is preferred if your application needs low latency and near disk throughput, requires storage level replication and your nodes have high CPU, RAM and NVMe capabilities. 


<br>

## See Also:

### [Mayastor User Guide](/docs/next/mayastor.html)

### [cStor User Guide](/docs/next/ugcstor.html)

### [Jiva User Guide](/docs/next/jivaguide.html)

### [Local PV Hostpath User Guide](/docs/next/uglocalpv-hostpath.html)

### [Local PV Device User Guide](/docs/next/uglocalpv-device.html)



<br>
<hr>
<br>


