---
id: installation
title: Installing OpenEBS
sidebar_label: Installation
---
------
<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  OpenEBS Documentation is now migrated to https://openebs.io/docs. The page you are currently viewing is a static snapshot and will be removed in the upcoming releases. </strong></p></center>
<br>
This guide will help you to customize and install OpenEBS. 

## Prerequisites

If this is your first time installing OpenEBS, make sure that your Kubernetes nodes meet the [required prerequisites](/docs/next/prerequisites.html). At a high level OpenEBS requires:

- Verify that you have the admin context. If you do not have admin permissions to your cluster, please check with your Kubernetes cluster administrator to help with installing OpenEBS or if you are the owner of the cluster, check out the <a href="/docs/next/installation.html#set-cluster-admin-user-context" target="_blank"> steps to create a new admin context </a> and use it for installing OpenEBS.
- You have Kubernetes 1.18 version or higher.
- Each storage engine may have few additional requirements like having:
  - iSCSI initiator utils installed for Jiva and cStor volumes
  - Depending on the managed Kubernetes platform like Rancher or MicroK8s - set up the right bind mounts
  - Decide which of the devices on the nodes should be used by OpenEBS or if you need to create LVM Volume Groups or ZFS Pools
- Join [OpenEBS community on Kubernetes slack](docs/next/support.html). 


## Installation through helm

Verify helm is installed and helm repo is updated. You need helm 3.2 or more. 

Setup helm repository
```
helm repo add openebs https://openebs.github.io/charts
helm repo update
```

OpenEBS provides several options that you can customize during install like:
- specifying the directory where hostpath volume data is stored or
- specifying the nodes on which OpenEBS components should be deployed, and so forth. 

The default OpenEBS helm chart will only install Local PV hostpath and Jiva data engines. Please refer to <a href="https://github.com/openebs/charts/tree/master/charts/openebs" target="_blank">OpenEBS helm chart documentation</a> for full list of customizable options and using cStor and other flavors of OpenEBS data engines by setting the correct helm values. 

Install OpenEBS helm chart with default values. 

```
helm install openebs --namespace openebs openebs/openebs --create-namespace
```
The above commands will install OpenEBS Jiva and Local PV components in `openebs` namespace and chart name as `openebs`. To install and enable other engines you can modified the above command as follows:

- cStor 
  ```
  helm install openebs --namespace openebs openebs/openebs --create-namespace --set cstor.enabled=true
  ```

To view the chart
```
helm ls -n openebs
```

As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.


## Installation through kubectl 

OpenEBS provides a list of YAMLs that will allow you to easily customize and run OpenEBS in your Kubernetes cluster. For custom installation, <a href="https://openebs.github.io/charts/openebs-operator.yaml" target="_blank">download</a> the **openebs-operator** YAML file, update the configurations and use the customized YAML for installation in the below `kubectl` command.

To continue with default installation mode, use the following command to install OpenEBS. OpenEBS is installed in `openebs` namespace. 

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
```

The above command installs Jiva and Local PV components. To install and enable other engines you will need to run additional command like:
- cStor 
  ```
  kubectl apply -f https://openebs.github.io/charts/cstor-operator.yaml
  ```
- Local PV ZFS
  ```
  kubectl apply -f https://openebs.github.io/charts/zfs-operator.yaml
  ```
- Local PV LVM
  ```
  kubectl apply -f https://openebs.github.io/charts/lvm-operator.yaml
  ```


## Verifying OpenEBS installation


**Verify pods:**

List the pods in `<openebs>` namespace 

```
kubectl get pods -n openebs
```

In the successful installation of OpenEBS, you should see an example output like below.

<div class="co">
NAME                                           READY   STATUS    RESTARTS   AGE
maya-apiserver-d77867956-mv9ls                 1/1     Running   3          99s
openebs-admission-server-7f565bcbb5-lp5sk      1/1     Running   0          95s
openebs-localpv-provisioner-7bb98f549d-ljcc5   1/1     Running   0          94s
openebs-ndm-dn422                              1/1     Running   0          96s
openebs-ndm-operator-84849677b7-rhfbk          1/1     Running   1          95s
openebs-ndm-ptxss                              1/1     Running   0          96s
openebs-ndm-zpr2l                              1/1     Running   0          96s
openebs-provisioner-657486f6ff-pxdbc           1/1     Running   0          98s
openebs-snapshot-operator-5bdcdc9b77-v7n4w     2/2     Running   0          97s
</div>

`openebs-ndm` is a daemon set, it should be running on all nodes or on the nodes that are selected through nodeSelector configuration.

The control plane pods `openebs-provisioner`, `maya-apiserver` and `openebs-snapshot-operator` should be running. If you have configured nodeSelectors , check if they are scheduled on the appropriate nodes by listing the pods through `kubectl get pods -n openebs -o wide`


**Verify StorageClasses:**

List the storage classes to check if OpenEBS has installed with default StorageClasses.  

```
kubectl get sc
```

In the successful installation, you should have the following StorageClasses are created.

<div class="co">
NAME                        PROVISIONER                                                AGE
openebs-device              openebs.io/local                                           64s
openebs-hostpath            openebs.io/local                                           64s
openebs-jiva-default        openebs.io/provisioner-iscsi                               64s
openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   64s
</div>


## Post-Installation considerations

<br>

For testing your OpenEBS installation, you can use the below default storage classes

- `openebs-jiva-default` for provisioning Jiva Volume (this uses `default` pool which means the data replicas are created in the /var/openebs/ directory of the Jiva replica pod)

- `openebs-hostpath` for provisioning Local PV on hostpath.


You can follow through the below user guides for each of the engines to use storage devices available on the nodes instead of the `/var/openebs` directory to save the data.  
- [cStor](/docs/next/ugcstor-csi.html)
- [Jiva](/docs/next/jivaguide.html)
- [Local PV](/docs/next/uglocalpv-hostpath.html)

## Troubleshooting

### Set cluster-admin user context

For installation of OpenEBS, cluster-admin user context is a must. OpenEBS installs service accounts and custom resource definitions that are only allowed for cluster administrators. 

Use the `kubectl auth can-i` commands to verify that you have the cluster-admin context. You can use the following commands to verify if you have access: 

```
kubectl auth can-i 'create' 'namespace' -A
kubectl auth can-i 'create' 'crd' -A
kubectl auth can-i 'create' 'sa' -A
kubectl auth can-i 'create' 'clusterrole' -A
```

If there is no cluster-admin user context already present, create one and use it. Use the following command to create the new context.

```
kubectl config set-context NAME [--cluster=cluster_nickname] [--user=user_nickname] [--namespace=namespace]
```

Example:

```
kubectl config set-context admin-ctx --cluster=gke_strong-eon-153112_us-central1-a_rocket-test2 --user=cluster-admin
```

Set the existing cluster-admin user context or the newly created context by using the following command.

Example:

```
kubectl config use-context admin-ctx
```


## See Also:

### [OpenEBS Architecture](/docs/next/architecture.html)

### [OpenEBS Examples](/docs/next/usecases.html)

### [Troubleshooting](/docs/next/troubleshooting.html)

<br>
<br>

