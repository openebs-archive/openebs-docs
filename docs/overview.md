---
id: overview
title: Welcome to OpenEBS Documentation
sidebar_label: Overview
---
------

##  <font size="6">Introduction</font>

OpenEBS is the leading open-source project for container-attached and
container-native storage on Kubernetes. OpenEBS adopts
Container Attached Storage (CAS) approach, where each workload is
provided with a dedicated storage controller. OpenEBS
implements granular storage policies and isolation that enable users
to optimize storage for each specific workload. OpenEBS runs
in user space and does not have any Linux kernel module dependencies.
See OpenEBS  <a href="/1.0.0-RC1/docs/next/features.html">Features & Benefits</a>
and <a href="/1.0.0-RC1/docs/next/usecases.html" target="">Use cases</a>.

<br>

## <font size="6">Quickstart</font>

- OpenEBS requires iSCSI client to be configured and iscsid service
  running on the host nodes.
  Verify if [iSCSI service is up](/1.0.0-RC1/docs/next/prerequisites.html) and
  running before starting the installation.

- **Installation**

  <div class="co">Helm installation will be supported in the 1.0.0 GA version. For 1.0.0-RC1, use the below operator yaml file to proceed with the installation. Note that upgrades are also not supported for 1.0.0-RC1</div>

  ```
  kubectl apply -f https://openebs.github.io/charts/openebs-operator-1.0.0-RC1.yaml
  ```

  For advanced installation steps, see [Installation](/1.0.0-RC1/docs/next/installation.html) section.

- [Verify if OpenEBS is installed successfully](/1.0.0-RC1/docs/next/installation.html#verifying-openebs-installation)
  and start provisioning OpenEBS volumes through Kubernetes PVC
  interface by using `kubectl` command. For more details on how to
  provision different types of OpenEBS volumes see guides for [cStor volume](/1.0.0-RC1/docs/next/ugcstor.html), [Jiva Volume](/1.0.0-RC1/docs/next/jivaguide.html) and [OpenEBS local Volume](/1.0.0-RC1/docs/next/uglocalpv.html).

<br>

## <font size="6">Explore documentation</font>

<br>

<div class="row">
  <div class="">
	<a href="/docs/next/architecture.html">
		<img src="/docs/assets/intro-arch.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/quickstart.html">
		<img src="/docs/assets/intro-gs.png" alt="OpenEBS quick start" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/prerequisites.html">
		<img src="/docs/assets/intro-platforms.png" alt="OpenEBS platforms" style="float:left;width:250px;">
	</a>
  </div>
</div>
<div class="row">
  <div class="">
	<a href="/docs/next/usecases.html">
		<img src="/docs/assets/intro-uc.png" alt="OpenEBS use cases" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/mayaonline.html">
		<img src="/docs/assets/intro-mo.png" alt="Connecting to MayaOnline" style="float:left;width:250px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/support.html">
		<img src="/docs/assets/intro-support.png" alt="OpenEBS Support" style="float:left;width:250px;">
	</a>
  </div>
</div>
<br>

## <font size="6">Run stateful applications on OpenEBS</font>

<br>
<div class="row stateful-applications_row">
    <div class="">
	<a href="/docs/next/prometheus.html" target="_blank">
		<img src="/docs/assets/a-prometheus.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/docs/next/gitlab.html" target="_blank">
		<img src="/docs/assets/a-gitlab.png" alt="OpenEBS Archipdate ntecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/cassandra.html" target="_blank">
		<img src="/docs/assets/a-cassandra.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/docs/next/minio.html" target="_blank">
		<img src="/docs/assets/a-minio.png" alt="OpenEBS Minio" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/docs/next/redis.html" target="_blank">
		<img src="/docs/assets/a-redis.png" alt="OpenEBS Redis" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/docs/next/rwm.html" target="_blank">
		<img src="/docs/assets/a-nfs.png" alt="OpenEBS NFS" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
<div class="">
	<a href="/docs/next/elasticsearch.html" target="_blank">
		<img src="/docs/assets/a-elastic.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="">
	<a href="/docs/next/mysql.html" target="_blank">
		<img src="/docs/assets/a-mysql.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>  
  <div class="">
	<a href="/docs/next/postgres.html" target="_blank">
		<img src="/docs/assets/a-postgres.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br>
<div class="row stateful-applications_row">
  <div class="">
	<a href="/docs/next/percona.html" target="_blank">
		<img src="/docs/assets/a-percona.png" alt="OpenEBS for Percona" style="float:left;width:100px;">
	</a>
  </div>
  <div class="">
	<a href="/docs/next/nuodb.html" target="_blank">
		<img src="/docs/assets/a-nuodb.png" alt="OpenEBS for NuoDB" style="float:left;width:100px;">
	</a>
  </div>
 <div class="">
	<a href="/docs/next/mongo.html" target="_blank">
		<img src="/docs/assets/svg/a-mongo.svg" alt="OpenEBS for MongoDB" style="float:left;width:100px;">
	</a>
  </div>
</div>
<br><br>

## See Also:

### [Container Attached Storage (CAS)](/1.0.0-RC1/docs/next/cas.html)

### <a href="https://www.cncf.io/blog/2018/04/19/container-attached-storage-a-primer/" target="_blank">CNCF CAS Blog </a>

### [OpenEBS architecture](/1.0.0-RC1/docs/next/architecture.html)

<br><hr><br>


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
