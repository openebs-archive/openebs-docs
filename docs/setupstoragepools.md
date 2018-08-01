---
id: setupstoragepools
title: OpenEBS Storage Pools
sidebar_label: Storage Pools
---

------

**Storage Pool**

Storage pools are capacity aggregated from disparate physical storage resources in a shared storage environment. Storage pools can be configured in varying sizes and provide a number of benefits, including performance, management and data protection improvements.

Pools can be provisioned to include any amount of capacity and use any combination of physical storage space in a storage area network (SAN).

Using the custom resource feature of Kubernetes you can mount an external disk from any SAN or GPT or DAS and create a volume on top of the external disk.

**Configuring A Storage Pool On OpenEBS:**

In order to utilize a external disk you should create a storage pool. To create a storage pool you must first mount the external disk to the cluster.

```
sudo mkdir /mnt/openebs_disk
```

Verify the name and the size of the disk using the following command.

```
lsblk
```

Once you have verified the same, format the disk. Use the following command to format the disk.

```
sudo mkfs.ext4 /dev/sdb
```

Mount the disk on your OpenEBS cluster.

```
sudo mount /dev/sdb /mnt/openebs_disk
```

Add the following entries in the *openebs-operator.yaml* file. 

```
apiVersion: openebs.io/v1alpha1
kind: StoragePool
metadata:
	name: test-mntdir 			 
	type: hostdir
spec:
	path: "/mnt/openebs_disk"      
```

**Note:** Change path with your mounted path if it is not your default mount path. Also, remember your pool name. In this example, the pool name is *test-mntdir*.

You must add the following entries to the corresponding storage class. 

In this example, it is *openebs-storageclasses.yaml*.

In the following example, Percona application is used. Hence, you must add the storage pool name in the *openebs-percona* storage class.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: openebs-percona
provisioner: openebs.io/provisioner-iscsi
parameters:
    openebs.io/jiva-replica-count: "2"
    openebs.io/capacity: "2G"
    openebs.io/jiva-replica-image: "openebs/jiva:0.5.0"
    openebs.io/storage-pool: "test-mntdir"  
```

You must mention the storage class name in the *application.yaml* file. For example, demo-percona-mysql-pvc.yaml file for the percona application. 

Run the following commands.

```
kubectl apply -f openebs-operator.yaml
kubectl apply -f openebs-storageclasses.yaml
```

Running the application using the following command.

```
cd demo/percona
kubectl apply -f demo-percona-mysql-pvc.yaml
```
The Percona application now runs inside the `test-mntdir` storage pool.

Similarly you can create a storage pool for different applications as per requirement.













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
