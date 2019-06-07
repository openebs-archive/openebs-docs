---
id: ugndm
title: Node Device Manager User Guide
sidebar_label: NDM
---
------

This section provides the operations need to performed by User and Admin for configuring NDM.

<font size="5">User operations</font>

None

<font size="5">Admin operations</font>

[Include filters](#Include-filters)

[Exclude filters](#Exclude-filters)

[Create blockdevice CRs for partitioned disks](#create-blockdevice-CRs-for-partitioned-disks) 



<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations</h2>

There is no operations has to be performed by a User regarding NDM.

<br>

<h2><a class="anchor" aria-hidden="true" id="admin-operations"></a>Admin Operations</h2>

<br>

<h3><a class="anchor" aria-hidden="true" id="Include-filters"></a>Include filters</h3>

There is a configuration for including selected disks also in the operator YAML file under NDM configuration section so that only these blockdevice will be taken for creation of blockdevice CR. Add the blockdevice path in the following configuration for specifying particular disks.

This change must be done in the `openebs-operator.yaml` file that you have downloaded before OpenEBS installation. 

```
filterconfigs:
- key: path-filter
  name: path filter
  state: true
  include: "/dev/sda"
  exclude: ""         
```



<h3><a class="anchor" aria-hidden="true" id="Exclude-filters"></a>Exclude filters</h3>

NDM do some filtering on the disks to exclude, for example boot disk. By default, NDM excludes the following device path to create disk CR. This configuration is added in `openebs-ndm-config` under `Configmap` in `openebs-operator.yaml`.

```
/dev/loop - loop devices.
/dev/fd - file descriptors.
/dev/sr - CD-ROM devices.
/dev/ram - ramdisks.
/dev/dm -lvm.
/dev/md -multiple device ( software RAID devices).
```

The following is the snippet of NDM configuration file from openebs operator YAML which excludes the provided disks/paths.

```
filterconfigs:
  - key: os-disk-exclude-filter
        name: os disk exclude filter
        state: true
        exclude: "/,/etc/hosts,/boot"
      - key: vendor-filter
        name: vendor filter
        state: true
        include: ""
        exclude: "CLOUDBYT,OpenEBS"
      - key: path-filter
        name: path filter
        state: true
        include: ""
        exclude: "loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md"    
```

It is also possible to customize by adding more disk types associated with your nodes. For example, used disks, unwanted disks and so on. This change must be done in the 'openebs-operator.yaml' file that you have downloaded before OpenEBS installation. 

```
filterconfigs:
  - key: path-filter
    name: path filter
    state: true
    include: ""
    exclude: "loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md"
```



<h3><a class="anchor" aria-hidden="true" id="create-blockdevice-CRs-for-partitioned-disks"></a>Create blockdevice CRs for partitioned disks</h3>

Currently, NDM is not selecting partition disks for creating device resource. But, you can create blockdevice resource for the partition disks manually. The following are the steps for the creation of blockdevice resource.

1. Download the blockdevice CR YAML for creating the blockdevice CR manually. The sample disk CR can be downloaded from [here](<https://raw.githubusercontent.com/openebs/node-disk-manager/master/deploy/crds/openebs_v1alpha1_blockdevice_cr.yaml>).

2. Modify the downloaded blockdevice CR sample YAML with the partition disk information. Following is the sample disk CR YAML.

   ```
   apiVersion: openebs.io/v1alpha1
   kind: BlockDevice
   metadata:
     name: example-blockdevice
     labels:
       kubernetes.io/hostname: <host name in which disk/blockdevice is attached> # like gke-openebs-user-default-pool-044afcb8-bmc0
       ndm.io/managed: "false" # for manual disk creation put false
       ndm.io/disk-type: <blockdevice type> # like disk, partition, sparse file
   status:
     claimState: Unclaimed
     state: Active
   spec:
     capacity:
       logicalSectorSize: <logical sector size of lockdevice> # like 512
       storage: <total capacity in bits> #like 53687091200
     details:
       firmwareRevision: <firmware revision>
       model: <model name of blockdevice> # like PersistentDisk
       serial: <serial no of disk> # like google-disk-2
       compliance: <compliance of disk> #like "SPC-4"
       vendor: <vendor of disk> #like Google
     devlinks:
     - kind: by-id
       links:
       - <link1> # like /dev/disk/by-id/scsi-0Google_PersistentDisk_disk-2
       - <link2> # like /dev/disk/by-id/google-disk-2
     - kind: by-path
       links:
       - <link1> # like /dev/disk/by-path/virtio-pci-0000:00:03.0-scsi-0:0:2:0 
     Partitioned: Yes
     path: <devpath> # like /dev/sdb1
   ```

3. In the above blockdevice CR sample spec, following field must be filled before applying the YAML.

4. - kubernetes.io/hostname
   - storage
   - links
     - This field should be filed fo by-id and by-path. These details can be get from running `udevadm info -q property -n <device_path like /dev/sda1>` 
   - path

5. Apply the modified YAML file to create the blockdevice CR for the provided partitioned device path.

6. Repeat the same steps for each partitioned device and create blockdevice CR for each device.

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
