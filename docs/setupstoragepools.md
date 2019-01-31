---
id: setupstoragepools
title: OpenEBS Storage Pools
sidebar_label: Storage Pools
---

------

## Storage Pools

Storage pools are capacity aggregated from disparate physical storage resources in a shared storage environment. Storage pools can be configured in varying sizes and provide a number of benefits, including performance, management, and data protection improvements.

Pools can be provisioned to include any amount of capacity and use any combination of physical storage space in a storage area network (SAN).

Using the custom resource feature of Kubernetes you can mount an external disk from any SAN, GPT, or DAS and create a volume on top of the external disk/disks.

OpenEBS allows you to create storage pool using cStor and Jiva Storage Engines. Jiva will create Storage Pool on single external disk but cStor can create storage pool using multiple disks attached to a Node.

For both cStor and Jiva storage engine, disks mount status on the nodes are different. The more details are mentioned [here](/docs/next/faq.html#what-must-be-the-disk-mount-status-on-node-for-provisioning-openebs-volume).

## Creating and Attaching a Disk on GKE Node

To create a GPD on a GKE cluster run the following command on master node. In the following command disk1 is the name of the disk. You can also mention the size.

```
gcloud compute disks create disk1 --size 100GB --type pd-standard  --zone us-central1-a
```
Attach the disk to the node. Use the following command to attach the disk to a particular node. Replace `<Node Name>` with your actual node name. Here disk1 is the name of the disk created earlier.

```
gcloud compute instances attach-disk <Node Name> --disk disk1 --zone us-central1-a
```

## Configuring a Storage Pool on OpenEBS using Jiva

Using Jiva, you can create storage pool on hosted path or an external disk. You can add single external disk such as GPD,local disk,etc. to your Nodes as mentioned in the above [section](/docs/next/setupstoragepools.html#creating-and-attaching-a-disk-on-gke-node).
To utilize an external disk, you must create a storage pool on the node where you have attached the disk. Use the following command to login to the node from master. Replace `<Node Name>` with your actual node name and `<Zone Of Your Node>` with the actual zone.

```
gcloud compute ssh <Node Name> --zone=<Zone of Your Node>
```

To create a storage pool you must first mount the external disk to all required nodes in the cluster. You can create one folder where you can mount the external disk path. The folder can be created using the following command.

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

You can create a YAML file named *openebs-config.yaml* and add the following entries in the *openebs-config.yaml*file. 

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

Once you have modified the *openebs-config.yaml*, you can apply the file using the following command.

```
kubectl apply -f openebs-config.yaml
```

This will create the Jiva storage pool with name *test-mntdir*. You can get the status of storage pool using the following command.

```
kubectl get sp
```

## Scheduling a Jiva Storage Pool on a Node

You should verify if OpenEBS cluster has been deployed. You can verify the same from [here](/docs/next/installation.html). After that you can configure the Jiva Storage Pool on the Nodes as mentioned in the above [section](docs/next/setupstoragepools.html#configuring-a-storage-pool-on-openebs-using-jiva).  Once you have configured Storage pool, you can create a Storage Class by mentioning the corresponding **StoragePool** name in the annotation section. The following is an example Storage Class for deploying Percona application.

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-percona
  annotations:
    cas.openebs.io/config: |
      - name: ControllerImage
        value: openebs/jiva:0.8.0
      - name: ReplicaImage
        value: openebs/jiva:0.8.0
      - name: VolumeMonitorImage
        value: openebs/m-exporter:0.8.0
      - name: ReplicaCount
        value: "3"
      - name: StoragePool
        value: test-mntdir
```

You must mention the storage class name in the *application.yaml* file. For example, *demo-percona-mysql-pvc.yaml* file for the percona application.

```
---
apiVersion: v1
kind: Pod
metadata:
  name: percona
  labels:
    name: percona
spec:
  containers:
  - resources:
      limits:
        cpu: 0.5
    name: percona
    image: percona
    args:
      - "--ignore-db-dir"
      - "lost+found"
    env:
      - name: MYSQL_ROOT_PASSWORD
        value: k8sDem0
    ports:
      - containerPort: 3306
        name: percona
    volumeMounts:
    - mountPath: /var/lib/mysql
      name: demo-vol1
  volumes:
  - name: demo-vol1
    persistentVolumeClaim:
      claimName: demo-vol1-claim
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-percona
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
```

Run the application using the following command.

```
kubectl apply -f demo-percona-mysql-pvc.yaml
```

The Percona application now runs inside the `test-mntdir` storage pool.

Similarly, you can create a storage pool for different applications as per requirement.

## Configuring a Storage Pool on OpenEBS using cStor

cStor provides storage scalability along with ease of deployment and usage.cStor can handle multiple disks of same size per Node and create different storage pools. You can use these storage pools to create cStor volumes which you can utilize to run applications.

Additionally, you can add disks using the documentation available at [Kubernetes docs](https://cloud.google.com/compute/docs/disks/add-persistent-disk#create_disk).  You can use these disks for creating the OpenEBS cStor pool by combining all the disks per node. You can scale the storage pool by adding more disks to the instance and in turn to the storage pool.  [Node Disk Manager](/docs/next/architecture.html#cstor)(NDM) is handling the disks for creating cStor Storage pool. Currently NDM is excluding some of the device paths detected on Nodes to avoid from creating cStor Pools. You will get more information from [here](/docs/next/faq.html#what-are-different-device-paths-excluded-by-ndm).

Supported RAID type for creating storage pools are mentioned below.

- Mirrored (RAID 1)
- Striped (RAID 0) 

You can change the **poolType** either **striped** or **mirrored** in the sample YAML mentioned in the following sections for choosing the needed RAID method. 

You can create cStor pools on OpenEBS clusters once you have installed OpenEBS 0.8 version. Verify if the OpenEBS installation is complete. If not, go to [installation](/docs/next/installation.html). You can create storage pool manually or by creating auto pool configuration. 

### By Using Manual Method

In manual method, you can select the required disks and use it in the below sample YAML file which will create cStor pool using these selected disks. 

You can create a YAML file named *openebs-config.yaml* and add below contents to it for creating storage pool with striped manner. 

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
provisioner: openebs.io/provisioner-iscsi
---
#Use the following YAMLs to create a cStor Storage Pool.
# and associated storage class.
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  poolSpec:
    poolType: striped
  # NOTE - Appropriate disks need to be fetched using `kubectl get disks`
  #
  # `Disk` is a custom resource supported by OpenEBS with `node-disk-manager`
  # as the disk operator
# Replace the following with actual disk CRs from your cluster `kubectl get disks`
# Uncomment the below lines after updating the actual disk names.
  disks:
    diskList:
# Replace the following with actual disk CRs from your cluster from `kubectl get disks`
#       - disk-184d99015253054c48c4aa3f17d137b1
#       - disk-2f6bced7ba9b2be230ca5138fd0b07f1
#       - disk-806d3e77dd2e38f188fdaf9c46020bdc
#       - disk-8b6fb58d0c4e0ff3ed74a5183556424d
#       - disk-bad1863742ce905e67978d082a721d61
#       - disk-d172a48ad8b0fb536b9984609b7ee653
---
```
Edit *openebs-config.yaml* file to include disk details associated to each node in the cluster which you are using for creating the OpenEBS cStor Pool. Replace the disk names under *diskList* section, which you can get from running *kubectl get disks* command. Once it is modified, you can apply the YAML. This will create cStor Storage Pool on each Nodes.

For example, you have a 3 Node cluster. Each Node have 2 disks each. So if you select these disks in the above sample YAML, it will create a cStor Pool on each Node by using the disks attached to each Node.

### By Using Auto Method

In auto pool creation method, you don't have to select the disks and it will create a cStor pool using the disks detected by NDM. You can create a YAML file named *openebs-config.yaml* and add below contents to it and then apply the YAML for creating storage pool with striped manner.

```
---
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  maxPools: 3
  minPools: 3
  poolSpec:
    poolType: striped
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
provisioner: openebs.io/provisioner-iscsi
---
```

**Note:** You can specify maximum and minimum number of cStor pool in the above yaml file. If there is no *minPools* specified, it will create Single cStor pool by default. maxPool is the desired number of pools that should be created on nodes. Also make sure that , *maxPools* count should be equal or less than the total number of Nodes in the cluster.

#### **Limitations**:

1. For Striped pool, it will take only one disk per Node even Node have multiple disks.
2. For Mirrored pool, it will take only 2 disks attached per Node even Node have multiple disks.

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
