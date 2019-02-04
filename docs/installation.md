---
id: installation
title: Installing OpenEBS
sidebar_label: Installation
---
------

<img src="/docs/assets/sm-install.png" alt="OpenEBS configuration flow" style="width:1000px">

## Before You Start

As an administrator,latest OpenEBS can be installed in your K8s cluster once you meet the prerequisites in your setup.

## Customize your OpenEBS operator YAML

You can download and customize the OpenEBS operator YAML file before the installation to include the desired disks and desired node details. The following will mention about how User can verify or include the desired disks attached to the Nodes and schedule the OpenEBS components into the desired Nodes. 

1. #### Selecting Nodes to Schedule OpenEBS components

   OpenEBS can be installed in selected nodes in your existing Kubernetes cluster using Node Selector method. OpenEBS does not have a separate scheduler to manage scheduling pods. It uses Kubernetes scheduler for managing the scheduling needs of an administrator.
   Latest OpenEBS operator YAML can be downloaded using the following way.

       ```
   wget https://openebs.github.io/charts/openebs-operator-0.8.1.yaml
       ```

   Using Node Selector method, OpenEBS components can be scheduled to the selected Nodes by adding node labels in the corresponding deployment mentioned in the OpenEBS operator YAML file.  You can go to the scheduler section for scheduling OpenEBS components in the downloaded OpenEBS operator YAML file.

2. #### Selecting/Verifying the disks for cStor Pool creation

   NDM is handling the disks attached to the OpenEBS nodes and by default NDM exclude following device path to avoid from creating cStor pools.

   ```
    "exclude":"loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-"
   ```


   The modification can be done by editing openebs-operator.yaml in openebs-ndm-config under ConfigMap in the file as follows.

   ```
   data:
     node-disk-manager.config: |
       filterconfigs:
         - key: path-filter
           name: path filter
           state: true
           include: ""
           exclude: "loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-,/dev/md"
   ```

## Start the Installation

OpenEBS can be installed in your Kubernetes cluster in the following ways.

1. Using Stable helm charts
2. Using OpenEBS operator through kubectl

### Install OpenEBS using Helm Charts



### Install OpenEBS using kubectl



## Verify OpenEBS is installed



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
