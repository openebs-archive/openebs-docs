---
id: faq
title: OpenEBS FAQ
sidebar_label: FAQs
---

------

<br>



## General

[What is most distinctive about the OpenEBS architecture?](#What-is-most-distinctive-about-the-OpenEBS-architecture?)

[Why did you choose iSCSI? Does it introduce latency and decrease performance? ](#Why-did-you-choose-iSCSI)

[Where is my data stored and how can I see that?](#where-is-my-data)

[What changes are needed for Kubernetes or other subsystems to leverage OpenEBS?](#changes-on-k8s-for-openebs)

[How do you get started and what is the typical trial deployment?](#get-started)

[What is the default OpenEBS Reclaim policy?](#default-reclaim-policy)

[Why NDM daemon set required privileged mode?](#why-ndm-priviledged)

[Does OpenEBS installation support in OpenShift 4.2?](#openebs-in-openshift-4.2)

[What are the prerequisites other than general prerequisites for installing OpenEBS in Centos and OpenShift?](#OpenEBS-install-prerequisites-openshift-centos)

[How to verify cStor volume is running fine?](#verify-cstor-volume-running-fine)

[Can I use replica count as 2 in StorageClass if it is a single node cluster?](#replica-count-2-in-a-single-node-cluster)

[How backup and restore is working with OpenEBS volumes?](#backup-restore-openebs-volumes)

[Why customized parameters set on default OpenEBS StorageClasses are not getting persisted?](#customized-values-not-peristed-after-reboot)

[Why NDM listens on host network?](#why-ndm-listens-on-host-network)

[How to handle replicas with slow disks or slow connectivity in case of cStor volumes?](#slow-replicas-in-cstor-volumes)

<br>

## Data Protection

[How is data protected? What happens when a host, client workload, or a data center fails?](#how-is-data-protected-what-happens-when-a-host-client-workload-or-a-data-center-fails)

[How does OpenEBS provide high availability for stateful workloads?](#how-does-openebs-provide-high-availability-for-stateful-workloads)

<br>

## Best Practices

[What are the recommended iscsi timeout settings on the host?](#what-are-the-recommended-iscsi-timeout-settings-on-the-host)

<br>

## Miscellaneous

[What changes must be made to the containers on which OpenEBS runs?](#what-changes-must-be-made-to-the-containers-on-which-openebs-runs)

[What are the minimum requirements and supported container orchestrators?](#what-are-the-minimum-requirements-and-supported-container-orchestrators)

[Why would you use OpenEBS on EBS?](#why-would-you-use-openebs-on-ebs)

[Can I use the same PVC for multiple Pods?](#can-i-use-the-same-pvc-for-multiple-pods)

[Warning Messages while Launching PVC](#warning-messages-while-launching-pvc)

[Why *OpenEBS_logical_size* and *OpenEBS_actual_used* are showing in different size?](#why-openebs-logical-size-and-openebs-actual-used-are-showing-in-different-size)

[What must be the disk mount status on Node for provisioning OpenEBS volume?](#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume)

[How OpenEBS detects disks for creating cStor Pool?](#how-openebs-detects-disks-for-creating-cstor-pool)

[Can I provision OpenEBS volume if the request in PVC is more than the available physical capacity of the pools in the Storage Nodes?](#provision-pvc-higher-than-physical-sapce)

[What is the difference between cStor Pool creation using manual method and auto method?](#what-is-the-difference-between-cstor-pool-creation-using-manual-method-and-auto-method)

[How the data is distributed when cStor maxPools count is 3 and replicaCount as 2 in StorageClass?](#how-the-data-is-distributed-when-cstor-maxpools-count-is-3-and-replicacount-as-2-in-storageclass)

[How to create a cStor volume on single cStor disk pool?](#create-cstor-volume-single-disk-pool)

[How to get the details of cStor Pool,cStor Volume Replica ,Cstor Volumes and Disks ?](#more-info-pool-cvr-cv-disk) 

[Does OpenEBS support encryption at rest?](#encryption-rest)

[Can the same BDC name be used for claiming a new block device?](#same-bdc-claim-new-bd)

</br>

<hr>
</br>

<font size="6" color="blue">General</font>



<h3><a class="anchor" aria-hidden="true" id="What-is-most-distinctive-about-the-OpenEBS-architecture?"></a>What is most distinctive about the OpenEBS architecture?</h3>


The OpenEBS architecture is an example of Container Attached Storage (CAS). These approaches containerize the storage controller, called IO controllers, and underlying storage targets, called “replicas”, allowing an orchestrator such as Kubernetes to automate the management of storage. Benefits include automation of management, a delegation of responsibility to developer teams, and the granularity of the storage policies which in turn can improve performance.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="Why-did-you-choose-iSCSI"></a>Why did you choose iSCSI? Does it introduce latency and decrease performance?</h3>


We at OpenEBS strive to make OpenEBS simple to use using Kubernetes as much as possible to manage OpenEBS itself. iSCSI allows you to be more resilient in cases where the workload and the controller are not on the same host. In other words, the OpenEBS user or architect will not suffer an outage when the storage IO controller is not scheduled locally to the workload in need of storage. OpenEBS does a variety of things to improve performance elsewhere in the stack. More is to come via the cStor storage engine in order to have this level of flexibility.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="where-is-my-data"></a>Where is my data stored and how can I see that?</h3>


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
         - name: openebs
  ```


<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="changes-on-k8s-for-openebs"></a>What changes are needed for Kubernetes or other subsystems to leverage OpenEBS?</h3>


One of the major differences of OpenEBS versus other similar approaches is that no changes are required to run OpenEBS on Kubernetes. However, OpenEBS itself is a workload and the easy management of it is crucial especially as the Container Attached Storage (CAS) approach entails putting containers that are IO controller and replica controllers.

You can access the OpenEBS IO controller via iSCSI, exposed as a service. The nodes require iSCSI initiator to be installed. In case the kubelet is running in a container for example, as in the case of Rancher and so on, the iSCSI initiator should be installed within the kubelet container.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="get-started"></a>How do you get started and what is the typical trial deployment?</h3>

If you have a Kubernetes environment, you can deploy OpenEBS using the following command.

`kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml`

You can then begin running a workload against OpenEBS. There is a large and growing number of workload that have storage classes that use OpenEBS. You need not use these specific storage classes. However, they may be helpful as they save time and allow for per workload customization. If you seek for any help,You can join at <a href="https://openebs.io/join-our-community" target="_blank">Slack OpenEBS</a> community channel.
 

<a href="#top">Go to top</a>

<br>

<h3><a class="anchor" aria-hidden="true" id="default-reclaim-policy"></a>What is the default OpenEBS Reclaim policy?</h3>

The default retention is the same used by K8s. For dynamically provisioned PersistentVolumes, the default reclaim policy is “Delete”. This means that a dynamically provisioned volume is automatically deleted when a user deletes the corresponding PersistentVolumeClaim. 

In case of cStor volumes, data was being deleted as well. 

For jiva, from 0.8.0 version, the data is deleted via scrub jobs. The completed job can be deleted using `kubectl delete job <job_name> -n <namespace>`

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="why-ndm-priviledged"></a>Why NDM Daemon set required privileged mode?</h3>


Currently, NDM Daemon set runs in the privileged mode. NDM requires privileged mode because it requires access to `/dev` and `/sys` directories for monitoring the devices attached and also to fetch the details of the attached device using various probes. 

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="openebs-in-openshift-4.2"></a>Does OpenEBS installation support in OpenShift 4.2?</h3>

OpenEBS v1.5 installation is supported in OpenShift 4.2.


<a href="#top">Go to top</a>


<h3><a class="anchor" aria-hidden="true" id="OpenEBS-install-prerequisites-openshift-centos"></a>What are the prerequisites other than general prerequisites for installing OpenEBS in Centos and OpenShift?</h3>


If you are installing OpenEBS in CentOS or OpenShift,you must need to grant privileges to ndm pods. For installing OpenEBS in OpenShift environment,more details can be read [here](/docs/next/kb.html#OpenEBS-install-openshift-4.1).

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="verify-cstor-volume-running-fine"></a>How to verify cStor volume is running fine?</h3>


The following steps will help to verify the cStor volume running status.

1. Check PVC is created successfully using the following command.

   ```
   kubectl get pvc -n <namespace>
   ```

2. If PVC is created successfully, check corresponding PV is also created successfully.

   ```
   kubectl get pv
   ```

3. Check the corresponding target pod of the cStor volume is running using the following command. 

   ```
   kubectl get pod -n openebs 
   ```

   The target pod should be in running state.

4. Now check the status of cStor volume using the following command.

   ```
   kubectl get cstorvolume -n openebs
   ```

   The output of above command will show status as `Offline`, `Degraded` and `Healthy`. Following are the definition for each of these status.

   **Init:** Init status of cStor volume is due to the following cases:

   - when the cStor volume is created.
   - when the replicas are not connected to target pod.

   **Healthy:** Healthy status of cStor volume represents that 51% of healthy replicas are connected to the target and volume is ready IO operations.

   **Degraded:** Minimum 51% of replicas are connected and some of these replicas are in  degraded state, then volume will be running as degraded state and IOs are operational in this state.

   **Offline:** When number of replicas which is equal to Consistency Factor are not yet connected to the target due to network issues or some other reasons In this case, volume is not ready to perform IOs.

   Note: If target pod of corresponding cStor volume is not running, then the status of cStor volume shown in the output of above command may be stale.

5. Check the cStorVolumeReplica(CVR) status of the corresponding cStor volume using the following command.

   ```
   kubectl get cvr -n openebs
   ```

   Status of each cStor volume Replica can be found under `STATUS` field.

   **Note:** If the pool pod of corresponding cStor volume replica is not running, then the status of CVR shown in the output of the above command may be stale.

   The following are the different type of STATUS information of cStor Volumes Replica and their definition.

   **Healthy:** Healthy state represents volume is healthy and volume data existing on this replica is up to date.

   **Offline:** cStor volume replica status is offline due to the following cases:

   - when the corresponding cStor pool is not available to create volume.
   - when the creation of cStor volume fails.
   - when the replica is not yet connected to the target.
   
   **Degraded:** cStor volume replica status is degraded due to the following case
   
   - when the cStor volume replica is connected to the target and rebuilding is not yet started on this replica.
   
   **Rebuilding:** cStor volume replica status is rebuilding when the cStor volume replica is undergoing rebuilding, that means, data sync with another replica.
   
   **Error:** cStor volume replica status is in error state due to the following cases:
   
   - when the volume replica data set is not existing in the pool.
   - when an error occurs while getting the stats of cStor volume.
   - when the unit of size is not mentioned in PVC spec. For example, if the size is 5 instead of 5G.
   
   **DeletionFailed:** cStor volume replica status is deletion failed while destroying cStor volumes fails.
   
   **Invalid:** cStor volume replica status is invalid when a new cstor-pool-mgmt container in a new pod is communicating with the old cstor-pool container in an old pod.
   
   **Init:** cStor volume replica status init represents the volume is not yet created.
   
   **Recreate:** cStor volume replica status recreate represents an intermediate state before importing the volume(this can happen only when pool pod got restarted) in case of a non-ephemeral disk. If the disk is ephemeral then this status represents volume is going to recreate.
   
   **NewReplicaDegraded:** cStor volume replica is newly created and it make successful connection with the target pod. 
   
   **ReconstructingNewReplica:** cStor volume replica is newly created and it started reconstructing entire data from another healthy replica.
   
   

<h3><a class="anchor" aria-hidden="true" id="replica-count-2-in-a-single-node-cluster"></a>Can I use replica count as 2 in StorageClass if it is a single node cluster?</h3>


While creating a StorageClass, if user mention replica count as 2 in a single node cluster, OpenEBS will not create the volume from 0.9  version onwards. It is required to match the number of replica count and number of nodes available in the cluster for provisioning OpenEBS Jiva and cStor volumes.



<h3><a class="anchor" aria-hidden="true" id="backup-restore-openebs-volumes"></a>How backup and restore is working with OpenEBS volumes?</h3>


OpenEBS cStor volume is working based on cStor/ZFS snapshot using Velero. For OpenEBS Local PV and Jiva volume, it is based on restic using Velero.



<h3><a class="anchor" aria-hidden="true" id="customized-values-not-peristed-after-reboot"></a>Why customized parameters set on default OpenEBS StorageClasses are not getting persisted?</h3>


The customized parameters set on default OpenEBS StorageClasses will not persist after restarting `maya-apiserver` pod or restarting the node where `maya-apiserver` pod is running. StorageClasses created by maya-apiserver are owned by it and it tries to overwrite them upon its creation.


<h3><a class="anchor" aria-hidden="true" id="why-ndm-listens-on-host-network"></a>Why NDM listens on host network?</h3>


NDM uses `udev` to monitor dynamic disk attach and detach events. `udev` listens on netlink socket of the host system to get those events. A container requires host network access so that it can listen on the socket. Therefore NDM requires host network access for the `udev` running inside the container to listen those disk related events. 


<h3><a class="anchor" aria-hidden="true" id="slow-replicas-in-cstor-volumes"></a>How to handle replicas with slow disks or slow connectivity in case of cStor volumes?</h3>


CStor target pod disconnects a replica if IO response is not received from a replica within 60 seconds. This can happen due to slow disks in cStor pools or slow connectivity between target pod and cStor pool pods. In order to allow tuning of IO wait time from its default value of 60 seconds, there is an environment variable IO_MAX_WAIT_TIME in `cstor-istgt` container of target pod.
Add below kind of configuration in target pod deployment under `env` section of `cstor-istgt` container:
```
            env:
            - name: IO_MAX_WAIT_TIME
              value: 120
```
Please note that target pod gets restarts which can impact ongoing IOs.

<hr>
<br>

<font size="6" color="orange">Data Protection</font>



<h3><a class="anchor" aria-hidden="true" id="how-is-data-protected-what-happens-when-a-host-client-workload-or-a-data-center-fails"></a>How is data protected? What happens when a host, client workload, or a data center fails?</h3>


Kubernetes provides many ways to enable resilience. OpenEBS leverages these wherever possible.  For example, say the IO container that has the iSCSI target fails. Well, it is spun back up by Kubernetes. The same applies to the underlying replica containers, where the data is actually stored. They are spun back up by Kubernetes. Now, the point of replicas is to ensure that when one or more of these replicas are being respond and then repopulated in the background by OpenEBS, the client applications still run.  OpenEBS takes a simple approach to ensuring that multiple replicas can be accessed by an IO controller using a configurable quorum or the minimum number of replica requirements. In addition, our new cStor checks for silent data corruption and in some cases can fix it in the background.  Silent data corruption, unfortunately, can occur from poorly engineered hardware and from other underlying conditions including those that your cloud provider is unlikely to report or identify.  

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="how-does-openebs-provide-high-availability-for-stateful-workloads"></a>How does OpenEBS provide high availability for stateful workloads?</h3>


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



<hr>
<br>

<font size="6" color="maroon">Best Practices</font>




<h3><a class="anchor" aria-hidden="true" id="what-are-the-recommended-iscsi-timeout-settings-on-the-host"></a>What are the recommended iscsi timeout settings on the host?</h3>


There are cases when application pod and OpenEBS cStor target pod are running on different nodes. In such cases, there may be chances that application can go to read only when K8s takes around 5 mins to re-schedule OpenEBS target pod to a new Node. To avoid such scenarios,default iscsi timeout values can be configured to the recommended one. 

<h4><a class="anchor" aria-hidden="true" id="configure-iscsi-timeout"></a>Configure the iscsi timeout value</h4>
The following explains the configuration change for 2 different scenarios.

1. For New iSCSI sessions
2. For those sessions already logged in to iSCSI target.



**For New iSCSI sessions**:

Do below configuration settings on the host node to change the default iscsi timeout value.

1. Edit iscsid.conf file.

2. Modify **node.session.timeo.replacement_timeout** with 300 seconds.

   

**For those sessions already logged in to iSCSI target:**

Below command can be used to change the setting for logged in sessions:

```
iscsiadm -m node -T <target> -p ip:port -o update -n node.session.timeo.replacement_timeout -v 300
```



<h4><a class="anchor" aria-hidden="true" id="verify-iscsi-timeout"></a>Verify the iscsi timeout settings </h4>

Verify the configured value by running “iscsiadm -m session -P 3”  and check "Recovery Timeout" value under "Timeouts". It should be configured as 300.

You may notice the change in the “Attached scsi disk” value. This causes volume to get unmounted and thus volume need to be remounted. Detailed steps for remounting volume are mentioned [here](https://openebs.io/blog/keeping-openebs-volumes-in-rw-state-during-node-down-scenarios/).



<hr>
<br>

<font size="6" color="red">Miscellaneous</font>



<h3><a class="anchor" aria-hidden="true" id="what-changes-must-be-made-to-the-containers-on-which-openebs-runs"></a>What changes must be made to the containers on which OpenEBS runs?</h3>


OpenEBS has been engineered so that it does not require any changes to the containers on which it runs. Similarly, Kubernetes itself does not require to be altered and no additional external orchestrator is required. However, the workloads that need storage must be running on hosts that have iSCSI initiators, which is a default configuration in almost all operating systems.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="what-are-the-minimum-requirements-and-supported-container-orchestrators"></a>What are the minimum requirements and supported container orchestrators?</h3>


OpenEBS is currently tightly integrated into Kubernetes. Support for Docker Swarm is something OpenEBS is looking at in future releases.

The system requirements depend on the number of volumes being provisioned and can horizontally scale with the number of nodes in the Kubernetes cluster. The OpenEBS control plane comprises of minimum two pods i.e. apiserver and dynamic provisioner. You can run these using 2GB RAM and 2 CPUs.

Each volume will spin up IO controller and replica pods. Each of these will require 1GB RAM and 0.5 CPU by default.

For enabling high availability, OpenEBS recommends having a minimum of 3 nodes in the Kubernetes cluster.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="why-would-you-use-openebs-on-ebs"></a>Why would you use OpenEBS on EBS?</h3>


There are at least four common reasons for running OpenEBS on Amazon EBS that are listed as follows:

Attach / Detach: The attach / detach process can slow the environment operations dependent on EBS.

No volume management needed: OpenEBS removes the need for volume management, enabling the combination of multiple underlying EBS volumes without the user needing to run LVM or other volume manager. This saves time and reduces operational complexity.

Expansion and inclusion of NVMe: OpenEBS allows users to add additional capacity without experiencing downtime. This online addition of capacity can include NVMe and SSD instances from cloud providers or deployed in physical servers. This means that as performance requirements increase, or decrease, you can use Kubernetes via storage policies to instruct OpenEBS to change capacity accordingly.

Other enterprise capabilities: OpenEBS adds other capabilities such as extremely efficient snapshots and clones as well as forthcoming capabilities such as encryption. Snapshots and clones facilitate much more efficient CI/CD workflows as zero space copies of databases and other stateful workloads can be used in these and other workflows, improving these without incurring additional storage space or administrative effort. The snapshot capabilities can also be used for replication. As of February 2018 these replication capabilities are under development.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="can-i-use-the-same-pvc-for-multiple-pods"></a>Can I use the same PVC for multiple Pods?</h3>


Jiva and cStor volumes are exposed via block storage using iSCSI. Currently, only RWO is supported.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="why-openebs-logical-size-and-openebs-actual-used-are-showing-in-different-size"></a>Why OpenEBS_logical_size and OpenEBS_actual_used are showing in different size?</h3>

The `OpenEBS_logical_size` and `OpenEBS_actual_used` parameters will start showing different sizes when there are replica node restarts and internal snapshots are created for synchronizing replicas.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume"></a>What must be the disk mount status on Node for provisioning OpenEBS volume?</h3>


OpenEBS have three storage Engines, Jiva, cStor and LocalPV which can be used to provision OpenEBS volumes. 

Jiva requires the disk to be mounted (i.e., attached, formatted with a filesystem and mounted). 

For LocalPV based on device, details of disk mount status can be obtained [here](/docs/next/ndm.html).

cStor can consume disks that are attached (are visible to OS as SCSI devices) to the Nodes which does not have any filesystem and it should be unmounted on the Node. It is recommended to wipe out the disk if it was previously used. 

In case you need to use Local SSDs as block devices for provisioning cStor volume, you will have to first unmount them and remove any the filesystem if it has. On GKE, the Local SSDs are formatted with ext4 and mounted under "/mnt/disks/". If local SSDs are mounted and contains any file system, then cStor pool creation will fail.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="how-openebs-detects-disks-for-creating-cstor-pool"></a>How OpenEBS detects disks for creating cStor Pool?</h3>


Any block disks available on the node (that can be listed with say `lsblk`) will be discovered by OpenEBS. 
Node Disk Manager(NDM) forms the DISK CRs in the following way

- Scan the list of disks.
- Filter out the OS disks
- Filter out partitioned disks.
- Filter out any other disk patterns that are mentioned in `openebs-ndm-config` under `Configmap` in `openebs-operator.yaml`.

NDM do some filtering on the disks to exclude, for example boot disk. By default, NDM excludes the following device path to create disk CR. This configuration is added in `openebs-ndm-config` under `Configmap` in `openebs-operator.yaml`.

```
/dev/loop - loop devices.
/dev/fd - file descriptors.
/dev/sr - CD-ROM devices.
/dev/ram - ramdisks.
/dev/dm -lvm.
/dev/md -multiple device ( software RAID devices).
```

It is also possible to customize by adding more disk types associated with your nodes. For example, used disks, unwanted disks and so on. This change must be done in the 'openebs-operator.yaml' file that you have downloaded before OpenEBS installation.

**Example:**

```
  filterconfigs:
    - key: path-filter
      name: path filter
      state: true
      include: ""
      exclude: "loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md"
```

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="provision-pvc-higher-than-physical-sapce"></a> Can I provision OpenEBS volume if the request in PVC is more than the available physical capacity of the pools in the Storage Nodes?</h3>


As of 0.8.0, the user is allowed to create PVCs that cross the available capacity of the pools in the Nodes. In the future release, it will validate with an option `overProvisioning=false`, the PVC request should be denied if there is not enough available capacity to provision the volume.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="what-is-the-difference-between-cstor-pool-creation-using-manual-method-and-auto-method"></a>What is the difference between cStor Pool creation using manual method and auto method?</h3>


By using manual method, you must give the selected disk name which is listed by NDM. This details has to be entered in the StoragePoolClaim YAML under `diskList`. See [storage pool](/docs/next/ugcstor.html#creating-cStor-storage-pools) for more info. 
It is also possible to change `maxPools` count and `poolType` in the StoragePoolClaim YAML. 
Consider you have 4 nodes with 2 disks each. You can select `maxPools` count as 3, then cStor pools will be created in any 3 nodes out of 4. The remaining disks belonging to 4th Node can be used for horizontal scale up in future.
Advantage is that there is no restriction in the number of disks for the creation of cStor storage pool using `striped` or `mirrored` Type.

By auto method, its not need to provide the disk details in the StoragePoolClaim YAML. You have to specify `maxPools` count to limit the storage pool creation in OpenEBS cluster and `poolType` for the type of storage pool such as Mirrored or Striped.  See [storage pool](/docs/next/ugcstor.html#creating-cStor-storage-pools) for more info.

But the following are the limitations with this approach.

1. For Striped pool, it will take only one disk per Node even Node have multiple disks.
2. For Mirrored pool, it will take only 2 disks attached per Node even Node have multiple disks.

Consider you have 4 nodes with 4 disks each. If you set `maxPools` as 3 and `poolType` as `striped`, then Striped pool will created with Single disk on 3 Nodes out of 4 Nodes.
If you set `maxPools` as 3 and `poolType` as `mirrored`, then Mirrored cStor pool will create with single Mirrored pool with 2 disks on 3 Nodes out of 4 Nodes.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="how-the-data-is-distributed-when-cstor-maxpools-count-is-3-and-replicacount-as-2-in-storageclass"></a>How the data is distributed when cStor maxPools count is 3 and replicaCount as 2 in StorageClass?</h3>


If `maxPool` count is 3 in StoragePoolClaim, then 3 cStor storage pools will be created if it meets the required number of nodes, say 3 in this example.
If `replicaCount` is 2 in StorageClass, then 2 replicas of an OpenEBS volume will be created on the top of any 2 cStor storage pool out of 3.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="create-cstor-volume-single-disk-pool"></a>How to create a cStor volume on single cStor disk pool?</h3>


You can give the maxPools count as 1 in StoragePoolClaim YAML and `replicaCount` as `1` in StorageClass YAML. In the following sample SPC and SC YAML, cStor pool is created using auto method. After applying this YAML, one cStor pool named cstor-disk will be created only in one Node and `StorageClass` named `openebs-cstor-disk`. Only requirement is that one node has at least one disk attached but unmounted. See [here](/docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume) to understand more about disk mount status.

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
NAME                                                              USED  ALLOCATED  	STATUS    AGE
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

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="encryption-rest"></a>Does OpenEBS support encryption at rest?</h3>


OpenEBS recommends LUKS encrypted drives with dm-crypt to achieve block-device encryption at rest. 

OpenEBS team is working on introducing native encryption capabilities with the release of the Mayastor storage engine.

Currently, device encryption is a manual operation, and the steps for encrypting the devices consumed by OpenEBS storage engines are explained separately for cStor and LocalPV below:

<a  href="https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_volume_encrypt.md" target="_blank">How to use encryption with cStor</a>

<a  href="https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/uglocalpv_volume_encrypt.md" target="_blank">How to use encryption with LocalPV</a>

It is recommended to store encryption keys in a secure secret store. Kubernetes Secrets or Vault can be used as a secret provider. 

Although block-level encryption is faster than filesystem encryption such as eCryptfs you should be aware that encryption overall increases CPU utilization and will have a small performance overhead on the LUKS encrypted devices.

<a href="#top">Go to top</a>



<h3><a class="anchor" aria-hidden="true" id="same-bdc-claim-new-bd"></a>Can the same BDC name be used for claiming a new block device?</h3>


No. It is recommended to create different BDC name for claiming an unclaimed disk manually.

<a href="#top">Go to top</a>



<br>

<hr>


## See Also:

### [Creating cStor Pool](/docs/next/ugcstor.html#creating-cStor-storage-pools)

### [Provisioning cStor volumes](/docs/next/ugcstor.html#provisioning-a-cStor-volume)

### [Uninstall](/docs/next/uninstall.html)

<br>

<hr>

<br>

