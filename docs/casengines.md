---
id: casengines
title: OpenEBS Data Engines
sidebar_label: Data Engines
---

------

OpenEBS Data Engine is the core component that acts as an end-point for serving the IO to the applications. OpenEBS Data engines are akin to Storage controllers or sometimes also know for implementing the software defined storage capabilities. 

OpenEBS provides a set of Data Engines, where each of the engines is built and optimized for running stateful workloads of varying capabilities and running them on Kubernetes nodes with varying range of resources.

Platform SRE or administrators typically select one or more [data engines](#data-engine-capabilities) to be used in their Kubernetes cluster. The selection of the data engines depend on the following two aspects:
- [Node Resources or Capabilities](#node-capabilities)
- [Stateful Application Capabilities](#stateful-workload-capabilities)

## Node Capabilities

Node Resources or Capabilities refer to the CPU, RAM, Network and Storage available to Kubernetes nodes. 

Based on the CPU, RAM and Network bandwidth available to the nodes, the nodes can be classified as:

* Small Instances that typically have up to 4 cores, 16GB RAM and Gigabit Ethernet
* Medium Instances that typically have up to 16 cores, 32GB RAM and up to 10G Networks
* Large Instances  that typically have more than 16 - even 96 cores, up to 256G or more RAM and 10 to 25G Networks

The Storage to the above instance can be made available in the following ways: 

* Ephemeral storage - where storage is lost when node is taken out of the cluster as part of auto-scaling or upgrades. 
* Cloud Volumes or Network Attached storage - that can be re-attached to new nodes if the older node is removed from cluster. 
* Direct Attached Storage
* Categorize based on the performance of the storage like slow (HDD via SAS), medium (SSD via SAS), fast (SSD or Persistent Flash via NVMe) 

Another key aspect that needs to be considered is the nature of the Kubernetes cluster size:
- Is it for an Edge or Home cluster with single node
- Hyperconverged nodes - where Stateful workload and its storage can be co-located.
- Disaggregated - where Stateful workload and its storage will be served from different nodes. 

The following table summarizes the recommendation for small to medium instances, with HDDs, SSDs limited to 2000 IOPS: 

| Node Capabilities           |                  |                         |                   |
| ----------------------------| :--------------: | :---------------------: | :---------------: |
| Ephemeral Node or Storage   | Non-ephemeral    |   Non-Ephemeral         | Ephemeral         |
| Size of cluster             | Single Node      |   Multiple nodes        | Multiple nodes    |
| Storage Deployment type     | Hyperconverged   |   Hyperconverged        | Disaggregated     |
| Recommended Data Engines    | Local PV         |   Local PV, cStor, Jiva | cStor, Jiva       |

The following table summarizes the recommendation for small to medium instances with fast SSDs capable of higher IOPS and Throughput, typically connected using NVMe: 

| Node Capabilities           |                  |                         |                   |
| ----------------------------| :--------------: | :---------------------: | :---------------: |
| Ephemeral Node or Storage   | Non-ephemeral    |   Non-Ephemeral         | Ephemeral         |
| Size of cluster             | Single Node      |   Multiple nodes        | Multiple nodes    |
| Storage Deployment type     | Hyperconverged   |   Hyperconverged        | Disaggregated     |
| Recommended Data Engines    | Local PV         |   Local PV, Mayastor    | Mayastor          |


## Stateful Workload Capabilities

Often storage is an integral part of any application, used without realizing that it actually exists. 

Storage can be further decomposed into two distinct layers:
- Stateful Workloads or the Data Platform Layer - which comprises of SQL/NoSQL Database, Object and Key/Value stores, Message Bus and so forth.
- Storage engine or Data Engine layer that provides block storage to the Stateful workloads to persist the data onto the storage devices. 

The key features or capabilities provided by the Storage can be classified as: 
- Availability
- Consistency
- Durability
- Performance
- Scalability
- Security
- Ease of Use

With serverless and cloud native becoming mainstream a key shift has happened in terms of how the Stateful workloads are developed, with many of the workloads natively supporting the key storage features like Availability, Consistency and Durability. For example:
- **Distributed:** Stateful workloads like MongoDB have availability features like protecting against node failures built into them. Such systems will expect the Data engines to provide capacity and performance required with the data consistency/durability at the block level.
- **Distributed and Standalone:** Stateful workloads like Cassandra can benefit from the availability features from the data engines as it might help speed up the rebuild times required to rebuild a failed cassandra node. However, this comes at the cost of using extra storage by the data engines. 
- **Standalone:** Stateful workloads like MySQL (standalone) focus more on Consistency and Database features and depending on the underlying data engine for providing Availability, Performance, Durability and other features. 

Each stateful application comes with a certain capabilities and depends on the [data engines](#data- engine-capabilities) for complementary capabilities. The following table summarizes the recommendation on data engines based on the capabilities required by Applications: 

| Workload Type               | Distributed      |  Stand-alone            | Distributed and/or Stand-alone |
| ----------------------------| :--------------: | :---------------------: | :---------------------------:  |
| Required Capabilities       | Performance      |   Availability          | Performance and Availability   |
| Recommended Data Engines    | Local PV         |   Jiva,cStor, Mayastor  | Mayastor                       |


## Data Engine Capabilities

Data Engines are what maintain the actual state generated by the Stateful applications and are concerned about providing enough storage capacity to store the state and ensure that state remains intact over its lifetime. For instance state can be generated once, accessed over a period of next few minutes or days or modified or just left to be retrieved after many months or years. 

All OpenEBS Data Engines support:
- Dynamic Provisioning of Persistent Volumes
- Strong Data Consistency 

OpenEBS data engines can be classified into two categories.

### Local Engines

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

The below table identifies few differences among the different OpenEBS Local engines. 

| Feature                                      | Hostpath  |  Rawfile  |  Device    | ZFS      | LVM      | 
| -------------------------------------------- | :---:     | :------:  | :--------: | :------: | :------: |
| Near disk performance                        |  Yes      |   Yes     | Yes        | No       | Yes      |
| Full Backup and Restore using Velero         |  Yes      |   Yes     | Yes        | Yes      | Yes      |
| Thin Provisioning                            |  Yes      |   Yes     | No         | Yes      | Yes      |
| On demand capacity expansion                 |  Yes      |   Yes     | No         | Yes      | Yes      |
| Disk pool or aggregate support               |  Yes      |   Yes     | No         | Yes      | Yes      |
| Disk resiliency (RAID support )              |  Yes      |   Yes     | No         | Yes      | Yes      |
| Snapshots                                    |  No       |   No      | No         | Yes      | Yes      |
| Incremental Backups                          |  No       |   No      | No         | Yes      | Yes      |
| Clones                                       |  No       |   No      | No         | Yes      | No       |
| Works on OS mounted storage                  |  Yes      |   Yes     | No         | No       | No       |


### Replicated Engines

Replicated Volumes as the name suggests, are those that can synchronously replicate the data to multiple nodes. These engines provide protection against node failures, by allowing the volume to be accessible from one of the other nodes where the data was replicated to. The replication can also be setup across availability zones helping applications move across availability zones.  Replicated Volumes are also capable of enterprise storage features like snapshots, clone, volume expansion and so forth. 

Depending on the type of storage attached to your Kubernetes worker nodes and application performance requirements, you can select from [Jiva](/docs/next/jiva.html), [cStor](/docs/next/cstor.html) or [Mayastor](/docs/next/mayastor.html). 

- [Mayastor](https://mayastor.gitbook.io/introduction/)
- [cStor](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md)
- [Jiva](https://github.com/openebs/jiva-operator)

:::note
An important aspect of the OpenEBS Data Layer is that each volume replica is a full copy of the data. This leads to the following capacity constraints that need to be kept in mind when using OpenEBS replicated volumes.
- Volumes can only be provisioned with capacity that can be accommodated in a single node by a single storage device or a pool of devices. Volume replica data will not be stripped or sharded across different nodes.
- Depending on the number of replicas configured, OpenEBS will use as many Volume Replicas. Example: A 10GB volume with 3 replicas will result in using 10GB on 3 different nodes where replicas are provisioned.
- Volume Replicas are thin provisioned, so the used capacity will increase only when the applications really write data into Volumes.
- When Volume Snapshots is taken, the snapshot is taken on all its healthy volume replicas
:::

Below table identifies few differences among the different OpenEBS Replicated engines. 

| Feature                                      | Jiva    |  cStor   |  Mayastor  | 
| -------------------------------------------- | :---:   | :------: | :--------: |
| Full Backup and Restore using Velero         |  Yes    |   Yes    | Yes        |
| Synchronous replication                      |  Yes    |   Yes    | Yes        |
| Protect against node failures (replace node) |  Yes    |   Yes    | Yes        |
| Use with ephemeral storage on nodes          |  Yes    |   Yes    | Yes        |
| Thin Provisioning                            |  Yes    |   Yes    | Yes        |
| Disk pool or aggregate support               |  Yes    |   Yes    | Planned    |
| Disk resiliency (RAID support )              |  Yes    |   Yes    | Planned    |
| On demand capacity expansion                 |  No     |   Yes    | Planned    |
| Snapshots                                    |  No     |   Yes    | Planned    |
| Clones                                       |  No     |   Yes    | Planned    |
| Incremental Backups                          |  No     |   Yes    | Planned    |
| Suitable for high capacity (>50GB) workloads |  No     |   Yes    | Yes        |
| Near disk performance                        |  No     |   No     | Yes        |


<br>

## When to choose which OpenEBS engine?

As indicated in the above table, each storage engine has its own advantage. Choosing an engine depends completely on your platform (resources and type of storage), the application workload as well as its current and future growth in capacity and/or performance. Below guidelines provide some help in choosing a particular engine.

### Ideal conditions for choosing cStor: 

- When you want synchronous replication of data and have multiple disks on the nodes.
- When you are managing storage for multiple applications from a common pool of local or network disks on each node. Features such as thin provisioning, on demand capacity expansion of the pool and volume will help manage the storage layer. 
- When you want to to build Kubernetes native storage services similar to AWS EBS or Google PD on the Kubernetes clusters running on-premise.
- When you need storage level snapshot and clone capability. 
- When you need enterprise grade storage protection features like data consistency, resiliency (RAID protection).
- When you need to provide cross-az available volumes in Cloud or On-premise. 

Do not use cStor when your underlying storage devices are NVMe SSDs and your applications need high performance. 


### Ideal conditions for choosing Jiva:

- When you want synchronous replication of data and have a single local disk or a single managed disk such as cloud disks (EBS, GPD) and you don't need snapshots or clones feature.
- Jiva is easiest to manage as disk management or pool management is not in the scope of this engine. A Jiva pool is a mounted path of a local disk or a network disk or a virtual disk or a cloud disk. 
- Jiva is a preferred engine than cStor when
  - Your application does not require snapshots and clones features.
  - When you do not have free disks on the node. Jiva can be used on a ` hostdir` and still achieve replication.
  - When you do not need to expand storage dynamically on local disk. Adding more disks to a Jiva pool is not possible, so the size of Jiva pool is fixed if it on a physical disk. However if the underlying disk is a virtual or network or cloud disk then, it is possible to change the Jiva pool size on the fly.
- Capacity requirements are small. 
- When you need to provide cross-az available volumes in Cloud or On-premise. 

### Ideal conditions for choosing OpenEBS hostpath LocalPV:

- When applications are managing replication and availability themselves and there is no need of replication at storage layer. In most such situations, the applications are deployed as `statefulset`.
- When higher performance than Jiva or cStor is desired.
- hostpath is recommended when dedicated local disks are not available for a given application or dedicated storage is not needed for a given application. If you want to share a local disk across many applications hostpath, Rawfile, ZFS and LVM LocalPV is the right approach.

### Ideal conditions for choosing OpenEBS device LocalPV:

- When applications are managing replication themselves and there is no need of replication at storage layer. In most such situations, the applications are deployed as `statefulset`
- When higher performance than Jiva or cStor is desired.
- When near disk performance is a need and you need to avoid noisy neighbor effect of shared volumes. The device volume is dedicated to write a single SSD or NVMe interface to get the highest performance.

### Ideal conditions for choosing OpenEBS ZFS or LVM LocalPV:

- When applications are managing replication themselves and there is no need of replication at storage layer. In most such situations, the applications are deployed as `statefulset`
- When higher performance than Jiva or cStor is desired.
- When near disk performance is a need along with features like snapshots, volume expansion, pooling of storage from multiple storage devices. 

### Ideal conditions for choosing OpenEBS Mayastor:

- When you need high performance storage using NVMe SSDs and the cluster is capable of NVMeoF. 
- When you need replication or availability features to protected against node failures.  
- Mayastor is designed for the next gen compute and storage technology and is under active development. 

As Mayastor is under active development, you can also influence the features that are being built by joining [OpenEBS community on Kubernetes Slack](https://kubernetes.slack.com). If you are already signed up, head to our discussions at [#openebs](https://kubernetes.slack.com/messages/openebs/) channel. 

### Summary

A short summary is provided below.

- LocalPV is preferred if your application is in production and does not need storage level replication.
- cStor is preferred if your application is in production and requires storage level replication.
- Jiva is preferred if your application is small, requires storage level replication but does not need snapshots or clones.
- Mayastor is preferred if your application needs low latency and near disk throughput, requires storage level replication and your nodes have high CPU, RAM and NVMe capabilities. 


## See Also:

### [Mayastor User Guide](https://mayastor.gitbook.io/introduction/)

### [cStor User Guide](/docs/next/ugcstor-csi.html)

### [Jiva User Guide](/docs/next/jivaguide.html)

### [Local PV Hostpath User Guide](/docs/next/uglocalpv-hostpath.html)

### [Local PV Device User Guide](/docs/next/uglocalpv-device.html)


<br>
<hr>
<br>


