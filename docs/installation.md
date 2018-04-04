---
id: installation
title: OpenEBS Installation
sidebar_label: Installation
---

------

This section describes about the OpenEBS installation and its up-gradation to its latest version.

Install section deals with different ways of OpenEBS installation and Upgrade section deals with upgrading OpenEBS to it latest available version from its previous version. 



Install
=========

It is very simple to install OpenEBS on your existing k8s cluster. OpenEBS installation can be done by 2 ways

1. Helm charts
2. kubectl  




## Setup OpenEBS using helm charts

With simple and easy steps, you can install OpenEBS on your existing k8s cluster using helm chart

Download and Install the latest OpenEBS Operator files using the following commands.

```
helm repo add openebs-charts https://openebs.github.io/charts/
helm repo update
helm install openebs-charts/openebs --name openebs --namespace openebs
```

## Configuration

The following tables lists the configurable parameters of the OpenEBS chart and their default values.

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

Alternatively, a YAML file (values.yaml) that specifies the values for the parameters can be provided while installing the chart. You can customize it or go with default values. For example,

```
helm install --name openebs -f values.yaml openebs-charts/openebs
```



## Setup OpenEBS using kubectl

You can easily setup OpenEBS on your existing Kubernetes cluster with a few simple kubectl commands.

Download the latest OpenEBS Operator files using the following commands.



```
git clone <https://github.com/openebs/openebs.git>
```



Apply the  openebs-operator.yaml to deploy OpenEBS on your k8 cluster.



```
cd openebs/k8s
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

 


Upgrade
=========

There are 3 main upgrade paths we are supporting. Each upgrade has its own significant changes to support and ease use of OpenEBS volume in your k8s cluster.

From 0.4.0to 0.5.0

From 0.5.0to 0.5.1

From 0.5.1to 0.5.3



These are the general steps to upgrade your current OpenEBS volume from above mentioned paths.



### **STEP-1: CORDON ALL NODES WHICH DO NOT HOST OPENEBS VOLUME REPLICAS**

Perform kubectl cordon <node> on all nodes that don't have the openebs volume replicas.

This is to ensure that the replicas are not rescheduled elsewhere (other nodes) upon upgrade and "stick" to the same nodes.



### **STEP-2 : OBTAIN YAMLSPECIFICATIONS FROM OPENEBS LATEST RELEASE**

Create a directory and obtain specification from [https://github.com/openebs/openebs/releases/tag/<version>>  into the new directory folder files. 

Note: Replace version name with [v0.5.0](https://github.com/openebs/openebs/releases/tag/v0.5.0), [v0.5.1](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.5.0-0.5.1) or v0.5.3



### **STEP-3:UPGRADE TO THE LATEST OPENEBS OPERATOR**



`test@Master:~$ kubectl apply -f k8s/openebs-operator.yaml`
`serviceaccount "openebs-maya-operator" configured`
`clusterrole "openebs-maya-operator" configured`
`clusterrolebinding "openebs-maya-operator" configured`
`deployment "maya-apiserver" configured`
`service "maya-apiserver-service" configured`
`deployment "openebs-provisioner" configured`
`customresourcedefinition "storagepoolclaims.openebs.io" created`
`customresourcedefinition "storagepools.openebs.io" created`
`storageclass "openebs-standard" created`



**Notes** : This step will upgrade the operator deployments with the corresponding images, and also

- Sets up the pre-requisites for volume monitoring
- Creates a new OpenEBS storage-class called openebs-standard with : vol-size=5G,     storage-replica-count=2, storagepool=default, monitoring=True

The above storage-class template can be used to create new ones with desired properties.

### **STEP-4: CREATE THE OPENEBSMONITORING DEPLOYMENTS (Prometheus & Grafana)**



This is an optional step and which will be useful if you need to track storage metrics on your OpenEBS volume. We 

recommended using the monitoring framework to track your OpenEBS volume metrics

### **STEP-5: UPDATE OPENEBS VOLUME (CONTROLLER AND REPLICA)DEPLOYMENTS**



Obtain the name of the OpenEBS Persistent Volume (PV) that has to be updated

```
test@Master:~$ kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                     STORAGECLASS       REASON    AGE
pvc-8cc9c06c-ea22-11e7-9112-000c298ff5fc   5G         RWO            Delete           Bound     default/demo-vol1-claim   openebs-basic   
```

Go to the  patch folder to point to the appropriate patch.Run the script *oebs_update.sh* by passing the PV as argument

```
test@Master:~$ ./oebs_update pvc-01174ced-0a40-11e8-be1c-000c298ff5fc
deployment "pvc-8cc9c06c-ea22-11e7-9112-000c298ff5fc-rep" patched
deployment "pvc-8cc9c06c-ea22-11e7-9112-000c298ff5fc-ctrl" patched
replicaset "pvc-8cc9c06c-ea22-11e7-9112-000c298ff5fc-ctrl-59df76689f" deleted
```

Verify that the volume controller and replica pods are running post upgrade

```
test@Master:~$ kubectl get pods
NAME                                                             READY     STATUS    RESTARTS   AGE
maya-apiserver-2288016177-lzctj                                  1/1       Running   0          3m
openebs-grafana-2789105701-0rw6v                                 1/1       Running   0          2m
openebs-prometheus-4109589487-4bngb                              1/1       Running   0          2m
openebs-provisioner-2835097941-5fcxh                             1/1       Running   0          3m
percona-2503451898-5k9xw                                         1/1       Running   0          9m
pvc-8cc9c06c-ea22-11e7-9112-000c298ff5fc-ctrl-6489864889-ml2zw   2/2       Running   0          10s
pvc-8cc9c06c-ea22-11e7-9112-000c298ff5fc-rep-6b9f46bc6b-4vjkf    1/1       Running   0          20s
pvc-8cc9c06c-ea22-11e7-9112-000c298ff5fc-rep-6b9f46bc6b-hvc8b    1/1       Running   0          20s
```



### **STEP-6:VERIFY THAT ALL THE REPLICAS ARE REGISTERED AND ARE IN RW MODE** 

`test@Master:~$ curl GET http://10.47.0.5:9501/v1/replicas | grep createTypes | jq`
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
`100   162  100   162    0     0     27      0  0:00:06  0:00:05  0:00:01    37`
`100   971  100   971    0     0   419k      0 --:--:-- --:--:-- --:--:--  419k`
`{`
  "createTypes": {
    "replica": "http://10.47.0.5:9501/v1/replicas"
  },
  "data": [
    {
      "actions": {
        "preparerebuild": "http://10.47.0.5:9501/v1/replicas/dGNwOi8vMTAuNDcuMC4zOjk1MDI=?action=preparerebuild",
        "verifyrebuild": "http://10.47.0.5:9501/v1/replicas/dGNwOi8vMTAuNDcuMC4zOjk1MDI=?action=verifyrebuild"
      },
      "address": "tcp://10.47.0.3:9502",
      "id": "dGNwOi8vMTAuNDcuMC4zOjk1MDI=",
      "links": {
        "self": "http://10.47.0.5:9501/v1/replicas/dGNwOi8vMTAuNDcuMC4zOjk1MDI="
      },
      "mode": "RW",
      "type": "replica"
    },
    {
      "actions": {
        "preparerebuild": "http://10.47.0.5:9501/v1/replicas/dGNwOi8vMTAuNDQuMC41Ojk1MDI=?action=preparerebuild",
        "verifyrebuild": "http://10.47.0.5:9501/v1/replicas/dGNwOi8vMTAuNDQuMC41Ojk1MDI=?action=verifyrebuild"
      },
      "address": "tcp://10.44.0.5:9502",
      "id": "dGNwOi8vMTAuNDQuMC41Ojk1MDI=",
      "links": {
        "self": "http://10.47.0.5:9501/v1/replicas/dGNwOi8vMTAuNDQuMC41Ojk1MDI="
      },
      "mode": "RW",
      "type": "replica"
    }
  ],
  "links": {
    "self": "http://10.47.0.5:9501/v1/replicas"
  },
  "resourceType": "replica",
  "type": "collection"
`}`

### STEP-7: CONFIGURE GRAFANA TO MONITOR VOLUME METRICS

Perform the following actions if Step-4 was executed.

- Access the grafana dashboard at http://*NodeIP*:32515
- Add the prometheus data source by giving URL as http://*NodeIP*:32514
- Once data source is validated, import the dashboard JSON from :<https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-pg-dashboard.json>
- Access the volume stats by selecting the volume name (pvc-*) in the OpenEBS Volume dashboard

**Note** : For new applications select a newly created storage-class that has monitoring enabled to automatically start viewing metrics




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
