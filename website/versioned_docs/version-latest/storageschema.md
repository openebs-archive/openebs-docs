---
id: version-latest-storageschema
title: OpenEBS storage schema
sidebar_label: Storage Schema
original_id: storageschema
---

------

`Note: Disk Object feature is available only from OpenEBS 0.6 release onwards`

OpenEBS introduces more elements into the storage configuration to give the administrator an end-to-end control and experience while managing the persistent storage on the Kubernetes cluster. Apart from the standard Kubernetes constructs of PVC, SC and PV, OpenEBS introduces Volume Pods, Storage Pools Claims , Storage Pools and Disk Objects. The stack of these constructs is shown below.



![OpenEBS storage schema](/docs/assets/storage-schema.png)

#### Disk Objects (DOs)

Disk Objects unify all the underlying disk types to a common Kubernetes construct. Disk objects are discovered, monitored and managed (sometimes provision and de-provision for example in network disks) using Node Disk Manager or NDM which runs as a daemonset on all the nodes in the Kubernetes cluster. NDM registers itself into Kubernetes Node Problem Detector for receiving any faults in the underlying disks as soon as they are observed. 

![OpenEBS Disk Objects](/docs/assets/do.png)

Sample CRD for a Disk Object is shown below. The CRD scope includes the SMART parameters of a disk.

```
apiVersion: openebs.io/v1
kind: Disk
metadata:
  name: disk-c9279540-a74a-49e2-833c-e46edd3db74c
  labels:
    "kubernetes.io/hostname": "gke-openebs-kmova-default-pool-044afcb8-lxh4"
spec:
  path: /dev/sdb
  capacity: 
    storage : 25G
  details:
    model: "PersistentDisk"
    serial: "disk-node-lxh4"
    vendor: "Google"
```



#### Storage Pools (SPs) and Storage Pool Claims (SPCs)

Kubernetes Operators / Administrators write the Storage Pool Claim in which the specification can be found around how to pool the disks on a given node.  The SPCs are fed into Maya-cStor-Operator, which creates the Storage Pool (SP) objects. SP defines the mapping of disks on each node for a given pool. 

The SP objects are again used by Node Disk Manager (NDM) to create actual pools inside the replica pod. 

![OpenEBS Storage Pools](/docs/assets/pool.png)



As shown above, the end result of an SPC is either a cStor pool or Jiva pool being created inside the replica pod. For creating the cStor pools inside the replica pod, the Kuberntes side-car pattern is used. 

#### Example of an SPC



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
