---
id: developertasks
title: OpenEBS Tasks for Application Developers
sidebar_label: Developer Tasks
---

------

A developer in the current context refers to a person developing a containerized stateful application that runs on Kubernetes clusters. A developer does not have the administrative access or rights to the Kuberenetes cluster. 

To know the various tasks performed by Kubernetes operators or administrators, on the OpenEBS enabled Kubernetes clusters, see [Operators Tasks](/docs/operatortasks.html).



## I am an application developer. My stateful application needs persistent storage. How do I get started with OpenEBS ?

## I want to delete the OpenEBS volume and the data inside it. How do I do that ?

## I want to deploy MySQL database in Master-Slave mode. What are the best practices? What tasks need to be done by the Operator?

## Where do I specify the size and number of replicas of the OpenEBS volume?

## How do I monitor the OpenEBS volumes of my application?

## How do I create volumes even when one of the hosts is powered off in both dedicated and hyperconverged mode? #114

## How do I verify MongoDB workflow in OpenEBS? #503

## How do I verify Redis workflow in OpenEBS? # 564

## How do I create a benchmark using YSCB tool to test Cassandra DB #565

## How do I create a benchmark using YSCB tool to test MongoDB #566

## Failover feature between AZs? and does it support coreOS, CentOS? #992

## How do I include CoreOS-based test bed (kubernetes cluster) as part of OpenEBS CI #1044

## How does OpenEBS support  Docker Swarm as a volume plugin? #1117

## How do i provide catalog yaml files based on workload and platform #1138

## How do I start pods without pulling the images again? #1143

## How do I run e2e tests as part of CI #1194

## How do I include e2e tests to verify OpenEBS operator and volume pod behaviour? #1197

## How will OpenEBS operator and volume pods auto-deploy (upgraded) on a dedicated staging environment with multiple applications? #1198

## How do I take snapshots of OpenEBS Volumes



## How do I create ansible playbooks to provision GKE clusters with relevant applications on OpenEBS? #1252

## Integration test suite triggered by jenkins as part of the OpenEBS CI must include Openshift clusters. #1290

## How do I avoid replica pods not running when running Persistent Volumes on Openshift in default environments?#1325








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
