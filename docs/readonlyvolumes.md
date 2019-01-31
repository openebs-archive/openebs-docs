---
id: readonlyvolumes
title: Troubleshooting readonly volumes in OpenEBS
sidebar_label: ReadOnly Volumes
---

------

## Understanding ReadOnly volumes in OpenEBS

iSCSI is the connectivity link between application pod and OpenEBS controller pod. If this connection is broken for some reason, the filesystem on the application turns to ReadOnly (RO) mode and often the application pod can be found in CrashLoopBackOff state.

The reason for this disconnection between the application pod and controller pod can be many fold. Some of the common reasons are listed below.

- Network issues creep up and connectivity is lost
- The Node on which the controller pod is running is turned to NOT-READY mode and Kubernetes has not scheduled the controller pod to another node within 60 seconds
- The controller pod has crashed and not rescheduled by Kubernetes either on the same node or on different node.

The application pod logs typically confirm this situation with ReadOnly errors in it

```
chown: changing ownership of '/var/lib/mysql/mysql/ndb_binlog_index.MYI': Read-only file system
chown: changing ownership of '/var/lib/mysql/mysql/proc.MYD': Read-only file system
chown: changing ownership of '/var/lib/mysql/mysql': Read-only file system
chown: changing ownership of '/var/lib/mysql/': Read-only file system
```

## How to recover from ReadOnly state ?	

Ensure that all your replica pods are running on the same node where they were scheduled initially . Once verified, you can perform the recovery steps. More details on the recovery steps are provided [here](https://docs.openebs.io/docs/next/tsgpvs.html#workaround-recovery). 

If you have not pinned the replica volume to the k8s node where it was scheduled initially, the replicas could get scheduled onto a node where the data does not exist. In this case, you can backup and recover data using the steps mentioned [here](https://github.com/kmova/bootstrap/tree/master/gke-openebs/jiva-recovery).

## Fixes in 0.6 release related to ReadOnly volumes

0.6 release brings in a number of improvements to the ReadOnly scenarios. Some of the issue details are mentioned below.

- Fixed an issue where intermittent connectivity errors between controller and replica caused iSCSI initiator to mark the volume as read-only. [openebs/gotgt#15](https://github.com/openebs/gotgt/pull/15)
- Fixed an issue where intermittent connectivity errors were causing the controller to silently drop the replicas and mark the Volumes as read-only. The replicas dropped in this way were not getting re-added to the Controller. [openebs/jiva#45](https://github.com/openebs/jiva/pull/45)
- Fixed an issue where volume would be marked as read-only if one of the three replicas returned error to IO. [openebs/jiva#56](https://github.com/openebs/jiva/pull/56)
- Fixed an issue where replica fails to register back with controller if attempt to register occurred before the controller cleared the replica's previous state. [openebs/jiva#56](https://github.com/openebs/jiva/pull/56)
- Fixed an issue where a volume with single replica would get stuck in read-only state once the replica was restarted. [openebs/jiva#45](https://github.com/openebs/jiva/pull/45)

## Replica WO/RO behavior is changed in 0.6 release

0.6 release also brings in a new change in the way replicas are made available to the application when in degraded mode. In 0.5.4 or earlier, if minimum quorum disks are not available, the available replicas were marked write only (WO) and the volume will continue to be available in WO mode for the application pod. With Jiva volume rebuild design, this could result in data loss situation if the replica that is in WO mode is permanently lost for some reason. 

To avoid the data loss situation, this behavior is change in 0.6 release. Now, if the minimum number of replicas are not available for quorum, the current replicas are marked read only (RO). 

For example, consider a Jiva volume with three replicas: 

- Losing one replica will not affect the RW status of the volume, both the remaining replicas will continue to be in RW mode
- Losing second replica will mark the third replica as RO and the volume will also become RO



## What to look for in the Roadmap related to volume readonly issues?

Some issues are still in open state such as [openebs#1612](https://github.com/openebs/openebs/issues/1612) . Future releases such as 0.7 will have fixes to these issue which will reduces the conditions under which volumes can go into read only mode.

 

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
