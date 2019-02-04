---
id: installation
title: Installing OpenEBS
sidebar_label: Installation
---
------

<img src="/docs/assets/sm-install.png" alt="OpenEBS configuration flow" style="width:1000px">

## Before You Start

As an administrator,latest OpenEBS can be installed in your K8s cluster once you meet the prerequisites in your setup.

## Customize your OpenEBS operator YAML

You can download and customize the OpenEBS operator YAML file before the installation to include the desired disks and desired node details. The following will mention about how User can verify or include the desired disks attached to the Nodes and schedule the OpenEBS components into the desired Nodes. 

1. #### Selecting Nodes to Schedule OpenEBS components

   OpenEBS can be installed in selected nodes in your existing Kubernetes cluster using Node Selector method. OpenEBS does not have a separate scheduler to manage scheduling pods. It uses Kubernetes scheduler for managing the scheduling needs of an administrator.
   Latest OpenEBS operator YAML can be downloaded using the following way.

   ```
   wget https://openebs.github.io/charts/openebs-operator-0.8.1.yaml
   ```

   Using Node Selector method, OpenEBS components can be scheduled to the selected Nodes by adding node labels in the corresponding deployment mentioned in the OpenEBS operator YAML file.  You can go to the scheduler section for scheduling OpenEBS components in the downloaded OpenEBS operator YAML file.

2. #### Selecting/Verifying the disks for cStor Pool creation

   NDM is handling the disks attached to the OpenEBS nodes and by default NDM exclude following device path to avoid from creating cStor pools.

   ```
    "exclude":"loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-"
   ```


   The modification can be done by editing `openebs-operator.yaml` in `openebs-ndm-config` under `ConfigMap` in the file as follows.

   ```
   data:
     node-disk-manager.config: |
       filterconfigs:
         - key: path-filter
           name: path filter
           state: true
           include: ""
           exclude: "loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md"
   ```


## Start the Installation

On an existing Kubernetes cluster, as a cluster administrator, you can install latest version of OpenEBS in the following two ways.

1. Using Stable helm charts

2. Using OpenEBS operator through kubectl


### Install OpenEBS using Helm Charts

![Installing OpenEBS using helm ](/docs/assets/helm.png)

For installing OpenEBS using helm, you must setup Helm and setup RBAC for tiller. This can be done by running the following commands.

#### Setup Helm and RBAC

**Setup Helm**

You should have [configured helm](https://docs.helm.sh/using_helm/#from-script) on your Kubernetes cluster as a prerequisite.

**Setup RBAC for Tiller before Installing OpenEBS Chart**

```
kubectl -n kube-system create sa tiller
kubectl create clusterrolebinding tiller --clusterrole cluster-admin --serviceaccount=kube-system:tiller
kubectl -n kube-system patch deploy/tiller-deploy -p '{"spec": {"template": {"spec": {"serviceAccountName": "tiller"}}}}'
```

#### Install OpenEBS using Stable Helm Charts

You can install OpenEBS using helm charts using [Stable Helm Charts](/docs/next/installation.html#install-openebs-using-stable-helm-charts) which will use [Kubernetes stable helm charts](https://github.com/kubernetes/charts/tree/master/stable). Install OpenEBS using the following commands in the **openebs** namespace.

**Note:** Ensure that you have met the [prerequisites](/docs/next/prerequisites.html) before installation.

```
helm repo update
helm install --namespace openebs --name openebs stable/openebs
```

OpenEBS control plane pods are now created under “**openebs**” namespace . CAS Template,default Storage Pool, default Storage Classes and default SPCs are created after executing the above command. 

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
| `apiserver.imageTag`                    | Docker Image Tag for API Server              | `0.8.1`                                   |
| `apiserver.replicas`                    | Number of API Server Replicas                | `1`                                       |
| `provisioner.image`                     | Docker Image for Provisioner                 | `openebs/openebs-k8s-provisioner`         |
| `provisioner.imageTag`                  | Docker Image Tag for Provisioner             | `0.8.1`                                   |
| `provisioner.replicas`                  | Number of Provisioner Replicas               | `1`                                       |
| `snapshotOperator.provisioner.image`    | Docker Image for Snapshot Provisioner        | `openebs/snapshot-provisioner`            |
| `snapshotOperator.provisioner.imageTag` | Docker Image Tag for Snapshot Provisioner    | `0.8.1`                                   |
| `snapshotOperator.controller.image`     | Docker Image for Snapshot Controller         | `openebs/snapshot-controller`             |
| `snapshotOperator.controller.imageTag`  | Docker Image Tag for Snapshot Controller     | `0.8.1`                                   |
| `snapshotOperator.replicas`             | Number of Snapshot Operator Replicas         | `1`                                       |
| `ndm.image`                             | Docker Image for Node Disk Manager           | `openebs/openebs/node-disk-manager-amd64` |
| `ndm.imageTag`                          | Docker Image Tag for Node Disk Manager       | `v0.3.0`                                  |
| `ndm.sparse.enabled`                    | Create Sparse files and cStor Sparse Pool    | `true`                                    |
| `ndm.sparse.path`                       | Directory where Sparse files are created     | `/var/openebs/sparse`                     |
| `ndm.sparse.size`                       | Size of the sparse file in bytes             | `10737418240`                             |
| `ndm.sparse.count`                      | Number of sparse files to be created         | `1`                                       |
| `ndm.sparse.filters.excludeVendors`     | Exclude devices with specified vendor        | `CLOUDBYT,OpenEBS`                        |
| `ndm.sparse.filters.excludePaths`       | Exclude devices with specified path patterns | `loop,fd0,sr0,/dev/ram,/dev/dm-,/dev/md`  |
| `jiva.image`                            | Docker Image for Jiva                        | `openebs/jiva`                            |
| `jiva.imageTag`                         | Docker Image Tag for Jiva                    | `0.8.1`                                   |
| `jiva.replicas`                         | Number of Jiva Replicas                      | `3`                                       |
| `cstor.pool.image`                      | Docker Image for cStor Pool                  | `openebs/cstor-pool`                      |
| `cstor.pool.imageTag`                   | Docker Image Tag for cStor Pool              | `0.8.1`                                   |
| `cstor.poolMgmt.image`                  | Docker Image for cStor Pool Management       | `openebs/cstor-pool-mgmt`                 |
| `cstor.poolMgmt.imageTag`               | Docker Image Tag for cStor Pool Management   | `0.8.1`                                   |
| `cstor.target.image`                    | Docker Image for cStor Target                | `openebs/cstor-target`                    |
| `cstor.target.imageTag`                 | Docker Image Tag for cStor Target            | `0.8.1`                                   |
| `cstor.volumeMgmt.image`                | Docker Image for cStor Volume Management     | `openebs/cstor-volume-mgmt`               |
| `cstor.volumeMgmt.imageTag`             | Docker Image Tag for cStor Volume Management | `0.8.1`                                   |
| `policies.monitoring.image`             | Docker Image for Prometheus Exporter         | `openebs/m-exporter`                      |
| `policies.monitoring.imageTag`          | Docker Image Tag for Prometheus Exporter     | `0.8.1`                                   |

Specify each parameter using the `--set key=value` argument to `helm install`.

Alternatively, a YAML file that specifies the values for the parameters can be provided while installing the chart. For example,

```
helm install -f values.yaml --namespace openebs --name openebs stable/openebs
```

You can get default values.yaml from [here](https://github.com/helm/charts/blob/master/stable/openebs/values.yaml ).

### Install OpenEBS using kubectl

![Installing OpenEBS with Operator](/docs/assets/operator.png)

You can install OpenEBS cluster by running the following command.

**Note:** Ensure that you have met the [prerequisites](/docs/next/prerequisites.html) before installation.

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.1.yaml
```

OpenEBS control plane pods are created under “**openebs**” namespace. CAS Template,default Storage Pool , default Storage Classes  and default StoragePoolClaim are created after executing the above command.Now select your storage to provision OpenEBS volume from [here](/docs/next/installation.html#select-your-storage-engine).

## Verify OpenEBS is installed



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
