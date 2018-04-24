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



## Install OpenEBS using helm charts

------

![Installing OpenEBS using helm ](/docs/assets/helm.png)

You should have [configured helm](https://docs.helm.sh/using_helm/#quickstart-guide) on your Kubernetes cluster. OpenEBS charts are available from [Kubernetes stable helm charts](https://github.com/kubernetes/charts/tree/master/stable).  As a cluster admin, install the charts using the following command with a namespace of your choice.

```
helm install stable/openebs --name openebs --namespace openebs
```

The above command installs the required OpenEBS services except storage class templates. 

Install the storage class templates using the following command.

```
kubectl apply -f  https://github.com/openebs/openebs/blob/master/k8s/openebs-storageclasses.yaml
```

The above command deploys storage class templates.  As a next step, it is recommended to setup a catalog of storage classes for your application developers to use from. Learn more about setting up [OpenEBS storage classes here](/docs/next/setupstorageclasses.html).

Some sample YAML files for stateful workloads using OpenEBS are provided in the [openebs/k8s/demo](https://docs.openebs.io/docs/openebs/k8s/demo).

### Default values for helm chart parameters

The following table lists the configurable parameters of the OpenEBS chart and their default values.

| Parameter                          | Description                                  | Default                           |
| ---------------------------------- | -------------------------------------------- | --------------------------------- |
| `rbac.create`                      | Enable RBAC Resources                        | `true`                            |
| `image.pullPolicy`                 | Container pull policy                        | `IfNotPresent`                    |
| `apiserver.image`                  | Docker Image for API Server                  | `openebs/m-apiserver`             |
| `apiserver.imageTag`               | Docker Image Tag for API Server              | `0.5.3`                           |
| `apiserver.replicas`               | Number of API Server Replicas                | `2`                               |
| `apiserver.antiAffinity.enabled`   | Enable anti-affinity for API Server Replicas | `true`                            |
| `apiserver.antiAffinity.type`      | Anti-affinity type for API Server            | `Hard`                            |
| `provisioner.image`                | Docker Image for Provisioner                 | `openebs/openebs-k8s-provisioner` |
| `provisioner.imageTag`             | Docker Image Tag for Provisioner             | `0.5.3`                           |
| `provisioner.replicas`             | Number of Provisioner Replicas               | `2`                               |
| `provisioner.antiAffinity.enabled` | Enable anti-affinity for API Server Replicas | `true`                            |
| `provisioner.antiAffinity.type`    | Anti-affinity type for Provisioner           | `Hard`                            |
| `jiva.image`                       | Docker Image for Jiva                        | `openebs/jiva`                    |
| `jiva.imageTag`                    | Docker Image Tag for Jiva                    | `0.5.3`                           |
| `jiva.replicas`                    | Number of Jiva Replicas                      | `3`                               |

Specify each parameter using the `--set key=value` argument to `helm install`.

Alternatively, a YAML file (values.yaml) that specifies the values for parameters can be provided while installing the chart. You can customize it or go with default values. For example,

```
helm install -f values.yaml table/openebs --name openebs --namespace openebs
```



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
