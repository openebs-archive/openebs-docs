---
id: aws
title: OpenEBS Cluster with AWS
sidebar_label: AWS
---
------

We are deploying a 3 Node OpenEBS cluster in K8s environment on AWS. Kubernetes on AWS can be installed using kops. Please refer [Installing Kubernetes on AWS with kops](https://kubernetes.io/docs/setup/custom-cloud/kops/) to understand more. 

## Pre-requisites

- AWS account with full access to EC2,S3 and VPC
- Ubuntu Node with AWS CLI package has installed
- All the nodes in clusters should have iscsi enabled. See the [prerequisites](/docs/next/prerequisites.html) section.

### Installation of OpenEBS

In this section we are mentioning about  a 3 Node OpenEBS cluster creation in AWS . We are mainly utilizing the Physical Hardware components from AWS for better performance. This can be acheived with using AWS instance type. Amazon EC2 provides a wide selection of instance types optimized to fit different use cases. Instance types comprise varying combinations of CPU, memory, storage, and networking capacity and give you the flexibility to choose the appropriate mix of resources for your applications. 
We can also consume locally attached disks(SSDs) for better performance. This can be achieved by using instance store volume.






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
