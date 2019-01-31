---
id: k8sstorage
title: OpenEBS Usecases - Kubernetes Storage
sidebar_label: Kubernetes Storage
---

------

Kubernetes is an open-source system for automating deployment, scaling, and management of containerized applications. It groups containers that make up an application into logical units for easy management and discovery.  Via Kubernetes small groups can manage their own environments, support a DevOps and SRE like approach to building and running software  



## Problems

Whereas most pieces of the infrastructure and software stack, such as messaging, databases, DNS services and even network policy management, have been rearchtected to run on containers and on Kubernetes and therefore are architected and managed in a Kubernetes like way - with small teams in charge of their own environments - traditional shared scale out storage cannot.

## OpenEBS solution

As a popular “Container Attached Storage” solution, OpenEBS decomposes the traditional storage system into smaller services that run on containers and that are orchestrated by Kubernetes itself.  This allows each team responsible for a particular microservice to run their own storage.  Additional benefits are the limitation of the blast radius to each workload, the ability to run OpenEBS on any Kubernetes environment, and the use of local storage where available to accelerate performance and to improve utilization and efficiency.





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
