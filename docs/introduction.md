---
id: introduction
title: Introduction to OpenEBS
sidebar_label: Introduction
---

OpenEBS solution is a new approach to solving persistent storage issues for Kubernetes stateful applications. It provides a true cloud native storage solution to the containerized applications, in that the storage software itself is containerized. In other words, with OpenEBS each stateful workload is allocated a dedicated storage controller, which increases the agility and flexibility of data protection operations and granularity of storage policies of the given stateful workload. 

Containerized storage, which is more broadly called as Container Attached Storage, provides the best of NAS/SAN (Enterprise features) and DAS(lower latency). 

![image](/docs/assets/das-nas-cas.png)

As shown above, in CAS approach, the local disks are given the capabilities of enterprise storage such as replication, data protection, disaster recovery etc. 

Using OpenEBS, a developer can seamlessly get the persistent storage for stateful applications with ease, much of which is automated, while using the popular orchestration platforms such as Kubernetes.   

At the outset, OpenEBS provides you with:

-   A *simple to use* storage solution (simpler than using local storage volumes) for your persistent applications
-   Includes benefits of external storage like snapshots, backup, compression etc.
-   Allows you to run Stateful Applications in Kubernetes on any node (any cloud or any on-premise server), any storage (disks attached to servers). Avoid Storage Vendor lock-in!

OpenEBS is a Containerized Storage Solution that can be orchestrated by any Container Orchestrators. However, the current release supports orchestration using Kubernetes. To understand how to use OpenEBS with Kubernetes, you must familiarize yourself with [Kubernetes Storage Concepts](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), specifically:

-   Persistent Volumes and Persistent Volume Claims
-   Dynamic Volume Provisioner
-   Storage Classes

A typical stateful application using OpenEBS is as follows:

![image](/docs/assets/openebs-pv-2replica.png)

OpenEBS Volume comprises of Pods that are managed by Kubernetes itself, and each application gets its own storage controller which provides you with benefits like:

-   managing the storage with the same tools that you use to manage Kuberentes objects (like *kubectl*)
-   scaling up/down replicas as they are deployments with node/pod affinity constraints
-   extending the manageability via namespaces/RBAC to storage

You can try out OpenEBS on your Kubernetes cluster using the [Quick Start Guide](/docs/quickstartguide.html) 



### See also:

- Container Attached Storage (CAS)
- OpenEBS architecture
- Usecases of OpenEBS



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
