---
id: tasks_install
title: OpenEBS tasks around Install and Upgrade
sidebar_label: Install and upgrade
---
------

## Install across AZs

The beginning step is create a GKE cluster with 2 nodes each in 3 regions. To know more about how to create a cluster in different AZs , please check [here](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-cluster).

Here we created a cluster with 2 Nodes each in 3 different zones in the same region. Below will shows the labels applied on the corresponding Nodes in the cluster. We need to use **failure-domain.beta.kubernetes.io/zone** as the topology key to achieve the requirement.

```
OpenEBS_Node@strong-eon-153112:~$ kubectl get nodes --show-labels
NAME                                        STATUS    ROLES     AGE       VERSION        LABELS
gke-ranjith-az-default-pool-77858b4e-c9sr   Ready     <none>    6m        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=custom-2-6144,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-c,kubernetes.io/hostname=gke-ranjith-az-default-pool-77858b4e-c9sr
gke-ranjith-az-default-pool-77858b4e-dk7g   Ready     <none>    7m        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=custom-2-6144,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-c,kubernetes.io/hostname=gke-ranjith-az-default-pool-77858b4e-dk7g
gke-ranjith-az-default-pool-7d7ed2a5-52rz   Ready     <none>    6m        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=custom-2-6144,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-b,kubernetes.io/hostname=gke-ranjith-az-default-pool-7d7ed2a5-52rz
gke-ranjith-az-default-pool-7d7ed2a5-m3v6   Ready     <none>    6m        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=custom-2-6144,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-b,kubernetes.io/hostname=gke-ranjith-az-default-pool-7d7ed2a5-m3v6
gke-ranjith-az-default-pool-a5d8d515-3bm3   Ready     <none>    7m        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=custom-2-6144,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-a,kubernetes.io/hostname=gke-ranjith-az-default-pool-a5d8d515-3bm3
gke-ranjith-az-default-pool-a5d8d515-ws28   Ready     <none>    7m        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=custom-2-6144,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-a,kubernetes.io/hostname=gke-ranjith-az-default-pool-a5d8d515-ws28
```



The OpenEBS administrator can choose to provide the scheduling configuration for jiva replica pods across different AZs within the same region during installation. The following procedure allows you to modify the configuration.

## Step 1

Download the *openebs-operator* file using the following command.

`wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-operator.yaml`

## Step 2

Modify the configuration  in the *openebs-operator.yaml* file for scheduling jiva replica pods across different AZs.  

In *maya-apiserver* deployment section, under *spec:* section you can add as follows:

```
affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchLabels:
                openebs/replica: jiva-replica
            topologyKey: failure-domain.beta.kubernetes.io/zone
```

Example:

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
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchLabels:
                openebs/replica: jiva-replica
            topologyKey: failure-domain.beta.kubernetes.io/zone
```

Apply modified *openebs-operator.yaml* and then apply storage class.

## Step 3

Get you application yaml and modify the file as below. under *metadata:* section you can add as follows:

```
 labels:
    "volumeprovisioner.mapi.openebs.io/replica-topology-key-domain": "failure-domain.beta.kubernetes.io"
    "volumeprovisioner.mapi.openebs.io/replica-topology-key-type": "zone"
```

Example:

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
  labels:
    "volumeprovisioner.mapi.openebs.io/replica-topology-key-domain": "failure-domain.beta.kubernetes.io"
    "volumeprovisioner.mapi.openebs.io/replica-topology-key-type": "zone"
spec:
  storageClassName: openebs-percona
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
```

Once file has modified, apply the corresponding application yaml. Now the Jiva replica will be deployed in different AZs within the same region.

```
OpenEBS_Node@strong-eon-153112:~/openebs/k8s/demo/percona$ kubectl get pods -o wide
NAME                                                            READY     STATUS    RESTARTS   AGE       IP          NODE
percona                                                         1/1       Running   0          1m        10.60.5.5   gke-ranjith-az-default-pool-7d7ed2a5-52rz
pvc-6f940c19-9526-11e8-ae2d-42010a80016b-ctrl-d4f9755c7-xfzlr   2/2       Running   0          1m        10.60.2.5   gke-ranjith-az-default-pool-a5d8d515-3bm3
pvc-6f940c19-9526-11e8-ae2d-42010a80016b-rep-84fdbc4d5f-67csg   1/1       Running   0          1m        10.60.5.4   gke-ranjith-az-default-pool-7d7ed2a5-52rz
pvc-6f940c19-9526-11e8-ae2d-42010a80016b-rep-84fdbc4d5f-c7qjw   1/1       Running   0          1m        10.60.1.7   gke-ranjith-az-default-pool-77858b4e-dk7g
pvc-6f940c19-9526-11e8-ae2d-42010a80016b-rep-84fdbc4d5f-qzbn2   1/1       Running   0          1m        10.60.2.6   gke-ranjith-az-default-pool-a5d8d515-3bm3
```

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
