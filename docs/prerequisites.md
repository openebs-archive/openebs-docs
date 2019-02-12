---
id: prerequisites
title: Prerequisites (iSCSI client)
sidebar_label: Prerequisites
---
------

OpenEBS provides block volume support through iSCSI protocol. Hence, iSCSI client presence on all Kubernetes nodes is a prerequisite. Choose the platform below to find the steps to verify if iSCSI client is installed and running or to find the steps to install iSCSI client

<br>

<font size="5">Choose the platform for iSCSI client settings</font>



<div class="divrow">
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#ubuntu"><img src="/docs/assets/l-ubuntu.png" width="50px;">Ubuntu</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#rhel"><img src="/docs/assets/l-rhel.png" width="50px;">RHEL</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#centos"><img src="/docs/assets/l-centos.png" width="50px;">CentOS</a>
    </div>
</div>

<div class="divrow">
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#eks"><img src="/docs/assets/l-eks.png" width="50px;">EKS</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#gke"><img src="/docs/assets/l-gke.png" width="50px;">GKE</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#aks"><img src="/docs/assets/l-aks.png" width="50px;">AKS</a>
    </div>
</div>

<div class="divrow">
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#openshift"><img src="/docs/assets/l-openshift.png" width="50px;">OpenShift</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#rancher"><img src="/docs/assets/l-rancher.png" width="50px;">Rancher</a>
    </div>
    <div class="divcol">
        <a href="/docs/next/iscsiclient.html#icp"><img src="/docs/assets/l-icp.png" width="50px;">ICP</a>
    </div>
</div>



## Linux platforms

The open-iscsi initiator packages depends on your host OS or in kubelet container. You can follow the following steps for installation / verification of open-iscsi package. It is a mandatory requirement to install the iSCSI services and running on all the host machine. OpenEBS uses iSCSI to connect to the block volumes. 

### Ubuntu

**Verify iSCSI is configured**

If iSCSI is already installed on your host,check that initiator name is configured and iSCSI service is running using the following commands.

```
sudo cat /etc/iscsi/initiatorname.iscsi
sudo service open-iscsi status
```

**Install iSCSI**

If iSCSI is not installed on your host, install open-iscsi package by following below commands.

```
sudo apt-get update
sudo apt-get install open-iscsi
sudo service open-iscsi restart
```

### RHEL

**Verify iSCSI is configured**

In Red Hat Enterprise Linux 7, the iSCSI service is lazily started by default: the service starts after running the `iscsiadm` command. If iSCSI is already installed on the host,check that initiator name is configured  using the following command. 

```
 cat /etc/iscsi/initiatorname.iscsi
```

Check iSCSI service is running using the following command.

```
 systemctl status iscsid
```

If status is showing as `Inactive`, then you may have to enable and start the iscsid service using the following command.

```
sudo systemctl enable iscsid && sudo systemctl start iscsid
```

**Install iSCSI** 

If iSCSI is not installed on your host, install iSCSI services using the following command.

```
yum install iscsi-initiator-utils -y
```

### CentOS

**Verify iSCSI is configured**

If iSCSI is already installed on your host, check that initiator name is configured using the following commands.

```
 cat /etc/iscsi/initiatorname.iscsi
```

Check iSCSI service is running using the following command.

```
 systemctl status iscsid
```

If status is showing as `Inactive`, then you may have to enable and start the iscsid service using the following command.

```
sudo systemctl enable iscsid && sudo systemctl start iscsid
```

**Install iSCSI**

If iSCSI is not installed on your host, install open iscsi-initiator-utils RPM package by following the below commands.

```
yum install iscsi-initiator-utils -y
```

You can verify the iSCSI installation from above section.

## Kubernetes services on Cloud

### EKS

EKS clusters can be brought up with either an AmazonLinux AMI or an Ubuntu 18.04 AMI.

**For clusters running with the AmazonLinux AMI** 

**Verify iSCSI is configured**

If iSCSI is already installed on your host, check that initiator name is configured using the following commands.

```
 cat /etc/iscsi/initiatorname.iscsi
```

Check iSCSI service is running using the following command.

```
 systemctl status iscsid
```

If status is showing as `Inactive`, then you may have to enable and start the iscsid service using the following command.

```
sudo systemctl enable iscsid && sudo systemctl start iscsid
```

**Install iSCSI**

If iSCSI is not installed on your host, install open iscsi-initiator-utils RPM package by following the below commands.

```
yum install iscsi-initiator-utils -y
```

You can verify the iSCSI installation from above section.

**For clusters running with the Ubuntu 18.04 AMI**

This can be checked from [here](/docs/next/iscsiclient.html#ubuntu).

### GKE

GKE COS (Container Optimized OS) does not come with iSCSI client and does not allow to install iSCSI client. Hence, OpenEBS does not work on K8S clusters which are running COS version of the image on the worker nodes.

Select Ubuntu as the image version for the node pools in the custom settings. For setting up iSCSI clients on Ubuntu nodes, see the [instructions above](/docs/next/iscsiclient.html#install-iscsi-client)

### AKS

On Azure you need to verify the open-iscsi packages are installed and running the service on the kubelet. This can be checked by  connecting to the nodes through SSH using public IP addresses by running the following command.

```
ssh azureuser@40.xx.yyy.zzz
```

**Note**: azureuser is a default username.

**Verify iSCSI is configured**

Obtain the container ID of the hyperkube kubelet on each node by running the following command.

```
sudo docker ps | grep "hyperkube kubelet" 
```

Following is the example output

```
3aab0f9a48e2    k8s-gcrio.azureedge.net/hyperkube-amd64:v1.8.7   "/hyperkube kubele..."   48 minutes ago      Up 48 minutes                           eager_einstein
```

Once kubelet conatiner ID is obtained, you need to get the shell of this container using the following command.   

```
sudo docker exec -it <container ID> bash
```

Example:

```
sudo docker exec -it 3aab0f9a48e2 bash
```

Check the status of iSCSI service by running the following command.

```
service open-iscsi status
```

**Install iSCSI**

You have to get the kubelet container ID using the steps mentioned in the above section. Once kubelet conatiner ID is obtained, you need to get the shell of this container using the following command.   

```
sudo docker exec -it <container ID> bash
```

Example:

```
sudo docker exec -it 3aab0f9a48e2 bash
```

Run the following commands to install and configure iSCSI in the kubelet.

```
apt-get update
apt install -y open-iscsi
exit
```

You can verify the iSCSI installation from above section.

## On-Prem Kubernetes solutions

### OpenShift

### Rancher

OpenEBS can be installed using Rancher on 2 different Operating System.

1. On Ubuntu/Debian
2. On RHEL

OpenEBS target will use the iscsi services inside the kubelet. It is recommended to remove iscsi from Node if it present on Node also.

#### On Ubuntu

**Verify iSCSI status on Node and Kubelet?**

Check the below commands on all worker nodes.

```
docker exec kubelet iscsiadm -V
```

If output of above command return similar to below , then iSCSI is installed on Kubelet. 

```
iscsiadm version 2.0–874
```

Check the below commands on all worker nodes.

```
iscsiadm -V
```

If output of above command return similar to below , then iSCSI is installed on Node. 

```
iscsiadm version 2.0–873
```

If output is similar to above, then you can remove the iSCSI from Node using the following command.

```
service iscsid stop
sudo apt remove open-iscsi
```

**Load iscsi_tcp module:**

The above step may remove the `iscsi_tcp` probe and hence after a reboot, then the node will not start the `iscsi_tcp` service and OpenEBS volume mount will fail. Check the same from the command below.

```
lsmod | grep iscsi
```

Sample Output:

```
iscsi_tcp 20480 0
libiscsi_tcp 24576 1 iscsi_tcp
libiscsi 53248 2 libiscsi_tcp,iscsi_tcp
scsi_transport_iscsi 98304 2 libiscsi,iscsi_tcp
```

If your output is similar to the above sample output then you are good to go. If your output doesn’t have `iscsi_tcp` , you need to follow below steps to load the `iscsi_tcp` module.

```
modprobe iscsi_tcp
```

You can verify the same from the command below. Now the output should be similar to the sample output mentioned above

```
lsmod | grep iscsi
```

**Persist iscsi_tcp module to load after reboot**

You can also make the kernel to load `iscsi_tcp` automatically every time the node reboots by appending the line `iscsi_tcp` in `/etc/ modules`.

Example:

```
# /etc/modules: kernel modules to load at boot time.
#
# This file contains the names of kernel modules that should be loaded
# at boot time, one per line. Lines beginning with “#” are ignored.
iscsi_tcp
```

#### On RHEL

**Verify iSCSI is configured**

 If iSCSI is already installed on the host,check that initiator name is configured  using the following command. 

```
 cat /etc/iscsi/initiatorname.iscsi
```

Check iSCSI service is running using the following command.

```
 systemctl status iscsid
```

If status is showing as `Inactive`, then you may have to *enable* and *start* the `iscsid` service using the following command.

```
sudo systemctl enable iscsid && sudo systemctl start iscsid
```

**Install iSCSI**

If iSCSI is not installed on your host, then configure iscsi initiator on each node using the following command. 

```
yum install iscsi-initiator-utils -y
```

The installation of iSCSI initiator doesn't install `iscsi_tcp` driver. This can be installed on all worker nodes using the following command.

```
modprobe iscsi_tcp
```

You can verify the `iscsi_tcp` status on the Node using the following command

```
lsmod |grep iscsi
```

Output of above command will be similar to the following

```
iscsi_tcp 20480 0
libiscsi_tcp 28672 1
iscsi_tcp libiscsi 57344 2 libiscsi_tcp,iscsi_tcp 
scsi_transport_iscsi 110592 4 libiscsi_tcp,iscsi_tcp,libiscsi
```

Create new custom cluster in rancher and apply bind mounts to kubelet container spec:

```
kubelet: 
  extra_binds: 
    - "/etc/iscsi:/etc/iscsi"
    - "/sbin/iscsiadm:/sbin/iscsiadm"
    - "/var/lib/iscsi:/var/lib/iscsi"
    - "/lib/modules"
```

### ICP



<br>



## See Also:

### [OpenEBS Installation](/docs/next/installation.html)

### [OpenEBS Architecture](/docs/next/architecture.html)



<br>

<hr>

<br>



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