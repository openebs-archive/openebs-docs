---
id: prerequisites
title: Pre-requisites for Installation
sidebar_label: Prerequisites
---

------

This section will help you to understand the pre-requisites for the OpenEBS installation in a kubernetes installed environment.

The minimum requirements for the OpenEBS installation are

1.  Kubernetes cluster version >= 1.7.5
2.  Each Kubernetes node should have open-iscsi package installed. 
3.  To understand how to use OpenEBS with Kubernetes, familiarize yourself with [Kubernetes Storage Concepts](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), specifically:


- Persistent Volumes and Persistent Volume Claims
- Dynamic Volume Provisioner
- Storage Classes


**Recommended Configuration**

Kubernetes cluster with at least 3 nodes and each node having below configuration.

Centos7, Ubuntu 16.04 and above with with minimum 4vCPUs, 8G RAM and 16GB hard disk. 

**Minimum Configuration**

Kubernetes cluster with at least 1 nodes and node having below configuration or a Minikube cluster.

Centos7, Ubuntu 16.04 and above with with minimum 2vCPUs, 4G RAM and 16GB hard disk. 

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
