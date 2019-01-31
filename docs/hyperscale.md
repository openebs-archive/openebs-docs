---
id: hyperscale
title: OpenEBS Usecases - Hyperscale
sidebar_label: Hyperscale
---

------

Although we think hyperconverged is a better way to provide storage for cloud-native, largely scalable and elastic stateful workloads, especially on new hardware where local SSD/NMVe are available, there are cases where IT admins prefer to deploy and maintain compute and storage separately. The goal of hyperscale, as described on Wikipedia, is “to scale appropriately as increased demand is added to the system.” OpenEBS provides different ways to deploy storage for your cloud-native workloads, no matter what your preferences are.



???DIAGRAM???



## Problems

Utilizing old infrastructure where storage and compute are not equally available on every node. Running workloads on blade servers where no local storage is available. Environment where storage has to be controlled by storage admins. Stateless workload heavy environment, where stateless and stateful workloads have to  flood around the same nodes



## OpenEBS can be configured to use storage on specific Kubernetes nodes



OpenEBS deployments are configured in a yaml files, and deployment are managed by Kubernetes itself. That’s why we call it Container Attached Storage (CAS). If you have certain nodes that have disks attached aka Storage Nodes, OpenEBS Volume Replica Pods can be scheduled on these Storage Nodes only. In Kubernetes, taints allow a node to repel a set of pods. Taints and tolerations work together to ensure that pods are not scheduled onto inappropriate nodes. [Here](https://blog.openebs.io/how-do-i-configure-openebs-to-use-storage-on-specific-kubernetes-nodes-361e3e842a78) are the instructions to use Kubernetes “taints & tolerations” feature to use storage on specific Kubernetes nodes. You can also use nodeAffinity to achieve similar result by following the instructions [here](https://blog.openebs.io/how-do-i-pin-the-openebs-replica-pod-s-to-the-kubernetes-nodes-where-they-were-scheduled-2ba42e3015df). 



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
