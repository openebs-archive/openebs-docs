---
id: usingminikube
title: Using MiniKube to get started with OpenEBS
sidebar_label: Minikube
---
------

## Setting up OpenEBS with Kubernetes using Minikube

Minikube helps developers to quickly setup a single-node Kubernetes cluster for their development environment. There are several options available for developers to install Minikube. For more information, see, [Minikube Setup](https://github.com/kubernetes/minikube).

If you are already an experienced Minikube user, you can easily setup OpenEBS on your existing Kubernetes cluster with a few simple kubectl commands. For more information, see, [Quick Start](https://github.com/kubernetes/minikube).

This section provides instructions to set up Kubernetes using Minikube directly on Ubuntu version 16.04 (without using any VM drivers) and to have OpenEBS running in hyperconverged mode.

## Prerequisites

Minimum requirements for using Minikube are as follows:

-   Machine Type - (Minimum 4 vCPUs)
-   RAM - (Minimum 4 GB)

Ensure *docker* is installed on your Ubuntu host.

## Installing Docker on Ubuntu

The following commands help you install Docker on Ubuntu version 16.04 (64 bit).

    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    sudo apt-get update
    apt-cache policy docker-ce
    sudo apt-get install -y docker-ce 

## Adding iSCSI Support

On your Ubuntu host, install open-iscsi package. OpenEBS uses iSCSI to connect to the block volumes. 

    sudo apt-get update
    sudo apt-get install open-iscsi
    sudo service open-iscsi restart

### Verifying that iSCSI is Configured

Check that the initiator name is configured and iSCSI service is running using the following commands.

    sudo cat /etc/iscsi/initiatorname.iscsi
    sudo service open-iscsi status

## Downloading and Setting Up Minikube and kubectl

On your Ubuntu host, do the following.

1. Install minikube.

    ```
    curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
    chmod +x minikube 
    sudo mv minikube /usr/local/bin/
    ```

2. Install kubectl.

    ```
    curl -Lo kubectl https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
    chmod +x kubectl 
    sudo mv kubectl /usr/local/bin/
    ```

3. Setup directories for storing minkube and kubectl configurations. 

    ```
    mkdir $HOME/.kube || true
    touch $HOME/.kube/config
    ```

4. Setup the environment for minikube. Copy the following to the \~/.profile. 

    ```
    export MINIKUBE_WANTUPDATENOTIFICATION=false
    export MINIKUBE_WANTREPORTERRORPROMPT=false
    export MINIKUBE_HOME=$HOME
    export CHANGE_MINIKUBE_NONE_USER=true
    export KUBECONFIG=$HOME/.kube/config
    ```

5. Start minikube. 

    ```
    sudo -E minikube start --vm-driver=none
    ```

### Verifying that Minikube is Configured

Check that minikube is configured using the following command.

    minikube status

When minikube is configured, *minikube status* will display the following output.

    minikube: Running
    cluster: Running
    kubectl: Correctly Configured: pointing to minikube-vm at 127.0.0.1

**Note:**

- If minikube status displays *Stopped*, add sudo minikube start command.

- If minikube displays errors indicating permission denied to the configuration files, fix the permissions by running the following commands.

    ```
    sudo chown -R $USER $HOME/.kube
    sudo chgrp -R $USER $HOME/.kube
    sudo chown -R $USER $HOME/.minikube
    sudo chgrp -R $USER $HOME/.minikube
    ```

### Verifying that Kubernetes is configured

Check that kubectl is configured and services are running using the following commands. 

    kubectl get pods
    kubectl get nodes

When kubectl is configured, the above kubectl commands will display an output similar to following.

    NAME           STATUS    AGE       VERSION
    minikube-dev   Ready     8m        v1.7.5
    vagrant@minikube-dev:~$ kubectl get pods --all-namespaces
    NAMESPACE     NAME                              READY     STATUS    RESTARTS   AGE
    kube-system   kube-addon-manager-minikube-dev   1/1       Running   1          8m
    kube-system   kube-dns-910330662-4q4bm          3/3       Running   3          8m
    kube-system   kubernetes-dashboard-txn8f        1/1       Running   1          8m

## Setting up OpenEBS

Download the latest OpenEBS Operator files using the following commands.

    git clone https://github.com/openebs/openebs.git
    cd openebs/k8s
    kubectl apply -f openebs-operator.yaml

**Note:** By default, OpenEBS launches OpenEBS Volumes with two replicas. To setup one replica, as is the case with single-node Kubernetes cluster, specify the environment variable *OPENEBS\_IO\_JIVA\_REPLICA\_COUNT=1*.
If your OpenEBS version is \< 0.5.0, you must use DEFAULT\_REPLICA\_COUNT environment variable instead of OPENEBS\_IO\_JIVA\_REPLICA\_COUNT.

The maya-apiserver section in the following openebs-operator.yaml snippet shows you how to update it.

    ---
    apiVersion: apps/v1beta1
    kind: Deployment
    metadata:
      name: maya-apiserver
      namespace: default
    spec:
      replicas: 1
      template:
        metadata:
          labels:
            name: maya-apiserver
        spec:
          serviceAccountName: openebs-maya-operator
          containers:
          - name: maya-apiserver
            imagePullPolicy: Always
            image: openebs/m-apiserver:0.3-RC4
            ports:
            - containerPort: 5656
            env:
            - name: OPENEBS_IO_JIVA_REPLICA_COUNT
              value: "1"
    ---

Add OpenEBS related storage classes, that can then be used by developers and applications using the following command.

    kubectl apply -f openebs-storageclasses.yaml

### Running Stateful Applications with OpenEBS Storage

To use OpenEBS as persistent storage for your stateful workloads, set the storage class in the Persistent Volume Claim (PVC) of your application to one of the OpenEBS storage class.

Get a list of storage classes using the following command and select the storage class that best suits your application.

    kubectl get sc

Some sample YAML files for stateful workloads using OpenEBS are provided in the [openebs/k8s/demo](openebs/k8s/demo).

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
