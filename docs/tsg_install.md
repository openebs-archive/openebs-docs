---
id: tsg_install
title: Troubleshooting OpenEBS Installation
sidebar_label: Installation
---

------

This section contains steps to troubleshoot and resolve issues faced while installing.

The following issues are covered in this section.

[One of the 3 pods does not run while installing OpenEBS on a Kubernetes cluster in Azure](#PodNotRunningAzure)

[Installing OpenEBS on Azure fails](#RBACNotEnableAzure)

[Error while starting Minikube](#MinikubeStartError)

[Kubeminion error while setting up OpenEBS on Vagrant](#KubeminionError)



## Issue: 

## On Azure, stateful pods are not running when OpenEBS volumes are provisioned

## <a name="PodNotRunningAzure"></a>

### Troubleshooting the issue and Workaround:

On AKS, after provisioning the OpenEBS volume through the OpenEBS dynamic provisioner, the application pod is not coming up. It stays in `ContainerCreating` state

```
kubectl get pods
NAME                                                            READY     STATUS              RESTARTS   AGE
maya-apiserver-7b8f548dd8-67s6x                                 1/1       Running             0          36m
openebs-provisioner-7958c6d44f-g9qvr                            1/1       Running             0          36m
pgset-0                                                         0/1       ContainerCreating   0          32m
pvc-febcc15e-25d7-11e8-92c2-0a58ac1f1190-ctrl-7d7c98745-49qcm   2/2       Running             0          32m
pvc-febcc15e-25d7-11e8-92c2-0a58ac1f1190-rep-578b5bcc6b-5758m   1/1       Running             0          32m
pvc-febcc15e-25d7-11e8-92c2-0a58ac1f1190-rep-578b5bcc6b-zkhn8   1/1       Running             0          32m
```

The AKS cluster runs ubuntu 16.04 LTS with the kubelet running in a container (debian-jessie 8). The kubelet logs show the absence of the iSCSI initiator. Hence, the volume is not attached to the node. Configuring kubelet to run with iSCSI utils should fix this issue. For more information, see  https://github.com/openebs/openebs/issues/1335.

## Issue: 

## On Azure, OpenEBS installation fails

## <a name="RBACNotEnableAzure"></a>

### Workaround:

On AKS, while installing OpenEBS using Helm, if you get the following error, you must enable RBAC on Azure. For more details, see [Prerequisites](/docs/next/prerequisites.html).

```
$ helm installstable/openebs --name openebs --namespace openebs
Error: release openebsfailed: clusterroles.rbac.authorization.k8s.io "openebs" isforbidden: attempt to grant extra privileges:[PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["nodes"],APIGroups:["*"], Verbs:["list"]}PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["watch"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["get"]}PolicyRule{Resources:["nodes/proxy"], APIGroups:["*"],Verbs:["list"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["watch"]}PolicyRule{Resources:["namespaces"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["services"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["pods"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["deployments"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["events"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["endpoints"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["persistentvolumes"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["persistentvolumeclaims"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["storageclasses"],APIGroups:["storage.k8s.io"], Verbs:["*"]}PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["list"]} PolicyRule{NonResourceURLs:["/metrics"],Verbs:["get"]}] user=&{system:serviceaccount:kube-system:tiller6f3172cc-4a08-11e8-9af5-0a58ac1f1729 [system:serviceaccounts system:serviceaccounts:kube-systemsystem:authenticated] map[]} ownerrules=[]ruleResolutionErrors=[clusterroles.rbac.authorization.k8s.io"cluster-admin" not found]
```

## Issue: 

## Error while starting Minikube

The following error occurs while starting Minikube on Ubuntu 16.04.3 LTS

```
harsh@atlantis:~/.kube$ sudo -E minikube start --vm-driver=none
Starting local Kubernetes v1.7.5 cluster...
Starting VM...
E1011 01:01:01.315176   21844 start.go:146] Error starting host: Error getting state for host: machine does not exist.

 Retrying.
E1011 01:01:01.315654   21844 start.go:152] Error starting host:  Error getting state for host: machine does not exist
```

## <a name="MinikubeStartError"></a>

### Workaround:

Delete the Minikube VM using the following command and restart the VM with no flags. 

```minikube delete```


## Issue:
<a name="KubeminionError"></a>

## Kubeminion error while setting up OpenEBS on Vagrant version 1.8.2 or higher

The following error occurred.

```
==> kubeminion-01: Using Master IP  - 172.28.128.3
==> kubeminion-01: Using Token -  bdb573.063666e8dded3776
```

### Workaround:

All the vagrant files must have a minimum 2 GB memory allocated for master and a minimum 2 GB memory allocated for nodes. 




<!-- Hotjar Tracking Code for https://docs.openebs.io -->
<script>


```
   (function(h,o,t,j,a,r){
   		h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
   		h._hjSettings={hjid:785693,hjsv:6};
   		a=o.getElementsByTagName('head')[0];
   		r=o.createElement('script');r.async=1;
   		r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
   		a.appendChild(r);
   })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
```


</script>
