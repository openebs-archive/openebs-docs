---
id: supportedplatforms
title: OpenEBS supported platforms
sidebar_label: Platforms
---

------

OpenEBS is tested on the following platforms

[Native Kubernetes](#NativeK8s) (Versions 1.7.5+, 1.8, 1.9, 1.10, 1.11)

MiniKube (Versions )

GKE (Kubernetes versions 1.7.x , 1.8.x,)

Azure (Kubernetes versions)

AWS (Kubernetes built using EC2)

RedHat OpenShift (Versions 3.5, 3.6, 3.8)

RedHat MiniShift (Versions )



<a name="NativeK8s"></a>

<a name="MiniKube"></a>

## Native Kubernetes and MiniKube

As a prerequisite, OpenEBS requires CRD capabilities of Kubernetes and hence Kubernetes versions 1.7.5+ are suitable. 

OpenEBS is tested on versions 1.7.5+, 1.8, 1.9, 1.10 and 1.11

Similarly, MiniKube versions that are tested for OpenEBS are x.y, x.y

Another prerequisite is open-iSCSI packages should be installed and configured. For installing open-iscsi on Ubuntu, CentOs and CoreOS, refer to the [prerequisites section](/docs/prerequisites.html#iSCSIConfig) 



<a name="GKE"></a>

## GKE

GKE with Kubernetes versions 1.8 onwards are supported. While creating the cluster, make sure you choose Ubuntu 16.4 or above, which comes with open-iscsi installed and configured.

<<TODO: Add a screenshot of the cluster config where the linux image is chosen on GKE>>

Note:  image COS does not come with open-iscsi package and also installing new packages on cos based hosts is not allowed on GKE. Hence, OpenEBS will not work on GKE with hosts based on COS image.

<a name="Azure"></a>

## Azure Cloud

On Azure, kubelet runs inside a container and open-iscsi packages are not available by default on Azure. Refer to the instructions to install and configure [open-iscsi on Azure](/docs/prerequisites.html#Azure)

<a name="OpenShift"></a>

## RedHat OpenShift and RedHat MiniShift

<<Write the OpenShift specific  to OpenShift or MiniShift>>









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
