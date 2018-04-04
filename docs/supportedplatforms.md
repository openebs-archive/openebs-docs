---
id: supportedplatforms
title: OpenEBS supported platforms
sidebar_label: Platforms
---

------

OpenEBS is tested on the following platforms

[Native Kubernetes](#NativeK8s) (Versions 1.7.5+, 1.8, 1.9, 1.10, 1.11)

MiniKube (Versions )

GKE (Kubernetes versions 1.7.x , 1.8.x,)

Azure (Kubernetes versions)

AWS (Kubernetes built using EC2)

IBM Cloud Private (Versions 1.2.0, 2.1.0, 2.1.0.1, 2.1.0.2) 

RedHat OpenShift (Versions 3.5, 3.6, 3.8)

RedHat MiniShift (Versions )



<a name="NativeK8s"></a>

<a name="MiniKube"></a>

## Native Kubernetes and MiniKube

As a prerequisite, OpenEBS requires CRD capabilities of Kubernetes and hence Kubernetes versions 1.7.5+ are suitable. 

OpenEBS is tested on versions 1.7.5+, 1.8, 1.9, 1.10 and 1.11.

Similarly, MiniKube versions that are tested for OpenEBS are x.y, x.y

Another prerequisite is open-iSCSI packages should be installed and configured. For installing open-iscsi on Ubuntu, CentOS and CoreOS, refer to the [prerequisites section](/docs/prerequisites.html#iSCSIConfig) 

<a name="GKE"></a>

## GKE

GKE with Kubernetes versions 1.8 onwards are supported. While creating the cluster, make sure you choose Ubuntu 16.4 or above, which comes with open-iscsi installed and configured.

<<TODO: Add a screenshot of the cluster config where the linux image is chosen on GKE>>

Note: COS image does not come with the open-iscsi package and also installing new packages on cos based hosts is not allowed on GKE. Hence, OpenEBS will not work on GKE with hosts based on COS image.

<a name="Azure"></a>

## Azure Cloud

On Azure, kubelet runs inside a container and open-iscsi packages are not available by default on Azure. Refer to the instructions to install and configure [open-iscsi on Azure](/docs/prerequisites.html#Azure)

<a name="OpenShift"></a>

## IBM Cloud Private

<<Write the IBM Cloud Private specs, add a screenshot>>

## RedHat OpenShift and RedHat MiniShift

Installation of OpenEBS packages would be slightly different from other platforms as OpenShift uses different commands than regular Kubernetes commands. 

To install OpenEBS in OpenShift environment you need to set role/permission and few change in the commands as mentioned in Install section. You can follow the below procedure to setup OpenEBS.

- Execute the following command to create a new administrator user with cluster-admin role/permissions which can be used to run the OpenEBS operator and deploy applications.

```
oc adm policy add-cluster-role-to-user cluster-admin admin --as=system:admin
```

- Assign password to the administrator user using the following command.

```
htpasswd /etc/origin/htpasswd admin
```

- Login as administrator user and use the "default" project (administrator is logged into this project by default).

```
oc login -u admin
```

- Provide access to the host-volumes (which are needed by the OpenEBS volume replicas) by updating the default security context (scc) using the following command.

```
oc edit scc restricted
```

Add **allowHostDirVolumePlugin: true** and save changes.

Alternatively, you can use the following command.

```
oc adm policy add-scc-to-user hostaccess admin --as:system:admin
```

- Allow the containers in the project to run as root using the following command.

  ```
  oc adm policy add-scc-to-user anyuid -z default --as=system:admin
  ```

**Note:** While the above procedures may be sufficient to enable host access to the containers, you may also need to do the following.

- Disable selinux (via `setenforce 0`) to ensure the same.
- Edit the restricted scc to use `runAsUser: type: RunAsAny` (the replica pod runs with root user)

### Install OpenEBS

Download the latest OpenEBS operator files and sample application specifications on the OpenShift-Master machine using the following commands.

```
git clone <https://github.com/openebs/openebs.git> 
cd openebs/k8s
```

Apply the openebs-operator on the OpenShift cluster using the following commands.

```
oc apply -f openebs-operator 
oc apply -f openebs-storageclasses.yaml
```

Verify that the OpenEBS operator services are created successfully and deployments are running using the following commands. Also, check whether the storage classes are created successfully.

```
oc get deployments
oc get sa
oc get clusterrole openebs-maya-operator
oc get sc
```

### Deploy a sample application with OpenEBS storage.

- Use OpenEBS as persistent storage for a percona deployment by selecting the openebs-percona storageclass in the persistent volume claim. A sample is available in the openebs git repo (which was cloned in the previous steps).

Apply the following percona deployment yaml using the following commands.

```
cd demo/percona 
oc apply -f demo-percona-mysql-pvc.yaml
```

Verify that the deployment runs successfully using the following commands.

```
oc get pods
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
