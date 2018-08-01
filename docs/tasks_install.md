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
OpenEBS_Node@strong-eon-153112:~/new/openebs/k8s$ kubectl get nodes --show-labels
NAME                                        STATUS    ROLES     AGE       VERSION        LABELS
gke-ranjith-az-default-pool-4b954fa8-bnnh   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-b,kubernetes.io/hostname=gke-ranjith-az-default-pool-4b954fa8-bnnh
gke-ranjith-az-default-pool-4b954fa8-k3s1   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-b,kubernetes.io/hostname=gke-ranjith-az-default-pool-4b954fa8-k3s1
gke-ranjith-az-default-pool-92abeeec-149z   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-a,kubernetes.io/hostname=gke-ranjith-az-default-pool-92abeeec-149z
gke-ranjith-az-default-pool-92abeeec-vn3c   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-a,kubernetes.io/hostname=gke-ranjith-az-default-pool-92abeeec-vn3c
gke-ranjith-az-default-pool-fdbb2564-44th   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-c,kubernetes.io/hostname=gke-ranjith-az-default-pool-fdbb2564-44th
gke-ranjith-az-default-pool-fdbb2564-lrr0   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-c,kubernetes.io/hostname=gke-ranjith-az-default-pool-fdbb2564-lrr0
```



The OpenEBS administrator can choose to provide the scheduling configuration for jiva replica pods across different AZs within the same region during installation. The following procedure allows you to modify the configuration.

## Step 1

Clone OpenEBS repo to install OpenEBS cluster. 

```
git clone https://github.com/openebs/openebs.git
cd openebs/k8s
```



## Step 2

Apply *openebs-operator.yaml* and then apply *openebs-storageclasses.yaml*.

## Step 3

We can deploy Jiva replica Pods for usual application scenario and StateFulSet applications . It is described  Jiva replica pod deployment for both type of applications in below section.  

### Deploy Jiva Replica Pods for Usual Applications

Modify your application yaml  inside *metadata:* section under PVC. You can add as follows:

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

Once application yaml has modified, apply the same. Now the Jiva replica will be deployed in different AZs within the same region.

```
OpenEBS_Node@strong-eon-153112:~/new/openebs/k8s$ kubectl get pods -o wide
NAME                                                             READY     STATUS    RESTARTS   AGE       IP          NODE
percona                                                          1/1       Running   0          4m        10.60.3.8   gke-ranjith-az-default-pool-fdbb2564-lrr0
pvc-596cc598-9547-11e8-ae86-42010a80016b-ctrl-754458ff4c-9mcc8   2/2       Running   0          2m        10.60.6.4   gke-ranjith-az-default-pool-92abeeec-149z
pvc-596cc598-9547-11e8-ae86-42010a80016b-rep-56b5478d66-852lr    1/1       Running   0          2m        10.60.4.8   gke-ranjith-az-default-pool-92abeeec-vn3c
pvc-596cc598-9547-11e8-ae86-42010a80016b-rep-56b5478d66-xcrzf    1/1       Running   0          2m        10.60.0.5   gke-ranjith-az-default-pool-4b954fa8-k3s1
pvc-596cc598-9547-11e8-ae86-42010a80016b-rep-56b5478d66-zkdk4    1/1       Running   0          2m        10.60.3.7   gke-ranjith-az-default-pool-fdbb2564-lrr0
```

### Deploy Jiva Replica Pods for StateFul Set Applications

Some stateful application with 3 replicas, it is desirable to provision the PVs for each stateful instance in a default availability zone. The following labels can be attached to a stateful set by the user to indicate that PVs should be in different availability zones:

```
labels:
  "volumeprovisioner.mapi.openebs.io/application": "mongo-app1"
  "volumeprovisioner.mapi.openebs.io/replica-topology-key-domain": "failure-domain.beta.kubernetes.io"
  "volumeprovisioner.mapi.openebs.io/replica-topology-key-type": "zone"
```

Example:

```
volumeClaimTemplates:
 - metadata:
     name: mongo-persistent-storage
     labels:
       "volumeprovisioner.mapi.openebs.io/application": "mongo-app1"
       "volumeprovisioner.mapi.openebs.io/replica-topology-key-domain": "failure-domain.beta.kubernetes.io"
       "volumeprovisioner.mapi.openebs.io/replica-topology-key-type": "zone"
   spec:
     storageClassName: openebs-mongodb
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 5G
```

Once application yaml has modified, apply the same. Now  PVs for each stateful instance  will be deployed across AZs along with applications.

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