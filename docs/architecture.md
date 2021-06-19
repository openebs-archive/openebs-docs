---
id: architecture
title: OpenEBS Architecture
sidebar_label: Architecture
---

------

OpenEBS is the leading Open Source implementation of the [Container Attached Storage(CAS)](/docs/next/cas.html) pattern. As a part of this approach, OpenEBS uses containers to dynamically provision volumes and provide data services like high availability. OpenEBS relies on and extends Kubernetes itself to orchestrate its volume services. 


<br>
<img src="/docs/assets/openebs-hld.svg" alt="drawing" width="80%"/>
<br>

OpenEBS has many components, which can be grouped into the following two broad categories.

- [OpenEBS Data Engines](#data-engines)
- [OpenEBS Control Plane](#control-plane)

## Data Engines 

The data engines are at the core of OpenEBS and are responsible for performing the read and write operations to the underlying persistent storage on behalf of the Stateful workloads they serve. 

The data engines are responsible for:
- Aggregating the capacity available in the block devices allocated to them and then carving out volumes for applications. 
- Provide standard system or network transport interfaces(NVMe/iSCSI) for connecting to local or remote volumes
- Provide volume services like - synchronous replication, compression, encryption, maintain snapshots, access to the incremental or fullsnapshots of data and so forth
- Provide strong consistency while persisting the data to the underlying storage devices

As the applications have decomposed themselves into micro-services that are hyper focused on a set of capabilities, their requirements from the underlying storages (aka volumes) also changed. For example there are applications that only need fast local storage vs fast local storage with resiliency against node failures vs other storage features.

OpenEBS follows an micro-services model to implement the data engine where the functionality is further decomposed into different layers, allowing for flexibility to interchange the layers and make data engines future ready for changes coming in the application and data center technologies. 

The OpenEBS Data Engines can be considered to comprise of the following three layers:

### Storage Layer 

Storage Layer forms the basic building blocks for persisting the data. The Storage Layer comprise of block devices attached to the node (either locally via PCIe, SAS, NVMe or via remote SAN/Cloud). The Storage Layer could also be a sub-directory ontop of a mounted filesystem. 

Storage Layer is outside the purview of the OpenEBS Data Engines and are available to the Kubernetes storage constructs using standard operating system or linux software constructs.  

The Data Engines consume the storage as a device or a device pool or a filesystem directory. 


### Data Layer 

OpenEBS Data engines create a Volume Replica on top of the Storage Layer. Volume Replicas are pinned to a node and are created on top of the storage layer. The replica can be any of the following:

- Sub-directory - in case the storage layer used is a fileystem directory
- Full Device or Partitioned Device - in case the storage layer used is block devices
- Logical Volume - in case the storage layer used is a device pool coming from LVM or ZFS. 


In case the applications require only local storage, then the Persistent Volume will be created using one of te above directory, device (or parition) or logical volume. OpenEBS [control plane](#control-plane) will be used to provision one of the above replicas. 

OpenEBS can add the layer of high availability ontop of the local storage using one of its replicated engines - Jiva, cStor and Mayastor. In this case, OpenEBS uses a light-weight storage defined storage controller software that can receive the read/write operations over a network end-point and then be passed on to the underlying storage layer.   

OpenEBS Volume Replicas typically go through the following states:
- Initializing, during initial provisioning and is being registered to its volume
- Healthy, when replica can participate in the read/write operations
- Offline, when the node or the storage where replica has failed
- Rebuilding, when the node or storage failure has been rectified and replica is recieving its data from other healthy replicas
- Terminating, when volume has been deleted and replica is being deleted and space being reclaimed

:::note
An important aspect of the OpenEBS Data Layer is that each volume replica is a full copy of the data. This leads to the following capacity constraints that need to be kept in mind when using OpenEBS replicated volumes.
- Volumes can only be provisioned with capacity that can be accomodated in a single node by a single storage device or a pool of devices. Volume replica data will not be stripped or sharded across different nodes.
- Depending on the number of replicas configured, OpenEBS will use as many Volume Replicas. Example: A 10GB volume with 3 replicas will result in using 10GB on 3 different nodes where replicas are provisioned.
- Volume Replicas are thin provisioned, so the used capacity will increase only when the applications really write data into Volumes.
- When Volume Snapshots is taken, the snapshot is taken on all its healthy volume replicas
:::

In case of the application require replication, then OpenEBS adds its own replica layer with an unique network end-point accessible by OpenEBS from anywhere in the cluster. OpenEBS then uses this Replica to maintain a synchronous copy of the volume. 

### Volume Target (aka Nexus) 





## Control Plane

The control plane in the context of OpenEBS refers to a set of tools or components deployed in the cluster that are responsible for:
- Managing the storage available on the kubernetes worker nodes
- Configuring and managing the data engines
- Interfacing with CSI to manage the lifecycle of volumes 
- Interfacing with CSI and other tools carrying out operations like - snapshots, clones, resize, backup, restore, etc. 
- Integrating into other tools like Prometheus/Grafana for telemetry and monitoring 
- Integrating into other tools for debugging, troubleshooting or log management

The control plane is where users specify policies, gather metrics and configure the Data Engines as a whole.

OpenEBS Control Plane comprises of a set of micro-services that are deployed either as Kubernetes Deployments or Daemonsets. The configuration managed by the OpenEBS Control Plane is saved as Kubernetes custom resources. 



Both these storage engines run completely in Linux user space and are based on micro services architecture. 

A data engine implements the actual IO path in the data plane. Currently, OpenEBS provides two storage engines that can be plugged in easily. These are called Jiva and cStor. 


## See Also:

### [Understanding NDM](/docs/next/ndm.html)


<br>
<hr>
<br>
