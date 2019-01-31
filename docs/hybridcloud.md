---
id: hybridcloud
title: OpenEBS Usecases - Hybrid Cloud
sidebar_label: Hybrid Cloud
---

------

Hybrid cloud is a cloud computing environment that uses a mix of on-premises, private cloud and third-party, public cloud services with orchestration between the two or more platforms. When using multiple cloud vendors, manageability, ease of migration and being able to efficiently manage cloud lock-in becomes top concerns. OpenEBS provides abstraction of data plane management, ability to manage storage same way on all vendors and migrate as you need, when you need.

???DIAGRAM???

## Problems

- Cloud vendor lock-inProblems with EBS detach/attach/mount process
- Difficult to manage scale-out storage solutions on private cloud 

## OpenEBS solution

OpenEBS can help to manage cloud lock-in. When you write your data to OpenEBS you write to an open source, highly flexible data management layer that allows you to manage your exposure to each cloud or data center. OpenEBS works on AWS on top of EBS, Google Cloud, Microsoft Azure, Digital Ocean, on-premises baremetal Kubernetes deployments, Red Hat OpenShift, IBM Cloud Private and many others to improve resiliency, to limit lock-in, and for better integration with Kubernetes. 




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
