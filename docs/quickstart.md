---
id: quickstart
title: Quickstart Guide to OpenEBS
sidebar_label: Quickstart
---
------

<div class="emphasize">
    <ul>
        <li>Understand the <a href="/docs/next/common.html">pre-requisites</a> for your Kubernetes platform</li>
        <li>Start <a href="/docs/next/installation.html">installation </a> either through helm or through OpenEBS operator. For ease of testing OpenEBS functionality, a default cStor sparse pool and a corresponding StorageClass are created </li>
        <li>For test deployments, use cStor-sparse-storage-class to start provisioning cStor OpenEBS volumes</li>
        <li>For production deployments or to test OpenEBS volumes on real disks, create cStorPools, cStor-StorageClasses and start provisioning volumes using the cStor-StorageClasses</li>
    </ul>

</div>

<br>

<font size="5">OpenEBS configuration sequence</font>

<a href="/docs/next/installation.html"><img src="/docs/assets/sitemap.png" alt="OpenEBS configuration flow" style="width:1000px"></a>





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
