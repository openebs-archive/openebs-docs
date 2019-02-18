---
id: jivaguide
title: Jiva user guide
sidebar_label: Jiva user guide
---
------

For details of how Jiva works, see <a href="/docs/next/jiva.html" >Jiva overview page</a>



Jiva is a light weight storage engine that is recommended to use for low capacity workloads. The snapshot and storage management features of the other cStor engine are more advanced and is <a href="http://localhost:3000/docs/next/casengines.html#cstor-vs-jiva-features-comparison">recommended</a> when snapshots are a need.

<br>

Follow the below steps to provision persistent volumes using Jiva storage engine.

<a href="/docs/next/installation.html" target="_blank">Verify</a> OpenEBS installation

<a href="/docs/next/iscsiclient.html" target="_blank">Verify</a> iSCSI client is installed and iSCSI service is running

If simple provisioning of jiva volumes is desired without any configuration see  <a href="/docs/next/jivaguide.html#simple-provisioning-of-jiva">here</a>

For provisioning with local or cloud disks <a href="/docs/next/jivaguide.html#provisioning-with-local-or-cloud-disks">here</a>

<br>

<font size="5">Also see:</font>

Backup and restore Jiva volumes

Jiva troubleshooting tips



## Simple provisioning of jiva

To quickly provision a jiva volume using the default pool and storageClass, use the following command

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-jiva-default.yaml
```



In this mode, OpenEBS provisions a jiva volume with three replicas on three different nodes. The data in each replica is storage in the local container storage of the replica itself. The data is replicated and highly available and is suitable for quick testing of OpenEBS and simple application PoCs.

## Provisioning with local or cloud disks

In this mode, local disks on each node need to be prepared and mounted at a directory path for use by jiva. 

***Note:*** Node disk manager and other disk management capabilities are integrated into and used by cStor. For jiva, the mount paths need to be setup and managed by the administrator.

### Prepare disks and mount them

If is is a cloud disk provision and mount on the node. If three replicas of Jiva volume are needed, provision three cloud disks and mount them on each node. The mount path needs to be same on all three nodes

**GPD example**

- Create a GPD

  <font color="maroon">

  gcloud compute disks create disk1 --size 100GB --type pd-standard  --zone us-central1-a

  </font>

- Attach the GPD to a node

  <font color="maroon">

  gcloud compute instances attach-disk <Node Name> --disk disk1 --zone us-central1-a

  </font>



- If the disk attached is mapped to /dev/sdb, verify the size, mount the disk and format it

  <font color="maroon">

  sudo lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINT,LABEL

  sudo mkfs.ext4 /dev/<device-name>

  sudo mkdir /mnt/openebs-gpd

  sudo mount /dev/sdb  /mnt/openebs-gpd

  </font>

- Repeat the above steps on other two nodes if this is a three replica case



### Create a Jiva pool

Jiva pool requires mount path to prepared and available. Note that if the mount path is not pointing a real disk, then a local directory is created with this mount path and the replica data goes to the container image disk (similar to the case of `default` pool)

- yaml specification to create the jiva pool is shown below

```
    apiVersion: openebs.io/v1alpha1
    kind: StoragePool
    metadata:
        name: gpdpool 			 
        type: hostdir
    spec:
        path: "/mnt/openebs-gpd"   
```

- Copy the above content to the into a file called jiva-gpd-pool.yaml and create the pool using the following command

```
kubectl apply -f jiva-gpd-pool.yaml 
```

- Verify if the pool is created using the following command

```
kubectl get storagepool
```

 

### Create a storageClass

Specify the jiva pool in the `StoragePool` annotation of storage class. Example StorageClass specification is given below

---
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-gpd-3repl
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
        value: gpdpool
```

- Copy the above content to the into a file called jiva-gpd-3repl-sc.yaml and create the pool using the following command

```
kubectl apply -f jiva-gpd-3repl-sc.yaml
```

- Verify if the StorageClass is created using the following command

```
kubectl get sc
```

 

### Provision jiva volumes

Once the storage class is created, provision the volumes using the standard PVC interface. In the example below the `StorageClass` openebs-jiva-gpd-3repl is specified in the `PersistentVolumeClaim` specification



**Percona example**

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
  storageClassName: openebs-jiva-gpd-3repl
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

The Percona application now runs inside the `gpdpool` storage pool.



## Troubleshooting jiva volumes





<br>

## See Also:



<br>

<hr>

<br>



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
