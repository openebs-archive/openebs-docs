---
id: supportedplatforms
title: OpenEBS supported platforms
sidebar_label: Platforms
---

------

OpenEBS is tested on the following platforms.

[Native Kubernetes](#NativeK8s) (Versions 1.7.5+, 1.8, 1.9, 1.10, 1.11)

[MiniKube](#MiniKube) (Versions 0.25.x, 0.26.x)

[GKE](#GKE) (Kubernetes versions 1.7.x , 1.8.x,)

[Azure](#Azure) (Kubernetes versions)

[AWS](#AWS) (Kubernetes built using EC2)

[IBM Cloud Private](#IBM) (Versions 1.2.0, 2.1.0, 2.1.0.1, 2.1.0.2) 

[RedHat OpenShift](#OpenShift) (Versions 3.7, 3.8)

[RedHat MiniShift](#OpenShift) (Versions 1.10.0+)



<a name="NativeK8s"></a>

<a name="MiniKube"></a>

## Native Kubernetes and MiniKube

As a prerequisite, OpenEBS requires Kubernetes CRD capabilities and hence Kubernetes versions 1.7.5+ are suitable. 

OpenEBS is tested on versions 1.7.5+, 1.8, 1.9, 1.10 and 1.11.

Similarly, MiniKube versions that are tested for OpenEBS are 0.25.x and 0.26.x.

Another prerequisite is open-iSCSI packages must be installed and configured. For installing open-iscsi on Ubuntu, CentOS, and CoreOS, see the [prerequisites](/docs/next/prerequisites.html#iSCSIConfig) section.

<a name="GKE"></a>

## GKE

GKE with Kubernetes versions 1.8 onwards are supported. While creating a cluster, ensure that you choose Ubuntu 16.4 or above, which comes with open-iscsi installed and configured.

![Ubuntu on GKE](/docs/assets/gke-ubuntu.png)

**Note:** COS image does not come with the open-iscsi package and also installing new packages on COS based hosts is not allowed on GKE. Hence, OpenEBS will not work on GKE with hosts based on COS image.

<a name="Azure"></a>

## Azure Cloud

On Azure, kubelet runs inside a container and open-iscsi packages are not available by default on Azure. For instructions to install and configure, see [open-iscsi on Azure](/docs/next/prerequisites.html).

Once the prerequisites are met, you can follow the steps mentioned in [installation](/docs/next/installation.html) section similar to installing OpenEBS on a vanilla Kubernetes cluster.

<a name="AWS"></a>

## AWS

On AWS, you can setup Kubernetes cluster using Ubuntu machines using EC2. Once the prerequisites are met you can follow the steps as mentioned in the [installation](/docs/next/installation.html) section.

<a name="IBM"></a>

## IBM Cloud Private

OpenEBS is tested with IBM Private Cloud version 2.1. For details about how to integrate OpenEBS into IBM Private Cloud charts/catalog, [see instructions here](/docs/next/ibmcloud.html).

<a name="OpenShift"></a>

## RedHat OpenShift and RedHat MiniShift

OpenShift installation may require some changes to the installation procedure.  You need to use *oc* instead of *kubecltl*.  Detailed explanation is available at [Integration of OpenEBS with OpenShift](/docs/next/openshift.html). 

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
