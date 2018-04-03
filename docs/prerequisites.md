---
id: prerequisites
title: Pre-requisites for Installation
sidebar_label: Prerequisites
---

------

This section will help you to understand the pre-requisites for the OpenEBS installation in a kubernetes installed environment.

The minimum requirements for the OpenEBS installation are

1.  Kubernetes cluster version >= 1.7.5 (OpenEBS needs CRD feature of Kubernetes)
2.  Each Kubernetes node should have open-iscsi package installed. 


Installing and configuring open-iscsi on kubernetes will vary slightly depending on the platform and you can [find those instructions here](#iSCSIConfig). 



### Required Kubernetes knowledge

To understand how to use OpenEBS with Kubernetes, familiarize yourself with [Kubernetes Storage Concepts](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), specifically:

- Persistent Volumes and Persistent Volume Claims
- Dynamic Volume Provisioner
- Storage Classes




If you have verified open-iScsi is configured on your Kubernetes cluster, you can proceed to [installation of OpenEBS](/docs/installation.html) 

<a name="iSCSIConfig"></a>

## Steps for configuring and verifying open-iscsi 

The open-iscsi initiator packages depends on your host OS or in kubelet container. You can follow the following steps for installation / verification of open-iscsi package.  In case you are using GKE, use the host machine as ubuntu. 

### On Ubuntu host

If iSCSI is already installed on your host,check that initiator name is configured and iSCSI service is running using the following commands.

```
sudo cat /etc/iscsi/initiatorname.iscsi
```

```
sudo service open-iscsi status
```

If iSCSI is not installed on your host, install open-iscsi package by following below commands. 

```
sudo apt-get update
```

```
sudo apt-get install open-iscsi
```



```
sudo service open-iscsi restart
```



### On Centos host

If iSCSI is already installed on your host, check that initiator name is configured and iSCSI service is running using the following commands.

```
vi /etc/iscsi/initiatorname.iscsi
```

```
systemctl status iscsi.service
```

If iSCSI is not installed on your host, install open iscsi-initiator-utils RPM package by following the below commands. 

```
yum install iscsi-initiator-utils -y
```

 You can verify the installation as mentioned in the section verify that iSCSI is configured. 

<a name="Azure"></a>

### Configuring open-iscsi on Azure cloud

On Azure cloud, you need to verify the open-iscsi package is installed on the kubelet. To check the same you can connect to the nodes through SSH using their public IP addresses by running the following command.

```
devops@Azure:~$ ssh azureuser@40.xx.yyy.221

azureuser@aks-nodepool1-46849391-1:~$
```

 **Note**: azureuser is a default username.

Obtain the container ID of the hyperkube kubelet on each node by running the following command.

```
azureuser@aks-nodepool1-46849391-1:~$ sudo docker ps | grep "hyperkube kubele" 
3aab0f9a48e2    k8s-gcrio.azureedge.net/hyperkube-amd64:v1.8.7   "/hyperkube kubele..."   48 minutes ago      Up 48 minutes                           eager_einstein
```

 Check the status of iSCSI service by running the following command.

```
azureuser@aks-nodepool1-46849391-1:~$ service open-iscsi status
```

If open-iscsi is not installed, run the following commands to install and configure iSCSI in each node.

```
azureuser@aks-nodepool1-46849391-1:~$ sudo docker exec -it 3aab0f9a48e2 bash
# apt-get update
# apt install -y open-iscsi
# exit
```



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
