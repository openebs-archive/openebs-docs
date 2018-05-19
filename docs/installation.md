---
id: installation
title: OpenEBS Installation
sidebar_label: Installation
---

------

OpenEBS is tested on various platforms. Refer to the platform versions and associated special instructions [here](/docs/next/supportedplatforms.html)



On an existing Kubernetes cluster, as a cluster administrator, you can install OpenEBS in the following two ways.

1. Using helm charts

2. Using OpenEBS operator through kubectl  

   ​


<a name="helm"></a>



## Helm based OpenEBS Installation

------

![Installing OpenEBS using helm ](/docs/assets/helm.png)

You should have [configured helm](https://docs.helm.sh/using_helm/#quickstart-guide) on your Kubernetes cluster. 

## Prerequisites
- Kubernetes 1.7.5+ with RBAC enabled
- iSCSI PV support in the underlying infrastructure

## Installing OpenEBS 
```
helm install stable/openebs
```

## Installing OpenEBS with the release name `my-release`:
```
helm install --name `my-release` stable/openebs
```

## To uninstall/delete the `my-release` deployment:
```
helm ls --all
helm delete `my-release`
```

## Configuration

The following tables lists the configurable parameters of the OpenEBS chart and their default values.

| Parameter                            | Description                                   | Default                           |
| ------------------------------------ | --------------------------------------------- | --------------------------------- |
| `rbac.create`                        | Enable RBAC Resources                         | `true`                            |
| `serviceAccount.create`              | Specify if Service Account should be created  | `true`                            |
| `serviceAccount.name`                | Specify the name of service account           | `openebs-maya-operator`           |
| `image.pullPolicy`                   | Container pull policy                         | `IfNotPresent`                    |
| `apiserver.image`                    | Docker Image for API Server                   | `openebs/m-apiserver`             |
| `apiserver.imageTag`                 | Docker Image Tag for API Server               | `0.5.3`                           |
| `apiserver.replicas`                 | Number of API Server Replicas                 | `1`                               |
| `provisioner.image`                  | Docker Image for Provisioner                  | `openebs/openebs-k8s-provisioner` |
| `provisioner.imageTag`               | Docker Image Tag for Provisioner              | `0.5.3`                           |
| `provisioner.replicas`               | Number of Provisioner Replicas                | `1`                               |
| `jiva.image`                         | Docker Image for Jiva                         | `openebs/jiva`                    |
| `jiva.imageTag`                      | Docker Image Tag for Jiva                     | `0.5.3`                           |
| `jiva.replicas`                      | Number of Jiva Replicas                       | `3`                               |

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`.

Alternatively, a YAML file that specifies the values for the parameters can be provided while installing the chart. For example,

```shell
helm install --name `my-release` -f values.yaml stable/openebs
```

> **Tip**: You can use the default [values.yaml](values.yaml)

## Install OpenEBS using kubectl

------

![Installing OpenEBS with Operator](/docs/assets/operator.png)

OpenEBS operator yaml file is available at https://openebs.github.io/charts/openebs-operator.yaml. 



Set the context to **cluster-admin** and apply the above operator.



```
kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
```



This operator installs the control plane components such as maya-apiserver, openebs-provisioner, and also deploys the required storage class templates.

```
name@MayaMaster:~$ kubectl get pods
NAME                                   READY     STATUS    RESTARTS   AGE
maya-apiserver-1633167387-v4sf1        1/1       Running   0          4h
openebs-provisioner-1174174075-n989p   1/1       Running   0          4h
```

You can see the newly deployed storage classes using the following command

```
kubectl get sc
```

As a next step, it is recommended to setup a catalog of storage classes for your application developers to use from. Learn more about setting up [OpenEBS storage classes here](/docs/next/setupstorageclasses.html).

Some sample YAML files for stateful workloads using OpenEBS are provided in the [openebs/k8s/demo](https://docs.openebs.io/docs/openebs/k8s/demo).

### See Also:

[Setting up OpenEBS storage classes](/docs/next/setupstorageclasses.html)

[OpenEBS architecture](/docs/next/architecture.html)

[Overview of CAS](/docs/next/conceptscas.html)

[Upgrading OpenEBS](/docs/next/upgrade.html)

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
