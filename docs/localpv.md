---
id: localpv
title: OpenEBS Local PV Device User Guide
sidebar_label: Local PV Device
---
------

<br>

This guide will help you to set up and use OpenEBS Local Persistent Volumes backed by Block Devices.

*OpenEBS Dynamic Local PV provisioner* can create Kubernetes Local Persistent Volumes using block devices available on the node to persist data, hereafter referred to as *OpenEBS Local PV Device* volumes. 

*OpenEBS Local PV Device* volumes have the following advantages compared to native Kubernetes Local Peristent Volumes. 
- Dynamic Volume provisioner as opposed to a Static Provisioner. 
- Better management of the Block Devices used for creating Local PVs by OpenEBS NDM. NDM provides capabilities like discovering Block Device properties, setting up Device Pools/Filters, metrics collection and ability to detect if the Block Devices have moved across nodes. 

OpenEBS Local PV uses volume topology aware pod scheduling enhancements introduced by [Kubernetes Local Volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local)

<br>

:::tip QUICKSTART

OpenEBS Local PV Device volumes will be created using the Block Devices available on the node. You can customize which block devices can be used for creating Local PVs by [configuring NDM parameters](#install) and/or by creating new [StorageClass](#create-storageclass). 

If you have OpenEBS already installed, you can create an example pod that persists data to *OpenEBS Local PV Device* with following kubectl commands. 
```
kubectl apply -f https://openebs.github.io/charts/examples/local-device/local-device-pvc.yaml
kubectl apply -f https://openebs.github.io/charts/examples/local-device/local-device-pod.yaml
```

Verify using below kubectl commands that example pod is running and is using a OpenEBS Local PV Device.
```
kubectl get pod hello-local-device-pod
kubectl get pvc local-device-pvc
```

For a more detailed walkthrough of the setup, follow along the rest of this document.
:::

## Minimum Versions

- Kubernetes 1.12 or higher is required
- OpenEBS 1.0 or higher is required.


## How to use OpenEBS Local PVs

OpenEBS create two Storage Classes of Local PVs by default as `openebs-hostpath` and `openebs-device`. For simple provisioning of OpenEBS Local PV, these default Storage Classes can be used. More details can be found  [here](/docs/next/uglocalpv.html).   

End users or developers will provision the OpenEBS Local PVs like any other PV, by creating a PVC using a StorageClass provided by the admin user. The StorageClass has `volumeBindingMode: WaitForFirstConsumer` which means delay volume binding until application pod is scheduled on the node.

<h4><a class="anchor" aria-hidden="true" id="openebs-localpv-device"></a>OpenEBS Local PV based on device</h4>

Admin user can create a customized StorageClass using the following sample configuration.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-device
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: StorageType
        value: "device"
      - name: FSType
        value: ext4
provisioner: openebs.io/local
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

When a PVC is created using the above StorageClass, OpenEBS Local PV Provisioner uses NDM operator to  claim a matching BlockDevice from the worker node where the application pod is scheduled. 

The Local PV volume will be provisioned with `volumeMode` as `filesystem` by default. Kubelet will format the block device with the filesystem specified as `FSType` under `cas.openebs.io/config` to the path `metadata.annotations` in the StorageClass while provisioning the Local PV.  Currently supported filesystems are `ext4` and `xfs`. If no `FSType` is specified, by default Kubelet will format the BlockDevice as `ext4`.

From OpenEBS 1.5, Local PV volume has Raw Block Volume support. The Raw Block Volume support can be added to the path `spec.volumeMode` as `Block` in the Persistent Volume spec. The sample YAML spec of PVC to provision Local PV on Raw Block volume can be found [here](/docs/next/uglocalpv.html#Provision-OpenEBS-Local-PV-based-on-Device).

For provisioning Local PV using the BlockDevice attached to the nodes, the BlockDevice should be in one of the following states:

- User has attached the BlockDevice, formatted and mounted them. This means, the BlockDevice is already formatted and is mounted on the worker node.

  - For Example: Local SSD in GKE.

- User has attached the BlockDevice, un-formatted and not mounted. This means, the BlockDevice is attached on the worker node without any file system.

  - For Example: GPD in GKE.

- User has attached the block device, but device has only device path and no dev links.

  - For Example: VM with VMDK disks or AWS node with EBS.


<h4><a class="anchor" aria-hidden="true" id="openebs-localpv-hostpath"></a>OpenEBS Local PV based on hostpath</h4>

Admin user creates a customized StorageClass using the following sample configuration.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-hostpath
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: BasePath
        value: "/var/openebs/local"
      - name: StorageType
        value: "hostpath"
provisioner: openebs.io/local
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

When a PVC is created using the above StorageClass, OpenEBS Local PV  provisioner will create a new sub directory inside the `BasePath` and maps it to the PV.

**Note:** If default `Basepath` needs to be changed by mentioning different hostpath, then the specified hostpath(directory) must be present of the Node.  



## When to use OpenEBS Local PVs

- High performance is needed by those applications which manage their own replication, data protection and other features such as snapshots and clones.
- When local disks need to be managed dynamically and monitored for impending notice of them going bad.



## When not to use OpenEBS Local PVs

- When applications expect replication from storage.

- When the volume size may need to be changed dynamically but the underlying disk is not resizable. 

  

## Limitations (or Roadmap items ) of OpenEBS Local PVs

- Size of the Local PV cannot be increased dynamically. LVM type of functionality inside Local PVs is a potential feature in roadmap.
- Disk quotas are not enforced by Local PV. An underlying device or hostpath can have more data than requested by a PVC or storage class. Enforcing the capacity is a roadmap feature.
- Enforce capacity and PVC resource quotas on the local disks or host paths.
- SMART statistics of the managed disks is also a potential feature in roadmap.

<br>

<hr>
<br>

## See Also:

### [OpenEBS Architecture](/docs/next/architecture.html)

### [Understanding NDM](/docs/next/ndm.html)

### [Local PV User Guide](/docs/next/uglocalpv.html)

<br>

<hr>

<br>

