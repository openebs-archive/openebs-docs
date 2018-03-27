---
id: prerequisites
title: Prerequisites for Installation
sidebar_label: Prerequisites
---

The basic requirement for installing OpenEBS is a k8s installedenvironment. This section will help you to understand the pre-requisites forthe OpenEBS installation in a k8s environment. 

Since OpenEBS is delivered through containers, OpenEBS hosts can be run on any operating system with container engine. The clients can be configured to consume the OpenEBS storage via Network(iSCSI). 

 

#### **Preparing Software**

 OpenEBS is a software-only solution that can be installed using the released binaries or built and installed directly from source.

You can get the minimum requirement needed on the various host system for the OpenEBS installation from here

 

*System Configuration*

You can install on any of virtual-machines/baremetal/cloudinstances with hosts like Centos7, Ubuntu 16.04 and above with with minimum4 vCPUs, 4G RAM and 16GB hard disk. 

 

*Add iSCSI Support*

###### On Ubuntu

On your Ubuntu host, install open-iscsi package. OpenEBS uses iSCSI to connect to the block volumes.

```
sudo apt-get update
```

```
sudo apt-get install open-iscsi
```

```
sudo service open-iscsi restart
```



###### Verify that iSCSI is configured

Check that initiator name isconfigured and iSCSI service is running using the following commands.

```
sudo cat /etc/iscsi/initiatorname.iscsi
```

```
sudo service open-iscsi status
```



###### On Centos

On your centos host, install **iscsi-initiator-utilsRPM** package . . OpenEBS uses iSCSI to connect to the block volumes.

```
yum install iscsi-initiator-utils -y
```

 

###### Verify that iSCSI is configured

Check that initiator name is configured and iSCSI service isrunning using the following commands

```
vi/etc/iscsi/initiatorname.iscsi
```

```
`systemctl status iscsi.service`
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