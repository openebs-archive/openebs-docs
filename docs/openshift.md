---
id: openshift
title: Using OpenEBS on OpenShift
sidebar_label: OpenShift
---

------

This section helps you to install OpenEBS on OpenShift. If you are new to OpenShift, you can follow the links listed below.

* [How to setup Openshift](https://docs.openshift.com/enterprise/3.0/install_config/install/first_steps.html)

* [Quick Reference](https://github.com/openebs/openebs/blob/cfb97d2b407612ebdb8fd1eae48e28b6a3ad248f/k8s/openshift/byo/baremetal/README.md)

Once the OpenShift cluster is ready, you can proceed with installing OpenEBS packages. The procedure is slightly different when compared to other platforms. OpenShift uses commands that are not regular Kubernetes commands. 

To install OpenEBS in an OpenShift environment, you need to set role/permission and make a few changes to the commands mentioned in the *Installation* section. The following procedure allows you to setup OpenEBS.

1. Run the following command to create a new administrator user with *cluster-admin* role/permissions which can be used to run the OpenEBS operator and deploy applications.

```
oc adm policy add-cluster-role-to-user cluster-admin admin --as=system:admin
```

- (Optional) If the password is not set, assign the password to the administrator user using the following command.

```
htpasswd /etc/origin/htpasswd admin
```

- (Optional) If the admin login has timed out, login as administrator user and use the "default" project (administrator is logged into this project by default).

```
oc login -u admin
```

2. Provide access to the host-volumes (which are required by the OpenEBS volume replicas) by updating the default security context (scc) using the following command.

```
oc edit scc restricted
```

3. Add **allowHostDirVolumePlugin: true** and save changes.

Alternatively, you can use the following command.

```
oc adm policy add-scc-to-user hostaccess admin --as:system:admin
```

4. Allow the containers in the project to run as root using the following command.

  ```
  oc adm policy add-scc-to-user anyuid -z default --as=system:admin
  ```

**Note:** While the above procedure may be sufficient to enable host access to the containers, you may also need to do the following.

- Disable selinux (via `setenforce 0`) to ensure the same (disable on all OpenShift nodes).
- Edit the restricted scc to use `runAsUser: type: RunAsAny` (the replica pod runs with root user).

### Install OpenEBS

Download the latest OpenEBS operator files and sample application specifications on the OpenShift-Master machine using the following commands.

```
git clone https://github.com/openebs/openebs.git 
cd openebs/k8s
```

Apply the openebs-operator on the OpenShift cluster using the following commands.

```
oc apply -f openebs-operator.yaml 
oc apply -f openebs-storageclasses.yaml
```

Verify that the OpenEBS operator services are created successfully and deployments are running using the following commands. Also, check whether the storage classes are created successfully.

```
oc get deployments -n openebs
oc get sa -n openebs
oc get clusterrole openebs-maya-operator
oc get sc
```

### Deploy a sample application with OpenEBS storage.

Use OpenEBS as persistent storage for a Percona deployment by selecting the openebs-percona storageclass in the persistent volume claim. A sample is available in the openebs git repository (which was cloned in the previous steps).

Apply the following Percona deployment yaml using the following commands.

```
cd demo/percona 
oc apply -f demo-percona-mysql-pvc.yaml
```

Verify that the deployment runs successfully using the following commands.

```
oc get pods
```



### Using OpenEBS on Containerized OpenShift 

This section helps you to install OpenEBS on containerized OpenShift. If you are new to OpenShift, you can follow the links listed below.

* [How to setup Containerized Openshift](https://access.redhat.com/documentation/en-us/openshift_container_platform/3.9/html-single/getting_started/#developers-console-before-you-begin)

* [Quick Reference](https://github.com/prabhatkumarthakur/openebs/blob/patch-3/k8s/openshift/byo/baremetal/containerized_openshift_readme.md)

Once the conatinerized OpenShift cluster is ready.you need to run the commands mentioned in the above section.

Before Installing OpenEBS You need to have Node_Selectors label set for the nodes that you want to use for compute. i.e. oc edit <node name> and insert this label **node-role.kubernetes.io/compute: "true"**. That will schedule your pods.

Now you can proceed with the installation of OpenEBS by following the steps mentioned in above section.


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
