---
id: open-iSCSI
title: Verify open-iscsi status
sidebar_label: prereqISCSIVerify 
---

------

## Verify open-iscsi status on Kublet

The open-iscsi initiator packages depends on your host OS or in kublet container. You can follow the following steps for installation / verification of open-iscsi package.  In case you are using GKE, use the host machine as ubuntu. 

**On Ubuntu**

*Verify that iSCSI is configured*

OpenEBS uses iSCSI to connect to the block volumes. If iSCSI is already installed on your host,check that initiator name is configured and iSCSI service is running using the following commands.

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

You can verify the installation as mentioned in the section verify that iSCSI is configured. 

**On Centos**

*Verify that iSCSI is configured*

OpenEBS uses iSCSI to connect to the block volumes. If iSCSI is already installed on your host, check that initiator name is configured and iSCSI service is running using the following commands.

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

**On Azure**

Azure you need to verify the open-iscsi packages are installed on the kublet. To check the same you can connect to the nodes through SSH using their public IP addresses by running the following command.

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

*Verify that iSCSI is configured*

 Check the status of iSCSI service by running the following command.

```
azureuser@aks-nodepool1-46849391-1:~$ service open-iscsi status
```

Run the following commands to install and configure iSCSI in each node.

```
azureuser@aks-nodepool1-46849391-1:~$ sudo docker exec -it 3aab0f9a48e2 bash
# apt-get update
# apt install -y open-iscsi
# exit
```

You can verify the installation as mentioned in the section verify that iSCSI is configured. 



Note**: Install and configure iSCSI in all the Kubernetes cluster nodes by following the above procedure.

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
