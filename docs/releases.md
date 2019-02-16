---
id: releases
title: OpenEBS Releases
sidebar_label: Releases
---

------



| Release   Version | Release Note                                                 | Highlights                                                   | Remarks        |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------- |
| 0.8.0             | [0.8.0](https://github.com/openebs/openebs/releases/tag/0.8) | - cStor Snapshot & Clone <br />-  cStor volume & Pool runtime status<br/>-  Target Affinity for both Jiva & cStor <br/>-  Target namespace for cStor <br/>-  Enhance the volume metrics exporter<br/>- Enhance Jiva to clear up internal snapshot taken during   Replica rebuild<br/>- Enhance Jiva to support sync and unmap IOs<br/>- Enhance cStor for recreating pool by automattically selecting the disks. | Latest Release |
| 0.7.2             | [0.7.2](https://github.com/openebs/openebs/releases/tag/0.7.2) | - Support for   clearing sapce used by Jiva replica after the volume is deleted using Cron   Job.<br/> - Support for a storage policy that can disable the Jiva Volume Space   reclaim.<br/> - Support Target Affinity fort Jiva target Pod on the same node as the   Application Pod.<br/> -  Enahanced Jiva related to internal snapshots for rebuilding Jiva.<br/> - Enhanced exporting cStor volume metrics to prometheus | Stable Release |
| 0.7.0             | [0.7.0](https://github.com/openebs/openebs/releases/tag/v0.7) | - Enhanced NDM   to discover block devices attached to Nodes     .<br/>- Alpha support for cStor Engine<br/>- Naming convention of Jiva Storage pool as 'default' and StorageClass as   'openebs-jiva-default'<br/>- Naming convention of cStor Storage pool as 'cstor-sparse-pool' and   StorageClass as 'openebs-cstor-sparse'<br/>- Support for specifying replica count,CPU/Memory Limits per PV,Choice of  Storage Engine, Nodes on which data copies should be copied. | Old Releases   |
| 0.6.0             | [0.6.0](https://github.com/openebs/openebs/releases/tag/v0.6) | - Integrate   the Volume Snapshot capabilities with Kubernetes Snapshot controller.<br/>- Enhance maya-apiserver to use CAS Templates for orchestrating new   Storage Engines.<br/>- Enhance mayactl to show details about replica and Node details where replicas   are running.<br/>- Enhance maya-apiserver to schedule Replica Pods on specific nodes using   nodeSelector.<br/>- Enhance e2e tests to simulate chaos at different layers such as - CPU,   RAM, Disk, Network, and Node.<br/>- Support for deploying OpenEBS via Kubernetes stable Helm Charts.<br/>- Enhanced Jiva volume to handle more read only volume  scenarios | Old Releases   |
| 0.5.4             | [0.5.4](https://github.com/openebs/openebs/releases/tag/v0.5.4) | - Provision to   specify filesystems other than ext4 (default).<br/>- Support for XFS filesystem format for mongodb StatefulSet using OpenEBS Persistent Volume.<br/>- Increased integration test & e2e coverage in the CI<br/>- OpenEBS is now available as a stable chart from Kubernetes | Old Releases   |
| 0.5.3             | [0.5.3](https://github.com/openebs/openebs/releases/tag/v0.5.3) | - Fixed usage of StoragePool issue when RBAC settings are applied<br/>- Enhanced memory consumption usage for Jiva Volume | Old Releases   |
| 0.5.2             | [0.5.2](https://github.com/openebs/openebs/releases/tag/v0.5.2) | - Support to   set non-SSL Kubernetes endpoints to use by specifying the ENV variables on  maya-apiserver and  openebs-provisioner. | Old Releases   |
| 0.5.1             | [0.5.1](https://github.com/openebs/openebs/releases/tag/v0.5.1) | - Support to   use Jiva volume from CentOS iSCSI Initiator<br/>- Support openebs-k8s-provisioner to be launched in non-default namespace | Old Releases   |
| 0.5.0             | [0.5.0](https://github.com/openebs/openebs/releases/tag/v0.5.0) | - Enhanced   Storage Policy Enforcement Framework for Jiva.<br/>- Extend OpenEBS API Server to expose volume snapshot API.<br/>- Support for deploying OpenEBS via helm charts.<br/>- Sample Prometheus configuration for collecting OpenEBS Volume Metrics.<br/>- Sample Grafana OpenEBS Volume Dashboard - using the prometheus Metrics | Old Releases   |
| 0.4.0             | [0.4.0](https://github.com/openebs/openebs/releases/tag/v0.4.0) | - Enhanced   MAYA cli support for managing snapshots,usage statistics.<br/>- Support OpenEBS Maya API Server uses the Kubernetes scheduler logic to place OpenEBS Volume Replicas on different nodes<br/>- Support Extended deployment of OpenEBS in AWS.<br/>- Support OpenEBS can be deployed in a minikube setup.<br/>- Enhanced openebs-k8s-provisioner from crashloopbackoff state | Old Releases   |
| 0.3.0             | [0.3.0](https://github.com/openebs/openebs/releases/tag/v0.3) | - Support   OpenEBS hyper-converged with Kubernetes Minion Nodes.<br/>- Enable OpenEBS via the openebs-operator.yaml<br/>-  Supports creation of OpenEBS volumes using Dynamic Provisioner.<br/>- Storage functionality and Orchestration/Management functionality is delivered as container images on DockerHub. | Old Releases   |
| 0.2.0             | [0.2.0](https://github.com/openebs/openebs/releases/tag/v0.2) | - Integrated   OpenEBS FlexVolume Driver and Dynamically Provision OpenEBS Volumes into Kubernetes.<br/>- Support Maya api server to provides new AWS EBS-like API for   provisioning Block Storage.<br/>- Enhanced Maya api server to Hyper Converged with Nomad Scheduler.<br/>- Backup/Restore Data from Amazon S3.<br/>- Node Failure Resiliency Fixes | Old Releases   |



## See Also:

### [cStor roadmap](http://docs/next/cstor.html#cstor-roadmap)

<br><hr>

<br>




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
