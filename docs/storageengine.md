---
id: storageengine
title: Pluggable OpenEBS Storage Engines
sidebar_label: CAS Engines
---

------


`Feature status: Alpha / Experimental.`


## Overview of a Storage Engine

OpenEBS follows CAS architecture, where in each storage volume is provided with it's own storage controller and replica pods. A storage engine refers to the software functionality that is associated with a storage volume. A storage engine usually has one controller pod and multiple replication pods. Storage engines can be hardened to optimize a given workload for either with a feature set or for performance. 

Operators or administrators typically choose a storage engine with a specific software version and build optimized volume templates that are fine tuned with type of underlying disks, resiliency, number of replicas, set of nodes participating in the Kubernetes cluster. Users can then choose an optimal volume template at the time of volume provisioning, thus providing the maximum flexibility in running the optimum software and storage combination for all the storage volumes on a given Kubernetes cluster.

## Types of Storage Engines

OpenEBS provides two types of storage engines. 

1. Jiva (Recommended engine and reliable)
2. cStor (Initial availability is planned for 0.7 release. Currently a developer build can be chosen if desired)

### Jiva

Jiva has a single container image for both controller and replica. Docker image is available at https://hub.docker.com/r/openebs/jiva/ .  Jiva storage engine is developed with Rancher's LongHorn and gotgt as the base. The entire Jiva engine is written in GO language and runs entirely in the user space. LongHorn controller synchronously replicates the incoming IO to the LongHorn replicas. The replica considers a Linux sparse file as the foundation. It supports  thin provisioning, snapshotting, cloning of storage volumes.

![Jiva storage engine of OpenEBS](/docs/assets/jiva.png)

#### Sparse file layout of Jiva 

The following content is directly taken from Rancher's LongHorn [announcement documentation](https://rancher.com/microservices-block-storage/) 

**Replica Operations of Jiva**

------

Jiva replicas are built using Linux sparse files, which support thin provisioning. Jiva does not maintain additional metadata to indicate which blocks are used. The block size is 4K. When you take a snapshot, you create a differencing disk. As the number of snapshots grows, the differencing disk chain could get quite long. To improve read performance, Jiva therefore maintains a read index that records which differencing disk holds valid data for each 4K block. In the following figure, the volume has eight blocks. The read index has eight entries and is filled up lazily as read operation takes place. A write operation resets the read index, causing it to point to the live data. ![Longhorn read index](http://cdn.rancher.com/wp-content/uploads/2017/04/14095610/Longhorn-blog-3.png)



The read index is kept in memory and consumes one byte for each 4K block. The byte-sized read index means you can take as many as 254 snapshots for each volume. The read index consumes a certain amount of in-memory data structure for each replica. A 1TB volume, for example, consumes 256MB of in-memory read index. We will potentially consider placing the read index in memory-mapped files in the future.

**Replica Rebuild**

------

When the controller detects failures in one of its replicas, it marks the replica as being in an error state. The Longhorn/Jiva volume manager is responsible for initiating and coordinating the process of rebuilding the faulty replica as follows:

- The Longhorn/Jiva volume manager creates a blank replica and calls the controller to add the blank replica into its replica set.
- To add the blank replica, the controller performs the following operations:
  - Pauses all read and write operations.
  - Adds the blank replica in WO (write-only) mode.
  - Takes a snapshot of all existing replicas, which will now have a blank differencing disk at its head.
  - Unpauses all read the write operations. Only write operations will be dispatched to the newly added replica.
  - Starts a background process to sync all but the most recent differencing disk from a good replica to the blank replica.
  - After the sync completes, all replicas now have consistent data, and the volume manager sets the new replica to RW (read-write) mode.
- The Longhorn/Jiva volume manager calls the controller to remove the faulty replica from its replica set.

It is not very efficient to rebuild replicas from scratch. We can improve rebuild performance by trying to reuse the sparse files left from the faulty replica.

### cStor

`Note: Initial availability of cStor is planned to be in 0.7 release`

cStor storage engine has separate container image files for storage controller and storage replica. Docker images for controller is at << https://hub.docker.com/r/openebs/cstor-controller/>> and for replica is at << https://hub.docker.com/r/openebs/cstor-pool/>>. cStor is a high performing storage engine built with proven building blocks of storage components. Access protocol iSCSI stack is a linux ported  BSD based Multi-threaded iSCSI protocol stack originally developed at CloudByte. This iSCSI is field tested at thousands of installations for many years". The storage block layer is the DMU layer of user space ZFS inherited from the proven OpenSolaris stack. With these proven building blocks, cStor engine is highly reliable for storing and protecting enterprise data. 

![cStor storage engine of OpenEBS](/docs/assets/cStor.png)

## Choosing a Storage Engine

Developer does not directly choose a storage engine, but chooses a pre-defined storage class. Operator or Adminstrator constructs a storage class that refers to a CAS template containing the type of storage engine. 

![Choosing a storage engine](/docs/assets/cas-template.png)

As shown above, storage engine details are to be decided during the creation of a CAS template. 

## Overview of CAS Template

A CAS template is a customizable resource file (or a YAML file ) used by an operator to define the basic components of a storage engine. In kubernetes terminology it is a custom resource (CR). Operator typically builds several of these templates with various combinations of storage engines and storage pools. Currently, following properties can be specified in a CAS template CR. 

```
apiVersion: openebs.io/v1alpha1
kind: CASTemplate
metadata:  
  name: openebs-jiva-v0.6.0-with-3-ssd-replica-v0.1
spec:  
  defaultConfig:  
  - name: ControllerImage    
    value: "openebs/jiva:0.6.0"  
  - name: ReplicaImage    
    value: "openebs/jiva:0.6.0"  
  - name: ReplicaCount    
    value: "3"  
  - name: StoragePool    
    value: "default"  
  - name: Monitoring    
    enabled: "true"  
run:    
  tasks:    ... 
```

## Use Case

### Persistent Storage Requirements

Alice and Joe are developers of two different applications in a fintech enterprise, where the company is moving their DevOps from a legacy model to micro services model with Kubernetes as the orchestrating engine. Both the applications are stateful in nature and need persistent storage, but the persistent storage needs of these two applications differ vastly. 

- Alice's application uses MongoDB and has high capacity and performance requirements. For testing the application during development, Alice wishes to test the changes with real data in the database and also expects the data is stored in a volume with enterprise grade reliability.
- Joe's application uses MySQL to store simple configuration data, the size of which is expected to be in the order of few Giga Bytes. The performance expectations on the persistent volume of this application is moderate. 

Both of them expect their DevOps administrator to provide a suitable storage class to choose from and do not want to learn deeper details about how persistent storage volumes are being provisioned, or how they are managed. 

Eve is one of the DevOps admins in the company. Eve is reponsible for designing and managing the storage infrastructure needs. 

### Infrastructure Setup

DevOps team manages a single Kubernetes cluster, which is currently scaled to 32 nodes. They have planned to provide different classes of persistent storage tiers to their developers:

- SAS disks based storage for moderate performance needs
- SSD based storage for high performance needs
- In each of these tiers, they decided to offer varying degrees of resiliency by varying the number of copies of data

They have provisioned 12 SAS disks of 1TB each in each of the nodes from 1 to 4 and 12 SSDs of 1TB each in each of the nodes from 11 to19. 

### Creating Pools

Eve planned the storage pools in the following way.

| POOL     | Nodes                  | Expected data copies | Configuration                                             |
| -------- | ---------------------- | -------------------- | --------------------------------------------------------- |
| SASPool1 | N1                     | 1                    | 5 disks on each node (4+1 RaidZ1), remaining unconfigured |
| SASPool2 | N2, N3, N4             | 3                    | 5 disks on each node (4+1 RaidZ1), remaining unconfigured |
| SSDPool1 | N11                    | 1                    | 5 disks on each node (4+1 RaidZ1), remaining unconfigured |
| SSDPool2 | N12, N13, N14          | 3                    | 5 disks on each node (4+1 RaidZ1), remaining unconfigured |
| SSDPool3 | N15, N16, N17,N18, N19 | 5                    | 5 disks on each node (4+1 RaidZ1), remaining unconfigured |

OpenEBS supports pool creation and management through the use of Storage Pools(SP) and Storage Pool Claims (SPC). The SPC YAML manifests are maintained by operators for versioning.   `Note: Initial availability of SPC functionality is planned to be in 0.7 release`

### Creating CAS Templates

After pools are created, next step for Eve is to create CAS templates in such a way that

- SASPool1, and SASPool1 are created using JIVA storage engine
- SSDPool1, SSDPool2 and SSDPool3 are created using cStor storage engine

Apart from selecting storage engines appropriately, Eve has two challenges related to Kubernetes scheduling. 

1. **Replica pod and node affinity challenge:** Ensure that the volume pods meant to be associated with a given pool are scheduled by Kubernetes only on the nodes having those pools. For example volume pods of SASPool2 are scheduled on Nodes N2, N3 and N4 and not on any other nodes. This is achieved by appropriate volume pods taint toleration configuration in the CAS templates and on the nodes.
2. **Controller pod and application pod affinity challenge:** Ensure that the OpenEBS controller pod (either Jiva or cStor) is scheduled as much as possible on the same node as the application pod (in this use case example, MongoDB or MySQL). This is achieved by configuring node affinity in the volume pods in the CAS templates.

Eve creates five new CAS template files and creates corresponding Kubernetes CRs. Two example template YAML files are shown below.

**CAS template 1 (CAS-CR-SASPool1.yaml)**

```
apiVersion: openebs.io/v1alpha1
kind: CASTemplate
metadata:  
  name: openebs-saspool1-jiva-v0.6.0-with-3-replica-v0.1
spec:  
  defaultConfig:  
  - name: ControllerImage    
    value: "openebs/jiva:0.6.0"  
  - name: ReplicaImage    
    value: "openebs/jiva:0.6.0"  
  - name: ReplicaCount    
    value: "3"  
  - name: SASPOOL1    
    value: "default"  
  - name: Monitoring    
    enabled: "true"  
  - name: TaintTolerations
    value: |-
      t1:
        key: node.openebs.io/disktype
        operator: Equal
        value: SASPOOL1
        effect: NoSchedule
      t2:
        key: node.openebs.io/disktype
        operator: Equal
        value: SASPOOL1
        effect: NoExecute
    - name: EvictionTolerations
    value: |-
      t1:
        effect: NoExecute
        key: node.alpha.kubernetes.io/notReady
        operator: Exists
      t2:
        effect: NoExecute
        key: node.alpha.kubernetes.io/unreachable
        operator: Exists
     - name: NodeAffinityRequiredSchedIgnoredExec
    value: |-
      t1:
        key: beta.kubernetes.io/os
        operator: In
        values:
        - linux
  - name: NodeAffinityPreferredSchedIgnoredExec
    value: |-
      t1:
        key: some-node-label-key
        operator: In
        values:
        - some-node-label-value
run:    
  tasks:    ... 
```

**CAS template 2 (CAS-CR-SSDPool2.yaml)**

```
apiVersion: openebs.io/v1alpha1
kind: CASTemplate
metadata:  
  name: openebs-ssdpool1-jiva-v0.6.0-with-3-replica-v0.1
spec:  
  defaultConfig:  
  - name: ControllerImage    
    value: "openebs/jiva:0.6.0"  
  - name: ReplicaImage    
    value: "openebs/jiva:0.6.0"  
  - name: ReplicaCount    
    value: "3"  
  - name: SSDPOOL1    
    value: "default"  
  - name: Monitoring    
    enabled: "true"  
  - name: TaintTolerations
    value: |-
      t1:
        key: node.openebs.io/disktype
        operator: Equal
        value: SSDPOOL1
        effect: NoSchedule
      t2:
        key: node.openebs.io/disktype
        operator: Equal
        value: SSDPOOL1
        effect: NoExecute
    - name: EvictionTolerations
    value: |-
      t1:
        effect: NoExecute
        key: node.alpha.kubernetes.io/notReady
        operator: Exists
      t2:
        effect: NoExecute
        key: node.alpha.kubernetes.io/unreachable
        operator: Exists
     - name: NodeAffinityRequiredSchedIgnoredExec
    value: |-
      t1:
        key: beta.kubernetes.io/os
        operator: In
        values:
        - linux
  - name: NodeAffinityPreferredSchedIgnoredExec
    value: |-
      t1:
        key: some-node-label-key
        operator: In
        values:
        - some-node-label-value
run:    
  tasks:    ... 
```

Eve creates 6 CRs with the above manifests.

### Creating Storage Classes

The last step for Eve is to create volume catalogs or in Kubernetes language "Storage Classes". Eve creates multiple storage classes as shown in the table below.

| Storage Class Name               | CAS template                                     | Replicas |
| -------------------------------- | ------------------------------------------------ | -------- |
| SC-high-perf-no-resilience       | openebs-ssdpool1-jiva-v0.6.0-with-1-replica-v0.1 | 1        |
| SC-high-perf-high-resilience     | openebs-ssdpool2-jiva-v0.6.0-with-3-replica-v0.1 | 3        |
| SC-high-perf-veryhigh-resilience | openebs-ssdpool3-jiva-v0.6.0-with-5-replica-v0.1 | 5        |
| SC-low-perf-no-resilience        | openebs-saspool1-jiva-v0.6.0-with-1-replica-v0.1 | 1        |
| SC-high-perf-high-resilience     | openebs-saspool2-jiva-v0.6.0-with-3-replica-v0.1 | 3        |

Example of storage class : **SC-high-perf-high-resilience**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:  
  name: SC-high-perf-high-resilience  
  annotations:
    cas.openebs.io/template: openebs-ssdpool2-jiva-v0.6.0-with-3-replica-v0.1
provisioner: openebs.io/provisioner-iscsi
```

Eve notifies the availability of these 5 storage classes to the developers.

### Using Persistent Storage

Developers Alice and Joe can choose one of these storage classes in constructing the PVC. Typically, developers have to select only the following parameters to construct a PVC.

- Size of the volume required
- Storage class
- Namespace (if required)

Alice's PVC **alice-mongodb-vol** for MongoDB looks like the following.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:  
  name: alice-mongodb-vol  
spec:  
  storageClassName: SC-high-perf-high-resilience   
  resources:    
    requests:      
      storage: 200Gi
```

Joe's PVC **joe-mysql-vol** for MySQL looks like the following.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:  
  name: joe-mysql-vol  
spec:  
  storageClassName: SC-low-perf-high-resilience   
  resources:    
    requests:      
      storage: 50Gi
```

Initial work for the DevOps operators is shown in the above use case example. Developers get started with the volume provisioning. Day2 operations related to persistent storage typlically include taking snapshot of data, restoration from the snapshots, monitoring the health of pools and stateful applications, data migration. [MayaOnline](https://www.mayaonline.io) is useful for many of these day2 storage operations.


### See Also:

#### [Storage Pools](/docs/next/setupstoragepools.html)
#### [Storage Classes](/docs/next/setupstorageclasses.html)



<!-- Hotjar Tracking Code for https://docs.openebs.io -->
<script>
   (function(h,o,t,j,a,r){
       h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
       h._hjSettings={hjid:785693,hjsv:6};
       a=o.getElementsByTagName('head')[0];
       r=o.createElement('script');r.async=1;
       r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
       a.appendChild(r);
   })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
