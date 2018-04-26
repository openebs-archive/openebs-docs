---
id: prerequisites
title: Prerequisites for Installation
sidebar_label: Prerequisites
---

------

The following prerequisites are required for installing OpenEBS.

1. A Kubernetes cluster with version >= 1.7.5 (OpenEBS requires CRD feature of Kubernetes)

2. open-iscsi package installed and configured on the Kubernetes cluster

3. kubectl or helm installed and ready to use

   ​


Installing and configuring open-iscsi on Kubernetes will vary slightly depending on the platform and you can [find those instructions here](#iSCSIConfig). 



### Required Kubernetes knowledge

To understand how to use OpenEBS with Kubernetes, familiarize yourself with [Kubernetes Storage Concepts](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), specifically the following.

- Persistent Volumes and Persistent Volume Claims
- Dynamic Volume Provisioner
- Storage Classes



<a name="iSCSIConfig"></a>

## Steps for configuring and verifying open-iscsi 

The open-iscsi initiator packages depend on your host operating system or kubelet container. Use the following steps for installation / verification of open-iscsi package.

### GKE

With GKE, you must create Kubernetes cluster with the host machine as Ubuntu.  Ubuntu host on GKE comes with iSCSI configured.

### On Ubuntu host

If an iSCSI initiator is already installed on your host, check that initiator name is configured and iSCSI service is running using the following commands.

```
sudo cat /etc/iscsi/initiatorname.iscsi
```

```
sudo service open-iscsi status
```

If an iSCSI initiator is not available on your host, install open-iscsi package by running the following commands. 

```
sudo apt-get update
```

```
sudo apt-get install open-iscsi
```



```
sudo service open-iscsi restart
```



### On CentOS host

If an iSCSI initiator is already installed on your host, check that initiator name is configured and iSCSI service is running by running the following commands.

```
vi /etc/iscsi/initiatorname.iscsi
```

```
systemctl status iscsi.service
```

If an iSCSI initiator is not available on your host, install open iscsi-initiator-utils RPM package by running the following command. 

```
yum install iscsi-initiator-utils -y
```

You can verify the installation using the steps mentioned above. 

<a name="Azure"></a>

### Configuring open-iscsi on Azure cloud

On Azure cloud, you need to verify if the open-iscsi package is installed on the kubelet. To validate, you can connect to the nodes through SSH using their public IP addresses by running the following command.

```
devops@Azure:~$ ssh azureuser@40.xx.yyy.221

azureuser@aks-nodepool1-46849391-1:~$
```

 **Note**: azureuser is the default username.

Obtain the container ID of the hyperkube kubelet on each node by running the following command.

```
azureuser@aks-nodepool1-46849391-1:~$ sudo docker ps | grep "hyperkube kubele" 
3aab0f9a48e2    k8s-gcrio.azureedge.net/hyperkube-amd64:v1.8.7   "/hyperkube kubele..."   48 minutes ago      Up 48 minutes                           eager_einstein
```

Get inside the kubelet container by running the following command and install open-iscsi package in each Kubernetes node.

```
azureuser@aks-nodepool1-46849391-1:~$ sudo docker exec -it <Container ID> bash
# apt-get update
# apt install -y open-iscsi
```

Check the status of iSCSI service by running the following command inside kubelet container.

```
azureuser@aks-nodepool1-46849391-1:~$ service open-iscsi status
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
