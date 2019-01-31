---
id: storagepolicies
title: OpenEBS Storage Policies
sidebar_label: Storage Policies
---

------

## Overview

This section explains storage policies, that every DevOps team can create and apply to their own storage systems. You can now define policies based on the type of application at the StorageClass (a Kubernetes Kind) level. This page explains when to add a storage policy to your OpenEBS cluster and how to use the same.

A storage policy states the desired behavior of an OpenEBS volume. For example, a set of storage policies can be set in a StorageClass that in turn will be referred to during OpenEBS volume provisioning.

Storage policies can be created, updated, and deleted in a running OpenEBS cluster through corresponding operations on StorageClass. Cluster administrators can update storage policies independent of the cluster. Once a storage policy is installed, users can create and access it’s objects with kubectl commands on StorageClass.

## Adding a Custom Storage Policy to an OpenEBS Cluster

Storage policies are meant to be created per team, workload, storage controller, and so on that fits your requirement. Since OpenEBS storage controllers (i.e. jiva or cStor) run from within a container, a custom storage policy can be created and set against a particular storage controller instance that meets the demands of the application (which consumes the storage exposed from the storage controller instance). You can now define policies based on the type of application at the StorageClass level. Following are some of the properties that can be customized at the default level on the StorageClass.

Jiva and cStor has its own specific storage policies which can be defined in the StorageClass. Based on the storage engine you have chosen, you can set the paramaters and create a new StorageClass specification. Following section describes the types of Storage Policies supported for both Jiva and cStor.

## Types of Storage Policies for Jiva

OpenEBS supports several types of Storage Policies for Jiva volume such as the following.

- ReplicaCount
- ReplicaImage
- ControllerImage
- StoragePool
- VolumeMonitor
- VolumeMonitorImage
- RetainReplicaData
- TargetNodeSelector
- ReplicaNodeSelector
- TargetResourceLimits
- AuxResourceLimits
- ReplicaResourceLimits
- Target Affinity

### Replica Count Policy

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

### Replica Image Policy

You can specify the jiva replica image using *value* for *ReplicaImage* property.

**Note:**

Jiva replica image is a docker image. Following is a sample that makes use of replica image policy.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: ReplicaImage
        value: quay.io/openebs/m-apiserver:0.8.0
```

### Controller Image Policy

You can specify the jiva controller image using the *value* for *ControllerImage* property.

**Note:**

Jiva controller image is a docker image. Following is a sample setting.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: ControllerImage
        value: quay.io/openebs/jiva:0.8.0

```

### Volume Monitor Policy

You can specify the jiva volume monitor feature which can be set using *value* for *VolumeMonitor* property.

**Note:**

Jiva Volume Monitor is a docker image. Following is a sample that makes use of Volume monitor setting policy.

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


### Storage Pool Policy

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

### Volume File System Type Policy

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

### Volume Monitoring Image Policy

You can specify the monitoring image policy for a particular volume using *value* for *VolumeMonitorImage* property. The following Kubernetes storage class sample uses the Volume Monitoring policy. By default, volume monitor is enabled.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: VolumeMonitorImage
        value: quay.io/openebs/m-exporter:0.8.0
```

### Volume Space Reclaim Policy

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

### TargetNodeSelector Policy

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
```

### ReplicaNodeSelector Policy

You can specify the *ReplicaNodeSelector* where replica pods has to be scheduled using the *value* for *ReplicaNodeSelector* . In following sample storage class  yaml, `node: openebs` is the node label.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaNodeSelector
        value: |-
            node: openebs
```

### TargetResourceLimits Policy

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
```

### AuxResourceLimits Policy

You can specify the *AuxResourceLimits* which allow you to set limits on side cars. 

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 50m
```

### ReplicaResourceLimits Policy

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
```

### Target Affinity Policy

The StatefulSet workloads access the OpenEBS storage volume  by connecting to the Volume Target Pod. This policy can be used to co-locate volume target pod on the same node as workload.

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

## Types of Storage Policies for cStor

OpenEBS supports several types of Storage Policies for cStor volume such as the following.

- ReplicaCount
- VolumeControllerImage
- VolumeTargetImage
- StoragePoolClaim
- VolumeMonitor
- VolumeMonitorImage
- FSType
- TargetNodeSelector
- TargetResourceLimits
- AuxResourceLimits
- ReplicaResourceLimits
- Target Affinity
- Target Namespace

### Replica Count Policy

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

### Volume Controller Image Policy

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

### Volume Target Image Policy

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

### Storage Pool Claim Policy

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

### Volume Monitor Policy

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

### Volume Monitoring Image Policy

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

### Volume File System Type Policy

You can specify the file system type for the cStor volume where application will consue the storage using *value* for *FSType*. The following is the sample storage class. Currently OpenEBS support ext4 as the default file system and it also supports XFS as filesystem.

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

### TargetNodeSelector Policy

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

### TargetResourceLimits Policy

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

### AuxResourceLimits Policy

You can specify the *AuxResourceLimits* which allow you to set limits on side cars. 

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 50m
    openebs.io/cas-type: cstor
```

### ReplicaResourceLimits Policy

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

### Target Affinity Policy

The StatefulSet workloads access the OpenEBS storage volume  by connecting to the Volume Target Pod. This policy can be used to co-locate volume target pod on the same node as workload.

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
    name: fio-cstor
    labels:
      name: fio-cstor
      openebs.io/target-affinity: fio-cstor
  ```

  For OpenEBS PVC, it will be similar to the following.

  ```
  kind: PersistentVolumeClaim
  apiVersion: v1
  metadata:
    name: fio-cstor-claim
    labels:
      openebs.io/target-affinity: fio-cstor
  ```

**Note**: *This feature works only for cases where there is a 1-1 mapping between a application and PVC. It's not recommended for STS where PVC is specified as a template.* 

### Target Namespace

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
