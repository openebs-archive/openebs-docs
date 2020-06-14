---
id: faq-general
title: OpenEBS Genernal FAQ
sidebar_label: General
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

You can then begin running a workload against OpenEBS. There is a large and growing number of workload that have storage classes that use OpenEBS. You need not use these specific storage classes. However, they may be helpful as they save time and allow for per workload customization. If you need additional help, get in touch with <a href="/docs/next/support.html" target="_blank">OpenEBS Community</a>.
 

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

