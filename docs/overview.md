---
id: overview
title: Welcome to OpenEBS Documentation
sidebar_label: Overview
---
------

<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
Documentation for OpenEBS v2.9.0 is no longer actively maintained. The version you are currently viewing is a static 
snapshot. Click here for the [latest](https://docs.openebs.io) version.
</strong></p></center>

## Introduction 

### What is OpenEBS?

- OpenEBS is the leading open-source example of a category of cloud native storage solutions sometimes called [Container Attached Storage](https://www.cncf.io/blog/2020/09/22/container-attached-storage-is-cloud-native-storage-cas/). 
- OpenEBS is the most widely deployed and easy to use open-source cloud native storage solution for Kubernetes Stateful workloads. Check out what users of OpenEBS have to say about their experience in <a href="https://github.com/openebs/openebs/blob/master/ADOPTERS.md" target="_blank">OpenEBS Adoption stories</a>.
- OpenEBS is a collection of Storage Engines, allowing you to pick the right storage solution for your Stateful workloads and the type of Kubernetes platform.  At a high-level, OpenEBS supports two broad categories of volumes - [Local Volumes](#local-volumes) and [Replicated Volumes](#replicated-volumes). 
- OpenEBS is a Kubernetes native hyperconverged storage solution that manages the local storage available to nodes and provides local or highly available distributed persistent volumes to Stateful workloads. An added advantage of being a completely Kubernetes native solution is that administrators and developers can interact and manage OpenEBS using all the wonderful tooling that is available for Kubernetes like kubectl, Helm, Prometheus, Grafana, Weave Scope, etc.
- <a href="https://github.com/openebs/openebs/" target="_blank">OpenEBS Project</a> is an open source container attached storage solution originally built by [MayaData](https://mayadata.io). OpeneBS was donated to the _Cloud Native Computing Foundation_ and is now a [CNCF sandbox project](https://www.cncf.io/sandbox-projects/).


### What does OpenEBS do?

OpenEBS manages the storage available on the Kubernetes nodes and uses that storage to provide Local or Distributed Persistent Volumes to Kubernetes Stateful workloads. 

In case of [Local Volumes](#local-volumes): 
  - OpenEBS can create Persistent Volumes using raw block devices or partitions, or using sub-directories on Hostpaths or by using LVM,ZFS,sparse files. 
  - The local volumes are directly mounted into the Stateful Pod, without any added overhead from OpenEBS in the data path.
  - OpenEBS provides additional tooling for Local Volumes for monitoring, backup/restore, disaster recovery, snapshots when backed by ZFS or LVM, and more. 

In case of [Distributed (aka Replicated) Volumes](#replicated-volumes):
  - OpenEBS creates a Micro-service for each Distributed Persistent volume using one of its engines - Mayastor, cStor or Jiva. 
  - The Stateful Pod writes the data to the OpenEBS engines that synchronously replicates the data to multiple nodes in the cluster. OpenEBS engine itself is deployed as pod and orchestrated by Kubernetes. When the node running the Stateful pod fails, the pod will be rescheduled to another node in the cluster and OpenEBS provides access to the data using the available data copies on other nodes.
  - The Stateful Pods connect to the OpenEBS Distributed Persistent volume using iSCSI (cStor and Jiva) or NVMeoF (Mayastor).
  - OpenEBS cStor and Jiva focus on ease of use and durability of the storage. They use customized versions of ZFS and Longhorn technology respectively for writing the data onto the storage. OpenEBS Mayastor is the latest engine that has been developed with durability and performance as design goals and efficiently manages the compute (hugepages, cores) and storage (NVMe Drives) for providing fast distributed block storage. 

  :::tip NOTE
  OpenEBS Distributed Block volumes are called as Replicated Volumes, to avoid confusion with traditional distributed block storages that tend to distribute the data across many nodes in the cluster. Replicated volumes have low blast radius compared to traditional distributed block storages. Replicated volumes are designed for Cloud Native stateful workloads that require large number of volumes with capacity that can typically be served from a single node as apposed to a single large volume with data sharded across multiple nodes in the cluster.
  :::
 

### What are some key differentiators of OpenEBS?

Some key aspects that make OpenEBS different compared to other traditional storage solutions:
- Built using the _micro-services architecture_ like the applications it serves. OpenEBS is itself deployed as a set of containers on Kubernetes worker nodes. Uses Kubernetes itself to orchestrate and manage OpenEBS components.
- Built completely in userspace making it highly portable to run across _any OS/platform_.
- Completely intent-driven, inheriting the same principles that drive the _ease of use_ with Kubernetes.
- OpenEBS supports a range of storage engines so that developers can deploy the storage technology appropriate to their application design objectives. Distributed applications like Cassandra can use the _LocalPV_ engine for lowest latency writes. Monolithic applications like MySQL and PostgreSQL can use _Mayastor built using NVMe and SPDK_ or _cStor based on ZFS_ for resilience. Streaming applications like Kafka can use the NVMe engine [Mayastor](https://github.com/openebs/Mayastor) for best performance in edge environments. 

Also looking at the <a href="https://github.com/openebs/openebs/blob/master/ADOPTERS.md" target="_blank">OpenEBS Adoption stories</a>, the top reasons driving users towards OpenEBS are:
- Being Portable across all Kubernetes distributions - On-premise and Cloud.
- Increased Developer and Platform SRE Productivity.
- Easy to use compared to other solutions.
- Excellent Community Support.
- Open Source and Free.


## Local Volumes 

Local Volumes are accessible only from a single node in the cluster. Pods using Local Volume have to be scheduled on the node where volume is provisioned. Local Volumes are typically preferred for distributed workloads like Cassandra, MongoDB, Elastic, etc that are distributed in nature and have high availability built into them. 

Depending on the type of storage attached to your Kubernetes worker nodes, you can select from different flavors of Dynamic Local PV - Hostpath, Device, LVM, ZFS or Rawfile.

### Local Volume Quickstart Guides

Installing OpenEBS in your cluster is as simple as running a few `kubectl` or `helm` commands. Here are the list of our Quickstart guides with detailed instructions for each storage engine.

- [Local PV hostpath](/v290/docs/next/uglocalpv-hostpath.html)
- [Local PV device](/v290/docs/next/uglocalpv-device.html)
- [ZFS Local PV](https://github.com/openebs/zfs-localpv)
- [LVM Local PV](https://github.com/openebs/lvm-localpv)
- [Rawfile Local PV](https://github.com/openebs/rawfile-localpv)

## Replicated Volumes

Replicated Volumes as the name suggests, are those that have their data synchronously replicated to multiple nodes. Volumes can sustain node failures.  The replication also can be setup across availability zones helping applications move across availability zones. 

Replicated Volumes also are capable of enterprise storage features like snapshots, clone, volume expansion and so forth. Replicated Volumes are a preferred choice for Stateful workloads like Percona/MySQL, Jira, GitLab, etc. 

Depending on the type of storage attached to your Kubernetes worker nodes and application performance requirements, you can select from Jiva, cStor or Mayastor. 

### Replicated Volume Quickstart Guides

Installing OpenEBS in your cluster is as simple as running a few `kubectl` or `helm` commands. Here are the list of our Quickstart guides with detailed instructions for each storage engine.

- [Mayastor](/v290/docs/next/ugmayastor.html)
- [cStor](https://github.com/openebs/cstor-operators/blob/master/docs/quick.md)
- [Jiva](https://github.com/openebs/jiva-operator)

## Selecting the right storage engine

See the following table for recommendation on which engine is right for your application depending on the application requirements and storage available on your Kubernetes nodes. 

| Application requirements   | Storage Type | OpenEBS Volumes
|--- |--- |--- 
| Low Latency, High Availability, Synchronous replication, Snapshots, Clones, Thin provisioning | SSDs/Cloud Volumes | [OpenEBS Mayastor](/v290/docs/next/ugmayastor.html)
| High Availability, Synchronous replication, Snapshots, Clones, Thin provisioning | Disks/SSDs/Cloud Volumes | <a href="https://github.com/openebs/cstor-operators" target="_blank">OpenEBS cStor</a>
| High Availability, Synchronous replication, Thin provisioning | hostpath or external mounted storage | [OpenEBS Jiva](/v290/docs/next/jivaguide.html)
| Low latency, Local PV | hostpath or external mounted storage | [Dynamic Local PV - Hostpath](/v290/docs/next/uglocalpv-hostpath.html), <a href="https://github.com/openebs/rawfile-localpv" target="_blank">Dynamic Local PV - Rawfile</a>
| Low latency, Local PV | Disks/SSDs/Cloud Volumes | [Dynamic Local PV - Device](/v290/docs/next/uglocalpv-device.html)
| Low latency, Local PV, Snapshots, Clones | Disks/SSDs/Cloud Volumes | <a href="https://github.com/openebs/zfs-localpv" target="_blank">OpenEBS Dynamic Local PV - ZFS </a>, <a href="https://github.com/openebs/lvm-localpv" target="_blank">OpenEBS Dynamic Local PV - LVM </a>


## Community Support via Slack

OpenEBS has a vibrant community that can help you get started. If you have further question and want to learn more about OpenEBS, please join [OpenEBS community on Kubernetes Slack](https://kubernetes.slack.com). If you are already signed up, head to our discussions at [#openebs](https://kubernetes.slack.com/messages/openebs/) channel. 

<br>

## Run stateful applications on OpenEBS

<br>
<div class="row stateful-applications_row">
    <div class="">
	<a href="/v290/docs/next/prometheus.html" target="_blank">
		<img src="/v290/docs/assets/a-prometheus.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v290/docs/next/gitlab.html" target="_blank">
		<img src="/v290/docs/assets/a-gitlab.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/v290/docs/next/cassandra.html" target="_blank">
		<img src="/v290/docs/assets/a-cassandra.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/v290/docs/next/minio.html" target="_blank">
		<img src="/v290/docs/assets/a-minio.png" alt="OpenEBS Minio" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v290/docs/next/redis.html" target="_blank">
		<img src="/v290/docs/assets/a-redis.png" alt="OpenEBS Redis" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/v290/docs/next/rwm.html" target="_blank">
		<img src="/v290/docs/assets/a-nfs.png" alt="OpenEBS NFS" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/v290/docs/next/elasticsearch.html" target="_blank">
		<img src="/v290/docs/assets/a-elastic.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v290/docs/next/mysql.html" target="_blank">
		<img src="/v290/docs/assets/a-mysql.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/v290/docs/next/postgres.html" target="_blank">
		<img src="/v290/docs/assets/a-postgres.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
  <div class="">
	<a href="/v290/docs/next/percona.html" target="_blank">
		<img src="/v290/docs/assets/a-percona.png" alt="OpenEBS for Percona" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/v290/docs/next/nuodb.html" target="_blank">
		<img src="/v290/docs/assets/a-nuodb.png" alt="OpenEBS for NuoDB" style="float:left;width:100px;">
	</a>
  </div>
 <div class="">
	<a href="/v290/docs/next/mongo.html" target="_blank">
		<img src="/v290/docs/assets/svg/a-mongo.svg" alt="OpenEBS for MongoDB" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br><br>

## See Also:

### [Container Attached Storage (CAS)](/v290/docs/next/cas.html)

### <a href="https://www.cncf.io/blog/2020/09/22/container-attached-storage-is-cloud-native-storage-cas/" target="_blank">CNCF CAS Blog </a>

### [OpenEBS architecture](/v290/docs/next/architecture.html)

### [OpenEBS Local PV](/v290/docs/next/localpv.html)

### [OpenEBS Mayastor](/v290/docs/next/mayastor.html)

<br><hr><br>

