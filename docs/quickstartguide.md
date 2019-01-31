---
id: quickstartguide
title: Getting Started with OpenEBS
sidebar_label: Quick Start Guide
---

------

Following are the steps to get started with OpenEBS on a Kubernetes cluster.

## As a Kubernetes Operator/Administrator:

1. As a prerequisite, check if open-iscsi is installed and running on kubelet. See [Steps for configuring and verifying open-iscsi](/docs/next/prerequisites.html#steps-for-configuring-and-verifying-open-iscsi). 

      **Note:** Do not install open-iscsi / iscsi-initiator-utils on host nodes if a kubelet container, for example, Rancher Container Engine (RKE) already has the package installed. See [Troubleshooting](https://staging-docs.openebs.io/docs/next/tsg_install.html#on-rancher-application-pods-are-not-running-when-openebs-volumes-are-provisioned) section for detailed information.

2. Kubernetes 1.9.7+ installed

3. kubectl or helm installed and ready to use. Ensure that you run the kubectl commands with cluster admin context. 

4. You can install OpenEBS either through stable helm chart or by using OpenEBS operator/kubectl.  

5. If you are using CentOS as base OS for 0.8 OpenEBS installation, then you must *disable selinux* for OpenEBS Node Disk Manager to detect the OS disk. You can *disable selinux* by using the `setenforce 0` command.

    ### Using a Stable Helm Chart

    [Setup RBAC for helm tiller](/docs/next/installation.html#helm) and install the chart from Kubernetes stable helm repo  using the following commands.

    ```
    helm repo update
    helm install --namespace openebs --name openebs stable/openebs
    ```

    This will install OpenEBS cluster in **openebs** namespace. For more details on installing OpenEBS using helm, see [install through helm](/docs/next/installation.html#helm).

    You can also install OpenEBS in custom namespace using the following way.

    ```
    helm repo update
    helm install --namespace <custom_namespace> --name openebs stable/openebs
    ```

    Once you install OpenEBS in custom namespace, all the OpenEBS components will be deployed under the same namespace.

     ### Using OpenEBS Operator (kubectl):

    You can install OpenEBS cluster by running the following command.

    **Note:** Ensure that you have met the [prerequisites](/docs/next/prerequisites.html) before installation.

    ```
    kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
    ```

    The installation will involve creating a new Service Account and assigning it to OpenEBS components. 

    For detailed information about installing OpenEBS cluster, see [install using kubectl](/docs/next/installation.html#install-openebs-using-kubectl)

6. **Optional:** Create a catalog of storage classes and publish them to your developers. Two default storage classes (*openebs-jiva-default* and *openebs-cstor-sparse*) are added to the cluster when you install OpenEBS.

7. **Optional:** An OpenEBS enabled cluster can be imported into [mayaonline.io](/docs/next/mayaonline.html) for better visibility, volume management, and integrated ChatOps experience with Slack.

## As an Application Developer:

1. Create a PVC specification with the right pvc name and use it in the application YAML file. Some sample application yaml files are available under [openebs-repository](https://github.com/openebs/openebs/tree/master/k8s/demo).

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

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
