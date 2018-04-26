
---
id: tsginstallation
title: OpenEBS troubleshooting - Installation
sidebar_label: Installation
---

------

This section contains steps to troubleshoot and resolve issues faced while installing.

The following issue is covered in this section.

[One of the 3 pods does not run while installing OpenEBS on a Kubernetes cluster in Azure #1335](#PodNotRunningAzure)

**Issue:**
##  One of the pods is not running <a name="PodNotRunningAzure"></a>

**Troubleshooting the issue and Workaround:**

After creating a three node Kubernetes cluster in AZURE of Standard_A0 type and using OpenEBS operator, storageclass yaml, and the azure yaml files to create the storage class and Statefulset, one of the pod is not running as seen below

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
