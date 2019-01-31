---
id: rancher
title: Using OpenEBS with Rancher
sidebar_label: Rancher
---
------

## Prerequisites
- Rancher should be installed.
- All the nodes in clusters should have iscsi enabled. See the [prerequisites](/docs/next/prerequisites.html) section.

## Installing OpenEBS using Rancher Dashboard

 The following procedure helps you install OpenEBS using Rancher dashboard.
 
 1. Go to the Rancher dashboard and select **Catalogs**. The following screen is displayed.

![Helm-Enable](/docs/assets/rancher_enable_helm.PNG)


2. Click **Enable** to enable **Helm Stable**. Helm Stable is now **Enabled**.
3. Go to **Catalog Apps** from the Rancher dashboard. The following screen is displayed.

![openebs-installation](/docs/assets/rancher_openebs_install.PNG)


4. Click **openebs**.
5. Click **Launch** to launch OpenEBS.
6. Go to the Rancher dashboard and click **Storage**.

![openebs-storageclass](/docs/assets/rancher_openebs_storageclass.PNG)


7 Select **Storage Class** to add storage class. Add details such as Name, Provisioner, and Parameters.

**Example:**

``` 
           Name-openebs-percona
           Provisioner- openebs.io/provisione-iscsi(custom)
           Parameters: openebs.io/capacity             5G
           openebs.io/jiva-replica-count               3
           openebs.io/storage-pool                     default
           openebs.io/volume-monitor                   true
```                       
                       
           
          






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
