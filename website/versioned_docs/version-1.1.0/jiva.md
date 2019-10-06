---
id: version-1.1.0-jiva
title: Jiva Overview
sidebar_label: Jiva
original_id: jiva
---

------



### Jiva

Each Jiva Volume comprises of a Controller (or Target) and a set of Replicas. Both Controller and Replica functionalities are provided by the same binary and hence the same [docker image](https://hub.docker.com/r/openebs/jiva/). Jiva simulates a block device which is exposed via an iSCSI target implementation(gotgt - part of the Controller). This block device is discovered and mounted remotely on the host where application pod is running. The Jiva Controller parallelly replicates the incoming IOs to its replicas. The Replica, in turn, writes these IOs to a sparse file.

![Jiva storage engine of OpenEBS](/docs/assets/jiva.png)

#### Jiva Sparse File Layout

The following content is modified with some architectural change as compared to Rancher's LongHorn [documentation](https://rancher.com/microservices-block-storage/).

**Replica Operations of Jiva**

------

Jiva replicas are built using Linux sparse files, which support thin provisioning. Jiva does not maintain additional metadata to indicate which blocks are used. The block size is 4K. When a replica gets added at the controller, it creates an auto-generated snapshot(differencing disk). As the number of snapshots grows, the differencing disk chain could get quite long. To improve read performance, Jiva, therefore, maintains a read index table that records which differencing disk holds valid data for each 4K block. In the following figure, the volume has eight blocks. The read index table has eight entries and is filled up lazily as read operation takes place. A write operation writes the data on the latest file(head), deletes(fallocate) the corresponding block from the older snapshots(or differencing disks) and updates the index in the table, which now points to the live data.

![Longhorn read index](/docs/assets/Longhorn-blog-new.png)

The read index table is kept in memory and consumes two bytes for each 4K block. A maximum of 512 auto-generated snapshots can be created for each volume. The read index table consumes a certain amount of in-memory space for each replica. A 1TB volume, for example, consumes 512MB of in-memory space.

**Replica Rebuild**

------

The Jiva volume controller is responsible for initiating and coordinating the process of syncing the replicas. Once a replica comes up, it tries to get added to controller and controller will mark it as WO(Write Only). Then the replica initiates the rebuilding process from other healthy replicas. After the sync is completed, the volume controller sets the new replica to RW (read-write) mode.

When the controller detects failures in one of its replicas, it marks the replica as being in an error state and the rebuilding process is triggered.

**Note:** If REPLICATION_FACTOR is still met even after a replica is marked faulty, the controller will continue to serve R/W IOs. Else, it will wait for satisfying REPLICATION_FACTOR((n/2)+1; where n is the number of replicas).

<br>

## See Also:

### [Which storage engine should I use ?](/v110/docs/next/casengines.html#cstor-vs-jiva-vs-localpv-features-comparison)

### [Jiva User Guide ](/v110/docs/next/jivaguide.html)

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
