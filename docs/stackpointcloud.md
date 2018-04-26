---
id: stackpointcloud
title: Using OpenEBS on StackPoint Cloud
sidebar_label: StackPointCloud
---

------



In this section, we describing StackPoint Integration with OpenEBS . It is possible to integrate StackPoint with OpenEBS in all major platforms like AWS, Google Cloud (GKE & GCE), Azure &Digital Ocean. Here, We are covering the detailed steps for the installation of OpenEBS using StackPoint in AWS.

 **Prerequisites**

1. An AWS account.
2. Ubuntu machine to run awscli.

### **Creating a User in AWS**

To create a user in AWS, use the following procedure.

1. Open **AWS Management Console.**
2. Select the option **IAM** (Identity and Access Management) under the services category **Security, Identity & Compliance.**
3. Select **Users** on the left pane in the dashboard.
4. Click **Add user**. Provide a Username. For example, devops.
5. Select **Access type** as **Programmatic access** and click **Next:Permissions.**
6. Select **Attach existing policies directly** as permission.
7. Select the policy **IAMFullAccess** from the policies list. Type **IAMFullAccess** in the search box and select the policy.
8. Click **Next:review** and click **Create User**.

A user will be created as seen in the following image. Note down the user's **Access Key ID** and **Secret access key.**

![User_Addition](https://docs.mayaonline.io/assets/Add_user.jpg)

Now, the user account is created in AWS and you can go to **stackpoint.io** for creating cluster and installing OpenEBS.

Note: If you already created a k8s cluster using stackpoint, you can go to  

[#]: ImportOpenEBSHelmCharts

  else proceed with next step.

### **Configure K8s Cluster**



Goto **Your Clusters** section in **stackpoint.io** and select **Add a Cluster now** button. Select **AWS** and Cloud provider and go to next page. 

![image](/docs/assets/platform_stackpoint.png)

Add your AWS credentials like **Access Key ID** and **Secret Access Key** click the **create** button . In this page, you can edit your Node configuration details . The recommended configuration is One Master Node and 3 Worker Nodes . You can submit once details are entered



![img](/docs/assets/provider_stackpoint.png)



Click on **Distribution** and choose **Ubuntu16.04 LTS**. 



![image](/docs/assets/ubuntu_stackpoint.png)



Now click on **Submit** to create your cluster. This should take around 5–8 minutes to bring up one Master and three Workers Kubernetes Cluster.

 

### **Import OpenEBS Helm Charts**



Click on **Solutions** tab on the top of the screen and select  **Trusted charts** and select **OpenEBS** from **Trusted charts** and then **Import Charts** from the upper right.



![img](https://cdn-images-1.medium.com/max/800/0*vZr9hqN35SCCsx-a.png)



Add the chart repo
with the following details:

>  — **name :** openebs-charts
>  — **type :** packaged-charts
>  — **Packaged Charts URL** : <https://openebs.github.io/charts/>



Click on **Review Repository**.

![img](https://cdn-images-1.medium.com/max/800/0*lkT38CLmsESK2i1T.png)



Make sure **Access Verified** shows ok and click on **Save Repository** button to finish adding chart repo.



![**img**](https://cdn-images-1.medium.com/max/800/0*tS9uArAROjoOLc05.png)

**Adding OpenEBS to Your Kubernetes Cluster**



First, make sure your cluster and all nodes are up.

On the **Control Plane** tab from  **stackpoint.io**, click on your cluster name **OpenEBS Demo**.



![img](/docs/assets/cluster_stackpoint.png)



Once the Kubernetes cluster is up on AWS with functional Helm, click on the **Solutions** tab and **Add Solution** button and click on **My charts** . Select **openebs** and edit with the following details.





![img](/docs/assets/charts_stackpoint.png)

Add the solution with the following details:

> \- **namespace :** default
>



![img](/docs/assets/solutions_stackpoint.png)



Click on **Install** to finally add OpenEBS into your cluster.

![](/docs/assets/install_stackpoint.png)

State field should be green after OpenEBS is successfully added.



![1524727342674](/docs/assets/openebs-success-install-stackpoint.PNG)



Now your cluster is ready. Now you can install OpenEBS storage class templates on this kubernetes cluster using the following command.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-storageclasses.yaml
```

The above command deploys storage class templates. Now you can run your workloads with **openebs-standard** storage class if you using default storage class.

To confirm, click on **K8s Dashboard.** This will bring up your Kubernetes Dashboard UI in a new window. You should be able to find the **openebs-standard** option under **StorageClasses**.

 




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
