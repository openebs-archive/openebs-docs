---
id: quickstart
title: Quickstart Guide to OpenEBS
sidebar_label: Quickstart
---
------

<br>
This guide will help you to install and setup OpenEBS to dynamically provision and manage Kubernetes persistent volumes for your Stateful Workloads. Depending on the needs of your Stateful workload and the type of storage at your disposable, you can select from a range of Local and Replicated Persistent Volumes.

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

## Install Overview

<div class="emphasize">
    <ul>
        <li>Based on the storage requirements for your stateful workloads, [select the OpenEBS Storage engines to be installed](#select-the-openebs-storage-engines).
        </li>
        <li>Kubernetes 1.18 or newer is recommended. If you would like to run on earlier versions, check the version compatibility for the selected OpenEBS Storage engine.
        </li>
        <li>Understand the <a href="/docs/next/prerequisites.html">pre-requisites</a> for your Kubernetes platform</li>
        <li>Install <a href="/docs/next/installation.html">OpenEBS</a> through `helm` or `kubectl`.</li>
        <li>Configure your storage engine and setup the required storage classes.</li>
        <li>Deploy your stateful workloads using the OpenEBS Storage Classes.</li>
    </ul>
</div>

<br>

## Select the OpenEBS Storage engines


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


<hr>



