---
id: stackpointcloud
title: Using OpenEBS on StackPoint Cloud
sidebar_label: StackPointCloud
---

------

This section helps you integrate StackPoint with OpenEBS. It is possible to integrate StackPoint with OpenEBS in all major platforms such as AWS, Google Cloud (GKE & GCE), Azure, and Digital Ocean. Detailed procedure for installing OpenEBS using StackPoint in AWS is explained below.

 **Prerequisites**

1. An AWS account.
2. Ubuntu machine to run awscli.

### **Creating a User in AWS**

To create a user in AWS, use the following procedure.

1. Open **AWS Management Console.**
2. Select the option **IAM** (Identity and Access Management) under the services category **Security, Identity & Compliance.**
3. Select **Users** on the left pane in the dashboard.
4. Click **Add user**. Provide a username, for example, devops.
5. Select **Access type** as **Programmatic access** and click **Next:Permissions.**
6. Select **Attach existing policies directly** as permission.
7. Select the policy **IAMFullAccess** from the policies list. Type **IAMFullAccess** in the search box and select the policy.
8. Click **Next:review** and click **Create User**.

A user will be created as seen in the following image. Note down the user's **Access Key ID** and **Secret access key.**

![User_Addition](https://docs.mayaonline.io/assets/Add_user.jpg)

Now, the user account is created in AWS and you can go to **stackpoint.io** for creating cluster and installing OpenEBS.

**Note:** If you have already created a k8s cluster using stackpoint, you can [Import OpenEBS Helm Charts](#ImportHelmCharts).

### **Configure K8s Cluster**


Go to **Your Clusters** section in **stackpoint.io** and click **Add a Cluster now**. Select **AWS** and the Cloud provider. Go to next page.

![image](/docs/assets/platform_stackpoint.png)

Add your AWS credentials such as **Access Key ID** and **Secret Access Key** and click **Create**. You can then edit your Node configuration details. The recommended configuration is One Master Node and 3 Worker Nodes.


![img](/docs/assets/provider_stackpoint.png)


Click **Distribution** and choose **Ubuntu16.04 LTS**.


![image](/docs/assets/ubuntu_stackpoint.png)


Click on **Submit** to create your cluster. This should take around 5–8 minutes to bring up one Master and three Worker Kubernetes Cluster.



### **Import OpenEBS Helm Charts** <a name="ImportHelmCharts"></a>



Select **Solutions** tab on the top of the screen. Select  **Trusted charts** and **OpenEBS** from **Trusted charts** and then select **Import Charts** from the top pane.


![img](https://cdn-images-1.medium.com/max/800/0*vZr9hqN35SCCsx-a.png)


Add the chart repo with the following details:

>  — **name :** openebs-charts
>
>  — **type :** packaged-charts
>
>  — **Packaged Charts URL** : <https://openebs.github.io/charts/>



Click **Review Repository**.

![img](https://cdn-images-1.medium.com/max/800/0*lkT38CLmsESK2i1T.png)


Ensure **Access Verified** displays OK and click **Save Repository** to finish adding the chart repo.


![**img**](https://cdn-images-1.medium.com/max/800/0*tS9uArAROjoOLc05.png)

**Adding OpenEBS to your Kubernetes Cluster**


First, ensure that your cluster and all nodes are running.

On the **Control Plane** tab from **stackpoint.io**, click on your cluster name.


![img](/docs/assets/cluster_stackpoint.png)


Once the Kubernetes cluster is running on AWS with Helm, click the **Solutions** tab and **Add Solution**.

![img](/docs/assets/solutions_stackpoint.png)

Next,click **My charts**. Select **openebs**.

![img](/docs/assets/charts_stackpoint.png)

Edit the below value and Click on **Install** to deploy OpenEBS into your cluster.

> \- **namespace :** default
>

![](docs/assets/install_stackpoint.png)


State field should be green after OpenEBS is successfully added.

![1524727342674](/docs/assets/openebs-success-install-stackpoint.PNG)


Your cluster is ready. You can now install OpenEBS storage class templates on this kubernetes cluster using the following command.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-storageclasses.yaml
```

The above command deploys storage class templates. You can run your workloads with **openebs-standard** storage class if you are using default storage class.

To confirm, click **K8s Dashboard.** This will bring up your Kubernetes Dashboard UI in a new window. You should be able to find the **openebs-standard** option under **StorageClasses**.




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
