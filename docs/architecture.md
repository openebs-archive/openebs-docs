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
- Provide volume services like - synchronous replication, compression, encryption, maintain snapshots, access to the incremental or full snapshots of data and so forth
- Provide strong consistency while persisting the data to the underlying storage devices

OpenEBS follow micro-services model to implement the data engine where the functionality is further decomposed into different layers, allowing for flexibility to interchange the layers and make data engines future ready for changes coming in the application and data center technologies. 

The OpenEBS Data Engines comprise of the following layers:

<br>
<img src="/docs/assets/data-engine-overview.svg" alt="drawing" width="80%"/>
<br>

### Volume Access Layer

Stateful Workloads use standard POSIX compliant mechanisms to perform read and write operations. Depending on the type of workloads, the application can prefer to perform the reads and writes either directly to the raw block device or using standard filesystems like XFS, Ext4. 

The CSI node driver or the Kubelet will take care of attaching the volume to the required node where pod is running, formatting if necessary and mounting the filesystem to be accessible by the pod. Users have the option of setting the mount options and filesystem permissions at this layer which will be carried out by the CSI node driver or kubelet. 

The details required for attaching the volumes (using local, iSCSI or NVMe) and mounting (Ext4, XFS, etc) are available through the Persistent Volume Spec. 

### Volume Services Layer 

This layer is often called as the Volume Target Layer or even Volume Controller layer as it is responsible for providing a Logical Volume. The application reads and writes are performed through the Volume Targets - which controls access to the volumes, synchronous replication of the data to other nodes in the cluster and helps in deciding which of the replica acts as master and facilitate rebuilding of data to old or restarted replicas. 

The implementation pattern used by data engines to provide high availability is what differentiates OpenEBS from other traditional storage controllers. Unlike using a single storage controller for performing the IOs on multiple volumes, OpenEBS creates one storage controller (called Target/Nexus) per volume, with a specific list of nodes where the volume data will be saved. Each node will have complete data of the volume distributed using synchronous replication. 

Using single controller to implement synchronous replication of data to fixed set of nodes (instead of distribution via multiple metadata controller), reduces the overhead in managing the metadata and also reduces the blast radius related to a node failure and other nodes participating in the rebuild of the failed node. 

The OpenEBS volume services layer exposes the volumes as:
- Device or Directory paths in case of Local PV, 
- iSCSI Target in case of cStor and Jiva
- NVMe Target in case of Mayastor.

### Volume Data Layer 

OpenEBS Data engines create a Volume Replica on top of the Storage Layer. Volume Replicas are pinned to a node and are created on top of the storage layer. The replica can be any of the following:

- Sub-directory - in case the storage layer used is a filesystem directory
- Full Device or Partitioned Device - in case the storage layer used is block devices
- Logical Volume - in case the storage layer used is a device pool coming from LVM or ZFS. 


In case the applications require only local storage, then the Persistent Volume will be created using one of the above directory, device (or partition) or logical volume. OpenEBS [control plane](#control-plane) will be used to provision one of the above replicas. 

OpenEBS can add the layer of high availability on top of the local storage using one of its replicated engines - Jiva, cStor and Mayastor. In this case, OpenEBS uses a light-weight storage defined storage controller software that can receive the read/write operations over a network end-point and then be passed on to the underlying storage layer. OpenEBS then uses this Replica network end-points to maintain a synchronous copy of the volume across nodes. 

OpenEBS Volume Replicas typically go through the following states:
- Initializing, during initial provisioning and is being registered to its volume
- Healthy, when replica can participate in the read/write operations
- Offline, when the node or the storage where replica has failed
- Rebuilding, when the node or storage failure has been rectified and replica is receiving its data from other healthy replicas
- Terminating, when volume has been deleted and replica is being deleted and space being reclaimed


### Storage Layer 

Storage Layer forms the basic building blocks for persisting the data. The Storage Layer comprise of block devices attached to the node (either locally via PCIe, SAS, NVMe or via remote SAN/Cloud). The Storage Layer could also be a sub-directory on top of a mounted filesystem. 

Storage Layer is outside the purview of the OpenEBS Data Engines and are available to the Kubernetes storage constructs using standard operating system or linux software constructs.  

The Data Engines consume the storage as a device or a device pool or a filesystem directory. 




## Control Plane

The control plane in the context of OpenEBS refers to a set of tools or components deployed in the cluster that are responsible for:
- Managing the storage available on the kubernetes worker nodes
- Configuring and managing the data engines
- Interfacing with CSI to manage the lifecycle of volumes 
- Interfacing with CSI and other tools carrying out operations like - snapshots, clones, resize, backup, restore, etc. 
- Integrating into other tools like Prometheus/Grafana for telemetry and monitoring 
- Integrating into other tools for debugging, troubleshooting or log management

The control plane is where users specify policies, gather metrics and configure the Data Engines as a whole.

OpenEBS or the CAS Storage Control Plane - follows the reconcilation pattern introduced by Kubernetes, paving the way for a Declarative Storage Control Plane. OpenEBS control plane seamlessly integrates into the overall tooling that users have around Kubernetes. OpenEBS Control Plane comprises of a set of micro-services that are themselves managed by Kubernetes, making OpenEBS truly Kubernetes native. The configuration managed by the OpenEBS Control Plane is saved as Kubernetes custom resources. 

The functionality of the control plane can be decomposed into the various stages as follows:

<br>
<img src="/docs/assets/control-plane-overview.svg" alt="drawing" width="80%"/>
<br>

### Cluster Initialization

The Platform or Infrastructure teams will decide on the composition of the Kubernetes worker nodes like - RAM, CPU, Network and the storage devices attached to the worker nodes. The Platform SREs will have the flexibility to create a pool of nodes with specialized storage devices or use a common template for all the storage nodes. 


### Storage Classes

The Platform of the Cluster Administrators teams responsible for the Kubernetes cluster level resources and managing the add-ons available will install and configure the OpenEBS as any other kubernetes application. OpenEBS can be installed via GitOps, Helm chart or any other preferred way by the Administrators. 

The required data engines can be configured using standard Kubernetes API, using the Custom Resources that allow the administrators to specify the list and type of devices to be used for saving the persistent volume data and the volume services (replicated vs local) to be provided.

The clusters administrators can either use the default Storage Classes provided by OpenEBS or customize and create their own Storage Classes. 

### Persistent Volume Claims

The application developers will launch their application (stateful workloads) that will in turn create Persistent Volume Claims for requesting the Storage or Volumes for their pods. The Platform teams can provide templates for the applications with associated PVCs or application developers can select from the list of storage classes available for them. 


### Persistent Volumes

The Kubernetes CSI (provisioning layer) will intercept the requests for the Persistent Volumes and forward the requests to the OpenEBS Control Plane components to service the requests. The information provided in the Storage Class associated with the PVCs will determine the right OpenEBS control component to receive the request. 

OpenEBS control plane will then process the request and create the Persistent Volumes using one of its local or replicated engines. The data engine services like target and replica are deployed as Kubernetes applications as well. The containers provide storage for the containers. 

OpenEBS control plane after creating the volume, will include the details of the volume into Persistent Volume spec. The CSI and volume drivers will attach and mount the volumes to the nodes where application pod is running.

### Operations

Once the workloads are up and running, the platform or the operations team can observe the system using the cloud native tools like Prometheus, Grafana and so forth. The operational tasks are a shared responsibility across the teams: 
* Application teams can watch out for the capacity and performance and tune the PVCs accordingly. 
* Platform or Cluster teams can check for the utilization and performance of the storage per node and decide on expansion and spreading out of the data engines 
* Infrastructure team will be responsible for planning the expansion or optimizations based on the utilization of the resources.
 
## See Also:

### [Understanding Data Engines](/docs/next/casengines.html)
### [Understanding Mayastor](/docs/next/mayastor.html)
### [Understanding Local PV](/docs/next/localpv.html)
### [Understanding cStor](/docs/next/cstor.html)
### [Understanding Jiva](/docs/next/jiva.html)


<br>
<hr>
<br>
