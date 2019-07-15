---
id: jiva
title: Jiva Overview
sidebar_label: Jiva
---

------



### Jiva

Jiva has a single container image for both controller and replica. Docker image is available at https://hub.docker.com/r/openebs/jiva/ . Each Jiva Volume comprises of a Jiva Controller (or Target) and a set of Jiva Replicas. The Jiva controller synchronously replicates the incoming IO to the Jiva replicas. The replica considers a Linux sparse file as the foundation. Jiva support for thin provisioning of storage volumes.  

![Jiva storage engine of OpenEBS](/docs/assets/jiva.png)

#### Jiva Sparse File Layout

The following content is directly taken from Rancher's LongHorn [announcement documentation](https://rancher.com/microservices-block-storage/).

**Replica Operations of Jiva**

------

Jiva replicas are built using Linux sparse files, which support thin provisioning. Jiva does not maintain additional metadata to indicate which blocks are used. The block size is 4K. When replica is added to the controller or restart happened on existing replica, it creates auto generated snapshot or differencing disk. As the number of snapshots grows, the differencing disk chain could get quite long. To improve read performance, Jiva, therefore, maintains a read index that records which differencing disk holds valid data for each 4K block. In the following figure, the volume has eight blocks. The read index has eight entries and is filled up lazily as read operation takes place. A write operation resets the read index, causing it to point to the live data. ![Longhorn read index](http://cdn.rancher.com/wp-content/uploads/2017/04/14095610/Longhorn-blog-3.png)



The read index is kept in memory and consumes two byte for each 4K block. A maximum of 512 auto generated snapshots can be created for each volume. The read index consumes a certain amount of in-memory data structure for each replica. A 1TB volume, for example, consumes 512MB of in-memory read index. We will potentially consider placing the read index in memory-mapped files in the future.

**Replica Rebuild**

------

When the controller detects failures in one of its replicas, it marks the replica as being in an error state. The The Jiva volume controller is responsible for initiating and coordinating the process of rebuilding the faulty replica as follows:

- Once Jiva replica comes up, it will try to get added to controller and controller will mark it as Write only. Then replica initiates the rebuilding process from other healthy replicas.

  **Note:** If REPLICATION_FACTOR met, the controller will continue to serve R/W IOs. Else, it will wait for satisfying REPLICATION_FACTOR(`(n/2)+1`; where n is the number of replicas).

- After the sync is completed and it has consistent data, the volume controller sets the new replica to RW (read-write) mode and faulty replica will be removed.

<br>

## See Also:

### [Which storage engine should I use ?](/docs/next/casengines.html#cstor-vs-jiva-vs-localpv-features-comparison)

### [Jiva User Guide ](/docs/next/jivaguide.html)

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
