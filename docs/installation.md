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



- Verify if [iSCSI.d](#verify-iscsi-client) service is running

- Set Kubernetes [admin context](#set-cluster-admin-user-context-and-rbac) and RBAC

- Install through 
  - **[helm](#installation-through-helm) chart**  `(or)`

  - **[kubectl yaml](#installation-through-kubectl) spec file**

- [Verify](#verifying-openebs-installation) installation 

- Installation [troubleshooting](/docs/next/troubleshooting.html#installation) 

- [Post installation](#post-installation-considerations)

<br>

<hr>

<br>

## Verify iSCSI client

<br>

iSCSI client is a pre-requisite for provisioning volumes and not for installation of OpenEBS. However, it is recommended that the [iSCSI client is setup](/docs/next/prerequisites.html) and iSCSI.d service is running before proceeding with the installation

<br>

<hr>
<br>



## Set cluster-admin user context and RBAC

<br>

For installation of OpenEBS, cluster-admin user context is a must. 

If there is no cluster-admin user context already, create one and use it. Use the following command to create the new context

```
kubectl config set-context NAME [--cluster=cluster_nickname] [--user=user_nickname] [--namespace=namespace]
```

Example:

```
kubectl config set-context admin-ctx --cluster=gke_strong-eon-153112_us-central1-a_rocket-test2 --user=cluster-admin
```



Set the existing cluster-admin user context or the newly created context by using the following command

Example:

```
kubectl config use-context admin-ctx
```



If you are using GKE or any other cloud providers, you must enable RBAC before OpenEBS installation. This can be done from the kubernetes master console by executing the following command.

```
kubectl create clusterrolebinding  <cluster_name>-admin-binding --clusterrole=cluster-admin --user=<user-registered-email-with-the-provider>
```

<br>

<hr>

<br>

## Installation through helm

<br>

Verify helm is installed and helm repo is updated. See <a href="https://docs.helm.sh/using_helm/#from-script" target="_blank">helm docs</a>  for setting up helm and  simple [instructions below](#helm-rbac) for setting up RBAC for tiller.



In the **default installation mode**, use the following command to install OpenEBS. OpenEBS is installed in openebs namespace. 

```
helm install --namespace <custom_namespace> --name openebs stable/openebs
```
**Note:**The helm based installation is only supported for main version releases. Latest RC build are only supported through kubectl apply method. Current latest main version is 0.9.0.

**Note:** Since Kuberentes 1.12,  if any pod containers does not set its resource requests & limits values, it results into eviction. It is recommend to set these values appropriately to OpenEBS pod spec in the operator YAML before installling OpenEBS. The example configuration can be get from [here](#example-configuration-pod-resource-requets). 

As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.

<br>

In the **custom installation mode**, you can achieve the following advanced configurations

- Choose a set of nodes for OpenEBS control plane pods.
- Choose a set of nodes for OpenEBS storage pool.
- You can customise the disk filters that need to be excluded from being used.

Follow the below instructions to do any of the above configurations and then install OpenEBS through helm and values.yaml



<font size="5">Setup nodeSelectors for OpenEBS control plane</font> 

In a large Kubernetes cluster, you may choose to limit the scheduling of the OpenEBS control plane pods to two or three specific nodes. To do this, use nodeSelector field of PodSpec of OpenEBS control plane pods - *apiserver, volume provisioner,admission-controller and snapshot operator*.  

See the example [here](#example-nodeselector-helm). 



<font size="5">Setup nodeSelectors for Node Disk Manager (NDM)</font> 

OpenEBS cStorPool is constructed using the disk custom resources or disk CRs created by Node Disk Manager or NDM. If you want to consider only some nodes in Kubernetes cluster to be used for OpenEBS storage (for hosting cStor Storage Pool instances), then use nodeSelector field of NDM PodSpec and dedicate those nodes to NDM.  

See an example [here](#example-nodeselector-helm). 



<font size="5">Setup disk filters for Node Disk Manager</font> 

NDM by default filters out the below disk patterns and converts the rest of the disks discovered on a given node into DISK CRs as long as they are not mounted. 

`"exclude":"loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-"`

If your cluster nodes have different disk types that are to be filtered out (meaning that those should not be created as DISK CRs ), add the additional disk patterns to the exclude list. 

See an example configuration [here](#example-helm-diskfilter)



<font size="5">Other values.yaml parameters</font>

For customized configuration through helm, use values.yaml or command line parameters. 

Default values for Helm Chart parameters are provided [below](#helm-values).

<br>

After doing the custom configuration in the values.yaml file, run the below command to do the custom installation.



```
helm install --namespace <custom_namespace> --name openebs stable/openebs -f values.yaml
```



As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.

<br>

<hr>

<br>

## Installation through kubectl 

<br>

In the **default installation mode**, use the following command to install OpenEBS. OpenEBS is installed in openebs namespace. 

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-1.0.0-RC1.yaml
```

**Note:** Since Kuberentes 1.12,  if any pod containers does not set its resource requests & limits values, it results into eviction. It is recommend to set these values appropriately to OpenEBS pod spec in the operator YAML before installling OpenEBS. The example configuration can be get from [here](#example-configuration-pod-resource-requets). 



As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.

<br>

In the **custom installation mode**, you can achieve the following advanced configurations.

- Choose a set of nodes for OpenEBS control plane pods
- Choose a set of nodes for OpenEBS storage pool
- You can customise the disk filters that need to be excluded from being used
- (Optional)Configure volume related configuration as Environmental variable in the maya-apiserver deployment specification.



For custom installation, <a href="https://openebs.github.io/charts/openebs-operator-1.0.0-RC1.yaml" target="_blank">download</a> the **openebs-operator-1.0.0-RC1** file, update the above configurations using the instructions below and proceed to installation with  `kubectl` command.



<font size="5">Setup nodeSelectors for OpenEBS control plane</font> 

In a large Kubernetes cluster, you may choose to limit the scheduling of the OpenEBS control plane pods to two or three specific nodes. To do this, specify a map of key-value pair and then attach the same key-value pair as labels to the required nodes on the cluster. 

Example nodeSelector configuration for OpenEBS control plane components is given [here](#example-nodeselector-yaml). 

<br>

<font size="5">Setup nodeSelectors for Admission Controller</font> 

The Admission controller to intercepts the requests to the Kubernetes API server prior to persistence of the object, but after the request is authenticated and authorized. This openebs admission controller implements additional custom admission policies to validate the incoming request. The following are the admission policies avaialble with the latest release.

1. PersistentVolumeClaim delete requests validates if there is clone PersistentVolumeClaim exists.
2. Clone PersistentVolumeClaim create requests validates requested claim capacity. This has to be equal to snapshot size.

The Admission Controller pod can be scheduled on particular node using nodeSelector method. 

Example nodeSelector configuration for OpenEBS control plane components is given [here](#example-nodeselector-yaml). 

<br>

<font size="5">Setup nodeSelectors for Node Disk Manager (NDM)</font> 

OpenEBS cStorPool is constructed using the disk custom resources or disk CRs created by Node Disk Manager or NDM. If you want to consider only some nodes in Kubernetes cluster to be used for OpenEBS storage (for hosting cStor Storage Pool instances), then specify a map of key-value pair and then attach the same key-value pair as labels to the required nodes on the cluster. 

Example nodeSelector configuration for OpenEBS control plane components is given [here](#example-nodeselector-yaml). 

<br>

<font size="5">Setup disk filters for Node Disk Manager</font> 

NDM by default filters out the below disk patterns and converts the rest of the disks discovered on a given node into DISK CRs as long as they are not mounted. 

`"exclude":"loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-"`

If your cluster nodes have different disk types that are to be filtered out (meaning that those should not be created as DISK CRs ), add the additional disk patterns to the exclude list in the yaml file. 

See an example configuration [here](#example-diskfilter-yaml)

<br>

<font size="5">Configure Environmental Variable</font> 

Some of the configurations related to default cStor sparse pool, cStor Target, Local PV Basepath, etc can be configured as environmental variable in the corresponding deployment specification. 

<h4><a class="anchor" aria-hidden="true" id="sparse-dir "></a>SparseDir</h4>

SparseDir is a hostPath directory where to look for sparse files. The default value is "/var/openebs/sparse". 

The following configuration must added as environmental variable in the maya-apiserver deployment specification. This change must be done before applying the OpenEBS operator YAML file. 

```
 # environment variable
 - name: SparseDir
   value: "/var/lib/"
```



<h4><a class="anchor" aria-hidden="true" id="default-cstor-sparse-pool"></a>Default cStorSparsePool</h4>

The OpenEBS installation will create default cStor sparse pool based on this configuration value. If "true", a default cstor sparse pool will be configured, if "false", it will not be configure a default cStor sparse pool. The default configured value is "false". The use of cStor sparse pool is for testing purposes only. 

The following configuration must added as environmental variable in the maya-apiserver deployment specification. This change must be done before applying the OpenEBS operator YAML file. 

**Example:**

```
# environment variable
- name: OPENEBS_IO_INSTALL_DEFAULT_CSTOR_SPARSE_POOL
  value: "false"
```



<h4><a class="anchor" aria-hidden="true" id="target-Dir"></a>TargetDir</h4>

Target Dir is a hostPath directory for target pod. The default value is "/var/openebs".  This value can override the existing host path introducing a `OPENEBS_IO_CSTOR_TARGET_DIR` ENV in maya-apiserver deployment. This configuration might required where underlying host OS does not have write permission on default OpenEBS path(/var/openebs/). 

The following configuration must added as environmental variable in the maya-apiserver deployment specification. This change must be done before applying the OpenEBS operator YAML file. 

**Example:**

```
# environment variable
- name: OPENEBS_IO_CSTOR_TARGET_DIR
  value: "/var/lib/overlay/openebs"
```



<h4><a class="anchor" aria-hidden="true" id="basepath-for-openEBS-local-pv "></a>Basepath for OpenEBS Local PV</h4>

By default the hostpath is configured as `/var/openebs/local`, which can either be changed during the OpenEBS operator install by passing the `OPENEBS_IO_BASE_PATH` ENV parameter to the Local PV dynamic provisioner deployment.

```
# environment variable
 - name: OPENEBS_IO_BASE_PATH
   value: "/mnt/"
```

<br>

After doing the custom configuration in the downloaded openebs-operator.yaml file, run the below command to do the custom installation.



```
kubectl apply -f <custom-openebs-operator-1.0.0-RC1.yaml>
```



As a next step [verify](#verifying-openebs-installation) your installation and do the [post installation](#post-installation-considerations) steps.

<br>

<hr>
<br>

## Verifying OpenEBS installation

**Verify pods:**

List the pods in `<openebs>` name space 

```
kubectl get pods -n openebs
```

In the successful installation of OpenEBS, you should see an example output like below.

<div class="co">NAME                                          READY     STATUS    RESTARTS   AGE
maya-apiserver-6d9858ffc9-x6rlp               1/1       Running   0          3h
openebs-admission-server-56665784df-xwt8h     1/1       Running   0          3h
openebs-localpv-provisioner-94f6477bb-fwmnm   1/1       Running   0          3h
openebs-ndm-crz9z                             1/1       Running   0          3h
openebs-ndm-l7mbd                             1/1       Running   0          3h
openebs-ndm-nvlrg                             1/1       Running   0          3h
openebs-provisioner-5dbd679f8c-pqphv          1/1       Running   0          3h
openebs-snapshot-operator-66d89b9bcf-6dkj7    2/2       Running   0          3h
</div>


`openebs-ndm` is a daemonset, it should be running on all nodes or on the nodes that are selected through nodeSelector configuration.

The control plane pods `openebs-provisioner`, `maya-apiserver` and `openebs-snapshot-operator` should be running. If you have configured nodeSelectors , check if they are scheduled on the appropriate nodes by listing the pods through `kubectl get pods -n openebs -o wide`

 <br>

**Verify StorageClasses:**



List the storage classes to check if OpenEBS has installed three new StorageClasses.

```
kubectl get sc
```

In the successful installation, you should 3 new StorageClasses

<div class="co">NAME                        PROVISIONER                                                AGE
openebs-hostpath            openebs.io/local                                           3h
openebs-jiva-default        openebs.io/provisioner-iscsi                               3h
openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   3h
standard (default)          kubernetes.io/gce-pd                                       4h
</div>


<br>

**Verify DISK CRs** 

NDM daemonset creates a disk CR for each disk that is discovered on the node with two exceptions

- The disks that match the exclusions in 'vendor-filter'  and 'path-filter'
- The disks that are already mounted in the node

NDM also creates a new sparse-disk for each node on which it is running if the corresponding ENV variable is set to true. These sparse disks are used in creating cStorStoragePool called `cstor-sparse-pool` . 

List the disk CRs to verify the CRs are appearing as expected

```
kubectl get disk
```

Following is an example output.

<div class="co">NAME                                      SIZE          STATUS    AGE
disk-acee6c6a32c780ebfba58db7b62ca3ab     42949672960   Active    1m
disk-c43b6655194d59f05d970fa255682e2f     42949672960   Active    1m
disk-f2356613045748aba5c94aa292a2efc9     42949672960   Active    1m
</div>




To know which disk CR belongs to which node, check the node label set on the CR by doing the following command.

```
kubectl describe disk <disk-cr>
```




**Verify Jiva default pool - default**

```
kubectl get sp
```

Following is an example output.

<div class="co">NAME      AGE
default   3h
</div>




Note that listing `sp` lists both `csp` and the `Jiva pool`. 



<br>

<hr>
<br>

## Post-Installation considerations

<br>

For a simple testing of OpenEBS, you can use the below default storage classes

- openebs-cstor-sparse (this uses cstor-sparse-pool as the storage pool and data is stored on sparse files that are created during installation)
- openebs-jiva-default (this uses `default` pool which means the data replicas are created in the /mnt/openebs_disk directory of the Jiva replica pod)

For using real disks, you have to [create cStorPools](/docs/next/configurepools.html) or [Jiva pools](/docs/next/jivaguide.html#create-a-jiva-pool) and then create StorageClasses to use them



To monitor the OpenEBS volumes and obtain corresponding logs, connect to the free SaaS service MayaOnline. See connecting to [MayaOnline](/docs/next/mayaonline.html). 



<br>

<hr>
<br>

## Example configuration- Pod resource requets

All openebs components should have resource requests set against each of its pod containers. This should be added in the openebs operator YAML file before applying it. This setting is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s.

<h3><a class="anchor" aria-hidden="true" id="AuxResourceRequests"></a>AuxResourceRequests</h3>

This setting is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars.

```
 - name:  AuxResourceRequests
   value: |-
       memory: 0.5Gi
       cpu: 100m
```

<br>

<hr>

<br>

## Example configurations - helm

<br>

<h4><a class="anchor" aria-hidden="true" id="helm-rbac"></a>Setup RBAC for Tiller before Installing OpenEBS Chart </h4>

```
kubectl -n kube-system create sa tiller
kubectl create clusterrolebinding tiller --clusterrole cluster-admin --serviceaccount=kube-system:tiller
kubectl -n kube-system patch deploy/tiller-deploy -p '{"spec": {"template": {"spec": {"serviceAccountName": "tiller"}}}}'
kubectl -n kube-system patch deployment tiller-deploy -p '{"spec": {"template": {"spec": {"automountServiceAccountToken": true}}}}'
```

Ensure that helm repo in your master node is updated to get the latest OpenEBS repository using the following command

```
helm repo update
```



<h4><a class="anchor" aria-hidden="true" id="example-nodeselector-helm"></a>For nodeSelectors in values.yaml (helm) </h4>



First, label the required nodes with an appropriate label. In the following command, the required nodes for storage nodes are labelled as *node=openebs*

```
kubectl label nodes <node-name> node=openebs
```

Find `apiServer`, `provisioner`, `snapshotOperator`, `admission-server` and `ndm` sections in `values.yaml` and update `nodeSelector` key. Example of the updated provisioner section in the following snippet  where `node:openebs` is the `nodeSelector` label. 

```
provisioner:
  image: "quay.io/openebs/openebs-k8s-provisioner"
  imageTag: "1.0.0-RC1"
  replicas: 1
  nodeSelector:
    node: openebs
  tolerations: []
  affinity: {}
```

<br>





<h4><a class="anchor" aria-hidden="true" id="example-helm-diskfilter"></a>For disk filters in values.yaml (helm)</h4>

In the `values.yaml`, find` ndm` section to update `excludeVendors:` and `excludePaths:`

```
ndm:
  image: "quay.io/openebs/node-disk-manager-amd64"
  imageTag: "v0.3.5"
  sparse:
    enabled: "true"
    path: "/var/openebs/sparse"
    size: "10737418240"
    count: "1"
  filters:
    excludeVendors: "CLOUDBYT,OpenEBS"
    excludePaths: "loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md"
  nodeSelector: {}
```

<br>



<h4><a class="anchor" aria-hidden="true" id="helm-values"></a>Default Values for Helm Chart Parameters</h4>



Download the values.yaml from  [here](https://github.com/helm/charts/blob/master/stable/openebs/values.yaml ) and update them as per your needs. The configurable parameters are described here for reading convenience.



| Parameter                               | Description                                  | Default                                            |
| --------------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| `rbac.create`                           | Enable RBAC Resources                        | `true`                                             |
| `image.pullPolicy`                      | Container pull policy                        | `IfNotPresent`                                     |
| `apiserver.image`                       | Docker Image for API Server                  | `quay.io/openebs/m-apiserver`                      |
| `apiserver.imageTag`                    | Docker Image Tag for API Server              | `0.9.0`                                            |
| `apiserver.replicas`                    | Number of API Server Replicas                | `1`                                                |
| `apiserver.sparse.enabled`              | Create Sparse Pool based on Sparsefile       | `false`                                            |
| `provisioner.image`                     | Docker Image for Provisioner                 | `quay.io/openebs/openebs-k8s-provisioner`          |
| `provisioner.imageTag`                  | Docker Image Tag for Provisioner             | `0.9.0`                                            |
| `provisioner.replicas`                  | Number of Provisioner Replicas               | `1`                                                |
| `localProvisioner.image`                | Image for localProvisioner                   | `quay.io/openebs/provisioner-localpv`              |
| `localProvisioner.imageTag`             | Image Tag for localProvisioner               | `0.9.0`                                            |
| `localProvisioner.replicas`             | Number of localProvisioner Replicas          | `1`                                                |
| `localProvisioner.basePath`             | BasePath for hostPath volumes on Nodes       | `/var/openebs/local`                               |
| `webhook.image`                         | Image for admision server                    | `quay.io/openebs/admission-server`                 |
| `webhook.imageTag`                      | Image Tag for admission server               | `0.9.0`                                            |
| `webhook.replicas`                      | Number of admission server Replicas          | `1`                                                |
| `snapshotOperator.provisioner.image`    | Docker Image for Snapshot Provisioner        | `quay.io/openebs/snapshot-provisioner`             |
| `snapshotOperator.provisioner.imageTag` | Docker Image Tag for Snapshot Provisioner    | `0.9.0`                                            |
| `snapshotOperator.controller.image`     | Docker Image for Snapshot Controller         | `quay.io/openebs/snapshot-controller`              |
| `snapshotOperator.controller.imageTag`  | Docker Image Tag for Snapshot Controller     | `0.9.0`                                            |
| `snapshotOperator.replicas`             | Number of Snapshot Operator Replicas         | `1`                                                |
| `ndm.image`                             | Docker Image for Node Disk Manager           | `quay.io/openebs/node-disk-manager-amd64`          |
| `ndm.imageTag`                          | Docker Image Tag for Node Disk Manager       | `v0.3.5`                                           |
| `ndm.sparse.path`                       | Directory where Sparse files are created     | `/var/openebs/sparse`                              |
| `ndm.sparse.size`                       | Size of the sparse file in bytes             | `10737418240`                                      |
| `ndm.sparse.count`                      | Number of sparse files to be created         | `1`                                                |
| `ndm.filters.excludeVendors`            | Exclude devices with specified vendor        | `CLOUDBYT,OpenEBS`                                 |
| `ndm.filters.excludePaths`              | Exclude devices with specified path patterns | `loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md` |
| `jiva.image`                            | Docker Image for Jiva                        | `quay.io/openebs/jiva`                             |
| `jiva.imageTag`                         | Docker Image Tag for Jiva                    | `0.9.0`                                            |
| `jiva.replicas`                         | Number of Jiva Replicas                      | `3`                                                |
| `cstor.pool.image`                      | Docker Image for cStor Pool                  | `quay.io/openebs/cstor-pool`                       |
| `cstor.pool.imageTag`                   | Docker Image Tag for cStor Pool              | `0.9.0`                                            |
| `cstor.poolMgmt.image`                  | Docker Image for cStor Pool Management       | `quay.io/openebs/cstor-pool-mgmt`                  |
| `cstor.poolMgmt.imageTag`               | Docker Image Tag for cStor Pool Management   | `0.9.0`                                            |
| `cstor.target.image`                    | Docker Image for cStor Target                | `quay.io/openebs/cstor-istgt`                      |
| `cstor.target.imageTag`                 | Docker Image Tag for cStor Target            | `0.9.0`                                            |
| `cstor.volumeMgmt.image`                | Docker Image for cStor Volume Management     | `quay.io/openebs/cstor-volume-mgmt`                |
| `cstor.volumeMgmt.imageTag`             | Docker Image Tag for cStor Volume Management | `0.9.0`                                            |
| `policies.monitoring.image`             | Docker Image for Prometheus Exporter         | `quay.io/openebs/m-exporter`                       |
| `policies.monitoring.imageTag`          | Docker Image Tag for Prometheus Exporter     | `0.9.0`                                            |
| `analytics.enabled`                     | Enable sending stats to Google Analytics     | `true`                                             |
| `analytics.pingInterval`                | Duration(hours) between sending ping stat    | `24h`                                              |
| `HealthCheck.initialDelaySeconds`       | Delay before liveness probe is initiated     | `30`                                               |
| `HealthCheck.periodSeconds`             | How often to perform the liveness probe      | `60`                                               |



<br>

<hr>

<br>



## Example configurations - kubectl



<h4><a class="anchor" aria-hidden="true" id="example-nodeselector-yaml"></a>For nodeSelectors in openebs-operator.yaml</h4>

First, label the required nodes with an appropriate label. In the following command, the required nodes for storage nodes are labelled as *node=openebs*.

```
kubectl label nodes <node-name> node=openebs
```

Next, in the downloaded openebs-operator.yaml, find the PodSpec for `openebs-provisioner`, `maya-apiserver`, `openebs-snapshot-operator` and `openebs-ndm` pods and add the following key-value pair under `nodeSelector` field

```
nodeSelector:
  node: openebs
```



<br>

<h4><a class="anchor" aria-hidden="true" id="example-diskfilter-yaml"></a>For disk filters in openebs-operator.yaml</h4>

In the downloaded o`penebs-operator.yaml`, find `openebs-ndm-config` configmap and update the values for keys `path-filter` and `vendor-filter`

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
  # filterconfigs contails configs of filters - in their form fo include
  # and exclude comma separated strings
  node-disk-manager.config: |
    probeconfigs:
      - key: udev-probe
        name: udev probe
        state: true
      - key: seachest-probe
        name: seachest probe
        state: true
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


<!-- Global site tag (gtag.js) - Google Analytics -->

<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
