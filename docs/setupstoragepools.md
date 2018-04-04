---
id: setupstoragepools
title: OpenEBS Storage Pools
sidebar_label: Storage Pools
---

------

**Storage Pool**

Storage pools are capacity aggregated from disparate physical storage resources in a shared storage environment. Storage pools can be configured in varying sizes and provide a number of benefits, including performance, management and data protection improvements.

Pools can be provisioned to include any amount of capacity and use any combination of physical storage space in a storage area network (SAN).

Using the custom resource feature of Kubernetes a user can mount a external disk from any SAN or GPT or DAS and create a volume on top of the external disk.

**Configuring A Storage Pool On OpenEBS:**

In order to utilize a external disk user should create a storage pool.

To create a storage pool user should first mount the external disk to the cluster.

```
sudo mkdir /mnt/openebs_disk
```

Verify the name and the size of the disk using the below command.

```
lsblk
```

Once user has verified the same do a format on the disk. Use the below command to format the disk.

```
sudo mkfs.ext4 -L datapartition /dev/sdb
```

Now mount the disk on your OpenEBS cluster.

```
sudo mount  /dev/sdb /mnt/openebs_disk
```

Once it is done make the below entries on openebs-operator.yaml .

```
vi openebs-operator.yaml
apiVersion: openebs.io/v1alpha1
kind: StoragePool
metadata:
	name: test-mntdir 			  #--Name of the storage pool
	type: hostdir
spec:
	path: "/mnt/openebs_disk"      #--Change the path with mounted path
```

Next the user has to add the below entries to the corresponding storage class. 

Here it is openebs-storageclasses.yaml .

For example here we have taken the Percona application.

```
vi openebs-storageclasses.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: openebs-percona
provisioner: openebs.io/provisioner-iscsi
parameters:
    openebs.io/jiva-replica-count: "2"
    openebs.io/capacity: "2G"
    openebs.io/jiva-replica-image: "openebs/jiva:0.5.0"
    openebs.io/storage-pool: "test-mntdir"  	#--Name of the storage pool
```

User should mention the storage class name in the application.yaml . E.g. demo-percona-mysql-pvc.yaml for the percona application. 

Now run the below commands 

```
kubectl apply -f openebs-operator.yaml
kubectl apply -f openebs-storageclasses.yaml
```

Running the application

```
cd demo/percona
kubectl apply -f demo-percona-mysql-pvc.yaml
```

Now the Percona application runs inside the `test-mntdir` storage pool.

Similarly user can create storage pool for different application as per requirement.













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
