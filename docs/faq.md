---
id: faq
title: OpenEBS FAQ
sidebar_label: FAQs
---

------

<br>



<font size="6" id="general">General</font>

[What is most distinctive about the OpenEBS architecture?](/docs/next/faq.html#what-is-most-distinctive-about-the-openebs-architecture)

[Why did you choose iSCSI? Does it introduce latency and decrease performance? ](/docs/next/faq.html#why-did-you-choose-iscsi-does-it-introduce-latency-and-decrease-performance)

[Where is my data stored and how can I see that?](/docs/next/faq.html#where-is-my-data-stored-and-how-can-i-see-that)

[What changes are needed for Kubernetes or other subsystems to leverage OpenEBS?](/docs/next/faq.html#what-changes-are-needed-for-kubernetes-or-other-subsystems-to-leverage-openebs)

[How do you get started and what is the typical trial deployment?](/docs/next/faq.html#how-do-you-get-started-and-what-is-the-typical-trial-deployment)

[What are the most common use case and most common workloads?](/docs/next/faq.html#what-are-the-most-common-use-case-and-most-common-workloads)

[What is the default OpenEBS Reclaim policy?](/docs/next/faq.html#what-is-the-default-openebs-reclaim-policy)



<font size="6">Data Protection</font>

[How is data protected? What happens when a host, client workload, or a data center fails?](/docs/next/faq.html#how-is-data-protected-what-happens-when-a-host-client-workload-or-a-data-center-fails)

[How does OpenEBS provide high availability for stateful workloads?](/docs/next/faq.html#how-does-openebs-provide-high-availability-for-stateful-workloads)

<font size="6">Miscellaneous</font>

[What changes must be made to the containers on which OpenEBS runs?](/docs/next/faq.html#what-changes-must-be-made-to-the-containers-on-which-openebs-runs)

[What are the minimum requirements and supported container orchestrators?](/docs/next/faq.html#what-are-the-minimum-requirements-and-supported-container-orchestrators)

[Why would you use OpenEBS on EBS?](/docs/next/faq.html#why-would-you-use-openebs-on-ebs)

[Can I use the same PVC for multiple Pods?](/docs/next/faq.html#can-i-use-the-same-pvc-for-multiple-pods)

[Warning Messages while Launching PVC](/docs/next/faq.html#warning-messages-while-launching-pvc)

[Why *OpenEBS_logical_size* and *OpenEBS_actual_used* are showing in different size?](/docs/next/faq.html#why-openebs-logical-size-and-openebs-actual-used-are-showing-in-different-size)

[What must be the disk mount status on Node for provisioning OpenEBS volume?](/docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume)

[How OpenEBS detects disks for creating cStor Pool?](/docs/next/faq.html#how-openebs-detects-disks-for-creating-cstor-pool)

[Can I provision OpenEBS volume if the request in PVC is more than the available physical capacity of the pools in the Storage Nodes?](#provision-pvc-higher-than-physical-sapce)

[What is the difference between cStor Pool creation using manual method and auto method?](/docs/next/faq.html#what-is-the-difference-between-cstor-pool-creation-using-manual-method-and-auto-method)

[How the data is distributed when cStor maxPools count is 3 and replicaCount as 2 in StorageClass?](/docs/next/faq.html#how-the-data-is-distributed-when-cstor-maxpools-count-is-3-and-replicacount-as-2-in-storageclass)

[How to setup default PodSecurityPolicy to allow the OpenEBS pods to work with all permissions?](/docs/next/faq.html#how-to-setup-default-podsecuritypolicy-to-allow-the-openebs-pods-to-work-with-all-permissions)

[How to create a cStor volume on single cStor disk pool?](#create-cstor-volume-single-disk-pool)

[How can I create cStor pool on newly added with same SPC?](#cstor-pool-new-node-same-spc)

[How to get the details of cStor Pool,cStor Volume Replica ,Cstor Volumes and Disks ?](#more-info-pool-cvr-cv-disk) 



<br><br>

<hr>

<font size="6" color="blue">General</font>

<hr>

### What is most distinctive about the OpenEBS architecture?

The OpenEBS architecture is an example of Container Attached Storage (CAS). These approaches containerize the storage controller, called IO controllers, and underlying storage targets, called “replicas”, allowing an orchestrator such as Kubernetes to automate the management of storage. Benefits include automation of management, a delegation of responsibility to developer teams, and the granularity of the storage policies which in turn can improve performance.

<a href="#top">Go to top</a>



### Why did you choose iSCSI? Does it introduce latency and decrease performance? 

We at OpenEBS strive to make OpenEBS simple to use using Kubernetes as much as possible to manage OpenEBS itself. iSCSI allows you to be more resilient in cases where the workload and the controller are not on the same host. In other words, the OpenEBS user or architect will not suffer an outage when the storage IO controller is not scheduled locally to the workload in need of storage. OpenEBS does a variety of things to improve performance elsewhere in the stack. More is to come via the cStor storage engine in order to have this level of flexibility.

<a href="#top">Go to top</a>



### Where is my data stored and how can I see that?

OpenEBS stores data in a configurable number of replicas. These are placed to maximize resiliency. For example, they are placed in different racks or availability zones.

To determine exactly where your data is physically stored, you can run the following kubectl commands.

- Run `kubectl get pvc` to fetch the volume name. The volume name looks like: *pvc-ee171da3-07d5-11e8-a5be-42010a8001be*.
- For each volume, you will notice one IO controller pod and one or more replicas (as per the storage class configuration). For the above PVC, run the following command to get the IO controller and replica pods. 

```
kubectl get pods --all-namespaces | grep pvc-ee171da3-07d5-11e8-a5be-42010a8001be
```

  The output displays the following pods.

```
 IO Controller: pvc-ee171da3-07d5-11e8-a5be-42010a8001be-ctrl-6798475d8c-7dcqd
 Replica 1: pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-hls6s     
 Replica 2: pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-tr28f  
```

- To check the location where the data is stored, get the details of the replica pod. For getting the details of Replica 1 above, use the `kubectl get pod -o yaml pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-hls6s` command. Check the volumes section.

```
volumes:
  - hostPath:
      path: /var/openebs/pvc-ee171da3-07d5-11e8-a5be-42010a8001be
      type: ""
    name: openebs
```

<a href="#top">Go to top</a>



### What changes are needed for Kubernetes or other subsystems to leverage OpenEBS?

One of the major differences of OpenEBS versus other similar approaches is that no changes are required to run OpenEBS on Kubernetes. However, OpenEBS itself is a workload and the easy management of it is crucial especially as the Container Attached Storage (CAS) approach entails putting containers that are IO controller and replica controllers.

You can access the OpenEBS IO controller via iSCSI, exposed as a service. The nodes require iSCSI initiator to be installed. In case the kubelet is running in a container for example, as in the case of Rancher and so on, the iSCSI initiator should be installed within the kubelet container.

<a href="#top">Go to top</a>





### How do you get started and what is the typical trial deployment?

If you have a Kubernetes environment, you can deploy OpenEBS using the following command.

`kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml`

You can then begin running a workload against OpenEBS. There is a large and growing number of workload that have storage classes that use OpenEBS. You need not use these specific storage classes. However, they may be helpful as they save time and allow for per workload customization. You can join the Slack channel at  https://openebs-community.slack.com.

Register at MayaOnline.io to receive free monitoring and a single view of stateful workloads of your Kubernetes environment. MayaOnline incorporates customized versions of Prometheus for monitoring, Grafana for metrics visualization and Scope to see the overall environment, and our MuleBot for ChatOps integration and more.  

<a href="#top">Go to top</a>



### What are the most common use case and most common workloads?

Any stateful workload running on KuberWhat is most distinctive about the OpenEBS architecture?

The OpenEBS architecture is an example of Container Attached Storage (CAS). These approaches containerize the storage controller, called IO controllers, and underlying storage targets, called “replicas”, allowing an orchestrator such as Kubernetes to automate the management of storage. Benefits include automation of management, delegation of responsibility to developer teams, and the granularity of the storage policies which in turn can improve performance.

<a href="#top">Go to top</a>



### What is the default OpenEBS Reclaim policy?

The default retention is the same used by K8s. For dynamically provisioned PersistentVolumes, the default reclaim policy is “Delete”. This means that a dynamically provisioned volume is automatically deleted when a user deletes the corresponding PersistentVolumeClaim. In case of cStor volumes, data was being deleted as well. For jiva, from 0.8.0 version, the data is deleted via scrub jobs.

<a href="#top">Go to top</a>







<font size="6" color="orange">Data Protection</font>

<hr>



### How is data protected? What happens when a host, client workload, or a data center fails?

Kubernetes provides many ways to enable resilience. OpenEBS leverages these wherever possible.  For example, say the IO container that has the iSCSI target fails. Well, it is spun back up by Kubernetes. The same applies to the underlying replica containers, where the data is actually stored. They are spun back up by Kubernetes. Now, the point of replicas is to ensure that when one or more of these replicas are being respun and then repopulated in the background by OpenEBS, the client applications still run.  OpenEBS takes a simple approach to ensuring that multiple replicas can be accessed by an IO controller using a configurable quorum or the minimum number of replica requirements. In addition, our new cStor checks for silent data corruption and in some cases can fix it in the background.  Silent data corruption, unfortunately, can occur from poorly engineered hardware and from other underlying conditions including those that your cloud provider is unlikely to report or identify.  

<a href="#top">Go to top</a>



### How does OpenEBS provide high availability for stateful workloads?

An OpenEBS Jiva volume is a controller deployed during OpenEBS installation. Volume replicas are defined by the parameter that you set. The controller is an iSCSI target while the replicas play the role of a disk. The controller exposes the iSCSI target while the actual data is written. The controller and each replica run inside a dedicated container. An OpenEBS Jiva volume controller exists as a single instance, but there can be multiple instances of OpenEBS Jiva volume replicas. Persistent data is synchronized between replicas. OpenEBS Jiva volume high availability is based on various scenarios as explained in the following sections. 

**Note:** Each replica is scheduled in a unique K8s node, and a K8s node never has two replicas of one OpenEBS volume.

- **What happens when an OpenEBS volume controller pod crashes?**

  Kubernetes automatically re-schedules the controller as a new Kubernetes pod. Policies are in place that ensures faster rescheduling.

- **What happens when a K8s node that hosts OpenEBS volume controller goes offline?**

  The controller is automatically re-scheduled as a new Kubernetes pod. Policies are in place that ensures faster rescheduling. If the Kubernetes node is unavailable, the controller gets scheduled on one of the available nodes.

- **What happens when an OpenEBS volume replica pod crashes?** 

  The replica is automatically rescheduled as a new Kubernetes pod when an OpenEBS volume replica pod crashes for reasons other than node not-ready and node unreachable. The replica may or may not be rescheduled on the same K8s node. There is data loss with this newly scheduled replica if it gets rescheduled on a different K8s node.

- **What happens when a K8s node that hosts OpenEBS volume replica goes offline?**

  There is no storage downtime as the other available replica displays inputs/outputs. Policies are in place that does not allow rescheduling of crashed replica (as the replica is tied to a node’s resources) on any other node.

<a href="#top">Go to top</a>



<font size="6" color="red">Miscellaneous</font>

<hr>

### What changes must be made to the containers on which OpenEBS runs?

OpenEBS has been engineered so that it does not require any changes to the containers on which it runs. Similarly, Kubernetes itself does not require to be altered and no additional external orchestrator is required. However, the workloads that need storage must be running on hosts that have iSCSI initiators, which is a default configuration in almost all operating systems.

<a href="#top">Go to top</a>





### What are the minimum requirements and supported container orchestrators?

OpenEBS is currently tightly integrated into Kubernetes. Support for Docker Swarm is something OpenEBS is looking at in future releases.

The system requirements depend on the number of volumes being provisioned and can horizontally scale with the number of nodes in the Kubernetes cluster. The OpenEBS control plane comprises of minimum two pods i.e. apiserver and dynamic provisioner. You can run these using 2GB RAM and 2 CPUs.

Each volume will spin up IO controller and replica pods. Each of these will require 1GB RAM and 0.5 CPU by default.

For enabling high availability, OpenEBS recommends having a minimum of 3 nodes in the Kubernetes cluster.

<a href="#top">Go to top</a>



### Why would you use OpenEBS on EBS?

There are at least four common reasons for running OpenEBS on Amazon EBS that are listed as follows:

Attach / Detach: The attach / detach process can slow the environment operations dependent on EBS.

No volume management needed: OpenEBS removes the need for volume management, enabling the combination of multiple underlying EBS volumes without the user needing to run LVM or other volume manager. This saves time and reduces operational complexity.

Expansion and inclusion of NVMe: OpenEBS allows users to add additional capacity without experiencing downtime. This online addition of capacity can include NVMe and SSD instances from cloud providers or deployed in physical servers. This means that as performance requirements increase, or decrease, you can use Kubernetes via storage policies to instruct OpenEBS to change capacity accordingly.

Other enterprise capabilities: OpenEBS adds other capabilities such as extremely efficient snapshots and clones as well as forthcoming capabilities such as encryption. Snapshots and clones facilitate much more efficient CI/CD workflows as zero space copies of databases and other stateful workloads can be used in these and other workflows, improving these without incurring additional storage space or administrative effort. The snapshot capabilities can also be used for replication. As of February 2018 these replication capabilities are under development.

<a href="#top">Go to top</a>



### Can I use the same PVC for multiple Pods?

Jiva and cStor volumes are exposed via block storage using iSCSI. Currently, only RWO is supported.

<a href="#top">Go to top</a>



### Warning Messages while Launching PVC

If the following warning messages are displayed while launching an application, you can ignore these messages. These message are displayed only while launching an application pod initially and gets cleared on the subsequent attempt.What is most distinctive about the OpenEBS architecture?

The OpenEBS architecture is an example of Container Attached Storage (CAS). These approaches containerize the storage controller, called IO controllers, and underlying storage targets, called “replicas”, allowing an orchestrator such as Kubernetes to automate the management of storage. Benefits include automation of management, delegation of responsibility to developer teams, and the granularity of the storage policies which in turn can improve performance.

<a href="#top">Go to top</a>



### Why *OpenEBS_logical_size* and *OpenEBS_actual_used* are showing in different size?

The `OpenEBS_logical_size` and `OpenEBS_actual_used` parameters will start showing different sizes when there are replica node restarts and internal snapshots are created for synchronizing replicas.

<a href="#top">Go to top</a>



### What must be the disk mount status on Node for provisioning OpenEBS volume?

OpenEBS have two storage Engines, Jiva and cStor which can be used to provision volume. 

Jiva requires the disk to be mounted (i.e., attached, formatted with a filesystem and mounted). 

cStor can consume disks that are attached (are visible to OS as SCSI devices) to the Nodes and no need of format these disks. This means disks should not have any filesystem and it should be unmounted on the Node. It is optional to wipe out the data from the disk if you use existing disks for cStor pool creation.

<a href="#top">Go to top</a>



### How OpenEBS detects disks for creating cStor Pool?

Any block disks available on the node (that can be listed with say `lsblk`) will be discovered by OpenEBS. 
Node Disk Manager(NDM) forms the DISK CRs in the following way

- Scan the list of disks that are unmounted
- Filter out the OS disks
- Filter out any other disk patterns that are mentioned in `openebs-operator.yaml`.

NDM do some filters on the disks to exclude, for example boot disk. 
NDM is excluding following device path to avoid from creating cStor pools. This configuration is added in `openebs-ndm-config` under Configmap in `openebs-operator.yaml`.

```
/dev/loop - loop devices.
/dev/fd - file descriptors.
/dev/sr - CD-ROM devices.
/dev/ram - ramdisks.
/dev/dm -lvm.
/dev/md -multiple device ( software RAID devices).
```

It is also possible to customize by adding more disk types associated with your nodes. For example, used disks, unwanted disks and so on. Following is the default filters added in `openebs-operator.yaml`. This change must be done in the 'openebs-operator.yaml' file that you have downloaded before OpenEBS installation.

`exclude: "loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md"`

Example:

```
  filterconfigs:
    - key: path-filter
      name: path filter
      state: true
      include: ""
      exclude: "loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md"
```

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="provision-pvc-higher-than-physical-sapce"></a>Can I provision OpenEBS volume if the request in PVC is more than the available physical capacity of the pools in the Storage Nodes?</h3>

As of 0.8.0, the user is allowed to create PVCs that cross the available capacity of the pools in the Nodes. In the future release, it will validate with an option `overProvisioning=false`, the PVC request should be denied if there is not enough available capacity to provision the volume.

<a href="#top">Go to top</a>



### What is the difference between cStor Pool creation using manual method and auto method?

By using manual method, you must give the selected disk name which is listed by NDM. This details has to be entered in the StoragePoolClaim YAML under `diskList`. See [storage pool](/docs/next/setupstoragepools.html#by-using-manual-method) for more info. 
It is also possible to change `maxPools` count and `poolType` in the StoragePoolClaim YAML. 
Consider you have 4 nodes with 2 disks each. You can select `maxPools` count as 3, then cStor pool will create in any 3 nodes out of 4. The remaining disks belongs to 4th Node can be used for horizontal scale up in future.
Advantage is that there is no restriction in the number of disks for the creation of cStor storage pool using `striped` or `mirrored` Type.

By auto method, its not need to provide the disk details in the StoragePoolClaim YAML. You have to specify `maxPools` count to limit the storage pool creation in OpenEBS cluster and `poolType` for the type of storage pool such as Mirrored or Striped.  See [storage pool](/docs/next/setupstoragepools.html#by-using-auto-method) for more info.

But the following are the limitations with this approach.

1. For Striped pool, it will take only one disk per Node even Node have multiple disks.
2. For Mirrored pool, it will take only 2 disks attached per Node even Node have multiple disks.

Consider you have 4 nodes with 4 disks each. If you set `maxPools` as 3 and `poolType` as `striped`, then Striped pool will created with Single disk on 3 Nodes out of 4 Nodes.
If you set `maxPools` as 3 and `poolType` as `mirrored`, then Mirrored cStor pool will create with single Mirrored pool with 2 disks on 3 Nodes out of 4 Nodes.

<a href="#top">Go to top</a>



### How the data is distributed when cStor maxPools count is 3 and replicaCount as 2 in StorageClass?

If `maxPool` count is 3 in StoragePoolClaim, then 3 cStor storage pool will create if it meet the required number of Nodes,say 3 in this example.
If `replicaCount` is 2 in StorageClass, then 2 OpenEBS volume will create on the top of any 2 cStor storage pool out of 3.

<a href="#top">Go to top</a>



### How to setup default PodSecurityPolicy to allow the OpenEBS pods to work with all permissions?

Apply the following YAML in your cluster.

- Create a Privileged PSP

  ```
  apiVersion: extensions/v1beta1
  kind: PodSecurityPolicy
   metadata:
     name: privileged
     annotations:
       seccomp.security.alpha.kubernetes.io/allowedProfileNames: '*'
   spec:
     privileged: true
     allowPrivilegeEscalation: true
     allowedCapabilities:
     - '*'
     volumes:
     - '*'
     hostNetwork: true
     hostPorts:
     - min: 0
       max: 65535
     hostIPC: true
     hostPID: true
     runAsUser:
       rule: 'RunAsAny'
     seLinux:
       rule: 'RunAsAny'
     supplementalGroups:
       rule: 'RunAsAny'
     fsGroup:
       rule: 'RunAsAny'    
  ```

- Associate the above PSP to a ClusterRole

  ```
  kind: ClusterRole
  apiVersion: rbac.authorization.k8s.io/v1
  metadata:
    name: privilegedpsp
  rules:
  - apiGroups: ['extensions']
    resources: ['podsecuritypolicies']
    verbs:     ['use']
    resourceNames:
    - privileged
  ```

- Associate the above Privileged ClusterRole to OpenEBS Service Account

  ```
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRoleBinding
  metadata:
    annotations:
      rbac.authorization.kubernetes.io/autoupdate: "true"
    name: openebspsp
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: privilegedpsp
  subjects:
  - kind: ServiceAccount
    name: openebs-maya-operator
    namespace: openebs
  ```

- Proceed to install the OpenEBS. Note that the namespace and service account name used by the OpenEBS should match what is provided in   the above ClusterRoleBinding.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="create-cstor-volume-single-disk-pool"></a>How to create a cStor volume on single cStor disk pool?</h3>

You can give the maxPools count as 1 in StoragePoolClaim YAML and `replicaCount` as `1`in StorageClass YAML. In the following sample SPC and SC YAML, cStor pool is created using auto method. After applying this YAML, one cStor pool named cstor-disk will be created only in one Node and `StorageClass` named `openebs-cstor-disk`. Only requirement is that one node has at least one disk attached but unmounted. See [here](docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume) to understand more about disk mount status.

```
---
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  maxPools: 1
  poolSpec:
    poolType: striped
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
      - name: ReplicaCount
        value: "1"
provisioner: openebs.io/provisioner-iscsi
```

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="cstor-pool-new-node-same-spc"></a>How to create a cStor pool on newly added nodes with using same SPC?</h3>

From 0.8.1 onwards, new cStor storage pool can be created using the existing StoragePoolClaim(SPC) by editing the corresponding SPC YAML. This feature is available for the creation of cStor storage pool using both auto and manual method.

For manual method, you have to edit the existing SPC by adding the required disks from new node and change the `maxPools` count to the required value.

For auto method, you have to edit the existing SPC by changing the `maxPools` count to the required number.

After the change,cStor pool will be created on the new Nodes.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="more-info-pool-cvr-cv-disk"></a>How to get the details like status, capacity etc. of cStor Pool, cStor Volume Replica, cStor Volumes and Disks using kubectl command?</h3>

From 0.8.1 onwards, following command list down the info like status, size etc. using `kubectl get` command. These command will output similar to the following only if Kubernetes version of client and server are above 1.11.

The following command  will give the details of cStor Storage Pool.

```
kubectl get csp -n openebs
```

Following is an example output.

```
NAME                     ALLOCATED   FREE    CAPACITY    STATUS    TYPE       AGE
sparse-claim-auto-lja7   125K        9.94G   9.94G       Healthy   striped    1h
```

The following command  will give the details of replica status of each cStor volume created in `openebs` namespace.

```
kubectl get cvr -n openebs
```

Following is an example output.

```
NAME                                                              USED  ALLOCATED  STATUS    AGE
pvc-9ca83170-01e3-11e9-812f-54e1ad0c1ccc-sparse-claim-auto-lja7   6K    6K         Healthy   1h
```

The following command  will give the details of cStor volume created in `openebs` namespace.

```
kubectl get cstorvolume -n openebs
```

Following is an example output.

```
NAME                                        STATUS    AGE
pvc-9ca83170-01e3-11e9-812f-54e1ad0c1ccc    Healthy   4h
```

The following command will give the details disks that are attached to all Nodes in the cluster.

```
kubectl get disk
```

Following is an example output.

```
NAME                                      SIZE          STATUS   AGE
sparse-5a92ced3e2ee21eac7b930f670b5eab5   10737418240   Active   10m
```



<br>

## See Also:

### [Creating cStor Pool](/docs/next/configurepools.html)

### [Provisioning cStor volumes](/docs/next/deploycstor.html)

### [BackUp and Restore](/docs/next/backup.html)

### [Uninstall](/docs/next/uninstall.html)

<br>

<hr>

<br>



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
