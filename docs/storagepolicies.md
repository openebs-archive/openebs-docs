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

Storage policies are meant to be created per team, workload, storage controller, and so on that fits your requirement. Since OpenEBS storage controllers (i.e. jiva or cStor) run from within a container, a custom storage policy can be created and set against a particular storage controller instance that meets the demands of the application (which consumes the storage exposed from the storage controller instance). You can now define policies based on the type of application at the storageclass level. Following are some of the properties that can be customized at the default level in the *openebs-storageclasses.yaml* file.

## Types of Storage Policies

OpenEBS supports several types of Storage Policies such as the following.

- openebs.io/jiva-replica-count
- openebs.io/jiva-replica-image
- openebs.io/jiva-controller-image
- openebs.io/storage-pool
- openebs.io/volume-monitor

## Replica Count Policy

You can specify the jiva replica count using the *value* for *ReplicaCount* property. In the following example, the jiva-replica-count is specified as 3. Hence, three replicas are created.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-standard
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaCount
        value: "3"
```

## Replica Image Policy

You can specify the jiva replica image using *value* for *jiva-replica-image* property.

**Note:**

Jiva replica image is a docker image. Following is a sample that makes use of replica image policy.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-standard
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaImage
        value: openebs/jiva:0.7.0-RC2
```

## Controller Image Policy

You can specify the jiva controller image using the * *value* for *jiva-controller-image* property.

**Note:**

Jiva controller image is a docker image. Following is a sample setting.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-standard
  annotations:
    cas.openebs.io/config: |
      - name: ControllerImage
        value: openebs/jiva:0.7.0-RC2

```

## Storage Pool Policy

A storage pool provides a persistent path for an OpenEBS volume. It can be a directory on any of the following.

- host-os or
- mounted disk

**Note:**

You must define the storage pool as a Kubernetes Custom Resource (CR) before using it as a Storage Pool policy. Following is a sample Kubernetes custom resource definition for a storage pool.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePool
metadata:
    name: sp-mntdir
    type: hostdir
spec:
    path: "/mnt/openebs"
```

This storage pool custom resource can now be used as follows in the storage class.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-standard
  annotations:
    cas.openebs.io/config: |
      - name: StoragePool
        value: sp-mntdir

```

## Storage Class Policy

You can specify a storage class policy where you can specify the capacity and file system type. By default, OpenEBS comes with ext4 file system. However, you can also use the xfs file system.

Following is a sample setting.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
   name: openebs-mongodb
   annotations:
    cas.openebs.io/config: |
      - name: ControllerImage
        value: openebs/jiva:0.7.0-RC2
      - name: ReplicaImage
        value: openebs/jiva:0.7.0-RC2
      - name: VolumeMonitorImage
        value: openebs/m-exporter:0.7.0-RC2
      - name: ReplicaCount
        value: "1"
      - name: StoragePool
        value: default
      - name: FSType
        value: "xfs"
```

## Volume Monitoring Image Policy

You can specify the monitoring image policy for a particular volume using *value* for *VolumeMonitorImage* property. The following Kubernetes storage class sample uses the Volume Monitoring policy. By default, volume monitor is enabled.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-standard
  annotations:
    cas.openebs.io/config: |
      - name: VolumeMonitorImage
        value: openebs/m-exporter:0.7.0-RC2
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
