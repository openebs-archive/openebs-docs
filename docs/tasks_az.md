---
id: tasks_az
title: Deploying OpenEBS volumes across AZs on public clouds
sidebar_label: Deploy across AZs
---
------

## Installing OpenEBS across AZs

Create a GKE cluster with 2 nodes each in 3 regions as a first step. For more information about how to create a cluster in different AZs, click [here](https://cloud.google.com/kubernetes-engine/docs/how-to/creating-a-cluster).

You have now created a cluster with 2 Nodes each in 3 different zones in the same region. The `kubectl get nodes --show-labels` command displays the labels applied on corresponding nodes in the cluster. You must use **failure-domain.beta.kubernetes.io/zone** as the topology key to achieve the requirement.

```
NAME                                        STATUS    ROLES     AGE       VERSION        LABELS
gke-ranjith-az-default-pool-4b954fa8-bnnh   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-b,kubernetes.io/hostname=gke-ranjith-az-default-pool-4b954fa8-bnnh
gke-ranjith-az-default-pool-4b954fa8-k3s1   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-b,kubernetes.io/hostname=gke-ranjith-az-default-pool-4b954fa8-k3s1
gke-ranjith-az-default-pool-92abeeec-149z   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-a,kubernetes.io/hostname=gke-ranjith-az-default-pool-92abeeec-149z
gke-ranjith-az-default-pool-92abeeec-vn3c   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-a,kubernetes.io/hostname=gke-ranjith-az-default-pool-92abeeec-vn3c
gke-ranjith-az-default-pool-fdbb2564-44th   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-c,kubernetes.io/hostname=gke-ranjith-az-default-pool-fdbb2564-44th
gke-ranjith-az-default-pool-fdbb2564-lrr0   Ready     <none>    1h        v1.9.7-gke.3   beta.kubernetes.io/arch=amd64,beta.kubernetes.io/fluentd-ds-ready=true,beta.kubernetes.io/instance-type=n1-standard-2,beta.kubernetes.io/os=linux,cloud.google.com/gke-nodepool=default-pool,failure-domain.beta.kubernetes.io/region=us-central1,failure-domain.beta.kubernetes.io/zone=us-central1-c,kubernetes.io/hostname=gke-ranjith-az-default-pool-fdbb2564-lrr0
```

The OpenEBS administrator can choose to provide the scheduling configuration for jiva replica pods across different AZs within the same region during installation. The following procedure allows you to modify the configuration.

1. **Clone OpenEBS Repository.**

To get the *openebs-operator.yaml* use the following command.

```
wget https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
```

2. **Deploying OpenEBS Cluster**

Apply *openebs-operator.yaml* as follows

```
kubectl apply -f openebs-operator-0.8.0.yaml
```

The above command will create default storage classes for Jiva named openebs-jiva-default which will have replica count as 3.

**Note:** For StatefulSet applications, OpenEBS recommends using replica count as 1 within the corresponding storageclass yaml.

3. **Deploying Jiva Replica Across AZs**

You can deploy Jiva replica pods in the stateful and StatefulSet applications. The following section describes deploying Jiva replica pod for both types of applications.  

### Deploying Jiva Replica Pods for StatefulSet Applications

StatefulSet applications are those that are maintaining the data integrity at the storage level using OpenEBS. Get some sample PVC yaml files available from OpenEBS repository by executing below command.

```
git clone https://github.com/openebs/openebs.git
cd openebs/k8s/demo/
```

Add the following content in your application yaml under PVC in the *metadata:* section.

```
 labels:
    "volumeprovisioner.mapi.openebs.io/replica-topology-key-domain": "failure-domain.beta.kubernetes.io"
    "volumeprovisioner.mapi.openebs.io/replica-topology-key-type": "zone"
```

**Example:**

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

Once you modify the application yaml, apply the same using the following command. The following command uses Percona application as an example.

```
kubectl apply -f demo-percona-mysql-pvc.yaml
```

The Jiva replica is now deployed in different AZs within the same region. Use the following command to check the status of Jiva replica pods.

```
kubectl get pods -o wide
```

The following output is displayed.

```
NAME                                                             READY     STATUS    RESTARTS   AGE       IP          NODE
percona                                                          1/1       Running   0          4m        10.60.3.8   gke-ranjith-az-default-pool-fdbb2564-lrr0
pvc-596cc598-9547-11e8-ae86-42010a80016b-ctrl-754458ff4c-9mcc8   2/2       Running   0          2m        10.60.6.4   gke-ranjith-az-default-pool-92abeeec-149z
pvc-596cc598-9547-11e8-ae86-42010a80016b-rep-56b5478d66-852lr    1/1       Running   0          2m        10.60.4.8   gke-ranjith-az-default-pool-92abeeec-vn3c
pvc-596cc598-9547-11e8-ae86-42010a80016b-rep-56b5478d66-xcrzf    1/1       Running   0          2m        10.60.0.5   gke-ranjith-az-default-pool-4b954fa8-k3s1
pvc-596cc598-9547-11e8-ae86-42010a80016b-rep-56b5478d66-zkdk4    1/1       Running   0          2m        10.60.3.7   gke-ranjith-az-default-pool-fdbb2564-lrr0
```

### Deploying Jiva Replica Pods for StatefulSet Applications

If your environment contains some stateful applications with 3 replicas, it is desirable to provision the PVs for each stateful instance in a default availability zone. The following labels can be attached to a statefulset yaml so that the PVs are deployed in different availability zones.

```
labels:
  "volumeprovisioner.mapi.openebs.io/application": "mongo-app1"
  "volumeprovisioner.mapi.openebs.io/replica-topology-key-domain": "failure-domain.beta.kubernetes.io"
  "volumeprovisioner.mapi.openebs.io/replica-topology-key-type": "zone"
```

Example:

```
apiVersion: apps/v1beta1
kind: StatefulSet
metadata:
 name: mongo
spec:
 serviceName: "mongo"
 replicas: 3
 template:
   metadata:
     labels:
       role: mongo
       environment: test
       "volumeprovisioner.mapi.openebs.io/application": "mongo-app1"
       "volumeprovisioner.mapi.openebs.io/replica-topology-key-domain": "failure-domain.beta.kubernetes.io"
       "volumeprovisioner.mapi.openebs.io/replica-topology-key-type": "zone"
   spec:
```

Once you modify the STS yaml, apply the same. The following command uses MongoDB STS application as an example.

```
kubectl apply -f mongo-statefulset.yml
```

PVs for each stateful instance are now deployed across AZs. Use the following command to verify.

```
kubectl get pods -o wide
```

The output is displayed as follows.

```
NAME                                                             READY     STATUS    RESTARTS   AGE       IP           NODE
mongo-0                                                          2/2       Running   0          16m       10.60.6.13   gke-ranjith-az-default-pool-92abeeec-149z
mongo-1                                                          2/2       Running   0          16m       10.60.5.12   gke-ranjith-az-default-pool-4b954fa8-bnnh
mongo-2                                                          2/2       Running   0          15m       10.60.1.11   gke-ranjith-az-default-pool-fdbb2564-44th
pvc-32ac4408-9579-11e8-ae86-42010a80016b-ctrl-74b7fd89bc-d9g2f   2/2       Running   0          16m       10.60.3.21   gke-ranjith-az-default-pool-fdbb2564-lrr0
pvc-32ac4408-9579-11e8-ae86-42010a80016b-rep-7bcd5d4fd4-rk6l6    1/1       Running   0          16m       10.60.3.20   gke-ranjith-az-default-pool-fdbb2564-lrr0
pvc-4d23ecfa-9579-11e8-ae86-42010a80016b-ctrl-76487f7bc7-s8cv4   2/2       Running   0          16m       10.60.0.16   gke-ranjith-az-default-pool-4b954fa8-k3s1
pvc-4d23ecfa-9579-11e8-ae86-42010a80016b-rep-65bfc7688d-m68gl    1/1       Running   0          16m       10.60.5.11   gke-ranjith-az-default-pool-4b954fa8-bnnh
pvc-730c2362-9579-11e8-ae86-42010a80016b-ctrl-7694b846fb-4zhhn   2/2       Running   0          15m       10.60.3.22   gke-ranjith-az-default-pool-fdbb2564-lrr0
pvc-730c2362-9579-11e8-ae86-42010a80016b-rep-dd4b8ff95-pwxh2     1/1       Running   0          15m       10.60.4.18   gke-ranjith-az-default-pool-92abeeec-vn3c
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

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
