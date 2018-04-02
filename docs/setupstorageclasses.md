---
id: setupstorageclasses
title: Setting up Storage Classes
sidebar_label: Storage Classes
---

------

**Storage Class**

A Storage Class provides a way for administrators to describe the “classes” of storage they offer. Different classes might map to quality-of-service levels, or to backup policies, or to arbitrary policies determined by the cluster administrators. This concept is sometimes called “profiles” in other storage systems.

**Setting Up Storage Class On OpenEBS**

Once OpenEBS is installed on your Kubernetes cluster, you can start using it by specifying corresponding OpenEBS Storage Classes in your PVCs.

Apply the openebs-operator.yaml file on the Kubernetes cluster. This creates the maya api-server and OpenEBS provisioner deployments.

		kubectl apply -f openebs-operator.yaml

Add the OpenEBS storage classes using the following command. This can be used by users to map a suitable storage profile for their applications in their respective persistent volume claims.

		kubectl apply -f openebs-storageclasses.yaml

OpenEBS Storage provides several features that can be customized for each volume. Some of features that could be customized per application are:

- Number of replications
- Zone or node affinity
- Snapshot scheduling
- Volume expansion policy
- Replication policy

OpenEBS comes with a set of storage classes that can be readily used.

Please visit the below link for the pre-defined storage classes.
https://github.com/openebs/openebs/blob/master/k8s/openebs-storageclasses.yaml


It is also possible that user can create a new custom storage classes.

Defining a storage classes supported by OpenEBS	

```
apiVersion: storage.k8s.io/v1
	kind: StorageClass 	(Kind always should be StorageClass)
	metadata:
   	name: openebs-standalone 	(Name of the StorageClass)
	provisioner: openebs.io/provisioner-iscsi
	parameters:
  	openebs.io/storage-pool: "default"
  	openebs.io/jiva-replica-count: "1" (This value represents the number of replica of the StorageClass)
  	openebs.io/volume-monitor: "true"
  	openebs.io/capacity: 5G 	(Capacity of the StorageClass)


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
