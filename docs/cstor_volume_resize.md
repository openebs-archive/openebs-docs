# Resizing a Volume
## Introduction
A cStor volume can be resized by following these instructions.

## Prerequisites
Pleas make sure all cstorvolumereplicas are in a healthy state before attempting to resize a volume.  You can verify their health with this command:

```
$ kubectl -n openebs get cstorvolumereplica

NAME                                                       USED    ALLOCATED   STATUS    AGE
pvc-ce54b1ac-87b8-11e9-b062-42010a800014-cstor-test-0wy0   61.1M   16.0M       Healthy   63m
pvc-ce54b1ac-87b8-11e9-b062-42010a800014-cstor-test-m8is   61.1M   16.0M       Healthy   63m
pvc-ce54b1ac-87b8-11e9-b062-42010a800014-cstor-test-pw1v   61.1M   16.0M       Healthy   63m
```

Also, you will want to know the name of the cStor pool as well as the name of the persistent volume claim and the new size you wish the volume to be.

## Instructions
### Modify Pool
#### Find pool pods

```
$ kubectl -n openebs get pods | grep <POOL_NAME>

cstor-test-0wy0-6f97557b55-m4jmd                                  3/3     Running   0          21m
cstor-test-m8is-8556f5c664-hh2mz                                  3/3     Running   0          20m
cstor-test-pw1v-9984786bd-4bxgq                                   3/3     Running   0          20m
```

#### On each pool pod
Run the following commands in the pods discovered in the previous step.

##### Get zfs dataset name on pool pod

```
$ kubectl -n openebs exec -it <POOL_POD> --container cstor-pool -- zfs list

NAME                                                                                  USED  AVAIL  REFER  MOUNTPOINT
cstor-14743ffc-875b-11e9-b062-42010a800014                                           17.7M  96.4G   512B  /cstor-14743ffc-875b-11e9-b062-42010a800014
cstor-14743ffc-875b-11e9-b062-42010a800014/pvc-ce54b1ac-87b8-11e9-b062-42010a800014  16.0M  96.4G  16.0M  -
```

##### Modify dataset volsize
Use the name of the dataset from the previous command.  You will want to use the one for the relevant PVC.

```
$ kubectl -n openebs exec -it <POOL_POD> --container cstor-pool -- zfs set volsize=<NEW_SIZE> <DATASET>
```

##### Verify size has changed

```
$ kubectl -n openebs exec -it <POOL POD> --container cstor-pool -- zfs get volsize <DATASEST>

NAME                                                                                 PROPERTY  VALUE    SOURCE
cstor-14743ffc-875b-11e9-b062-42010a800014/pvc-ce54b1ac-87b8-11e9-b062-42010a800014  volsize   20G      local
```

### Modify Target
#### Get pvc name to find target pod

```
$ kubectl get pv | grep <CLAIM_NAME>

pvc-ce54b1ac-87b8-11e9-b062-42010a800014   20Gi       RWO            Delete           Bound    default/percona-test-percona   openebs-cstor-test            53m
```

#### Find target pod name
Use the name of the PV from the previous command to find the appropriate pod.

```
$ kubectl -n openebs get pod | grep <PV_NAME>

pvc-ce54b1ac-87b8-11e9-b062-42010a800014-target-6f9fc9b5f9vz9c9   3/3     Running   2          53m
```

#### Modify istgt.conf on target pod
You will need to modify the `sed` in this command to make it change the old size to the new size in istgt.conf.

```
$ kubectl -n openebs exec -it <TARGET_POD> --container cstor-istgt -- sed -i 's/<OLD_SIZE>/<NEW_SIZE>/g' /usr/local/etc/istgt/istgt.conf; pkill istgt
```
Ensure istgt process is killed and recreated new one with latest timestamp.
```
kubectl -n openebs exec -it <TARGET_POD> --container cstor-istgt bash

```
Then run `ps -auxwww | grep istgt`

### Rescan iscsi on node where application is running
#### Find correct node

```
$ kubectl -n <APP_NAMESPACE> get pods -o wide

NAME                                   READY   STATUS    RESTARTS   AGE   IP           NODE                      NOMINATED NODE   READINESS GATES
percona-test-percona-db78ff4d8-qztph   1/1     Running   0          55m   10.244.3.7   k8s-openebs-demo-node-0   <none>           <none>
```

#### Connect to node (ssh, gcloud compute ssh, etc) and run the following commands
Follow your standard procedures for connecting to your node.  See instructions from your cloud provider regarding SSH for more information.

##### Rescan iscsi

```
$ sudo iscsiadm -m node -R

Rescanning session [sid: 2, target: iqn.2016-09.com.openebs.cstor:pvc-ce54b1ac-87b8-11e9-b062-42010a800014, portal: 10.103.75.24,3260]
```

##### Verify size using lsblk and get device name

```
$ lsblk

NAME    MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
loop0     7:0    0 88.4M  1 loop /snap/core/6964
loop1     7:1    0 58.9M  1 loop /snap/google-cloud-sdk/84
loop2     7:2    0 59.1M  1 loop /snap/google-cloud-sdk/85
sda       8:0    0   20G  0 disk 
├─sda1    8:1    0 19.9G  0 part /
├─sda14   8:14   0    4M  0 part 
└─sda15   8:15   0  106M  0 part /boot/efi
sdb       8:16   0   50G  0 disk 
├─sdb1    8:17   0   50G  0 part 
└─sdb9    8:25   0    8M  0 part 
sdc       8:32   0   50G  0 disk 
├─sdc1    8:33   0   50G  0 part 
└─sdc9    8:41   0    8M  0 part 
sdd       8:48   0   20G  0 disk /var/lib/kubelet/pods/ce5888b6-87b8-11e9-b062-42010a800014/volumes/kubernetes.io~iscsi/pvc-ce54b1ac-87b8-11e9-b062-42010a800014
```

##### Resize the filesystem
The device name was listed in the last command.  That will be used here for the resize.

```
$ sudo resize2fs /dev/<DEVICE_NAME>

resize2fs 1.44.1 (24-Mar-2018)
Filesystem at /dev/sdd is mounted on /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.103.75.24:3260-iqn.2016-09.com.openebs.cstor:pvc-ce54b1ac-87b8-11e9-b062-42010a800014-lun-0; on-line resizing required
old_desc_blocks = 1, new_desc_blocks = 3
The filesystem on /dev/sdd is now 5242880 (4k) blocks long.
```

### Verify size in application pod

```
$ kubectl -n <APP_NAMESPACE> exec -it <APP_POD> -- df -h

Filesystem      Size  Used Avail Use% Mounted on
overlay          20G  3.6G   16G  19% /
tmpfs            64M     0   64M   0% /dev
tmpfs           1.8G     0  1.8G   0% /sys/fs/cgroup
/dev/sda1        20G  3.6G   16G  19% /etc/hosts
shm              64M     0   64M   0% /dev/shm
/dev/sdd         20G  258M   20G   2% /var/lib/mysql
tmpfs           1.8G   12K  1.8G   1% /run/secrets/kubernetes.io/serviceaccount
tmpfs           1.8G     0  1.8G   0% /proc/acpi
tmpfs           1.8G     0  1.8G   0% /proc/scsi
tmpfs           1.8G     0  1.8G   0% /sys/firmware
```

### Edit PV
#### Get PV

```
$ kubectl get pv

NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                          STORAGECLASS         REASON   AGE
pvc-ce54b1ac-87b8-11e9-b062-42010a800014   8Gi       RWO            Delete           Bound    default/percona-test-percona   openebs-cstor-test            46m
```

#### Patch PV
Now edit `spec.capacity.storage` in the PV

```
$ kubectl edit pv <PV>
```

#### Patch cStorVolume
Now Edit `spec.capacity.storage` in the cStorVolume

```
kubectl edit cstorvolume <cStorVolume> -n openebs
```
