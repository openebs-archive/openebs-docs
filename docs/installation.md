---
id: installation
title: OpenEBS Installation
sidebar_label: Installation
---

------

Install
=========

It is very simple to install OpenEBS on your existing k8s cluster. OpenEBS installation can be done by 2 ways

1. kubectl  


2. Helm charts 



## Setup OpenEBS using kubectl

You can easily setup OpenEBS on your existing Kubernetes cluster with a few simple kubectl commands.

Download the latest OpenEBS Operator files using the following commands.



```
git clone <https://github.com/openebs/openebs.git>

cd openebs/k8s
```



Apply the  openebs-operator.yaml to deploy OpenEBS on your k8 cluster.



```
kubectl apply -f openebs-operator.yaml
```



 Once you apply the same, two Kubernetes Pods will be created along with *maya-apiserver*  and *openebs-provisioner* . *openebs-provisioner* will communicate with kubernetes controllers and  *maya-apiserver* will provision the OpenEBS volume.

```
name@MayaMaster:~$ kubectl get pods
NAME                                   READY     STATUS    RESTARTS   AGE
maya-apiserver-1633167387-v4sf1        1/1       Running   0          4h
openebs-provisioner-1174174075-n989p   1/1       Running   0          4h
```



Next comes OpenEBS storage classes. Add OpenEBS related storage classes in your cluster that can be used by developers and applications using the following command.



```
kubectl apply -f openebs-storageclasses.yaml
```



There is some common workload related storage classes are installed by default on your kubernetes cluster once OpenEBS is installed. You can customize or use the default storage classes to run your application of OpenEBS volume. To know the installed default storage class details, use following command.



```
kubectl get sc
```



So, you are in the last steps of running stateful applications with OpenES storage volume.

Use corresponding storage class name in your PVC yaml file to set run the stateful workload on OpenEBS volume.

Some sample YAML files for stateful workloads using OpenEBS are provided in the [openebs/k8s/demo](https://docs.openebs.io/docs/openebs/k8s/demo)

**Configurations**

 The following are some of the parameters of the OpenEBS volume and their default values.  

```
Namespace= default

OPENEBS_IO_JIVA_REPLICA_COUNT=3

Image: 0.5.3

Capacity: 5G
```

 

## Setup OpenEBS using helm charts

With simple and easy steps, you can install OpenEBS on your existing k8s cluster using helm chart

Download and Install the latest OpenEBS Operator files using the following commands.

```
helm repo add openebs-charts https://openebs.github.io/charts/
helm repo update
helm install openebs-charts/openebs --name openebs --namespace openebs
```


Upgrade
=========


Location of Binaries
======================












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
