---
id: storageengine
title: Pluggable OpenEBS Storage Engines
sidebar_label: CAS Engines
---

------


## Overview of a Storage Engine

A storage engine is the data plane component of the IO path of a persistent volume. In CAS architecture, users can choose different data planes for different application workloads based on a configuration policy. A Storage engine can be hardened to optimize a given workload either with a feature set or for performance.

Operators or administrators typically choose a storage engine with a specific software version and build optimized volume templates that are fine-tuned with the type of underlying disks, resiliency, number of replicas, set of nodes participating in the Kubernetes cluster. Users can then choose an optimal volume template at the time of volume provisioning, thus providing the maximum flexibility in running the optimum software and storage combination for all the storage volumes on a given Kubernetes cluster.



## Types of Storage Engines

OpenEBS provides two types of storage engines.

1. **Jiva** - Jiva is the first storage engine that was released in 0.1 version of OpenEBS and is the most simple to use. It is built in GoLang and uses LongHorn and gotgt stacks inside. Jiva runs entirely in user space and provides standard block storage capabilities such as synchronous replication. Jiva is suitable for smaller capacity workloads in general and not suitable when extensive snapshotting and cloning features are a major need. [Read more details of Jiva here](/docs/next/jiva.html)
2. **cStor** - cStor is the most recently released storage engine, which became available from 0.7 version of OpenEBS. cStor is very robust,  provides data consistency and supports enterprise storage features like snapshots and clones very well. It also comes with a robust storage pool feature for comprehensive storage management both interms of capacity and performance. Together with NDM (Node Disk Manager), cStor provides complete set of persistent storage features for stateful applications on Kubernetes. [Read more details of cStor here](/docs/next/cStor.html)

<img src="/docs/assets/engines.png" alt="OpenEBS storage engines - Jiva and cStor" width="900"/>

*In the above figure:*

**SP** - Storage Pool, the custom resource that represents the Jiva storage pool

**CV** - cStor Volume, the custom resource that represents the cStor volume

**CVR** - cStor Volume Replica

**SPC** - Storage Pool Claim, the custom resource that represents the cStor pool aggregate

**CSP** - cStor Storage Pool, the custom resource that represents cStor Pool on each node



One SPC points to multiple CSPs. Similarly one CV points to as CVRs. Read detailed explanation of cStor Pools [here](http://localhost:3000/docs/next/cstor.html#cstor-pools). 

<br> <br>



## Choosing a storage engine

Storage engine is chosen by specifying the annotation `openebs.io/cas-type` in the StorageClass specification. 

### Sample spec - StorageClass for cStor

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: cStor-storageclass
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cStorPool-SSD"
provisioner: openebs.io/provisioner-iscsi
---
```



### Sample spec - StorageClass for Jiva

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: jiva-storageclass
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: StoragePool
        value: default
provisioner: openebs.io/provisioner-iscsi
---
```

When the cas-type is `jiva` , StoragePool value of `default` has a special meaning. When pool is `default` , Jiva engine will carve out the data storage space for the replica pod from the storage space of the container (replica pod) itself. When the size of the required volume is small (like 5G to 10G), StoragePool `default` works very well as it can be accommondated within the container itself.  

<br> <br>



## cStor vs Jiva : Features comparison

Below table identifies few differences between the two engines. 

| Feature                                   | Jiva  |  cStor   |
| ----------------------------------------- | :---: | :------: |
| Light weight and completely in user space |  Yes  |   Yes    |
| Synchronous replication                   |  Yes  |   Yes    |
| Suitable for low capacity workloads       |  Yes  |   Yes    |
| Snapshots and cloning support             | Basic | Advanced |
| Data consistency                          |  Yes  |   Yes    |
| Backup and Restore using ARK              |  Yes  |   Yes    |
| Suitable for high capacity workloads      |       |   Yes    |
| Thin Provisioning                         |       |   Yes    |
| Disk pool or aggregate support            |       |   Yes    |
| On demand capacity expansion              |       |   Yes    |
| Data resiliency (RAID support )           |       |   Yes    |



cStor is recommended most of the times as it commands more features and focussed development effort. cStor does offer robust features including snapshots/clones, storage pool features such as thin provisioning, on demand capacity additions etc.

Jiva is recommended for a low capacity workloads which can be accommodated within the container image storage, for example 5 to 50G. Jiva is very easy to use, and provides enterprise grade container native storage without the need of dedicated hard disks. Consider using cStor instead of Jiva especially when snapshots and clones capabilties are needed.



<br><br>

### See Also:

#### [cStor overview](/docs/next/cstor.html)

#### [Jiva overview](/docs/next/jiva.html)

#### [Storage Pools](/docs/next/setupstoragepools.html)
#### [Storage Classes](/docs/next/setupstorageclasses.html)



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
