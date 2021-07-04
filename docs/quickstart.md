---
id: quickstart
title: OpenEBS Quickstart Guide
sidebar_label: Quickstart
---
------

<br>
This guide will help you to setup OpenEBS and use OpenEBS Volumes to run your Kubernetes Stateful Workloads. If you are new to running Stateful workloads in Kubernetes, you will need to familiarize yourself with [Kubernetes Storage Concepts](/docs/next/k8s-storage.html). 


In most cases, the following steps is all you need to install OpenEBS. You can read through the rest of the document to understand the choices you have and optimize OpenEBS for your Kubernetes cluster. 
 
:::tip QUICKSTART
Install using helm
```
helm repo add openebs https://openebs.github.io/charts
helm repo update
helm install openebs --namespace openebs openebs/openebs --create-namespace
```

Install using kubectl 
```
kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
```
:::

## How to setup and use OpenEBS?

OpenEBS seamlessly integrates into the overall workflow tooling that Kubernetes administrators and users have around Kubernetes. 

The OpenEBS workflow fits nicely into the reconcilation pattern introduced by Kubernetes, paving the way for a Declarative Storage Control Plane as shown below: 

<br>
<img src="/docs/assets/control-plane-overview.svg" alt="drawing" width="80%"/>
<br>


### 1. Kubernetes Cluster Design

As a Kubernetes cluster administrator, you will have to work with your Platform or Infrastructure teams on the composition of the Kubernetes worker nodes like - RAM, CPU, Network and the storage devices attached to the worker nodes. The [resources available to the Kubernetes nodes](docs/next/casengines.html#node-capabilities) determine what OpenEBS engines to use for your stateful workloads. 

As a Kubernetes cluster administrator or Platform SREs you will have to decide which deployment strategy works best for you - either use an hyperconverged mode where Stateful applications and storage volumes are co-located or run Stateful applications and storage on different pools of nodes. 


### 2. Install OpenEBS and Setup Storage Classes

The Platform of the Cluster Administrators teams responsible for the Kubernetes cluster level resources and managing the add-ons available will install and configure the OpenEBS as any other kubernetes application. OpenEBS can be installed via GitOps, Helm chart or any other preferred way by the Administrators. 

The required data engines can be configured using standard Kubernetes API, using the Custom Resources that allow the administrators to specify the list and type of devices to be used for saving the persistent volume data and the volume services (replicated vs local) to be provided.

The clusters administrators can either use the default Storage Classes provided by OpenEBS or customize and create their own Storage Classes. 

### 3. Deploy Stateful Workloads

The application developers will launch their application (stateful workloads) that will in turn create Persistent Volume Claims for requesting the Storage or Volumes for their pods. The Platform teams can provide templates for the applications with associated PVCs or application developers can select from the list of storage classes available for them. 


### 4. Dynamic Persistent Volume Provisioning

The Kubernetes CSI (provisioning layer) will intercept the requests for the Persistent Volumes and forward the requests to the OpenEBS Control Plane components to service the requests. The information provided in the Storage Class associated with the PVCs will determine the right OpenEBS control component to receive the request. 

OpenEBS control plane will then process the request and create the Persistent Volumes using one of its local or replicated engines. The data engine services like target and replica are deployed as Kubernetes applications as well. The containers provide storage for the containers. 

OpenEBS control plane after creating the volume, will include the details of the volume into Persistent Volume spec. The CSI and volume drivers will attach and mount the volumes to the nodes where application pod is running.

### 5. Management Operations

Once the workloads are up and running, the platform or the operations team can observe the system using the cloud native tools like Prometheus, Grafana and so forth. The operational tasks are a shared responsibility across the teams: 
* Application teams can watch out for the capacity and performance and tune the PVCs accordingly. 
* Platform or Cluster teams can check for the utilization and performance of the storage per node and decide on expansion and spreading out of the data engines 
* Infrastructure team will be responsible for planning the expansion or optimizations based on the utilization of the resources.

## Install Overview

- Based on the storage requirements for your stateful workloads, [select the OpenEBS Storage engines to be installed](#select-the-openebs-storage-engines).
- Kubernetes 1.18 or newer is recommended. If you would like to run on earlier versions, check the version compatibility for the selected OpenEBS Storage engine.
- Understand the [pre-requisites](/docs/next/prerequisites.html) for your Kubernetes platform
- [Install](/docs/next/installation.html) OpenEBS through `helm` or `kubectl`.
- Configure your storage engine and setup the required storage classes.
- Deploy your stateful workloads using the OpenEBS Storage Classes.


## Select the OpenEBS Storage engines

OpenEBS uses container attached storage pattern, which implies that you can decided the right storage engines for your workload, similar to how you make a choice between the various CNI plugins that are available out there.

See the following table for recommendation on which engine is right for your application depending on the application requirements and storage available on your Kubernetes nodes. 

| Application requirements   | Storage Type | OpenEBS Volumes
|--- |--- |--- 
| Low Latency, High Availability, Synchronous replication, Snapshots, Clones, Thin provisioning | SSDs/Cloud Volumes | [Mayastor](/docs/next/ugmayastor.html)
| High Availability, Synchronous replication, Snapshots, Clones, Thin provisioning | Disks/SSDs/Cloud Volumes | <a href="https://github.com/openebs/cstor-operators" target="_blank">cStor</a>
| High Availability, Synchronous replication, Thin provisioning | hostpath or external mounted storage | [Jiva](/docs/next/jivaguide.html)
| Low latency, Local PV | hostpath or external mounted storage | [Local PV - Hostpath](/docs/next/uglocalpv-hostpath.html), <a href="https://github.com/openebs/rawfile-localpv" target="_blank">Local PV - Rawfile</a>
| Low latency, Local PV | Disks/SSDs/Cloud Volumes | [Local PV - Device](/docs/next/uglocalpv-device.html)
| Low latency, Local PV, Snapshots, Clones | Disks/SSDs/Cloud Volumes | <a href="https://github.com/openebs/zfs-localpv" target="_blank">Local PV - ZFS </a>, <a href="https://github.com/openebs/lvm-localpv" target="_blank">Local PV - LVM </a>


## Next Steps

### Verify prerequisites

Select from the list of platform below to follow the instructions to setup or verify the prerequisites:

- [Ubuntu](/docs/next/prerequisites.html#ubuntu)
- [RHEL](/docs/next/prerequisites.html#rhel)
- [CentOS](/docs/next/prerequisites.html#centos)
- [OpenShift](/docs/next/prerequisites.html#openshift)
- [Rancher](/docs/next/prerequisites.html#rancher)
- [ICP](/docs/next/prerequisites.html#icp)
- [EKS](/docs/next/prerequisites.html#eks)
- [GKE](/docs/next/prerequisites.html#gke)
- [AKS](/docs/next/prerequisites.html#aks)
- [Digital Ocean](/docs/next/prerequisites.html#do)
- [Konvoy](/docs/next/prerequisites.html#konvoy)

OpenEBS has been designed to run on any platform, using available any storage. If your platform is missing in the above list, please [raise an issue on the docs](https://github.com/openebs/openebs/issues/new/choose) or reach us on the [community slack](/docs/next/support.html) to let us know. 

### Install

### Configure Storage Classes

### Running Stateful Workloads


