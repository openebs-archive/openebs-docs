---
id: installation
title: Installing OpenEBS
sidebar_label: Installation
---
------

<br>

<img src="/docs/assets/svg/1-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>

<font size="6">Summary:</font>

- Verify if [iSCSI client](#verify-iscsi-client) is running

- Set Kubernetes [admin context](#set-cluster-admin-user-context)

- Installation
  - **[helm](#installation-through-helm) chart** `(or)`
  - **[kubectl yaml](#installation-through-kubectl) spec file**
  
- [Verify](#verifying-openebs-installation) installation 

- Installation [troubleshooting](/docs/next/troubleshooting.html#installation) 

- [Post installation](#post-installation-considerations)

<br>
<hr>
<br>

## Verify iSCSI client

<br>

iSCSI client is a pre-requisite for provisioning cStor and Jiva volumes. However, it is recommended that the [iSCSI client is setup](/docs/next/prerequisites.html) and iscsid service is running on worker nodes before proceeding with the OpenEBS installation.

<br>
<hr>
<br>



## Set cluster-admin user context

<br>

For installation of OpenEBS, cluster-admin user context is a must. 

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

<br>
<hr>
<br>

## Installation through helm

Verify helm is installed and helm repo is updated. See [helm docs](https://helm.sh/docs/intro/install/#from-script) for setting up helm v3. Installed helm version can be obtained by using the following command:

```
helm version
```
Example output:

<div class="co">
version.BuildInfo{Version:"v3.6.0", GitCommit:"7f2df6467771a75f5646b7f12afb408590ed1755", GitTreeState:"clean", GoVersion:"go1.16.3"}
</div>

Setup helm repository
```
helm repo add openebs https://openebs.github.io/charts
helm repo update
```

Install OpenEBS helm chart with default values
```
helm install openebs --namespace openebs openebs/openebs --create-namespace
```
The above commands will install OpenEBS in `openebs` namespace and chart name as `openebs` 

To view the chart
```
helm ls -n openebs
```


**Note:** 

1. Since Kubernetes 1.12, if any containers does not set its resource requests & limits values, it results into eviction. It is recommended to set these values appropriately to OpenEBS pod spec in the operator YAML before installing OpenEBS. The example configuration can be obtained from [here](#example-configuration-pod-resource-requests).

2. Check the blockdevice mount status on Nodes before installing OpenEBS operator. More details can be obtained [here](/docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume). 


As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.



In the **custom installation mode**, you can achieve the following advanced configurations

- Choose a set of nodes for OpenEBS control plane pods.
- Choose a set of nodes for OpenEBS storage pool.
- You can customize the disk filters that need to be excluded from being used.
- You can choose custom namespace other than default namespace  `openebs`.

Follow the below instructions to do any of the above configurations and then install OpenEBS through helm and values.yaml

<font size="5">Setup nodeSelectors for OpenEBS control plane</font>

In a large Kubernetes cluster, you may choose to limit the scheduling of the OpenEBS control plane pods to two or three specific nodes. To do this, use nodeSelector field of PodSpec of OpenEBS control plane pods - *apiserver, volume provisioner,admission-controller and snapshot operator*.

See the example [here](#example-nodeselector-helm).

<font size="5">Setup nodeSelectors for Node Disk Manager (NDM)</font>

OpenEBS cStorPool is constructed using the disk custom resources or disk CRs created by Node Disk Manager or NDM. If you want to consider only some nodes in Kubernetes cluster to be used for OpenEBS storage (for hosting cStor Storage Pool instances), then use nodeSelector field of NDM PodSpec and dedicate those nodes to NDM.

See an example [here](#example-nodeselector-helm).

<font size="5">Setup disk filters for Node Disk Manager</font>

NDM by default filters out the below disk patterns and converts the rest of the disks discovered on a given node into DISK CRs as long as they are not mounted.

```
"exclude":"loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-"
```

If your cluster nodes have different disk types that are to be filtered out (meaning that those should not be created as DISK CRs ), add the additional disk patterns to the exclude list.

See an example configuration [here](#example-helm-diskfilter)



<font size="5">Other values.yaml parameters</font>

For customized configuration through helm, use values.yaml or command line parameters.

Default values for Helm Chart parameters are provided [below](#helm-values).


After doing the custom configuration in the values.yaml file, run the below command to do the custom installation.

```
helm install --namespace <custom_namespace> --name openebs openebs/openebs -f values.yaml
```

As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.

<br>

<hr>

## Installation through kubectl 



In the **default installation mode**, use the following command to install OpenEBS. OpenEBS is installed in `openebs` namespace. 

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
```


As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.

<br>

**Note:** 

1. Since Kubernetes 1.12,  if any pod containers does not set its resource requests & limits values, it results into eviction. It is recommend to set these values appropriately to OpenEBS pod spec in the operator YAML before installing OpenEBS. The example configuration can be get from [here](#example-configuration-pod-resource-requests). 

2. Check the blockdevice mount status on Nodes before installing OpenEBS operator. More details can be obtained [here](/docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume). 

In the **custom installation mode**, you can achieve the following advanced configurations.

- Choose a set of nodes for OpenEBS control plane pods
- Choose a set of nodes for OpenEBS storage pool
- You can customize the disk filters that need to be excluded from being used
- (Optional) Configure with Environment Variables in OpenEBS operator YAML


For custom installation, <a href="https://openebs.github.io/charts/openebs-operator.yaml" target="_blank">download</a> the **openebs-operator** YAML file, update the above configurations using the instructions below and proceed to installation with  `kubectl` command.



<font size="5">Setup nodeSelectors for OpenEBS control plane</font> 

In a large Kubernetes cluster, you may choose to limit the scheduling of the OpenEBS control plane pods to two or three specific nodes. To do this, specify a map of key-value pair and then attach the same key-value pair as labels to the required nodes on the cluster. 

Example nodeSelector configuration for OpenEBS control plane components is given [here](#example-nodeselector-yaml). 

<br>

<font size="5">Setup nodeSelectors for Admission Controller</font> 

The Admission controller to intercepts the requests to the Kubernetes API server prior to persistence of the object, but after the request is authenticated and authorized. This openebs admission controller implements additional custom admission policies to validate the incoming request. The following are the admission policies available with the latest main release.

1. PersistentVolumeClaim delete requests validates if there is clone PersistentVolumeClaim exists.
2. Clone PersistentVolumeClaim create requests validates requested claim capacity. This has to be equal to snapshot size.

The Admission Controller pod can be scheduled on particular node using nodeSelector method. 

Example nodeSelector configuration for OpenEBS control plane components is given [here](#example-nodeselector-yaml). 

<br>

<font size="5">Setup nodeSelectors for Node Disk Manager (NDM)</font> 



OpenEBS cStorPool is constructed using the block device custom resources or block device created by Node Disk Manager or NDM. If you want to consider only some nodes in Kubernetes cluster to be used for OpenEBS storage (for hosting cStor Storage Pool instances), then specify a map of key-value pair and then attach the same key-value pair as labels to the required nodes on the cluster. 

Example nodeSelector configuration for OpenEBS control plane components is given [here](#example-nodeselector-yaml). 

<br>

<font size="5">Setup disk filters for Node Disk Manager</font> 



NDM by default filters out the below disk patterns and converts the rest of the disks discovered on a given node into DISK CRs as long as they are not mounted. 

`"exclude":"loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-"`

If your cluster nodes have different disk types that are to be filtered out (meaning that those should not be created as DISK CRs ), add the additional disk patterns to the exclude list in the yaml file. 

See an example configuration [here](#example-diskfilter-yaml)

<br>



<font size="5">Configure with Environment Variables</font> 



Some of the configurations related to cStor Target, default cStor sparse pool, default Storage configuration, Local PV Basepath, etc can be configured as 
variables in the corresponding deployment specification. 


<h4><a class="anchor" aria-hidden="true" id="enable-core-dump"></a>Enable core dump</h4>

Dumping cores has been disabled by default for `cStor pool` and `NDM daemonset` pods. This can be enabled by setting an ENV variable `ENABLE_COREDUMP` to `1`. The ENV setting can be added in cStor pool deployment for dumping core for cStor pool pod and the ENV setting can be added in ndm daemonset  spec for dumping core for ndm daemonset pods.
```
 - name: ENABLE_COREDUMP
   value: "1"
```

<h4><a class="anchor" aria-hidden="true" id="sparse-dir "></a>SparseDir</h4>

SparseDir is a hostPath directory where to look for sparse files. The default value is "/var/openebs/sparse". 

The following configuration must added as environment variables in the maya-apiserver deployment specification. This change must be done before applying the OpenEBS operator YAML file. 

```
 # environment variable
 - name: SparseDir
   value: "/var/lib/"
```



<h4><a class="anchor" aria-hidden="true" id="default-cstor-sparse-pool"></a>Default cStorSparsePool</h4>

The OpenEBS installation will create default cStor sparse pool based on this configuration value. If "true",  default cStor sparse pools will be configured, if "false", it will not be configure a default cStor sparse pool. The default configured value is "false". The use of cStor sparse pool is for testing purposes only. 

The following configuration must be added as environment variables in the `maya-apiserver` deployment specification for the installation of cStor pool using sparse disks. This change must be done before applying the OpenEBS operator YAML file. 

**Example:**

```
# environment variable
- name: OPENEBS_IO_INSTALL_DEFAULT_CSTOR_SPARSE_POOL
  value: "false"
```



<h4><a class="anchor" aria-hidden="true" id="target-Dir"></a>TargetDir</h4>

Target Dir is a hostPath directory for target pod. The default value is "/var/openebs".  This value can override the existing host path introducing a `OPENEBS_IO_CSTOR_TARGET_DIR` ENV in maya-apiserver deployment. This configuration might required where underlying host OS does not have write permission on default OpenEBS path(/var/openebs/). 

The following configuration must added as environment variables in the `maya-apiserver` deployment specification. This change must be done before applying the OpenEBS operator YAML file. 

**Example:**

```
# environment variable
- name: OPENEBS_IO_CSTOR_TARGET_DIR
  value: "/var/lib/overlay/openebs"
```



<h4><a class="anchor" aria-hidden="true" id="basepath-for-openEBS-local-pv "></a>Basepath for OpenEBS Local PV</h4>

By default the hostpath is configured as `/var/openebs/local` for Local PV based on hostpath, which can be changed during the OpenEBS operator install by passing the `OPENEBS_IO_BASE_PATH` ENV parameter to the Local PV dynamic provisioner deployment. 

```
# environment variable
 - name: OPENEBS_IO_BASE_PATH
   value: "/mnt/"
```



<h4><a class="anchor" aria-hidden="true" id="default-storage-configuration "></a>Default Storage Configuration</h4>

OpenEBS comes with default storage configuration like Jiva and Local PV storage classes and so forth. Each of the storage engines in OpenEBS is highly configurable and the customization is done via Storage Classes and associated Custom Resources. While the default storage configuration can be modified after installation, it is going to be overwritten by the OpenEBS API Server. The recommended approach for customizing is to have users create their own storage configuration using the default options as examples/guidance. 
If you would like to use a customized configuration, you can disable the installation of the default storage configuration during the installation. The following configuration must be added as environment variables in the `maya-apiserver` deployment specification to disable default storage configuration.

```
# environment variable
- name: OPENEBS_IO_CREATE_DEFAULT_STORAGE_CONFIG
  value: "false"
```

**Note:** Starting with 0.9, cStor Sparse pool and its Storage Class are not created by default. If you need to enable the cStor Sparse pool for development or test environments, you should have the above Default Storage Configuration enabled as well as cStor sparse pool enabled using the instructions mentioned [here](#default-cstor-sparse-pool).



After doing the custom configuration in the downloaded openebs-operator.yaml file, run the below command to do the custom installation.

```
kubectl apply -f <modified openebs-operator.yaml>
```



As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.

<br>

<hr>
<br>

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
standard (default)          kubernetes.io/gce-pd                                       6m41s
</div>



**Verify Block Device CRs** 



NDM daemon set creates a block device CR for each block devices that is discovered on the node with two exceptions

- The disks that match the exclusions in 'vendor-filter'  and 'path-filter'
- The disks that are already mounted in the node


List the block device  CRs to verify the CRs are appearing as expected.

```
kubectl get blockdevice -n openebs
```

Following is an example output.

<div class="co">
NAME                                           NODENAME                                    SIZE          CLAIMSTATE   STATUS   AGE
blockdevice-1c10eb1bb14c94f02a00373f2fa09b93   gke-ranjith-14-default-pool-da9e1336-mbq9   42949672960   Unclaimed    Active   14s
blockdevice-77f834edba45b03318d9de5b79af0734   gke-ranjith-14-default-pool-da9e1336-d9zq   42949672960   Unclaimed    Active   22s
blockdevice-936911c5c9b0218ed59e64009cc83c8f   gke-ranjith-14-default-pool-da9e1336-9j2w   42949672960   Unclaimed    Active   30s
</div>

To know which block device CR belongs to which node, check the node label set on the CR by doing the following command.

```
kubectl describe blockdevice <blockdevice-cr> -n openebs
```



**Verify Jiva default pool - default**


```
kubectl get sp
```

Following is an example output.

<div class="co">NAME      AGE
default   2m
</div>
Note that listing `sp` lists both `csp` and the `Jiva pool`. 

<br>

<hr>
<br>

## Post-Installation considerations

<br>

For a simple testing of OpenEBS, you can use the below default storage classes

- `openebs-jiva-default` for provisioning Jiva Volume (this uses `default` pool which means the data replicas are created in the /mnt/openebs_disk directory of the Jiva replica pod)

- `openebs-hostpath` for provisioning Local PV on hostpath.

- `openebs-device` for provisioning Local PV on device.

For using real disks, you have to create [cStorPools](/docs/next/ugcstor.html#creating-cStor-storage-pools) or [Jiva pools](/docs/next/jivaguide.html#create-a-pool) or [OpenEBS Local PV](/docs/next/uglocalpv-device.html) based on the requirement and then create corresponding StorageClasses or use default StorageClasses to use them.



<br>

<hr>
<br>

## Customizing Install

Depending on your mode of install `helm` or `kubectl`, you can customize your install by providing a custom helm `values.yaml` or by maintaining your own `openebs-operator.yaml`.

You can download the default helm `values.yaml` from [here](https://raw.githubusercontent.com/openebs/charts/master/charts/openebs/values.yaml).
You can download the default openebs-operator.yaml from [here](https://openebs.github.io/charts/openebs-operator.yaml).

### Reserve space for ephemeral storage 

Starting with Kubernetes 1.13, there is a possibility that Kubernetes could erroneously evict pods that have not specified ephemeral storage requests under disk stress conditions. It is recommended that resource requests be enabled to all your openebs control plane components.

You can update the resource requests for OpenEBS control plane components by providing a custom `values.yaml` or by editing the `openebs-operator.yaml` file depending on your choice of install.


<br>
<hr>

### Example configurations - helm


<h3><a class="anchor" aria-hidden="true" id="example-nodeselector-helm"></a>For nodeSelectors in values.yaml (helm)</h3>
First, label the required nodes with an appropriate label. In the following command, the required nodes for storage nodes are labelled as *node=openebs*

```
kubectl label nodes <node-name> node=openebs
```

Find `apiServer`, `provisioner`, `snapshotOperator`, `admission-server` and `ndm` sections in `values.yaml` and update `nodeSelector` key. Example of the updated `nodeSelector` section for `provisioner` with value of `node:openebs` would be as follows:

```
provisioner:
  ...
  ...
  nodeSelector: 
    node: openebs
  ...
  ...
```



<h3><a class="anchor" aria-hidden="true" id="example-helm-diskfilter"></a>For disk filters in values.yaml (helm)</h3>
In the `values.yaml`, find`ndm` section to update `excludeVendors:` and `excludePaths:`

```
ndm:
  ...
  ...
  filters:
    excludeVendors: "CLOUDBYT,OpenEBS"
    includePaths: ""
    excludePaths: "loop,fd0,sr0,/dev/ram,/dev/dm-,/dev/md"
  ...
  ...
```



<h3><a class="anchor" aria-hidden="true" id="helm-values"></a>Default Values for Helm Chart Parameters</h3>

Download the values.yaml from [here](https://github.com/openebs/charts/blob/master/charts/openebs/values.yaml) and update them as per your needs.

<br>


### Example configurations - kubectl



<h4><a class="anchor" aria-hidden="true" id="example-nodeselector-yaml"></a>For nodeSelectors in openebs-operator.yaml</h4>
First, label the required nodes with an appropriate label. In the following command, the required nodes for storage nodes are labelled as *node=openebs*.

```
kubectl label nodes <node-name> node=openebs
```

Next, in the downloaded openebs-operator.yaml, find the PodSpec for `openebs-provisioner`, `maya-apiserver`, `openebs-snapshot-operator`, `openebs-admission-server` and `openebs-ndm` pods and add the following key-value pair under `nodeSelector` field

```
nodeSelector:
  node: openebs
```

<br>

<h4><a class="anchor" aria-hidden="true" id="example-diskfilter-yaml"></a>For disk filters in openebs-operator.yaml</h4>
In the downloaded `openebs-operator.yaml`, find `openebs-ndm-config` configmap and update the values for keys `path-filter` and `vendor-filter`

```
---
# This is the node-disk-manager related config.
# It can be used to customize the disks probes and filters
apiVersion: v1
kind: ConfigMap
metadata:
  name: openebs-ndm-config
  namespace: openebs
data:
  # udev-probe is default or primary probe which should be enabled to run ndm
  # filterconfigs contains configs of filters - in their form fo include
  # and exclude comma separated strings
  node-disk-manager.config: |
    probeconfigs:
      - key: udev-probe
        name: udev probe
        state: true
      - key: seachest-probe
        name: seachest probe
        state: false
      - key: smart-probe
        name: smart probe
        state: true
    filterconfigs:
      - key: os-disk-exclude-filter
        name: os disk exclude filter
        state: true
        exclude: "/,/etc/hosts,/boot"
      - key: vendor-filter
        name: vendor filter
        state: true
        include: ""
        exclude: "CLOUDBYT,OpenEBS"
      - key: path-filter
        name: path filter
        state: true
        include: ""
        exclude: "loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md"
---
```

<br>
<hr>
<br>
<br>

## See Also:

### [OpenEBS Architecture](/docs/next/architecture.html)

### [Installation troubleshooting](/docs/next/troubleshooting.html)

### [OpenEBS use cases](/docs/next/usecases.html)

<br>

<hr>

<br>

