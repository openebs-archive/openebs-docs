# How to expand a cStor Volume

## Introduction
A Non-CSI cStor volume can be expanded by following the instructions. The following steps are mainly applicable for cStor volumes running on **OpenEBS version 1.2 and above** only.

## Instructions

The following are the steps to expand the cStor volume capacity running on OpenEBS version 1.2 and above.

### Step 1: Find the cstorvolume of corresponding PV:
```
kubectl get cstorvolume -n openebs -l openebs.io/persistent-volume=<pv_name>
```
Example command:
```
kubectl get cstorvolume -n openebs -l openebs.io/persistent-volume=pvc-0546bc97-5e64-4f94-b18e-6929f615fb75
```
Example output:
```
NAME                                       STATUS    AGE    CAPACITY
pvc-0546bc97-5e64-4f94-b18e-6929f615fb75   Healthy   3m1s   20Gi
```

### Step 2: Edit `spec.capacity` in the corresponding cStorVolume YAML:

```
kubectl edit cstorvolume pvc-0546bc97-5e64-4f94-b18e-6929f615fb75 -n openebs
```
Now, update the value in `spec.capacity` with new value and save the YAML file.


### Step 3: After saving the config YAML, verify the updated value using the following command:

```
kubectl get cstorvolume <cStor_volume_name> -n openebs -l openebs.io/persistent-volume=<pv_name>
```
Example command:
```
kubectl get cstorvolume -n openebs -l openebs.io/persistent-volume=pvc-0546bc97-5e64-4f94-b18e-6929f615fb75
```
Example output:
```
NAME                                       STATUS    AGE     CAPACITY
pvc-0546bc97-5e64-4f94-b18e-6929f615fb75   Healthy   5m26s   30Gi
```
Check the `CAPACITY` value of the corresponding cStor volume from the output.

User can also check the status of updated size by checking the `status.capacity` by checking the cStor volume YAML output (or) events on cstorvolume will say `successfully resized volume` by describing the cStor volume.
Resizing of cStorvolume can be done with above steps. To reflect this size in application perform the following steps.

## Rescan iscsi on node where application pod is running

### Find correct node

Find the correct node where the application pod is running using the following command:

```
 kubectl -n <APP_NAMESPACE> get pods -o wide
```
Example command:
```
kubectl get pod -o wide -n default
```
Example output:
```
NAME                       READY   STATUS    RESTARTS   AGE     IP          NODE                                         NOMINATED NODE   READINESS GATES
busybox-555775f56c-rf4qt   1/1     Running   0          5m57s   10.28.0.9   gke-ranjith-doc-default-pool-93f8d85c-f1w9   <none>           <none>
```

### Connect to node (ssh, gcloud compute ssh, etc) and run the following commands:

Follow your standard procedures for connecting to your node. See instructions from your cloud provider regarding SSH for more information.

#### List the block device

List the block device using the followimg command:

```
lsblk
```
Example output:
```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda       8:0    0   30G  0 disk 
├─sda1    8:1    0 29.9G  0 part /
├─sda14   8:14   0    4M  0 part 
└─sda15   8:15   0  106M  0 part /boot/efi
sdb       8:16   0   30G  0 disk 
├─sdb1    8:17   0   30G  0 part 
└─sdb9    8:25   0    8M  0 part 
sdc       8:32   0   20G  0 disk /home/kubernetes/containerized_mounter/rootfs/var/lib/kubelet/pods/2360daa2-9984-4
```
In the above example output, `sdc` is the cStor volume device having a capacity of 20G. 

#### Rescan iscsi
Rescan the iSCSI connections using the following command:

```
sudo iscsiadm -m node -R
```
Example output:
```
Rescanning session [sid: 1, target: iqn.2016-09.com.openebs.cstor:pvc-0546bc97-5e64-4f94-b18e-6929f615fb75, portal: 10.0.89.81,3260]
```

After rescaning has performed the node, this output will change with provided latest value, but will not be reflected inside the application filesystem.

#### Verify size using `lsblk` and get device name.

List the block device using the followimg command:

```
lsblk
```
Example output:
```
NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
sda       8:0    0   30G  0 disk 
├─sda1    8:1    0 29.9G  0 part /
├─sda14   8:14   0    4M  0 part 
└─sda15   8:15   0  106M  0 part /boot/efi
sdb       8:16   0   30G  0 disk 
├─sdb1    8:17   0   30G  0 part 
└─sdb9    8:25   0    8M  0 part 
sdc       8:32   0   30G  0 disk /home/kubernetes/containerized_mounter/rootfs/var/lib/kubelet/pods/2360daa2-9984-4
```

#### Resize the filesystem

Provide the device name where the application is mounted in the resize command. In this example, application is mounted on device `/dev/sdc`.

```
sudo resize2fs /dev/<DEVICE_NAME>
```
Example command:

```
sudo resize2fs /dev/sdc
```
Example output:
```
resize2fs 1.44.1 (24-Mar-2018)
Filesystem at /dev/sdc is mounted on /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.0.89.81:3260-iqn.2016-09.com.openebs.cstor:pvc-0546bc97-5e64-4f94-b18e-6929f615fb75-lun-0; on-line resizing required
old_desc_blocks = 3, new_desc_blocks = 4
The filesystem on /dev/sdc is now 7864320 (4k) blocks long.
```

## Verify size in application pod

Verify if the size of the volume is updated inside application pod using the following command:

```
kubectl exec -it <app_pod_name> -n <application-namespace> -- df -h
```
Example command:
```
kubectl exec -it busybox-555775f56c-rf4qt -n default -- df -h
```
Example output:
```
Filesystem                Size      Used Available Use% Mounted on
overlay                  28.9G      3.1G     25.8G  11% /
tmpfs                    64.0M         0     64.0M   0% /dev
tmpfs                     3.6G         0      3.6G   0% /sys/fs/cgroup
/dev/sda1                28.9G      3.1G     25.8G  11% /dev/termination-log
/dev/sda1                28.9G      3.1G     25.8G  11% /etc/resolv.conf
/dev/sda1                28.9G      3.1G     25.8G  11% /etc/hostname
/dev/sda1                28.9G      3.1G     25.8G  11% /etc/hosts
shm                      64.0M         0     64.0M   0% /dev/shm
/dev/sdc                 29.4G     44.0M     29.3G   0% /var/lib/mysql
tmpfs                     3.6G     12.0K      3.6G   0% /var/run/secrets/kubernetes.io/serviceaccount
tmpfs                     3.6G         0      3.6G   0% /proc/acpi
tmpfs                    64.0M         0     64.0M   0% /proc/kcore
tmpfs                    64.0M         0     64.0M   0% /proc/keys
tmpfs                    64.0M         0     64.0M   0% /proc/timer_list
tmpfs                    64.0M         0     64.0M   0% /proc/sched_debug
tmpfs                     3.6G         0      3.6G   0% /proc/scsi
tmpfs                     3.6G         0      3.6G   0% /sys/firmware
```
From the above output, capacity of corresponding device where application is mounted has been updated as `30G`.

## Edit PV

The capacity of corresponding PV has to be changed manually. This can be done by editing the PV and update the value in `spec.capacity.storage` field.

```
kubectl get pv
```
Example output:
```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS     REASON   AGE
pvc-0546bc97-5e64-4f94-b18e-6929f615fb75   20Gi       RWO            Delete           Bound    default/demo-vol1-claim   openebs-sc-new            9m26s
```
### Patch capacity of the PV:
```
kubectl edit pv <pv_name>
```
Example command:
```
kubectl edit pv pvc-0546bc97-5e64-4f94-b18e-6929f615fb75
```
Now, verify the update PV capacity details using the following command:
```
kubectl get pv
```
Example output:
```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS     REASON   AGE
pvc-0546bc97-5e64-4f94-b18e-6929f615fb75   30Gi       RWO            Delete           Bound    default/demo-vol1-claim   openebs-sc-new            10m
```

**Note:** PVC capacity will be inconsistent with PV capacity. This will be fixed during migration of Non-CSI volumes to CSI volumes.
