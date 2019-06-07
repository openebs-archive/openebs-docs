---
id: localpv
title: OpenEBS LocalPV
sidebar_label: Local PV
---
------



## Overview

OpenEBS Local PV is a CAS engine that can create persistent volumes or PVs out of local disks or host paths on the worker nodes. With this CAS engine, the performance will be equivalent of either the local disk or the file system (host path) on which the volumes are created. Many cloud native applications may not require advanced storage features like replication or snapshots or clones as they themselves provide these features. Such applications require access to a managed disks as persistent volumes. 



## Benefits of OpenEBS Local PVs

OpenEBS LocalPVs are analogous to Kubernetes LocalPV. In addition, OpenEBS LocalPVs have the following benefits.

- LocalPVs are selected or provisioned dynamically. When the Local PV is of type "host path", the host path is created dynamically and mapped to the LoalPV. When the Local PV is fo type "device", one of the  matching disks on the node is reserved and mapped to the LocalPV.
- Enforce capacity and PVC resource quotas on the local disks or host paths. 
- Disks for LocalPVs are managed by OpenEBS. Disk IO metrics, SMART statistics and auto deletion of data when a disk is released from a LocalPV are some of the advantages of managed disks.
- Provisioning of LocalPVs is done through the Kubernetes standards. Admin users create storage class to enforce the storage type (disk or host path) and put additional control through RBAC policies.
- Pods are scheduled on the same node always. By specifying the node selector, the pods are pinned using OpenEBS LocalPV. It guarantees that the pod is rescheduled on the  same node to retain the access to data all the time.



## When to use OpenEBS Local PVs

- High performance is needed by those applications which manage their own replication, data protection and other features such as snapshots and clones.
- When local disks need to be managed dynamically and monitored for impending notice of them going bad.



## When not to use OpenEBS Local PVs

- When appilications expect replication from storage

- When the volume size may need to be changed dynamically but the underlying disk is not resizable. Some local PVs can be resized such as cloud disks

  

## Limitations (and Roadmap items ) OpenEBS Local PVs

- In OpenEBS 1.0 RC1, the data on the disk or host path is not erased when a Local PV is deleted
- Size of the LocalPV cannot be increased dynamically. LVM type of functionality inside Local PVs is a potential feature for roadmap
- Disk quotas are not enforced by Local PV. An underlying disk or hostpath can have more data than requested by a PVC or storage class. Enforcing the capacity is a roadmap feature.

<br>

<hr>
<br>

## See Also:

### [OpenEBS Architecture](/docs/next/architecture.html)

### [NDM](/docs/next/ndm.html)

### [cStor ](/docs/next/cstor.html)

<br>

<hr>

<br>



See A

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
