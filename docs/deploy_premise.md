---
id: virtualmachines
title: Virtual Machines
sidebar_label: Virtual Machines
---



Setting up OpenEBS On Premise
=============================

This section provides detailed instructions on how to perform the
OpenEBS on-premise deployment. The end goal of this precedure is to have
the following functional :

-   Kubernetes cluster (K8s master & K8s minions/host) configured with
    the OpenEBS iSCSI flexvol driver,
-   OpenEBS Maya master
-   OpenEBS Storage Hosts

Depending on your need, you can either setup only the Kubernetes cluster
or the OpenEBS cluster or both. The number of nodes in each category is
configurable.

The Kubernetes cluster is setup, in this framework using "kubeadm"



<!-- Hotjar Tracking Code for https://docs.openebs.io -->
<script>
  

```
   (function(h,o,t,j,a,r){
   h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
   h._hjSettings={hjid:785693,hjsv:6};
   a=o.getElementsByTagName('head')[0];
   r=o.createElement('script');r.async=1;
   r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
   a.appendChild(r);
   })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
```

 
</script>