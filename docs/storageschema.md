---
id: storageschema
title: OpenEBS storage schema
sidebar_label: Storage Schema
---

------

OpenEBS introduces more elements into the storage configuration to give the administrator an end-to-end control and experience while managing the persistent storage on the Kubernetes cluster. Apart from the standard Kubernetes constructs of PVC, SC and PV, OpenEBS introduces Volume Pods, Storage Pools Claims , Storage Pools and Disk Objects. The stack of these constructs is shown below.



![OpenEBS storage schema](/docs/assets/storage-schema.png)

Disk Objects unify all the underlying disk types to a common Kubernetes construct. Disk objects are discovered, monitored and managed (sometimes provision and de-provision for example in network disks) using Node Disk Manager or NDM which runs as a daemonset on all the nodes in the Kubernetes cluster. NDM registers itself into Kubernetes Node Problem Detector for receiving any faults in the underlying disks as soon as they are observed. 

![OpenEBS Disk Objects](/docs/assets/do.png)









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
