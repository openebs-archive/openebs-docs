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
  - OpenEBS Snapshot Controller
- **Data plane pods**
  - Jiva data plane 
    - Jiva storage target pod
    - Jiva storage replica pods
  - cStor data plane `(available from 0.7 release)`
    - cStor storage target pod
    - cStor storage replica pods

Control plane pods are scheduled while installing OpenEBS and Data plane pods are scheduled during volume provisioning. 

# Before OpenEBS Installation

The OpenEBS administrator can choose to provide the scheduling configuration for control plane and data plane pods during installation. The following procedure allows you to modify the configuration. 

## Step 1

Download the *openebs-operator* file using the following command.

`wget  https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-operator.yaml `

## Step 2

Modify the configuration for scheduling pods in the *openebs-operator.yaml* file. You can either use NODE_SELECTOR or TAINTS method as follows:

### NODE_SELECTOR method (preferred) ([Why?](/docs/next/scheduler.html#selecting-between-node-selector-method-taint-method))

#### Scheduling control plane pods using NODE_SELECTOR

**Label the required Nodes**

Label the required nodes with an appropriate label. In the following command, the required nodes are labelled as *openebs=controlnode*.

```
kubectl label nodes <node-name> openebs=controlnode
```

**Modify the configuration control pods** 

You can modify the configuration for control plane pods as follows in the *openebs-operator.yaml* file. 

For openebs-provisioner, under spec: section you can add as follows:

```
nodeSelector:
        openebs: controlnode
```
#### Example:

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
        openebs: controlnode
      containers:      
```

For maya-apiserver, under spec: section you can add as follows:
```
nodeSelector:
        openebs: controlnode
```

#### Example:

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
        openebs: controlnode
      containers:
```

For openebs-snapshot-controller-apiserver, under spec: section you can add as follows:

```
nodeSelector:
        openebs: controlnode
```
#### Example:

**Update the NODE_SELECTOR for openebs-snapshot-controller-apiserver**

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: openebs-snapshot-controller
  namespace: openebs
spec:
  replicas: 1
  nodeSelector:
    openebs: controlnode
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: openebs-snapshot-controller
    spec:
      serviceAccountName: openebs-maya-operator
      nodeSelector:
        openebs: controlnode
      containers:
```

### Scheduling data plane pods using NODE_SELECTOR

You can modify the configuration for data plane pods as follows:

**Update the NODE_SELECTOR for storage target and storage replica**

Add the following entries as an environmental variable under *maya-api server* deployment in the openebs-operator.yaml file. 

```
- name: DEFAULT_CONTROLLER_NODE_SELECTOR
          value: "openebs=controlnode"
        - name: DEFAULT_REPLICA_NODE_SELECTOR
          value: "openebs=controlnode"
```

#### Example:

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
        openebs: controlnode
      containers:
      - name: maya-apiserver
        imagePullPolicy: Always
        image: openebs/m-apiserver:0.6.0
        ports:
        - containerPort: 5656
        env:
        - name: OPENEBS_IO_JIVA_CONTROLLER_IMAGE
          value: "openebs/jiva:0.6.0"
        - name: OPENEBS_IO_JIVA_REPLICA_IMAGE
          value: "openebs/jiva:0.6.0"
        - name: OPENEBS_IO_VOLUME_MONITOR_IMAGE
          value: "openebs/m-exporter:0.6.0"
        - name: OPENEBS_IO_JIVA_REPLICA_COUNT
          value: "3"
        - name: DEFAULT_CONTROLLER_NODE_SELECTOR
          value: "openebs=controlnode"
        - name: DEFAULT_REPLICA_NODE_SELECTOR
          value: "openebs=controlnode"
```

## Taint method

### Scheduling control plane pods using Taints

**Taint all nodes in the cluster**

Taint all nodes in the cluster with appropriate taint. In this example, we are using a 5 node cluster. 3 nodes will be used for storage and 2 nodes will be used for running applications. Taint used for storage nodes is `role=storage:NoSchedule` and for application nodes is `role=app:NoSchedule`.

#### Example:

**For Storage Nodes**

```
kubectl taint nodes <node name> role=storage:NoSchedule
kubectl taint nodes <node name> role=storage:NoSchedule
kubectl taint nodes <node name> role=storage:NoSchedule
```

**For Application Nodes**

```
kubectl taint nodes <node name> role=app:NoSchedule
kubectl taint nodes <node name> role=app:NoSchedule
```

**Modify the configuration for control pods**

You can modify the configuration for control plane pods as follows in the *openebs-operator.yaml* file.

**Update the Taint policy for openebs-provisioner**

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
      tolerations:
      - key: "role"
        operator: "Equal"
        value: "storage"
        effect: "NoSchedule"
```

**Update the Taint policy for maya-apiserver**

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
      tolerations:
      - key: "role"
        operator: "Equal"
        value: "storage"
        effect: "NoSchedule"
```

**Update the Taint policy for openebs-snapshot-controller-apiserver**

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
      tolerations:
      - key: "role"
        operator: "Equal"
        value: "storage"
        effect: "NoSchedule"
```

### Scheduling data plane pods using Taints

You can modify the configuration for data plane pods as follows:

**Update the Taint policy for storage target and storage replica**

Add the following entries as an environmental variable under *maya-api server* deployment in the openebs-operator.yaml file. 

```
-name: DEFAULT_CONTROLLER_NODE_TAINT_TOLERATION
 value: role=storage:NoSchedule

-name: DEFAULT_REPLICA_NODE_TAINT_TOLERATION
 value: role=storage:NoSchedule
```

## Step 3

Run the operator file to install OpenEBS and schedule the OpenEBS control plane pods on the appropriate nodes.

```
kubectl apply -f openebs-operator.yaml
```

**Note:** Remember to put toleration in the application yaml before applying a corresponding application yaml file. This will schedule an application in the application node.

## Selecting either NODE-SELECTOR or TAINT method 

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
