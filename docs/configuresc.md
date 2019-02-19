---
id: configuresc
title: Configuring Storage Classes
sidebar_label: Configuring StorageClasses
---
------

<br>

<img src="/docs/assets/svg/3-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>

<font size="6">Summary:</font>

[Using openebs-cstor-sparse StorageClass](#sparse-class)

[Creating a new StorageClass for cStor](#creating-a-new-class)

[cStor Storage Policies](#cstor-storage-policies)



*Note: This page describes how to create, use and maintain StorageClasses that use cStorPools. For details about StorageClasses that Jiva pools, see [Jiva user guide](/docs/next/jivaguide.html)* 

<br>

<hr>

<br>

## Using sparse StorageClass

<br>

During the installation, OpenEBS creates a StorageClass called `openebs-cstor-sparse` . You can use this StorageClass for creating a PVC (  `kind: PersistentVolumeClaim` for applications of `kind: Deployment`) or for creating a VolumeClaimTemplate (`volumeClaimTemplates:` for applications of `kind: StatefulSet`)

Note that this StorageClass has cStor volumes `replicaCount` set as `3`. Sometimes it may not be necessary to have three storage replicas for each statefulset application replica. In such cases, you can create a new StorageClass that uses the existing sparse pool `cstor-sparse-pool` but with cStor volume's replicaCount=1 using the following command



<div class="co">

cat <<EOF | kubectl create -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sparse-sc-statefulset
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
      - name: ReplicaCount
        value: "1"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
EOF
</div>



The above command creates storage class called `openebs-sparse-sc-statefulset` which you can use under volumeClaimTemplates. 

<br>

<hr>

## Creating a new StorageClass

<br>

StorageClass definition is an important task in the planning and execution of OpenEBS storage. As detailed in the CAS page, the real power of CAS architecture is to give an independent or a dedicated storage engine like cStor for each workload, so that granular policies can be applied to that storage engine to tune the behaviour or performance as per the workload's need. In OpenEBS policies to the storage engine (in this case it is cStor) through the `annotations` specified in the `StorageClass` interface. 

<font size="5">Steps to create a cStor StorageClass</font>



**Step1:** Decide the cStorPool

**Step2:** Which application uses it? Decide the replicaCount based on it

**Step3:** Are there any other storage policies to be applied to the StorageClass? Refer to the [storage policies section](#cstor-storage-policies) for more details on the storage policies applicable for cStor.

**Step4:** Create a YAML spec file <storage-class-name.yaml> from the master template below, update the pool, replica count and other policies and create the class using `kubectl apply -f <storage-class-name.yaml>` command.

**Step5:** Verify the newly created StorageClass using `kubectl describe sc <storage-class-name>`

<br>

<hr>

<br>



## cStor storage policies



Below table lists the storage policies supported by cStor. These policies should be built into StorageClass and apply them through PersistentVolumeClaim or VolumeClaimTemplates interface

| cStor Storage Policy                                     | Mandatory | Default                                 | Purpose                                                      |
| -------------------------------------------------------- | --------- | --------------------------------------- | ------------------------------------------------------------ |
| [ReplicaCount](#replica-count-policy)                    | No        | 3                                       | Defines the number of cStor volume replicas                  |
| [VolumeControllerImage](#volume-controller-image-policy) |           | quay.io/openebs/cstor-volume-mgmt:0.8.0 | Dedicated side car for command management like taking snapshots etc. Can be used to apply a specific issue or feature for the workload |
| [VolumeTargetImage](#volume-target-image-policy)         |           | value:quay.io/openebs/cstor-istgt:0.8.0 | iSCSI protocol stack dedicated to the workload. Can be used to apply a specific issue or feature for the workload |
| [StoragePoolClaim](#storage-pool-claim-policy)           | Yes       | N/A (a valid pool must be provided)     | The cStorPool on which the volume replicas should be provisioned |
| [VolumeMonitor](#volume-monitor-policy)                  |           | ON                                      | When ON, a volume exporter sidecar is launched to export Prometheus metrics. |
| [VolumeMonitorImage](#volume-monitoring-image-policy)    |           | quay.io/openebs/m-exporter:0.8.0        | Used when VolumeMonitor is ON. A dedicated metrics exporter to the workload. Can be used to apply a specific issue or feature for the workload |
| [FSType](#volume-file-system-type-policy)                |           | ext4                                    | Specifies the filesystem that the volume should be formatted with. Other values are `xfs` |
| [TargetNodeSelector](#targetnodeselector-policy)         |           | Decided by Kubernetes scheduler         | Specify the label in key:value format to notify Kubernetes scheduler to schedule cStor target pod on the nodes that match label |
| [TargetResourceLimits](#targetresourcelimits-policy)     |           | Decided by Kubernetes scheduler         | CPU and Memory limits to cStor target pod                    |
| [AuxResourceLimits](#auxresourcelimits-policy)           |           | Decided by Kubernetes scheduler         | Configuring resource limits on the pool and volume pod side-cars. |
| [AuxResourceRequests](#auxresourcerequests-policy)       |           | Decided by Kubernetes scheduler         | Configure minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. |
| [PoolResourceRequests](#poolresourcerequests-policy)     |           | Decided by Kubernetes scheduler         | CPU and Memory limits to cStorPool pod                       |
| [PoolResourceLimits](#poolresourcelimits-policy)         |           | Decided by Kubernetes scheduler         | CPU and Memory limits to cStorPool pod                       |
| [ReplicaResourceLimits](#replicaresourcelimits-policy)   |           | Decided by Kubernetes scheduler         | Allow you to specify resource limits for the Replica.        |
| [Target Affinity](#target-affinity-policy)               |           | Decided by Kubernetes scheduler         | The policy specifies the label KV pair to be used both on the cStor target and on the application being used so that application pod and cStor target pod are scheduled on the same node. |
| [Target Namespace](#target-namespace)                    |           | Openebs                                 | When service account name is specified, the cStor target pod is scheduled in the application's namespace  ?? |



<h3><a class="anchor" aria-hidden="true" id="Replica-Count-Policy"></a>Replica Count Policy</h3>

You can specify the cStor Pool replica count using the *value* for *ReplicaCount* property. In the following example, the ReplicaCount is specified as 3. Hence, three replicas for storage pool will be created.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaCount
        value: "3"
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Volume-Controller-Image-Policy"></a>Volume Controller Image Policy</h3>

You can specify the cStor Volume Controller Image using the *value* for *VolumeControllerImage* property. This will help you choose the volume management image.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: VolumeControllerImage
        value: quay.io/openebs/cstor-volume-mgmt:0.8.0
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Volume-Target-Image-Policy"></a>Volume Target Image Policy</h3>

You can specify the cStor Target Image using the *value* for *VolumeTargetImage* property. This will help you choose the cStor istgt target image.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: VolumeTargetImage
        value:quay.io/openebs/cstor-istgt:0.8.0
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Storage-Pool-Claim-Policy"></a>Storage Pool Claim Policy</h3>

You can specify the cStor Pool Claim name using the *value* for *StoragePoolClaim* property. This will help you choose cStor storage pool name where OpenEBS volume will be created. Following is the default StorageClass template where cStor volume will be created on default cStor Sparse Pool.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Volume-Monitor-Policy"></a>Volume Monitor Policy</h3>

You can specify the cStor volume monitor feature which can be set using *value* for the *VolumeMonitor* property.  By default, volume monitor is enabled.

**Note:**

cStor Volume Monitor is a docker image. Following is a sample that makes use of Volume monitor setting policy.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - enabled: "true"
        name: VolumeMonitor
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Volume-Monitoring-Image-Policy"></a>Volume Monitoring Image Policy</h3>

You can specify the monitoring image policy for a particular volume using *value* for *VolumeMonitorImage* property. The following sample storage class uses the Volume Monitor Image policy.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: VolumeMonitorImage
        value: quay.io/openebs/m-exporter:0.8.0
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Volume-File-System-Type-Policy"></a>Volume File System Type Policy</h3>

You can specify the file system type for the cStor volume where application will consume the storage using *value* for *FSType*. The following is the sample storage class. Currently OpenEBS support ext4 as the default file system and it also supports XFS as filesystem.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: FSType
        value: ext4
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Target NodeSelector-Policy"></a>Target NodeSelector Policy</h3>

You can specify the *TargetNodeSelector* where Target pod has to be scheduled using the *value* for *TargetNodeSelector*. In following example, `node: apnode `is the node label.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetNodeSelector
        value: |-
            node: appnode
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Target ResourceLimits Policy"></a>Target ResourceLimits Policy</h3>

You can specify the *TargetResourceLimits* to restrict the memory and cpu usage of target pod within the given limit  using the *value* for *TargetResourceLimits* .

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceLimits
        value: |-
            memory: 1Gi
            cpu: 100m
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="AuxResourceLimits-Policy"></a>AuxResourceLimits Policy</h3>

You can specify the *AuxResourceLimits* which allow you to set limits on side cars. 

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name:  AuxResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 50m
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h3

This feature is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars. Requests have to be specified in the format expected by Kubernetes

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceRequests
        value: "none"
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="ReplicaResourceLimits-Policy"></a>Replica ResourceLimits Policy</h3>

You can specify the *ReplicaResourceLimits* to restrict the memory usage of replica pod within the given limit  using the *value* for *ReplicaResourceLimits*.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaResourceLimits
        value: |-
            memory: 2Gi
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="PoolResourceLimits-Policy"></a>PoolResourceLimits-Policy</h3>

This feature allow you to set the limits on memory and cpu for pool pods. The resource and limit value should be in the same format as expected by Kubernetes. The `name` of SPC can be changed if you need.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  - name: PoolResourceLimits
    value: "none"
```

<h3><a class="anchor" aria-hidden="true" id="PoolResourceRequests-Policy"></a>PoolResourceRequests Policy</h3>

This feature allow you to specify resource requests that need to be available before scheduling the containers. If not specified, the default is to use the limits from PoolResourceLimits or the default requests set in the cluster. The `name` of SPC can be changed if you need.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  - name: PoolResourceRequests
    value: "none"
```

<h3><a class="anchor" aria-hidden="true" id="Target Affinity-Policy"></a>Target Affinity Policy</h3>

The StatefulSet workloads access the OpenEBS storage volume  by connecting to the Volume Target Pod. This policy can be used to co-locate volume target pod on the same node as workload.

This feature makes use of the Kubernetes Pod Affinity feature that is dependent on the Pod labels. User will need to add the following label to both Application and PVC.

```
labels:
    openebs.io/target-affinity: <application-unique-label>
```

You can specify the Target Affinity in both application and OpenEBS PVC using the following way
For Application Pod, it will be similar to the following

```
  apiVersion: v1
  kind: Pod
  metadata:
    name: fio-cstor
    labels:
      name: fio-cstor
      openebs.io/target-affinity: fio-cstor
```



**Note**: *This feature works only for cases where there is a 1-1 mapping between a application and PVC. It's not recommended for STS where PVC is specified as a template.* 

<h3><a class="anchor" aria-hidden="true" id="Target Namespace"></a>Target Namespace</h3>

By default, the cStor target pods are scheduled in a dedicated *openebs* namespace. The target pod also is provided with OpenEBS service account so that it can access the Kubernetes Custom Resource called `CStorVolume` and `Events`.
This policy, allows the Cluster administrator to specify if the Volume Target pods should be deployed in the namespace of the workloads itself. This can help with setting the limits on the resources on the target pods, based on the namespace in which they are deployed.
To use this policy, the Cluster administrator could either use the existing OpenEBS service account or create a new service account with limited access and provide it in the StorageClass as follows:

```
annotations:
    cas.openebs.io/config: |
      - name: PVCServiceAccountName
        value: "user-service-account"  
```

The sample service account can be found [here](https://github.com/openebs/openebs/blob/master/k8s/ci/maya/volume/cstor/service-account.yaml).

<br>

<hr>

<br>

## See Also:



<br>

<hr>

<br>



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
