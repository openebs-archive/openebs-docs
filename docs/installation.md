---
id: installation
title: Installing OpenEBS
sidebar_label: Installation
---

---

OpenEBS is tested on various platforms. Refer to the platform versions and associated special instructions [here](/docs/next/supportedplatforms.html)

On an existing Kubernetes cluster, as a cluster administrator, you can install OpenEBS in the following two ways.

1. Using (stable/OpenEBS) [helm charts](/docs/next/installation.html#install-openebs-using-helm-charts)
2. Using OpenEBS operator through [kubectl](/docs/next/installation.html#install-openebs-using-kubectl)

**Note:** Currently OpenEBS version 0.7 is supported only via the [OpenEBS operator/kubectl](/docs/next/installation.html#install-openebs-using-kubectl) and [OpenEBS helm Charts](/docs/next/installation.html#install-openebs-using-openebs-helm-charts) .The steps for both methods are explained below.

<a name="helm"></a>

## Install OpenEBS using Helm Charts

![Installing OpenEBS using helm ](/docs/assets/helm.png)

You can install OpenEBS using helm charts in two ways.

1. Using [Stable Helm Charts](/docs/next/installation.html#install-openebs-using-stable-helm-charts)

   This will help to install OpenEBS using [Kubernetes stable helm charts](https://github.com/kubernetes/charts/tree/master/stable).

2. Using [OpenEBS Helm Charts](/docs/next/installation.html#install-openebs-using-openebs-helm-charts)

   This will help to install OpenEBS using OpenEBS helm charts.

### Setup Helm & RBAC

**Setup Helm**

You should have [configured helm](https://docs.helm.sh/using_helm/#from-script) on your Kubernetes cluster as a prerequisite.

**Setup RBAC for Tiller before Installing OpenEBS Chart**

```
kubectl -n kube-system create sa tiller
kubectl create clusterrolebinding tiller --clusterrole cluster-admin --serviceaccount=kube-system:tiller
kubectl -n kube-system patch deploy/tiller-deploy -p '{"spec": {"template": {"spec": {"serviceAccountName": "tiller"}}}}'
```

### Install OpenEBS using OpenEBS Helm Charts

You have now set up Helm and RBAC by following above [step](/docs/next/installation.html#setup-helm-rbac). Next, you should clone the latest OpenEBS repository. If you have cloned OpenEBS repository already, verify that it is updated.

The latest OpenEBS repo can be cloned and the latest version can be packaged using following commands.

```
git clone https://github.com/openebs/openebs.git
helm package openebs/k8s/charts/openebs
```

This will create a _.tgz_ file. This file will be used in the following execution. Update new OpenEBS chart using following commands.

```
git clone https://github.com/openebs/charts.git
cd charts
mv ../openebs-*.tgz ./docs
helm repo index docs --url https://openebs.github.io/charts
```

Add OpenEBS charts and update it using following commands.

```
helm repo add openebs-charts https://openebs.github.io/charts/
helm repo update
```

Now you are ready to install OpenEBS using helm using the following command. OpenEBS will install in "**default**" namespace.

```
helm install openebs-charts/openebs
```

OpenEBS control plane pods are now created. CAS Template, default Storage Pool and default Storage Classes are created after executing the above command. Now select your storage engine to provision OpenEBS volume from [here](/docs/next/installation.html#select-your-storage-engine).

### Install OpenEBS using Stable Helm Charts

Install OpenEBS using the following commands into **openebs** namespace.

```
helm install  --namespace openebs --name openebs  -f https://openebs.github.io/charts/helm-values-0.6.0.yaml stable/openebs
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-storageclasses.yaml
```

### Default Values for Helm Chart Parameters

The following table lists the configurable parameters of the OpenEBS chart and their default values.

| Parameter                               | Description                                  | Default                                   |
| --------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| `rbac.create`                           | Enable RBAC Resources                        | `true`                                    |
| `image.pullPolicy`                      | Container pull policy                        | `IfNotPresent`                            |
| `apiserver.image`                       | Docker Image for API Server                  | `openebs/m-apiserver`                     |
| `apiserver.imageTag`                    | Docker Image Tag for API Server              | `0.7.0`                                   |
| `apiserver.replicas`                    | Number of API Server Replicas                | `1`                                       |
| `provisioner.image`                     | Docker Image for Provisioner                 | `openebs/openebs-k8s-provisioner`         |
| `provisioner.imageTag`                  | Docker Image Tag for Provisioner             | `0.7.0`                                   |
| `provisioner.replicas`                  | Number of Provisioner Replicas               | `1`                                       |
| `snapshotOperator.provisioner.image`    | Docker Image for Snapshot Provisioner        | `openebs/snapshot-provisioner`            |
| `snapshotOperator.provisioner.imageTag` | Docker Image Tag for Snapshot Provisioner    | `0.7.0`                                   |
| `snapshotOperator.controller.image`     | Docker Image for Snapshot Controller         | `openebs/snapshot-controller`             |
| `snapshotOperator.controller.imageTag`  | Docker Image Tag for Snapshot Controller     | `0.7.0`                                   |
| `snapshotOperator.replicas`             | Number of Snapshot Operator Replicas         | `1`                                       |
| `ndm.image`                             | Docker Image for Node Disk Manager           | `openebs/openebs/node-disk-manager-amd64` |
| `ndm.imageTag`                          | Docker Image Tag for Node Disk Manager       | `v0.1.0`                                  |
| `ndm.sparse.enabled`                    | Create Sparse files and cStor Sparse Pool    | `true`                                    |
| `ndm.sparse.path`                       | Directory where Sparse files are created     | `/var/openebs/sparse`                     |
| `ndm.sparse.size`                       | Size of the sparse file in bytes             | `10737418240`                             |
| `ndm.sparse.count`                      | Number of sparse files to be created         | `1`                                       |
| `ndm.sparse.filters.excludeVendors`     | Exclude devices with specified vendor        | `CLOUDBYT,OpenEBS`                        |
| `ndm.sparse.filters.excludePaths`       | Exclude devices with specified path patterns | `loop,fd0,sr0,/dev/ram,/dev/dm-`          |
| `jiva.image`                            | Docker Image for Jiva                        | `openebs/jiva`                            |
| `jiva.imageTag`                         | Docker Image Tag for Jiva                    | `0.7.0`                                   |
| `jiva.replicas`                         | Number of Jiva Replicas                      | `3`                                       |
| `cstor.pool.image`                      | Docker Image for cStor Pool                  | `openebs/cstor-pool`                      |
| `cstor.pool.imageTag`                   | Docker Image Tag for cStor Pool              | `0.7.0`                                   |
| `cstor.poolMgmt.image`                  | Docker Image for cStor Pool Management       | `openebs/cstor-pool-mgmt`                 |
| `cstor.poolMgmt.imageTag`               | Docker Image Tag for cStor Pool Management   | `0.7.0`                                   |
| `cstor.target.image`                    | Docker Image for cStor Target                | `openebs/cstor-target`                    |
| `cstor.target.imageTag`                 | Docker Image Tag for cStor Target            | `0.7.0`                                   |
| `cstor.volumeMgmt.image`                | Docker Image for cStor Volume Management     | `openebs/cstor-volume-mgmt`               |
| `cstor.volumeMgmt.imageTag`             | Docker Image Tag for cStor Volume Management | `0.7.0`                                   |
| `policies.monitoring.image`             | Docker Image for Prometheus Exporter         | `openebs/m-exporter`                      |
| `policies.monitoring.imageTag`          | Docker Image Tag for Prometheus Exporter     | `0.7.0`                                   |

Specify each parameter using the `--set key=value` argument to `helm install`.

Alternatively, a YAML file that specifies the values for the parameters can be provided while installing the chart. For example,

```
helm install --name openebs -f values.yaml openebs-charts/openebs
```

You can get default values.yaml from [here](https://github.com/openebs/openebs/blob/master/k8s/charts/openebs/values.yaml).

## Install OpenEBS using kubectl

![Installing OpenEBS with Operator](/docs/assets/operator.png)

You can install OpenEBS cluster by running the following command.

**Note:** Ensure that you have met the [prerequisites](/docs/next/prerequisites.html) before installation.

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.7.0.yaml
```

OpenEBS control plane pods are created under “**openebs**” namespace. CAS Template, default Storage Pool and default Storage Classes are created after executing the above command. Now select your storage to provision OpenEBS volume from [here](/docs/next/installation.html#select-your-storage-engine).

## Select Your Storage Engine

You can now choose the storage engine to provision Jiva or cStor volumes. For more information about OpenEBS storage engines, see [Jiva](/docs/next/storageengine.html#jiva) and [cStor](/docs/next/storageengine.html#cstor).

As a **cluster admin**, you can provision jiva or cStor based on your requirements. For more information about provisioning them, see [provisioning jiva](/docs/next/deployjiva.html) and [provisioning cStor](/docs/next/deploycstor.html).

Once you complete provisioning the volumes, you can run the stateful application workloads. Some sample YAML files for stateful workloads using OpenEBS are provided in the [openebs/k8s/demo](https://github.com/openebs/openebs/tree/master/k8s/demo).

### See Also:

#### [Setting up OpenEBS storage classes](/docs/next/setupstorageclasses.html)

#### [OpenEBS architecture](/docs/next/architecture.html)

#### [Overview of CAS](/docs/next/conceptscas.html)

#### [Upgrading OpenEBS](/docs/next/upgrade.html)

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
