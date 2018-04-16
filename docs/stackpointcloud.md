---
id: stackpointcloud
title: Using OpenEBS on StackPoint Cloud
sidebar_label: StackPointCloud
---

------

In this section, we are describing about the integration of stackpoint with OpenEBS. It is possible to integrate stackpoint with OpenEBS install major platforms like AWS, Google Cloud (GKE & GCE), Azure &Digital Ocean.Here, We are covering integration of stackpoint with OpenEBS in AWS platform.

 

### **ConfigureK8s Cluster**



On “Configure yourcluster” page click the edit button on **Distribution** and choose **Ubuntu16.04 LTS**.

![img](https://cdn-images-1.medium.com/max/800/0*ty0IA_1uuDxaCQoX.png)

Change the **Cluster Name** something meaningful like **OpenEBS Demo**.

![img](https://cdn-images-1.medium.com/max/800/0*50cyzQI-2DZIX-AG.png)



You can run etcd on either 3 node dedicated cluster or Hosted on same cluster itself. You can leave all other option as default. 

Now click on **Submit **to create your cluster. This should take around 5–8 minutes to bring up one Master and two Workers Kubernetes Cluster.

 

### **Import OpenEBS Helm Charts**



Click on **Solutions** tab on the top of the screen and select **Import Charts** from the upper left.

![img](https://cdn-images-1.medium.com/max/800/0*vZr9hqN35SCCsx-a.png)



Add the chart repo
with the following details:
 — **name :** openebs-charts
 — **type :** packaged-charts
 — **repo
url :**
<https://openebs.github.io/charts/>

Click on **Review Repository**.

![img](https://cdn-images-1.medium.com/max/800/0*lkT38CLmsESK2i1T.png)

Make sure **Access Verified **shows ok and click on **Save Repository** button to finish adding chart repo.

![**img**](https://cdn-images-1.medium.com/max/800/0*tS9uArAROjoOLc05.png)



**Adding OpenEBS to Your Kubernetes Cluster**

First, make sure your cluster and all nodes are up.

On the **Control Plane** tab click on your cluster name **OpenEBS Demo**.

![img](https://cdn-images-1.medium.com/max/800/0*0wxTlbbO_yPMJZ8F.png)

Once the Kubernetes cluster is up on AWS with functional Helm, click on the **Solutions** tab and **Add Solution **button.

![img](https://cdn-images-1.medium.com/max/800/0*QofakUAHAb_DRYWp.png)

Add the solution with the following details:

\- **namespace :** default
\- **values -> rbacEnabled :** false

![img](https://cdn-images-1.medium.com/max/800/0*JiSAsRHf5SND0Cbp.png)

Click on **Install** to finally add OpenEBS into your cluster.

State field should begreen after OpenEBS is successfully added.

![img](https://cdn-images-1.medium.com/max/800/0*1nY357dtw3PNOfAi.png)

Now your cluster is ready; you can run your workloads on openebs-standard storage class if you using default storage class.

 

To confirm, click on **K8s Dashboard.** This will bring up your Kubernetes Dashboard UI in a new window. You should be able to find the **openebs-standard **option under **StorageClasses**.

 




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
