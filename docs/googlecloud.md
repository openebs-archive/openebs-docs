---
id: googlecloud
title: Google Cloud 
sidebar_label: Google Cloud
---

## Setting up OpenEBS with Kubernetes on Google Kubernetes Engine

This section, provides detailed instructions on how to setup and use OpenEBS in Google Kubernetes Engine (GKE). This section uses a three node Kubernetes cluster.

### Prerequisite

A GKE account

### 1. Preparing your Kubernetes Cluster

You can either use an existing Kubernetes cluster or create a new one. To create a new cluster, perform the following procedure.

1.  Go to the Google Cloud URL at <https://console.cloud.google.com/>.
2.  In the *Google Cloud Platform* screen, select **Kubernetes Engine** on the left pane.
3.  Click **Create Cluster**.
4.  In the *Create Kubernetes Cluster* screen, key in or select the required information. The minimum requirements for Kubernetes cluster are as follows:

-   Machine Type - (Minimum 2 vCPUs)
-   Node Image - (Ubuntu)
-   Size - (Minimum 3)
-   Cluster Version - (1.6.4+)

5.  Click **Create** and **Connect** on the top pane.

**Note:**

You can also click on the Edit icon, edit the fields, click **Save** and **Connect**. Select *Connect using Cloud Shell*. You will get a welcome message.

Enter the following command at the prompt :: kubectl config current-context

The following, for example, is displayed which is the current context.

gke\_maya-chatops\_us-central1-a\_doc-test where *maya-chatops* is the project name and *doc-test* is the cluster name.

**Note:**

The example commands below were run on a Kubernetes cluster *doc-test* in zone *us-central1-a* with project unique ID *maya-chatops*. When you copy paste the command, ensure that you use the details from your
project.

### iSCSI Configuration

Go to **Google Cloud Platform** -\> **Compute Engine** -\> **VM instances**. The nodes displayed by default in this console are Compute Engine VMs, and you can see them in the console. The display is similar to the following screen.

> ![image](docs/assets/compute_engine_vms.png)

Select the nodes and click SSH to see the iSCSI configuration.

**Verify that iSCSI is configured**

a. Check that initiator name is configured. 

    ~$sudo cat /etc/iscsi/initiatorname.iscsi
    ## DO NOT EDIT OR REMOVE THIS FILE!
    ## If you remove this file, the iSCSI daemon will not start.
    ## If you change the InitiatorName, existing access control lists
    ## may reject this initiator.  The InitiatorName must be unique
    ## for each iSCSI initiator.  Do NOT duplicate iSCSI InitiatorNames.
    InitiatorName=iqn.1993-08.org.debian:01:6277ea61267f
b. Check if iSCSI service is running using the following commands. 

    ~$sudo service open-iscsi status
    open-iscsi.service - Login to default iSCSI targets
    Loaded: loaded (/lib/systemd/system/open-iscsi.service; enabled; vendor preset: enabled)
    Active: active (exited) since Tue 2017-10-24 14:33:57 UTC; 3min 6s ago
      Docs: man:iscsiadm(8)
            man:iscsid(8)
    Main PID: 1644 (code=exited, status=0/SUCCESS)
             Tasks: 0
            Memory: 0B
               CPU: 0
            CGroup: /system.slice/open-iscsi.service
    Oct 24 14:33:57 gke-cluster-3-default-pool-8b0f2a27-5nr2 systemd[1]: Starting Login to default iSCSI targets...
    Oct 24 14:33:57 gke-cluster-3-default-pool-8b0f2a27-5nr2 iscsiadm[1640]: iscsiadm: No records found
    Oct 24 14:33:57 gke-cluster-3-default-pool-8b0f2a27-5nr2 systemd[1]: Started Login to default iSCSI targets.

c.  Repeat steps a and b for the remaining nodes.

### 2. Run OpenEBS Operator (using Google Cloud Shell)

Before applying OpenEBS Operator, ensure that the administrator context for the cluster is set. The following procedure helps you setup the administrator context.

**Setting up Kubernetes Cluster with Administrator Privileges**

To create or modify service accounts and grant previleges, kubectl must be run with administrator previleges. The following commands help you set up and use the administrator context for Google Kubernetes Engine using the Google Cloud Shell.

a. Initialize credentials to allow kubectl to execute commands on the Kubernetes cluster. 

    gcloud container clusters list
    gcloud container clusters get-credentials doc-test --zone us-central1-a

b.  Setup the administrator context.

Create an administrator configuration context from the configuration shell using the following commands. 

    gcloud container clusters list
    kubectl config set-context doc-test --cluster=gke_maya-chatops_us-central1-a_doc-test --user=cluster-admin

To set the administrator privilege to your cluster (cluster-role admin) get the current google identity by using the following command.

```
$ gcloud info | grep Account
```

Account: [[myname@example.org](mailto:myname@example.org)]

Grant cluster-admin to your current identity using the following command.

```
$ kubectl create clusterrolebinding myname-cluster-admin-binding --clusterrole=cluster-admin --user=myname@example.org
```

The clusterrolebinding *myname-cluster-admin-binding* is created.

c. Download the latest OpenEBS files using the following commands. 

    git clone https://github.com/openebs/openebs.git
    cd openebs/k8s

The following commands will prompt you for a username and password. Provide username as *admin*. Password for the admin can be obtained from **Google Cloud Platform** -\> **Kubernetes Engine**.

Click the cluster you have created and select **Show Credentials**.

d. Apply OpenEBS Operator and add related OpenEBS Storage Classes, that can be used by developers and applications using the following commands.

    kubectl config use-context doc-test
    kubectl apply -f openebs-operator.yaml
    kubectl apply -f openebs-storageclasses.yaml
    kubectl config use-context gke_maya-chatops_us-central1-a_doc-test   

**Note:**

Persistent storage is created from the space available on the nodes (default host directory : */var/openebs*). Administrator is provided with additional options of consuming the storage (as outlined in
*openebs-config.yaml*). These options will work hand-in-hand with the Kubernetes local storage manager once OpenEBS integrates them in future releases.

### 3. Running Stateful Workloads with OpenEBS Storage

To use OpenEBS as persistent storage for your stateful workloads, set the storage class in the Persistent Volume Claim (PVC) to the OpenEBS storage class.

Get the list of storage classes using the following command. Choose the storage class that best suits your application. 

    kubectl get sc
    NAME                 TYPE
    openebs-cassandra    openebs.io/provisioner-iscsi
    openebs-es-data-sc   openebs.io/provisioner-iscsi
    openebs-jupyter      openebs.io/provisioner-iscsi
    openebs-kafka        openebs.io/provisioner-iscsi
    openebs-mongodb      openebs.io/provisioner-iscsi
    openebs-percona      openebs.io/provisioner-iscsi
    openebs-redis        openebs.io/provisioner-iscsi
    openebs-standalone   openebs.io/provisioner-iscsi
    openebs-standard     openebs.io/provisioner-iscsi
    openebs-zk           openebs.io/provisioner-iscsi
Some sample YAML files for stateful workloads using OpenEBS are provided in the [openebs/k8s/demo](https://github.com/openebs/openebs/tree/master/k8s/demo)

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
