---
id: hyperconverged
title: OpenEBS Usecases - Hyperconverged
sidebar_label: Hyperconverged
---

------

## Problem Statement

Hyper Converged Infrastructure has many benefits such as horizontally scaling the infrastructure on the need basis, better RoI / lower TCO of the overall infrastructure. Kubernetes does not have all the tools required to manage the storage needs of applications in such a way that native hyper-convergence is achieved. Some of the problem that pop up with Kubernetes in the context of HCI are

- Management of underlying disks (local disks or cloud disks) are not managed by Kubernetes. The management includes, taking corrective action when a disk goes bad or becomes unavailable, or a new disk becomes available, when a new node is introduced into the Kubernetes cluster etc
- Scheduling of volumes in a way that storage distribution always stays efficient across all the nodes of the Kubernetes cluster. Kubernetes scheduling of the pods is not considering optimal storage choices.



## OpenEBS solution

OpenEBS enables native hyper convergence capability on Kubernetes with it's Node Disk Manager and being able to  provide granular volume policies that take node affinity into consideration for volume scheduling. 







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
