---
id: postgres
title: Using OpenEBS as storage for PostgreSQL on Kubernetes
sidebar_label: PostgreSQL
---
------

<img src="/docs/assets/o-postgres.png" alt="OpenEBS and Prometheus" style="width:400px;">	

## Introduction

The Postgres container used in the StatefulSet is sourced from [CrunchyData](https://github.com/CrunchyData/crunchy-containers). CrunchyData provides cloud agnostic PostgreSQL container technology that is designed for production workloads with cloud native High Availability, Disaster Recovery, and monitoring. In this solution, running a PostgreSQL StatefulSet application on OpenEBS cStor volume  and perform simple database operations to verify successful deployment.

## Requirements

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

   If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). If cStor pool is already configured, go to the next step. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below.

3. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the [Configure StoragePool](/docs/next/configurepools.html) section. Since MySQL master and slave are deployments, it requires high availability of data. So cStor volume `replicaCount` is 3. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStorVolume Replica count as 3 is provided in the configuration details below.

## Deployment of PostgreSQL with openEBS

Run the following commands to get the files for running PostgreSQL application.

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-sa.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-service.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-primary-service.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-replica-service.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/run.sh
```

Create a new file called 

## Verify PostgreSQL  Pods

Run the following to get the status of PostgreSQL pods.

```
kubectl get pods
```

Following is an example output.

```

```

### Verify PostgreSQL services

Go to the master pod and execute the following commands to check the MySQL status.

```

```

Once you enter into the pod, do the following.

```

```



## Best Practices:



## Troubleshooting Guidelines



## Configuration details



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
