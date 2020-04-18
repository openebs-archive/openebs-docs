---
id: k8supgrades
title: Best practices to follow when upgrading Kubernetes
sidebar_label: Kubernetes upgrades
---
------

There are few reasons why nodes in a Kubernetes cluster get  rebooted

- Kubernetes upgrades do need to happen to new features that roll out and to get minimum requirements satisfied for the applications upgrade running on Kubernetes. The upgrade process of Kubernetes cluster involves upgrading the nodes one by one. This process may involve rebooting of the nodes of the cluster.
- Kubernetes nodes go through hardware changes



### Volume replica quorum requirement

In either case, when the nodes are rebooted, the OpenEBS volume targets lose access to the replicas hosted on that node. OpenEBS volume replicas need to be in quorum for the volume to be online. When a Kubernetes node is rebooted, and the node comes back online, the rebuilding process of the volume replicas may take few minutes. If the other node is rebooted before the volume replicas are completely rebuilt, the volume replicas may loose quorum and the corresponding volumes may be marked read-only, which results in the unavailability of data to the application.



It is recommended that before a Kubernetes node is rebooted, make sure all the replicas of all OpenEBS volumes are healthy/online and there is no rebuild process is ongoing.



<br>

## See Also:

### [Seeking help](/docs/next/support.html)

<br>

<hr>

<br>

