---
id: bigdata
title: OpenEBS Usecases - Big Data
sidebar_label: Big Data
---

------

## Problem statement

Big Data workloads such as Cassandra, ElasticSearch and Hadoop require stable and predictable performance. Rebuilding times can impact the performance of cluster. Data processing workloads also need to be able to scale up compute independently and quickly on demand. 

- Wait time of volume provisioning
- Supporting high performance workloads
- Long recovery and rebuild time of a fail node



## OpenEBS solution

OpenEBS eliminates the need to separately provision storage for your containerized workloads and provides storage as you grow your data processing cluster size.

OpenEBS provides storage for every workload and hence, each team working on dynamic container based workloads has their own storage, instead of being managed by central storage. Automating storage provisioning simplifies the process of scaling-out big data workloads. OpenEBS can also reduce or completely eliminate the time to rebuild after a node failure.













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
