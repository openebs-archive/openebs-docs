---
id: conceptscas
title: Container Attached Storage (CAS)
sidebar_label: CAS
---

## What is CAS ?

CAS is software that includes a micro services based storage controller and a multiples of micro services based storage replicas which can be orchestrated  by Kubernetes like any other micro service or container. 

![CAS](/docs/assets/cas.png)

CAS is truly cloud native. The control plane of storage software (called storage controller) and the data plane of storage software (called storage replica) are micro services based or containerized and hence truly cloud native. One can apply all the advantages of being cloud native to CAS, primarily.

## Advantages of CAS

Agility

Granularity of storage policies

Avoids lock-in 

Cloud native



## Architecture of CAS on Kubernetes

![CAS](/docs/assets/cas-arch.png)















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
