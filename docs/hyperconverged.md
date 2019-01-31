---
id: hyperconverged
title: OpenEBS Usecases - Hyper Converged Infrastructure (HCI)
sidebar_label: Hyperconverged
---

------

## Problem Statement

Hyper Converged Infrastructure (HCI) has many benefits such as horizontally scaling the infrastructure on the need basis, better RoI / lower TCO of the overall infrastructure. Kubernetes users would benefit if they have all the tools required to manage the storage needs of applications in such a way that native hyper-convergence is achieved. Some of the gaps that pop up with Kubernetes in the context of HCI are

- Management of underlying disks (local disks or cloud disks) are not managed by Kubernetes. The management includes, taking corrective actions when a disk goes bad or becomes unavailable, or a new disk becomes available, when a new nodes are introduced into the Kubernetes cluster etc
- Increasing capacity and performance of the persistent volumes at run time is not possible with Kubernetes today. For a true HCI, this capability is very important



## OpenEBS solution

With it's Node Disk Manager's (NDM) capability, OpenEBS enables native hyper convergence capability on Kubernetes clusters. The granular volume policies that take node affinity into consideration for volume scheduling will make sure the distribution of volumes across Kubernetes nodes stays efficient and is in control of Kubernetes operators. 

![Managing HCI with Kubernetes and OpenEBS](/docs/assets/hci.png)

With OpenEBS, the Operator rolls out the Kubernetes clusters with minimum amount of storage capacity required. As the demand of storage capacity and performance goes up, more storage into the same storage pool is added or sometimes, new storage pools are added to the nodes. This is commonly referred to as scaleup model of storage. Kubernetes naturally supports scaleout model of adding additional resources on demand (adding new nodes to cluster). When news nodes are added, storage resources on the new nodes are automatically discovered by OpenEBS and they can be configured for automating the storage pools creation and volume provisioning planning. 









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
