---
id: jivaguide
title: Jiva User Guide
sidebar_label: Jiva
---
------

<br>

<img src="/docs/assets/svg/6-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>

For details of how Jiva works, see <a href="/docs/next/jiva.html" >Jiva overview page</a>


Jiva is a light weight storage engine that is recommended to use for low capacity workloads. The snapshot and storage management features of the other cStor engine are more advanced and is recommended when snapshots are a need. 

<br>


<font size="5">User operations</font>

[Simple provisioning of Jiva](#simple-provisioning-of-jiva)

[Provisioning with Local or Cloud Disks](#provisioning-with-local-or-cloud-disks)

[Provision Sample Application with Jiva Volume](#provision-sample-application-with-jiva-volume)

[Monitoring a Jiva Volume](#monitoring-a-jiva-volume)

[Backup and Restore](#backup-and-restore)






<font size="5">Admin operations</font>

[Create a Jiva Pool](#create-a-pool)

[Create a StorageClass](#create-a-sc)

[Setting up Jiva Storage Policies](#setting-up-jiva-storage-policies)





<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations</h2>



<h3><a class="anchor" aria-hidden="true" id="simple-provisioning-of-jiva"></a>Simple Provisioning of Jiva</h3>

To quickly provision a Jiva volume using the default pool and StorageClass, use the following command

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-jiva-default.yaml
```

In this mode, OpenEBS provisions a Jiva volume with three replicas on three different nodes. Ensure there are 3 Nodes in the cluster. The data in each replica is stored in the local container storage of the replica itself. The data is replicated and highly available and is suitable for quick testing of OpenEBS and simple application PoCs.
If it a single node cluster, then download the above YAML spec and change the replica count and apply the modified YAML spec.



<h3><a class="anchor" aria-hidden="true" id="provisioning-with-local-or-cloud-disks"></a>Provisioning with Local or Cloud Disks</h3>
In this mode, local disks on each node need to be prepared and mounted at a directory path for use by jiva. For jiva, the mount paths need to be setup and managed by the administrator. The steps for mounting a disk into a node and creating a Jiva storage pool is provided [here](#create-a-pool). Once a StorageClass is created by mentioning this StoragePool name, then use this StorageClass in the PVC configuration.



<h3><a class="anchor" aria-hidden="true" id="provision-sample-application-with-jiva-volume"></a>Provision Sample Application with Jiva Volume</h3>
Once the storage class is created, provision the volumes using the standard PVC interface. In the following example, the `StorageClass` openebs-jiva-gpd-3repl is specified in the `PersistentVolumeClaim` specification. The raw file of this example spec can be download from [here](<https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/percona/percona-openebs-deployment.yaml>) or use the following spec.


- Percona Example

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
    storageClassName: openebs-jiva-default
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
  
- Run the application using the following command.

  ```
  kubectl apply -f demo-percona-mysql-pvc.yaml
  ```
  The Percona application now runs inside the `gpdpool` storage pool.



<h3><a class="anchor" aria-hidden="true" id="monitoring-a-jiva-volume"></a>Monitoring a Jiva Volume</h3>
By default `VolumeMonitor` is set to ON in the JIva StorageClass. Volume metrics are exported when this parameter is set to ON. Following metrics are supported by Jiva as of the current release.

```
openebs_actual_used # Actual volume size used
openebs_connection_error_total # Total no of connection errors
openebs_connection_retry_total # Total no of connection retry requests
openebs_degraded_replica_count # Total no of degraded/ro replicas
openebs_healthy_replica_count # Total no of healthy replicas
openebs_logical_size # Logical size of volume
openebs_parse_error_total # Total no of parsing errors
openebs_read_block_count # Read Block count of volume
openebs_read_time # Read time on volume
openebs_reads # Read Input/Outputs on Volume
openebs_sector_size # sector size of volume
openebs_size_of_volume # Size of the volume requested
openebs_total_replica_count # Total no of replicas connected to cas
openebs_volume_status # Status of volume: (1, 2, 3, 4) = {Offline, Degraded, Healthy, Unknown}
openebs_volume_uptime # Time since volume has registered
openebs_write_block_count # Write Block count of volume
openebs_write_time # Write time on volume
openebs_writes # Write Input/Outputs on Volume
```

Grafana charts can be built for the above Prometheus metrics. Some metrics of OpenEBS volumes are available automatically at MayaOnline when you connect the Kubernetes cluster to it. See an example screenshot below.

![jiva-monitor](/docs/assets/svg/volume-monitor.svg)



<h3><a class="anchor" aria-hidden="true" id="backup-and-restore"></a>Backup and Restore</h3>
OpenEBS volume can be backed up and restore along with application using velero plugin. It helps the user for taking backup of OpenEBS volumes to a third party storage location and then restoration of the data whenever it needed. The steps for taking backup and restore are following.

<h4><a class="anchor" aria-hidden="true" id="prerequisties-bkp-restore"></a>Prerequisites</h3>

- Mount propagation feature has to be enabled on Kubernetes, otherwise the data written from the pods will not visible in the restic daemonset pod on the same node. It is enabled by default on Kubernetes version 1.12. More details can be get from [here](https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/). 
- Latest tested Velero version is 1.0.0.
- Create required storage provider configuration to store the backup data.
- Create required storage class on destination cluster.
- Annotate required application pod that contains a volume to back up.

<h4><a class="anchor" aria-hidden="true" id="overview"></a>Overview</h3>

Velero is a utility to back up and restore your Kubernetes resource and persistent volumes. 

To take backup and restore of Jiva volume, configure Velero with restic and use  `velero backup` command to take the backup of application with OpenEBS Jiva volume which invokes restic internally and copies the data from the given application including the entire data from the associated persistent volumes in that application and backs it up to the configured storage location such as S3 or [Minio](/docs/next/minio.html).

The following are the step by step procedure for taking backup and restore of application with Jiva.

1. Install Velero
2. Annotate Application Pod
3. Creating and Managing Backups
4. Steps for Restore

<h4><a class="anchor" aria-hidden="true" id="install-velero"></a>Install Velero (Formerly known as ARK)</h3>

Follow the instructions at [Velero documentation](<https://velero.io/docs/v1.0.0/>) to install and configure Velero and follow [restic integration documentation](https://velero.io/docs/v1.0.0/restic/) for setting up and usage of restic support.

While installing Velero plugin in your cluster,  specify `--use-restic` to enable restic support. 

Verify using the following command if restic pod and Velero pod are running after installing velero with restic support.

```
kubectl get pod -n velero
```

The following is an example output in a 3 Node cluster.

```
NAME                    READY   STATUS    RESTARTS   AGE
restic-8hxx8            1/1     Running   0          9s
restic-nd9d9            1/1     Running   0          9s
restic-zfggm            1/1     Running   0          9s
velero-db6459bb-n2rff   1/1     Running   0          9s
```

<h4><a class="anchor" aria-hidden="true" id="annotate-appliction"></a>Annotate Application Pod</h3>

Run the following  to annotate each application pod that contains a volume to back up.

```
kubectl -n YOUR_POD_NAMESPACE annotate pod/YOUR_POD_NAME backup.velero.io/backup-volumes=YOUR_VOLUME_NAME_1,YOUR_VOLUME_NAME_2,...
```

In the above example command, where the volume names are the names of the volumes specified in the application pod spec.

Example Spec:

If application spec contains the volume name as mentioned below, then use volume name as `demo-vol1` in the below command.

```
            volumeMounts:
            - mountPath: /var/lib/mysql
              name: demo-vol1
      volumes:
        - name: demo-vol1
          persistentVolumeClaim:
            claimName: demo-vol1-claim
```

And if the application pod name is  `percona-7b64956695-dk95r` , use the following command to annotate the application.

```
kubectl -n default annotate pod/percona-7b64956695-dk95r backup.velero.io/backup-volumes=demo-vol1 
```

<h4><a class="anchor" aria-hidden="true" id="managing-backup"></a>Creating and Managing Backups</h3>

Take the backup using the below command. Here you should add the selector for avoiding Jiva controller and replica deployment from taking backup.

```
velero backup create <backup_name> --selector '!openebs.io/controller,!openebs.io/replica'
```

Example:

```
velero backup create hostpathbkp2 --selector '!openebs.io/controller,!openebs.io/replica'
```

After taking backup, verify if backup is taken successfully by using following command.

```
velero backup get
```

The following is a sample output.

```
NAME           STATUS      CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
hostpathbkp2   Completed   2019-06-19 17:14:43 +0530 IST   29d       default            !openebs.io/controller,!openebs.io/replica
```

You will get more details about the backup using the following command.

```
velero backup describe hostpathbkp2 --details
```

Once the backup is completed you should see the `Phase` marked as `Completed` in the output of above command.

<h4><a class="anchor" aria-hidden="true" id="steps-for-restore"></a>Steps for Restore</h3>

Velero backup can be restored onto a new cluster or to the same cluster. An OpenEBS PVC *with the same name as the original PVC* will be created and application will run using the restored OpenEBS volume.

**Prerequisites**

- Create the same namespace and StorageClass configuration of the source PVC in your destination cluster. 
- If the restoration is happens on same cluster where Source PVC was created, then ensure that application and its corresponding components such as Service, PVC and PV are deleted successfully.

On the target cluster, restore the application using the below command.

```
velero restore create --from-backup <backup-name>
```

Example:

```
velero restore create --from-backup hostpathbkp2
```

The following can be used to obtain the restore job status.

```
velero restore get
```

The following is an example output. Once the restore is completed you should see the status marked as `Completed`.

```
NAME                          BACKUP         STATUS       WARNINGS   ERRORS   CREATED                         SELECTOR
hostpathbkp2-20190619171932   hostpathbkp2   Completed    44          0        2019-06-19 17:19:33 +0530 IST   <none>
```

Verify application status using the following command.

```
kubectl get pod -n <namespace>
```

Verify PVC status using the following command.

```
kubectl get pvc -n <namespace>
```

Verify PV status using the following command.

```
kubectl get pv
```



<br>

<h2><a class="anchor" aria-hidden="true" id="admin-operations"></a>Admin Operations</h2>



<h3><a class="anchor" aria-hidden="true" id="create-a-pool"></a>Create a Jiva Pool</h3>

The process of creating a Jiva pool include the following steps.

1. Prepare disks and mount them

2. Create a Jiva pool using the above mounted disk.

<h4><a class="anchor" aria-hidden="true" id="prepare-disk-mount"></a>Prepare disks and mount them</h4>
If it is a cloud disk provision and mount on the node. If three replicas of Jiva volume are needed, provision three cloud disks and mount them on each node. The mount path needs to be same on all three nodes. The following is the steps for creating a GPD disk on Google cloud and mounthing to the node.

- Create a GPD

  ```
  gcloud compute disks create disk1 --size 100GB --type pd-standard  --zone us-central1-a
  ```
  
- Attach the GPD to a node

  ```
  gcloud compute instances attach-disk <Node Name> --disk disk1 --zone us-central1-a
  ```

- If the disk attached is mapped to /dev/sdb, verify the size, mount the disk and format it

  ```
  sudo lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINT,LABEL

  sudo mkfs.ext4 /dev/<device-name>

  sudo mkdir /home/openebs-gpd

  sudo mount /dev/sdb  /home/openebs-gpd
  ```

- Repeat the above steps on other two nodes if this is a three replica case.

<h4><a class="anchor" aria-hidden="true" id="create-jiva-pool-with-mounted-disk"></a>Create a Jiva Pool using the mounted disk</h4>
Jiva pool requires mount path to be prepared and available on the Node. Note that if the mount path is not pointing a real disk, then a local directory is created with this mount path and the replica data goes to the container image disk (similar to the case of `default` pool).

- YAML specification to create the Jiva pool is shown below

  ```
    apiVersion: openebs.io/v1alpha1
    kind: StoragePool
    metadata:
        name: gpdpool 			 
        type: hostdir
    spec:
        path: "/home/openebs-gpd"   
  ```

- Copy the above content to the into a file called `jiva-gpd-pool.yaml` and create the pool using the following command.

  ```
  kubectl apply -f jiva-gpd-pool.yaml 
  ```

- Verify if the pool is created using the following command

  ```
  kubectl get storagepool
  ```


<h3><a class="anchor" aria-hidden="true" id="create-a-sc"></a>Create a StorageClass</h3>
This StorageClass is mainly for using the Jiva Storagepool created with a mounted disk. Jiva volume can be provision using default Jiva StorageClass named `openebs-jiva-default` in the corresponding PVC spec. The default StorageClass has replica count as 3.
The steps for creating Jiva Storage pool is mentioned in the above section. Specify the Jiva pool in the `StoragePool` annotation of StorageClass. Example StorageClass specification is given below.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-gpd-3repl
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: ReplicaCount
        value: "3"
      - name: StoragePool
        value: gpdpool
provisioner: openebs.io/provisioner-iscsi
```

- Copy the above content to the into a file called jiva-gpd-3repl-sc.yaml and create the pool using the following command
  
  ```
  kubectl apply -f jiva-gpd-3repl-sc.yaml
  ```

- Verify if the StorageClass is created using the following command

  ```
  kubectl get sc
  ```

<h3><a class="anchor" aria-hidden="true" id="setting-up-jiva-storage-policies"></a>Setting up Jiva Storage Policies</h3>
Below table lists the storage policies supported by Jiva. These policies can be added into *StorageClass* and apply them through *PersistentVolumeClaim* or *VolumeClaimTemplates* interface.



| JIVA STORAGE POLICY                                          | MANDATORY | DEFAULT                           | PURPOSE                                                      |
| ------------------------------------------------------------ | --------- | --------------------------------- | ------------------------------------------------------------ |
| [ReplicaCount](#Replica-Count-Policy)                        | No        | 3                                 | Defines the number of Jiva volume replicas                   |
| [Replica Image](#Replica-Image-Policy)                       |           | quay.io/openebs/m-apiserver:1.2.0 | To use particular Jiva replica image                         |
| [ControllerImage](#Controller-Image-Policy)                  |           | quay.io/openebs/jiva:1.10         | To use particular Jiva Controller Image                      |
| [StoragePool](#Storage-Pool-Policy)                          | Yes       | default                           | A storage pool provides a persistent path for an OpenEBS volume. It can be a directory on host OS or externally mounted disk. |
| [VolumeMonitor](#Volume-Monitor-Policy)                      |           | ON                                | When ON, a volume exporter sidecar is launched to export Prometheus metrics. |
| [VolumeMonitorImage](#Volume-Monitoring-Image-Policy)        |           | quay.io/openebs/m-exporter:1.2.0  | Used when VolumeMonitor is ON. A dedicated metrics exporter to the workload. Can be used to apply a specific issue or feature for the workload |
| [Volume FSType](#Volume-File-System-Type-Policy)             |           | ext4                              | Specifies the filesystem that the volume should be formatted with. Other values are `xfs` |
| [Volume Space Reclaim](#Volume-Space-Reclaim-Policy)         |           | false                             | It will specify whether data need to be retained post PVC deletion. |
| [TargetNodeSelector](#Targe-NodeSelector-Policy)             |           | Decided by Kubernetes scheduler   | Specify the label in `key: value` format to notify Kubernetes scheduler to schedule Jiva target pod on the nodes that match label. |
| [Replica NodeSelector](#Replica-NodeSelector-Policy)         |           | Decided by Kubernetes scheduler   | Specify the label in `key: value` format to notify Kubernetes scheduler to schedule Jiva replica pods on the nodes that match label. |
| [TargetTolerations](#TargetTolerations)                      |           | Decided by Kubernetes scheduler   | Configuring the tolerations for Jiva Target pod.             |
| [ReplicaTolerations](#ReplicaTolerations)                    |           | Decided by Kubernetes scheduler   | Configuring the tolerations for Jiva Replica pods.           |
| [TargetResourceLimits](#Target-ResourceLimits-Policy)        |           | Decided by Kubernetes scheduler   | CPU and Memory limits to Jiva Target pod                     |
| [TargetResourceRequests](#TargetResourceRequests)            |           | Decided by Kubernetes scheduler   | Configuring resource requests that need to be available before scheduling the containers. |
| [AuxResourceLimits](#AuxResourceLimits-Policy)               |           | Decided by Kubernetes scheduler   | configuring resource limits on the target pod.               |
| [AuxResourceRequests](#AuxResourceRequests-Policy)           |           | Decided by Kubernetes scheduler   | Configure minimum requests like ephemeral storage to avoid erroneous eviction by K8s. |
| [ReplicaResourceLimits](#ReplicaResourceLimits-Policy)       |           | Decided by Kubernetes scheduler   | Allow you to specify resource limits for the Replica.        |
| [Target Affinity](#Target-Affinity-Policy)                   |           | Decided by Kubernetes scheduler   | The policy specifies the label `key: value` pair to be used both on the Jiva target and on the application being used so that application pod and Jiva target pod are scheduled on the same node. |
| [OpenEBS Namespace Policy for Jiva Pods](#deploy-in-openEBS-namespace) |           | false                             | Jiva Pod will be deployed in PVC name space by default. With the value as `true`, Jiva Pods will run in OpenEBS namespace. |

<h4><a class="anchor" aria-hidden="true" id="Replica-Count-Policy"></a>Replica Count Policy</h4>
You can specify the Jiva replica count using the *value* for *ReplicaCount* property. In the following example, the jiva-replica-count is specified as 3. Hence, three replicas are created.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
       - name: ReplicaCount
         value: "3"
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Replica-Image-Policy"></a>Replica Image Policy</h4>
You can specify the jiva replica image using *value* for *ReplicaImage* property.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: ReplicaImage
        value: quay.io/openebs/m-apiserver:1.2.0
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Controller-Image-Policy"></a>Controller Image Policy</h4>
You can specify the jiva controller image using the *value* for *ControllerImage* property.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: ControllerImage
        value: quay.io/openebs/jiva:1.2.0
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Monitor-Policy"></a>Volume Monitor Policy</h4>
You can specify the jiva volume monitor feature which can be set using *value* for *VolumeMonitor* property.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - enabled: "true"
        name: VolumeMonitor
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Storage-Pool-Policy"></a>Storage Pool Policy</h4>
A storage pool provides a persistent path for an OpenEBS volume. It can be a directory on any of the following.

- host-os or
- mounted disk

**Note:**

You must define the storage pool as a Kubernetes Custom Resource (CR) before using it as a Storage Pool policy. Following is a sample Kubernetes custom resource definition for a storage pool.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePool
metadata:
    name: default
    type: hostdir
spec:
    path: "/mnt/openebs"
```

This storage pool custom resource can now be used as follows in the storage class.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: StoragePool
        value: default
provisioner: openebs.io/provisioner-iscsi 
```

<h4><a class="anchor" aria-hidden="true" id="Volume-File-System-Type-Policy"></a>Volume File System Type Policy</h4>
You can specify a storage class policy where you can specify the file system type. By default, OpenEBS comes with ext4 file system. However, you can also use the xfs file system.

Following is a sample setting.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
   name: openebs-mongodb
   annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: FSType
        value: "xfs"
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Monitoring-Image-Policy"></a>Volume Monitoring Image Policy</h4>
You can specify the monitoring image policy for a particular volume using *value* for *VolumeMonitorImage*property. The following Kubernetes storage class sample uses the Volume Monitoring policy. By default, volume monitor is enabled.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: VolumeMonitorImage
        value: quay.io/openebs/m-exporter:1.2.0
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Volume-Space-Reclaim-Policy"></a>Volume Space Reclaim Policy</h4>
Support for a storage policy that can disable the Jiva Volume Space reclaim. You can specify the jiva volume space reclaim feature setting using the *value* for *RetainReplicaData* property. In the following example, the jiva volume space reclaim feature is enabled as true. Hence, retain the volume data post PVC deletion.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: RetainReplicaData
        enabled: true
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Targe-NodeSelector-Policy"></a>Target  NodeSelector Policy</h4>
You can specify the *TargetNodeSelector* where Target pod has to be scheduled using the *value* for *TargetNodeSelector*. In following example, `node: apnode`is the node label.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetNodeSelector
        value: |-
            node: appnode
    openebs.io/cas-type: jiva
provisioner: openebs.io/provisioner-iscsi 
```

<h4><a class="anchor" aria-hidden="true" id="Replica-NodeSelector-Policy"></a>Replica NodeSelector Policy</h4>
You can specify the *ReplicaNodeSelector* where replica pods has to be scheduled using the *value* for *ReplicaNodeSelector* . In following sample storage class yaml, `node: openebs` is the node label.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaNodeSelector
        value: |-
            node: openebs
    openebs.io/cas-type: jiva
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="TargetTolerations"></a>TargetTolerations Policy</h4>
You can specify the *TargetTolerations* to specify the tolerations for Jiva target. 

```
- name: TargetTolerations
  value: |-
     t1:
       key: "key1"
       operator: "Equal"
       value: "value1"
       effect: "NoSchedule"
     t2:
       key: "key1"
       operator: "Equal"
       value: "value1"
       effect: "NoExecute"
```

<h4><a class="anchor" aria-hidden="true" id="ReplicaTolerations"></a>ReplicaTolerations Policy</h4>
You can specify the *ReplicaTolerations* to specify the tolerations for Replica.

```
- name: ReplicaTolerations
  value: |-
     t1:
       key: "key1"
       operator: "Equal"
       value: "value1"
       effect: "NoSchedule"
     t2:
       key: "key1"
       operator: "Equal"
       value: "value1"
       effect: "NoExecute"
```

<h4><a class="anchor" aria-hidden="true" id="TargetResourceRequests"></a>TargetResourceRequests Policy</h4>
You can specify the *TargetResourceRequests* to specify resource requests that need to be available before scheduling the containers. 

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceRequests
        value: "none"
    openebs.io/cas-type: jiva
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Target-ResourceLimits-Policy"></a>Target ResourceLimits Policy</h4>
You can specify the *TargetResourceLimits* to restrict the memory and cpu usage of Jiva target pod within the given limit using the *value* for *TargetResourceLimits* .

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: TargetResourceLimits
        value: |-
            memory: 1Gi
            cpu: 100m
    openebs.io/cas-type: jiva
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="AuxResourceLimits-Policy"></a>AuxResourceLimits Policy</h4>
You can specify the *AuxResourceLimits* which allow you to set limits on side cars.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 50m
    openebs.io/cas-type: jiva
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h4>
This feature is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars. Requests have to be specified in the format expected by Kubernetes.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceRequests
        value: "none"
    openebs.io/cas-type: jiva
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="ReplicaResourceLimits-Policy"></a>ReplicaResourceLimits Policy</h4>
You can specify the *ReplicaResourceLimits* to restrict the memory usage of replica pod within the given limit using the *value* for *ReplicaResourceLimits*.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  annotations:
    cas.openebs.io/config: |
      - name: ReplicaResourceLimits
        value: |-
            memory: 2Gi
    openebs.io/cas-type: jiva
provisioner: openebs.io/provisioner-iscsi
```

<h4><a class="anchor" aria-hidden="true" id="Target-Affinity-Policy"></a>Target Affinity Policy</h4>
The Stateful workloads access the OpenEBS storage volume by connecting to the Volume Target Pod. This policy can be used to co-locate volume target pod on the same node as workload.

- This feature makes use of the Kubernetes Pod Affinity feature that is dependent on the Pod labels. User will need to add the following label to both Application and PVC.

  ```
  labels:
    openebs.io/target-affinity: <application-unique-label>
  ```

- You can specify the Target Affinity in both application and OpenEBS PVC using the following way. 

  The following is a snippet of an application deployment YAML spec for implementing target affinity. 

  ```
  apiVersion: v1
  kind: Pod
  metadata:
    name: fio-jiva
    labels:
      name: fio-jiva
      openebs.io/target-affinity: fio-jiva
  ```

  For OpenEBS PVC, it will be similar to the following.

  ```
  kind: PersistentVolumeClaim
  apiVersion: v1
  metadata:
    name: fio-jiva-claim
    labels:
      openebs.io/target-affinity: fio-jiva
  ```

**Note**: *This feature works only for cases where there is a single application pod instance associated to a PVC.  Example YAML spec for application deployment can be get from [here](https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/fio/demo-fio-jiva-taa.yaml). In the case of STS, this feature is supported only for single replica StatefulSet.*

<h4><a class="anchor" aria-hidden="true" id="deploy-in-openEBS-namespace"></a>OpenEBS Namespace Policy for Jiva Pods</h4>
This StorageClass Policy is for deploying the Jiva pods in OpenEBS Namespace. By default, the value is `false`, so Jiva Pods will deploy in PVC namespace. The following are the main requirement of running Jiva pods in OpenEBS namespace.

* With default value, granting additional privileges to Jiva pods to access hostpath might involve granting privileges to the entire namespace of PVC. With enabling this value as`true` , Jiva pods will get additional privileges to access hostpath in OpenEBS namespace. 

* To avoid duplicate Jiva Pod creation during the restoration using Velero.

The following is a snippet of an StorageClass YAML spec for running Jiva pods in `openebs` namespace.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: jiva-pods-in-openebs-ns
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: DeployInOpenEBSNamespace
        enabled: "true"
provisioner: openebs.io/provisioner-iscsi
```


<br>

## See Also:

### [Understanding Jiva](/docs/next/jiva.html)



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
