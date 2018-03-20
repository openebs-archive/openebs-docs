---
id: aws
title: AWS
sidebar_label: AWS
---

## Setting up OpenEBS with Kubernetes on Amazon Web Services

This section provides instructions to set up a Kubernetes cluster on Amazon Web Services (AWS) and to have OpenEBS running in hyper converged mode.

### Prerequisites

Perform the following procedure to setup the prerequisites for AWS.

1.  Signup for AWS [here](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html). If you already have an AWS account, skip the above step.

2.  Start your browser.
3.  Open **AWS Management Console**.
4.  Select **IAM** under **Security, Identity & Compliance**.
5.  Under **Dashboard** in the left pane, click **Users**.
6.  Click **Add user**.
7.  In the **User name** field, enter the name of the user you want to create. For example, *openebsuser*.
8.  Select **Access type** as **Programmatic access**.
9.  Click **Next: Permissions**.
10.  Select **Attach existing policies directly**.
11.  In the **Search Box**, enter *IAMFullAccess* and select the listed
    permission.
12.  Click **Next: Review**.
13.  Click **Create user**.

A *openebsuser* user will be created and an Access key ID and a Secret access key will be assigned as in the following example. 

    User              Access key ID             Secret access key
    openebsuser     AKIAI3MRLHNGUEXAMPLE      udxZi33tvSptXCky31kEt4KLRS6LSMMsmEXAMPLE

**Note:**

Note down the *Access key ID* and the *Secret access key* as AWS will not display it again.

## kops, terraform and awscli

OpenEBS has created a script that does most of the work for you. Download the *oebs-cloud.sh* script file using the following commands. 

    $ mkdir -p openebs
    $ cd openebs
    $ wget https://raw.githubusercontent.com/openebs/openebs/master/e2e/terraform/oebs-cloud.sh
    $ chmod +x oebs-cloud.sh

The list of operations performed by the *oebs-cloud.sh* script are as follows:

    $ ./oebs-cloud.sh
    Usage : 
       oebs-cloud.sh --setup-local-env
       oebs-cloud.sh --create-cluster-config [--ami-vm-os=[ubuntu|coreos]]
       oebs-cloud.sh --list-aws-instances
       oebs-cloud.sh --ssh-aws-ec2  [  ipaddress |=ipaddress]
       oebs-cloud.sh --help
    
    Sets Up OpenEBS On AWS
    
     -h|--help                       Displays this help and exits.
     --setup-local-env               Sets up, AWSCLI, Terraform and KOPS.
     --create-cluster-config         Generates a terraform file (.tf) and Passwordless SSH
     --ami-vm-os                     The OS to be used for the Amazon Machine Image.
                                     Defaults to Ubuntu.
     --list-aws-instances            Outputs the list of AWS instances in the cluster.
     --ssh-aws-ec2                   SSH to Amazon EC2 instance with Public IP Address.

Running the following command allows you to install the required tools on your workstation. 

    $ ./oebs-cloud.sh --setup-local-env

The following tools are installed.

-   awscli
-   kops \>= 1.6.2
-   terraform \>= 0.9.11

### Updating the .profile File

The tools **awscli** and **kops** require the AWS credentials to access AWS services.

-   Use the credentials that were generated earlier for the user *openebsuser*.

-   Add path */usr/local/bin* to the PATH environment variable.
```
$ vim ~/.profile
```   
-   Add the AWS credentials as environment variables in .profile
    ```
    export AWS_ACCESS_KEY_ID=<access key>
    export AWS_SECRET_ACCESS_KEY=<secret key>
    ```
- Add /usr/local/bin to PATH
 
  ```
  PATH="$HOME/bin:$HOME/.local/bin:/usr/local/bin:$PATH"
  ```
    $ source ~/.profile
### Creating the Cluster Configuration

You must generate a terraform file (.tf) that will later spawn -

- One Master
- Two Nodes

Run the following command in a terminal.
```
$ ./oebs-cloud.sh --create-cluster-config
```

Running *--create-cluster-config* command without any arguments defaults to **Ubuntu**. You can also run *--create-cluster-config* command with *--ami-vm-os=ubuntu* or *--ami-vm-os=coreos* commands and the following occurs.

-   A *kubernetes.tf* terraform file is generated in the same directory.
-   Passwordless SSH connection between the local workstation and the remote EC2 instances is established.

**Note:**

- The script uses *t2.micro* instance for the worker nodes, which  must be well within the **Amazon Free Tier** limits.
- For process intensive containers you may have to modify the script to use *m3.large* instances, which could be charged.

### Creating a Cluster on AWS using Terraform

-   Run the following command to verify successful installation of terraform.

        $ terraform
        Usage: terraform [--version] [--help] <command> [args]
        
        The available commands for execution are listed below. The most common and useful 
        commands are shown first,followed by less common or more advanced commands. If you 
        are just getting started with Terraform, use the common commands. For other commands, 
        read the help and documentation before using them.
        
        Common commands: 
        
          apply              Builds or changes infrastructure
          console            Interactive console for Terraform interpolations
        # ...

-   Run the *terraform init* command to initialize terraform.
-   Run the *terraform plan* command from the directory where the generated terraform file (.tf) is placed.

    * Terraform outputs a chunk of JSON data containing changes that would be applied on AWS.
    * terraform plan* command verifies your terraform files (.tf) and displays errors that it encountered.
    * Fix these errors and verify again with the *terraform plan *command before running the terraform *apply* command.

-   Run the command *terraform apply* to initiate infrastructure creation.

## List AWS EC2 Instances

From your workstation, run the following command to list the AWS EC2 instances created. 

    $ ./oebs-cloud.sh --list-aws-instances
    Node                             Private IP Address   Public IP Address    
    nodes.openebs.k8s.local          172.20.36.126        54.90.239.23         
    nodes.openebs.k8s.local          172.20.37.115        34.24.169.116       
    masters.openebs.k8s.local        172.20.53.140        34.202.205.27 
### SSH to the Kubernetes Node

From your workstation, run the following commands to connect to the EC2 instance running the Kubernetes Master.

#### **For Ubuntu**

    $ ./oebs-cloud.sh --ssh-aws-ec2
    Welcome to Ubuntu 16.04 LTS (GNU/Linux 4.4.0-93-generic x86_64)
    ubuntu@ip-172-20-53-140 ~ $

#### **For CoreOS**

    $ ./oebs-cloud.sh --ssh-aws-ec2
    Container Linux by CoreOS stable (1465.6.0)
    core@ip-172-20-53-140 ~ $

Running *--ssh-aws-ec2* command without any arguments, by default, connects you to the Kubernetes Master.

You can also run *--ssh-aws-ec2* command as *--ssh-aws-ec2=ipaddress*, where *ipaddress* is the public IP Address of the AWS EC2 instance.

If you want to connect with the Kubernetes minion, run *--ssh-aws-ec2=ipaddress*, where *ipaddress* is the public IP Address of the AWS EC2 instance.

You should now be running inside the AWS EC2 instance.

### Deploying OpenEBS on AWS

Kubernetes must be running on the EC2 instances while deploying OpenEBS. Verify if a Kubernetes cluster is created.

#### **For Ubuntu**

    ubuntu@ip-172-20-53-140:~$ kubectl get nodes 
    NAME                            STATUS    AGE       VERSION 
    ip-172-20-36-126.ec2.internal   Ready     1m        v1.7.2 
    ip-172-20-37-115.ec2.internal   Ready     1m        v1.7.2          
    ip-172-20-53-140.ec2.internal   Ready     3m        v1.7.2 

OpenEBS is deployed by the time you log in to Amazon Web Services (AWS).

    ubuntu@ip-172-20-53-140:~$ kubectl get pods
    NAME                      READY     STATUS    RESTARTS   AGE
    maya-apiserver-h714w      1/1       Running   0          12m
    openebs-provisioner-5e6ij 1/1       Running   0          9m

#### **For CoreOS**

    core@ip-172-20-53-140:~$ kubectl get nodes 
    NAME                            STATUS    AGE       VERSION 
    ip-172-20-36-126.ec2.internal   Ready     1m        v1.7.2 
    ip-172-20-37-115.ec2.internal   Ready     1m        v1.7.2 
    ip-172-20-53-140.ec2.internal   Ready     3m        v1.7.2

OpenEBS is deployed by the time you log in to Amazon Web Services (AWS).

    core@ip-172-20-53-140:~$ kubectl get pods
    NAME                      READY     STATUS    RESTARTS   AGE
    maya-apiserver-h714w      1/1       Running   0          12m
    openebs-provisioner-5e6ij 1/1       Running   0          9m


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
