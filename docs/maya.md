---
id: maya
title: Maya - The control plane of OpenEBS
sidebar_label: Maya
---

------

The control plane of OpenEBS is generally referred to as Maya. The control plane has several components as follows:

- Maya-Provisioner
- Maya-ApiServer
- Logger
- Side cars
- Maya - Node Disk Manager (NDM)

The above components are collectively referred to as Maya.  For more details about the control plane components, see [the architecture section](/docs/next/architecture.html#control-plane).


## MayaOnline

[MayaOnline](https://docs.mayaonline.io) is the SaaS service for connecting OpenEBS clusters to provide a cross-cloud control plane. MayaOnline provides a permanent free tier to the OpenEBS community.



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
