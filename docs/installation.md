---
id: installation
title: Installing OpenEBS
sidebar_label: Installation
---

---

OpenEBS is tested on various platforms. Refer to the platform versions and associated special instructions [here].(/docs/next/supportedplatforms.html)

On an existing Kubernetes cluster, as a cluster administrator, you can install latest version of  OpenEBS in the following two ways.

1. Using Stable [helm charts](/docs/next/installation.html#install-openebs-using-helm-charts)
2. Using OpenEBS operator through [kubectl](/docs/next/installation.html#install-openebs-using-kubectl)

The latest OpenEBS version 0.8.0 installation steps for both methods are explained below.

<a name="helm"></a>

## Install OpenEBS using Helm Charts

![Installing OpenEBS using helm ](/docs/assets/helm.png)

### Setup Helm and RBAC

**Setup Helm**

You should have [configured helm](https://docs.helm.sh/using_helm/#from-script) on your Kubernetes cluster as a prerequisite.

**Setup RBAC for Tiller before Installing OpenEBS Chart**

```
kubectl -n kube-system create sa tiller
kubectl create clusterrolebinding tiller --clusterrole cluster-admin --serviceaccount=kube-system:tiller
kubectl -n kube-system patch deploy/tiller-deploy -p '{"spec": {"template": {"spec": {"serviceAccountName": "tiller"}}}}'
```

### Install OpenEBS using Stable Helm Charts

You can install OpenEBS using helm charts using [Stable Helm Charts](/docs/next/installation.html#install-openebs-using-stable-helm-charts) which will use [Kubernetes stable helm charts](https://github.com/kubernetes/charts/tree/master/stable). Install OpenEBS using the following commands in the **openebs** namespace.

**Note:** Ensure that you have met the [prerequisites](/docs/next/prerequisites.html) before installation.

```
helm repo update
helm install --namespace openebs --name openebs stable/openebs
```

OpenEBS control plane pods are now created. CAS Template,default Storage Pool,and default Storage Classes are created after executing the above command. Now,select the storage engine to provision OpenEBS volume from [here](/docs/next/installation.html#select-your-storage-engine).

You can also install OpenEBS in custom namespace using the following way.

```
helm repo update
helm install --namespace <custom_namespace> --name openebs stable/openebs
```

Once you install OpenEBS in custom namespace, all the OpenEBS components will be deployed under the same namespace.

### Default Values for Helm Chart Parameters

The following table lists the configurable parameters of the OpenEBS chart and their default values.

| Parameter                               | Description                                  | Default                                   |
| --------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| `rbac.create`                           | Enable RBAC Resources                        | `true`                                    |
| `image.pullPolicy`                      | Container pull policy                        | `IfNotPresent`                            |
| `apiserver.image`                       | Docker Image for API Server                  | `openebs/m-apiserver`                     |
| `apiserver.imageTag`                    | Docker Image Tag for API Server              | `0.8.0`                                   |
| `apiserver.replicas`                    | Number of API Server Replicas                | `1`                                       |
| `provisioner.image`                     | Docker Image for Provisioner                 | `openebs/openebs-k8s-provisioner`         |
| `provisioner.imageTag`                  | Docker Image Tag for Provisioner             | `0.8.0`                                   |
| `provisioner.replicas`                  | Number of Provisioner Replicas               | `1`                                       |
| `snapshotOperator.provisioner.image`    | Docker Image for Snapshot Provisioner        | `openebs/snapshot-provisioner`            |
| `snapshotOperator.provisioner.imageTag` | Docker Image Tag for Snapshot Provisioner    | `0.8.0`                                   |
| `snapshotOperator.controller.image`     | Docker Image for Snapshot Controller         | `openebs/snapshot-controller`             |
| `snapshotOperator.controller.imageTag`  | Docker Image Tag for Snapshot Controller     | `0.8.0`                                   |
| `snapshotOperator.replicas`             | Number of Snapshot Operator Replicas         | `1`                                       |
| `ndm.image`                             | Docker Image for Node Disk Manager           | `openebs/openebs/node-disk-manager-amd64` |
| `ndm.imageTag`                          | Docker Image Tag for Node Disk Manager       | `v0.2.0`                                  |
| `ndm.sparse.enabled`                    | Create Sparse files and cStor Sparse Pool    | `true`                                    |
| `ndm.sparse.path`                       | Directory where Sparse files are created     | `/var/openebs/sparse`                     |
| `ndm.sparse.size`                       | Size of the sparse file in bytes             | `10737418240`                             |
| `ndm.sparse.count`                      | Number of sparse files to be created         | `1`                                       |
| `ndm.sparse.filters.excludeVendors`     | Exclude devices with specified vendor        | `CLOUDBYT,OpenEBS`                        |
| `ndm.sparse.filters.excludePaths`       | Exclude devices with specified path patterns | `loop,fd0,sr0,/dev/ram,/dev/dm-`          |
| `jiva.image`                            | Docker Image for Jiva                        | `openebs/jiva`                            |
| `jiva.imageTag`                         | Docker Image Tag for Jiva                    | `0.8.0`                                   |
| `jiva.replicas`                         | Number of Jiva Replicas                      | `3`                                       |
| `cstor.pool.image`                      | Docker Image for cStor Pool                  | `openebs/cstor-pool`                      |
| `cstor.pool.imageTag`                   | Docker Image Tag for cStor Pool              | `0.8.0`                                   |
| `cstor.poolMgmt.image`                  | Docker Image for cStor Pool Management       | `openebs/cstor-pool-mgmt`                 |
| `cstor.poolMgmt.imageTag`               | Docker Image Tag for cStor Pool Management   | `0.8.0`                                   |
| `cstor.target.image`                    | Docker Image for cStor Target                | `openebs/cstor-target`                    |
| `cstor.target.imageTag`                 | Docker Image Tag for cStor Target            | `0.8.0`                                   |
| `cstor.volumeMgmt.image`                | Docker Image for cStor Volume Management     | `openebs/cstor-volume-mgmt`               |
| `cstor.volumeMgmt.imageTag`             | Docker Image Tag for cStor Volume Management | `0.8.0`                                   |
| `policies.monitoring.image`             | Docker Image for Prometheus Exporter         | `openebs/m-exporter`                      |
| `policies.monitoring.imageTag`          | Docker Image Tag for Prometheus Exporter     | `0.8.0`                                   |

Specify each parameter using the `--set key=value` argument to `helm install`.

Alternatively, a YAML file that specifies the values for the parameters can be provided while installing the chart. For example,

```
helm install -f values.yaml --namespace openebs --name openebs stable/openebs
```

You can get default values.yaml from [here](https://github.com/helm/charts/blob/master/stable/openebs/values.yaml ).

## Install OpenEBS using kubectl

![Installing OpenEBS with Operator](/docs/assets/operator.png)

You can install OpenEBS cluster by running the following command.

**Note:** Ensure that you have met the [prerequisites](/docs/next/prerequisites.html) before installation.

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
```

OpenEBS control plane pods are created under “**openebs**” namespace. CAS Template,default Storage Pool and default Storage Classes are created after executing the above command.Now select your storage to provision OpenEBS volume from [here](/docs/next/installation.html#select-your-storage-engine).

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

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
