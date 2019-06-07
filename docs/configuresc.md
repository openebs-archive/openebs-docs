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

[Creating a new StorageClass for cStor](#creating-a-new-class)

[cStor Storage Policies](#cstor-storage-policies)

[Performance Tunings](#performance-tunings)

*Note: This page describes how to create, use and maintain StorageClasses that use cStorPools. For details about StorageClasses that Jiva pools, see [Jiva user guide](/docs/next/jivaguide.html)* 

<br>

<hr>


## Creating a new StorageClass

<br>

StorageClass definition is an important task in the planning and execution of OpenEBS storage. As detailed in the CAS page, the real power of CAS architecture is to give an independent or a dedicated storage engine like cStor for each workload, so that granular policies can be applied to that storage engine to tune the behaviour or performance as per the workload's need. In OpenEBS policies to the storage engine (in this case it is cStor) through the `annotations` specified in the `StorageClass` interface. 

<font size="5">Steps to create a cStor StorageClass</font>

**Step1:** Decide the cStorPool

**Step2:** Which application uses it? Decide the replicaCount based on it.

**Step3:** Are there any other storage policies to be applied to the StorageClass? Refer to the [storage policies section](#cstor-storage-policies) for more details on the storage policies applicable for cStor.

**Step4:** Create a YAML spec file <storage-class-name.yaml> from the master template below, update the pool, replica count and other policies and create the class using `kubectl apply -f <storage-class-name.yaml>` command.

**Step5:** Verify the newly created StorageClass using `kubectl describe sc <storage-class-name>`



<font size="5">Example Configuration of OpenEBS StorageClass</font>

You can create a new StorageClass YAML called **openebs-sc-rep1.yaml** and add content to it from below. The following will create a StorageClass of OpenEBS volume replica of `1`, Storage Pool as `cstor-pool2` and CAS type as `cstor`.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-sparse-sc-statefulset
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-pool2"
      - name: ReplicaCount
        value: "1"
provisioner: openebs.io/provisioner-iscsi
```

<br>

<hr>

<br>

## cStor storage policies



Below table lists the storage policies supported by cStor. These policies should be built into StorageClass and apply them through PersistentVolumeClaim or VolumeClaimTemplates interface

| cStor Storage Policy                                         | Mandatory | Default                                     | Purpose                                                      |
| ------------------------------------------------------------ | --------- | ------------------------------------------- | ------------------------------------------------------------ |
| [ReplicaCount](#Replica-Count-Policy)                        | No        | 3                                           | Defines the number of cStor volume replicas                  |
| [VolumeControllerImage](#Volume-Controller-Image-Policy)     |           | quay.io/openebs/cstor-volume-mgmt:1.0.0-RC1 | Dedicated side car for command management like taking snapshots etc. Can be used to apply a specific issue or feature for the workload |
| [VolumeTargetImage](#Volume-Target-Image-Policy)             |           | value:quay.io/openebs/cstor-istgt:1.0.0-RC1 | iSCSI protocol stack dedicated to the workload. Can be used to apply a specific issue or feature for the workload |
| [StoragePoolClaim](#Storage-Pool-Claim-Policy)               | Yes       | N/A (a valid pool must be provided)         | The cStorPool on which the volume replicas should be provisioned |
| [VolumeMonitor](#Volume-Monitor-Policy)                      |           | ON                                          | When ON, a volume exporter sidecar is launched to export Prometheus metrics. |
| [VolumeMonitorImage](#Volume-Monitoring-Image-Policy)        |           | quay.io/openebs/m-exporter:1.0.0-RC1        | Used when VolumeMonitor is ON. A dedicated metrics exporter to the workload. Can be used to apply a specific issue or feature for the workload |
| [FSType](#Volume-File-System-Type-Policy)                    |           | ext4                                        | Specifies the filesystem that the volume should be formatted with. Other values are `xfs` |
| [TargetNodeSelector](#Target-NodeSelector-Policy)            |           | Decided by Kubernetes scheduler             | Specify the label in `key: value` format to notify Kubernetes scheduler to schedule cStor target pod on the nodes that match label |
| [TargetResourceLimits](#Target-ResourceLimits-Policy)        |           | Decided by Kubernetes scheduler             | CPU and Memory limits to cStor target pod                    |
| [TargetResourceRequests](#TargetResourceRequests)            |           | Decided by Kubernetes scheduler             | Configuring resource requests that need to be available before scheduling the containers. |
| [TargetTolerations](#TargetTolerations)                      |           | Decided by Kubernetes scheduler             | Configuring the tolerations for target.                      |
| [AuxResourceLimits](#AuxResourceLimits-Policy)               |           | Decided by Kubernetes scheduler             | Configuring resource limits on the volume pod side-cars.     |
| [AuxResourceRequests](#AuxResourceRequests-Policy)           |           | Decided by Kubernetes scheduler             | Configure minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. |
| [Target Affinity](#Target-Affinity-Policy)                   |           | Decided by Kubernetes scheduler             | The policy specifies the label KV pair to be used both on the cStor target and on the application being used so that application pod and cStor target pod are scheduled on the same node. |
| [Target Namespace](#Target-Namespace)                        |           | openebs                                     | When service account name is specified, the cStor target pod is scheduled in the application's namespace. |
| [cStorStoragePool Replica Anti-Affinity](#cStorStoragePool-Anti-Affinity) |           | Decided by Kubernetes scheduler             | For StatefulSet applications, to distribute single replica volume on  separate nodes . |

<br>

<br>

<h3><a class="anchor" aria-hidden="true" id="Replica-Count-Policy"></a>Replica Count Policy</h3>

You can specify the cStor volume replica count using the *ReplicaCount* property. In the following example, the ReplicaCount is specified as 3. Hence, three cStor volume replicas will be created.

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
        value: quay.io/openebs/cstor-volume-mgmt:1.0.0-RC1
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
        value:quay.io/openebs/cstor-istgt:1.0.0-RC1
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Storage-Pool-Claim-Policy"></a>Storage Pool Claim Policy</h3>

You can specify the cStor Pool Claim name using the *value* for *StoragePoolClaim* property. This will help you choose cStor storage pool where OpenEBS volume will be created. Following is the default StorageClass template where cStor volume will be created on default cStor Sparse Pool.

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
        value: quay.io/openebs/m-exporter:1.0.0-RC1
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Volume-File-System-Type-Policy"></a>Volume File System Type Policy</h3>

You can specify the file system type for the cStor volume where application will consume the storage using *value* for *FSType*. The following is the sample storage class. Currently OpenEBS support ext4 as the default file system and it also supports XFS.

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

<h3><a class="anchor" aria-hidden="true" id="Target-NodeSelector-Policy"></a>Target NodeSelector Policy</h3>

You can specify the *TargetNodeSelector* where Target pod has to be scheduled using the *value* for *TargetNodeSelector*. In following example, `node: apnode ` is the node label.

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

<h3><a class="anchor" aria-hidden="true" id="Target-ResourceLimits-Policy"></a>Target ResourceLimits Policy</h3>

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

<h3><a class="anchor" aria-hidden="true" id="TargetResourceRequests"></a>TargetResourceRequests Policy </h3>

You can specify the *TargetResourceRequests* to specify resource requests that need to be available before scheduling the containers. 

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceRequests
        value: "none"
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="TargetTolerations"></a>TargetTolerations Policy </h3>

You can specify the *TargetTolerations* to specify the tolerations for target. 

```
- name: TargetTolerations
  value: |-
     t1:
       key: "key1"
       operator: "Equal"
       value: "value1"
       effect: "NoSchedule"
     t2:
       key: "key1"
       operator: "Equal"
       value: "value1"
       effect: "NoExecute"
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
            cpu: 100m
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h3>


This feature is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars. Requests have to be specified in the format expected by Kubernetes

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceRequests
        value: |-
            memory: 0.5Gi
            cpu: 100m
    openebs.io/cas-type: cstor
```

<h3><a class="anchor" aria-hidden="true" id="Target-Affinity-Policy"></a>Target Affinity Policy</h3>

The StatefulSet workloads access the OpenEBS storage volume  by connecting to the Volume Target Pod. This policy can be used to co-locate volume target pod on the same node as workload.

The configuration for implementing this policy is different for deployment and StatefulSet applications.

<h4><a class="anchor" aria-hidden="true" id="for-statefulset-applications"></a>For StatefulSet Applications</h4>

In the case of provisioning StatfulSet applications with replication factor of  greater than "1" and volume replication factor of euqal to "1", for a given OpenEBS volume, target and replica related to that volume should be scheduled on the same node where the application resides. This feature can be achieved by using either of the following approaches.

**Approach 1:**

In this approach, modification is required on StatefulSet spec and corresponding StorageClass being referred in the StatefulSet spec. Add [openebs.io/sts-target-affinity](http://openebs.io/sts-target-affinity): <[metadata.name](http://metadata.name/) of STS> label in StatefulSet spec to the following fields.

- spec.selector.matchLabels  
- spec.template.labels

**Example snippet:**

```
apiVersion: apps/v1
kind: StatefulSet
metadata:
name: test-application
labels:
  app: test-application
spec:
serviceName: test-application
replicas: 1
selector:
  matchLabels:
    app: test-application
    openebs.io/sts-target-affinity: test-application
template:
  metadata:
    labels:
      app: test-application
      openebs.io/sts-target-affinity: test-application
```

Do the following changes in the StorageClass that is referred by the claimTemplates of this StatefulSet.

- Set volumeBindingMode to WaitForFirstConsumer

**Example snippet:**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
name: cstor-sts
annotations:
  openebs.io/cas-type: cstor
  cas.openebs.io/config: |
    - name: ReplicaCount
      value: "1"
    - name: StoragePoolClaim
      value: "cstor-sparse-pool" 
provisioner: openebs.io/provisioner-iscsi
volumeBindingMode: WaitForFirstConsumer
```

**Approach 2:**

This approach is useful when user/tool does not have control over the StatefulSet spec. in this case, it requires a new StorageClass per StatefulSet application.

Add following changes in the StorageClass that is referred to by the claimTemplates of this StatefulSet.

- Add [openebs.io/sts-target-affinity](http://openebs.io/sts-target-affinity): <[metadata.name](http://metadata.name/) of STS> label to the following fields.
  - metadata.labels
- Set volumeBindingMode to WaitForFirstConsumer

**Example snippet:**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
name: cstor-sts
labels:
  openebs.io/sts-target-affinity: test-application # name of StatefulSet application
annotations:
  openebs.io/cas-type: cstor
  cas.openebs.io/config: |
    - name: ReplicaCount
      value: "1"
    - name: StoragePoolClaim
      value: "cstor-sparse-pool" 
provisioner: openebs.io/provisioner-iscsi
volumeBindingMode: WaitForFirstConsumer
```

**Note:** It is recommended to do application pod stickiness for seamless working of the above approaches. Example YAML spec for STS can be get from [here](https://raw.githubusercontent.com/openebs/openebs/12be2bbdb244d50c8c0fd48b59d520f86aa3a4a6/k8s/demo/mongodb/demo-mongo-cstor-taa.yaml).

<h4><a class="anchor" aria-hidden="true" id="for-deployment-applications"></a>For Deployment Applications</h4>

This feature makes use of the Kubernetes Pod Affinity feature that is dependent on the Pod labels. User will need to add the following label to both Application and PVC.

```
labels:
  openebs.io/target-affinity: <application-unique-label>
```

You can specify the Target Affinity in both application and OpenEBS PVC using the following way For Application Pod, it will be similar to the following.

```
apiVersion: v1
kind: Pod
metadata:
  name: fio-cstor
  labels:
    name: fio-cstor
    openebs.io/target-affinity: fio-cstor
```

The following is the sample snippet of the PVC to use Target affinity.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: fio-cstor-claim
  labels:
    openebs.io/target-affinity: fio-cstor
```

**Note**: This feature works only for cases where there is a 1-1 mapping between a application and PVC. 

<h3><a class="anchor" aria-hidden="true" id="Target-Namespace"></a>Target Namespace</h3>

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

<h3><a class="anchor" aria-hidden="true" id="cStorStoragePool-Anti-Affinity"></a>cStorStoragePool Replica Anti-Affinity</h3>

This policy will adds the ability in cStor to correlate and hence distribute single replica volumes across pools which are in turn deployed in separate nodes when application consuming all these volumes is deployed as a StatefulSet.  

Below are supported anti-affinity features:

- `openebs.io/replica-anti-affinity: <unique_identification_of_app_in_cluster>`
- `openebs.io/preferred-replica-anti-affinity: <unique_identification_of_app_in_cluster>`

Below is an example of a statefulset YAML spec that makes use of `openebs.io/replica-anti-affinity`:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
      - name: ReplicaCount
        value: "1"
    openebs.io/cas-type: cstor
  name: openebs-cstor-pool-sts
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
volumeBindingMode: Immediate
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app: busybox1
  name: busybox1
spec:
  clusterIP: None
  selector:
    app: busybox1
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: busybox1
  labels:
    app: busybox1
spec:
  serviceName: busybox1
  replicas: 1
  selector:
    matchLabels:
      app: busybox1
      openebs.io/replica-anti-affinity: busybox1
  template:
    metadata:
      labels:
        app: busybox1
        openebs.io/replica-anti-affinity: busybox1
    spec:
      terminationGracePeriodSeconds: 1800
      containers:
      - name: busybox1
        image: ubuntu
        imagePullPolicy: IfNotPresent
        command:
          - sleep
          - infinity
        volumeMounts:
        - name: busybox1
          mountPath: /busybox1
  volumeClaimTemplates:
  - metadata:
      name: busybox1
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: openebs-cstor-pool-sts
      resources:
        requests:
          storage: 2Gi
```

<br>

##  Performance Tunings


Allow users to set available performance tunings in StorageClass based on their workload. Below are the tunings that are required:

- cStor target queue depth
  - This limits the ongoing IO count from client. Default is 32.
- cStor target worker threads
  - Sets the **number of threads** that are working on above queue. It is mentioned by `Luworkers`.Default value is 6.
- cStor volume replica worker threads
  - This Is associated with cStorVolumeReplica.
  - It is mentioned by `ZvolWorkers`.
  - Defaults to the number of cores on the machine.

**Note:**  These configuration can be only used during volume provisioning. Default values will be used in case of "Invalid/None" values has been provided using configuration.

**Example Configuration:**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
name: openebs-cstor-pool
annotations:
  openebs.io/cas-type: cstor
  cas.openebs.io/config: |
    - name: StoragePoolClaim
      value: "sparse-claim-auto"
    - name: QueueDepth
      value: "20"
    - name: Luworkers
      value: "10"
    - name: ZvolWorkers
      value: "4"
provisioner: openebs.io/provisioner-iscsi
```

**Note:** For sequential workload, setting `luworkers` to 1 is good. For random workload,  default setting to 6 is good.

<br>

## See Also:

### [cStor roadmap](/docs/next/cstor.html#cstor-roadmap)



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
