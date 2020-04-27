---
id: overview
title: Welcome to OpenEBS Documentation
sidebar_label: Overview
---
---

<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  Documentation for OpenEBS v1.2.0 is no longer actively maintained. The version you are currently viewing is a static snapshot. Click here for the [latest](https://docs.openebs.io) version.
</strong></p></center>

---

##  <font size="6">Introduction</font>

OpenEBS is the leading open-source project for container-attached and
container-native storage on Kubernetes. OpenEBS adopts
Container Attached Storage (CAS) approach, where each workload is
provided with a dedicated storage controller. OpenEBS
implements granular storage policies and isolation that enable users
to optimize storage for each specific workload. OpenEBS runs
in user space and does not have any Linux kernel module dependencies.
See OpenEBS  <a href="/v120/docs/next/features.html">Features & Benefits</a>
and <a href="/v120/docs/next/usecases.html" target="">Use cases</a>.

<br>

## <font size="6">Quickstart</font>

- OpenEBS requires iSCSI client to be configured and iscsid service
  running on the worker nodes.
  Verify if [iSCSI service is up](/v120/docs/next/prerequisites.html) and
  running before starting the installation.

- Default installation works in most  of the cases. As a Kubernetes cluster-admin, start the default installation using either

  ```
  helm install --namespace openebs --name openebs stable/openebs --version 1.2.0
  ```

  (or)

  ```
  kubectl apply -f https://openebs.github.io/charts/openebs-operator-1.2.0.yaml
  ```

  For advanced installation steps, see [Installation](/v120/docs/next/installation.html) section.

- [Verify if OpenEBS is installed successfully](/v120/docs/next/installation.html#verifying-openebs-installation)
  and start provisioning OpenEBS volumes through Kubernetes PVC
  interface by using `kubectl` command. For more details on how to
  provision different types of OpenEBS volumes, see guides for [cStor volume](/v120/docs/next/ugcstor.html), [Jiva Volume](/v120/docs/next/jivaguide.html) and [OpenEBS local Volume](/v120/docs/next/uglocalpv.html).

<br>

## <font size="6">Explore documentation</font>

<br>

<div class="row">
  <div class="">
	<a href="/v120/docs/next/architecture.html">
		<img src="/docs/assets/intro-arch.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v120/docs/next/quickstart.html">
		<img src="/docs/assets/intro-gs.png" alt="OpenEBS quick start" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v120/docs/next/prerequisites.html">
		<img src="/docs/assets/intro-platforms.png" alt="OpenEBS platforms" style="float:left;width:250px;">
	</a>
  </div>
</div>
<div class="row">
  <div class="">
	<a href="/v120/docs/next/usecases.html">
		<img src="/docs/assets/intro-uc.png" alt="OpenEBS use cases" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v120/docs/next/directoronline.html">
		<img src="/docs/assets/intro-mo.png" alt="Connecting to DirectorOnline" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/v120/docs/next/support.html">
		<img src="/docs/assets/intro-support.png" alt="OpenEBS Support" style="float:left;width:250px;">
	</a>
  </div>
</div>
<br>

## <font size="6">Run stateful applications on OpenEBS</font>

<br>
<div class="row stateful-applications_row">
    <div class="">
	<a href="/v120/docs/next/prometheus.html" target="_blank">
		<img src="/docs/assets/a-prometheus.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v120/docs/next/gitlab.html" target="_blank">
		<img src="/docs/assets/a-gitlab.png" alt="OpenEBS Archipdate ntecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/v120/docs/next/cassandra.html" target="_blank">
		<img src="/docs/assets/a-cassandra.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/v120/docs/next/minio.html" target="_blank">
		<img src="/docs/assets/a-minio.png" alt="OpenEBS Minio" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v120/docs/next/redis.html" target="_blank">
		<img src="/docs/assets/a-redis.png" alt="OpenEBS Redis" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/v120/docs/next/rwm.html" target="_blank">
		<img src="/docs/assets/a-nfs.png" alt="OpenEBS NFS" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/v120/docs/next/elasticsearch.html" target="_blank">
		<img src="/docs/assets/a-elastic.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/v120/docs/next/mysql.html" target="_blank">
		<img src="/docs/assets/a-mysql.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/v120/docs/next/postgres.html" target="_blank">
		<img src="/docs/assets/a-postgres.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
  <div class="">
	<a href="/v120/docs/next/percona.html" target="_blank">
		<img src="/docs/assets/a-percona.png" alt="OpenEBS for Percona" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/v120/docs/next/nuodb.html" target="_blank">
		<img src="/docs/assets/a-nuodb.png" alt="OpenEBS for NuoDB" style="float:left;width:100px;">
	</a>
  </div>
 <div class="">
	<a href="/v120/docs/next/mongo.html" target="_blank">
		<img src="/docs/assets/svg/a-mongo.svg" alt="OpenEBS for MongoDB" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br><br>

## See Also:

### [Container Attached Storage (CAS)](/v120/docs/next/cas.html)

### <a href="https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/" target="_blank">CNCF CAS Blog </a>

### [OpenEBS architecture](/v120/docs/next/architecture.html)

<br><hr><br>

