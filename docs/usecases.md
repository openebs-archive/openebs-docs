---
id: usecases
title: OpenEBS Use cases
sidebar_label: Use cases
---
------

OpenEBS is used as a solution for the persistent storage needs of stateful applications on Kubernetes. Following are the typical use cases



<font size="6">Persistent storage for Kubernetes</font>

OpenEBS provides container native storage that is managed using native Kubernetes commands such as kubectl. For block storage needs of the application, iSCSI volumes are presented natively in OpenEBS. For <a href="/docs/next/rwm.html" target="_blank">RWM or NFS needs</a>, NFS provisioner can be deployed along with cStor volumes. For object storage needs, Minio is deployed with cStor volumes as the underlying needs

<font size="6">Object storage on Kubernetes</font>

Use <a href="/docs/next/minio.html" target="_blank">OpenEBS and Minio</a> on Kubernetes to build cross Z cloud native object storage solution. Kubernetes PVCs are used by Minio to seamlessly scale Minio nodes. OpenEBS provides easily scalable and manageable storage pools. Scalability of Minio is directly complimented by OpenEBS's feature of infinitely scalable capacity via cStor pools.  

<font size="6">Prometheus monitoring</font>

Prometheus, Grafana and OpenEBS stack provides a scalable, high performing monitoring solution. See more details on this use case <a href="/docs/next/prometheus.html" target="_blank">here</a>

<font size="6">Cloud native CI/CD</font>

CI/CD systems are being rebuilt in most enterprises to take advantage of the micro service based technologies like Kubernetes and Docker.GitLab is one of the popular choices for cloud native CI/CD needs, and it needs a scalable, easy to manage cloud native storage for the underlying applications such as RDS, MySql and Minio. OpenEBS is the perfect choices from the storage point of view.  An easy an powerful cloud native CI/CD solution is built <a href="/docs/next/gitlab.html" target="_blank"> using GitLab and OpenEBS</a>

<font size="6">Logging solution</font>

EFK is the most popular cloud native logging solution on Kubernetes for On-Premise as well as cloud platform. OpenEBS when <a href="/docs/next/elasticsearch.html" target="_blank">deployed as statefulset</a>, provides itself as a clear choice for EFK stack storage because of its simplicity and CAS architecture

<font size="6">RDS like mysql</font>

RDS is famous because of its simplicity to setup and manage. One does not need special administration skills to manage RDS. An RDS like solution is <a href="/docs/next/mysql.html" target="_blank">built easily using OpenEBS</a>, as OpenEBS greatly simplifies the administrative tasks of the database such as provisioning the storage, expansion of the data , backup and restore etc



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
