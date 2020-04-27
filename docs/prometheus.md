---
id: prometheus
title: Using OpenEBS as TSDB for Prometheus
sidebar_label: Prometheus
---
------

<img src="/docs/assets/o-prometheus.png" alt="OpenEBS and Prometheus" style="width:400px;">

## Introduction

<br>

Prometheus is the mostly widely used application for scraping cloud native application metrics. Prometheus and OpenEBS together provide a complete open source stack for monitoring. In this solution, OpenEBS is used as Prometheus TSDB, where all the metrics are permanently stored on local Kubernetes cluster. 



**When using OpenEBS as TSDB, following are the advantages:**

- All the data is stored locally and managed natively to Kubernetes

- No need of externally managed Prometheus storage

- Start with small storage and expand the size of TSDB as needed on the fly

- Prometheus metrics are highly available. When a node fails or rebooted, Prometheus pod is rescheduled onto on of the two other nodes where cStor volume replica is available. The metrics data is  rebuilt when the node becomes available

- Take backup of the Prometheus metrics periodically and back them up to S3 or any object storage so that restoration of the same metrics is possible to the same or any other Kubernetes cluster


<br>

<hr>

<br>

## Deployment model 

<br>

<img src="/docs/assets/svg/prometheus-deployment.svg" style="width:100%;">

As shown above, OpenEBS volumes need to be configured with three replicas for high availability. This configuration work fine when the nodes (hence the cStor pool) is deployed across Kubernetes zones.



<br>

<hr>

<br>

## Configuration workflow

<br>



1. **Install OpenEBS :** If OpenEBS is not installed on the Kubernetes already, start by <a href="/v130/docs/next/installation.html" target="_blank">installing</a> OpenEBS on all or some of the cluster nodes. If OpenEBS is already installed, go to step 2.

2. **Connect to Director Online (Optional)** : Connecting  the Kubernetes cluster to <a href="https://director.mayadata.io" target="_blank">Director Online</a> provides good visibility of storage resources. Director Online has various **support options for enterprise customers**.

3. **Configure cStor Pool** : After OpenEBS installation,  cStor pool has to be configured. As prometheus TSDB needs high availability of data, OpenEBS cStor volume has to be configured with three replicas. During cStor Pool creation, make sure that the maxPools parameter is set to >=3. If cStor Pool is already configured as required go to Step 4 to create Prometheus StorageClass. 

4. **Create Storage Class** : 

   StorageClass is the interface through which most of the OpenEBS storage policies  are defined. See Prometheus Storage Class section below. 

5. **Configure PVC** : Prometheus needs only one volume to store the data. See PVC example spec below.

6. **Launch and test prometheus**:

   Run `kubectl apply -f <prometheus.yaml>` to see Prometheus running. For more information on configuring more services to be monitored, see Prometheus documentation.

   ```
   helm install stable/prometheus --storage-class=< openebs-cstor-3replica >
   ```

   

7. **Persistent volume for Grafana:**

   Grafana needs a much smaller persistent storage for storing metadata. Typically the storage class used for Prometheus is reused for Grafana as well. Just construct a new PVC with smaller storage size.  


<br>

<hr>

<br>

## Reference at <a href="https://openebs.ci" target="_blank">openebs.ci</a>

<br>

A live deployment of Prometheus using OpenEBS volumes as highly available  TSDB storage can be seen at the website <a href="https://openebs.ci">www.openebs.ci</a>



Deployment YAML spec files for Prometheus and OpenEBS resources are found <a href="https://github.com/openebs/e2e-infrastructure/tree/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/prometheus-cstor" target="_blank">here</a>



 <a href="https://openebs.ci/prometheus-cstor" target="_blank">OpenEBS-CI dashboard of Prometheus</a>



<a href="https://prometheuscstor.openebs.ci/" target="_blank">Live access to Prometheus dashboard</a>



<br>

<hr>

<br>

## Post deployment Operations

<br>

 **Monitor OpenEBS Volume size** 

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. However, an alert can be setup for volume size threshold using Director Online.

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just Prometheus alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold. See [cStorPool metrics](/v130/docs/next/ugcstor.html#monitor-pool) 



**Maintain volume replica quorum during node upgrades**

 cStor volume replicas need to be in quorum Prometheus application is deployed as `deployment` and cStor volume is configured to have `3 replicas`. Node reboots may be common during Kubernetes upgrade. Maintain volume replica quorum in such instances. See [here](/v130/docs/next/k8supgrades.html) for more details.

<br>

<hr>

<br>



## Sample YAML specs

<br>

**Sample cStor Pool spec**

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  maxPools: 3
  poolSpec:
    poolType: striped
  # NOTE - Appropriate disks need to be fetched using `kubectl get disks`
  disks:
    diskList:
       - disk-3326ca3a735ba9cbe5a7753d12d5a55a
       - disk-d80800ca121b85b136d6a50a1079c921
       - disk-49e1ca76d1901a01ff6f366b8c53e44a
```





**Prometheus StorageClass** 

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
      - name: ReplicaCount
        value: "3"
     #  value: |-
     #      memory: 1Gi
     #      cpu: 200m
     #- name: AuxResourceLimits
     #  value: |-
     #      memory: 0.5Gi
     #      cpu: 50m
#(Optional) Below 3 lines schedules the target pods deployed on the labeled nodes
     #- name: TargetNodeSelector
     #  value: |-
     #      node: appnode
provisioner: openebs.io/provisioner-iscsi
```



**PVC spec for Prometheus**

```
#PersistentVolumeClaim for prometheus
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: cstor-prometheus-storage-volume-claim
  namespace: openebs
spec:
  storageClassName: OpenEBS-cStor-Prometheus 
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500G  
```



**PVC spec for Grafana**

```
#PersistentVolumeClaim for grafana
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: grafana-cstor-claim
  namespace: grafana-cstor
spec:
  storageClassName: OpenEBS-cStor-Prometheus 
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50G   
     
```

See the <a href="https://github.com/openebs/e2e-infrastructure/blob/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/grafana-cstor/grafana-cstor-deployment.yaml" target="_blank"> sample spec files</a> for Grafana using cStor here. 



<br>

<hr>

<br>

## See Also:

<br>

### [OpenEBS architecture](/v130/docs/next/architecture.html)

### [OpenEBS use cases](/v130/docs/next/usecases.html)

### [cStor pools overview](/v130/docs/next/cstor.html#cstor-pools)



<br>

<hr>
<br>

