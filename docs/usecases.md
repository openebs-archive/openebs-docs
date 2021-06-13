---
id: usecases
title: OpenEBS Use cases and Examples
sidebar_label: Use cases
---
------

OpenEBS is used as a solution for the persistent storage needs for many stateful applications on Kubernetes. 

Following are a few examples.

### Self Managed Database Service like RDS 

As per the [CNCF Database Technology Radar report](https://radar.cncf.io/2020-11-database-storage), many companies working with sensitive data are more likely to host databases in-house and may even be required to. Also, if a company has a large amount of data, for instance, there can be significant cost overhead to using a managed database solution available from cloud providers.

OpenEBS through its simplicity in setup and configuration and built on the resilience of Kubernetes orchestration can be used to easily setup a managed database service. Using OpenEBS you get the benefits of:
- Fast local storage for cloud native databases
- Synchronously replicated storage for protecting against node or AZ failures
- Enterprise storage features like Thin provisioning, Storage Expansion, Data Protection and more. 

Examples:

<div class="row stateful-applications_row">
  <div class="">
	<a href="/docs/next/mysql.html" target="_blank">
		<img src="/docs/assets/a-mysql.png" alt="MySQL" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/docs/next/postgres.html" target="_blank">
		<img src="/docs/assets/a-postgres.png" alt="PostgreSQL" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/percona.html" target="_blank">
		<img src="/docs/assets/a-percona.png" alt="Percona" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/redis.html" target="_blank">
		<img src="/docs/assets/a-redis.png" alt="Redis" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/docs/next/mongo.html" target="_blank">
		<img src="/docs/assets/svg/a-mongo.svg" alt="MongoDB" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/cassandra.html" target="_blank">
		<img src="/docs/assets/a-cassandra.png" alt="Cassandra" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/nuodb.html" target="_blank">
		<img src="/docs/assets/a-nuodb.png" alt="NuoDB" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>

### Open source durable storage for Observability stack

Open standards such as OpenMetrics and OpenTelemetry and open source tools like Prometheus, Grafana, Elastic have become widely adopted project to run the [Cloud Native Observability stack](https://radar.cncf.io/2020-09-observability). It shouldn't come as any surprise that OpenEBS, being a truly open source technology is the choice for running these open source observability stacks.  

Examples:

<div class="row stateful-applications_row">
  <div class="">
	<a href="/docs/next/prometheus.html" target="_blank">
		<img src="/docs/assets/a-prometheus.png" alt="Prometheus" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/elasticsearch.html" target="_blank">
		<img src="/docs/assets/a-elastic.png" alt="Elastic" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>

### Running CI/CD on Kubernetes

Jenkins, Gitlab, Gerrit, Sonarqube and many of the tools built in-house are moving towards Kubernetes for better DevOps experience and agility. With Kubernetes becoming a standard to run the applications, the CI/CD tools that manage them are following suite, with many provides now providing Kubernetes Operators.

Examples:

<div class="row stateful-applications_row">
  <div class="">
	<a href="/docs/next/gitlab.html" target="_blank">
		<img src="/docs/assets/a-gitlab.png" alt="GitLab" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>

### Self managed Object storage systems like Minio

Use OpenEBS and Minio on Kubernetes to build cross AZ cloud native object storage solution. Kubernetes PVCs are used by Minio to seamlessly scale Minio nodes. OpenEBS provides easily scalable and manageable storage pools. Scalability of Minio is directly complimented by OpenEBS's feature of cloud-native scalable architecture.


Examples:

<div class="row stateful-applications_row">
  <div class="">
	<a href="/docs/next/minio.html" target="_blank">
		<img src="/docs/assets/a-minio.png" alt="Minio" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>

### Building scalable websites and ML pipelines

Web-scale applications like WordPress require shared storage with RWM access mode. OpenEBS acting as a persistent storage backend for NFS storage provider solves this need very well. 

Examples:

<div class="row stateful-applications_row">
  <div class="">
	<a href="/docs/next/rwm.html" target="_blank">
		<img src="/docs/assets/a-nfs.png" alt="Wordpress" style="float:left;width:100px;">
	</a>
  </div>
</div>

<br>
<br>


