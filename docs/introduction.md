---
id: introduction
title: Introduction to OpenEBS
sidebar_label: Introduction
---

------

OpenEBS solution is a new approach to solving persistent storage issues for Kubernetes stateful applications. It provides a true cloud native storage solution to the containerized applications, in that the storage software itself is containerized. In other words, with OpenEBS each stateful workload is allocated a dedicated storage controller, which increases the agility and flexibility of data protection operations and granularity of storage policies of the given stateful workload. 

Containerized storage, which is more broadly called as Container Attached Storage, provides the best of NAS/SAN (Enterprise features) and DAS (lower latency). The following figure displays Container Attached Storage in comparison with NAS/SAN and DAS.

![image](/docs/assets/das-nas-cas.png)

As shown in the figure, in CAS approach, the local disks are given the capabilities of enterprise storage such as replication, data protection, disaster recovery and so on and the storage software is containerized. For more details about CAS, see [Architectural advantages of CAS](/docs/next/conceptcas.html).


## OpenEBS Usecases

- Save states of stateful applications in each of the CI/CD pipelines and restore the application to a desired state. 
- As a general storage solution for any stateful application through the external storage plugin a.k.a dynamic provisioner. Apart from being able to natively support granular policies such as capacity, number of replicas, configuration of storage pools, OpenEBS has native integration into cloud native tools such as Prometheus, Grafana, Jaeger, and Fluentd.
- Hyperconverged usecases - With native hyperconvergence enabled, OpenEBS opens up many usecases of hyperconverged infrastructure on Kubernetes. These cases include VDI, on-demand scaling of infrastructure for businesses, integrating automation-orchestration-analytics and so on. 
- Supporting high availability and easy connectivity to Databases on Kubernetes - Stateful workloads requiring replication support such as MySQL, PostGres, CockroachDB and others can easily be integrated with OpenEBS to provision, monitor, and manage the required data persistence on Kubernetes. 

## Using OpenEBS

In the most simplified form, using OpenEBS involves running OpenEBS Operator to install OpenEBS components on Kubernetes cluster and using the default storage classes to provision the storage for stateful applications. 

After you install OpenEBS onto the Kubernetes cluster, the Operator/Administrator build YAML specifications using OpenEBS pool CRDs to group the local disks on Kubernetes nodes into pools. They then create storage class catalogs for use by the application developers. 

For detailed instructions on how to use OpenEBS, see the following:

* [Prerequisites](/docs/next/prerequisites.html) - for prerequisites on Kubernetes

* [Creating Storage Pools](/docs/next/setupstoragepools.html) - for learning how to create storage pools


## OpenEBS Volume Components

When a Persistent Volume (PV) is requested by a PVC (Persistent Volume Claim), OpenEBS provides a set of Controller and Replica Pods. A typical stateful application that is using OpenEBS volume can be described as follows.

![image](/docs/assets/openebs-pv-2replica.png)

OpenEBS Volume Pods are managed by Kubernetes for most part and specific scheduling preferences for these parts can be specified using annotations in PVC specification (`Note: This feature is available only from release 0.6 onwards`) . The volume pods are of two types. 

1. **Volume Controller Pod**

   Each volume will have its own storage controller a.k.a volume controller pod. Some benefits of having a dedicated storage controller per volume are:

   - managing the storage with the same tools that you use to manage Kuberentes objects (like *kubectl*)
   - scaling up/down replicas as they are deployments with node/pod affinity constraints
   - extending the manageability via namespaces/RBAC to storage

2. **Volume Replica Pod**

   A replica Pod will have software that manages a pool of disks, provides enterprise features such as data integrity, data resiliency, compression, encryption and so on. When replication is needed, it is recommended to have a minimum of three replicas for each volume. This will maintain quorum among the replicas when a replica becomes unavailable and data has to be served without interruption.

For more details on how OpenEBS internals work, see [OpenEBS Architecture](/docs/next/architecture.html).

## Getting started with OpenEBS

Deploying OpenEBS on Kubernetes clusters is easy. See [Get Started now](/docs/next/quickstartguide.html).


### See Also:

#### [Container Attached Storage (CAS)](/docs/next/conceptcas.html)
#### [OpenEBS Architecture](/docs/next/architecture.html)





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
