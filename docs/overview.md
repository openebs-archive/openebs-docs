---
id: overview
title: Welcome to OpenEBS Documentation
sidebar_label: Overview
---
------


<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
Documentation for OpenEBS v2.2.0 is no longer actively maintained. The version you are currently viewing is a static 
snapshot. Click here for the [latest](https://docs.openebs.io) version.
</strong></p></center>

## Introduction ##

OpenEBS is the leading open-source project for container-attached and
container-native storage on Kubernetes. OpenEBS adopts
Container Attached Storage (CAS) approach, where each workload is
provided with a dedicated storage controller.
OpenEBS implements granular storage policies and isolation that enable users
to optimize storage for each specific workload. OpenEBS is built 
completely in userspace making it highly portable to run across any OS/platform.

OpenEBS is a collection Storage Engines, allowing you to pick the right 
storage solution for your Stateful workloads and the type of Kubernetes platform. 

See OpenEBS  <a href="/v220/docs/next/features.html">Features & Benefits</a>
and <a href="https://github.com/openebs/openebs/blob/master/ADOPTERS.md" target="_blank">OpenEBS Adoption stories</a>.


<br>

## Quickstart

- When using synchronous replication, iSCSI is used to attach storage from OpenEBS to 
  application pods. Hence OpenEBS requires iSCSI client to be configured and `iscsid` service
  running on the worker nodes.
  Verify if [iSCSI service is up](/v220/docs/next/prerequisites.html) and
  running before starting the installation.

- Default installation works in most of the cases. As a *Kubernetes cluster-admin*, start the default installation using either

  ```
  helm repo add openebs https://openebs.github.io/charts
  helm repo update
  helm install --namespace openebs --name openebs openebs/openebs
  ```
  More information about OpenEBS installation using different Helm versions can be found [here](/v220/docs/next/installation.html#installation-through-helm).

  (or)

  ```
  kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
  ```
  
  For advanced installation steps, see [Installation](/v220/docs/next/installation.html) section.

- [Verify if OpenEBS is installed successfully](/v220/docs/next/installation.html#verifying-openebs-installation)
  and start provisioning OpenEBS volumes through Kubernetes PVC
  interface by using `kubectl` command. 

<br>

## OpenEBS Storage Engines

OpenEBS is a Kubernetes native hyperconverged storage solution. 
OpenEBS consumes the storage (disks, SSDs, cloud volumes, etc) available 
on the Kubernetes worker nodes to dynamically provision Kubernetes 
Persistent Volumes. 

OpenEBS can provision different type of Local PV for Stateful Workloads 
like Cassandra, MongoDB, Elastic, etc that are distributed in nature and 
have high availiability built into them. 
Depending on the type of storage attached to your Kubernetes worker nodes, 
you can select from Dynamic Local PV - Hostpath, Device, ZFS or Rawfile.

OpenEBS can provision Persistent Volumes with features like synchronous replication, 
snapshots and clones, backup and restore that can be used with Stateful workloads
like Percona/MySQL, Jira, GitLab, etc. The replication also can be setup to be 
across Kubernetes zones resulting in high availability for cross AZ setups. 
Depending on the type of storage attached to your Kubernetes worker nodes and 
application performance requirements, you can select from Jiva, cStor or Mayastor. 

See the following table for recommendation on which engine is right for 
you depending on the type of your application requirements and 
storage available on your Kubernetes nodes. 

| Application requirements   | Storage | OpenEBS Volumes
|--- |--- |--- 
| Protect against node failures, Synchronous replication, Snapshots, Clones, Thin provisioning | Use Disks/SSDs/Cloud Volumes | <a href="https://github.com/openebs/cstor-operators" target="_blank">OpenEBS cStor</a>
| Protect against node failures, Synchronous replication, Thin provisioning | Use hostpath or external mounted storage | [OpenEBS Jiva](/v220/docs/next/jivaguide.html)
| Low latency, Local PV | Use hostpath or external mounted storage | [Dynamic Local PV - Hostpath](/v220/docs/next/uglocalpv-hostpath.html)
| Low latency, Local PV | Use Disks/SSDs/Cloud Volumes | [Dynamic Local PV - Device](/v220/docs/next/uglocalpv-device.html)
| Low latency, Local PV, Snapshots, Clones | Use Disks/SSDs/Cloud Volumes | <a href="https://github.com/openebs/zfs-localpv" target="_blank">OpenEBS Dynamic Local PV - ZFS </a>

OpenEBS is also developing <a href="https://github.com/openebs/Mayastor" target="_blank">Mayastor</a> and <a href="https://github.com/openebs/rawfile-localpv" target="_blank">Dynamic Local PV - Rawfile</a> storage engines available for alpha testing.


## Explore documentation

<br>

<div class="row">
  <div class="">
	<a href="/v220/docs/next/architecture.html">
		<img src="/v220/docs/assets/intro-arch.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v220/docs/next/quickstart.html">
		<img src="/v220/docs/assets/intro-gs.png" alt="OpenEBS quick start" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v220/docs/next/prerequisites.html">
		<img src="/v220/docs/assets/intro-platforms.png" alt="OpenEBS platforms" style="float:left;width:250px;">
	</a>
  </div>
</div>
<div class="row">
  <div class="">
	<a href="/v220/docs/next/usecases.html">
		<img src="/v220/docs/assets/intro-uc.png" alt="OpenEBS use cases" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v220/docs/next/troubleshooting.html">
		<img src="/v220/docs/assets/intro-tsg.svg" alt="Troubleshooting OpenEBS" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v220/docs/next/support.html">
		<img src="/v220/docs/assets/intro-support.png" alt="OpenEBS Support" style="float:left;width:250px;">
	</a>
  </div>
</div>
<br>

## Run stateful applications on OpenEBS

<br>
<div class="row stateful-applications_row">
    <div class="">
	<a href="/v220/docs/next/prometheus.html" target="_blank">
		<img src="/v220/docs/assets/a-prometheus.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v220/docs/next/gitlab.html" target="_blank">
		<img src="/v220/docs/assets/a-gitlab.png" alt="OpenEBS Archipdate ntecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/v220/docs/next/cassandra.html" target="_blank">
		<img src="/v220/docs/assets/a-cassandra.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/v220/docs/next/minio.html" target="_blank">
		<img src="/v220/docs/assets/a-minio.png" alt="OpenEBS Minio" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v220/docs/next/redis.html" target="_blank">
		<img src="/v220/docs/assets/a-redis.png" alt="OpenEBS Redis" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/v220/docs/next/rwm.html" target="_blank">
		<img src="/v220/docs/assets/a-nfs.png" alt="OpenEBS NFS" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/v220/docs/next/elasticsearch.html" target="_blank">
		<img src="/v220/docs/assets/a-elastic.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v220/docs/next/mysql.html" target="_blank">
		<img src="/v220/docs/assets/a-mysql.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/v220/docs/next/postgres.html" target="_blank">
		<img src="/v220/docs/assets/a-postgres.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
  <div class="">
	<a href="/v220/docs/next/percona.html" target="_blank">
		<img src="/v220/docs/assets/a-percona.png" alt="OpenEBS for Percona" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/v220/docs/next/nuodb.html" target="_blank">
		<img src="/v220/docs/assets/a-nuodb.png" alt="OpenEBS for NuoDB" style="float:left;width:100px;">
	</a>
  </div>
 <div class="">
	<a href="/v220/docs/next/mongo.html" target="_blank">
		<img src="/v220/docs/assets/svg/a-mongo.svg" alt="OpenEBS for MongoDB" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br><br>

## See Also:

### [Container Attached Storage (CAS)](/v220/docs/next/cas.html)

### <a href="https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/" target="_blank">CNCF CAS Blog </a>

### [OpenEBS architecture](/v220/docs/next/architecture.html)

<br><hr><br>

