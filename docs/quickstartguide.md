---
id: quickstartguide
title: Getting started with OpenEBS
sidebar_label: Quick Start Guide
---

Following are the steps to get started with OpenEBS on a Kubernetes cluster.

### As Kubernetes operator / admin:

1. Check if open-iscsi is installed and running on kubelet. Know more <<TBD: Provide a link here >>

2. Install OpenEBS on the cluster by executing the following single command on the Kubernetes shell

   ```
   kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
   ```

3. Create a catalog of storage classes and publish them to your developers for their use. Some ready to use storage classes are added to the cluster when OpenEBS is installed

### As application developer:

1. Create a PVC spec with the right storage class and use it in the application yaml file

2. Apply the yaml file using `kubectl apply -f` command and observe that an OpenEBS volume is provisioned and bound to the application pod

   ​

### Quick links:

- Pre-requisites 
- OpenEBS architecture
- Constructing storage classes
- Monitoring OpenEBS volumes
- Taking snapshots of OpenEBS volumes









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
