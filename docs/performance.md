---
id: performance
title: Performance testing of OpenEBS
sidebar_label: Performance testing
---
------

<font size="6">Steps for performance testing</font> 

**Setup cStorPool and StorageClass**

Choose the appropriate disks (SSDs or SAS or Cloud disks) and [create pool](/v1110/docs/next/ugcstor.html#creating-cStor-storage-pools)  and [create StorageClass](/docs/next/ugcstor.html#creating-cStor-storage-class).  There are some performance tunings available and this configuration can be added in the corresponding StorageClass before provisioning the volume. The tunings are available in the [StorageClass](/docs/next/ugcstor.html#setting-performance-tunings) section. 

For performance testing, performance numbers vary based on the following factors.

- The number of OpenEBS replicas (1 vs 3) (latency between cStor target and cStor replica)
- Whether all the replicas are in one zone or across multiple zones
- The network latency between the application pod and iSCSI target (cStor target)

The steps for running FIO based Storage benchmarking and viewing the results are explained in detail [here](https://github.com/openebs/performance-benchmark/tree/master/fio-benchmarks). 


<br>

## See Also:

### [Seeking help](/v1110/docs/next/support.html)

<br>

<hr>

<br>

