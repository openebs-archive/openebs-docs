---
id: version-latest-maya
title: Maya - The control plane of OpenEBS
sidebar_label: Maya
original_id: maya
---

------

The control plane of OpenEBS is generally referred to as Maya. The control plane has several components

- Maya-Provisioner
- Maya-ApiServer
- Logger
- Side cars
- Maya - Node Disk Manager

The above components are collectively referred to as Maya.  Control plane components are described in some more details in [the architecture section](/docs/architecture.html#control-plane). 



## MayaOnline

[MayaOnline](https://www.mayaonline.io) is not part of the control plane of a OpenEBS cluster.  MayaOnline is the Saas service for connecting OpenEBS clusters to provide a cross-cloud control plane. MayaOnline provides a permanent [free tier](https://www.mayaonline.io/freetier) to OpenEBS community. 



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
