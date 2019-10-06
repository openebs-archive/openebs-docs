---
id: version-0.8.1-provisionvols
title: Provisioning OpenEBS Storage Volumes
sidebar_label: Provisioning Volumes
original_id: provisionvols
---
------

<br>

<img src="/docs/assets/svg/4-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>

<font size="6">Summary:</font>

[Quick provisioning ](#quick-provisioning)

[Provision from disk pool](#provision-from-a-disk-pool)

[Monitor volumes](#monitor-volumes)

[Snapshots and Clones](/docs/next/operations.html#openebs-snapshots-and-clones)

[Deleting volumes](#deleting-volumes)

[Upgrade considerations](#upgrade-considerations)



*Note: This page describes how to provision volumes using cStor. For details about provisioning volumes using Jiva, see [Jiva user guide](/docs/next/jivaguide.html)* 

<br>

<hr>

<br>

## Quick provisioning

<br>

After installation of OpenEBS, and making sure iSCSI client prerequisite is met, you can provision storage for the stateful application using the following PVC

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: cstor-pvc-default
spec:
  storageClassName: openebs-cstor-sparse 
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
```



<font size="5">Example demo of OpenEBS cStor:</font>

Run the following command to see OpenEBS storage being provisioned and FIO test being run on it

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/fio/demo-fio-cstor-sparse.yaml
```



<div class="co">$ kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/fio/demo-fio-cstor-sparse.yaml
pod/fio-cstor-sparse created
persistentvolumeclaim/fio-cstor-sparse-claim created

$ kubectl get pvc fio-cstor-sparse-claim
NAME                     STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS           AGE
fio-cstor-sparse-claim   Bound     pvc-0449b4e8-3323-11e9-a3ac-42010af00342   4G         RWO            openebs-cstor-sparse   1m
    
$ kubectl get pods fio-cstor-sparse
NAME               READY     STATUS    RESTARTS   AGE
fio-cstor-sparse   1/1       Running   0          1m

</div>

<br>



***Note:** The StorageClass `openebs-cstor-sparse` provisions volume on the `cstor-sparse-pool` which is constructed on sparse disks created on the node during OpenEBS installation. This is useful for testing applications, initial testing of OpenEBS etc. For production applicaitions, consider provisioning volumes on disk pools. See [below](#provision-from-a-disk-pool)* 

<br>

<hr>

<br>

## Provision from a disk pool

<br>

Use a similar PVC spec or volumeClaimTemplate to use a StorageClass that is pointing to a pool with real disks. Consider the following parameters while provisioning OpenEBS volumes on real disks



**AccessModes:** cStor provides iSCSI targets, which are appropriate for RWO (ReadWriteOnce) access mode and is suitable for all types of databases. For webscale applications like WordPress or any for any other NFS needs, you need RWM (ReadWriteMany) access mode. For RWM, you need NFS provisioner to be deployed along with cStor. See <a href="/docs/next/rwm.html" target="_blank">how to provision RWM PVC with OpenEBS </a>.

**Size:** cStor supports thin provisioning by default, which means you can request any size of the volume through the PVC and get it provisioned. Resize of the volume is not fully supported through the OpenEBS control plane in the current release (OpenEBS 0.8.0) and is active development, see [roadmap](/docs/next/cstor.html#cstor-roadmap) for more details. Hence it is recommended to give good amount of buffer to the required size of the volume so that you don't need to resize immediately or in the very short time period. 

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

When a PVC is deleted, the OpenEBS PV is deleted including the data in it. In StorageClass, the parameter `ReclaimPolicy` is set to `Delete` by default. cStor currently does not support `Retain` feature. 

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
