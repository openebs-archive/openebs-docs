---
id: localpv
title: OpenEBS LocalPV
sidebar_label: Local PV
---
------



## Overview

OpenEBS Local PV is a CAS engine that can create persistent volumes using either local disks or host paths on the worker nodes. With this CAS engine, the performance will be equivalent to local disk or the file system (host path) on which the volumes are created. Many cloud native applications may not require advanced storage features like replication, snapshots and clones as they themselves can handles those. Such applications require access to managed disks as persistent volumes. 



## Benefits of OpenEBS Local PVs

OpenEBS Local PVs are analogous to Kubernetes LocalPV. In addition, OpenEBS LocalPVs have the following benefits.

- Local PVs are provisioned dynamically by OpenEBS Local PV provisioner.  When the Local PV is provisioned with the default StorageClass with storage-type as :
  -  `hostpath`, the default `BasePath` is created dynamically on the node and mapped to the Local PV. 
  -  `device`,  one of the  matching BlockDevice on the node is claimed and mapped to the Local PV.
- BlockDevice for Local PVs are managed by OpenEBS NDM. Disk IO metrics of managed devices can also be obtained with help of NDM.
- Provisioning of Local PVs is done through the Kubernetes standards. Admin users create storage class to enforce the storage type (device or hostpath) and put additional control through RBAC policies.
- By specifying the node selector in the application spec YAML , the application pods can be scheduled on specific nodes. After scheduling the application pod, OpenEBS Local PV will be deployed on the same node. It guarantees that the pod is always rescheduled on the same node to retain access to the data all the time.



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

Kubelet will format the block device with the filesystem specified in the StorageClass and then provision the Local PV.  Currently supported filesystems are`ext4` and `xfs`. If no `FSType` is specified, by default Kubelet will format the BlockDevice as `ext4` .

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

<br><hr><br>

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
   gtag('config', 'UA-92076314-12', { 'anonymize_ip': true });
</script>
