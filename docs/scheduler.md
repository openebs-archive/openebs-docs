---
id: scheduler
title: Scheduling OpenEBS Control Plane and Data Plane Pods
sidebar_label: Scheduler
---

------

OpenEBS does not have a separate scheduler to manage scheduling pods. It uses Kubernetes scheduler for managing the scheduling needs of an administrator. 

OpenEBS deals with many types of Kubernetes pods in its life cycle. These can be broadly categorized into two types.

- **Control plane pods**
  - OpenEBS API Server
  - OpenEBS Provisioner
  - OpenEBS Snapshot Operator
- **Data plane pods**
  - OpenEBS Node Disk Manager
  - Jiva data plane 
    - Jiva storage target pod
    - Jiva storage replica pods
  - cStor data plane
    - cStor storage target pod
    - cStor storage replica pods

Control plane pods and one data plane pod are scheduled while installing OpenEBS and other Data plane pods are scheduled during volume provisioning. 

# Before OpenEBS Installation

The OpenEBS administrator can choose to provide the scheduling configuration for control plane and data plane pods during installation. The following procedure allows you to modify the configuration. 

## Step 1

Download the *openebs-operator* file using the following command.

```
wget https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
```

## Step 2

Modify the configuration for scheduling control plane pods such as OpenEBS API Server, OpenEBS Provisioner,OpenEBS Snapshot Operator and data plane pod such as OpenEBS Node Disk Manager in the *openebs-operator.yaml* file. You can use NODE_SELECTOR method as follows:

### NODE_SELECTOR method (preferred) ([Why?](/docs/next/scheduler.html#selecting-between-node-selector-method-taint-method))

#### Scheduling control plane pods using NODE_SELECTOR

**Label the required Nodes**

Label the required nodes with an appropriate label. In the following command, the required nodes for storage nodes are labelled as *node=openebs*.

```
kubectl label nodes <node-name> node=openebs
```
For application nodes labelled as *node=appnode* use the following command.
```
kubectl label nodes <node-name> node=appnode
```
**Modify the configuration control pods** 

You can modify the configuration for control plane pods and data plane pod like NDM as follows in the *openebs-operator.yaml* file. 

For **openebs-provisioner**, under *spec:* section you can add as follows:

```
nodeSelector:
        node: openebs
```
**Example:**

**Update the NODE_SELECTOR for openebs-provisioner**

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: openebs-provisioner
  namespace: openebs
spec:
  replicas: 1
  template:
    metadata:
      labels:
        name: openebs-provisioner
    spec:
      serviceAccountName: openebs-maya-operator
      nodeSelector:
        node: openebs
      containers:
      - name: openebs-provisioner
```

For **maya-apiserver**, under *spec:* section you can add as follows:
```
nodeSelector:
        node: openebs
```
**Example:**

**Update the NODE_SELECTOR for maya-apiserver**

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: maya-apiserver
  namespace: openebs
spec:
  replicas: 1
  template:
    metadata:
      labels:
        name: maya-apiserver
    spec:
      serviceAccountName: openebs-maya-operator
      nodeSelector:
        node: openebs
      containers:
      - name: maya-apiserver
```

For **openebs-snapshot-operator**, under *spec:* section you can add as follows:

```
nodeSelector:
        node: openebs
```
**Example:**

**Update the NODE_SELECTOR for openebs-snapshot-operator**

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: openebs-snapshot-operator
  namespace: openebs
spec:
  replicas: 1
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        name: openebs-snapshot-operator
    spec:
      serviceAccountName: openebs-maya-operator
      nodeSelector:
        node: openebs
      containers:
        - name: snapshot-controller
```

For **openebs-ndm** , under *spec:* section you can add as follows:

```
nodeSelector:
        node: openebs
```

**Example:**

**Update the NODE_SELECTOR for openebs-ndm**

```
apiVersion: extensions/v1beta1
kind: DaemonSet
metadata:
  name: openebs-ndm
  namespace: openebs
spec:
  template:
    metadata:
      labels:
        name: openebs-ndm
    spec:
      # By default the node-disk-manager will be run on all kubernetes nodes
      # If you would like to limit this to only some nodes, say the nodes
      # that have storage attached, you could label those node and use
      # nodeSelector.
      #
      # e.g. label the storage nodes with - "openebs.io/nodegroup"="storage-node"
      # kubectl label node <node-name> "openebs.io/nodegroup"="storage-node"
      #nodeSelector:
      #  "openebs.io/nodegroup": "storage-node"
      serviceAccountName: openebs-maya-operator
      nodeSelector:
        node: openebs
      hostNetwork: true
```

## Step 3

Run the modified operator file to install OpenEBS and schedule the OpenEBS control plane pods and data plane pod on the appropriate nodes.

```
kubectl apply -f openebs-operator-0.8.0.yaml
```

## Step 4

### Scheduling other data plane pods using NODE_SELECTOR

To schedule data plane pods such as storage target and storage replica on the required labeled node, your storage class has to be modified by adding required parameters with corresponding node label.

You can modify the configuration for data plane pods as follows:

**Update the NODE_SELECTOR for storage target and storage replica**

You must add the following environmental parameters in your storage class before provisioning volume. You can provision OpenEBS storage target pod to the nodes where applications are deployed so that application pods can communicate easily with storage target pods.

```
- name: TargetNodeSelector
  value: |-
      node: appnode
- name: ReplicaNodeSelector
  value: |-
      node: openebs
```

Get the Storage Class installed in your cluster by following command

```
kubectl get sc
```

Following is an example output.

```
NAME                        PROVISIONER                                                AGE
openebs-cstor-sparse        openebs.io/provisioner-iscsi                               6m
openebs-jiva-default        openebs.io/provisioner-iscsi                               6m
openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   6m
standard (default)          kubernetes.io/gce-pd                                       19m
```

If you are using default Storage Class which is created as part of *openebs-operator-0.8.0.yaml* installation then you have to modify your existing default Storage Class and edit it using *kubectl* command using following way.

```
kubectl edit sc openebs-jiva-default
```

Then you can add following entries as an environmental variable in your storage class.  

```
- name: TargetNodeSelector
  value: |-
      node: appnode
- name: ReplicaNodeSelector
  value: |-
      node: openebs
```

**Example:**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaCount
        value: "3"
      - name: StoragePool
        value: default
      - name: TargetNodeSelector
        value: |-
            node: appnode
      - name: ReplicaNodeSelector
        value: |-
            node: openebs
      #- name: TargetResourceLimits
      #  value: |-
      #      memory: 1Gi
      #      cpu: 100m
      #- name: AuxResourceLimits
      #  value: |-
      #      memory: 0.5Gi
      #      cpu: 50m
      #- name: ReplicaResourceLimits
      #  value: |-
      #      memory: 2Gi
    openebs.io/cas-type: jiva
```

Now you have made provision to schedule data plane pods of Jiva volume in to labelled nodes. As a **cluster admin**, you can provision jiva or cStor based on your requirements. For more information about provisioning them, see [provisioning jiva](/docs/next/deployjiva.html)and [provisioning cStor](/docs/next/deploycstor.html).

# Selecting either NODE-SELECTOR or TAINT method 

Kubernetes provides these two methods to control scheduling pods on cluster nodes. For more details about these features, you can refer to the Kubernetes documentation on [NODE-SELECTORS](https://kubernetes.io/docs/concepts/configuration/assign-pod-node/) and [Taints&Tolerations](https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/).

In general, NODE-SELECTOR method is suitable for assigning OpenEBS control plane pods to a set of given nodes as there is a direct representation of where the pods have to go. For example, administrator can choose to configure the control pods on (N1, N2) or (N3, N4, N5).

Taints and tolerations method is recommended when the administrator wants to dedicate only certain nodes for OpenEBS Jiva pods (target or replica). For example, out of 20 nodes in a given Kubernetes cluster, if Jiva pods must be dedicated to 3 nodes (N8, N9, N10), then taints are setup on N8, N9, and N10 and tolerations are provided to maya-apiserver. 

 

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
