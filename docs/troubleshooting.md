---
id: troubleshooting
title: Troubleshooting OpenEBS
sidebar_label: Troubleshooting
---
------

<font size="5">General guidelines for troubleshooting</font>

Connecting Kubernetes cluster to MayaOnline is the simplest and easiest way to monitor OpenEBS resources and volumes. Logs of OpenEBS pods available at MayaOnline are helpful for troubleshooting. Topology views of OpenEBS custom resources provide the live status which are helpful in the troubleshooting process.



**Steps for troubleshooting:**

- Join <a href="https://openebs.org/community" target="_blank">Slack OpenEBS Community</a>
- Connect Kubernetes cluster to MayaOnline and observe the following
  - Any alerts that may be relevant to the issue under troubleshooting 
  - Logs that throw up any errors
  - Status of custom resources of OpenEBS volumes in the topology view
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>

<hr>
<font size="6">Areas of troubleshooting</font>

<br>

## Installation

[Installation failed because insufficient user rights](#install-failed-user-rights)

[iSCSI client is not setup on Nodes. Application Pod is in ContainerCreating state.](#install-failed-iscsi-not-configured)

[Why does OpenEBS provisioner pod restart continuously?](#openebs-provsioner-restart-continuously)

[OpenEBS installation fails on Azure](#install-failed-azure-no-rbac-set).

[A multipath.conf file claims all SCSI devices in OpenShift](#multipath-conf-claims-all-scsi-devices-openshift)

<br>

## Uninstall

[Whenever a Jiva PVC is deleted, a job will created and status is seeing as `completed`](#jiva-deletion-scrub-job)

[cStor Volume Replicas are not getting deleted properly](#cvr-deletion)

<br>

## Volume provisioning

[Unable to create persistentVolumeClaim due to certificate verification error](#admission-server-ca)

[Application complaining ReadOnly filesystem](#application-read-only)

[Application pods are not running when OpenEBS volumes are provisioned on Rancher](#application-pod-not-running-Rancher)

[Application pod is stuck in ContainerCreating state after deployment](#application-pod-stuck-after-deployment)

[Creating cStor pool fails on CentOS when there are partitions on the disk](#cstor-pool-failed-centos-partion-disk)

[Application pod enters CrashLoopBackOff state](#application-crashloopbackoff)

[cStor pool pods are not running](#cstor-pool-pod-not-running)

[OpenEBS Jiva PVC is not provisioning in 0.8.0](#Jiva-provisioning-failed-080)

[Recovery procedure for Read-only volume where kubelet is running in a container](#recovery-readonly-when-kubelet-is-container)

[Recovery procedure for Read-only volume for XFS formatted volumes](#recovery-readonly-xfs-volume)

[Unable to clone OpenEBS volume from snapshot](#unable-to-clone-from-snapshot)

[Unable to mount XFS formatted volumes into Pod](#unable-to-mount-xfs-volume)

[Unable to create or delete a PVC](#unable-to-create-or-delete-a-pvc)

[Unable to provision cStor on DigitalOcean](#unable-to-provision-openebs-volume-on-DigitalOcean)

<br>

## Kubernetes related

[Kubernetes node reboots because of increase in memory consumed by Kubelet](#node-reboot-when-kubelet-memory-increases)

[Application and OpenEBS pods terminate/restart under heavy I/O load](#Pods-restart-terminate-when-heavy-load)

<br>

## NDM related

[Blockdevices are not detected by NDM in some of the nodes](#bd-from-some-nodes-are-not-detected)

[Unable to discover some of disks in Proxmox servers by OpenEBS](#unable-to-discover-proxmox-disks)

<br>

## Jiva Volume related

[Jiva replica pod logs showing meta file missing entry](#replica-pod-meta-file-error)

<br>

## cStor Volume related

[One of the cStorVolumeReplica(CVR) will have its status as `Invalid` after corresponding pool pod gets recreated](#CVR-showing-status-as-invalid-after-poolpod-gets-recreated)
<br>

## Others

[Nodes in the cluster reboots frequently almost everyday](#reboot-cluster-nodes)

<br>

<hr>

<br>

<font size="6" color="blue">Installation</font>



<h3><a class="anchor" aria-hidden="true" id="install-failed-user-rights"></a>Installation failed because of insufficient user rights</h3>

OpenEBS installation can fail in some cloud platform with the following errors.

```
namespace "openebs" created
serviceaccount "openebs-maya-operator" created
clusterrolebinding.rbac.authorization.k8s.io "openebs-maya-operator" created
deployment.apps "maya-apiserver" created
service "maya-apiserver-service" created
deployment.apps "openebs-provisioner" created
deployment.apps "openebs-snapshot-operator" created
configmap "openebs-ndm-config" created
daemonset.extensions "openebs-ndm" created
Error from server (Forbidden): error when creating "https://raw.githubusercontent.com/openebs/openebs/v0.8.x/k8s/openebs-operator.yaml": clusterroles.rbac.authorization.k8s.io "openebs-maya-operator" is forbidden: attempt to grant extra privileges: [{[*] [*] [nodes] [] []} {[*] [*] [nodes/proxy] [] []} {[*] [*] [namespaces] [] []} {[*] [*] [services] [] []} {[*] [*] [pods] [] []} {[*] [*] [deployments] [] []} {[*] [*] [events] [] []} {[*] [*] [endpoints] [] []} {[*] [*] [configmaps] [] []} {[*] [*] [jobs] [] []} {[*] [*] [storageclasses] [] []} {[*] [*] [persistentvolumeclaims] [] []} {[*] [*] [persistentvolumes] [] []} {[get] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[list] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[watch] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[create] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[update] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[patch] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[delete] [volumesnapshot.external-storage.k8s.io] [volumesnapshots] [] []} {[get] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[list] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[watch] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[create] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[update] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[patch] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[delete] [volumesnapshot.external-storage.k8s.io] [volumesnapshotdatas] [] []} {[get] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[list] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[create] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[update] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[delete] [apiextensions.k8s.io] [customresourcedefinitions] [] []} {[*] [*] [disks] [] []} {[*] [*] [storagepoolclaims] [] []} {[*] [*] [storagepools] [] []} {[*] [*] [castemplates] [] []} {[*] [*] [runtasks] [] []} {[*] [*] [cstorpools] [] []} {[*] [*] [cstorvolumereplicas] [] []} {[*] [*] [cstorvolumes] [] []} {[get] [] [] [] [/metrics]}] user=&{user.name@mayadata.io  [system:authenticated] map[user-assertion.cloud.google.com:[AKUJVpmzjjLCED3Vk2Q7wSjXV1gJs/pA3V9ZW53TOjO5bHOExEps6b2IZRjnru9YBKvaj3pgVu+34A0fKIlmLXLHOQdL/uFA4WbKbKfMdi1XC52CcL8gGTXn0/G509L844+OiM+mDJUftls7uIgOIRFAyk2QBixnYv22ybLtO2n8kcpou+ZcNFEVAD6z8Xy3ZLEp9pMd9WdQuttS506x5HIQSpDggWFf9T96yPc0CYmVEmkJm+O7uw==]]} ownerrules=[{[create] [authorization.k8s.io] [selfsubjectaccessreviews selfsubjectrulesreviews] [] []} {[get] [] [] [] [/api /api/* /apis /apis/* /healthz /openapi /openapi/* /swagger-2.0.0.pb-v1 /swagger.json /swaggerapi /swaggerapi/* /version /version/]}] ruleResolutionErrors=[]
```

**Troubleshooting**

You must enable RBAC before OpenEBS installation. This can be done from the kubernetes master console by executing the following command.

```
kubectl create clusterrolebinding  <cluster_name>-admin-binding --clusterrole=cluster-admin --user=<user-registered-email-with-the-provider>
```



<h3><a class="anchor" aria-hidden="true" id="install-failed-iscsi-not-configured"></a>iSCSI client is not setup on Nodes. Pod is in ContainerCreating state.</h3>

After OpenEBS installation, you may proceed with application deployment which will provision OpenEBS volume. This may fail due to the following error. This can be found by describing the application pod.

```
MountVolume.WaitForAttach failed for volume “pvc-ea5b871b-32d3-11e9-9bf5-0a8e969eb15a” : open /sys/class/iscsi_host: no such file or directory -
```

**Troubleshooting**

This logs points that iscsid.service may not be enabled and running on your Nodes. You need to check if the service `iscsid.service` is running. If it is not running, you have to `enable` and `start` the service. You can refer [prerequisites](/docs/next/prerequisites.html) section and choose your platform to get the steps for enabling it.



<h3><a class="anchor" aria-hidden="true" id="openebs-provsioner-restart-continuously"></a>Why does OpenEBS provisioner pod restart continuously?</h3>

The following output displays the pod status of all namespaces in which the OpenEBS provisioner is restarting continuously.

```
NAMESPACE     NAME                                         READY     STATUS             RESTARTS   AGE       IP                NODE
default       percona                                      0/1       Pending            0          36m       <none>            <none>
kube-system   calico-etcd-tl4td                            1/1       Running            0          1h        192.168.56.65     master
kube-system   calico-kube-controllers-84fd4db7cd-jz9wt     1/1       Running            0          1h        192.168.56.65     master
kube-system   calico-node-5rqdl                            2/2       Running            0          1h        192.168.56.65     master
kube-system   calico-node-zt95x                            2/2       Running            0          1h        192.168.56.66     node
kube-system   coredns-78fcdf6894-2plxb                     1/1       Running            0          1h        192.168.219.65    master
kube-system   coredns-78fcdf6894-gcjj7                     1/1       Running            0          1h        192.168.219.66    master
kube-system   etcd-master                                  1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-apiserver-master                        1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-controller-manager-master               1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-proxy-9t98s                             1/1       Running            0          1h        192.168.56.65     master
kube-system   kube-proxy-mwk9f                             1/1       Running            0          1h        192.168.56.66     node
kube-system   kube-scheduler-master                        1/1       Running            0          1h        192.168.56.65     master
openebs       maya-apiserver-5598cf68ff-tndgm              1/1       Running            0          1h        192.168.167.131   node
openebs       openebs-provisioner-776846bbff-rqfzr         0/1       CrashLoopBackOff   16         1h        192.168.167.129   node
openebs       openebs-snapshot-operator-5b5f97dd7f-np79k   0/2       CrashLoopBackOff   32         1h        192.168.167.130   node
```

**Troubleshooting**

Perform the following steps to verify if the issue is due to misconfiguration while installing the network component.

1. Check if your network related pods are running fine.
2. Check if OpenEBS provisioner HTTPS requests are reaching the apiserver
3. Use the latest version of network provider images.
4. Try other network components such as Calico, kube-router etc. if you are not using any of these.



<h3><a class="anchor" aria-hidden="true" id="install-failed-azure-no-rbac-set"></a>OpenEBS installation fails on Azure</h3>


On AKS, while installing OpenEBS using Helm,  you may see the following error.

```
$ helm installstable/openebs --name openebs --namespace openebs
Error: release openebsfailed: clusterroles.rbac.authorization.k8s.io "openebs" isforbidden: attempt to grant extra privileges:[PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["nodes"],APIGroups:["*"], Verbs:["list"]}PolicyRule{Resources:["nodes"], APIGroups:["*"],Verbs:["watch"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["get"]}PolicyRule{Resources:["nodes/proxy"], APIGroups:["*"],Verbs:["list"]} PolicyRule{Resources:["nodes/proxy"],APIGroups:["*"], Verbs:["watch"]}PolicyRule{Resources:["namespaces"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["services"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["pods"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["deployments"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["events"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["endpoints"], APIGroups:["*"],Verbs:["*"]} PolicyRule{Resources:["persistentvolumes"],APIGroups:["*"], Verbs:["*"]} PolicyRule{Resources:["persistentvolumeclaims"],APIGroups:["*"], Verbs:["*"]}PolicyRule{Resources:["storageclasses"],APIGroups:["storage.k8s.io"], Verbs:["*"]}PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["get"]} PolicyRule{Resources:["storagepools"], APIGroups:["*"],Verbs:["list"]} PolicyRule{NonResourceURLs:["/metrics"],Verbs:["get"]}] user=&{system:serviceaccount:kube-system:tiller6f3172cc-4a08-11e8-9af5-0a58ac1f1729 [system:serviceaccounts system:serviceaccounts:kube-systemsystem:authenticated] map[]} ownerrules=[]ruleResolutionErrors=[clusterroles.rbac.authorization.k8s.io"cluster-admin" not found]
```

**Troubleshooting**

You must enable RBAC on Azure before OpenEBS installation. For more details, see [Prerequisites](/docs/next/prerequisites.html).



<h3><a class="anchor" aria-hidden="true" id="multipath-conf-claims-all-scsi-devices-openshift"></a>A multipath.conf file claims all SCSI devices in OpenShift</h3>


A multipath.conf file without either find_multipaths or a manual blacklist claims all SCSI devices.

**<font size="4">Workaround</font>:**

1. Add the find_multipaths line to */etc/multipath.conf* file similar to the following snippet.

   ```
   defaults {
       user_friendly_names yes
       find_multipaths yes
   }
   ```

2. Run `multipath -w /dev/sdc` command (replace the devname with your persistent devname).



<hr>
<br>

<font size="6" color="maroon">Un-Install</font>



<h3><a class="anchor" aria-hidden="true" id="jiva-deletion-scrub-job"></a>Whenever a Jiva based PVC is deleted, a new job gets created.</h3>


As part of deleting the Jiva Volumes, OpenEBS launches scrub jobs for clearing data from the nodes. This job will be running in OpenEBS installed namespace. The completed jobs can be cleared using following command.

```
kubectl delete jobs -l openebs.io/cas-type=jiva -n <openebs_namespace>
```

In addition, the job is set with a TTL to get cleaned up, if the cluster version is greater than 1.12. However, for the feature to work, the alpha feature needs to be enabled in the cluster. More information can be read from [here](https://kubernetes.io/docs/concepts/workloads/controllers/jobs-run-to-completion/#clean-up-finished-jobs-automatically).



<h3><a class="anchor" aria-hidden="true" id="cvr-deletion"></a>cStor Volume Replicas are not getting deleted properly</h3>


Sometimes, there are chances that cStor volumes Replicas (CVR) may not be deleted properly if some unforeseen scenarios happened such as network loss during the deletion of PVC. To resolve this issue, perform the following command.

```
kubectl edit cvr <cvr_name> -n openebs
```

And then remove finalizers from the corresponding CVR. Need to remove following entries and save it.

```
finalizers:
- cstorvolumereplica.openebs.io/finalizer
```

This will automatically remove the pending CVR and delete the cStor volume completely.



<hr>
<br>

<font size="6" color="red"> Volume provisioning</font>



<h3><a class="anchor" aria-hidden="true" id="application-read-only"></a> Application complaining ReadOnly filesystem</h3>


Application sometimes complain about the underlying filesystem has become ReadOnly.

**Troubleshooting**

This can happen for many reasons. 

- The cStor target pod is evicted because of resource constraints and is not scheduled within time 
- Node is rebooted in adhoc manner (or unscheduled reboot) and Kubernetes is waiting for Kubelet to come backup to know that the node is rebooted and the pods on that node need to be rescheduled. Kubernetes can take upto 30 minutes as timeout before deciding the node does not comebackup and pods need to be rescheduled. During this time, the iSCSI initiator at the application pod has timeout and marked the underlying filesystem as ReadOnly
- cStor target has lost quorum because of underlying node losses and target has marked the lun as ReadOnly

Go through the Kubelet logs and application pod logs to know the reason for marking the ReadOnly and take appropriate action. [Maintaining volume quorum](/docs/next/k8supgrades.html) is necessary during Kuberntes node reboots. 

<h3><a class="anchor" aria-hidden="true" id="admission-server-ca"></a>Unable to create persistentVolumeClaim due to certificate verification error</h3>


An issue can appear when creating a PersistentVolumeClaim:

```
Error from server (InternalError):Internal error occurred: failed calling webhook "admission-webhook.openebs.io": Post https://admission-server-svc.openebs.svc:443/validate?timeout=30s: x509: certificate signed by unknown authority (possibly because of "crypto/rsa: verification error" while trying to verify candidate authority certificate "admission-server-ca")
```

**Troubleshooting**

By default OpenEBS chart generates TLS certificates used by the `openebs-admission-controller`, while this is handy, it requires the admission controller to restart on each `helm upgrade` command. For most of the use cases, the admission controller would have restarted to update the certificate configurations, if not , then user will get the above mentioned error.

**Workaround**

This can be fixed by restarting the admission controller:

```
kubectl -n openebs get pods -o name | grep admission-server | xargs kubectl -n openebs delete
```


<h3><a class="anchor" aria-hidden="true" id="application-pod-not-running-Rancher"></a>Application pods are not running when OpenEBS volumes are provisioned on Rancher</h3>


By default OpenEBS chart generates TLS certificates used by the `openebs-admission-controller`, while this is handy, it requires the admission controller to restart on each `helm upgrade` command. For most of the use cases, the admission controller would have restarted to update the certificate configurations, if not , then user will get the above mentioned error.

**Workaround**


This can be fixed by restarting the admission controller:

```
kubectl -n openebs get pods -o name | grep admission-server | xargs kubectl -n openebs delete
```


<h3><a class="anchor" aria-hidden="true" id="application-pod-not-running-Rancher"></a>Application pods are not running when OpenEBS volumes are provisioned on Rancher</h3>



The setup environment where the issue occurs is rancher/rke with bare metal hosts running CentOS. After installing OpenEBS, OpenEBS pods are running, but application pod is in *ContainerCreating* state. It consume Jiva volume. The output of `kubectl get pods` is displayed as follows.

```
NAME                                                             READY     STATUS              RESTARTS   AGE
nginx-deployment-57849d9f57-gvzkh                                0/1       ContainerCreating   0          2m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-ctrl-58dcdf997f-n4kd9   2/2       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-gq4z6    1/1       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-hwx52    1/1       Running             0          8m
pvc-adb79406-8e3e-11e8-a06a-001c42c2325f-rep-696b599894-vs97n    1/1       Running             0          8m
```

**Troubleshooting**

Make sure the following prerequisites are done.

1. Verify iSCSI initiator is installed on nodes and services are running. 
2. Added extra_binds under kubelet service in cluster YAML

More details are mentioned [here](/docs/next/prerequisites.html#rancher).



<h3><a class="anchor" aria-hidden="true" id="application-pod-stuck-after-deployment"></a>Application pod is stuck in ContainerCreating state after deployment</h3>

**Troubleshooting**

- Obtain the output of the `kubectl describe pod <application_pod>` and check the events.

- If the error message *executable not found in $PATH* is found, check whether the iSCSI initiator utils are installed on the node/kubelet container (rancherOS, coreOS). If not, install the same and retry deployment.

- If the warning message *FailedMount: Unable to mount volumes for pod <>: timeout expired waiting for volumes to attach/mount* is persisting use the following procedure.

  1. Check whether the Persistent Volume Claim/Persistent Volume (PVC/PV) are created successfully and the OpenEBS controller and replica pods are running. These can be verified using the `kubectl get pvc,pv` and `kubectl get pods`command.

  2. If the OpenEBS volume pods are not created, and the PVC is in pending state, check whether the storageclass referenced by the application PVC is available/installed. This can be confirmed using the `kubectl get sc` command. If this storageclass is not created, or improperly created without the appropriate attributes, recreate the same and re-deploy the application.

     **Note:** Ensure that the older PVC objects are deleted before re-deployment.

  3. If the PV is created (in bound state), but replicas are not running or are in pending state, perform a `kubectl describe <replica_pod>` and check the events. If the events indicate *FailedScheduling due to Insufficient cpu, NodeUnschedulable or MatchInterPodAffinity and PodToleratesNodeTaints*, check the following:

     - replica count is equal to or lesser than available schedulable nodes
     - there are enough resources on the nodes to run the replica pods
     - whether nodes are tainted and if so, whether they are tolerated by the OpenEBS replica pods

     Ensure that the above conditions are met and the replica rollout is successful. This will ensure application enters running state.

  4. If the PV is created and OpenEBS pods are running, use the `iscsiadm -m session` command on the node (where the pod is scheduled) to identify whether the OpenEBS iSCSI volume has been attached/logged-into. If not, verify network connectivity between the nodes.

  5. If the session is present, identify the SCSI device associated with the session using the command `iscsiadm -m session -P 3`. Once it is confirmed that the iSCSI device is available (check the output of `fdisk -l` for the mapped SCSI device), check the kubelet and system logs including the iscsid and kernel (syslog) for information on the state of this iSCSI device. If inconsistencies are observed, execute the filesyscheck on the device `fsck -y /dev/sd<>`. This will mount the volume to the node.

- In OpenShift deployments, you may face this issue with the OpenEBS replica pods continuously restarting, that is, they are in crashLoopBackOff state. This is due to the default "restricted" security context settings. Edit the following settings using `oc edit scc restricted` to get the application pod running.

  - *allowHostDirVolumePlugin: true*
  - *runAsUser: runAsAny*



<h3><a class="anchor" aria-hidden="true" id="cstor-pool-failed-centos-partion-disk"></a>Creating cStor pool fails on CentOS when there are partitions on the disk.</h3>


Creating cStor pool fails with the following error message:

```
E0920 14:51:17.474702       8 pool.go:78] Unable to create pool: /dev/disk/by-id/ata-WDC_WD2500BPVT-00JJ
```

sdb and sdc are used for cStor pool creation.

```
core@k8worker02 ~ $ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINT
sda           8:0    0 111.8G  0 disk
|-sda1        8:1    0   128M  0 part  /boot
|-sda2        8:2    0     2M  0 part
|-sda3        8:3    0     1G  0 part
| `-usr     254:0    0  1016M  1 crypt /usr
|-sda4        8:4    0     1G  0 part
|-sda6        8:6    0   128M  0 part  /usr/share/oem
|-sda7        8:7    0    64M  0 part
`-sda9        8:9    0 109.5G  0 part  /
sdb           8:16   0 111.8G  0 disk
sdc           8:32   0 232.9G  0 disk
|-sdc1        8:33   0     1G  0 part
`-sdc2        8:34   0 231.9G  0 part
 |-cl-swap 254:1    0   7.8G  0 lvm
 |-cl-home 254:2    0 174.1G  0 lvm
 `-cl-root 254:3    0    50G  0 lvm
```

**Troubleshooting**

1. Clear the partitions on the portioned disk.

2. Run the following command on the host machine to check any LVM handler on the device.

   ```
   sudo dmsetup info -C
   ```

   Output of the above command will be similar to the following.

   ```
   Name             Maj Min Stat Open Targ Event  UUID                                                                 
   usr              254   0 L--r    1    1      0 CRYPT-VERITY-959135d6b3894b3b8125503de238d5c4-usr                   
   centos-home      254   2 L--w    0    1      0 LVM-1kqWMeQWqH3qTsiHhYw3ygAzOvpfDL58dDmziWBI0panwOGRq2rp9PjpmE6qdf1V
   centos-swap      254   1 L--w    0    1      0 LVM-1kqWMeQWqH3qTsiHhYw3ygAzOvpfDL58UIVFhLkzvE1mk7uCy2nePlktBHfTuTYF
   centos-root      254   3 L--w    0    1      0 LVM-1kqWMeQWqH3qTsiHhYw3ygAzOvpfDL58WULaIYm0X7QmrwQaWYxz1hTwzWocAwYJ
   ```

   If the output is similar to the above, you must remove the handler on the device.

   ```
   sudo dmsetup remove centos-home
   sudo dmsetup remove centos-swap
   sudo dmsetup remove centos-root
   ```



<h3><a class="anchor" aria-hidden="true" id="application-crashloopbackoff"></a>Application pod enters CrashLoopBackOff states</h3>


Application pod enters CrashLoopBackOff state

This issue is due to failed application operations in the container. Typically this is caused due to failed writes on the mounted PV. To confirm this, check the status of the PV mount inside the application pod.

**Troubleshooting**

- Perform a `kubectl exec -it <app>` bash (or any available shell) on the application pod and attempt writes on the volume mount. The volume mount can be obtained either from the application specification ("volumeMounts" in container spec) or by performing a `df -h` command in the controller shell (the OpenEBS iSCSI device will be mapped to the volume mount).
- The writes can be attempted using a simple command like `echo abc > t.out` on the mount. If the writes fail with *Read-only file system errors*, it means the iSCSI connections to the OpenEBS volumes are lost. You can confirm by checking the node's system logs including iscsid, kernel (syslog) and the kubectl logs (`journalctl -xe, kubelet.log`).
- iSCSI connections usually fail due to the following.
  - flaky networks (can be confirmed by ping RTTs, packet loss etc.) or failed networks between -
    - OpenEBS PV controller and replica pods
    - Application and controller pods
  - Node failures
  - OpenEBS volume replica crashes or restarts due to software bugs
- In all the above cases, loss of the device for a period greater than the node iSCSI initiator timeout causes the volumes to be re-mounted as RO.
- In certain cases, the node/replica loss can lead to the replica quorum not being met (i.e., less than 51% of replicas available) for an extended period of time, causing the OpenEBS volume to be presented as a RO device.

**Workaround/Recovery**

The procedure to ensure application recovery in the above cases is as follows:

1. Resolve the system issues which caused the iSCSI disruption/RO device condition. Depending on the cause, the resolution steps may include recovering the failed nodes, ensuring replicas are brought back on the same nodes as earlier, fixing the network problems and so on.

2. Ensure that the OpenEBS volume controller and replica pods are running successfully with all replicas in *RW mode*. Use the command `curl GET http://<ctrl ip>:9501/v1/replicas | grep createTypes` to confirm.

3. If anyone of the replicas are still in RO mode, wait for the synchronization to complete. If all the replicas are in RO mode (this may occur when all replicas re-register into the controller within short intervals), you must restart the OpenEBS volume controller using the `kubectl delete pod <pvc-ctrl>` command . Since it is a Kubernetes deployment, the controller pod is restarted successfully. Once done, verify that all replicas transition into *RW mode*.

4. Un-mount the stale iscsi device mounts on the application node. Typically, these devices are mounted in the `/var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/<target-portal:iqn>-lun-0` path.

   Example:

   ```
   umount /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.39.241.26:
   3260-iqn.2016-09.com.openebs.jiva:mongo-jiva-mongo-persistent-storage-mongo-0-3481266901-lun-0
   
   umount /var/lib/kubelet/pods/ae74da97-c852-11e8-a219-42010af000b6/volumes/kuber
   netes.io~iscsi/mongo-jiva-mongo-persistent-storage-mongo-0-3481266901
   ```

5. Identify whether the iSCSI session is re-established after failure. This can be verified using `iscsiadm -m session`, with the device mapping established using `iscsiadm -m session -P 3` and `fdisk -l`. **Note:** Sometimes, it is observed that there are stale device nodes (scsi device names) present on the Kubernetes node. Unless the logs confirm that a re-login has occurred after the system issues were resolved, it is recommended to perform the following step after doing a purge/logout of the existing session using `iscsiadm -m node -T <iqn> -u`.

6. If the device is not logged in again, ensure that the network issues/failed nodes/failed replicas are resolved, the device is discovered, and the session is re-established. This can be achieved using the commands `iscsiadm -m discovery -t st -p <ctrl svc IP>:3260` and `iscsiadm -m node -T <iqn> -l` respectively.

7. Identify the new SCSI device name corresponding to the iSCSI session (the device name may or may not be the same as before).

8. Re-mount the new disk into the mountpoint mentioned earlier using the `mount -o rw,relatime,data=ordered /dev/sd<> <mountpoint>` command. If the re-mount fails due to inconsistencies on the device (unclean filesystem), perform a filesyscheck `fsck -y /dev/sd<>`.

9. Ensure that the application uses the newly mounted disk by forcing it to restart on the same node. Use the command`docker stop <id>` of the application container on the node. Kubernetes will automatically restart the pod to ensure the "desirable" state.

   While this step may not be necessary most times (as the application is already undergoing periodic restarts as part of the CrashLoop cycle), it can be performed if the application pod's next restart is scheduled with an exponential back-off delay.

**Notes:**

1. The above procedure works for applications that are either pods or deployments/statefulsets. In case of the latter, the application pod can be restarted (i.e., deleted) after step-4 (iscsi logout) as the deployment/statefulset controller will take care of rescheduling the application on a same/different node with the volume.



<h3><a class="anchor" aria-hidden="true" id="cstor-pool-pod-not-running"></a>cStor pool pods are not running</h3>


The cStor disk pods are not coming up after it deploy with the YAML. On checking the pool pod logs, it says `/dev/xvdg is in use and contains a xfs filesystem.`

**Workaround:**

cStor can consume disks that are attached (are visible to OS as SCSI devices) to the Nodes and no need of format these disks. This means disks should not have any filesystem and it should be unmounted on the Node. It is also recommended to wipe out the disks if you are using an used disk for cStor pool creation.



<h3><a class="anchor" aria-hidden="true" id="Jiva-provisioning-failed-080"></a>OpenEBS Jiva PVC is not provisioning in 0.8.0</h3>


Even all OpenEBS pods are in running state, unable to provision Jiva volume if you install through helm.

**Troubleshooting:**

Check the latest logs showing in the OpenEBS provisioner logs. If the particular PVC creation entry logs are not coming on the OpenEBS provisioner pod, then restart the OpenEBS provisioner pod. From 0.8.1 version, liveness probe feature will check the OpenEBS provisioner pod status periodically and ensure its availability for OpenEBS PVC creation.



<h3><a class="anchor" aria-hidden="true" id="recovery-readonly-when-kubelet-is-container"></a>Recovery procedure for Read-only volume where kubelet is running in a container.</h3>


In environments where the kubelet runs in a container, perform the following steps as part of the recovery procedure for a Volume-Read only issue.

1. Confirm that the OpenEBS target does not exist as a Read Only device by the OpenEBS controller and that all replicas are in Read/Write mode.
   - Un-mount the iSCSI volume from the node in which the application pod is scheduled.
   - Perform the following iSCSI operations from inside the kubelet container.
     - Logout
     - Rediscover
     - Login
   - Perform the following iSCSI operations from inside the kubelet container.
   - Re-mount the iSCSI device (may appear with a new SCSI device name) on the node.
   - Verify if the application pod is able to start using/writing into the newly mounted device.
2. Once the application is back in "Running" state post recovery by following steps 1-9, if existing/older data is not visible (i.e., it comes up as a fresh instance), it is possible that the application pod is using the docker container filesystem instead of the actual PV (observed sometimes due to the reconciliation attempts by Kubernetes to get the pod to a desired state in the absence of the mounted iSCSI disk). This can be checked by performing a `df -h` or `mount` command inside the application pods. These commands should show the scsi device `/dev/sd*` mounted on the specified mount point. If not, the application pod can be forced to use the PV by restarting it (deployment/statefulset) or performing a docker stop of the application container on the node (pod).



<h3><a class="anchor" aria-hidden="true" id="recovery-readonly-xfs-volume"></a>Recovery procedure for Read-only volume for XFS formatted volumes</h3>


In case of `XFS` formatted volumes, perform the following steps once the iSCSI target is available in RW state & logged in:

- Un-mount the iSCSI volume from the node in which the application pod is scheduled. This may cause the application to enter running state by using the local mount point.
- Mount to volume to a new (temp) directory to replay the metadata changes in the log
- Unmount the volume again
- Perform `xfs_repair /dev/<device>`. This fixes if any file system related errors on the device
- Perform application pod deletion to facilitate fresh mount of the volume. At this point, the app pod may be stuck on `terminating` OR `containerCreating` state. This can be resolved by deleting the volume folder (w/ app content) on the local directory.



<h3><a class="anchor" aria-hidden="true" id="unable-to-clone-from-snapshot"></a>Unable to clone OpenEBS volume from snapshot</h3>


Taken a snapshot of a PVC successfully. But unable to clone the volume from the snapshot.

**Troubleshooting:**

Logs from snapshot-controller pods  are follows.

```
ERROR: logging before flag.Parse: I0108 18:11:54.017909      1 volume.go:73] OpenEBS volume provisioner namespace openebs
I0108 18:11:54.181897      1 snapshot-controller.go:95] starting snapshot controller
I0108 18:11:54.200069      1 snapshot-controller.go:167] Starting snapshot controller
I0108 18:11:54.200139      1 controller_utils.go:1027] Waiting for caches to sync for snapshot-controller controller
I0108 18:11:54.300430      1 controller_utils.go:1034] Caches are synced for snapshot-controller controller
I0108 23:12:26.170921      1 snapshot-controller.go:190] [CONTROLLER] OnAdd /apis/volumesnapshot.external-storage.k8s.io/v1/namespaces/default/volumesnapshots/xl-release-snapshot, Snapshot &v1.VolumeSnapshot{TypeMeta:v1.TypeMeta{Kind:"", APIVersion:""}, Metadata:v1.ObjectMeta{Name:"xl-release-snapshot", GenerateName:"", Namespace:"default", SelfLink:"/apis/volumesnapshot.external-storage.k8s.io/v1/namespaces/default/volumesnapshots/xl-release-snapshot", UID:"dc804d0d-139a-11e9-9561-005056949728", ResourceVersion:"2072353", Generation:1, CreationTimestamp:v1.Time{Time:time.Time{wall:0x0, ext:63682585945, loc:(*time.Location)(0x2a17900)}}, DeletionTimestamp:(*v1.Time)(nil), DeletionGracePeriodSeconds:(*int64)(nil), Labels:map[string]string(nil), Annotations:map[string]string{"kubectl.kubernetes.io/last-applied-configuration":"{\"apiVersion\":\"volumesnapshot.external-storage.k8s.io/v1\",\"kind\":\"VolumeSnapshot\",\"metadata\":{\"annotations\":{},\"name\":\"xl-release-snapshot\",\"namespace\":\"default\"},\"spec\":{\"persistentVolumeClaimName\":\"xlr-data-pvc\"}}\n"}, OwnerReferences:[]v1.OwnerReference(nil), Initializers:(*v1.Initializers)(nil), Finalizers:[]string(nil), ClusterName:""}, Spec:v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:""}, Status:v1.VolumeSnapshotStatus{CreationTimestamp:v1.Time{Time:time.Time{wall:0x0, ext:0, loc:(*time.Location)(nil)}}, Conditions:[]v1.VolumeSnapshotCondition(nil)}}
I0108 23:12:26.210135      1 desired_state_of_world.go:76] Adding new snapshot to desired state of world: default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728
E0108 23:12:26.288184      1 snapshotter.go:309] No conditions for this snapshot yet.
I0108 23:12:26.295175      1 snapshotter.go:160] No VolumeSnapshotData objects found on the API server
I0108 23:12:26.295224      1 snapshotter.go:458] findSnapshot: snapshot xl-release-snapshot
I0108 23:12:26.355476      1 snapshotter.go:469] findSnapshot: find snapshot xl-release-snapshot by tags &map[].
I0108 23:12:26.355550      1 processor.go:183] FindSnapshot by tags: map[string]string(nil)
I0108 23:12:26.355575      1 snapshotter.go:449] syncSnapshot: Creating snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 ...
I0108 23:12:26.355603      1 snapshotter.go:491] createSnapshot: Creating snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 through the plugin ...
I0108 23:12:26.373908      1 snapshotter.go:497] createSnapshot: Creating metadata for snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728.
I0108 23:12:26.373997      1 snapshotter.go:701] In updateVolumeSnapshotMetadata
I0108 23:12:26.380908      1 snapshotter.go:721] updateVolumeSnapshotMetadata: Metadata UID: dc804d0d-139a-11e9-9561-005056949728 Metadata Name: xl-release-snapshot Metadata Namespace: default Setting tags in Metadata Labels: map[string]string{"SnapshotMetadata-Timestamp":"1546989146380869451", "SnapshotMetadata-PVName":"pvc-5f9bd5ec-1398-11e9-9561-005056949728"}.
I0108 23:12:26.391791      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:""}
I0108 23:12:26.391860      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:""}
I0108 23:12:26.392281      1 snapshotter.go:742] updateVolumeSnapshotMetadata: returning cloudTags [map[string]string{"kubernetes.io/created-for/snapshot/namespace":"default", "kubernetes.io/created-for/snapshot/name":"xl-release-snapshot", "kubernetes.io/created-for/snapshot/uid":"dc804d0d-139a-11e9-9561-005056949728", "kubernetes.io/created-for/snapshot/timestamp":"1546989146380869451"}]
I0108 23:12:26.392661      1 snapshot.go:53] snapshot Spec Created:
{"metadata":{"name":"pvc-5f9bd5ec-1398-11e9-9561-005056949728_xl-release-snapshot_1546989146392411824","namespace":"default","creationTimestamp":null},"spec":{"casType":"jiva","volumeName":"pvc-5f9bd5ec-1398-11e9-9561-005056949728"}}
I0108 23:12:26.596285      1 snapshot.go:84] Snapshot Successfully Created:
{"apiVersion":"v1alpha1","kind":"CASSnapshot","metadata":{"name":"pvc-5f9bd5ec-1398-11e9-9561-005056949728_xl-release-snapshot_1546989146392411824"},"spec":{"casType":"jiva","volumeName":"pvc-5f9bd5ec-1398-11e9-9561-005056949728"}}
I0108 23:12:26.596362      1 snapshotter.go:276] snapshot created: &{<nil> <nil> <nil> <nil> <nil> 0xc420038a00}. Conditions: &[]v1.VolumeSnapshotCondition{v1.VolumeSnapshotCondition{Type:"Ready", Status:"True", LastTransitionTime:v1.Time{Time:time.Time{wall:0xbf056976a38b90b7, ext:18032657942280, loc:(*time.Location)(0x2a17900)}}, Reason:"", Message:"Snapshot created successfully"}}
I0108 23:12:26.596439      1 snapshotter.go:508] createSnapshot: create VolumeSnapshotData object for VolumeSnapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728.
I0108 23:12:26.596478      1 snapshotter.go:533] createVolumeSnapshotData: Snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728. Conditions: &[]v1.VolumeSnapshotCondition{v1.VolumeSnapshotCondition{Type:"Ready", Status:"True", LastTransitionTime:v1.Time{Time:time.Time{wall:0xbf056976a38b90b7, ext:18032657942280, loc:(*time.Location)(0x2a17900)}}, Reason:"", Message:"Snapshot created successfully"}}
I0108 23:12:26.604409      1 snapshotter.go:514] createSnapshot: Update VolumeSnapshot status and bind VolumeSnapshotData to VolumeSnapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728.
I0108 23:12:26.604456      1 snapshotter.go:860] In bindVolumeSnapshotDataToVolumeSnapshot
I0108 23:12:26.604472      1 snapshotter.go:862] bindVolumeSnapshotDataToVolumeSnapshot: Namespace default Name xl-release-snapshot
I0108 23:12:26.608792      1 snapshotter.go:877] bindVolumeSnapshotDataToVolumeSnapshot: Updating VolumeSnapshot object [&v1.VolumeSnapshot{TypeMeta:v1.TypeMeta{Kind:"", APIVersion:""}, Metadata:v1.ObjectMeta{Name:"xl-release-snapshot", GenerateName:"", Namespace:"default", SelfLink:"/apis/volumesnapshot.external-storage.k8s.io/v1/namespaces/default/volumesnapshots/xl-release-snapshot", UID:"dc804d0d-139a-11e9-9561-005056949728", ResourceVersion:"2072354", Generation:2, CreationTimestamp:v1.Time{Time:time.Time{wall:0x0, ext:63682585945, loc:(*time.Location)(0x2a17900)}}, DeletionTimestamp:(*v1.Time)(nil), DeletionGracePeriodSeconds:(*int64)(nil), Labels:map[string]string{"SnapshotMetadata-Timestamp":"1546989146380869451", "SnapshotMetadata-PVName":"pvc-5f9bd5ec-1398-11e9-9561-005056949728"}, Annotations:map[string]string{"kubectl.kubernetes.io/last-applied-configuration":"{\"apiVersion\":\"volumesnapshot.external-storage.k8s.io/v1\",\"kind\":\"VolumeSnapshot\",\"metadata\":{\"annotations\":{},\"name\":\"xl-release-snapshot\",\"namespace\":\"default\"},\"spec\":{\"persistentVolumeClaimName\":\"xlr-data-pvc\"}}\n"}, OwnerReferences:[]v1.OwnerReference(nil), Initializers:(*v1.Initializers)(nil), Finalizers:[]string(nil), ClusterName:""}, Spec:v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}, Status:v1.VolumeSnapshotStatus{CreationTimestamp:v1.Time{Time:time.Time{wall:0x0, ext:0, loc:(*time.Location)(nil)}}, Conditions:[]v1.VolumeSnapshotCondition{v1.VolumeSnapshotCondition{Type:"Ready", Status:"True", LastTransitionTime:v1.Time{Time:time.Time{wall:0xbf056976a38b90b7, ext:18032657942280, loc:(*time.Location)(0x2a17900)}}, Reason:"", Message:"Snapshot created successfully"}}}}]
I0108 23:12:26.617060      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:""}
I0108 23:12:26.617102      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0108 23:12:26.617118      1 desired_state_of_world.go:76] Adding new snapshot to desired state of world: default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728
I0108 23:12:26.617449      1 snapshotter.go:202] In waitForSnapshot: snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 snapshot data k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7
I0108 23:12:26.620951      1 snapshotter.go:241] waitForSnapshot: Snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 created successfully. Adding it to Actual State of World.
I0108 23:12:26.620991      1 actual_state_of_world.go:74] Adding new snapshot to actual state of world: default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728
I0108 23:12:26.621005      1 snapshotter.go:526] createSnapshot: Snapshot default/xl-release-snapshot-dc804d0d-139a-11e9-9561-005056949728 created successfully.
I0109 00:11:54.211526      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 00:11:54.211695      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 01:11:54.211693      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 01:11:54.211817      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 02:11:54.211890      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 02:11:54.212010      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 03:11:54.212062      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 03:11:54.212201      1 snapshot-controller.go:198] [CONTROLLER] OnUpdate newObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc", SnapshotDataName:"k8s-volume-snapshot-dd0c3a0d-139a-11e9-a875-467fb97678b7"}
I0109 04:11:54.212249      1 snapshot-controller.go:197] [CONTROLLER] OnUpdate oldObj: v1.VolumeSnapshotSpec{PersistentVolumeClaimName:"xlr-data-pvc",
```

**Resolution:**

This can be happen due to the stale entries of snapshot and snapshot data. By deleting those entries will resolve this issue. 



<h3><a class="anchor" aria-hidden="true" id="unable-to-mount-xfs-volume"></a>Unable to mount XFS formatted volumes into Pod</h3>


I created PVC with FSType as `xfs`. OpenEBS PV is successfully created and I have verified that iSCSI initiator is available on the Application node. But application pod is unable to mount the volume.

**Troubleshooting:**

 Describing application pod is showing following error:

```
Events:
  Type     Reason                  Age                From                     Message
  ----     ------                  ----               ----                     -------
  Warning  FailedScheduling        58s (x2 over 59s)  default-scheduler        pod has unbound PersistentVolumeClaims (repeated 4 times)
  Normal   Scheduled               58s                default-scheduler        Successfully assigned redis-master-0 to node0
  Normal   SuccessfulAttachVolume  58s                attachdetach-controller  AttachVolume.Attach succeeded for volume "pvc-a036d681-8fd4-11e8-ad96-de1a202c9007"
  Normal   SuccessfulMountVolume   55s                kubelet, node0           MountVolume.SetUp succeeded for volume "default-token-ngjhh"
  Warning  FailedMount             24s (x4 over 43s)  kubelet, node0           MountVolume.WaitForAttach failed for volume "pvc-a036d681-8fd4-11e8-ad96-de1a202c9007" : failed to get any path for iscsi disk, last err seen:
iscsi: failed to sendtargets to portal 10.233.27.8:3260 output: iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: cannot make connection to 10.233.27.8: Connection refused
iscsiadm: connection login retries (reopen_max) 5 exceeded
iscsiadm: No portals found
, err exit status 21
  Warning  FailedMount  8s (x2 over 17s)  kubelet, node0  MountVolume.MountDevice failed for volume "pvc-a036d681-8fd4-11e8-ad96-de1a202c9007" : executable file not found in $PATH
```

kubelet had following errors during mount process:
```
kubelet[687]: I0315 15:14:54.179765     687 mount_linux.go:453] `fsck` error fsck from util-linux 2.27.1
kubelet[687]: fsck.ext2: Bad magic number in super-block while trying to open /dev/sdn
kubelet[687]: /dev/sdn:
kubelet[687]: The superblock could not be read or does not describe a valid ext2/ext3/ext4
kubelet[687]: filesystem.  If the device is valid and it really contains an ext2/ext3/ext4
```
And dmesg was showing errors like:
```
[5985377.220132] XFS (sdn): Invalid superblock magic number
[5985377.306931] XFS (sdn): Invalid superblock magic number
```

**Resolution:**

This can happen due to `xfs_repair` failure on the application node. Make sure that the application node has `xfsprogs` package installed. 

```
apt install xfsprogs
```



<h3><a class="anchor" aria-hidden="true" id="unable-to-create-or-delete-a-pvc"></a>Unable to create or delete a PVC</h3>


User is unable to create a new PVC or delete an existing PVC. While doing any of these operation, the following error is coming on the PVC.

```
Error from server (InternalError): Internal error occurred: failed calling webhook "admission-webhook.openebs.io": Post https://admission-server-svc.openebs.svc:443/validate?timeout=30s: Bad Gateway
```

**Workaround:**

When a user creates or deletes a PVC, there are validation triggers and a request has been intercepted by the admission webhook controller after authentication/authorization from kube-apiserver.
By default admission webhook service has been configured to 443 port and the error above suggests that either port 443 is not allowed to use in cluster or admission webhook service has to be allowed in k8s cluster Proxy settings.

<hr>


User is unable to create a new PVC or delete an existing PVC. While doing any of these operation, the following error is coming on the PVC.

```
Error from server (InternalError): Internal error occurred: failed calling webhook "admission-webhook.openebs.io": Post https://admission-server-svc.openebs.svc:443/validate?timeout=30s: Bad Gateway
```

**Workaround:**

When a user creates or deletes a PVC, there are validation triggers and a request has been intercepted by the admission webhook controller after authentication/authorization from kube-apiserver.
By default admission webhook service has been configured to 443 port and the error above suggests that either port 443 is not allowed to use in cluster or admission webhook service has to be allowed in k8s cluster Proxy settings.


<br>
<h3><a class="anchor" aria-hidden="true" id="unable-to-provision-openebs-volume-on-DigitalOcean"></a>Unable to provision OpenEBS volume on DigitalOcean</h3>
<br>
User is unable to provision cStor or jiva volume on DigitalcOcean, encountering error thrown from iSCSI PVs: 
<br>

```
MountVolume.WaitForAttach failed for volume “pvc-293d3560-a5c3–41d5–8911–67f33115b8ee” : executable file not found in $PATH
```

**Resolution :**

To avoid this issue, the Kubelet Service needs to be updated to mount the required packages to establish iSCSI connection to the target. Kubelet Service on all the nodes in the cluster should be updated.
<blockquote>
 The exact mounts may vary depending on the OS. <br><br>The following steps have been verified on:<br>
1. Digital Ocean Kubernetes Release: 1.15.3-do.2<br>
2. Nodes running OS Debian Release: 9.11
</blockquote>



 Add the below lines (volume mounts) to the file on each of the nodes:
 ```
 /etc/systemd/system/kubelet.service 
 ```
```
-v /sbin/iscsiadm:/usr/bin/iscsiadm \
-v /lib/x86_64-linux-gnu/libisns-nocrypto.so.0:/lib/x86_64-linux-gnu/libisns-nocrypto.so.0 \
```

<b>Restart the kubelet service using the following commands:</b>
```
systemctl daemon-reload
service kubelet restart
```

To know more about provisioning cStor volume on DigitalOcean<a href="/docs/next/prerequisites.html#do"> click here</a>
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
<font size="6" color="blue">NDM related</font>



<h3><a class="anchor" aria-hidden="true" id="bd-from-some-nodes-are-not-detected"></a>Blockdevices are not detected by NDM from some of the nodes</h3>


One disk is attached per Node in a 3 Node cluster in a VM Environment where CentOS is underlying OS and `kubectl get blockdevice -n openebs`  return only one disk. Also if the particular node is restarted, from where the disk is detected then the description of the disk attached to that node gets modified. `lsblk` output from one of the nodes:

```
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda               8:0    0   32G  0 disk 
|-sda1            8:1    0    1G  0 part /boot
`-sda2            8:2    0   31G  0 part 
  |-centos-root 253:0    0 27.8G  0 lvm  /
  `-centos-swap 253:1    0  3.2G  0 lvm  [SWAP]
sdb               8:16   0   50G  0 disk 
sr0              11:0    1 1024M  0 rom 
```

**Troubleshooting:**

Check `kubectl get blockdevice -o yaml` of one of the blockdevice and check its serial number. Also ensure that serial number of other 2 blockdevices are different. NDM detect and recognise the blockdevice based on their WWN, Model, Serial and Vendor. If the blockdevice have all the parameters same then NDM cannot differentiate the blockdevice and will create only 1 BlockdDevice CR for each unique parameter. To troubleshoot the same user has to make sure the blockdevices are having at least any one unique parameter from WWN, Model, Serial and Vendor. Usually this issue faced in virtualization environment like vSphere, KVM etc.

**Resolution:**

Download custom blockdevice CR YAML file from [here](https://raw.githubusercontent.com/openebs/node-disk-manager/master/deploy/crds/openebs_v1alpha1_blockdevice_cr.yaml) and apply with the details of each block device. In the sample spec, `ndm.io/managed:` is set to false. So NDM will not manage this <br>blockdevice.

**Note:** If you are creating a block device CR manually for a custom device path, then you must add the corresponding device path under `exclude` filter so that NDM will not select the particular device for BD creation. For example, if block device CR is creating for `/dev/sdb` manually, then you must add `/dev/sdb` under `exclude` filter of NDM configuration. See [here](#Exclude-filters) for customizing the `exclude` filter in NDM configuration.

<br>

<h3><a class="anchor" aria-hidden="true" id="unable-to-discover-proxmox-disks"></a>Unable to discover some of disks in Proxmox servers by OpenEBS</h3>

User is having a 3 node cluster with 8 disks attached on each node. But `kubectl get bd -n openebs` is not detecting all the blockdevices. It is detecting some of the blockdevices from each node. This information can be obtained by running `kubectl describe bd <bd_cr_name> -n openebs`.

**Troubleshooting:**

Check `kubectl get blockdevice -o yaml` of one of the blockdevice and its serial number. Also, ensure that the serial number of other 2 blockdevices are different. NDM detect and recognize the blockdevice based on their WWN, Model, Serial and Vendor. If the blockdevice have all the parameters same then NDM cannot differentiate the blockdevice and will create only 1 BlockdDevice CR for each unique parameter. To troubleshoot the same user has to make sure the blockdevices are having at least anyone unique parameter from WWN, Model, Serial and Vendor. Usually this issue is faced in virtualization environment like vSphere, KVM etc. More details abour NDM daemon set functionalities can be read from [here](/docs/next/ndm.html#ndm-daemonset-functions).

**Resolution:**

This can be resolved this by modifying the configuration file of a VM:

- Open conf file by following command

  ```
  vi /etc/pve/qemu-server/101.conf
  ```

- Add a serial number by following way:

  ```
  scsi1: 
  images:vm-101-disk-1,cache=writeback,discard=on,size=120G,ssd=1,serial=5fb20ba17c2f
  ```

- Restart the VM:

  ```
  qm shutdown 101 && qm start 101
  ```

- Verify the disk path for all the disks in a VM:

  ```
  ls -lah /dev/disk/by-id
  ```

- Repeat the same procedure on other nodes and ensure the uniqueness of disks in all the Nodes.


<hr>


<br>

<font size="6" color="maroon">Jiva volume related</font>



<h3><a class="anchor" aria-hidden="true" id="replica-pod-meta-file-error"></a>Jiva replica pod logs showing "Failed to find metadata"</h3>


Jiva target pod may not be syncing data across all replicas when replica pod logs contains below kind of messages:

```
level=error msg="Error in request: Failed to find metadata for volume-snap-b72764f0-4ca8-49b1-b9ca-57cb9dfb6fa9.img"
```

**Troubleshooting**:

Perform following steps to restore the missing metadata file of internal snapshots.

- Check all replica pods are in running state. Faulty replica pod will be in `crashloopBackoff` state in OpenEBS 1.0.0 version.

- Find the replica in `RW` mode using mayactl command, consider it as healthy.

- Consider the replica that have above kind of error messages in its logs as faulty.

- Log in to the nodes of healthy and faulty replica and list all the snapshots under **/var/openebs/<PV-name>**.

  Example snippet of Healthy replica:

  ```
  revision.counter                                           volume-snap-792e7036-877d-4807-9641-4843c987d0a5.img
  volume-head-005.img                                        volume-snap-792e7036-877d-4807-9641-4843c987d0a5.img.meta
  volume-head-005.img.meta                                   volume-snap-b72764f0-4ca8-49b1-b9ca-57cb9dfb6fa9.img
  volume-snap-15660574-e47d-4217-ac92-1497e5b654a4.img       volume-snap-b72764f0-4ca8-49b1-b9ca-57cb9dfb6fa9.img.meta
  volume-snap-15660574-e47d-4217-ac92-1497e5b654a4.img.meta  volume-snap-cce9eb61-8f8b-42bd-ba44-8479ada98cee.img
  volume-snap-2ac410ca-2716-4255-94b1-39105b627270.img       volume-snap-cce9eb61-8f8b-42bd-ba44-8479ada98cee.img.meta
  volume-snap-2ac410ca-2716-4255-94b1-39105b627270.img.meta  volume-snap-d9f8d3db-9434-4f16-a5a7-b1b120ceae94.img
  volume-snap-466d32e7-c443-46dd-afdd-8412e76f348e.img       volume-snap-d9f8d3db-9434-4f16-a5a7-b1b120ceae94.img.meta
  volume-snap-466d32e7-c443-46dd-afdd-8412e76f348e.img.meta  volume.meta
  ```

  Example snippet of of faulty replica:

  ```
  revision.counter                                           volume-snap-792e7036-877d-4807-9641-4843c987d0a5.img
  volume-head-005.img                                        volume-snap-792e7036-877d-4807-9641-4843c987d0a5.img.meta
  volume-head-005.img.meta                                   volume-snap-b72764f0-4ca8-49b1-b9ca-57cb9dfb6fa9.img
  volume-snap-15660574-e47d-4217-ac92-1497e5b654a4.img       volume-snap-15660574-e47d-4217-ac92-1497e5b654a4.img.meta  volume-snap-cce9eb61-8f8b-42bd-ba44-8479ada98cee.img
  volume-snap-2ac410ca-2716-4255-94b1-39105b627270.img       volume-snap-cce9eb61-8f8b-42bd-ba44-8479ada98cee.img.meta
  volume-snap-2ac410ca-2716-4255-94b1-39105b627270.img.meta  volume-snap-d9f8d3db-9434-4f16-a5a7-b1b120ceae94.img
  volume-snap-466d32e7-c443-46dd-afdd-8412e76f348e.img       volume-snap-d9f8d3db-9434-4f16-a5a7-b1b120ceae94.img.meta
  volume-snap-466d32e7-c443-46dd-afdd-8412e76f348e.img.meta  volume.meta
  ```

  From above snippet of faulty replica, metadata for the `volume-snap-b72764f0-4ca8-49b1-b9ca-57cb9dfb6fa9.img`  snapshot is not present.

- If only one meta file is missing, then copy meta file name and content from one of the healthy replica to the faulty replica.

  For above case, copy `volume-snap-b72764f0-4ca8-49b1-b9ca-57cb9dfb6fa9.img.meta`from healthy replica to faulty replica and restart the faulty replica. You can verify the logs of the replica pod to ensure that there are no error messages as mentioned above. 

- If multiple meta files are missing, then delete all files from replica pods and then restart the faulty replica pod to rebuild from healthy replica.


<hr>
<br>

<font size="6" color="brown">cStor Volume related</font> 



<h3><a class="anchor" aria-hidden="true" id="CVR-showing-status-as-invalid-after-poolpod-gets-recreated"></a>One of the cStorVolumeReplica(CVR) will have its status as `Invalid` after corresponding pool pod gets recreated</h3>

User has deleted a cStor pool pod and one of the CVR's status changed to `Invalid` after new pool pod gets created.
Following is a sample output of `kubectl get cvr -n openebs`

```
NAME                                                         USED   ALLOCATED   STATUS    AGE
pvc-738f76c0-b553-11e9-858e-54e1ad4a9dd4-cstor-sparse-p8yp   6K     6K          Invalid   6m
```

**Troubleshooting**

Sample logs of `cstor-pool-mgmt` when issue happens:
```
rm /usr/local/bin/zrepl
exec /usr/local/bin/cstor-pool-mgmt start
I0802 18:35:13.814623 6 common.go:205] CStorPool CRD found   # Check this entry   
I0802 18:35:13.822382 6 common.go:223] CStorVolumeReplica CRD found
I0802 18:35:13.824957 6 new_pool_controller.go:103] Setting up event handlers
I0802 18:35:13.827058 6 new_pool_controller.go:105] Setting up event handlers for CSP
I0802 18:35:13.829547 6 new_replica_controller.go:118] will set up informer event handlers for cvr
I0802 18:35:13.830341 6 new_backup_controller.go:104] Setting up event handlers for backup
I0802 18:35:13.837775 6 new_restore_controller.go:103] Setting up event handlers for restore
I0802 18:35:13.845333 6 run_pool_controller.go:38] Starting CStorPool controller
I0802 18:35:13.845388 6 run_pool_controller.go:41] Waiting for informer caches to sync
I0802 18:35:13.847407 6 run_pool_controller.go:38] Starting CStorPool controller
I0802 18:35:13.847458 6 run_pool_controller.go:41] Waiting for informer caches to sync
I0802 18:35:13.856572 6 new_pool_controller.go:124] cStorPool Added event : cstor-sparse-p8yp, 48d3b2ba-b553-11e9-858e-54e1ad4a9dd4
I0802 18:35:13.857226 6 event.go:221] Event(v1.ObjectReference{Kind:"CStorPool", Namespace:"", Name:"cstor-sparse-p8yp", UID:"48d3b2ba-b553-11e9-858e-54e1ad4a9dd4", APIVersion:"openebs.io/v1alpha1", ResourceVersion:"1998", FieldPath:""}): type: 'Normal' reason: 'Synced' Received Resource create event
I0802 18:35:13.867953 6 common.go:262] CStorPool found
I0802 18:35:13.868007 6 run_restore_controller.go:38] Starting CStorRestore controller
I0802 18:35:13.868019 6 run_restore_controller.go:41] Waiting for informer caches to sync
I0802 18:35:13.868022 6 run_replica_controller.go:39] Starting CStorVolumeReplica controller
I0802 18:35:13.868061 6 run_replica_controller.go:42] Waiting for informer caches to sync
I0802 18:35:13.868098 6 run_backup_controller.go:38] Starting CStorBackup controller
I0802 18:35:13.868117 6 run_backup_controller.go:41] Waiting for informer caches to sync
I0802 18:35:13.946730 6 run_pool_controller.go:45] Starting CStorPool workers
I0802 18:35:13.946931 6 run_pool_controller.go:51] Started CStorPool workers
I0802 18:35:13.968344 6 run_replica_controller.go:47] Starting CStorVolumeReplica workers
I0802 18:35:13.968441 6 run_replica_controller.go:54] Started CStorVolumeReplica workers
I0802 18:35:13.968490 6 run_restore_controller.go:46] Starting CStorRestore workers
I0802 18:35:13.968538 6 run_restore_controller.go:53] Started CStorRestore workers
I0802 18:35:13.968602 6 run_backup_controller.go:46] Starting CStorBackup workers
I0802 18:35:13.968689 6 run_backup_controller.go:53] Started CStorBackup workers
I0802 18:35:43.869876 6 handler.go:456] cStorPool pending: 48d3b2ba-b553-11e9-858e-54e1ad4a9dd4
I0802 18:35:43.869961 6 new_pool_controller.go:160] cStorPool Modify event : cstor-sparse-p8yp, 48d3b2ba-b553-11e9-858e-54e1ad4a9dd4
I0802 18:35:43.870552 6 event.go:221] Event(v1.ObjectReference{Kind:"CStorPool", Namespace:"", Name:"cstor-sparse-p8yp", UID:"48d3b2ba-b553-11e9-858e-54e1ad4a9dd4", APIVersion:"openebs.io/v1alpha1", ResourceVersion:"2070", FieldPath:""}): type: 'Normal' reason: 'Synced' Received Resource modify event
I0802 18:35:44.905633 6 pool.go:93] Import command successful with true dontimport: false importattr: [import -c /tmp/pool1.cache -o cachefile=/tmp/pool1.cache cstor-48d3b2ba- b553-11e9-858e-54e1ad4a9dd4] out:   # Check this entry
```

From the above highlighted(Lines marked as `Checked this entry`) logs we can confirm `cstor-pool-mgmt` in new pod is communicating with `cstor-pool` in old pod as first highlighted log says `cstor pool found` then pool is really `imported`.

**Possible Reason:**

When a cstor pool pod is deleted there are high chances that two cstor pool pods of same pool can present i.e old pool pod will be in `Terminating` state(which means not all the containers completely terminated) and new pool pod will be in `Running` state(might be few containers are in running state but not all). In this scenario `cstor-pool-mgmt` container in new pool pod is communicating with `cstor-pool` in old pool pod.  This can cause CVR resource to set to `Invalid`.

**Note:** This issue has observed in all OpenEBS versions upto 1.2.

**Resolution:**

Edit the `Phase` of cStorVolumeReplica (cvr) to `Offline`. After few seconds CVR will be `Healthy` or `Degraded` state depends on rebuilding progress.


<hr>

<br>
<font size="6" color="orange">Others</font>



<h3><a class="anchor" aria-hidden="true" id="reboot-cluster-nodes"></a>Nodes in the cluster reboots frequently almost everyday </h3>


Setup the cluster using RKE in MicroOS using CNI Plugin Cilium. Install OpenEBS, create a PVC and allocate to a fio job/ busybox. Run FIO test on the same. Observed nodes in the cluster getting restarted on a schedule basis.

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

## See Also:

### [FAQs](/docs/next/faq.html)

### [Seek support or help](/docs/next/support.html)

### [Latest release notes](/docs/next/releases.html)

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
