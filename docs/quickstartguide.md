---
id: quickstartguide
title: Getting Started with OpenEBS
sidebar_label: Quick Start Guide
---

------

Following are the steps to get started with OpenEBS on a Kubernetes cluster.

### As Kubernetes operator/admin:

1. Check if open-iscsi is installed and running on kubelet. See [Steps for configuring and verifying open-iscsi](/docs/prerequisites.html#steps-for-configuring-and-verifying-open-iscsi)

2. Install OpenEBS on your cluster by executing the following single command on the Kubernetes shell.

   ```
   kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
   ```

3. Optional: Create a catalog of storage classes and publish them to your developers. A default storage class (openebs-standard) is added to the cluster when you install OpenEBS.

### As application developer:

1. Create a PVC spec with the right storage class and use it in the application YAML file.

2. Apply the YAML file using `kubectl apply -f` command. Verify that an OpenEBS volume is provisioned and bound to the application pod.


### See Also:

- [Prerequisites](/docs/prerequisites.html)
- [OpenEBS architecture](/docs/architecture.html)
- [Constructing storage classes](/docs/architecture.html)
- [Monitoring OpenEBS volumes](/storagepolicies.html#volume-monitoring-policy)
- Taking snapshots of OpenEBS volumes(



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
