---
id: glossary
title: Glossary
sidebar_label: Glossary
---

------




# Glossary

| Term  | Definition/Description |
| ------------- | ------------- |
| openebs.io  | namespace is used for all openebs related parameters and objects.  |
| OpenEBS Volume  | is mapped to a Persistent Volume  |
| Storage Pools | are logical objects created by OpenEBS, that are formed using one more Disks or a hostPath |
| VolumeController | acts as the target to which the Application sends the Data. the Volume controller will then send the data synchronously to Volume Replicas. |
| Volume Replicas | writes the data to StoragePools |




# Naming Conventions

backend vs. replica
frontend vs. frontend controller
storage vs. volume
backing storage vs. persistent location
volume provisioner vs. volume provider











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
