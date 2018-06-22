---
id: faq
title: OpenEBS FAQ
sidebar_label: FAQ
---

------



## What is most distinctive about the OpenEBS architecture?

The OpenEBS architecture is an example of Container Attached Storage (CAS). These approaches containerize the storage controller, called IO controllers, and underlying storage targets, called “replicas”, allowing an orchestrator such as Kubernetes to automate the management of storage. Benefits include automation of management, delegation of responsibility to developer teams, and the granularity of the storage policies which in turn can improve performance.

## Why did you choose iSCSI? Doesn’t it introduce latency and decrease performance? 

We at OpenEBS strive to make OpenEBS simple to use using Kubernetes as much as possible to manage OpenEBS itself. iSCSI allows you to be more resilient in cases where the workload and the controller are not on the same host. In other words, the OpenEBS user or architect will not suffer an outage when the storage IO controller is not scheduled locally to the workload in need of storage. OpenEBS does a variety of things to improve performance elsewhere in the stack. More is to come via the cStor storage engine in order to have this level of flexibility.

## How is the data protected? Explain what happens when a host fails, a client workload fails, or a data center fails?

Kubernetes provides many ways to enable resilience. OpenEBS leverages these wherever possible.  For example, say the IO container that has the iSCSI target fails. Well, it is spun back up by Kubernetes. The same applies to the underlying replica containers, where the data is actually stored. They are spun back up by Kubernetes. Now, the point of replicas is to ensure that when one or more of these replicas are being respun and then repopulated in the background by OpenEBS, the client applications still runs.  OpenEBS takes a simple approach to ensuring that multiple replicas can be accessed by an IO controller using a configurable quorum or the minimum number of replica requirements. In addition, our new cStor checks for silent data corruption and in some cases can fix it in the background.  Silent data corruption, unfortunately, can occur from poorly engineered hardware and from other underlying conditions including those that your cloud provider is unlikely to report or identify.  

## How does OpenEBS provide higher availability for stateful workloads?

An OpenEBS Jiva volume is a controller deployed during OpenEBS installation. Volume replicas are defined by the parameter that you set. The controller is an iSCSI target while the replicas play the role of a disk. The controller exposes the iSCSI target while the actual data is written. The controller and each replica run inside a dedicated container. An OpenEBS Jiva volume controller exists as a single instance, but there can be multiple instances of OpenEBS Jiva volume replicas. Persistent data is synchronized between replicas. OpenEBS Jiva volume High Availability is based on various scenarios as explained in the following sections. **Note:** Each replica is scheduled in a unique K8s node, and a K8s node never has two replicas of one OpenEBS volume.

### What happens when an OpenEBS volume controller pod crashes?

Kubernetes automatically re-schedules the controller as a new Kubernetes pod. Policies are in place that ensures faster rescheduling.

### What happens when a K8s node that hosts OpenEBS volume controller goes offline?

The controller is automatically re-scheduled as a new Kubernetes pod. Policies are in place that ensures faster rescheduling. If Kubernetes node is unavailable, the controller gets scheduled on one of the available nodes.

### What happens when an OpenEBS volume replica pod crashes for reasons other than node not-ready and node unreachable?

The replica is automatically rescheduled as a new Kubernetes pod. The replica may or may not be rescheduled on the same K8s node. There is data loss with this newly scheduled replica if it gets rescheduled on a different K8s node.

### What happens when a K8s node that hosts OpenEBS volume replica goes offline?

There is no storage downtime as the other available replica displays inputs/outputs. Policies are in place that does not allow rescheduling of crashed replica (as the replica is tied to a node’s resources) on any other node.

## Where is my data stored? How can I see that?

OpenEBS stores data in a configurable number of replicas. These are placed to maximize resiliency. For example, they are placed in different racks or availability zones.

To determine exactly where your data is physically stored, you can run the following kubectl commands.

(a) Run `kubectl get pvc` to fetch the volume name. The volume name looks like: *pvc-ee171da3-07d5-11e8-a5be-42010a8001be*.

(b) For each volume, you will notice one IO controller pod and one or more replicas (as per the storage class configuration). For the above PVC, run the following command to get the IO controller and replica pods. `kubectl get pods --all-namespaces | grep pvc-ee171da3-07d5-11e8-a5be-42010a8001be`
	The output displays the following pods.
 - IO Controller: *pvc-ee171da3-07d5-11e8-a5be-42010a8001be-ctrl-6798475d8c-7dcqd*
 - Replica 1: *pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-hls6s*
 - Replica 2: *pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-tr28f*

(c) To check the location where the data is stored, get the details of the replica pod. For getting the details of Replica 1 above, use the `kubectl get pod -o yaml pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-hls6s` command. Check the volumes section.

```
volumes:
  - hostPath:
      path: /var/openebs/pvc-ee171da3-07d5-11e8-a5be-42010a8001be
      type: ""
    name: openebs
```

## What changes are needed for Kubernetes or other subsystems to leverage OpenEBS?

One of the major differences of OpenEBS versus other similar approaches is that no changes are required to run OpenEBS on Kubernetes. However, OpenEBS itself is a workload and the easy management of it is crucial especially as the Container Attached Storage (CAS) approach entails putting containers that are IO controller and replica controllers.

You can access the OpenEBS IO controller via iSCSI, exposed as a service. The nodes require iSCSI initiator to be installed. In case the kubelet is running in a container for example, as in the case of Rancher and so on, the iSCSI initiator should be installed within the kubelet container.

## How do you get started? What is the typical trial deployment?

If you have a Kubernetes environment, you can deploy OpenEBS using the following command.

`kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml`

You can then begin running a workload against OpenEBS. There are large and growing number of workloads that have storage classes that use OpenEBS. You need not use these specific storage classes. However, they may be helpful as they save time and allow for per workload customization. You can join the Slack channel at: https://openebs-community.slack.com.

Register at MayaOnline.io to receive free monitoring and a single view of stateful workloads of your Kubernetes environment. MayaOnline incorporates customized versions of Prometheus for monitoring, Grafana for metrics visualization and Scope to see the overall environment, and our MuleBot for ChatOps integration and more.  

## What is the most common use case?  What are the most common workloads?

Any stateful workload running on Kubernetes likely has been run on OpenEBS at least once.  Common workloads include Prometheus and FluentD  and other stateful workloads used to manage Kubernetes itself. Jenkins, all flavors of databases including even in some cases NoSQL databases, and object storage are all widely deployed.  

## How about performance? How does OpenEBS perform?

OpenEBS has been engineered so that it does not require any changes to the containers on which it runs.  Similarly, Kubernetes itself does not require to be altered and no additional external orchestrator is required.  However, the workloads that need storage must be running on hosts that have iSCSI initiators, which is a default configuration in almost all operating systems.

## What changes must be made to the containers on which OpenEBS runs?  

Performance tests on release v.0.5.2 shows acceptable performance, but additional efforts are ongoing to improve performance. OpenEBS will soon implement many changes to improve performance elsewhere in the stack and much more is coming via the cStor storage engine.

## What are the minimum requirements? What are the supported container orchestrators?

OpenEBS is currently tightly integrated into Kubernetes. Support for Docker Swarm is something OpenEBS is looking at in future releases.

The system requirements depend on the number of volumes being provisioned and can horizontally scale with the number of nodes in the Kubernetes cluster. The OpenEBS control plane comprises of minimum two pods i.e. apiserver and dynamic provisioner. You can run these using 2GB RAM and 2 CPUs. 

Each volume will spin up IO controller and replica pods. Each of these will require 1GB RAM and 0.5 CPU by default.

For enabling high availability, OpenEBS recommends having a minimum of 3 nodes in the Kubernetes cluster.

## Why would you use OpenEBS on EBS?

There are at least four common reasons for running OpenEBS on Amazon EBS that are listed as follows:

* **Attach / Detach:**  The attach / detach process can slow the environment operations dependent on EBS.  
* **No volume management needed:**  OpenEBS removes the need for volume management, enabling the combination of multiple underlying EBS volumes without the user needing to run LVM or other volume manager.  This saves time and reduces operational complexity.
* **Expansion and inclusion of NVMe:**  OpenEBS allows users to add additional capacity without experiencing downtime.  This online addition of capacity can include NVMe and SSD instances from cloud providers or deployed in physical servers.  This means that as performance requirements increase, or decrease, you can use Kubernetes via storage policies to instruct OpenEBS to change capacity accordingly. 
* **Other enterprise capabilities:**  OpenEBS adds other capabilities such as extremely efficient snapshots and clones as well as forthcoming capabilities such as encryption.  Snapshots and clones facilitate much more efficient CI/CD workflows as zero space copies of databases and other stateful workloads can be used in these and other workflows, improving these without incurring additional storage space or administrative effort.  The snapshot capabilities can also be used for replication.  As of February 2018 these replication capabilities are under development.


## How to expand the Jiva Storage Volumes

Currently OpenEBS don't have the feature to resize the volume through yaml. we need to follow the      below mentioned steps to do it manually.                                                     

- **Obtain ISCSI target and disk details using the following command**:

  ```
  root@OpenEBS:~# iscsiadm -m session -P 3
  iSCSI Transport Class version 2.0-870
  version 2.0-873
  Target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2 (non-flash)
          Current Portal: 10.106.254.221:3260,1
          Persistent Portal: 10.106.254.221:3260,1
                  **********
                  Interface:
                  **********
                  Iface Name: default
                  Iface Transport: tcp
                  Iface Initiatorname: iqn.1993-08.org.debian:01:c6385a9091e6
                  Iface IPaddress: 20.10.45.20
                  Iface HWaddress: <empty>
                  Iface Netdev: <empty>
                  SID: 1
                  iSCSI Connection State: LOGGED IN
                  iSCSI Session State: LOGGED_IN
                  Internal iscsid Session State: NO CHANGE
                  *********
                  Timeouts:
                  *********
                  Recovery Timeout: 120
                  Target Reset Timeout: 30
                  LUN Reset Timeout: 30
                  Abort Timeout: 15
                  *****
                  CHAP:
                  *****
                  username: <empty>
                  password: ********
                  username_in: <empty>
                  password_in: ********
                  ************************
                  Negotiated iSCSI params:
                  ************************
                  HeaderDigest: None
                  DataDigest: None
                  MaxRecvDataSegmentLength: 262144
                  MaxXmitDataSegmentLength: 65536
                  FirstBurstLength: 65536
                  MaxBurstLength: 262144
                  ImmediateData: Yes
                  InitialR2T: Yes
                  MaxOutstandingR2T: 1
                  ************************
                  Attached SCSI devices:
                  ************************
                  Host Number: 3  State: running
                  scsi3 Channel 00 Id 0 Lun: 0
                          Attached scsi disk sdb          State: running
  ```





- **Check the mounted path on disk sdb using the following command:** 

  ```
  root@OpenEBSt# mount | grep /dev/sdb | more
  /dev/sdb on /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.106.254.221:3260-iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-lun-0 type ext4 (rw,relatime,data=ordered)
  /dev/sdb on /var/lib/kubelet/pods/8de04c10-64a3-11e8-994b-000c2959d9a2/volumes/kubernetes.io~iscsi/pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2 type ext4 (rw,relatime,data=ordered)
  ```

  ​

- **Unmount the file system using the following command**:

  ```
  root@OpenEBS#umount /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.106.254.221:3260-iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-lun-0
  root@OpenEBS#umount /var/lib/kubelet/pods/8de04c10-64a3-11e8-994b000c2959d9a2/volumes/kubernetes.io~iscsi/pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2
  ```

  ​

- **Logout from the ISCSI target using the following command:** 

```
root@OpenEBS:/home/prabhat# iscsiadm -m node -u
Logging out of session [sid: 1, target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2, portal: 10.106.254.221,3260]
Logout of [sid: 1, target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2, portal: 10.106.254.221,3260] successful
```

- **You need to get the volume ID using the below command**: 

  ```
  root@OpenEBS:~# curl http://10.106.254.221:9501/v1/volumes

  {"data":[{"actions":{"revert":"http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==?action=revert","shutdown":"http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==?action=shutdown","snapshot":"http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==?action=snapshot"},"id":"**cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==**","links":{"self":"http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg=="},"name":"pvc-8de2f9e7-64a3-11e8-994b000c2959d9a2","replicaCount":1,"type":"volume"}],"links":{"self":"http://10.106.254.221:9501/v1/volumes"},"resourceType":"volume","type":"collection"}
  ```


- **Modify the volume capacity using the below command**:

  ```
  syntax:curl -H "Content-Type: application/json" -X POST -d '{"name":"<volname>","size":"<size>"}' http://<target ip>:9501/v1/volumes/<id>?action=resize

  root@prabhat-virtual-machine:~#curl -H "Content-Type: application/json" -X POST -d '{"name":"pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2","size":"7G"}' http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==?action=resize
  ```

  ​

- **Restart the replicas.You need to delete all the replicas of pod in single command.In the below example the percona is running with single replica.**

  ```
  root@OpenEBS:~# kubectl get pods
  NAME                                                             READY     STATUS    RESTARTS   AGE
  maya-apiserver-9679b678-n79bz                                    1/1       Running   0          3h
  openebs-provisioner-55ff5cd67f-lgwh2                             1/1       Running   0          3h
  percona                                                          1/1       Running   0          3h
  pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-ctrl-75bf7d6bdd-wg2gk   2/2       Running   0          3h
  pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-rep-5f4d48987c-rmdbq    1/1       Running   0          3h

   root@OpenEBS:~# kubectl delete pod pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-rep-5f4d48987c-rmdbq

    pod "pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-rep-5f4d48987c-rmdbq" deleted

  ```


 

- **Logging to the target using below commands:** 

```
 root@OpenEBS:/home/prabhat# iscsiadm -m discovery -t st -p 10.106.254.221:326
  10.106.254.221:3260,1 iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2

  root@OpenEBS:/home/prabhat# iscsiadm -m node -T iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2 -p 10.106.254.221:3260 -l
  Logging in to [iface: default, target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2, portal: 10.106.254.221,3260] (multiple)
  Login to [iface: default, target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2, portal: 10.106.254.221,3260] successful.
```




- **Check the file system consistency using the below command. sdc is the device after logging:** 

```
e2fsck -f /dev/sdc
```


- **Expand the file system**: 

```
 resize2fs /dev/sdc
```


- **Mount the file system:** 

```
  root@OpenEBS:~# mount /dev/sdc /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.99.197.30:3260-iqn.2016-09.com.openebs.jiva:pvc-3d6eb5dd-6893-11e8-994b-000c2959d9a2-lun-0

  root@OpenEBS:~# mount /dev/sdc /var/lib/kubelet/pods/3d71c842-6893-11e8-994b-000c2959d9a2/volumes/kubernetes.io~iscsi/pvc-3d6eb5dd-6893-11e8-994b-000c2959d9a2
```


- **Restart the application pod:**   

```
kubectl delete pod percona-b98f87dbd-nqssn
```




- **Write the data on the expanded disk:** 

  ​

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