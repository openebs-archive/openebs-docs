---
id: tsg_install
title: Troubleshooting OpenEBS Installation
sidebar_label: Installation
---

------

## On Azure, stateful pods are not running when OpenEBS volumes are provisioned

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

The AKS cluster runs ubuntu 16.04 LTS with the kubelet running in a container (debian-jessie 8). The kubelet logs show the absence of the iSCSI initiator. Hence, the volume is not attached to the node. Configuring kubelet to run with iSCSI utils should fix this issue.

These steps are provided in the pre-requisite section, see [here](/docs/next/prerequisites.html#azure-cloud)

For more information, see [this](https://github.com/openebs/openebs/issues/1335).

## On Azure, OpenEBS installation fails

On AKS, while installing OpenEBS using Helm, if you get the following error, you must enable RBAC on Azure. For more details, see [Prerequisites](/docs/next/prerequisites.html).

```
$ helm installstable/openebs --name openebs --namespace openebs
Error: release openebsfailed: clusterroles.rbac.authorization.k8s.io "openebs" isforbidden: attempt to grant extra privileges:[PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["nodes"],APIGroups:["*"], Verbs:["list"]}PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["watch"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["get"]}PolicyRule{Resources:["nodes/proxy"], APIGroups:["*"],Verbs:["list"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["watch"]}PolicyRule{Resources:["namespaces"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["services"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["pods"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["deployments"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["events"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["endpoints"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["persistentvolumes"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["persistentvolumeclaims"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["storageclasses"],APIGroups:["storage.k8s.io"], Verbs:["*"]}PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["list"]} PolicyRule{NonResourceURLs:["/metrics"],Verbs:["get"]}] user=&{system:serviceaccount:kube-system:tiller6f3172cc-4a08-11e8-9af5-0a58ac1f1729 [system:serviceaccounts system:serviceaccounts:kube-systemsystem:authenticated] map[]} ownerrules=[]ruleResolutionErrors=[clusterroles.rbac.authorization.k8s.io"cluster-admin" not found]
```

## On Rancher, application pods are not running when OpenEBS volumes are provisioned

The setup environment where the issue occurs is rancher/rke with bare metal hosts running CentOS. After installing OpenEBS, OpenEBS pods are running, but application pod is in *ContainerCreating* state. The output of `kubectl get pods` is displayed as follows.

```
NAME                                                             READY     STATUS              RESTARTS   AGE
nginx-deployment-57849d9f57-gvzkh                                0/1       ContainerCreating   0          2m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-ctrl-58dcdf997f-n4kd9   2/2       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-gq4z6    1/1       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-hwx52    1/1       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-vs97n    1/1       Running             0          8m
```

iSCSI package is installed on both Host and rke kubelet.

```
[root@node-34622 ~]# iscsiadm -V
iscsiadm version 6.2.0.874-7
[root@node-34622 ~]# docker exec kubelet iscsiadm -V
iscsiadm version 2.0-874
```

To resolve this issue, do not install `open-iscsi / iscsi-initiator-utils` on the host nodes when using the Rancher Container Engine (RKE).

## How can I select disks for creating a storage pool using cStor?

With the latest OpenEBS 7.0 release, the following disk types/paths are excluded by NDM which identifies the disks to create cStor pools on nodes.
```
loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-
```
You can also customize by adding more disk types associated with your nodes. For example, used disks, unwanted disks and so on. This must be done in the 'openebs-operator-0.7.0.yaml' file that you downloaded before installation. Add the device path in `openebs-ndm-config` under ConfigMap in the `openebs-operator.yaml` file as follows.
```
"exclude":"loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-"
```
Example:
```
 {
          "key": "path-filter",
          "name": "path filter",
          "state": "true",
          "include":"",
          "exclude":"loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-"
        }

## Why does OpenEBS provisioner pod restart continuously?

The following output displays the pod status of all namespaces in which the OpenEBS provisioner is restarting continuously.

```
NAMESPACE     NAME                                         READY     STATUS             RESTARTS   AGE       IP                NODE
default       percona                                      0/1       Pending            0          36m       <none>            <none>
kube-system   calico-etcd-tl4td                            1/1       Running            0          1h        192.168.56.65     master
kube-system   calico-kube-controllers-84fd4db7cd-jz9wt     1/1       Running            0          1h        192.168.56.65     master
kube-system   calico-node-5rqdl                            2/2       Running            0          1h        192.168.56.65     master
kube-system   calico-node-zt95x                            2/2       Running            0          1h        192.168.56.66     node
kube-system   coredns-78fcdf6894-2plxb                     1/1       Running            0          1h        192.168.219.65    master
kube-system   coredns-78fcdf6894-gcjj7                     1/1       Running            0          1h        192.168.219.66    master
kube-system   etcd-master                                  1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-apiserver-master                        1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-controller-manager-master               1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-proxy-9t98s                             1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-proxy-mwk9f                             1/1       Running            0          1h        192.168.56.66     node
kube-system   kube-scheduler-master                        1/1       Running            0          1h        192.168.56.65     master
openebs       maya-apiserver-5598cf68ff-tndgm              1/1       Running            0          1h        192.168.167.131   node
openebs       openebs-provisioner-776846bbff-rqfzr         0/1       CrashLoopBackOff   16         1h        192.168.167.129   node
openebs       openebs-snapshot-operator-5b5f97dd7f-np79k   0/2       CrashLoopBackOff   32         1h        192.168.167.130   node
```

###Troubleshooting
Perform the following steps to verify if the issue is due to a misconfiguration while installing the network component.

  1. Check if your network related pods are running fine. 
  2. Check if OpenEBS provisioner HTTPS requests are reaching the apiserver
  3. Use the latest version of network provider images.
  4. Try other network components such as Calico, kube-router etc. if you are not using any of these.
  
=======

## How to Uninstall OpenEBS Version 0.7?

The recommended steps to uninstall are as follows:
 - Delete all the OpenEBS PVCs that were created.
 - Delete all the SPCs (in case of cStor).
 - Ensure that no volume or pool pods are pending in terminating state by using `kubectl get pods -n <openebs namespace>` command.
 - Delete OpenEBS using the `helm purge or kubectl delete` command.

Uninstalling OpenEBS does not automatically delete the CRDs that were created. If you would like to completely remove the CRDs and the associated objects, run the following commands:

```
kubectl delete crd castemplates.openebs.io
kubectl delete crd cstorpools.openebs.io
kubectl delete crd cstorvolumereplicas.openebs.io
kubectl delete crd cstorvolumes.openebs.io
kubectl delete crd runtasks.openebs.io
kubectl delete crd storagepoolclaims.openebs.io
kubectl delete crd storagepools.openebs.io
kubectl delete crd volumesnapshotdatas.volumesnapshot.external-storage.k8s.io
kubectl delete crd volumesnapshots.volumesnapshot.external-storage.k8s.io
```
 


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
