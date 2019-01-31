---
id: ibmcloud
title: Using OpenEBS on IBM Cloud
sidebar_label: IBMCloud
---

------

In this section, we describe how to configure **OpenEBS** as a **persistent storage** option and deploying a stateful workload (MongoDB) using OpenEBS storage classes in **IBM Cloud Private (ICP)**.

### **Prerequisites**

**Hardware**

- Minimum three x64 servers

**Software**

- [Ubuntu Server 16.04 LTS](https://www.ubuntu.com/download/server)

- IBM Cloud Private 2.1

- [OpenEBS](https://github.com/openebs/openebs)


### **Install IBM Cloud Private**

Follow instructions from [Introduction to IBM Cloud Private](http://containerized.me/introduction-to-ibm-cloud-private/) to deploy a multi-node ICP cluster.

### **Install OpenEBS on ICP**

1. Log in to the ICP console and go to the **Admin/Repositories** menu.![img](https://cdn-images-1.medium.com/max/800/0*PPZPNSr9_mW_9AZq.png)

2. Click **Add repository**.![img](https://cdn-images-1.medium.com/max/800/0*ZNaLIkk1gxFLWUJK.png)

3. Add a chart repository with the following parameters:

   >  — **Name:** openebs-charts
   >  — **URL:** <https://openebs.github.io/charts/>

   ![img](https://cdn-images-1.medium.com/max/800/0*2m2J6V9YhnYk5_Cx.png)

4. After you click **Add**, confirm that **openebs-charts** is listed under Repositories.![img](https://cdn-images-1.medium.com/max/800/0*wkPxIB_Q2DevkgWh.png)

5. Go to the **Catalog** menu, select **openebs** from the list.![img](https://cdn-images-1.medium.com/max/800/0*7Lt6IE4f_da0jZEB.png)

6. On OpenEBS chart instructions page, click **Configure**.

7. Configure OpenEBS deployment with the following parameters:

   > — **Release name:** openebs-<your-release-name> (you need to pick a unique name)
   >  — **Target Namespace:** default (namespace should be the same as your workload)
   >  — **rbacEnable:** true
   >  — **image pullPolicy:** IfNotPresent
   >  — **apiserver image:** openebs/m-apiserver
   >  — **apiserver tag:** 0.4.0
   >  — **provisione image:** openebs/openebs-k8s-provisioner
   >  — **provisioner tag:** 0.4.0
   >  — **jiva image:** openebs/jiva:0.4.0
   >  — **replicas:** 2 (Number of Jiva Volume replicas)

   ![img](https://cdn-images-1.medium.com/max/800/0*qfLs4pg_3TE1PbCB.png)

8. Click **Install**. When finished click **View Helm Release**.![img](https://cdn-images-1.medium.com/max/800/0*raLyHiJeZ0hC_BAk.png)

9. On the Helm Release page, you can see the status of OpenEBS, deployment, and available **Storage Classes**.![img](https://cdn-images-1.medium.com/max/800/0*-gCAd374s2jXY3AP.jpg)

Now, OpenEBS is installed on IBM Cloud Private. You are ready to run any stateful application on OpenEBS. Let’s try to deploy a stateful app on OpenEBS. Next section will help you with it.

### **Install MongoDB on OpenEBS**

1. Under **Catalog**, select **ibm-mongodb-dev** and click **Configure**.

2. Configure MongoDB deployment with the following parameters:
    — **Release name:** mongodb-<your-release-name> (you need to pick a unique name here)
       — **Target Namespace:** default (same as OpenEBS)
       — **persistence enabled:** true
       — **persistence useDynamicProvisioning:** true
       — **dataVolume storageClassName:** openebs-mongodb
       — **dataVolume size:** 2G (default is 20Gi, remove “i” — in current version it is not supported)
       — **database password:** mongo
    Accept the license agreements, keep all the other values as default and click **Install**.![img](https://cdn-images-1.medium.com/max/800/0*UTiLWk3zOy5bw_Wh.png)

3. Go to **Workloads/Helm Releases** and select your MongoDB release. Under the **PersistentVolumeClaim** table you are going to see the volume claim and OpenEBS storage class.![img](https://cdn-images-1.medium.com/max/800/0*PNNp0nDxsZXzYwIH.png)

4. If you go to the **Workloads/Deployments** page, you can find the storage controller and two volume replicas (as configured) running.![img](https://cdn-images-1.medium.com/max/800/0*pD7rHAX_D8_cxcfl.png)

5. Confirm that replicas are running on separate nodes. Click on the PVC name ending with **rep** (Example: pvc-23025190-c516–11e7-b45e-e8fd90000064-rep). Scroll down, and you will see that pods are running on separate hosts. ![img](https://cdn-images-1.medium.com/max/800/0*pD7rHAX_D8_cxcfl.png)

    You have now successfully deployed a stateful application on a persistent block storage presented by OpenEBS.




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
