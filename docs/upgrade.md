---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---
------

Latest stable version of OpenEBS is 1.9.0. Check the release notes [here](https://github.com/openebs/openebs/releases/tag/1.9.0).  Upgrade to the latest OpenEBS 1.9.0 version is supported only from 1.0.0, 1.1.0, 1.2.0, 1.3.0, 1.4.0, 1.5.0, 1.6.0, 1.7.0 and 1.8.0 and the steps for upgrading from these versions can be found [here](https://github.com/openebs/openebs/blob/master/k8s/upgrades/README.md).

Note: If you are upgrading Jiva volumes that are running in version 1.6 and 1.7, you must use these [pre-upgrade steps](https://github.com/openebs/charts/tree/master/scripts/jiva-tools) to check if your jiva volumes are impacted by [#2956](https://github.com/openebs/openebs/issues/2956). If they are, please reach out to us on [OpenEBS Slack] (https://openebs-community.slack.com/messages/openebs-users/)  or [Kubernetes Slack #openebs channel](https://kubernetes.slack.com/messages/openebs/) for helping you with the upgrade.


## Supported upgrade paths

From 0.9.0 to 1.0.0 - Get the steps from [here](https://docs.openebs.io/v100/docs/next/upgrade.html).

From 0.8.2 to 0.9.0 - Get the steps from [here](https://docs.openebs.io/v090/docs/next/upgrade.html).

From 0.8.1 to 0.8.2 - Get the steps from [here](https://v08-docs.openebs.io/v082/docs/next/upgrade.html).

From 0.8.0 to 0.8.1 - Get the steps from [here](https://v081-docs.openebs.io/docs/next/upgrade.html).

From 0.7.x to 0.8.0 - Get the steps from [here](https://v08-docs.openebs.io/docs/next/upgrade.html).

From 0.6.0 to 0.7.x - Get the steps from [here](https://v07-docs.openebs.io/docs/next/upgrade.html).

From 0.5.3 or 0.5.4 to 0.6.0 - Get the steps from [here](https://v06-docs.openebs.io/docs/next/upgrade.html).

**Note:** You have to upgrade from your current version to the next version as per the supported path. 

<hr>

## See Also:

### [Releases](/docs/next/releases.html)


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
