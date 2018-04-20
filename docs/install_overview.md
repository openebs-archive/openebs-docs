---
id: overview
title: Overview
sidebar_label: Overview
---
<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  Documentation for OpenEBS v0.5-old is no longer actively maintained. The version you are currently viewing is a static snapshot. For up-to-date documentation, see the [latest](https://docs.openebs.io) version.
</strong></p></center>

OpenEBS can run on various platforms: from your laptop, to VMs on a cloud provider. OpenEBS is also aimed at providing the option of using hybrid deployments where data is distributed between cloud and
on-premise environments.

If you are beginner to Kubernetes and OpenEBS, OpenEBS recommends you to get started by setting up Kubernetes. The Kubernetes documentation provides you various Kubernetes installation options to choose from. See [Setup.](https://kubernetes.io/docs/setup/)

If you are already an experienced Kubernetes user and if you have Kubernetes installed you can deploy OpenEBS through either of the following:

-   kubectl - you can easily setup OpenEBS on your existing Kubernetes cluster with a few simple kubectl commands. See, quick-start.
-   helm

The following flowchart helps you visualize how you can get started with OpenEBS.

![image](/docs/assets/gettingstarted.png)

We are looking for help from the community in including additional platforms where OpenEBS has been successfully deployed. Please share your story through GitHub [Issues](https://github.com/openebs/openebs/issues) or [Pull requests](https://github.com/openebs/openebs/pulls).



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
