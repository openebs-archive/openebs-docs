---
id: jivaguide
title: Jiva user guide
sidebar_label: Jiva user guide
---
------

For details of how Jiva works, see <a href="/docs/next/jiva.html" >Jiva overview page</a>



Jiva is a light weight storage engine that is recommended to use for low capacity workloads. The snapshot and storage management features of the other cStor engine are more advanced and is <a href="http://localhost:3000/docs/next/casengines.html#cstor-vs-jiva-features-comparison">recommended</a> when snapshots are a need.

<br>

Follow the below steps to provision persistent volumes using Jiva storage engine.

<a href="/docs/next/installation.html" target="_blank">Verify</a> OpenEBS installation

<a href="/docs/next/iscsiclient.html" target="_blank">Verify</a> iSCSI client is installed and iscsid service is running

If simple provisioning of jiva volumes is desired without any configuration see  <a href="/docs/next/jivaguide.html#simple-provisioning-of-jiva">here</a>

For provisioning with local or cloud disks <a href="/docs/next/jivaguide.html#provisioning-with-local-or-cloud-disks">here</a>

For configuring different storage policies on Jiva volume, see [here](/docs/next/jivaguide.html#jiva-storage-policies).

<br>

## Simple provisioning of jiva

To quickly provision a jiva volume using the default pool and storageClass, use the following command

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-jiva-default.yaml
```

In this mode, OpenEBS provisions a jiva volume with three replicas on three different nodes. The data in each replica is storage in the local container storage of the replica itself. The data is replicated and highly available and is suitable for quick testing of OpenEBS and simple application PoCs.

## Provisioning with local or cloud disks

In this mode, local disks on each node need to be prepared and mounted at a directory path for use by jiva. 

***Note:*** Node disk manager and other disk management capabilities are integrated into and used by cStor. For jiva, the mount paths need to be setup and managed by the administrator.

### Prepare disks and mount them

If it is a cloud disk provision and mount on the node. If three replicas of Jiva volume are needed, provision three cloud disks and mount them on each node. The mount path needs to be same on all three nodes

**GPD example**

- Create a GPD

  <font color="maroon">

  gcloud compute disks create disk1 --size 100GB --type pd-standard  --zone us-central1-a

  </font>

- Attach the GPD to a node

  <font color="maroon">

  gcloud compute instances attach-disk <Node Name> --disk disk1 --zone us-central1-a

  </font>



- If the disk attached is mapped to /dev/sdb, verify the size, mount the disk and format it

  <font color="maroon">

  sudo lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINT,LABEL

  sudo mkfs.ext4 /dev/<device-name>

  sudo mkdir /mnt/openebs-gpd

  sudo mount /dev/sdb  /mnt/openebs-gpd

  </font>

- Repeat the above steps on other two nodes if this is a three replica case



### Create a Jiva pool

Jiva pool requires mount path to prepared and available. Note that if the mount path is not pointing a real disk, then a local directory is created with this mount path and the replica data goes to the container image disk (similar to the case of `default` pool)

- YAML specification to create the jiva pool is shown below

```
    apiVersion: openebs.io/v1alpha1
    kind: StoragePool
    metadata:
        name: gpdpool 			 
        type: hostdir
    spec:
        path: "/mnt/openebs-gpd"   
```

- Copy the above content to the into a file called jiva-gpd-pool.yaml and create the pool using the following command

```
kubectl apply -f jiva-gpd-pool.yaml 
```

- Verify if the pool is created using the following command

```
kubectl get storagepool
```

 

### Create a StorageClass

Specify the jiva pool in the `StoragePool` annotation of storage class. Example StorageClass specification is given below

---
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-gpd-3repl
  annotations:
    cas.openebs.io/config: |
      - name: ControllerImage
        value: openebs/jiva:0.8.1
      - name: ReplicaImage
        value: openebs/jiva:0.8.1
      - name: VolumeMonitorImage
        value: openebs/m-exporter:0.8.1
      - name: ReplicaCount
        value: "3"
      - name: StoragePool
        value: gpdpool
```

- Copy the above content to the into a file called jiva-gpd-3repl-sc.yaml and create the pool using the following command

```
kubectl apply -f jiva-gpd-3repl-sc.yaml
```

- Verify if the StorageClass is created using the following command

```
kubectl get sc
```

 

### Provision Jiva Volumes

Once the storage class is created, provision the volumes using the standard PVC interface. In the example below the `StorageClass` openebs-jiva-gpd-3repl is specified in the `PersistentVolumeClaim` specification



**Percona example**

```
---
apiVersion: v1
kind: Pod
metadata:
  name: percona
  labels:
    name: percona
spec:
  containers:
  - resources:
      limits:
        cpu: 0.5
    name: percona
    image: percona
    args:
      - "--ignore-db-dir"
      - "lost+found"
    env:
      - name: MYSQL_ROOT_PASSWORD
        value: k8sDem0
    ports:
      - containerPort: 3306
        name: percona
    volumeMounts:
    - mountPath: /var/lib/mysql
      name: demo-vol1
  volumes:
  - name: demo-vol1
    persistentVolumeClaim:
      claimName: demo-vol1-claim
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-jiva-gpd-3repl
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G

```

Run the application using the following command.

```
kubectl apply -f demo-percona-mysql-pvc.yaml
```

The Percona application now runs inside the `gpdpool` storage pool.

### Jiva Storage Policies

Below table lists the storage policies supported by Jiva. These policies should be built into *StorageClass* and apply them through *PersistentVolumeClaim* or *VolumeClaimTemplates* interface.



| CSTOR STORAGE POLICY                                   | MANDATORY | DEFAULT                           | PURPOSE                                                      |
| ------------------------------------------------------ | --------- | --------------------------------- | ------------------------------------------------------------ |
| [ReplicaCount](#Replica-Count-Policy)                  | No        | 3                                 | Defines the number of Jiva volume replicas                   |
| [Replica Image](#Replica-Image-Policy)                 |           | quay.io/openebs/m-apiserver:0.8.1 | To use particular Jiva replica image                         |
| [ControllerImage](#Controller-Image-Policy)            |           | quay.io/openebs/jiva:0.8.1        | To use particular Jiva Controller Image                      |
| [StoragePool](#Storage-Pool-Policy)                    | Yes       | default                           | A storage pool provides a persistent path for an OpenEBS volume. It can be a directory on host OS or externally mounted disk. |
| [VolumeMonitor](#Volume-Monitor-Policy)                |           | ON                                | When ON, a volume exporter sidecar is launched to export Prometheus metrics. |
| [VolumeMonitorImage](#Volume-Monitoring-Image-Policy)  |           | quay.io/openebs/m-exporter:0.8.1  | Used when VolumeMonitor is ON. A dedicated metrics exporter to the workload. Can be used to apply a specific issue or feature for the workload |
| [Volume FSType](#Volume-File-System-Type-Policy)       |           | ext4                              | Specifies the filesystem that the volume should be formatted with. Other values are `xfs` |
| [Volume Space Reclaim](#Volume-Space-Reclaim-Policy)   |           | false                             | It will specify whether data need to be retained post PVC deletion. |
| [TargetNodeSelector](#Targe-NodeSelector-Policy)       |           | Decided by Kubernetes scheduler   | Specify the label in `key: value` format to notify Kubernetes scheduler to schedule Jiva target pod on the nodes that match label. |
| [Replica NodeSelector](#Replica-NodeSelector-Policy)   |           | Decided by Kubernetes scheduler   | Specify the label in `key: value` format to notify Kubernetes scheduler to schedule Jiva replica pods on the nodes that match label. |
| [TargetTolerations](#TargetTolerations)                |           | Decided by Kubernetes scheduler   | Configuring the tolerations for Jiva Target pod.             |
| [ReplicaTolerations](#ReplicaTolerations)              |           | Decided by Kubernetes scheduler   | Configuring the tolerations for Jiva Replica pods.           |
| [TargetResourceLimits](#Target-ResourceLimits-Policy)  |           | Decided by Kubernetes scheduler   | CPU and Memory limits to Jiva Target pod                     |
| [TargetResourceRequests](#TargetResourceRequests)      |           | Decided by Kubernetes scheduler   | Configuring resource requests that need to be available before scheduling the containers. |
| [AuxResourceLimits](#AuxResourceLimits-Policy)         |           | Decided by Kubernetes scheduler   | configuring resource limits on the target pod.               |
| [AuxResourceRequests](#AuxResourceRequests-Policy)     |           | Decided by Kubernetes scheduler   | Configure minimum requests like ephemeral storage to avoid erroneous eviction by K8s. |
| [ReplicaResourceLimits](#ReplicaResourceLimits-Policy) |           | Decided by Kubernetes scheduler   | Allow you to specify resource limits for the Replica.        |
| [Target Affinity](#Target-Affinity-Policy)             |           | Decided by Kubernetes scheduler   | The policy specifies the label `key: value` pair to be used both on the Jiva target and on the application being used so that application pod and Jiva target pod are scheduled on the same node. |

<h3><a class="anchor" aria-hidden="true" id="Replica-Count-Policy"></a>Replica Count Policy</h3>

You can specify the Jiva replica count using the *value* for *ReplicaCount* property. In the following example, the jiva-replica-count is specified as 3. Hence, three replicas are created.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
       - name: ReplicaCount
         value: "3"
```

<h3><a class="anchor" aria-hidden="true" id="Replica-Image-Policy"></a>Replica Image Policy</h3>

You can specify the jiva replica image using *value* for *ReplicaImage* property.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: ReplicaImage
        value: quay.io/openebs/m-apiserver:0.8.1
```

<h3><a class="anchor" aria-hidden="true" id="Controller-Image-Policy"></a>Controller Image Policy</h3>

You can specify the jiva controller image using the *value* for *ControllerImage* property.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: ControllerImage
        value: quay.io/openebs/jiva:0.8.1
```

<h3><a class="anchor" aria-hidden="true" id="Volume-Monitor-Policy"></a>Volume Monitor Policy</h3>

You can specify the jiva volume monitor feature which can be set using *value* for *VolumeMonitor* property.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - enabled: "true"
        name: VolumeMonitor
```

<h3><a class="anchor" aria-hidden="true" id="Storage-Pool-Policy"></a>Storage Pool Policy</h3>

A storage pool provides a persistent path for an OpenEBS volume. It can be a directory on any of the following.

- host-os or
- mounted disk

**Note:**

You must define the storage pool as a Kubernetes Custom Resource (CR) before using it as a Storage Pool policy. Following is a sample Kubernetes custom resource definition for a storage pool.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePool
metadata:
    name: default
    type: hostdir
spec:
    path: "/mnt/openebs"
```

This storage pool custom resource can now be used as follows in the storage class.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: StoragePool
        value: default
```

<h3><a class="anchor" aria-hidden="true" id="Volume-File-System-Type-Policy"></a>Volume File System Type Policy</h3>

You can specify a storage class policy where you can specify the file system type. By default, OpenEBS comes with ext4 file system. However, you can also use the xfs file system.

Following is a sample setting.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
   name: openebs-mongodb
   annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: FSType
        value: "xfs"
```

<h3><a class="anchor" aria-hidden="true" id="Volume-Monitoring-Image-Policy"></a>Volume Monitoring Image Policy</h3>

You can specify the monitoring image policy for a particular volume using *value* for *VolumeMonitorImage*property. The following Kubernetes storage class sample uses the Volume Monitoring policy. By default, volume monitor is enabled.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: VolumeMonitorImage
        value: quay.io/openebs/m-exporter:0.8.1
```

<h3><a class="anchor" aria-hidden="true" id="Volume-Space-Reclaim-Policy"></a>Volume Space Reclaim Policy</h3>

Support for a storage policy that can disable the Jiva Volume Space reclaim. You can specify the jiva volume space reclaim feature setting using the *value* for *RetainReplicaData* property. In the following example, the jiva volume space reclaim feature is enabled as true. Hence, retain the volume data post PVC deletion.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: RetainReplicaData
        enabled: true
```

<h3><a class="anchor" aria-hidden="true" id="Targe-NodeSelector-Policy"></a>Target  NodeSelector Policy</h3>

You can specify the *TargetNodeSelector* where Target pod has to be scheduled using the *value* for *TargetNodeSelector*. In following example, `node: apnode`is the node label.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetNodeSelector
        value: |-
            node: appnode
    openebs.io/cas-type: jiva
```

<h3><a class="anchor" aria-hidden="true" id="Replica-NodeSelector-Policy"></a>Replica NodeSelector Policy</h3>

You can specify the *ReplicaNodeSelector* where replica pods has to be scheduled using the *value* for *ReplicaNodeSelector* . In following sample storage class yaml, `node: openebs` is the node label.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaNodeSelector
        value: |-
            node: openebs
    openebs.io/cas-type: jiva
```

<h3><a class="anchor" aria-hidden="true" id="TargetTolerations"></a>TargetTolerations Policy </h3>

You can specify the *TargetTolerations* to specify the tolerations for Jiva target. 

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

<h3><a class="anchor" aria-hidden="true" id="ReplicaTolerations"></a>ReplicaTolerations Policy </h3>

You can specify the *ReplicaTolerations* to specify the tolerations for Replica.

```
- name: ReplicaTolerations
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
    openebs.io/cas-type: jiva
```

<h3><a class="anchor" aria-hidden="true" id="Target-ResourceLimits-Policy"></a>Target ResourceLimits Policy</h3>

You can specify the *TargetResourceLimits* to restrict the memory and cpu usage of Jiva target pod within the given limit using the *value* for *TargetResourceLimits* .

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
    openebs.io/cas-type: jiva
```

<h3><a class="anchor" aria-hidden="true" id="AuxResourceLimits-Policy"></a>AuxResourceLimits Policy</h3>

You can specify the *AuxResourceLimits* which allow you to set limits on side cars.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 50m
    openebs.io/cas-type: jiva
```

<h3><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h3>

This feature is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars. Requests have to be specified in the format expected by Kubernetes.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceRequests
        value: "none"
    openebs.io/cas-type: jiva
```

<h3><a class="anchor" aria-hidden="true" id="ReplicaResourceLimits-Policy"></a>ReplicaResourceLimits Policy</h3>

You can specify the *ReplicaResourceLimits* to restrict the memory usage of replica pod within the given limit using the *value* for *ReplicaResourceLimits*.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaResourceLimits
        value: |-
            memory: 2Gi
    openebs.io/cas-type: jiva
```

<h3><a class="anchor" aria-hidden="true" id="Target-Affinity-Policy"></a>Target Affinity Policy</h3>

The StatefulSet workloads access the OpenEBS storage volume by connecting to the Volume Target Pod. This policy can be used to co-locate volume target pod on the same node as workload.

- This feature makes use of the Kubernetes Pod Affinity feature that is dependent on the Pod labels. User will need to add the following label to both Application and PVC.

  ```
  labels:
    openebs.io/target-affinity: <application-unique-label>
  ```

- You can specify the Target Affinity in both application and OpenEBS PVC using the following way

  For Application Pod, it will be similar to the following

  ```
  apiVersion: v1
  kind: Pod
  metadata:
    name: fio-jiva
    labels:
      name: fio-jiva
      openebs.io/target-affinity: fio-jiva
  ```

  For OpenEBS PVC, it will be similar to the following.

  ```
  kind: PersistentVolumeClaim
  apiVersion: v1
  metadata:
    name: fio-jiva-claim
    labels:
      openebs.io/target-affinity: fio-jiva
  ```

**Note**: *This feature works only for cases where there is a 1-1 mapping between a application and PVC. It's not recommended for STS where PVC is specified as a template.*

<br>

## See Also:

### [Backup and Restore](/docs/next/backup.html)

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
