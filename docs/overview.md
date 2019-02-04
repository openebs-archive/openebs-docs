---
id: overview
title: Welcome to OpenEBS Documentation
sidebar_label: Overview
---
------





 <font size="6">Introduction</font>



OpenEBS provides containerized storage for stateful applications on Kubernetes. OpenEBS adopts a new approach called Container Attached Storage or CAS, where each workload is provided with a dedicated storage controller, thereby having most granularity of storage policies and isolation to tune the storage just for that workload. OpenEBS runs completely in user space and does not have any dependency on linux kernel modules. <a href="/docs/next/features.html">See OpenEBS features</a>.

<br>



<font size="6">Quickstart</font>

- OpenEBS requires iSCSI client to be available on the host nodes. Verify if iSCSI is setup and running before starting the installation

- Default installation works for most cases. As a Kubernetes cluster-admin , start the default installation using either

  ```
  helm repo update
  helm install --namespace openebs --name openebs stable/openebs
  ```

  <font size="4">(OR)</font>

  ```
  kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.1.yaml
  ```

  For more detailed and advanced installation,  see [installation section](/docs/next/installation.html). 

  

- [Verify OpenEBS is installed successfully]() and start provisioning the OpenEBS volumes using the Kubernetes PVC interface. See [Provisioning OpenEBS volumes](/docs/next/provisionvols.html)

<br>
<font size="6">Explore documentation</font>

<div class="row">
  <div class="column2">
	<a href="/docs/next/architecture.html">
		<img src="/docs/assets/intro-arch.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/quickstart.html">
		<img src="/docs/assets/intro-gs.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/quickstart.html">
		<img src="/docs/assets/intro-platforms.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
</div>

<div class="row">
  <div class="column2">
	<a href="/docs/next/quickstart.html">
		<img src="/docs/assets/intro-uc.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/mayaonline.html">
		<img src="/docs/assets/intro-mo.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/support.html">
		<img src="/docs/assets/intro-support.png" alt="OpenEBS Architecture" style="float:left;width:250px;">
	</a>
  </div>
</div>

<br>
<font size="6">Stateful applications </font>
<div class="row">
  <div class="column2">
	<a href="/docs/next/postgres.html" target="_blank">
		<img src="/docs/assets/a-postgres.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
<div class="column2">
	<a href="/docs/next/gitlab.html" target="_blank">
		<img src="/docs/assets/a-gitlab.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/cassandra.html" target="_blank">
		<img src="/docs/assets/a-cassandra.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/minio.html" target="_blank">
		<img src="/docs/assets/a-minio.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/prometheus.html" target="_blank">
		<img src="/docs/assets/a-prometheus.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>


<br>

<div class="row">
  <div class="column2">
	<a href="/docs/next/elasticsearch.html" target="_blank">
		<img src="/docs/assets/a-elastic.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/mysql.html" target="_blank">
		<img src="/docs/assets/a-mysql.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/percona.html" target="_blank">
		<img src="/docs/assets/a-percona.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
  <div class="column2">
	<a href="/docs/next/nuodb.html" target="_blank">
		<img src="/docs/assets/a-nuodb.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
 <div class="column2">
	<a href="/docs/next/stateful.html" target="_blank">
		<img src="/docs/assets/a-stateful.png" alt="OpenEBS Architecture" style="float:left;width:100px;">
	</a>
  </div>
</div>

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
