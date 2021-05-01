---
id: ugmayastor
title: Mayastor 
sidebar_label: Mayastor
---
------
## Prerequisites

### General

Each Mayastor Node \(MSN\), that is each cluster worker node which will host an instance of a Mayastor pod, must have these resources _free and available_ for use by Mayastor:

* **Two  x86-64 CPU cores with SSE4.2 instruction support**:
  * Intel Nehalem processor \(march=nehalem\) and newer
  * AMD Bulldozer processor and newer
* **4GiB of RAM**
* HugePage support

  * A minimum of **1GiB of** **2MiB-sized** **huge pages**


> Instances of the Mayastor pod <i>must</i> be run in privileged mode


### Node Count

As long as the resource prerequisites are met, Mayastor can deployed to a cluster with just a single worker node.  However note that in order to evaluate the synchronous replication feature \(N+1 mirroring\), the number of worker nodes to which Mayastor is deployed should be no less than the desired replication factor.  E.g. three-way mirroring of Persistent Volumes \(PV\) would require Mayastor to be deployed to a minimum of three worker nodes.

### Transport Protocols

Mayastor supports the export and mounting of a Persistent Volume over either NVMe-oF TCP or iSCSI \(configured as a parameter of the PV's underlying StorageClass\).  Worker node\(s\) on which a PV is to be mounted must have the requisite initiator support installed and configured for the protocol in use.

#### iSCSI

The iSCSI client should be installed and correctly configured as per [this guide](https://docs.openebs.io/docs/next/prerequisites.html).

#### NVMe-oF

In order to reliably mount application PVs  over NVMe-oF TCP, a worker node's kernel version must be 5.3 or later.  Verify that the `nvme-tcp` module is loaded and if necessary, load it.
<br><br>
----

## Preparing the Cluster

### Configure Mayastor Nodes \(MSNs\)

Within the context of the Mayastor application, a "Mayastor Node" is a Kubernetes worker node on which is scheduled an instance of a Mayastor data plane pod, so is thus capable of hosting a Storage Pool and exporting Persistent Volumes\(PV\).  A MSN makes use of block storage device\(s\) attached to it to contribute storage capacity to its pool\(s\), which supply backing storage for the Persistent Volumes provisioned on the parent cluster by Mayastor.

Kubernetes worker nodes are not required to be MSNs in order to be able to mount Mayastor-provisioned Persistent Volumes for the application pods scheduled on them.  New MSN nodes can be provisioned within the cluster at any time after the initial deployment, as aggregate demands for capacity, performance and availability levels increase.

#### Verify / Enable Huge Page Support

_2MiB-sized_  Huge Pages must be supported and enabled on a MSN.  A minimum number of 512 such pages \(i.e. 1GiB total\) must be available on each node, which should be verified thus:

```
grep HugePages /proc/meminfo
```
Sample output:

```
AnonHugePages:         0 kB
ShmemHugePages:        0 kB
HugePages_Total:    1024
HugePages_Free:      671
HugePages_Rsvd:        0
HugePages_Surp:        0

```

If fewer than 512 pages are available then the page count should be reconfigured as required, accounting for any other workloads which may be co-resident on the worker node and which also require them.  For example:

```text
echo 512 | sudo tee /sys/kernel/mm/hugepages/hugepages-2048kB/nr_hugepages
```

This change should also be made persistent across reboots by adding the required value to the file`/etc/sysctl.conf` like so:

```text
echo vm.nr_hugepages = 512 | sudo tee -a /etc/sysctl.conf
```


>If you modify the Huge Page configuration of a node, you _must_ either restart kubelet or reboot the node.  Mayastor will not deploy correctly if the available Huge Page count as reported by the node's kubelet instance does not satisfy the minimum requirements.


#### Label Mayastor Node Candidates

All worker nodes in the cluster which are intended to operate as MSNs should be labelled with the OpenEBS engine type "mayastor".  This label is used as a selector by the Mayastor Daemonset, which will be deployed during the next stage of the installation.  Here we demonstrate the correct labeling of a worker node named "node1":  

```text
kubectl label node node1 openebs.io/engine=mayastor
```

----

## Deploy Mayastor

### Overview

In this Quickstart guide we demonstrate deploying Mayastor by using the Kubernetes manifest files provided within the `deploy`folder of the [Mayastor project's GitHub repository](https://github.com/openebs/Mayastor).  The repository is configured for the GitFlow release pattern, wherein the master branch contains official releases.  By extension, the head of the master branch represents the latest official release.

The steps and commands which follow are intended only for use with, and tested against, the latest release.  Earlier releases or development versions may require a modified or different installation process.

### Create Mayastor Application Resources

#### Namespace

To create a new namespace, execute:
```
kubectl create namespace mayastor
```

#### RBAC Resources


To create RBAC resources, execute:
```
kubectl create -f https://raw.githubusercontent.com/openebs/Mayastor/master/deploy/moac-rbac.yaml
```


Sample output:
```
serviceaccount/moac created
clusterrole.rbac.authorization.k8s.io/moac created
clusterrolebinding.rbac.authorization.k8s.io/moac created
```


#### Custom Resource Definitions


```
kubectl apply -f https://raw.githubusercontent.com/openebs/Mayastor/master/csi/moac/crds/mayastorpool.yaml
```

### Deploy Mayastor Dependencies

#### NATS

Mayastor uses [NATS](https://nats.io/), an Open Source messaging system, as an event bus for some aspects of control plane operations, such as registering Mayastor nodes with MOAC \(Mayastor's primary control plane component\).

To deploy NATS, execute:
```
kubectl apply -f https://raw.githubusercontent.com/openebs/Mayastor/master/deploy/nats-deployment.yaml
```

Verify that the deployment of the NATS application to the cluster was successful. Within the mayastor namespace there should be a single pod having a name starting with "nats-", and with a reported status of Running.

```text
kubectl -n mayastor get pods --selector=app=nats
```


Sample output:
```
NAME                   READY   STATUS    RESTARTS   AGE
nats-b4cbb6c96-nbp75   1/1     Running   0          28s
```

### Deploy Mayastor Components

#### CSI Node Plugin

To deploy CSI deployments, execute:
```
kubectl apply -f https://raw.githubusercontent.com/openebs/Mayastor/master/deploy/csi-daemonset.yaml
```

Verify that the CSI Node Plugin DaemonSet has been correctly deployed to all worker nodes in the cluster.

```
kubectl -n mayastor get daemonset mayastor-csi 
```


Sample output:
```
NAME           DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR              AGE
mayastor-csi   3         3         3       3            3           kubernetes.io/arch=amd64   26m
```


#### Control Plane

To deploy the control plane components, execute:
```
kubectl apply -f https://raw.githubusercontent.com/openebs/Mayastor/master/deploy/moac-deployment.yaml
```


Verify that the MOAC control plane pod is running, execute:

```text
kubectl get pods -n mayastor --selector=app=moac
```

Sample output:
```
NAME                    READY   STATUS    RESTARTS   AGE
moac-7d487fd5b5-9hj62   3/3     Running   0          8m4s
```


#### Data Plane 

To deploy Data Plane components, execute:
```
kubectl apply -f https://raw.githubusercontent.com/openebs/Mayastor/master/deploy/mayastor-daemonset.yaml
```


Verify that the Mayastor DaemonSet has been correctly deployed.  The reported Desired, Ready and Available instance counts should be equal, and should match the count of worker nodes which carry the label `openebs.io/engine=mayastor` \(as performed earlier in the "[Preparing the Cluster](preparing-the-cluster.md#label-the-storage-nodes)" stage\).

To get the list of deployed daemonset, execute:
```
kubectl -n mayastor get daemonset mayastor
```

Sample output:
```
NAME       DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR                                         AGE
mayastor   3         3         3       3            3           kubernetes.io/arch=amd64,openebs.io/engine=mayastor   108s
```

For each resulting Mayastor pod instance, a Mayastor Node \(MSN\) custom resource definition should be created.  List these definitions and verify that the count meets the expected number and that all nodes are reporting their State as `online`

To obatin the list of MSN, execute:
```
kubectl -n mayastor get msn
```

Sample output:
```
NAME                       STATE    AGE
aks-agentpool-12194210-0   online   8m18s
aks-agentpool-12194210-1   online   8m19s
aks-agentpool-12194210-2   online   8m15s
```
----

## Configure Mayastor

### Create Mayastor Pool\(s\)

#### What is a Mayastor Pool \(MSP\)?

When a Mayastor Node \(MSN\) allocates storage capacity for a Persistent Volume \(PV\) it does so from a construct named a Mayastor Pool \(MSP\).  Each MSN may create and manage zero, one, or more such pools.  The ownership of a pool by a MSN is exclusive.  In the current version of Mayastor, a pool may have only a single block device member, which constitutes the entire data persistence layer for that pool and thus determines its maximum capacity.

A pool is defined declaratively, through the creation of a corresponding `MayastorPool`custom resource \(CR\) on the cluster.  User configurable parameters of this CR type include a unique name for the pool, the host name of the MSN on which it is hosted and a reference to a disk device which is accessible from that node \(for inclusion within the pool\).  The pool definition allows the reference to its member block device to adhere to one of a number of possible schemes, each associated with a specific access mechanism/transport/device type and differentiated by corresponding performance and/or attachment locality.

##### Permissible Schemes for the MSP CRD field `disks`

| Type | Format | Example |
| :--- | :--- | :--- |
| Attached Disk Device | Device File | /dev/sdx |
| NVMe | NQN | nvme://nqn.2014-08.com.vendor:nvme:nvm-subsystem-sn-d78432 |
| iSCSI | IQN | iscsi://iqn.2000-08.com.datacore.com:cloudvm41-2 |
| Async. Disk I/O \(AIO\) | Device File  | aio:///dev/sdx |
| io\_uring | Device File  | io\_uring:///dev/sdx |
| RAM drive | Custom | malloc:///malloc0?size\_mb=1024 |

Once a Mayastor node has created a pool it is assumed that it henceforth has exclusive use of the associated block device; it should not be partitioned, formatted, or shared with another application or process.  Any existing data on the device will be destroyed.

#### Configure Pool\(s\) for Use with this Quickstart

To continue with this quick start exercise, a minimum of one pool is necessary, created and hosted by one of the MSNs in the cluster.  However the number of pools available limits the extent to which the synchronous n-way mirroring feature \("replication"\) of Persistent Volumes can configured for testing and evaluation; the number of pools configured should be no lower than the desired maximum replication factor of the PVs to be created.  Note also that when placing data replicas, to provide appropriate redundancy, Mayastor's control plane will avoid locating more than one replica of a PV on the same MSN.  Therefore, for example, the minimum viable configuration for a Mayastor deployment which is intended  to test 3-way mirrored PVs must have three Mayastor Nodes, each having one Mayastor Pool,  with each of those pools having one unique block device allocated to it. 

Using one or more the following examples as templates, create the required type and number of pools.


Example MSP CRD \(device file\):
```text
cat <<EOF | kubectl create -f -
apiVersion: "openebs.io/v1alpha1"
kind: MayastorPool
metadata:
  name: pool-on-node-1
  namespace: mayastor
spec:
  node: workernode-1-hostname
  disks: ["/dev/sdx"]
EOF
```

Example \(NVMe-oF Fabric device\)":
```
cat <<EOF | kubectl create -f -
apiVersion: "openebs.io/v1alpha1"
kind: MayastorPool
metadata:
  name: nvme-pool-on-node-2
  namespace: mayastor
spec:
  node: workernode-2-hostname
  disks: ["nvme://nqn.2014-08.com.vendor:nvme:nvm-subsystem-sn-d78432"]
EOF
```

Example \(iSCSI device\):
```
cat <<EOF | kubectl create -f -
apiVersion: "openebs.io/v1alpha1"
kind: MayastorPool
metadata:
  name: iscsi-pool-on-node-3
  namespace: mayastor
spec:
  node: workernode-3-hostname
  disks: ["iscsi://iqn.yyyy-mm.naming-authority:unique_name"]
EOF
```


YAML:
```
apiVersion: "openebs.io/v1alpha1"
kind: MayastorPool
metadata:
  name: INSERT_POOL_NAME_HERE
  namespace: mayastor
spec:
  node: INSERT_WORKERNODE_HOSTNAME_HERE
  disks: ["INSERT_DEVICE_URI_HERE"]

```


>When following the examples in order to create your own Mayastor Pool\(s\), remember to replace the values for the fields "name", "node" and "disks" as appropriate to your cluster's intended configuration.  Note that whilst the "disks" parameter accepts an array of scheme values, the current version of Mayastor supports only one disk device per pool.


#### Verify Pool Creation and Status

The status of Mayastor Pools may be determined by reference to their cluster CRs.  Available, healthy pools should report their State as `online`.  Verify that the expected number of pools have been created and that they are online.


To verify, execute:
```text
kubectl -n mayastor get msp
```


Sample output:
```
NAME             NODE                       STATE    AGE
pool-on-node-0   aks-agentpool-12194210-0   online   127m
pool-on-node-1   aks-agentpool-12194210-1   online   27s
pool-on-node-2   aks-agentpool-12194210-2   online   4s
```


### Create Mayastor StorageClass\(s\)

Mayastor dynamically provisions Persistent Volumes \(PV\) based on custom StorageClass definitions defined by the user.  Parameters of the StorageClass resource definition are used to set the characteristics and behavior of its associated PVs.  In the current version of Mayastor, StorageClass definitions are used to control both which transport protocol is used to mount the PV to the worker node hosting the consuming application pod \(iSCSI, or NVMe-oF TCP\) and the level of data protection afforded to it \(that is, the number of synchronous data replicas which are maintained, for purposes of redundancy\).  It is possible to create any number of custom StorageClass definitions to span this range of permutations.

We illustrate this quickstart guide with two examples of possible use cases; one which uses iSCSI and offers no data protection \(i.e. a single data replica\), and another using NVMe-oF TCP transport and having three data replicas.  You may modify these as required to match your own desired test cases, within the limitations of the cluster under test.


 iSCSI Example:
```text
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-iscsi
parameters:
  # Set the number of data replicas ("replication factor")
  repl: '1'
  # Set the export transport protocol
  protocol: 'iscsi'
provisioner: io.openebs.csi-mayastor
EOF
```


NVME-oF Example:
```
cat <<EOF | kubectl create -f -
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: mayastor-nvmf
parameters:
  # Set the number of data replicas ("replication factor")
  repl: '3'
  # Set the export transport protocol
  protocol: 'nvmf'
provisioner: io.openebs.csi-mayastor
EOF
```

>Note:  Permissible values for the field "protocol" are either "iscsi", or "nvmf"


**Action: Create the StorageClass\(es\) appropriate to your intended testing scenario\(s\).**
