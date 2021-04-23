---
id: overview
title: Welcome to OpenEBS Documentation
sidebar_label: Overview
---
------

<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong> Documentation for OpenEBS v2.7.0 is no longer actively maintained. The version you are currently viewing is a static snapshot. Click here for the [latest](https://docs.openebs.io) version.  </strong></p></center>

## Introduction 

**OpenEBS** is the most widely deployed and easy to use open-source storage solution for Kubernetes.

**OpenEBS** is the leading open-source example of a category of cloud native storage solutions sometimes called [Container Attached Storage](https://www.cncf.io/blog/2020/09/22/container-attached-storage-is-cloud-native-storage-cas/). **OpenEBS** is listed as an open-source example in the [CNCF Storage Landscape White Paper](https://github.com/cncf/sig-storage/blob/master/CNCF%20Storage%20Landscape%20-%20White%20Paper.pdf) under the hyperconverged storage solutions.

Some key aspects that make OpenEBS different compared to other traditional storage solutions:
- Built using the _micro-services architecture_ like the applications it serves. OpenEBS is itself deployed as a set of containers on Kubernetes worker nodes. Uses Kubernetes itself to orchestrate and manage OpenEBS components.
- Built completely in userspace making it highly portable to run across _any OS/platform_.
- Completely intent-driven, inheriting the same principles that drive the _ease of use_ with Kubernetes.
- OpenEBS supports a range of storage engines so that developers can deploy the storage technology appropriate to their application design objectives. Distributed applications like Cassandra can use the _LocalPV_ engine for lowest latency writes. Monolithic applications like MySQL and PostgreSQL can use _Mayastor_ or _cStor based on ZFS_ for resilience. Streaming applications like Kafka can use the NVMe engine [Mayastor](https://github.com/openebs/Mayastor) for best performance in edge environments. Across engine types, OpenEBS provides a consistent framework for high availability, snapshots, clones and manageability.

An added advantage of being a completely Kubernetes native solution is that administrators and developers can interact and manage OpenEBS using all the wonderful tooling that is available for Kubernetes like kubectl, Helm, Prometheus, Grafana, Weave Scope, etc.

Check out what users of OpenEBS have to say about their experience in <a href="https://github.com/openebs/openebs/blob/master/ADOPTERS.md" target="_blank">OpenEBS Adoption stories</a>.

## Types of OpenEBS Storage Engines

OpenEBS is a collection Storage Engines, allowing you to pick the right storage solution for your Stateful workloads and the type of Kubernetes platform.  At a high-level, OpenEBS supports two broad categories of volumes - Local and Replicated. 

### Local Volumes 

Local Volumes are accessible only from a single node in the cluster. Pods using Local Volume have to be scheduled on the node where volume is provisioned. Local Volumes are typically preferred for distributed workloads like Cassandra, MongoDB, Elastic, etc that are distributed in nature and have high availability built into them. 

Depending on the type of storage attached to your Kubernetes worker nodes, you can select from different flavors of Dynamic Local PV - Hostpath, Device, ZFS or Rawfile.

### Replicated Volumes (aka Highly Available Volumes)

Replicated Volumes as the name suggests, are those that have their data synchronously replicated to multiple nodes. Volumes can sustain node failures.  The replication also can be setup across availability zones helping applications move across availability zones. 

Replicated Volumes also are capable of enterprise storage features like snapshots, clone, volume expansion and so forth. Replicated Volumes are a preferred choice for Stateful workloads like Percona/MySQL, Jira, GitLab, etc. 

Depending on the type of storage attached to your Kubernetes worker nodes and application performance requirements, you can select from Jiva, cStor or Mayastor. 

### Selecting the right storage engine

See the following table for recommendation on which engine is right for your application depending on the application requirements and storage available on your Kubernetes nodes. 

| Application requirements   | Storage Type | OpenEBS Volumes
|--- |--- |--- 
| Low Latency, High Availability, Synchronous replication, Snapshots, Clones, Thin provisioning | SSDs/Cloud Volumes | <a href="https://mayastor.gitbook.io/introduction/" target="_blank">OpenEBS Mayastor</a>
| High Availability, Synchronous replication, Snapshots, Clones, Thin provisioning | Disks/SSDs/Cloud Volumes | <a href="https://github.com/openebs/cstor-operators" target="_blank">OpenEBS cStor</a>
| High Availability, Synchronous replication, Thin provisioning | hostpath or external mounted storage | [OpenEBS Jiva](/v270/docs/next/jivaguide.html)
| Low latency, Local PV | hostpath or external mounted storage | [Dynamic Local PV - Hostpath](/v270/docs/next/uglocalpv-hostpath.html)
| Low latency, Local PV | Disks/SSDs/Cloud Volumes | [Dynamic Local PV - Device](/v270/docs/next/uglocalpv-device.html)
| Low latency, Local PV, Snapshots, Clones | Disks/SSDs/Cloud Volumes | <a href="https://github.com/openebs/zfs-localpv" target="_blank">OpenEBS Dynamic Local PV - ZFS </a>

OpenEBS is also developing <a href="https://github.com/openebs/rawfile-localpv" target="_blank">Dynamic Local PV - Rawfile</a> storage engines available for alpha testing.

OpenEBS has a vibrant community that can help you get started. If you have further question and want to learn more about OpenEBS, please join [OpenEBS community on Kubernetes Slack](https://kubernetes.slack.com). If you are already signed up, head to our discussions at [#openebs](https://kubernetes.slack.com/messages/openebs/) channel. 

<br>

## Quickstart

Installing OpenEBS in your cluster is as simple as a few `kubectl` or `helm` commands depending on the storage engine. Here are the list of our Quickstart guides with detailed instructions for each storage engine.

### Local Volumes

- [Local PV hostpath](/v270/docs/next/uglocalpv-hostpath.html)
- [Local PV device](/v270/docs/next/uglocalpv-device.html)
- [ZFS Local PV](https://github.com/openebs/zfs-localpv)
- [Rawfile Local PV (alpha)](https://github.com/openebs/rawfile-localpv)

### Replicated Volumes

- [cStor](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md)
- [Jiva](/v270/docs/next/jivaguide.html)
- [Mayastor](https://mayastor.gitbook.io/introduction/)


<br>

## Explore documentation

<br>

<div class="row">
  <div class="">
	<a href="/v270/docs/next/architecture.html">
		<img src="/v270/docs/assets/intro-arch.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v270/docs/next/quickstart.html">
		<img src="/v270/docs/assets/intro-gs.png" alt="OpenEBS quick start" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v270/docs/next/prerequisites.html">
		<img src="/v270/docs/assets/intro-platforms.png" alt="OpenEBS platforms" style="float:left;width:250px;">
	</a>
  </div>
</div>
<div class="row">
  <div class="">
	<a href="/v270/docs/next/usecases.html">
		<img src="/v270/docs/assets/intro-uc.png" alt="OpenEBS use cases" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v270/docs/next/troubleshooting.html">
		<img src="/v270/docs/assets/intro-tsg.svg" alt="Troubleshooting OpenEBS" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v270/docs/next/support.html">
		<img src="/v270/docs/assets/intro-support.png" alt="OpenEBS Support" style="float:left;width:250px;">
	</a>
  </div>
</div>
<br>

## Run stateful applications on OpenEBS

<br>
<div class="row stateful-applications_row">
    <div class="">
	<a href="/v270/docs/next/prometheus.html" target="_blank">
		<img src="/v270/docs/assets/a-prometheus.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v270/docs/next/gitlab.html" target="_blank">
		<img src="/v270/docs/assets/a-gitlab.png" alt="OpenEBS Archipdate ntecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/v270/docs/next/cassandra.html" target="_blank">
		<img src="/v270/docs/assets/a-cassandra.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/v270/docs/next/minio.html" target="_blank">
		<img src="/v270/docs/assets/a-minio.png" alt="OpenEBS Minio" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v270/docs/next/redis.html" target="_blank">
		<img src="/v270/docs/assets/a-redis.png" alt="OpenEBS Redis" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/v270/docs/next/rwm.html" target="_blank">
		<img src="/v270/docs/assets/a-nfs.png" alt="OpenEBS NFS" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/v270/docs/next/elasticsearch.html" target="_blank">
		<img src="/v270/docs/assets/a-elastic.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v270/docs/next/mysql.html" target="_blank">
		<img src="/v270/docs/assets/a-mysql.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/v270/docs/next/postgres.html" target="_blank">
		<img src="/v270/docs/assets/a-postgres.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
  <div class="">
	<a href="/v270/docs/next/percona.html" target="_blank">
		<img src="/v270/docs/assets/a-percona.png" alt="OpenEBS for Percona" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/v270/docs/next/nuodb.html" target="_blank">
		<img src="/v270/docs/assets/a-nuodb.png" alt="OpenEBS for NuoDB" style="float:left;width:100px;">
	</a>
  </div>
 <div class="">
	<a href="/v270/docs/next/mongo.html" target="_blank">
		<img src="/v270/docs/assets/svg/a-mongo.svg" alt="OpenEBS for MongoDB" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br><br>

## See Also:

### [Container Attached Storage (CAS)](/v270/docs/next/cas.html)

### <a href="https://www.cncf.io/blog/2020/09/22/container-attached-storage-is-cloud-native-storage-cas/" target="_blank">CNCF CAS Blog </a>

### [OpenEBS architecture](/v270/docs/next/architecture.html)

<br><hr><br>

