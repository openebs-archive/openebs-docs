---
id: version-0.8.2-quickstart
title: Quickstart Guide to OpenEBS
sidebar_label: Quickstart
original_id: quickstart
---
------

<br>

<img src="/docs/assets/svg/config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">



<br>

<font size="5">Steps:</font>



<div class="emphasize">
    <ul>
        <li>Kubernetes 1.9.7+ installed. Latest tested Kubernetes version is 1.13.4.</lili>
        <li>Understand the <a href="/v082/docs/next/prerequisites.html">pre-requisites</a> for your Kubernetes platform</li>
        <li>Start <a href="/v082/docs/next/installation.html">installation </a> either through helm or through OpenEBS operator. For ease of testing OpenEBS functionality, a default cStor sparse pool and a corresponding StorageClass are created </li>
        <li>For test deployments, use cStor-sparse-storage-class and start provisioning cStor OpenEBS volumes</li>
        <li>For production deployments or to test OpenEBS volumes on real disks, create cStorPools, cStor-StorageClasses and start provisioning volumes using the newly created cStor-StorageClasses</li>
    </ul>



</div>





<br>

<font size="5">As a first step, follow the instructions to setup or verify iSCSI clients on any of the platforms below </font>

<div class="emphasize">
[Ubuntu](/v082/docs/next/prerequisites.html#ubuntu)

[RHEL](/v082/docs/next/prerequisites.html#rhel)

[CentOS](/v082/docs/next/prerequisites.html#centos)

[OpenShift](/v082/docs/next/prerequisites.html#openshift)

[Rancher](/v082/docs/next/prerequisites.html#rancher)

[ICP](/v082/docs/next/prerequisites.html#icp)

[EKS](/v082/docs/next/prerequisites.html#eks)

[GKE](/v082/docs/next/prerequisites.html#gke)

[AKS](/v082/docs/next/prerequisites.html#aks)

<br>

</div>



[Provide feedback](https://github.com/openebs/openebs-docs/edit/staging/docs/quickstart.md) if a platform is missing in the above list

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
