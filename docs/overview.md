---
id: overview
title: Welcome to OpenEBS Documentation
sidebar_label: Overview
---
------





<p>
<img src="/docs/assets/intrologo.png" alt="Smiley face" style="float:right;width:400px;">
    <font size="6">Introduction</font>


OpenEBS provides containerized storage for stateful applications on Kubernetes. OpenEBS adopts a new approach called Container Attached Storage or CAS, where each workload is provided with a dedicated storage controller, thereby having most granularity of storage policies and isolation to tune the storage just for that workload. OpenEBS runs completely in user space and does not have any dependency on linux kernel modules. <a href="/docs/next/features.html">See OpenEBS features</a>.

</p>

<p>
    <font size="6" >Current release</font>
</p>



Current release of OpenEBS is **0.8.1**. See [release notes ]()


<div class="row">
  <div class="column2">
	For the documentation of past releases see
  </div>
  <div class="column2">
  	<a href="https://v07-docs.openebs.io/">
		0.7.0 Documentation
	</a>
  </div>
  <div class="column2">
  	<a href="https://v07-docs.openebs.io/">
		0.6.0 Documentation
	</a>
  </div>
  <div class="column2">
  	<a href="https://v05-docs.openebs.io/">
		0.5.0 Documentation
	</a>
  </div>
</div>



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
