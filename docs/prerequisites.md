---
id: prerequisites
title: Pre-requisites for Installation
sidebar_label: Prerequisites
---

------

This section will help you to understand the pre-requisites forthe OpenEBS installation in a kubernetes installed environment.

The minimum requirements for the OpenEBS installation are

 

1. Kubernetes cluster version >= 1.7.5 (CRD feature is needed for OpenEBS)
2. Each k8s Node should have an open-iscsi package installed on it.



**k8scluster configuration**

OpenEBS is a Containerized Storage Solution that can beorchestrated by  Kubernetes. To understand how to use OpenEBS with Kubernetes, you must familiarizeyourself with [Kubernetes StorageConcepts](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), specifically:

- Persistent Volumes and Persistent Volume Claims
- Dynamic Volume Provisioner
- Storage Classes



If you are new to Kubernetes, here are some guides that can helpyou setup Kubernetes on supported paltforms and install OpenEBS:

- ​        [Baremetal](https://docs.openebs.io/docs/onpremise.html#running-the-setup-on-ubuntu-1604)

- ​        [Amazon EC2](https://docs.openebs.io/docs/cloudsolutions.html#amazon-cloud)

- ​        [GKE](https://docs.openebs.io/docs/cloudsolutions.html#google-cloud)

- ​        [OpenShift](https://docs.openebs.io/docs/openshift.html)

  ​

**\*SystemConfiguration***

Centos7, Ubuntu 16.04 and above with with minimum 4vCPUs, 4G RAMand 16GB hard disk. 

 

 

#### **Verify open-iscsistatus on host**

To consume OpenEBS volume on k8s hosts, install open-iscsiinitiator packages depends on your host OS. You can get the minimum requirementneeded on the various host system for the OpenEBS installation from here

 

**\*On Ubuntu***

###### Verify that iSCSI is configured 

OpenEBS uses iSCSI to connect to the block volumes. If iSCSI isalready installed on your host,check that initiator name is configured andiSCSI service is running using the following commands.

```
sudo cat /etc/iscsi/initiatorname.iscsi
```

```
sudo service open-iscsi status
```

 

If iSCSI is not installed on your host, install open-iscsi packageby follow below commands and verify that iSCSI is configured properly on it.

```
sudo apt-get update
```

```
sudo apt-get install open-iscsi
```

```
sudo service open-iscsi restart
```

 

**\*On Centos***

###### Verify that iSCSI is configured

OpenEBS uses iSCSI to connect to the block volumes. If iSCSI isalready installed on your host, check that initiator name is configured andiSCSI service is running using the following commands.

```
vi/etc/iscsi/initiatorname.iscsi
```

```
systemctl status iscsi.service
```

 

If iSCSI is not installed on your host, install open iscsi-initiator-utilsRPM package by follow the below commands and verify that iscsi is configuredproperly on it.

 

```
yum install iscsi-initiator-utils -y
```

 

 

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