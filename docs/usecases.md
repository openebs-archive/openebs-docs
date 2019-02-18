---
id: usecases
title: OpenEBS Use cases
sidebar_label: Use cases
---
------

OpenEBS is used as a solution for the persistent storage needs of stateful applications on Kubernetes. Following are the typical use cases

<br>

<font size="6">Prometheus monitoring</font>

Prometheus, Grafana and OpenEBS stack provides a scalable, high performing monitoring solution. 

Read <font size="5"><a href="/docs/next/prometheus.html" target="_blank">On-Premise Prometheus use case </a></font>

<br>

<font size="6">Cloud native CI/CD</font>

CI/CD systems are being rebuilt in most enterprises to take advantage of the micro service based technologies like Kubernetes and Docker.GitLab is one of the popular choices for cloud native CI/CD needs, and it needs a scalable, easy to manage cloud native storage for the underlying applications such as RDS, MySql and Minio. OpenEBS is the perfect choices from the storage point of view.  An easy an powerful cloud native CI/CD solution is built  using GitLab and OpenEBS

Read <font size="5"><a href="/docs/next/gitlab.html" target="_blank">On-Premise GitLab use case</a></font>

<br>

<font size="6">Logging solutions</font>

EFK is the most popular cloud native logging solution on Kubernetes for On-Premise as well as cloud platforms. OpenEBS when <a href="/docs/next/elasticsearch.html" target="_blank">deployed as statefulset</a>, provides itself as a clear choice for EFK stack storage because of its simplicity and CAS architecture

Read <font size="5"><a href="/docs/next/elasticsearch.html" target="_blank">EFK use case </a></font>

<br>

<font size="6">Managed database service like RDS  for On-Prem</font> 

RDS is famous because of its simplicity to setup and manage. One does not need special administration skills to manage RDS. An RDS like solution is built easily using OpenEBS, as OpenEBS greatly simplifies the administrative tasks of the database such as provisioning the storage, expansion of the data , backup and restore etc

Read <font size="5"><a href="/docs/next/mysql.html" target="_blank"> RDS type MySQL use case </a></font>

<br>

<font size="6">Persistent storage for SQL and NoSQL databases </font>

OpenEBS provides  iSCSI storage to support for cloud native applications that run either as deployments or as statefulsets. With features such as synchronous replication across AZs, thin provisioning, the persistent storage solution for sql and nosql databases becomes easy and simple. 

**Below are some example use cases for sql  SQL and NoSQL**

<font size="5"><a href="/docs/next/cassandra.html" target="_blank">Cassandra</a> | <a href="/docs/next/redis.html" target="_blank">Redis</a> | <a href="/docs/next/postgres.html" target="_blank">Postgres</a> | <a href="/docs/next/nuodb.html" target="_blank">NuoDB</a> | <a href="/docs/next/percona.html" target="_blank">Percona </a></font>



<br>

<font size="6">

Persistent storage for Object storage systems like Minio</font>

Use OpenEBS and Minio on Kubernetes to build cross AZ cloud native object storage solution. Kubernetes PVCs are used by Minio to seamlessly scale Minio nodes. OpenEBS provides easily scalable and manageable storage pools. Scalability of Minio is directly complimented by OpenEBS's feature of infinitely scalable capacity via cStor pools.  

Read <font size="5"><a href="/docs/next/minio.html" target="_blank">Minio object storage use case </a></font>

<br>



<font size="6">Persistent storage for web scale applications that requires RWM PVCs</font>



Webscale applications like WordPress require shared storage with RWM access mode. OpenEBS acting as a persistent storage backend for NFS storage provider solves this need very well. 

Read <font size="5"><a href="/docs/next/rwm.html" target="_blank">RWM use case </a></font>

<br>

<hr>

<br>



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
