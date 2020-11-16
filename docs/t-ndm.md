---
id: t-ndm
title: Troubleshooting OpenEBS - NDM
sidebar_label: NDM
---
------

<font size="5">General guidelines for troubleshooting</font>

- Contact <a href="/docs/next/support.html" target="_blank">OpenEBS Community</a> for support.
- Search for similar issues added in this troubleshootiung section.
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>
<hr>
<br>

[Unable to claim blockdevices by NDM operator](#unable-to-claim-blockdevices)


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

### [FAQs](/docs/next/faq.html)

### [Seek support or help](/docs/next/support.html)

### [Latest release notes](/docs/next/releases.html)

<br>
<hr>
<br>

