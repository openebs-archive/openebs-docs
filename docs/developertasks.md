---
id: developertasks
title: OpenEBS tasks for application developers
sidebar_label: Developer tasks
---

------

A developer in the current context refers to a person developing a containerized stateful application that runs on Kubernetes clusters. A developer is assumed not to have the administrative access or rights to the Kuberenetes cluster. 



An operator in the current context refers to a person who is deploying, managing and monitoring Kubernetes clusters for his or her organization. An Operator has the administrative access to the Kubernetes cluster and is responsible to setup the Kubernetes related infrastructures for access by developers. If you are interested in knowing tasks performed by Kubernetes operators or administrators, on the OpenEBS enabled Kubernetes clusters,  [refer to the Operators tasks](/docs/operatortasks.html)



1. I am an application developer. My stateful application needs persistent storage. How do I get started with OpenEBS ?
2. I want to delete the OpenEBS volume and the data inside it. How do I do that ?
3. I want to deploy MySQL database in Master-Slave mode. What are the best practices? What tasks need to be done by the Operator?
4. Where do I specify the size and number of replicas of the OpenEBS volume?
5. How do I monitor the OpenEBS volumes of my application?

How do I create volumes even when one of the hosts is powered off in both dedicated and hyperconverged mode? #114
How do I run ELK stack on OpenEBS? #279
How do I create a benchmark using YSCB tool to test Cassandra DB #565
How do I create a benchmark using YSCB tool to test MongoDB #566
Failover feature between AZs? and does it support coreOS, CentOS? #992
How do I include CoreOS-based test bed (kubernetes cluster) as part of OpenEBS CI #1044
How does OpenEBS support  Docker Swarm as a volume plugin? #1117














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
