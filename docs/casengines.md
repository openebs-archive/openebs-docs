---
id: casengines
title: OpenEBS Data Engines Overview
sidebar_label: Data Engines
---

------

<br/>

A data engine is the core component that acts as an end-point for serving the IO to the applications. In CAS architecture, users can choose different data engines based on the capabilities provided by the data engine and the needs of the application. 

Platform SRE or administrators typically select one or more data engines to be used in their Kubernetes cluster  that are optimized for certain feature set like durability, high availability and/or for performance. Platform SRE can further create storage classes that can customize the data engines to specify what underlying storage to use, the level of resiliency required, and so forth.




## Types of Data Engines

OpenEBS data engines can be classified into two categories.

## Local Engines

OpenEBS Local Engines can create persistent volumes or PVs out of local disks or hostpaths or using the volume managers like LVM or ZFS on the Kubernetes worker nodes. Local Engines are well suited for cloud native applications that do not require advanced storage features like replication or snapshots or clones as they themselves provide these features. Such applications require access to a managed disks as persistent volumes. Read more details of OpenEBS Local PV [here](/docs/next/localpv.html)

Depending on the type of storage attached to your Kubernetes worker nodes, you can select from different flavors of Dynamic [Local PV](/docs/next/localpv.html) - Hostpath, Device, LVM, ZFS or Rawfile.

_Note: Local Volumes are only available from the the node on which the persistent volume is created. If that node fails, the application pod will not be re-scheduled to another node._

## Replicated Engines

Replicated Volumes as the name suggests, are those that can synchronously replicate the data to multiple nodes. These engines provide protection against node failures, by allowing the volume to be accessible from one of the other nodes where the data was replicated to. The replication can also be setup across availability zones helping applications move across availability zones.  Replicated Volumes also are capable of enterprise storage features like snapshots, clone, volume expansion and so forth. 

Depending on the type of storage attached to your Kubernetes worker nodes and application performance requirements, you can select from [Jiva](/docs/next/jiva.html), [cStor](/docs/next/cstor.html) or [Mayastor](/docs/next/mayastor.html). 

<br> <br>

## Choosing a storage engine

Application workloads request for Persistent Volume(PV) using a Persistent Volume Claim(PVC) and by specifying the Storage Class. The Platform teams typically will
-  Install OpenEBS
-  Configure the data engines and create Storage Classes (or use the default storage classes) and
-  Publish the list of Storage Classes available in the cluster to the application teams. 

The application developer will create the PVC with one of the available StorageClass. 

The OpenEBS Operators and Provisioners will dynamically create the volumes with the required data engines based on the parameters passed in the StorageClass and PVC. 

You can read more about how to create the StorageClass for OpenEBS data engines here:

- [Local PV hostpath](/docs/next/uglocalpv-hostpath.html)
- [Local PV device](/docs/next/uglocalpv-device.html)
- [ZFS Local PV](https://github.com/openebs/zfs-localpv)
- [LVM Local PV](https://github.com/openebs/lvm-localpv)
- [Rawfile Local PV](https://github.com/openebs/rawfile-localpv)
- [Mayastor](/docs/next/ugmayastor.html)
- [cStor](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md)
- [Jiva](https://github.com/openebs/jiva-operator)


<br>

## Data Engines Features comparison

All OpenEBS Data Engines support:
- Dynamic Provisioning of Persistent Volumes
- Provide Strong Data Consistency 

Below table identifies few differences among the CAS engines. 

| Feature                                      | Jiva    |  cStor   |  Mayastor  | LocalPV  | 
| -------------------------------------------- | :---:   | :------: | :--------: | :------: |
| Nodes without storage devices (hostpath only)|  Yes    |   No     | No         | Yes      |
| Nodes with additional storage devices        |  Yes    |   Yes    | Yes        | Yes      |
| Nodes with NVMe Devices                      |  No     |   No     | Yes        | Yes      |
| Nodes with NVMeoF                            |  No     |   No     | Yes        | NA       |
| Disk pool or aggregate support               |  Yes*   |   Yes    | Planned    | Yes**    |
| Disk resiliency (RAID support )              |  Yes*   |   Yes    | Planned    | Yes**    |
| Near disk performance                        |  No     |   No     | Yes        | Yes      |
| Synchronous replication                      |  Yes    |   Yes    | Yes        | No       |
| Thin Provisioning                            |  Yes    |   Yes    | Yes        | No       |
| Snapshots                                    |  No     |   Yes    | Planned    | Yes**    |
| Clones                                       |  No     |   Yes    | Planned    | Yes**    |
| Suitable for high capacity (>50GB) workloads |  No*    |   Yes    | Yes        | Yes      |
| On demand capacity expansion                 |  Yes    |   Yes    | Planned    | Yes**    |
| Backup and Restore using Velero              |  Restic |   Plugin | Restic     | Restic** |
| Incremental Backups                          |  No     |   Yes    | Planned    | Yes**    |


Notes:
- _*_ In case of Jiva data engine, the data is saved in sparse files within a mounted hostpath. This impacts the following:
  - Disk level pooling or RAID has to be taken care by the Administrator by using LVM or md-raid and then mount the resulting volume for use by Jiva engine. 
  - As the capacity of the volume increases - the rebuild times of the volumes will increase. This can result in volumes becoming inaccessible if more than one node in the cluster fails at the same time. 

- _**_ In case of Local PV - there are multiple flavors which determine the availability of the features. For example: 
  - Disk Pool or Resiliency is only available for LVM and ZFS based Local PVs. 
  - Snapshot feature is only available for LVM and ZFS based Local PVs. 
  - Clone feature is only available for ZFS based Local PVs. 
  - ZFS based local PV support a plugin based incremental Backups, while the remaining types of Local PV only support Restic based full backup.


## When to choose which CAS engine?

As indicated in the above table, each storage engine has it's own advantage. Choosing an engine depends completely on your platform (resources and type of storage), the application workload as well as it's current and future growth in capacity and/or performance. Below guidelines provide some help in choosing a particular engine while defining a storage class.



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


