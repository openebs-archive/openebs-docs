---
id: quickstartguide
title: Getting Started with OpenEBS
sidebar_label: Quick Start Guide
---

------

Following are the steps to get started with OpenEBS on a Kubernetes cluster.

## As a Kubernetes Operator/Administrator:

1. As a prerequisite, check if open-iscsi is installed and running on kubelet. See [Steps for configuring and verifying open-iscsi](/docs/next/prerequisites.html#steps-for-configuring-and-verifying-open-iscsi).

2. You can install OpenEBS either through helm or by using OpenEBS operator

   ### Using helm:

   [Setup RBAC for helm tiller](/docs/next/installation.html#helm) and install the chart from Kubernetes stable and deploy the storage class templates

   ```
   helm install stable/openebs --name openebs --namespace openebs
   ```

   ```
   kubectl apply -f  https://github.com/openebs/openebs/blob/master/k8s/openebs-storageclasses.yaml
   ```

   For more details on installing OpenEBS using helm, see [install through helm](/docs/next/installation.html#helm)

   ​

   ### Using OpenEBS operator:

   As a **cluster admin**, execute the following single command on the Kubernetes shell

   ```
   kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
   ```
   ​

3. **Optional:** Create a catalog of storage classes and publish them to your developers. A default storage class (*openebs-standard*) is added to the cluster when you install OpenEBS

4. **Optional:** An OpenEBS enabled cluster can be imported into [mayaonline.io](/docs/next/mayaonline.html) for better visibility, manageability of volumes and integrated ChatOps experience with Slack

### As an Application Developer:

1. Create a PVC specification with the right storage class and use it in the application YAML file. Example PVC spec is shown below

   ```
   application yaml contents
        
         volumes:
         - name: datadir
           persistentVolumeClaim:
             claimName: datadir
     volumeClaimTemplates:
     - metadata:
         name: datadir
       spec:
         storageClassName: openebs-cockroachdb
         accessModes:
           - "ReadWriteOnce"
         resources:
           requests:
             storage: 100G
   ```

  

2. Apply the YAML file using `kubectl apply -f` command. Verify that an OpenEBS volume is provisioned and bound to the application pod.

3. Note: Because OpenEBS is [CAS](/docs/next/conceptscas.html), you will observe that new PODs (one volume controller pod and as many volume replica PODs as the number of replicas configured in the storage class) are created

 


## See Also:

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
