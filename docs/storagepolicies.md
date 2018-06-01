---
id: storagepolicies
title: OpenEBS Storage Policies
sidebar_label: Storage Policies
---

<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  Documentation for OpenEBS v0.5 is no longer actively maintained. The version you are currently viewing is a static snapshot. Click here for the [latest](https://docs.openebs.io) version.
</strong></p></center>

------



## Overview

This section explains storage policies, that every DevOps team can create and apply to their own storage systems. You can now define policies based on the type of application at the StorageClass (a Kubernetes Kind) level. This page explains when to add a storage policy to your OpenEBS cluster and how to use the same.

A storage policy states the desired behavior of an OpenEBS volume. For example, a set of storage policies can be set in a StorageClass that in turn will be referred to during OpenEBS volume provisioning.

Storage policies can be created, updated, and deleted in a running OpenEBS cluster through corresponding operations on StorageClass. Cluster administrators can update storage policies independent of the cluster. Once a storage policy is installed, users can create and access it’s objects with kubectl commands on StorageClass.

## Should I Add a Custom Storage Policy to my OpenEBS Cluster?

Storage policies are meant to be created per team, workload, storage controller, and so on that fits your requirement. Since OpenEBS storage controllers (i.e. jiva or cStor) run from within a container, a custom storage policy can be created and set against a particular storage controller instance that meets the demands of the application (which consumes the storage exposed from the storage controller instance). You can now define policies based on the type of application at the storageclass level. Following are some of the properties that can be customized at the default level in the *openebs-storageclasses.yaml* file.

## Types of Storage Policies

OpenEBS supports several types of Storage Policies such as the following:

- openebs.io/jiva-replica-count
- openebs.io/jiva-replica-image
- openebs.io/jiva-controller-image
- openebs.io/storage-pool
- openebs.io/volume-monitor

## Replica Count Policy

You can specify the jiva replica count using the *openebs.io/jiva-replica-count* property. In the following example, the jiva-replica-count is specified as 1. Hence, a single replica is created.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: openebs-standalone
provisioner: openebs.io/provisioner-iscsi
parameters:
    openebs.io/jiva-replica-count: "1"

```

## Replica Image Policy

You can specify the jiva replica image using the *openebs.io/jiva-replica-image* property.

**Note:**

Jiva replica image is a docker image.

Following is a sample intent that makes use of replica image policy.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: mysql
provisioner: openebs.io/provisioner-iscsi
parameters:
    openebs.io/jiva-replica-count: "1"
    openebs.io/capacity: "1G"
    openebs.io/jiva-replica-image: "openebs/jiva:0.5.0"

```

## Controller Image Policy

You can specify the jiva controller image using the *openebs.io/jiva-controller-image* property.

**Note:**

Jiva controller image is a docker image.

Following is a sample setting.

```
kind: StorageClass
metadata:
    name: mysql
provisioner: openebs.io/provisioner-iscsi
parameters:
    openebs.io/jiva-replica-count: "1"
    openebs.io/capacity: "1G"
    openebs.io/jiva-controller-image: "openebs/jiva:0.5.0"

```

## Storage Pool Policy

A storage pool provides a persistent path for an OpenEBS volume. It can be a directory on any of the following.

- host-os or
- mounted disk

**Note:**

You must define the storage pool as a Kubernetes Custom Resource (CR) before using it as a Storage Pool policy.

Following is a sample Kubernetes custom resource definition for a storage pool.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePool
metadata:
    name: sp-mntdir
    type: hostdir
spec:
    path: "/mnt/openebs"

```

This storage pool custom resource can now be used as follows:

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: openebs-percona
provisioner: openebs.io/provisioner-iscsi
parameters:
    openebs.io/jiva-replica-count: "2"
    openebs.io/capacity: "2G"
    openebs.io/jiva-replica-image: "openebs/jiva:0.5.0"
    openebs.io/storage-pool: "sp-mntdir"

```

## Storage Class Policy 

You can specify storage class policy.  Here you can mention specify the capacity, file system type.

By default OpenEBS comes with ext4 file system. However if the user wants to use xfs file system he can do that.

Following is a sample setting.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
   name: openebs-mongodb
provisioner: openebs.io/provisioner-iscsi
parameters:
  openebs.io/storage-pool: "test-mntdir"
  openebs.io/jiva-replica-count: "1"
  openebs.io/volume-monitor: "true"
  openebs.io/capacity: 5G
  openebs.io/fstype: "xfs"
```

## Volume Monitoring Policy

You can specify the monitoring policy for a particular volume using *openebs.io/volume-monitor* property.

The following Kubernetes storage class sample uses the Volume Monitoring policy.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: sc-percona-monitor
provisioner: openebs.io/provisioner-iscsi
parameters:
    openebs.io/jiva-replica-image: "openebs/jiva:0.5.0"
    openebs.io/volume-monitor: "true"
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
