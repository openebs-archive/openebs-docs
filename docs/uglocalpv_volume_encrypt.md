# How to use encryption with OpenEBS Local PV Hostpath volume

## Introduction

LUKS encrypted devices can be used to create OpenEBS Local PV Hostpath volumes by following the instructions. The following steps are mainly applicable for Local PV volumes running on **OpenEBS version 1.9 and above** only.

## Instructions

The following are the steps to provide encrypted OpenEBS Local PV volume capacity running on OpenEBS version 1.9 and above. Before you start make sure to add additional block devices to each node to be encrypted using LUKS.

### Step 1: Find the new device name:
In our example below we have used a Kubernetes cluster on AWS cloud instances and added 100GB SSD device to use for the instructions. 
```
lsblk
```
Example output:
```
NAME        MAJ:MIN RM    SIZE RO TYPE MOUNTPOINT
nvme1n1     259:0    0   69.9G  0 disk
nvme0n1     259:1    0    128G  0 disk
├─nvme0n1p1 259:2    0 1007.5K  0 part
└─nvme0n1p2 259:3    0    128G  0 part /
nvme2n1     259:4    0    100G  0 disk
```
In our example, device name is `nvme2n1`.

### Step 2: Partion the new device name:
```
$ sudo fdisk /dev/<device_name>
```
Example command:
```
$ sudo fdisk /dev/nvme2n1
```
Example output:
```
Welcome to fdisk (util-linux 2.29.2).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS disklabel with disk identifier 0x98493a34.

Command (m for help): p
Disk /dev/nvme2n1: 100 GiB, 107374182400 bytes, 209715200 sectors
Geometry: 64 heads, 32 sectors/track, 102400 cylinders
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x98493a34

Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (1-4, default 1):
First sector (32-209715199, default 32):
Last sector, +sectors or +size{K,M,G,T,P} (32-209715199, default 209715199): +20G

Created a new partition 1 of type 'Linux' and of size 20 GiB.

Command (m for help): w

The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.
```

Confirm the new partition by running `lsblk` command. In our example, 20GB `nvme2n1p1`.

Example output:
```
NAME        MAJ:MIN RM    SIZE RO TYPE MOUNTPOINT
nvme1n1     259:0    0   69.9G  0 disk
nvme0n1     259:1    0    128G  0 disk
├─nvme0n1p1 259:2    0 1007.5K  0 part
└─nvme0n1p2 259:3    0    128G  0 part /
nvme2n1     259:4    0    100G  0 disk
└─nvme2n1p1 259:6    0     20G  0 part
```

### Step 3: Format the LUKS partition with a passphrase:
```
sudo cryptsetup luksFormat /dev/<device_name>
```
Example command:
```
sudo cryptsetup luksFormat /dev/nvme2n1p1
```
Example output:
```
WARNING!
========
This will overwrite data on /dev/nvme2n1p1 irrevocably.

Are you sure? (Type uppercase yes): YES
Enter passphrase:
Verify passphrase:
```

### Step 4: Create a LUKS device mapping
```
sudo cryptsetup luksOpen /dev/<device_name> <mapping>
```
Example command:
```
sudo cryptsetup luksOpen /dev/nvme2n1p1 backup1
Enter passphrase for /dev/nvme2n1p1:
```

Confirm the new LUKS partition by running `lsblk` command. In our example, mapped as `backup1`.

Example output:
```
NAME        MAJ:MIN RM    SIZE RO TYPE  MOUNTPOINT
nvme1n1     259:0    0   69.9G  0 disk
nvme0n1     259:1    0    128G  0 disk
├─nvme0n1p1 259:2    0 1007.5K  0 part
└─nvme0n1p2 259:3    0    128G  0 part  /
nvme2n1     259:4    0    100G  0 disk
└─nvme2n1p1 259:6    0     20G  0 part
  └─backup1 254:0    0     20G  0 crypt
```

### Step 5: Verify status of LUKS partition
```
sudo cryptsetup -v status <mapping>
```
Example command:
```
sudo cryptsetup -v status backup1
```
Example output:
```
/dev/mapper/backup1 is active.
  type:    LUKS1
  cipher:  aes-xts-plain64
  keysize: 256 bits
  device:  /dev/nvme2n1p1
  offset:  4096 sectors
  size:    41938945 sectors
  mode:    read/write
Command successful.
admin@ip-172-20-44-175:~$ sudo mkfs.ext4 /dev/mapper/backup1
mke2fs 1.43.4 (31-Jan-2017)
Creating filesystem with 5242368 4k blocks and 1310720 inodes
Filesystem UUID: 53e21785-574d-44f4-a916-7706a54b28b5
Superblock backups stored on blocks:
        32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208,
        4096000

Allocating group tables: done
Writing inode tables: done
Creating journal (32768 blocks): done
Writing superblocks and filesystem accounting information:
done
```

### Step 6: Mount LUKS partition for Local PV Hostpath use
```
sudo mkdir -p <localpv_mount_point>
sudo mount <mapping> <localpv_mount_point>
```
Example command:
```
sudo mkdir -p /var/openebs/local
sudo mount /dev/mapper/backup1 /var/openebs/local
```

Confirm the mount point by running `lsblk` command. In our example, mounted as as `var/openebs/local`.

Example output:
```
NAME        MAJ:MIN RM    SIZE RO TYPE  MOUNTPOINT
nvme1n1     259:0    0   69.9G  0 disk
nvme0n1     259:1    0    128G  0 disk
├─nvme0n1p1 259:2    0 1007.5K  0 part
└─nvme0n1p2 259:3    0    128G  0 part  /
nvme2n1     259:4    0    100G  0 disk
└─nvme2n1p1 259:6    0     20G  0 part
  └─backup1 254:0    0     20G  0 crypt /var/openebs/local

### Step 7: Create an example pod using Local PV Hostpath volume
```
kubectl apply -f https://openebs.github.io/charts/examples/local-hostpath/local-hostpath-pvc.yaml
kubectl apply -f https://openebs.github.io/charts/examples/local-hostpath/local-hostpath-pod.yaml
```

Verify using below kubectl commands that example pod is running and is using a OpenEBS Local PV Hostpath.

```
kubectl get pod hello-local-hostpath-pod
kubectl get pvc local-hostpath-pvc
```
