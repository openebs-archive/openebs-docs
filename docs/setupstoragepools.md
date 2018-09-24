---
id: setupstoragepools
title: OpenEBS Storage Pools
sidebar_label: Storage Pools
---

------

## Storage Pools

Storage pools are capacity aggregated from disparate physical storage resources in a shared storage environment. Storage pools can be configured in varying sizes and provide a number of benefits, including performance, management, and data protection improvements.

Pools can be provisioned to include any amount of capacity and use any combination of physical storage space in a storage area network (SAN).

Using the custom resource feature of Kubernetes you can mount an external disk from any SAN, GPT, or DAS and create a volume on top of the external disk.

## Creating and Attaching a Disk on GKE Node

To create a GPD on a GKE cluster run the following command on master node. In the following commnad disk1 is the name of the disk. You can also mention the size.

```
gcloud compute disks create disk1 --size 100GB --type pd-standard  --zone us-central1-a
```
Attach the disk to the node. Use the following command to attach the disk to a particular node. Replace `<Node Name>` with your actual node name. Here disk1 is the name of the disk created earlier.

```
gcloud compute instances attach-disk <Node Name> --disk disk1 --zone us-central1-a
```

## Configuring a Storage Pool on OpenEBS

To utilize an external disk, you must create a storage pool on the node where you have attached the disk. Use the following command to login to the node from master. Replace `< Node Name>` with your actual node nmae and `< Zone Of Your Node >` with the actual zone.

```
gcloud compute ssh < Node Name > --zone=< Zone Of Your Node >
```

To create a storage pool you must first mount the external disk to all required nodes in the cluster.

```
sudo mkdir /mnt/openebs_disk
```

Verify the name and size of the disk using the following command.

```
sudo lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINT,LABEL
```

Once you have verified the same, format the newly mounted disk. Use the following command to format the disk.

```
sudo mkfs.ext4 /dev/<device-name>
```

**Example:**

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

**Note:** Change the path with your mounted path if it is not your default mount path. Also, remember your pool name. In this example, the pool name is *test-mntdir*. 

## Scheduling a Pool on a Node

If you want to schedule your pool on a particular node please follow [this](https://docs.openebs.io/docs/next/scheduler.html) procedure before applying the *openebs-operator.yaml* file. Please refer [installation](/docs/next/installation.html#install-openebs-using-kubectl) to deploy OpenEBS cluster in your k8s environment which will create a default storage pool on the host path.Jiva volumes will be deployed inside this path only.

For example, if you want to run a Percona application in this storage pool, you must create a storage class yaml called as *openebs-storageclasses.yaml* by adding the storage pool name in the *openebs-percona* storage class as Percona application is used in the example. 

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-percona
  annotations:
    cas.openebs.io/config: |
      - name: ControllerImage
        value: openebs/jiva:0.7.0
      - name: ReplicaImage
        value: openebs/jiva:0.7.0
      - name: VolumeMonitorImage
        value: openebs/m-exporter:0.7.0
      - name: ReplicaCount
        value: "3"
      - name: StoragePool
        value: test-mntdir
```

Run the following commands.

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.7.0.yaml
kubectl apply -f openebs-storageclasses.yaml
```

You must mention the storage class name in the *application.yaml* file. For example, *demo-percona-mysql-pvc.yaml* file for the percona application. Run the application using the following command.

```
cd demo/percona
kubectl apply -f demo-percona-mysql-pvc.yaml
```

The Percona application now runs inside the `test-mntdir` storage pool.

Similarly, you can create a storage pool for different applications as per requirement.

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
