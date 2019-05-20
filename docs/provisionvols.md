---
id: provisionvols
title: Provisioning OpenEBS Storage Volumes
sidebar_label: Provisioning Volumes
---
------

<br>

<img src="/docs/assets/svg/4-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>

<font size="6">Summary:</font>

[Provision from disk pool](#provision-from-a-disk-pool)

[Monitor volumes](#monitor-volumes)

[Snapshots and Clones](/docs/next/operations.html#openebs-snapshots-and-clones)

[Deleting volumes](#deleting-volumes)

[Upgrade considerations](#upgrade-considerations)



*Note: This page describes how to provision volumes using cStor. For details about provisioning volumes using Jiva, see [Jiva user guide](/docs/next/jivaguide.html)* 

<br>

<hr>
## Provision from a disk pool

<br>

Use a similar PVC spec or volumeClaimTemplate to use a StorageClass that is pointing to a pool with real disks. Consider the following parameters while provisioning OpenEBS volumes on real disks



**AccessModes:** cStor provides iSCSI targets, which are appropriate for RWO (ReadWriteOnce) access mode and is suitable for all types of databases. For webscale applications like WordPress or any for any other NFS needs, you need RWM (ReadWriteMany) access mode. For RWM, you need NFS provisioner to be deployed along with cStor. See <a href="/docs/next/rwm.html" target="_blank">how to provision RWM PVC with OpenEBS </a>.

**Size:** cStor supports thin provisioning by default, which means you can request any size of the volume through the PVC and get it provisioned. Resize of the volume is not fully supported through the OpenEBS control plane in the current release (OpenEBS 0.9.0) and is active development, see [roadmap](/docs/next/cstor.html#cstor-roadmap) for more details. Hence it is recommended to give good amount of buffer to the required size of the volume so that you don't need to resize immediately or in the very short time period. 

<font size="5">Example configuration for requesting OpenEBS volumes for a `deployment` </font>



```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: cstor-pvc-mysql-large
spec:
  storageClassName: openebs-cstor-pool1-3-replicas
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Gi
```



<font size="5">Example configuration for requesting OpenEBS volumes for a `StatefulSet`</font>



```
spec:
  volumeClaimTemplates:
  - metadata:
      name: elasticdb-vol-openebs
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 500Gi
      storageClassName: openebs-cstor-pool1-1-replica
```



<br>

<hr>
<br>

## Monitor cStor Pool

A new sidecar will run once a cStor pool pod is created.This sidecar will collect the metrics of the corresponding cStorStoragePool. Following metrics are supported by cStor to export the cStorStoragePool usage statistics as Prometheus metrics.

```
openebs_dispatched_io_count # Dispatched IO's count
openebs_free_pool_capacity # Free capacity in pool
openebs_inflight_io_count # Inflight IO's count
openebs_maya_exporter_version # A metric with a constant '1' value labeled by commit and version from which maya-exporter was built.
openebs_pool_size # Size of pool
openebs_pool_status # Status of pool (0, 1, 2, 3, 4, 5, 6)= {"Offline", "Online", "Degraded", "Faulted", "Removed", "Unavail", "NoPoolsAvailable"}
openebs_read_latency # Read latency on replica
openebs_rebuild_bytes # Rebuild bytes
openebs_rebuild_count # Rebuild count
openebs_rebuild_status # Status of rebuild on replica (0, 1, 2, 3, 4, 5, 6)= {"INIT", "DONE", "SNAP REBUILD INPROGRESS", "ACTIVE DATASET REBUILD INPROGRESS", "ERRORED", "FAILED", "UNKNOWN"}
openebs_sync_count # Total no of sync on replica
openebs_sync_latency # Sync latency on replica
openebs_total_failed_rebuild # Total no of failed rebuilds on replica
openebs_total_read_bytes # Total read in bytes
openebs_total_read_count # Total read io count
openebs_total_rebuild_done # Total no of rebuild done on replica
openebs_total_write_bytes # Total write in bytes
openebs_total_write_count # Total write io count
openebs_used_pool_capacity # Capacity used by pool
openebs_used_pool_capacity_percent # Capacity used by pool in percent
openebs_used_size Used # size of pool and volume
openebs_volume_status # Status of volume (0, 1, 2, 3) = {"Offline", "Healthy", "Degraded", "Rebuilding"}
openebs_write_latency # Write latency on replica
openebs_zfs_command_error # zfs command error counter
openebs_zfs_list_command_error # zfs list command error counter
openebs_zfs_parse_error # zfs parse error counter
openebs_zpool_command_error # zpool command error counter
```

<br>

## Monitor volumes

By default the `VolumeMonitor` is set to ON in cStor StorageClasses. Volume metrics are exported when this parameter is set to ON. Following metrics are supported by cStor as of the current release.

```

openebs_actual_used # Actual volume size used
openebs_connection_error_total # Total no of connection errors
openebs_connection_retry_total # Total no of connection retry requests
openebs_degraded_replica_count # Total no of degraded/ro replicas
openebs_healthy_replica_count # Total no of healthy replicas
openebs_logical_size # Logical size of volume
openebs_parse_error_total # Total no of parsing errors
openebs_read_block_count # Read Block count of volume
openebs_read_time # Read time on volume
openebs_reads # Read Input/Outputs on Volume
openebs_sector_size # sector size of volume
openebs_size_of_volume # Size of the volume requested
openebs_total_read_bytes # Total read bytes
openebs_total_replica_count # Total no of replicas connected to cas
openebs_total_write_bytes # Total write bytes
openebs_volume_status # Status of volume: (1, 2, 3, 4) = {Offline, Degraded, Healthy, Unknown}
openebs_volume_uptime # Time since volume has registered
openebs_write_block_count # Write Block count of volume
openebs_write_time # Write time on volume
openebs_writes # Write Input/Outputs on Volume
```



Grafana charts can be built for the above Prometheus metrics. Some metrics OpenEBS volumes are available automatically at MayaOnline when you connect the Kubernetes cluster to it. See an example screenshot below.



<img src="/docs/assets/svg/volume-monitor.svg" alt="OpenEBS configuration flow" style="width:100%">



<br>

<hr>

<br>



## Deleting volumes

<br>

When a PVC is deleted, the OpenEBS PV is deleted including the data in it. In StorageClass, the parameter `ReclaimPolicy` is set to `Delete` by default. If the data need to retain, it can be configured by changing `ReclaimPolicy` to `Retain` in the corresponding StorageClass or patching the corresponding PV is also possible. This is applicable only for Jiva volume. cStor currently does not support `Retain` feature. 

<hr>

<br>

## Upgrade considerations

<br>

[See Upgrade](/docs/next/upgrade.html)



<hr>



<br>

## See Also:



<br>

### [OpenEBS use cases](/docs/next/usecases.html)

### [Troubleshooting guide](/docs/next/troubleshooting.html)

### [Connecting to MayaOnline](/docs/next/mayaonline.html)

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
