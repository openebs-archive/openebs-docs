---
id: setupstoragevolumes
title: Setting up Peristent Storage Volumes
sidebar_label: Storage Volumes
---

------

**Storage Volumes**

A Storage Class provides a way for administrators to describe the “classes” of storage they offer. Different classes may map to quality-of-service levels, backup policies, or to arbitrary policies determined by the cluster administrators. This concept is sometimes called “profiles” in other storage systems.

**Setting Up Storage Class On OpenEBS**

Once OpenEBS is installed on your Kubernetes cluster, you can start using it by specifying corresponding OpenEBS Storage Classes in your PVCs.

Apply the openebs-operator.yaml file on the Kubernetes cluster using the following command. This creates the maya api-server and OpenEBS provisioner deployments.

```
kubectl apply -f openebs-operator.yaml
```

Add the OpenEBS storage classes using the following command. This can be used by users to map a suitable storage profile for their applications in their respective persistent volume claims.

```
kubectl apply -f openebs-storageclasses.yaml
```

OpenEBS Storage provides several features that can be customized for each volume. Some of features that could be customized per application are as follows:

- Number of replications
- Zone or node affinity
- Snapshot scheduling
- Volume expansion policy
- Replication policy

OpenEBS comes with some pre-defined set of storage classes that can be readily used.

Go to the following link for the pre-defined storage classes.[openebs-storageclasses.yaml](https://github.com/openebs/openebs/blob/master/k8s/openebs-storageclasses.yaml)


It is also possible that a user can create a new custom storage class.

Defining a storage class supported by OpenEBS:

```
apiVersion: storage.k8s.io/v1
	kind: StorageClass 	#(Kind always should be StorageClass)
	metadata:
   	name: openebs-standalone 	#(Name of the StorageClass)
	provisioner: openebs.io/provisioner-iscsi
	parameters:
  	openebs.io/storage-pool: "default"
  	openebs.io/jiva-replica-count: "1" #(This value represents the  number of replicas of a StorageClass)
  	openebs.io/volume-monitor: "true"
  	openebs.io/capacity: 5G 	#(Capacity of the StorageClass)


```



By default, OpenEBS comes with ext4 file system. However, if you want to use xfs file system you can do so by adding the below entries in the openebs-storageclasses.yaml.

```
vi openebs/k8s/openebs-storageclasses.yaml
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
   name: openebs-mongodb
provisioner: openebs.io/provisioner-iscsi
parameters:
  openebs.io/storage-pool: "test-mntdir"
  openebs.io/jiva-replica-count: "1"
  openebs.io/volume-monitor: "true"
  openebs.io/capacity: 5G
  openebs.io/fstype: "xfs"
```

Note: Support for xfs file system has been introduced from 0.5.4 and onwards. In order to change the file system you must have 0.5.4 or latest build. You must add `openebs.io/fstype: "xfs"` in the openebs-storageclasses.yaml.

Follow the link below to understand how to deploy an application on the OpenEBS volume using xfs file system. Here, mongo-DB application is used as an example.

[deploy an application on the OpenEBS volume using xfs file system](https://github.com/openebs/openebs/issues/1446)

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
