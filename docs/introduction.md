---
id: introduction
title: Introduction to OpenEBS
sidebar_label: Introduction
---

------

OpenEBS solution is a new approach to solving persistent storage issues for Kubernetes stateful applications. It provides a true cloud native storage solution to the containerized applications, in that the storage software itself is containerized. In other words, with OpenEBS each stateful workload is allocated a dedicated storage controller, which increases the agility and flexibility of data protection operations and granularity of storage policies of the given stateful workload. 

Containerized storage, which is more broadly called as Container Attached Storage, provides the best of NAS/SAN (Enterprise features) and DAS(lower latency). 



![image](/docs/assets/das-nas-cas.png)



Container Attached Storage in comparison with NAS/SAN and DAS



As shown above, in CAS approach, the local disks are given the capabilities of enterprise storage such as replication, data protection, disaster recovery etc. and the storage software is containerized. For more details on CAS, read [Architectural advantages of CAS](/docs/conceptcas.html)



## Usecases of OpenEBS

- Save states of stateful applications in each of the CI/CD pipelines and restore the application to a desired state . See [CI/CD](/docs/cicd.html)
- As a general storage solution for any stateful application through the external storage plugin a.k.a dynamic provisioner. Apart from being able to natively support granular policies such as capacity, # of replicas, configuration of storage pools, OpenEBS has native integration into cloud native tools such as Prometheus, Grafana, Jaeger and Fluentd. See [Kubernetes storage](/docs/k8sstorage.html)
- HyperConverged usecases. With native hyperconvergence enabled, OpenEBS opens up many usecases of hyper converged Infrastructure on Kubernetes. These cases include VDI, on-demand scaling of infrastructure for businesses, integrating automation-orchestration-analytics etc.  See [HCI](/docs/hyperconverged.html)
- Supporting high availability and easy connectivity to Databases on Kubernetes. Stateful workloads requiring replication support such as MySQL, PostGres, CockroachDB etc can easily be integrated with OpenEBS to provision, monitor and manage the required data persistence on Kubernetes. See [Databases on Kubernetes](/docs/databases.html)



## Usage of OpenEBS

In the most simplified form, using OpenEBS involves running OpenEBS operator to install OpenEBS components on Kubernetes cluster and using the default storage classes to provision the storage for stateful applications. 

After the installation of OpenEBS onto the Kubernetes cluster, the operator/administrator builds yaml specifications using  OpenEBS pool CRDs to group the local disks on Kubernetes nodes into pools, then creates storage class catalogues for use by the application developers. 



For detailed instructions on -How to use OpenEBS, see

[Prerequisites](/docs/prerequisites.html) - For pre requisites on Kubernetes

[Creating Storage Pools](/docs/setupstoragepools.html) - For learning how to create storage pools



## OpenEBS volume components

When a PV (Persistent Volume) is requested by a PVC (Persistent Volume Claim), OpenEBS provides though a set of Controller and Replica PODs.  A typical stateful application that is using OpenEBS volume can be described as below :

![image](/docs/assets/openebs-pv-2replica.png)

OpenEBS Volume Pods  are managed by Kubernetes for most part, and specific scheduling preferences for these parts can be specified using  [OpenEBS scheduler parameters](/docs/openebsscheduler.html).  The volume pods are of two types. 

1. **A volume controller POD**

   Each volume will have its own storage controller a.k.a volume controller POD. Some benefits of having a dedicated storage controller per volume are:

   - managing the storage with the same tools that you use to manage Kuberentes objects (like *kubectl*)
   - scaling up/down replicas as they are deployments with node/pod affinity constraints
   - extending the manageability via namespaces/RBAC to storage

2. **A volume replica POD**

   A replica POD will have software that manages a pool of disks, provides enterprise features such as data integrity, data resiliency, compression, encryption etc. When replication is needed, it is recommended to have a minimum of three replicas for each volume in order to maintain quorum among the replicas when a replica becomes unavailable and data has to be served without interruption

For more details on how OpenEBS internals work, see [OpenEBS Architecture](/docs/architecture.html) 



## Getting started with OpenEBS

Deploying OpenEBS on Kubernetes clusters is easy. [Get Started now](/docs/quickstartguide.html)



### See also:

- [Container Attached Storage (CAS)](/docs/conceptcas.html)
- [OpenEBS architecture](/docs/architecture.html)
- [Most common OpenEBS Operator tasks](/docs/operatortasks.html)



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
