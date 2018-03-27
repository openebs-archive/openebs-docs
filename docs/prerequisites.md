---
id: prerequisites
title: Prerequisites for Installation
sidebar_label: Prerequisites
---

This section will help you to understand the pre-requisites for the OpenEBS installation in a kubernetes installed environment. 

The minimum requirements for the OpenEBS installation are

1. k8s cluster
2. Each k8s Node should have open-iscsi package installed on it.



#### **Preparing Software**

OpenEBS is a software-only solution that can be installed using the released binaries or built and installed directly from source.

Currently supported cloud platforms are AWS,Azure,GKE,OpenShift and BareMetals. Once you create k8s cluster on any of these supported platform, you are ready to install OpenEBS on it.



#### **Consuming OpenEBS** 

To consume OpenEBS volume on k8s hosts, install open-iscsi initiator packages depends on your host OS. You can get the minimum requirement needed on the various host system for the OpenEBS installation from here

 

*System Configuration*

Centos7, Ubuntu 16.04 and above with with minimum 4vCPUs, 4G RAM and 16GB hard disk. 

 

*Add iSCSI Support*

###### On Ubuntu

On your Ubuntu host, install open-iscsi package if is is not done. OpenEBS uses iSCSI to connect to the block volumes.

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

On your centos host, install iscsi-initiator-utilsRPM package if is is not done. OpenEBS uses iSCSI to connect to the block volumes.

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