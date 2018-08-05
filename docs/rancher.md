---
id: rancher
title: Using OpenEBS with Rancher
sidebar_label: Rancher
---
------

## Pre-requisites
- Rancher should be installed.
- All the nodes in clusters should have iscsi enabled, see the [prerequisites](/docs/next/prerequisites.html) section.

### Installation of OpenEBS

- Use Rancher dashboard and enable the helm stable from Catalogs.
- Launch **openebs** from Catalog Apps.
- Add storage class. In storage class provide details such as Name,provisoner,parameter.

   For eg: Name-openebs-standalone
           Provisioner- openebs.io/provisione-iscsi(custom)
           Parameters: openebs.io/capacity             5G
           openebs.io/jiva-replica-count                    3
           openebs.io/storage-pool                            default
           openebs.io/volume-monitor                      true
                       
   ​                    
   ​        
   ​        






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
