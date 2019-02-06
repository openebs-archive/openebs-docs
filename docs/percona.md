---
id: percona
title: Using OpenEBS as storage for Percona on Kubernetes
sidebar_label: Percona
---
------

<img src="/docs/assets/o-percona.png" alt="OpenEBS and Prometheus" style="width:400px;">

## Introduction

Percona Server for MySQL is a free, fully compatible, enhanced and open source drop-in replacement for any MySQL database. in this solution , running a percona-mysql application pod which consumes OpenEBS cStor volume  to storge the database in a kubernetes cluster.

## Requirements

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, check cStor Pool, go to the next step. 

2. **Configure cStor Pool**

   If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). If cStor pool is already configure, go to the next step.

3. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. In this solution we are using a StorageClass to consume the cStor Pool created using external disks attached on the Nodes. More details are added in [Configure StorageClass](https://staging-docs.openebs.io/docs/next/configuresc.html) section.

4. **Launch and test Percona-mysql**


## Configuration Workflow



## Deployment of Percona with OpenEBS 



## Sample Percona Deployment at openebs.ci

A [sample Percona server](https://www.openebs.ci/percona-cstor) at [https://openebs.ci](https://openebs.ci/)

Sample YAML  for running Percona-mysql using cStor are [here](https://github.com/openebs/e2e-infrastructure/tree/54fe55c5da8b46503e207fe0bc08f9624b31e24c/production/percona-cstor)

## Best Practices:



## Troubleshooting Guidelines



## Uninstalling  the Percona apllication



## Limitations:



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
