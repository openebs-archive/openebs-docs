---
id: iscsiclient
title: iSCSI Client is a prerequisite for OpenEBS
sidebar_label: iSCSI Client
---
------

OpenEBS provides block volume support through iSCSI protocol. Hence, iSCSI client presence on all Kubernetes nodes is a prerequisite. Choose the platform below to find the steps to verify if iSCSI client is installed and running or to find the steps to install iSCSI client

<br>

<font size="5">Choose the platform for iSCSI client settings</font>



<div class="divrow">
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#ubuntu"><img src="/docs/assets/l-ubuntu.png" width="50px;">Ubuntu</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#rhel"><img src="/docs/assets/l-rhel.png" width="50px;">RHEL</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#centos"><img src="/docs/assets/l-centos.png" width="50px;">CentOS</a>
    </div>
</div>

<div class="divrow">
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#eks"><img src="/docs/assets/l-eks.png" width="50px;">EKS</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#gke"><img src="/docs/assets/l-gke.png" width="50px;">GKE</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#aks"><img src="/docs/assets/l-aks.png" width="50px;">AKS</a>
    </div>
</div>

<div class="divrow">
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#openshift"><img src="/docs/assets/l-openshift.png" width="50px;">OpenShift</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#rancher"><img src="/docs/assets/l-rancher.png" width="50px;">Rancher</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#icp"><img src="/docs/assets/l-icp.png" width="50px;">ICP</a>
    </div>
</div>



## Linux platforms

### Ubuntu

#### Verify iSCSI client

#### Install iSCSI client

### RHEL

#### Verify iSCSI client

#### Install iSCSI client

### CentOS

#### Verify iSCSI client

#### Install iSCSI client

## Kubernetes services on Cloud

### EKS

### GKE

GKE COS (Container Optimized OS) does not come with iSCSI client and does not allow to install iSCSI client. Hence, OpenEBS does not work on K8S clusters which are running COS version of the image on the worker nodes

Select Ubuntu as the image version for the node pools in the custom settings. For setting up iSCSI clients on Ubuntu nodes, see the [instructions above](/docs/next/iscsiclient.html#install-iscsi-client)



### AKS

## On-Prem Kubernetes solutions

### OpenShift

### Rancher

### ICP



See Also:

[OpenEBS Installation](/docs/next/installation.html)

[OpenEBS Architecture](/docs/next/architecture.html)



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