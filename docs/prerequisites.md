---
id: prerequisites
title: Prerequisites for Installation
sidebar_label: Prerequisites
---

------

The following prerequisites are required for installing OpenEBS.

1. A Kubernetes cluster with version >= 1.9.7 (OpenEBS requires CRD feature of Kubernetes).

2. Open-iscsi package installed and configured on the Kubernetes cluster.

   **Note:** Do not install open-iscsi / iscsi-initiator-utils on host nodes if a kubelet container, for example, Rancher Container Engine (RKE) already has the package installed. See [Troubleshooting](https://staging-docs.openebs.io/docs/next/tsg_install.html#on-rancher-application-pods-are-not-running-when-openebs-volumes-are-provisioned) section for detailed information.

3. kubectl or helm installed and ready to use. Ensure that you run the `kubectl` commands with cluster admin context. The installation will involve creating a new Service Account that is assigned to OpenEBS components.
4. If you are using CentOS as base OS for 0.7 OpenEBS installation, then you must disable selinux for OpenEBS Node Disk Manager to detect the OS disk. You can disable selinux by using the `setenforce 0` command.

**Note:** 

* If you face issues while setting up on-premise clusters, check your BIOS mode and enable the Intel virtualization acceleration key  and AMD-V virtualization hardware extensions.
* Installing and configuring open-iscsi on Kubernetes will vary slightly depending on the platform and you can find those instructions [here](#iSCSIConfig). 

### Kubernetes Storage Concepts

To understand how to use OpenEBS with Kubernetes, you must familiarize yourself with the [Kubernetes Storage Concepts](https://kubernetes.io/docs/concepts/storage/persistent-volumes/), specifically the following.

- Persistent Volumes and Persistent Volume Claims
- Dynamic Volume Provisioner
- Storage Classes

<a name="iSCSIConfig"></a>

## Steps for Configuring and Verifying open-iscsi 

The open-iscsi initiator packages depend on your host operating system or kubelet container. Use the following procedure for installing/verifying open-iscsi package.

### GKE

With GKE, you must create a Kubernetes cluster with the host machine as Ubuntu.  Ubuntu host on GKE comes with iSCSI configured. 

You may need an admin-context if you are installing OpenEBS without helm. Use the following command to set the admin-context.

```
kubectl create clusterrolebinding <myclustername>-cluster-admin-binding --clusterrole=cluster-admin --user=<myusername>
```

### Ubuntu Host

If an iSCSI initiator is already installed on your host, check if the initiator name is configured and iSCSI service is running using the following commands.

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

### CentOS Host

If an iSCSI initiator is already installed on your host, check if the initiator name is configured and iSCSI service is running using the following commands.

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

You can verify the installation using the procedure mentioned above. 

<a name="Azure"></a>

### Azure Cloud

#### Configuring open-iscsi  

On Azure cloud, you need to verify if the open-iscsi package is installed on the kubelet. To validate, you can connect to the nodes through SSH using their public IP addresses by running the following command.

```
ssh azureuser@40.xx.yyy.221

```

**Note**: azureuser is the default username.

Obtain the container ID of the hyperkube kubelet on each node by running the following command.

```
sudo docker ps | grep "hyperkube kubele" 
3aab0f9a48e2    k8s-gcrio.azureedge.net/hyperkube-amd64:v1.8.7   "/hyperkube kubele..."   48 minutes ago      Up 48 minutes                           eager_einstein
```

Get to the kubelet container by running the following command and install open-iscsi package in each Kubernetes node.

```
sudo docker exec -it <Container ID> bash
# apt-get update
# apt install -y open-iscsi
```

Check the status of iSCSI service by running the following command inside the kubelet container.

```
service open-iscsi status
```

**Note:** If hyperkube kubelet is running as binary in the nodes, check for open-iscsi status in the node. If open-iscsi is not present, install open-iscsi using the following procedure.

```
# apt-get update
# apt install -y open-iscsi
```

#### Configuring RBAC

On Azure cloud, you must enable the cluster role binding by applying the following yaml.

```
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  creationTimestamp:null
  name: cluster-admin
  annotations:
   rbac.authorization.kubernetes.io/autoupdate: "true"
rules:
- apiGroups:
  - '*'
  resources:
  - '*'
  verbs:
  - '*'
- nonResourceURLs:
  - '*'
  verbs:
  - '*'
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

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
