---
id: releases
title: OpenEBS Releases
sidebar_label: Releases
---

------

<br>



| Release Version                  | Notes                                                        | Highlights                                                   |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| <br/><font size="5">0.8.2</font> | <br> <font size="4">Latest Release</font> <br/> <br>(Recommended)<br/> <br>[Release Notes](https://github.com/openebs/openebs/releases/tag/0.8.2) | - Fixed an issue causing cStor Volume Replica CRs to be stuck, when the OpenEBS<br>   namespace was being deleted.<br>- Fixed an issue where a newly added cStor Volume Replica may not be successfully<br>   registered with the cStor target, if the cStor tries to connect to Replica before the replica<br/>   is completely initialised.<br>- Fixed an issue with Jiva Volumes where target can mark the Replica as Timed out on IO,<br/>   even when the Replica might actually be processing the Sync IO.<br>- Fixed an issue with Jiva Volumes that would not allow for Replicas to re-connect with the<br/>   Target, if the initial Registration failed to successfully process the hand-shake request.<br>- Fixed an issue with Jiva Volumes that would cause Target to restart when a send<br/>   diagnostic command was received from the client<br>- Fixed an issue causing PVC to be stuck in pending state, when there were more than<br/>   one PVCs associated with an Application Pod<br>- Toleration policy support for cStorStoragePool.<br/> |
| -0.8.1                           | [Release Blog](https://blog.openebs.io/openebs-releases-0-8-1-with-stability-fixes-and-improved-documentation-374dd6b7c4a5) <br> <br> [Release Notes](https://github.com/openebs/openebs/releases/tag/0.8.1) | - Ephemeral Disk Support <br />- Enhanced the placement of cStor volume replica in a distriubuted randomnly between the available pools.<br />- Enhanced the NDM to fetch additional details about the underlying disks via SeaChest.<br />- Enhanced the NDM  to add additional information to the DiskCRs like if the disks is partitioned or has a filesystem on it. <br />- Enhanced the OpenEBS CRDs to include custom columns to be displayed using  `kubectl get ` output of the CR. This feature requires K8s 1.11 or higher.<br />- Fixed an issue where cStor volume causes timeout for iSCSI discovery command and can potentially trigger a K8s vulnerability that can bring down a node with high RAM usage. |
| 0.8.0                            | [Release Blog](https://blog.openebs.io/openebs-0-8-release-allows-you-to-snapshot-and-clone-cstor-volumes-ebe09612f8b1) <br> <br> [Release Notes](https://github.com/openebs/openebs/releases/tag/0.8) | - cStor Snapshot & Clone <br />-  cStor volume & Pool runtime status<br/>- Target Affinity for both Jiva & cStor <br/>- Target namespace for cStor <br/>- Enhance the volume metrics exporter<br/>- Enhance Jiva to clear up internal snapshot taken during   Replica rebuild<br/>- Enhance Jiva to support sync and unmap IOs<br/>- Enhance cStor for recreating pool by automatically selecting the disks. |
| 0.7.2                            | [Release Notes](https://github.com/openebs/openebs/releases/tag/0.7.2) | - Support for   clearing sapce used by Jiva replica after the volume is deleted using Cron   Job.<br/>- Support for a storage policy that can disable the Jiva Volume Space   reclaim.<br/>- Support Target Affinity fort Jiva target Pod on the same node as the   Application Pod.<br/>- Enahanced Jiva related to internal snapshots for rebuilding Jiva.<br/> - Enhanced exporting cStor volume metrics to prometheus |
| 0.7.0                            | [Release Blog](https://blog.openebs.io/openebs-0-7-release-pushes-cstor-storage-engine-to-field-trials-1c41e6ad8c91)<br><br> [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.7) | - Enhanced NDM   to discover block devices attached to Nodes     .<br/>- Alpha support for cStor Engine<br/>- Naming convention of Jiva Storage pool as 'default' and StorageClass as   'openebs-jiva-default'<br/>- Naming convention of cStor Storage pool as 'cstor-sparse-pool' and   StorageClass as 'openebs-cstor-sparse'<br/>- Support for specifying replica count,CPU/Memory Limits per PV,Choice of  Storage Engine, Nodes on which data copies should be copied. |
| 0.6.0                            | [Release Blog](https://blog.openebs.io/openebs-0-6-serves-ios-amidst-chaos-and-much-more-45c68eb59c6a)<br><br>[Release Notes](https://github.com/openebs/openebs/releases/tag/v0.6) | - Integrate  the Volume Snapshot capabilities with Kubernetes Snapshot controller.<br/>- Enhance maya-apiserver to use CAS Templates for orchestrating new   Storage Engines.<br/>- Enhance mayactl to show details about replica and Node details where replicas   are running.<br/>- Enhance maya-apiserver to schedule Replica Pods on specific nodes using   nodeSelector.<br/>- Enhance e2e tests to simulate chaos at different layers such as - CPU,   RAM, Disk, Network, and Node.<br/>- Support for deploying OpenEBS via Kubernetes stable Helm Charts.<br/>- Enhanced Jiva volume to handle more read only volume  scenarios |
| 0.5.4                            | [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.4) | - Provision to   specify filesystems other than ext4 (default).<br/>- Support for XFS filesystem format for mongodb StatefulSet using OpenEBS Persistent Volume.<br/>- Increased integration test & e2e coverage in the CI<br/>- OpenEBS is now available as a stable chart from Kubernetes |
| 0.5.3                            | [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.3) | - Fixed usage of StoragePool issue when RBAC settings are applied<br/>- Enhanced memory consumption usage for Jiva Volume |
| 0.5.2                            | [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.2) | - Support to   set non-SSL Kubernetes endpoints to use by specifying the ENV variables on  maya-apiserver and  openebs-provisioner. |
| 0.5.1                            | [Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.1) | - Support to   use Jiva volume from CentOS iSCSI Initiator<br/>- Support openebs-k8s-provisioner to be launched in non-default namespace |
| 0.5.0                            | [Release Blog](https://blog.openebs.io/openebs-0-5-0-enables-customizable-storage-engines-using-storage-policies-dc585d5ee2f) <br><br>[Release Notes](https://github.com/openebs/openebs/releases/tag/v0.5.0) | - Enhanced   Storage Policy Enforcement Framework for Jiva.<br/>- Extend OpenEBS API Server to expose volume snapshot API.<br/>- Support for deploying OpenEBS via helm charts.<br/>- Sample Prometheus configuration for collecting OpenEBS Volume Metrics.<br/>- Sample Grafana OpenEBS Volume Dashboard - using the prometheus Metrics |
| 0.4.0                            | [Release Blog](https://blog.openebs.io/quick-update-on-openebs-v0-4-a-developer-friendly-release-6fe599fe254e)<br><br>[Release Notes](https://github.com/openebs/openebs/releases/tag/v0.4.0) | - Enhanced   MAYA cli support for managing snapshots,usage statistics.<br/>- Support OpenEBS Maya API Server uses the Kubernetes scheduler logic to place OpenEBS Volume Replicas on different nodes<br/>- Support Extended deployment of OpenEBS in AWS.<br/>- Support OpenEBS can be deployed in a minikube setup.<br/>- Enhanced openebs-k8s-provisioner from crashloopbackoff state |
| 0.3.0                            | [Release Blog](https://blog.openebs.io/openebs-on-the-growth-path-releases-0-3-94bd45724e)<br><br>[Release Notes](https://github.com/openebs/openebs/releases/tag/v0.3) | - Support   OpenEBS hyper-converged with Kubernetes Minion Nodes.<br/>- Enable OpenEBS via the openebs-operator.yaml<br/>-  Supports creation of OpenEBS volumes using Dynamic Provisioner.<br/>- Storage functionality and Orchestration/Management functionality is delivered as container images on DockerHub. |
| 0.2.0                            | [Release Blog](https://blog.openebs.io/openebs-sprinting-ahead-0-2-released-28f5001deeaa)<br><br>[Release Notes](https://github.com/openebs/openebs/releases/tag/v0.2) | - Integrated   OpenEBS FlexVolume Driver and Dynamically Provision OpenEBS Volumes into Kubernetes.<br/>- Support Maya api server to provides new AWS EBS-like API for   provisioning Block Storage.<br/>- Enhanced Maya api server to Hyper Converged with Nomad Scheduler.<br/>- Backup/Restore Data from Amazon S3.<br/>- Node Failure Resiliency Fixes |
<br>

<hr>

<br>





## See Also:

### [cStor Roadmap](/v082/docs/next/cstor.html#cstor-roadmap)

### [OpenEBS FAQ](/v082/docs/next/faq.html)

### [Container Attached Storage or CAS](/v082/docs/next/cas.html)

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
