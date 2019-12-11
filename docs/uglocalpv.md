---
id: uglocalpv
title: OpenEBS Local PV User Guide
sidebar_label: Local PV
---
------

<br>

<img src="/docs/assets/svg/4-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>



A local PV represents a mounted local storage device such as a disk or a hostpath (or subpath) directory.  Local PVs are an extension to hostpath volumes, but are more secure. 

OpenEBS Dynamic Local PV provisioner will help provisioning the Local PVs dynamically by integrating into the features offered by OpenEBS Node Storage Device Manager, and also offers the flexibility to either select a complete storage device or a hostpath (or subpath) directory.

<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>Prerequisites</h2>
- Kubernetes 1.12 or higher is required to use OpenEBS Local PV. 
- An unclaimed block device on worker node where application is going to schedule, for provisioning OpenEBS Local PV based device.

<br>

## User Operations

[Provision OpenEBS Local PV Based on hostpath](#Provision-OpenEBS-Local-PV-based-on-hostpath)

[Provision OpenEBS Local PV Based on Device](#Provision-OpenEBS-Local-PV-based-on-Device)

[Backup and Restore](#backup-and-restore)



## Admin Operations

[General Verification of Block Device Mount Status for Local PV Based on Device](#General-verification-for-disk-mount-status-for-Local-PV-based-on-device)

[Configure hostpath](#configure-hostpath)





<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations</h2>

<h3><a class="anchor" aria-hidden="true" id="Provision-OpenEBS-Local-PV-based-on-hostpath"></a>Provision OpenEBS Local PV based on hostpath</h3>
The simplest way to provision an OpenEBS Local PV based on hostpath is to use the default StorageClass which is created as part of latest operator YAML. The default StorageClass name for hostpath configuration is `openebs-hostpath`. The default hostpath is configured as `/var/openebs/local`. 


The following is the sample deployment configuration of Percona application which is going to consume OpenEBS Local PV. For utilizing OpenEBS Local PV based on hostpath, use default StorageClass name as `openebs-hostpath` in the PVC spec of the Percona deployment.

```
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: percona
  labels:
    name: percona
spec:
  replicas: 1
  selector: 
    matchLabels:
      name: percona 
  template: 
    metadata:
      labels: 
        name: percona
    spec:
      securityContext:
        fsGroup: 999
      tolerations:
      - key: "ak"
        value: "av"
        operator: "Equal"
        effect: "NoSchedule"
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
  storageClassName: openebs-hostpath
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
---
apiVersion: v1
kind: Service
metadata:
  name: percona-mysql
  labels:
    name: percona-mysql
spec:
  ports:
    - port: 3306
      targetPort: 3306
  selector:
      name: percona
```

Deploy the application using the following command. In this example, the above configuration YAML spec is saved as `demo-percona-mysql-pvc.yaml`

```
kubectl apply -f demo-percona-mysql-pvc.yaml
```

The Percona application will be running on the OpenEBS local PV on hostpath. Verify if the application is running using the following command.

```
kubectl get pod -n <namespace>
```

In this documentation we are using default namespace. Default namespace may or may not be specified in commands. So, the command will be:

```
kubectl get pod
```
The output will be similar to the following.

<div class="co">NAME                       READY   STATUS    RESTARTS   AGE
percona-7b64956695-hs7tv   1/1     Running   0          21s</div>

Verify PVC status using the following command.

```
kubectl get pvc -n <namespace>
```

The output will be similar to the following.

<div class="co">NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
demo-vol1-claim   Bound    pvc-2e4b123e-88ff-11e9-bc28-42010a8001ff   5G         RWO            openebs-hostpath   28s</div>

Verify PV status using the following command.

```
kubectl get pv
```

The output will be similar to the following.

<div class="co">NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS       REASON   AGE
pvc-2e4b123e-88ff-11e9-bc28-42010a8001ff   5G         RWO            Delete           Bound    default/demo-vol1-claim   openebs-hostpath            22s</div>




<h3><a class="anchor" aria-hidden="true" id="Provision-OpenEBS-Local-PV-based-on-Device"></a>Provision OpenEBS Local PV Based on Device</h3>

The simplest way to provision an OpenEBS Local PV based on device is to use the default StorageClass for OpenEBS  Local PV based of device which is created as part of latest operator YAML. The default StorageClass name for OpenEBS Local PV based on device configuration is `openebs-device`. 

The following is the sample deployment configuration of Percona application which is going to consume OpenEBS Local PV based on device. For utilizing default OpenEBS Local PV based on device, use default StorageClass name as `openebs-device` in the PVC spec of the Percona deployment. 

```
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: percona
  labels:
    name: percona
spec:
  replicas: 1
  selector: 
    matchLabels:
      name: percona 
  template: 
    metadata:
      labels: 
        name: percona
    spec:
      securityContext:
        fsGroup: 999
      tolerations:
      - key: "ak"
        value: "av"
        operator: "Equal"
        effect: "NoSchedule"
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
  storageClassName: openebs-device
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
---
apiVersion: v1
kind: Service
metadata:
  name: percona-mysql
  labels:
    name: percona-mysql
spec:
  ports:
    - port: 3306
      targetPort: 3306
  selector:
      name: percona
```

In this example, the above configuration YAML spec is saved as `demo-percona-mysql-pvc.yaml`

**Note**: 

- The Local PV volume will be provisioned  with `volumeMode` as `filesystem` by default. The supported filesystems are `ext4` and `xfs`  The means Local PV volume will be created and formatted with one of these filesystem. If no filesystem is specified, by default Kubelet will format the BlockDevice as `ext4`. More details can be found [here](/docs/next/localpv.html#how-to-use-openebs-local-pvs).

- With OpenEBS 1.5 version, Local PV volume has Raw Block Volume support. The Raw Block Volume support can be added to the path `spec.volumeMode` as `Block` in the Persistent Volume spec. Below is the sample PVC spec for provisioning Local PV on Raw Block Volume.

  ```
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: my-pvc
  spec:
    accessModes:
      - ReadWriteOnce
    volumeMode: Block
    storageClassName: openebs-device
    resources:
      requests:
        storage: 10Gi
  ```

Run the following command to provision an the application using the above saved YAML spec.

```
kubectl apply -f demo-percona-mysql-pvc.yaml
```

The Percona application now runs using the OpenEBS local PV volume on device. Verify the application running status using the following command.

```
kubectl get pod
```

The output will be similar to the following.

<div class="co">NAME                       READY   STATUS    RESTARTS   AGE
percona-7b64956695-lnzq4   1/1     Running   0          46s</div>

Verify the PVC status using the following command.

```    
kubectl get pvc
```

The output will be similar to the following.

<div class="co">NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS     AGE
demo-vol1-claim   Bound    pvc-d0ea3a06-88fe-11e9-bc28-42010a8001ff   5G         RWO            openebs-device   38s</div>

Verify the PV status using the following command.

```    
kubectl get pv
```

The output will be similar to the following.

<div class="co">NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS     REASON   AGE
pvc-d0ea3a06-88fe-11e9-bc28-42010a8001ff   5G         RWO            Delete           Bound    default/demo-vol1-claim   openebs-device            35s</div>




<h3><a class="anchor" aria-hidden="true" id="backup-and-restore"></a>Backup and Restore</h3>

OpenEBS volume can be backed up and restored along with the application using velero plugin. It helps the user for backing up the  OpenEBS volumes to a third party storage location and then restore the data whenever it is needed. The steps for taking backup and restore are as follows.

<h4><a class="anchor" aria-hidden="true" id="prerequisties-bkp-restore"></a>Prerequisites</h3>

- Mount propagation feature has to be enabled on Kubernetes, otherwise the data written from the pods will not visible in the restic daemonset pod on the same node. It is enabled by default from Kubernetes version 1.12. More details can be get from [here](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/). 
- Latest tested Velero version is 1.1.0.
- Create required storage provider configuration to store the backup data.
- Create required storage class on destination cluster.
- Annotate required application pod that contains a volume to back up.
- Add a common label to all the resources associated to the application that you want to backup. For example, add an application label selector in associated components such as PVC,SVC etc.

<h4><a class="anchor" aria-hidden="true" id="overview"></a>Overview</h3>

Velero is a utility to back up and restore your Kubernetes resource and persistent volumes. 

To take backup and restore of OpenEBS Local PV, configure Velero with restic and use  `velero backup` command to take the backup of application with OpenEBS Local PV which invokes restic internally and copies the data from the given application including the entire data from the associated persistent volumes in that application and backs it up to the configured storage location such as S3 or [Minio](/docs/next/minio.html).

The following are the step by step procedure for taking backup and restore of application with OpenEBS Local PV.

1. Install Velero
2. Annotate Application Pod
3. Creating and Managing Backups
4. Steps for Restore

<h4><a class="anchor" aria-hidden="true" id="install-velero"></a>Install Velero (Formerly known as ARK)</h3>

Follow the instructions at [Velero documentation](<https://velero.io/docs/v1.1.0/>) to install and configure Velero and follow [restic integration documentation](https://velero.io/docs/v1.1.0/restic/) for setting up and usage of restic support.

While installing Velero plugin in your cluster,  specify `--use-restic` to enable restic support. 

Verify using the following command if restic pod and Velero pod are running after installing velero with restic support.

```
kubectl get pod -n velero
```

The following is an example output in a single node cluster.

```
NAME                      READY   STATUS    RESTARTS   AGE
restic-ksfqr              1/1     Running   0          21s
velero-84b9b44d88-gn8dk   1/1     Running   0          25m
```

<h4><a class="anchor" aria-hidden="true" id="annotate-appliction"></a>Annotate Application Pod</h3>

Run the following  to annotate each application pod that contains a volume to back up.

```
kubectl -n YOUR_POD_NAMESPACE annotate pod/YOUR_POD_NAME backup.velero.io/backup-volumes=YOUR_VOLUME_NAME_1,YOUR_VOLUME_NAME_2,...
```

In the above example command, where the volume names are the names of the volumes specified in the application pod spec.

Example Spec:

If application spec contains the volume name as mentioned below, then use volume name as `storage` in the below command.

```
    spec:
      # Refer to the PVC created earlier
      volumes:
      - name: storage
        persistentVolumeClaim:
          # Name of the PVC created earlier
                claimName: minio-pv-claim
      containers:
      - name: minio
```

And if the application pod name is  `minio-deployment-7fc6cdfcdc-8r84h` , use the following command to annotate the application.

```
kubectl -n default annotate pod/minio-deployment-7fc6cdfcdc-p6hlq backup.velero.io/backup-volumes=storage
```

<h4><a class="anchor" aria-hidden="true" id="managing-backup"></a>Creating and Managing Backups</h3>

Take the backup using the below command.

```
velero backup create <backup_name> -l <app-label-selector>
```

Example:


```
velero backup create hostpathbkp1 -l app=minio
```

The above command shown in example will take backup of all resources which has a common label `app=minio`.  

**Note:** You can use `--selector` as a flag in backup command  to filter specific resources or use a combo of `--include-namespaces` and `--exclude-resources` to exclude specific resources in the specified namespace. More details can be read from [here](https://heptio.github.io/velero/v0.11.0/api-types/backup.html).

After taking backup, verify if backup is taken successfully by using following command.

```
velero backup get
```

The following is a sample output.

```
NAME             STATUS                      CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
hostpathbkp1     Completed                   2019-06-14 14:57:01 +0530 IST   29d       default            app=minio
```

You will get more details about the backup using the following command.

```
velero backup describe hostpathbkp1
```

Once the backup is completed you should see the `Phase` marked as `Completed` in the output of above command.

<h4><a class="anchor" aria-hidden="true" id="steps-for-restore"></a>Steps for Restore</h3>

Velero backup can be restored onto a new cluster or to the same cluster. An OpenEBS PV *with the same name as the original PV* will be created and application will run using the restored OpenEBS volume.

**Prerequisites**

- Ensure same namespace, StorageClass configuration and PVC configuration of the source PVC must be created in your destination cluster. 
- Ensure at least one unclaimed block device is present on the destination to restore OpenEBS Local PV provisioned with device.

On the target cluster, restore the application using the below command.

```
velero restore create --from-backup <backup-name>
```

Example:

```
velero restore create --from-backup hostpathbkp1
```

The following can be used to obtain the restore job status.

```
velero restore get
```

The following is an example output. Once the restore is completed you should see the status marked as `Completed`.

```
NAME                            BACKUP           STATUS      WARNINGS   ERRORS   CREATED                         SELECTOR
hostpathbkp1-20190614151818     hostpathbkp1     Completed   34         0        2019-06-14 15:18:19 +0530 IST   <none>
```

Verify application status using the following command

```
kubectl get pod -n <namespace>
```

Verify PVC status using the following command.

```
kubectl get pvc -n <namespace>
```

<br>

<hr>

<h2><a class="anchor" aria-hidden="true" id="admin-operations"></a>Admin Operations</h2>

<h3><a class="anchor" aria-hidden="true" id="General-verification-for-disk-mount-status-for-Local-PV-based-on-device"></a>General Verification of Block Device Mount Status for Local PV Based on Device</h3>

The application can be provisioned using OpenEBS Local PV based on device. For provisioning OpenEBS Local PV using the block devices attached to the nodes, the block devices should be in one of the following states.

- User has attached the block device, formatted and mounted them.
  - For Example: Local SSD in GKE.
- User has attached the block device, un-formatted and not mounted them.
  - For Example: GPD in GKE.
- User has attached the block device, but device has only device path and no dev links.
  - For Example: VM with VMDK disks or AWS node with EBS



<h3><a class="anchor" aria-hidden="true" id="configure-hostpath"></a>Configure hostpath</h3>

The default hostpath is configured as `/var/openebs/local`,  which can either be changed during the OpenEBS operator install by passing in the `OPENEBS_IO_BASE_PATH` ENV parameter to the OpenEBS Local PV dynamic provisioner deployment spec or via the StorageClass. The example for both approaches are shown below.

<h4><a class="anchor" aria-hidden="true" id="using-openebs-opeartor"></a>Using OpenEBS operator YAML</h3>

The example of changing the ENV variable to the Local PV dynamic provisioner deployment spec in the operator YAML. This has to be done before applying openebs operator YAML file.

```
name: OPENEBS_IO_BASE_PATH
value: “/mnt/”
```

<h4><a class="anchor" aria-hidden="true" id="using-storageclass"></a>Using StorageClass</h3>

The Example for changing the Basepath via StorageClass

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-hostpath
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: BasePath
        value: "/mnt/"
provisioner: openebs.io/local
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
```

Apply the above StorageClass configuration after making the necessary changes and use this StorageClass name in the corresponding PVC specification to provision application on OpenEBS Local PV based on the customized hostpath.

Verify if the StorageClass is having the updated hostpath using the following command and verify the `value` is set properly for the `BasePath` config value.

```
kubectl describe sc openebs-hostpath
```

**Note**: If you are using a mount path of an external device as  `Basepath` for the default hostpath Storage Class, then you must add the corresponding block device path under **exclude** filter so that NDM will not select the particular disk for BD creation. For example, `/dev/sdb` is mounted as `/mnt/ext_device`, and if you are using `/mnt/ext_device` as Basepath in default StorageClass `openebs-hostpath`, then you must add `/dev/sdb` under **exclude** filter of NDM configuration. See [here](/docs/next/ugndm.html#Exclude-filters) for customizing the exclude filter in NDM configuration.

<br>

## See Also:



### [Understand OpenEBS Local PVs ](/docs/next/localpv.html)


### [Node Disk Manager](/docs/next/ugndm.html)


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
