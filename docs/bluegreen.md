---
id: bluegreen
title: OpenEBS Usecases - Blue Green deployments
sidebar_label: Blue Green
---

------

## Problem statement

Blue Green deployments are the preferred practice for live upgrades. Stateful applications need to be supported for this scenarios as well. Main issues are

- Upgrading storage involves all the stateful applications in the cluster
- Very difficult to revert back to the original software version of the storage cluster


## OpenEBS solution

CAS architecture helps BG deployment at application level rather than entire storage controller level












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
