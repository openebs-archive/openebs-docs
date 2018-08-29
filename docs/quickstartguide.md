---
id: quickstartguide
title: Getting Started with OpenEBS
sidebar_label: Quick Start Guide
---

------

Following are the steps to get started with OpenEBS on a Kubernetes cluster.

## As a Kubernetes Operator/Administrator:

1. As a prerequisite, check if open-iscsi is installed and running on kubelet. See [Steps for configuring and verifying open-iscsi](/docs/next/prerequisites.html#steps-for-configuring-and-verifying-open-iscsi).

2. You can install OpenEBS either through stable helm chart or by through OpenEBS helm chart or by using OpenEBS operator/kubectl.  Currently 0.7 is supported only via the [OpenEBS operator/kubectl](docs/next/quickstartguide.html#using-openebs-operator-kubectl) option which is explained below.

   ### Using a Stable Helm Chart:

   [Setup RBAC for helm tiller](/docs/next/installation.html#helm) and install the chart from Kubernetes stable and deploy the storage class templates.

   ```
   helm install  --namespace openebs --name openebs  -f https://openebs.github.io/charts/helm-values-0.6.0.yaml stable/openebs
   kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-storageclasses.yaml
   ```

   For more details on installing OpenEBS using helm, see [install through helm](/docs/next/installation.html#helm).

   ### Using OpenEBS Helm Charts 

   `(Will be deprecated in the coming releases)`

   ```
   helm repo add openebs-charts https://openebs.github.io/charts/
   helm repo update
   helm install openebs-charts/openebs
   ```

   ### Using OpenEBS Operator (kubectl):
   
   You can now install OpenEBS either by using Jiva or cStor storage engines. For more information, see [Jiva](/docs/next/storageengine.html#jiva) and [cStor](/docs/next/storageengine.html#cstor) 

   As a **cluster admin**, you can deploy jiva or cStor based on your requirements. For more information about deploying them, see [deploying jiva](/docs/next/deploycstor.html) and [deploying cStor](/docs/next/deploycstor.html).
   
3. **Optional:** Create a catalog of storage classes and publish them to your developers. Two default storage classes (*openebs-standard* and *openebs-cstor-default-0.7.0*) are added to the cluster when you install OpenEBS.

4. **Optional:** An OpenEBS enabled cluster can be imported into [mayaonline.io](/docs/next/mayaonline.html) for better visibility, volume management, and integrated ChatOps experience with Slack.

## As an Application Developer:

1. Create a PVC specification with the right storage class and use it in the application YAML file. Some sample application yaml files are available under https://github.com/openebs/openebs/tree/master/k8s/demo. 

2. Apply the yaml file using `kubectl apply -f` command. Verify that an OpenEBS volume is provisioned and bound to the application pod.

**Note:** Because OpenEBS is a [CAS](/docs/next/conceptscas.html), you will observe that new pods (one volume controller pod and as many volume replica PODs as the number of replicas configured in the storage class) are created.


### See Also:

#### [Prerequisites](/docs/next/prerequisites.html)
#### [Tested platforms](/docs/next/supportedplatforms.html)
#### [OpenEBS architecture](/docs/next/architecture.html)



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
