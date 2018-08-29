---
id: installation
title: Installing OpenEBS
sidebar_label: Installation
---

------

1. OpenEBS is tested on various platforms. Refer to the platform versions and associated special instructions [here](/docs/next/supportedplatforms.html)

   On an existing Kubernetes cluster, as a cluster administrator, you can install OpenEBS in the following two ways.

   1. Using (stable/OpenEBS) helm charts
   2. Using OpenEBS operator through kubectl  

<a name="helm"></a>

## Setup Helm

![Installing OpenEBS using helm ](/docs/assets/helm.png)

You should have [configured helm](https://docs.helm.sh/using_helm/#quickstart-guide) on your Kubernetes cluster. OpenEBS charts are available from [Kubernetes stable helm charts](https://github.com/kubernetes/charts/tree/master/stable).  

**Setup RBAC for Tiller before Installing OpenEBS Chart**

```
kubectl -n kube-system create sa tiller
kubectl create clusterrolebinding tiller --clusterrole cluster-admin --serviceaccount=kube-system:tiller
kubectl -n kube-system patch deploy/tiller-deploy -p '{"spec": {"template": {"spec": {"serviceAccountName": "tiller"}}}}'
```

## Install OpenEBS using Stable Helm Charts

Install OpenEBS  using the following commands into openebs namespace

```
helm install  --namespace openebs --name openebs  -f https://openebs.github.io/charts/helm-values-0.6.0.yaml stable/openebs
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-storageclasses.yaml
```

## Using OpenEBS Helm Charts

`(Will be deprecated in the coming releases)`

```
helm repo add openebs-charts https://openebs.github.io/charts/
helm repo update
helm install openebs-charts/openebs
```

## Default Values for Helm Chart Parameters

The following table lists the configurable parameters of the OpenEBS chart and their default values.

| Parameter               | Description                                  | Default                           |
| ----------------------- | -------------------------------------------- | --------------------------------- |
| `rbac.create`           | Enable RBAC Resources                        | `true`                            |
| `serviceAccount.create` | Specify if Service Account should be created | `true`                            |
| `serviceAccount.name`   | Specify the name of service account          | `openebs-maya-operator`           |
| `image.pullPolicy`      | Container pull policy                        | `IfNotPresent`                    |
| `apiserver.image`       | Docker Image for API Server                  | `openebs/m-apiserver`             |
| `apiserver.imageTag`    | Docker Image Tag for API Server              | `0.6`                             |
| `apiserver.replicas`    | Number of API Server Replicas                | `1`                               |
| `provisioner.image`     | Docker Image for Provisioner                 | `openebs/openebs-k8s-provisioner` |
| `provisioner.imageTag`  | Docker Image Tag for Provisioner             | `0.6`                             |
| `provisioner.replicas`  | Number of Provisioner Replicas               | `1`                               |
| `jiva.image`            | Docker Image for Jiva                        | `openebs/jiva`                    |
| `jiva.imageTag`         | Docker Image Tag for Jiva                    | `0.6`                             |
| `jiva.replicas`         | Number of Jiva Replicas                      | `3`                               |

Specify each parameter using the `--set key=value` argument to `helm install`.

## Install OpenEBS using kubectl

------

![Installing OpenEBS with Operator](/docs/assets/operator.png)

Set the context to **cluster-admin** and then execute all commands using kubectl.

As a cluster admin, you can deploy jiva or cStor based on your requirements. For more information about deploying them, see [deploying jiva](/docs/next/deployjiva.html) and [deploying cStor](/docs/next/deploycstor.html).

Some sample YAML files for stateful workloads using OpenEBS are provided in the [openebs/k8s/demo](https://docs.openebs.io/docs/openebs/k8s/demo).

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
