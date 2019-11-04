---
id: quickstart
title: Quickstart Guide to OpenEBS
sidebar_label: Quickstart
---
------

<br>

<a href="/docs/next/prerequisites.html"><img src="/docs/assets/svg/config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%"></a>



<br>

<font size="5">Steps:</font>



<div class="emphasize">
    <ul>
        <li>Kubernetes 1.13+ installed. Latest tested Kubernetes version is 1.15.3.</li>
        <li>For using features like Local PV and Backup & Restore, you must require Kubernetes version 1.13 or above.
        </li>
        <li>Understand the <a href="/docs/next/prerequisites.html">pre-requisites</a> for your Kubernetes platform</li>
        <li>Start <a href="/docs/next/installation.html">installation </a> through OpenEBS operator.</li>
        <li>For production deployments or to test OpenEBS volumes on real disks, create cStorPools, cStor-StorageClasses and start provisioning volumes using the newly created cStor-StorageClasses. More details can be find from <a href="/docs/next/ugcstor.html">here.</a></li>
        <li>For high performance required applications which manage their own replication, data protection and other storage features, provision OpenEBS Local PV. More details can be find from <a href="/docs/next/uglocalpv.html">here.</a></li>
    </ul>








</div>





<br>

<font size="5">As a first step, follow the instructions to setup or verify iSCSI clients on any of the platforms below </font>

<div class="emphasize">

[Ubuntu](/docs/next/prerequisites.html#ubuntu)

[RHEL](/docs/next/prerequisites.html#rhel)

[CentOS](/docs/next/prerequisites.html#centos)

[OpenShift](/docs/next/prerequisites.html#openshift)

[Rancher](/docs/next/prerequisites.html#rancher)

[ICP](/docs/next/prerequisites.html#icp)

[EKS](/docs/next/prerequisites.html#eks)

[GKE](/docs/next/prerequisites.html#gke)

[AKS](/docs/next/prerequisites.html#aks)

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
