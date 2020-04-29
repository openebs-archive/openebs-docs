---
id: prerequisites
title: Prerequisites (iSCSI client)
sidebar_label: Prerequisites
---
------

<br>

<a href="/docs/next/installation.html"><img src="/docs/assets/svg/0-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%"></a>

<br>

OpenEBS provides block volume support through the iSCSI protocol. Therefore,
the iSCSI client (initiator) presence on all Kubernetes nodes is required.
Choose the platform below to find the steps to verify if the iSCSI client
is installed and running or to find the steps to install the iSCSI client.
<br>

<font size="5">Choose the platform for iSCSI client settings</font>

<div class="divrow">
    <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#ubuntu"><img src="/docs/assets/l-ubuntu.png" width="50px;">Ubuntu</a>
    </div>
    <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#rhel"><img src="/docs/assets/l-rhel.png" width="50px;">RHEL</a>
    </div>
    <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#centos"><img src="/docs/assets/l-centos.png" width="50px;">CentOS</a>
    </div>
</div>

<div class="divrow">
    <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#eks"><img src="/docs/assets/l-eks.png" width="50px;">EKS</a>
    </div>
    <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#gke"><img src="/docs/assets/l-gke.png" width="50px;">GKE</a>
    </div>
    <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#aks"><img src="/docs/assets/l-aks.png" width="50px;">AKS</a>
    </div>
</div>

<div class="divrow">
    <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#openshift"><img src="/docs/assets/l-openshift.png" width="50px;">OpenShift</a>
    </div>
    <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#rancher"><img src="/docs/assets/l-rancher.png" width="50px;">Rancher</a>
    </div>
    <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#icp"><img src="/docs/assets/l-icp.png" width="50px;">ICP</a>
    </div>
      <div class="divcol">
        <a href="/v120/docs/next/prerequisites.html#do"><img src="/docs/assets/DigitalOceanLogo.png" width="45px;">&nbsp;DigitalOcean</a>
    </div>
</div>


[Provide feedback](https://github.com/openebs/openebs-docs/edit/staging/docs/quickstart.md) if a platform is missing in the above list.

## Linux platforms

Installation of the iSCSI initiator service and tools depends on your
host O/S or the kubelet container. You can follow the below steps for
installation/verification of the required packages. It is a mandatory
step to verify the iSCSI services and make sure that it is running on
all the worker nodes. OpenEBS uses the iSCSI protocol to connect to the
block volumes. 



<h3><a class="anchor" aria-hidden="true" id="ubuntu"></a>Ubuntu</h3>
**Verify iSCSI services are configured**

If an iSCSI initiator is already installed on your node, check that the
initiator name is configured and iSCSI service is running using the
following commands.

```
sudo cat /etc/iscsi/initiatorname.iscsi
systemctl status iscsid 
```

If service status is showing as `Inactive`, then you may have to enable and
start the iscsid service using the following command.

```
sudo systemctl enable iscsid && sudo systemctl start iscsid
```

The following is the expected output.

```
systemctl status iscsid
● iscsid.service - iSCSI initiator daemon (iscsid)
   Loaded: loaded (/lib/systemd/system/iscsid.service; disabled; vendor preset: enabled)
   Active: active (running) since Mon 2019-02-18 11:00:07 UTC; 1min 51s ago
     Docs: man:iscsid(8)
  Process: 11185 ExecStart=/sbin/iscsid (code=exited, status=0/SUCCESS)
  Process: 11170 ExecStartPre=/lib/open-iscsi/startup-checks.sh (code=exited, status=0/SUCCESS)
 Main PID: 11187 (iscsid)
    Tasks: 2 (limit: 4915)
   CGroup: /system.slice/iscsid.service
           ├─11186 /sbin/iscsid
           └─11187 /sbin/iscsid
```



**Install the iSCSI tools**

If an iSCSI initiator is not installed on your node, install
`open-iscsi` packages using the following commands.

```
sudo apt-get update
sudo apt-get install open-iscsi
sudo service open-iscsi restart
```

You can verify the iSCSI installation from above section.

<br> 

<h3><a class="anchor" aria-hidden="true" id="rhel"></a>Red Hat Enterprise Linux</h3>
**Verify iSCSI services are configured**

In Red Hat Enterprise Linux 7, the iSCSI service is lazily started by
default: the service starts after running the `iscsiadm` command. If
an iSCSI initiator is already installed on the node, check that
the initiator name is configured using the following command. 

```
 cat /etc/iscsi/initiatorname.iscsi
```

Check iSCSI service is running using the following command.

```
 systemctl status iscsid
```

If the status is showing as `Inactive`, then you may have to enable and
start the iscsid service using the following command.

```
sudo systemctl enable iscsid && sudo systemctl start iscsid
```

The following is the expected output. 

```
systemctl status iscsid
● iscsid.service - Open-iSCSI
   Loaded: loaded (/usr/lib/systemd/system/iscsid.service; enabled; vendor preset: disabled)
   Active: active (running) since Tue 2019-02-19 12:19:08 IST; 2h 37min ago
     Docs: man:iscsid(8)
           man:iscsiadm(8)
 Main PID: 2138 (iscsid)
    Tasks: 2
   CGroup: /system.slice/iscsid.service
           ├─2137 /usr/sbin/iscsid
           └─2138 /usr/sbin/iscsid

Feb 19 12:19:08 master-1550555590.mayalab.com systemd[1]: Starting Open-iSCSI...
Feb 19 12:19:08 master-1550555590.mayalab.com iscsid[2136]: iSCSI logger with pid=2137 started!
Feb 19 12:19:08 master-1550555590.mayalab.com systemd[1]: Failed to read PID from file /var/run/iscsid.pid: Invalid argument
Feb 19 12:19:08 master-1550555590.mayalab.com systemd[1]: Started Open-iSCSI.
Feb 19 12:19:09 master-1550555590.mayalab.com iscsid[2137]: iSCSI daemon with pid=2138 started!
```



**Install the iSCSI tools** 

If an iSCSI initiator is not installed on your node, install
`iscsi-initiator-utils` packages using the following command.

```
yum install iscsi-initiator-utils -y
```

You can verify the iSCSI installation from above section.

<br>

<h3><a class="anchor" aria-hidden="true" id="centos"></a>CentOS</h3>
**Verify iSCSI services are configured**

If an iSCSI initiator is already installed on your node, check that
the initiator name is configured using the following commands.

```
 cat /etc/iscsi/initiatorname.iscsi
```

Check iSCSI service is running using the following command.

```
 systemctl status iscsid
```

If the status is showing as `Inactive`, then you may have to enable and
start the iscsid service using the following command.

```
sudo systemctl enable iscsid && sudo systemctl start iscsid
```



**Install the iSCSI tools**

If an iSCSI initiator is not installed on your node, install
`iscsi-initiator-utils` packages using the following command.

```
yum install iscsi-initiator-utils -y
```

You can verify the iSCSI installation from the above section.

<br>

<hr>

## Managed Kubernetes Services on Public Cloud



<h3><a class="anchor" aria-hidden="true" id="eks"></a>Amazon Elastic
Container Service for Kubernetes (EKS)</h3>
Amazon EKS clusters can be brought up with either an AmazonLinux AMI
or an Ubuntu 18.04 AMI.

<h4><a class="anchor" aria-hidden="true" id="eks-linux-ami"></a>For clusters running with the AmazonLinux AMI</h4>
**Verify iSCSI services are configured**

If an iSCSI initiator is already installed on your node, check that
the initiator name is configured using the following commands.

```
 cat /etc/iscsi/initiatorname.iscsi
```

Check the iSCSI service is running using the following command.

```
 systemctl status iscsid
```

If the status is showing as `Inactive`, then you may have to enable and
start the iscsid service using the following command.

```
sudo systemctl enable iscsid && sudo systemctl start iscsid
```



**Install the iSCSI tools**

If an iSCSI initiator is not installed on your node, install
`iscsi-initiator-utils` packages using the following command.

```
yum install iscsi-initiator-utils -y
```

You can verify the iSCSI installation from the above section.



<h4><a class="anchor" aria-hidden="true" id="eks-linux-ami"></a>For clusters running with the Ubuntu 18.04 AMI</h4>
For setting up iSCSI clients on Ubuntu nodes, see the
instructions [here.](#ubuntu)

<br>

<h3><a class="anchor" aria-hidden="true" id="gke"></a>Google Kubernetes
Engine (GKE)</h3>

GKE Container-Optimized OS does not come with an iSCSI client preinstalled and does not allow installation of an iSCSI client. Therefore, OpenEBS does not work on Kubernetes clusters which are running GKE Container-Optimized OS version of the image on the worker nodes.

Select Ubuntu as the image version for the node pools in the custom settings. For setting up iSCSI clients on Ubuntu nodes, see the instructions [here.](#ubuntu)

<br>

<h3><a class="anchor" aria-hidden="true" id="aks"></a>Azure Kubernetes Service (AKS)</h3>
On Azure Kubernetes Service you need to verify that the `open-iscsi`
packages are installed and running the service on the kubelet.
This can be checked by connecting to the nodes through SSH using the
public IP addresses by running the following command.

```
ssh azureuser@40.xx.yyy.zzz
```

**Note**: `azureuser` is a default username.



**Verify iSCSI services are configured**

Obtain the container ID of the hyperkube kubelet on each node
using the following command.

```
sudo docker ps | grep "hyperkube kubelet" 
```

Following is the example output:

```
3aab0f9a48e2    k8s-gcrio.azureedge.net/hyperkube-amd64:v1.8.7   "/hyperkube kubele..."   48 minutes ago      Up 48 minutes                           eager_einstein
```

Once kubelet container ID is obtained, you need to get to the shell
of this container using the following command.   

```
sudo docker exec -it <container ID> bash
```

Example:

```
sudo docker exec -it 3aab0f9a48e2 bash
```

Check the status of the iSCSI service by using the following command.

```
service open-iscsi status
```



**Install the iSCSI tools**

You have to get the kubelet container ID using the steps mentioned in
the above section. Once kubelet container ID is obtained, you need to
get to the shell of this container using the following command.   

```
sudo docker exec -it <container ID> bash
```

Example:

```
sudo docker exec -it 3aab0f9a48e2 bash
```

Run the following commands to install and configure iSCSI service
in the kubelet.

```
apt-get update
apt install -y open-iscsi
exit
```

You can verify the iSCSI installation from the above section.
<br>
<br>
<h3><a class="anchor" aria-hidden="true" id="do"></a>DigitalOcean</h3>
<br>

**Add extra_binds in Kubelet Service**

 Add the following lines (volume mounts) to the file <code>/etc/systemd/system/kubelet.service</code> on each of the nodes:<br>
 ```
 -v /sbin/iscsiadm:/usr/bin/iscsiadm \
 -v /lib/x86_64-linux-gnu/libisns-nocrypto.so.0:/lib/x86_64-linux-gnu/libisns-nocrypto.so.0 \
 ```
So, the updated Kubelet Service File is as below:

```
[Unit]
Description=Kubernetes Kubelet Server
Documentation=https://kubernetes.io/docs/concepts/overview/components/#kubelet
After=docker.service sys-fs-bpf.mount
Requires=docker.service sys-fs-bpf.mount
[Service]
OOMScoreAdjust=-999
ExecStartPre=/bin/mkdir -p /var/lib/kubelet
ExecStartPre=/bin/mount — bind /var/lib/kubelet /var/lib/kubelet
ExecStartPre=/bin/mount — make-shared /var/lib/kubelet
ExecStart=/usr/bin/docker run — rm — net=host — pid=host — privileged — name kubelet \
-v /dev:/dev \
-v /sys:/sys \
-v /var:/var \
-v /var/lib/kubelet:/var/lib/kubelet:shared \
-v /etc:/etc \
-v /run:/run \
-v /opt:/opt \
-v /sbin/iscsiadm:/usr/bin/iscsiadm \
-v /lib/x86_64-linux-gnu/libisns-nocrypto.so.0:/lib/x86_64-linux-gnu/libisns-nocrypto.so.0 \
gcr.io/google-containers/hyperkube:v1.15.3 \
/hyperkube kubelet \
— config=/etc/kubernetes/kubelet.conf \
— feature-gates=”RuntimeClass=false” \
— logtostderr=true \
— image-pull-progress-deadline=2m \
— kubeconfig=/etc/kubernetes/kubelet.kubeconfig \
— bootstrap-kubeconfig=/etc/kubernetes/bootstrap.kubeconfig \
— rotate-certificates \
— register-node=true \
— node-labels=”doks.digitalocean.com/node-id=32559d91-cc04–4aac-bdc4–0566fa066802,doks.digitalocean.com/node-pool-id=d5714f37–627d-435a-b1c7-f0373ecd7593,doks.digitalocean.com/node-pool=pool-nuyzam6e8,doks.digitalocean.com/version=1.15.3-do.2" \
— root-dir=/var/lib/kubelet \
— v=2 \
— cloud-provider=external \
— network-plugin=cni \
— provider-id=”digitalocean://160254521"
Restart=on-failure
RestartSec=5
KillMode=process
[Install]
WantedBy=multi-user.target
```

 Next, you need to restart the Kubelet Service on each node using the following commands
```
systemctl daemon-reload
service kubelet restart
```
<br>

<hr>

## Kubernetes On-Prem Solutions



<h3><a class="anchor" aria-hidden="true" id="openshift"></a>Red Hat OpenShift</h3>
OpenEBS can be installed using Openshift on the following Operating
Systems. Tested OpenShift versions are 3.9 and 3.10.

1. On RHEL 7
2. On CentOS 7



<h4><a class="anchor" aria-hidden="true" id="On-RHEL"></a>On RHEL</h4>
Latest tested RHEL versions are 7.5, 7.6.

For setting up iSCSI clients on RHEL nodes, see the instructions [here](#rhel).



<h4><a class="anchor" aria-hidden="true" id="On-Centos"></a>On CentOS</h4>
Latest tested CentOS version is CentOS 7.

For setting up iSCSI clients on CentOS nodes, see the instructions [here](#centos).

<br>

<h3><a class="anchor" aria-hidden="true" id="rancher"></a>Rancher</h3>
- If you are using RancherOS as the operating system, you need to enable the iSCSI service and start it on all the worker nodes. 
- If you are using Ubuntu or RHEL as the operating system, you need to 
  - Verify if iSCSI initiators are installed on all nodes (and )
  - Add the `extra_binds` under Kubelet service  in cluster YAML file to  mount the iSCSI binary and configuration inside the `kubelet`.



<h4><a class="anchor" aria-hidden="true" id="rancher"></a>iSCSI services On RancherOS</h4>
To run iSCSI services, execute the following commands on each of the cluster hosts or nodes.

```
sudo ros s enable open-iscsi
sudo ros s up open-iscsi
```

Run the below commands on all the nodes to make sure the below directories are persistent, by default these directories are ephemeral.

```
ros config set rancher.services.user-volumes.volumes  [/home:/home,/opt:/opt,/var/lib/kubelet:/var/lib/kubelet,/etc/kubernetes:/etc/kubernetes,/var/openebs]
system-docker rm all-volumes
reboot
```






<h4><a class="anchor" aria-hidden="true" id="rancher-ubuntu-centos"></a>iSCSI services on RHEL or Ubuntu 16.04</h4>
**Step1:** Verify iSCSI initiator is installed and services are running

| Operating system      | iSCSI Package         | Commands                                                     |
| --------------------- | --------------------- | ------------------------------------------------------------ |
| RHEL / CentOS         | iscsi-initiator-utils | yum install iscsi-initiator-utils -y <br />sudo systemctl enable iscsid && sudo systemctl start iscsid<br />modprobe iscsi_tcp<br />echo iscsi_tcp >/etc/modules-load.d/iscsi-tcp.conf |
| Ubuntu 16.04 / Debian | open-iscsi            | sudo apt install open-iscsi<br />sudo systemctl enable iscsid && sudo systemctl start iscsid<br />modprobe iscsi_tcp<br />echo iscsi_tcp >/etc/modules-load.d/iscsi-tcp.conf |



**Step2:** Add extra_binds under kubelet service in cluster YAML

After installing the initiator tool on your nodes, edit the YAML for your cluster, editing the kubelet configuration to mount the iSCSI binary and configuration, as shown in the sample below. 

    services:
      	kubelet: 
          extra_binds: 
        	- "/etc/iscsi:/etc/iscsi"
        	- "/sbin/iscsiadm:/sbin/iscsiadm"
        	- "/var/lib/iscsi:/var/lib/iscsi"
        	- "/lib/modules"



<h4><a class="anchor" aria-hidden="true" id="rancher-ubuntu-18.04"></a>iSCSI services on Ubuntu 18.04 or CentOS 7.6</h4>
**Step1:** By default, iSCSI service is not present on worker node. It will be running inside the kubelet. To verify presence of iSCSI service inside kubelet, run the following command:

```
docker exec kubelet iscsiadm -V
```

Example Output:

```
iscsiadm version 2.0-874
```

The following commands will enable the `iscsi_tcp` module and it will persist this changes to the system.

| Operating system | iSCSI Package         | Commands                                                     |
| ---------------- | --------------------- | ------------------------------------------------------------ |
| Ubuntu 18.04     | open-iscsi            | modprobe iscsi_tcp <br />echo iscsi_tcp >/etc/modules-load.d/iscsi-tcp.conf |
| CentOS 7.6       | iscsi-initiator-utils | modprobe iscsi_tcp <br />echo iscsi_tcp >/etc/modules-load.d/iscsi-tcp.conf |

**Step 2:** If you are using Jiva or Local PV for provisioning OpenEBS volume,  Add `extra_binds` under kubelet service in cluster YAML. If the volume is using a mounted path on the host, then you must add the mounted path under `extra_binds` section. 

```
services:
  kubelet:
    extra_binds:
     - /var/openebs/local:/var/openebs/local
```

In the above snippet default hostpath, which will be created on the worker node using `LocalPV-hostpath` StorageClass, should be added under `extra_binds`. This configuration will help to create default hostpath directory on worker node for provisioning `LocalPV-hostpath` volume.

<br>

<h3><a class="anchor" aria-hidden="true" id="icp"></a>IBM Cloud
Private (ICP)</h3>


OpenEBS can be installed using ICP on the following Operating Systems. Latest tested ICP versions are 2.1.0.3 and 3.1.1.

1. On RHEL 7

2. On Ubuntu

   

<h4><a class="anchor" aria-hidden="true" id="On-RHEL"></a>On RHEL</h4>
Latest tested RHEL versions are 7.5, 7.6.

For setting up iSCSI clients on RHEL nodes, see the
instructions [here](#rhel).



<h4><a class="anchor" aria-hidden="true" id="On-Ubuntu"></a>On Ubuntu</h4>
Latest tested Ubuntu version are Ubuntu 16.04 LTS and 18.04 LTS.

For setting up iSCSI clients on Ubuntu nodes, see the
instructions [here](#ubuntu).

<br>


## See Also:

### [OpenEBS Installation](/v120/docs/next/installation.html)

### [OpenEBS Architecture](/v120/docs/next/architecture.html)



<br>

<hr>

<br>
