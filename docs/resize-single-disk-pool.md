### 1. Do kubectl exec inside the `cstor-pool-mgmt` container using the following command and install `parted`

Get the pool pod name using `kubectl get pods -n openebs` command and exec inside 
the container. Install the `parted` tool using `apt-get install parted` after execing into the 
`cstor-pool-mgmt` container.

```
$ kubectl exec -it cstor-pool-1fth-7fbbdfc747-sh25t -n openebs -c cstor-pool-mgmt bash
```

Install the `parted` tool using `apt-get install parted` after execing into the 
`cstor-pool-mgmt` container.


### 2. Run the following command inside the pool pod container:

```
zpool list (get the pool name)
```
**Example:**

```
$ zpool list
NAME                                         SIZE  ALLOC   FREE  EXPANDSZ   FRAG    CAP  DEDUP  HEALTH  ALTROOT
cstor-5be1d388-60d3-11e9-8e67-42010aa00fcf  9.94G   220K  9.94G         -     0%     0%  1.00x  ONLINE  -
```

### 3. Set your zpool with `autoexpand on` (By default it is set to `off`)

```
$ zpool set autoexpand=on <cstor-pool-name>
```
**Example:**
```
$ zpool set autoexpand=on cstor-5be1d388-60d3-11e9-8e67-42010aa00fcf
```

### 4. Resize the disk which is already part of the pool 

If this is done already, that's fine.

Perform this step from the host machine on which disk has been resized.

Now check `lsblk` output on corresponding node is showing the reflected size. General command for rescanning the SCSI bus on Linux is provided below.

```
sudo su -
echo "1" > /sys/class/block/<device_name>/device/rescan
```

**Example:**

```
sudo su -
echo "1" > /sys/class/block/sdb/device/rescan
```

**Note:**  This command can be different based on the underlying system. Please use the proper command to rescan the SCSI bus based on the underlying OS.

### 5. Get the expanded device name that is in-use with pool using `fdisk -l` command and use `parted /dev/<device-name>` to lists partition layout on device. 
Just after this command, type `Fix` at prompt to use new available space.
```
$ parted /dev/sdb print

Warning: Not all of the space available to /dev/sdb appears to be used, you can
fix the GPT to use all of the space (an extra 20971520 blocks) or continue with
the current setting?
Fix/Ignore? Fix
Model: Google PersistentDisk (scsi)
Disk /dev/sdb: 21.5GB
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name                  Flags
 1      1049kB  10.7GB  10.7GB  zfs          zfs-d97901ec3aa0fb69
 9      10.7GB  10.7GB  8389kB

```

Ensure there is a zfs partition listed against partion number 1. If there is a ZFS partion , prcoeed with next step.

Note: If there is no ZFS partition, there could be a chance that a new disk is added to the Node. In this case, reach out to OpenEBS support @ https://openebs.io/join-our-slack-community for help.

### 6. Remove the buffering partition

From the output got in Step 5, remove the buffering partition number. In this example, it is 9.

```
parted /dev/sdb rm 9
```

### 7. Expand partition holding zpool

```sh
$ parted /dev/sdb resizepart 1 100%

sh: 1: udevadm: not found
sh: 1: udevadm: not found
Information: You may need to update /etc/fstab.
```

### 8. Check the parted size again using `parted /dev/<device-name> print`

```
$ parted /dev/sdb print

Model: Google PersistentDisk (scsi)
Disk /dev/sdb: 21.5GB
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name                  Flags
 1      1049kB  21.5GB  21.5GB  zfs          zfs-d97901ec3aa0fb69
```

### 9. Size is changed from 10GB to 20GB, Now we have to tell the zpool to bring specified physical device online using following command.


```
zpool online -e <cstor-pool-name> /dev/disk/by-id/<disk_name>

```

**Note:** Run `zpool status` command inside the cStor pool contaioner and find the disk name of the associated disk under the cStor pool.

Example:

```
zpool online -e cstor-5be1d388-60d3-11e9-8e67-42010aa00fcf /dev/disk/by-id/scsi-0Google_PersistentDisk_pdisk2

```

### 10. Restart the NDM pod schedeuled on same node with pool to reflect the updated size in `block device` customresource

After restart make sure NDM pod comes in `Running` state.
