---
id: troubleshooting
title: Troubleshooting OpenEBS - Overview
sidebar_label: Overview
---
------

<font size="5">General guidelines for troubleshooting</font>

-	Search for similar issues mentioned in this page as well as the following troubleshooting sections.
	-	<a href="/v1110/docs/next/t-install.html" target="_blank">Troubleshooting Install</a>.
	-	<a href="/v1110/docs/next/t-uninstall.html" target="_blank">Troubleshooting Uninstall</a>.
	-	<a href="/v1110/docs/next/t-ndm.html" target="_blank">Troubleshooting NDM</a>.
	-	<a href="/v1110/docs/next/t-jiva.html" target="_blank">Troubleshooting Jiva</a>.
	-	<a href="/v1110/docs/next/t-cstor.html" target="_blank">Troubleshooting cStor</a>.
-	Contact <a href="/v1110/docs/next/support.html" target="_blank">OpenEBS Community</a> for support.
-	Search for similar issues on <a href="https://github.com/openebs/openebs/issues" target="_blank">OpenEBS GitHub repository</a>.
-	Search for any reported issues on <a href="https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>.

<br>
<hr>
<br>

## Kubernetes related

[Kubernetes node reboots because of increase in memory consumed by Kubelet](#node-reboot-when-kubelet-memory-increases)

[Application and OpenEBS pods terminate/restart under heavy I/O load](#Pods-restart-terminate-when-heavy-load)

<br>

## Others

[Nodes in the cluster reboots frequently almost everyday in openSUSE CaaS](#reboot-cluster-nodes)

<br>
<hr>
<br>


<font size="6" color="green">Kubernetes related</font>


<h3><a class="anchor" aria-hidden="true" id="node-reboot-when-kubelet-memory-increases"></a>Kubernetes node reboots because of increase in memory consumed by Kubelet</h3>


Sometime it is observed that iscsiadm is  continuously fails and repeats rapidly and for some reason this causes the memory consumption of kubelet to grow until the node goes out-of-memory and needs to be rebooted. Following type of error can be observed in journalctl and cstor-istgt container.


**journalctl logs**

```
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: failed to send SendTargets PDU
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: connection login retries (reopen_max) 5 exceeded
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: Connection to Discovery Address 10.233.46.76 failed
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: failed to send SendTargets PDU
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: connection login retries (reopen_max) 5 exceeded
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: Connection to Discovery Address 10.233.46.76 failed
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: failed to send SendTargets PDU
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: connection login retries (reopen_max) 5 exceeded
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: Connection to Discovery Address 10.233.46.76 failed
Feb 06 06:11:38 <hostname> kubelet[1063]: iscsiadm: failed to send SendTargets PDU
```

**cstor-istgt container logs**

```
2019-02-05/15:43:30.250 worker            :6088: c#0.140005771040512.: iscsi_read_pdu() EOF

2019-02-05/15:43:30.250 sender            :5852: s#0.140005666154240.: sender loop ended (0:14:43084)

2019-02-05/15:43:30.251 worker            :6292: c#0.140005771040512.: worker 0/-1/43084 end (c#0.140005771040512/s#0.140005666154240)
2019-02-05/15:43:30.264 worker            :5885: c#1.140005666154240.: con:1/16 [8d614b93:43088->10.233.45.100:3260,1]
2019-02-05/15:43:30.531 istgt_iscsi_op_log:1923: c#1.140005666154240.: login failed, target not ready

2019-02-05/15:43:30.782 worker            :6088: c#1.140005666154240.: iscsi_read_pdu() EOF

2019-02-05/15:43:30.782 sender            :5852: s#1.140005649413888.: sender loop ended (1:16:43088)

2019-02-05/15:43:30.783 worker            :6292: c#1.140005666154240.: worker 1/-1/43088 end (c#1.140005666154240/s#1.140005649413888)
2019-02-05/15:43:33.285 worker            :5885: c#2.140005649413888.: con:2/18 [8d614b93:43092->10.233.45.100:3260,1]
2019-02-05/15:43:33.536 istgt_iscsi_op_log:1923: c#2.140005649413888.: login failed, target not ready

2019-02-05/15:43:33.787 worker            :6088: c#2.140005649413888.: iscsi_read_pdu() EOF

2019-02-05/15:43:33.787 sender            :5852: s#2.140005632636672.: sender loop ended (2:18:43092)

2019-02-05/15:43:33.788 worker            :6292: c#2.140005649413888.: worker 2/-1/43092 end (c#2.140005649413888/s#2.140005632636672)
2019-02-05/15:43:35.251 istgt_remove_conn :7039: c#0.140005771040512.: remove_conn->initiator:147.75.97.141(iqn.2019-02.net.packet:device.7c8ad781) Target: 10.233.109.82(dummy LU0) conn:0x7f55a4c18000:0 tsih:1 connections:0  IOPending=0
2019-02-05/15:43:36.291 worker            :5885: c#0.140005666154240.: con:0/14 [8d614b93:43094->10.233.45.100:3260,1]
2019-02-05/15:43:36.540 istgt_iscsi_op_log:1923: c#0.140005666154240.: login failed, target not ready
```

**Troubleshooting**

The cause of high memory consumption of kubelet is mainly due to the following.

There are 3 modules are involved - cstor-isgt, kubelet and iscsiInitiator(iscsiadm). kubelet runs iscsiadm command to do discovery on cstor-istgt. If there is any delay in receiving response of discovery opcode (either due to network or delay in processing on target side), iscsiadm retries few times, and, gets into infinite loop dumping error messages as below:

    iscsiadm: Connection to Discovery Address 127.0.0.1 failed
    iscsiadm: failed to send SendTargets PDU
    iscsiadm: connection login retries (reopen_max) 5 exceeded
    iscsiadm: Connection to Discovery Address 127.0.0.1 failed
    iscsiadm: failed to send SendTargets PDU
kubelet keeps taking this response and accumulates the memory. More details can be seen [here](https://github.com/openebs/openebs/issues/2382).

**Workaround**

Restart the corresponding istgt pod to avoid memory consumption.



<h3><a class="anchor" aria-hidden="true" id="Pods-restart-terminate-when-heavy-load"></a>Application and OpenEBS pods terminate/restart under heavy I/O load</h3>


This is caused due to lack of resources on the Kubernetes nodes, which causes the pods to evict under loaded conditions as the node becomes *unresponsive*. The pods transition from *Running* state to *unknown* state followed by *Terminating* before restarting again.

**Troubleshooting**

The above cause can be confirmed from the `kubectl describe pod` which displays the termination reason as *NodeControllerEviction*. You can get more information from the kube-controller-manager.log on the Kubernetes master.

**Workaround:**

You can resolve this issue by upgrading the Kubernetes cluster infrastructure resources (Memory, CPU).



<hr>
<br>
<font size="6" color="orange">Others</font>


<h3><a class="anchor" aria-hidden="true" id="reboot-cluster-nodes"></a>Nodes in the cluster reboots frequently almost everyday in openSUSE CaaS</h3>


Setup the cluster using RKE with openSUSE CaaS MicroOS using CNI Plugin Cilium. Install OpenEBS, create a PVC and allocate to a fio job/ busybox. Run FIO test on the same. Observed nodes in the cluster getting restarted on a schedule basis.

**Troubleshooting**

Check journalctl logs of each nodes and check if similar logs are observed. In the following log snippets, showing the corresponding logs of 3 nodes.

Node1:

```
Apr 12 00:21:01 mos2 transactional-update[7302]: /.snapshots/8/snapshot/root/.bash_history
Apr 12 00:21:01 mos2 transactional-update[7302]: /.snapshots/8/snapshot/var/run/reboot-needed
Apr 12 00:21:01 mos2 transactional-update[7302]: transactional-update finished - rebooting machine
Apr 12 00:21:01 mos2 systemd-logind[1045]: System is rebooting.
Apr 12 00:21:01 mos2 systemd[1]: transactional-update.service: Succeeded.
Apr 12 00:21:01 mos2 systemd[1]: Stopped Update the system.
```

Node2: 

```
01:44:19 mos3 transactional-update[17442]: other mounts and will not be visible to the system:
Apr 12 01:44:19 mos3 transactional-update[17442]: /.snapshots/8/snapshot/root/.bash_history
Apr 12 01:44:19 mos3 transactional-update[17442]: /.snapshots/8/snapshot/var/run/reboot-needed
Apr 12 01:44:19 mos3 transactional-update[17442]: transactional-update finished - rebooting machine
Apr 12 01:44:20 mos3 systemd-logind[1056]: System is rebooting.
Apr 12 01:44:20 mos3 systemd[1]: transactional-update.service: Succeeded.
Apr 12 01:44:20 mos3 systemd[1]: Stopped Update the system.
```

Node3:

```
Apr 12 03:00:13 mos4 systemd[1]: snapper-timeline.service: Succeeded.
Apr 12 03:30:00 mos4 rebootmgrd[1612]: rebootmgr: reboot triggered now!
Apr 12 03:30:00 mos4 systemd[1]: rebootmgr.service: Succeeded.
Apr 12 03:30:00 mos4 systemd-logind[1064]: System is rebooting.
Apr 12 03:30:00 mos4 systemd[1]: Stopping open-vm-tools: vmtoolsd service for virtual machines hosted on VMware...
Apr 12 03:30:00 mos4 systemd[1]: Stopped target Timers.
Apr 12 03:30:00 mos4 systemd[1]: btrfs-scrub.timer: Succeeded.
Apr 12 03:30:00 mos4 systemd[1]: Stopped Scrub btrfs filesystem, verify block checksums.
Apr 12 03:30:00 mos4 systemd[1]: transactional-update.timer: Succeeded.
```

You can get more details to see if the cause of reboot is due to transactional update using below command outputs.

```
systemctl status rebootmgr
systemctl status transactional-update.timer
cat /etc/rebootmgr.conf
cat /usr/lib/systemd/system/transactional-update.timer
cat /usr/etc/transactional-update.conf
```

**Workaround:**

There are 2 possible solutions.

Approach1:

DO the following on each nodes to stop the transactional update.

```
systemctl disable --now rebootmgr.service
systemctl disable --now transactional-update.timer
```

This is the preferred approach.

Approach2:

Set the reboot timer schedule at different time i.e staggered at various interval of the day, so that only one nodes get rebooted at a time. 

<br>
<hr>
<br>

## See Also:

### [Troubleshooting Install](/v1110/docs/next/t-install.html)

### [Troubleshooting Uninstall](/v1110/docs/next/t-uninstall.html) 

### [Troubleshooting NDM](/v1110/docs/next/t-ndm.html)

### [Troubleshooting Jiva](/v1110/docs/next/t-jiva.html)

### [Troubleshooting cStor](/v1110/docs/next/t-cstor.html)

### [FAQs](/v1110/docs/next/faq.html)

### [Seek support or help](/v1110/docs/next/support.html)

### [Latest release notes](/v1110/docs/next/releases.html)

<br>
<hr>
<br>

