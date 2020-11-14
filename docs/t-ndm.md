---
id: t-ndm
title: Troubleshooting OpenEBS - NDM
sidebar_label: NDM
---
------

<font size="5">General guidelines for troubleshooting</font>

- Contact <a href="/v220/docs/next/support.html" target="_blank">OpenEBS Community</a> for support.
- Search for similar issues added in this troubleshootiung section.
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>
<hr>
<br>

[Blockdevices are not detected by NDM in some of the nodes](#bd-from-some-nodes-are-not-detected)

[Unable to discover some of disks in Proxmox servers by OpenEBS](#unable-to-discover-proxmox-disks)

[Unable to claim blockdevices by NDM operator](#unable-to-claim-blockdevices)


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

Check `kubectl get blockdevice -o yaml` of one of the blockdevice and its serial number. Also, ensure that the serial number of other 2 blockdevices are different. NDM detect and recognize the blockdevice based on their WWN, Model, Serial and Vendor. If the blockdevice have all the parameters same then NDM cannot differentiate the blockdevice and will create only 1 BlockdDevice CR for each unique parameter. To troubleshoot the same user has to make sure the blockdevices are having at least anyone unique parameter from WWN, Model, Serial and Vendor. Usually this issue is faced in virtualization environment like vSphere, KVM etc. More details abour NDM daemon set functionalities can be read from [here](/v220/docs/next/ndm.html#ndm-daemonset-functions).

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


<h3><a class="anchor" aria-hidden="true" id="unable-to-claim-blockdevices"></a>Unable to claim blockdevices by NDM operator</h3>
BlockDeviceClaims may remain in pending state, even if blockdevices are available in Unclaimed and Active state. The main reason for this will be there are no blockdevices that match the criteria specified in the BlockDeviceClaim. Sometimes, even if the criteria matches the blockdevice may be in an Unclaimed state. 


**Troubleshooting:**
Check if the blockdevice is having any of the following annotations:
1.)
```
metadata:
  annotations:
    internal.openebs.io/partition-uuid: <uuid>
    internal.openebs.io/uuid-scheme: legacy
```

or

2.)
```
metadata:
  annotations:
    internal.openebs.io/fsuuid: <uuid>
    internal.openebs.io/uuid-scheme: legacy
```

If 1.) is present, it means the blockdevice was previously being used by cstor and it was not properly cleaned up. The cstor pool can be from a previous release or the disk already container some zfs labels.
If 2.) is present, it means the blockdevice was previously being used by localPV and the cleanup was not done on the device.

**Resolution:**
1. ssh to the node in which the blockdevice is present
2. If the disk has partitions, run wipefs on all the partitions
```
wipefs -fa /dev/sdb1
wipefs -fa /dev/sdb9
```
3. Run wipefs on the disk
```
wipefs -fa /dev/sdb
```
4. Restart NDM pod running on the node
5. New blockdevices should get created for those disks and it can be claimed and used. The older blockdevices will go into an Unknown/Inactive state.

<br>

<hr>
<br>
<br>

## See Also:

### [FAQs](/v220/docs/next/faq.html)

### [Seek support or help](/v220/docs/next/support.html)

### [Latest release notes](/v220/docs/next/releases.html)

<br>
<hr>
<br>

