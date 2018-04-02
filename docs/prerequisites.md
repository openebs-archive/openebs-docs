---
id: prerequisites
title: Pre-requisites for Installation
sidebar_label: Prerequisites
---

------

This section will help you to understand the pre-requisites for the OpenEBS installation in a kubernetes installed environment.

The minimum requirements for the OpenEBS installation are

1.  Kubernetes cluster version >= 1.7.5

2. Each Kubernetes node should have open-iscsi package installed


## Kubernetes cluster configuration

OpenEBS is a Containerized Storage solution that can be orchestrated by  Kubernetes. To understand how to use OpenEBS with Kubernetes, you must familiarize yourself with [Kubernetes Storage Concepts](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), specifically:

- Persistent Volumes and Persistent Volume Claims
- Dynamic Volume Provisioner
- Storage Classes



If you are new to Kubernetes, here are some guides that can help you setup Kubernetes on supported platforms and install OpenEBS:

- [Baremetal](https://docs.openebs.io/docs/onpremise.html#running-the-setup-on-ubuntu-1604)
- [Amazon EC2](https://docs.openebs.io/docs/cloudsolutions.html#amazon-cloud)
- [GKE](https://docs.openebs.io/docs/cloudsolutions.html#google-cloud)
- [OpenShift](https://docs.openebs.io/docs/openshift.html)
- [Azure](https://newstaging-docs.openebs.io/docs/prerequisites.html)




**Recommended Configuration**



Kubernetes cluster with at least 3 nodes and each node having below configuration.

Centos7, Ubuntu 16.04 and above with with minimum 4vCPUs, 8G RAM and 16GB hard disk. 



**Minimum Configuration**



Kubernetes cluster with at least 1 nodes and node having below configuration or a Minikube cluster.

Centos7, Ubuntu 16.04 and above with with minimum 2vCPUs, 4G RAM and 16GB hard disk. 



## **Verify open-iscsi status on host**

To consume OpenEBS volume on k8s hosts, install open-iscsi initiator packages depends on your host OS. You can get the minimum requirement needed on the various host system for the OpenEBS installation from here.

**On Ubuntu**

*Verify that iSCSI is configured*

OpenEBS uses iSCSI to connect to the block volumes. If iSCSI is already installed on your host,check that initiator name is configured and iSCSI service is running using the following commands.

```
sudo cat /etc/iscsi/initiatorname.iscsi
```

```
sudo service open-iscsi status
```

 

If iSCSI is not installed on your host, install open-iscsi package by follow below commands and verify that iSCSI is configured properly on it.

```
sudo apt-get update
```

```
sudo apt-get install open-iscsi
```

```
sudo service open-iscsi restart
```



**On Centos**

*Verify that iSCSI is configured*

OpenEBS uses iSCSI to connect to the block volumes. If iSCSI is already installed on your host, check that initiator name is configured and iSCSI service is running using the following commands.

```
vi/etc/iscsi/initiatorname.iscsi
```

```
systemctl status iscsi.service
```

 

If iSCSI is not installed on your host, install open iscsi-initiator-utils RPM package by follow the below commands and verify that iscsi is configured properly on it.

 

```
yum install iscsi-initiator-utils -y
```

 

**On Azure**

You can connect to the nodes through SSH using their public IP addresses by running the following command.



```
devops@Azure:~$ ssh azureuser@40.71.213.221

azureuser@aks-nodepool1-46849391-1:~$
```

 **Note**: azureuser is a default username.



Obtain the container ID of the hyperkube kubelet on each node by running the following command.

```
azureuser@aks-nodepool1-46849391-1:~$ sudo docker ps | grep "hyperkube kubele" 
3aab0f9a48e2    k8s-gcrio.azureedge.net/hyperkube-amd64:v1.8.7   "/hyperkube kubele..."   48 minutes ago      Up 48 minutes                           eager_einstein
```

Run the following commands to install and configure iSCSI in each node.

```
azureuser@aks-nodepool1-46849391-1:~$ sudo docker exec -it 3aab0f9a48e2 bash
# apt-get update
# apt install -y open-iscsi
# exit
```

*Verify that iSCSI is configured*

 Check the status of iSCSI service by running the following command.

```
azureuser@aks-nodepool1-46849391-1:~$ service open-iscsi status

● open-iscsi.service - Login to default iSCSI targets
   Loaded: loaded (/lib/systemd/system/open-iscsi.service; enabled; vendor preset: enabled)
   Active: active (exited) since Mon 2018-03-19 11:27:01 UTC; 21h ago
     Docs: man:iscsiadm(8) 
           man:iscsid(8)
 Main PID: 1497 (code=exited, status=0/SUCCESS)
    Tasks: 0
   Memory: 0B
      CPU: 0
   CGroup: /system.slice/open-iscsi.service

Mar 19 11:27:03 aks-nodepool1-46849391-1 iscsiadm[1474]: iscsiadm: No records found
Mar 19 11:27:01 aks-nodepool1-46849391-1 systemd[1]: Starting Login to default iSCSI targets...
Mar 19 11:27:01 aks-nodepool1-46849391-1 systemd[1]: Started Login to default iSCSI targets.
azureuser@aks-nodepool1-46849391-1:~$ exit
devops@Azure:~$
```

**Note**: Install and configure iSCSI in all the Kubernetes cluster nodes by following the above procedure.

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
