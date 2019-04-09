---
id: performance
title: Performance testing of OpenEBS
sidebar_label: Performance testing
---
------

<font size="6">Steps for performance testing</font> 

**Setup cStorPool and StorageClass**

Choose the appropriate disks (SSDs or SAS or Cloud disks) and [create pool](/docs/next/configurepools.html)  and [create StorageClass](/docs/next/configuresc.html). For performance testing, performance numbers vary based 

- on the number of OpenEBS replicas (1 vs 3) (latency between cStor target and cStor replica)
- on whether all the replicas are in one zone or across multiple zones
- the network latency between the application pod and iSCSI target (cStor target)

**Run fio test through OpenEBS Litmus** 

1. Clone litmus repository

   ```
   git clone https://github.com/openebs/litmus.git
   cd litmus/apps/fio/tests/performance
   ```

2. Edit run_litmus_test.yaml and modify the following

   ```
   - name: PROVIDER_STORAGE_CLASS
     value: openebs-standard
    #value: local-storage
   
   - name: APP_NODE_SELECTOR
     value: percona
   
   - name: FIO_TEST_PROFILE
     value: standard-ssd
   
   - name: FIO_SAMPLE_SIZE
     value: "128m"
   
   - name: FIO_TESTRUN_PERIOD
     value: "60"
   ```

3. Run the fio performance test

   ```
   kubectl create -f run_litmus_test.yaml
   ```

4. Observe the results at the end of the test

<font size="6">Support for Performance tuning </font>

Support for performance tuning for specific workloads can be obtained through the premium plan on MayaOnline. Connect your cluster to <a href="https://mayaonline.io" target="_blank">MayaOnline</a>, start the cluster on evaluation plan and seek support for performance tuning. 

<br>

## See Also:

### [Connecting to MayaOnline](/docs/next/mayaonline.html)

### [Seeking help](/docs/next/support.html)

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
