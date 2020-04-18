---
id: alphafeatures
title: Alpha Features
sidebar_label: Alpha Features
---
------



This section give different features of OpenEBS which is presently in Alpha version. These features are not recommend to perform on a production clusters. We suggest to familiarize these features on test clusters and reach out to OpenEBS [community slack](https://openebs.io/join-our-slack-community) if you have  any queries or help on trying out these features.

**Note** : Upgrade is not supported for features in Alpha version.


## cStor

[Running a sample application on a cStor volume provisioned via CSI provisioner](#running-sample-application-cstor-volume-using-csi-provisioner)

[Provisioning cStor pool using CSPC operator](#provision-cstor-pool-using-cspc-operator)

[Expand a cStor volume created using CSI provisioner](#expand-cstor-volume-created-using-csi-provisioner)

[Snapshot and Cloning the cStor volume created using CSI provisioner](#snapshot-clone-cstor-volume-created-using-csi-provisioner)

[Blockdevice replacement in a cStor pool created using CSPC operator](#blockdevice-replacement-cstor-pool-cspc)


## Jiva

[Run a sample application on Jiva volume provisioned via Jiva CSI Provisioner](#running-sample-application-jiva-volume-using-csi-provisioner)


<h3><a class="anchor" aria-hidden="true" id="running-sample-application-cstor-volume-using-csi-provisioner"></a>Running a sample application on a cStor volume provisioned via CSI provisioner</h3>


The [Container Storage Interface](https://github.com/container-storage-interface/spec/blob/master/spec.md) (CSI) is a standard for exposing arbitrary block and file storage systems to containerized workloads on Container Orchestration Systems(COs)  like Kubernetes combined with different storage vendors. This means, implementing a single CSI for a storage vendor is guaranteed to work with all COs. OpenEBS cStor volume can be now provisioned with CSI driver from OpenEBS 1.2 version onwards. This feature is under active development and considered to be in Alpha state. 

**Note:** The current implementation only supports provisioning, de-provisioning, expansion and snapshot and clone of cStor Volumes .

<h4><a class="anchor" aria-hidden="true" id="prerequisites-cstor-csi"></a>Prerequisites</h4>

- Kubernetes version 1.14 or higher is installed.
- iSCSI initiator utils to be installed on all the worker nodes.
- Recommended OpenEBS Version is 1.4 or above . The steps to install OpenEBS is [here](/docs/next/quickstart.html).
- You have access to install RBAC components into `kube-system` namespace. The OpenEBS cStor CSI driver components are installed in `kube-system` namespace to allow them to be flagged as system critical components.
- You need to enable the feature gates `ExpandCSIVolumes` and `ExpandInUsePersistentVolumes` on `kubelet` in each worker node.
- You need to enable the feature gates `ExpandCSIVolumes` and `ExpandInUsePersistentVolumes` on `kube-apiserver` in the master node.
- Base OS on worker nodes can be Ubuntu 16.04, Ubuntu 18.04 or CentOS.

**Overview**

- Install OpenEBS CSI Driver
- Provision a cStor Pool Cluster
- Create a cStor StorageClass with cStor CSI provisioner
- Run your application on cStor volume provisioned via CSI Provisioner

<h4><a class="anchor" aria-hidden="true" id="install-OpenEBS-csi-driver"></a>Install OpenEBS CSI Driver</h4>

The node components make use of the host iSCSI binaries for iSCSI connection management. Depending on the OS, the csi-operator will have to be modified to load the required iSCSI files into the node pods.

OpenEBS cStor CSI driver components can be installed by running the following command:

Depending on the OS, select the appropriate deployment file.

- For Ubuntu 16.04 and CentOS:

  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/charts/master/docs/csi-operator-1.9.0.yaml
  ```

- For Ubuntu 18.04:

  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/charts/master/docs/csi-operator-1.9.0-ubuntu-18.04.yaml
  ```

Verify that the OpenEBS CSI Components are installed.

```
kubectl get pods -n kube-system
```

Example output:

<div class="co">
NAME                                                        READY   STATUS    RESTARTS   AGE
event-exporter-v0.2.5-7df89f4b8f-ml8qz                      2/2     Running   0          35m
fluentd-gcp-scaler-54ccb89d5-jk4gs                          1/1     Running   0          35m
fluentd-gcp-v3.1.1-56976                                    2/2     Running   0          35m
fluentd-gcp-v3.1.1-jvqxn                                    2/2     Running   0          35m
fluentd-gcp-v3.1.1-kwvsx                                    2/2     Running   0          35m
heapster-7966498b57-w4mrs                                   3/3     Running   0          35m
kube-dns-5877696fb4-jftrh                                   4/4     Running   0          35m
kube-dns-5877696fb4-s6dgg                                   4/4     Running   0          35m
kube-dns-autoscaler-85f8bdb54-m584t                         1/1     Running   0          35m
kube-proxy-gke-ranjith-csi-default-pool-a9a13f27-6qv1       1/1     Running   0          35m
kube-proxy-gke-ranjith-csi-default-pool-a9a13f27-cftl       1/1     Running   0          35m
kube-proxy-gke-ranjith-csi-default-pool-a9a13f27-q5ws       1/1     Running   0          35m
l7-default-backend-8f479dd9-zxbtf                           1/1     Running   0          35m
metrics-server-v0.3.1-8d4c5db46-fw66z                       2/2     Running   0          35m
openebs-cstor-csi-controller-0                              6/6     Running   0          77s
openebs-cstor-csi-node-hflmf                                2/2     Running   0          73s
openebs-cstor-csi-node-mdgqq                                2/2     Running   0          73s
openebs-cstor-csi-node-rwshl                                2/2     Running   0          73s
prometheus-to-sd-5b68q                                      1/1     Running   0          35m
prometheus-to-sd-c5bwl                                      1/1     Running   0          35m
prometheus-to-sd-s7fdv                                      1/1     Running   0          35m
stackdriver-metadata-agent-cluster-level-8468cc67d8-p864w   1/1     Running   0          35m
</div>

From above output, `openebs-cstor-csi-controller-0`  is running and `openebs-cstor-csi-node-hflmf` , `openebs-cstor-csi-node-mdgqq ` and `openebs-cstor-csi-node-rwshl ` running in each worker node.
    

<h4><a class="anchor" aria-hidden="true" id="provision-a-cStor-Pool-Cluster-csi"></a>Provision a cStor Pool Cluster</h4>

Apply cStor operator YAML file using the following command:

```
kubectl apply -f https://raw.githubusercontent.com/openebs/charts/master/docs/cstor-operator-1.9.0.yaml
```

Verify the status of CSPC operator using the following command:

```
kubectl get pod -n openebs -l name=cspc-operator
```

Example output:

<div class="co">NAME                            READY   STATUS    RESTARTS   AGE
cspc-operator-c4dc96bb9-km4dh   1/1     Running   0          43s
</div>

Now, You have to create a cStor Pool Cluster(CSPC) which is the group of cStor pools in the cluster. CSPC can be created by applying the sample YAML provided below:

<div class="co">apiVersion: openebs.io/v1alpha1
kind: CStorPoolCluster
metadata:
  name: cstor-disk-cspc
  namespace: openebs
spec:
  pools:
  - nodeSelector:
      kubernetes.io/hostname: "gke-ranjith-csi-default-pool-a9a13f27-6qv1"
    raidGroups:
    - type: "stripe"
      isWriteCache: false
      isSpare: false
      isReadCache: false
      blockDevices:
      - blockDeviceName: "blockdevice-936911c5c9b0218ed59e64009cc83c8f"
    poolConfig:
      cacheFile: ""
      defaultRaidGroupType: "stripe"
      overProvisioning: false
      compression: "off"
</div>

Edit the following parameters in the sample CSPC YAML:

- **blockDeviceName**:- Provide the block devices name to be used for provisioning cStor pool. Each storage pool will be created on a node using the blockdevices attached to the node.

- **kubernetes.io/hostname**: Provide the hostname where the cStor pool will be created using the set of block devices.


The above sample YAML creates a cStor pool of `striped` type using the provided block device on the corresponding node. If you need to create multiple cStor pools in the cluster with different RAID types, go to provisioning [CSPC cluster creation](#provision-cstor-pool-using-cspc-operator) section.

In this example, the above YAML is modified and saved as `cspc.yaml`. Apply the modified CSPC YAML spec using the following command to create a cStor Pool Cluster:

```
kubectl apply -f cspc.yaml
```

Verify the cStor pool details by running the following command:

```
kubectl get cspc -n openebs
```

Example output:

<div class="co">NAME              AGE
cstor-disk-cspc   23s
</div>

Verify if the cStor pool instance is created successfully using the following command:

```
kubectl get cspi -n openebs
```

Example output:

<div class="co">
  NAME                   HOSTNAME                                     ALLOCATED   FREE    CAPACITY   STATUS   AGE
  cstor-disk-cspc-7hkl   gke-ranjith-csi-default-pool-a9a13f27-6qv1   50K         39.7G   39.8G      ONLINE   2m43s
</div>



<h4><a class="anchor" aria-hidden="true" id="create-a-cStor-sc-for-csi-driver"></a>Create a cStor StorageClass with cStor CSI provisioner</h4>

Create a Storage Class to dynamically provision volumes using cStor CSI provisioner. You can save the following sample StorageClass YAML spec as `cstor-csi-sc.yaml`.

```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: openebs-csi-cstor-disk
provisioner: cstor.csi.openebs.io
allowVolumeExpansion: true
parameters:
  cas-type: cstor
  replicaCount: "1"
  cstorPoolCluster: cstor-disk-cspc
```

You should specify the correct `cstorPoolCluster` name from your cluster and specify the desired `replicaCount` for the cStor volume.

**Note:** The `replicaCount` should be less than or equal to the max pools available.

Sample StorageClass YAML spec can be found in [github repo](https://raw.githubusercontent.com/openebs/cstor-csi/master/deploy/sc.yaml). 

Apply the above sample Storage Class YAML using the following command:

```
kubectl apply -f cstor-csi-sc.yaml
```

Example output:

```
NAME                        PROVISIONER                                                AGE
openebs-csi-cstor-disk      cstor.csi.openebs.io                                       5s
openebs-device              openebs.io/local                                           59m
openebs-hostpath            openebs.io/local                                           59m
openebs-jiva-default        openebs.io/provisioner-iscsi                               59m
openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   59m
standard (default)          kubernetes.io/gce-pd                                       66m
```



The StorageClass `openebs-csi-cstor-disk` is created successfully. 



<h4><a class="anchor" aria-hidden="true" id="run-application-on-a-cStor-volume-by-specifying-sc"></a>Run your application on cStor volume provisioned via CSI Provisioner</h4>

Run your application by specifying the above created StorageClass for creating the PVC. Sample application YAML can be downloaded using the following command:

```
wget https://raw.githubusercontent.com/openebs/cstor-csi/master/deploy/busybox-csi-cstor-sparse.yaml
```

Modify the YAML spec with required PVC storage size, storageClassName. In this example, `storageClassName` is updated with `openebs-csi-cstor-disk`. 

The following example launches a busybox app with a cStor Volume provisioned via CSI Provisioner.

```
kubectl apply -f busybox-csi-cstor-sparse.yaml
```

Now the application will be running on the volume provisioned via cStor CSI provisioner. Verify the status of the PVC using the following command:

```
kubectl get pvc
```

Example output:

<div class="co">NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             AGE
demo-csivol-claim   Bound    pvc-723283b6-02bc-11ea-a139-42010a8000b2   5Gi        RWO            openebs-csi-cstor-disk   17m
</div>

Verify the status of the application by running the following command:

```
kubectl get pod
```

Example output:

<div class="co">NAME      READY   STATUS    RESTARTS   AGE
busybox   1/1     Running   0          97s
</div>

Verify if the application is running with the expected result using the following command:

```
kubectl exec -it busybox -- cat /mnt/openebs-csi/date.txt
```



The busybox is instructed to write the date into the mounted path at `/.mnt/openebs-csi/date.txt` when it is started . 

Example output:

<div class="co">
Sat Nov  9 06:59:27 UTC 2019
</div>

**Note:** While the asynchronous handling of the Volume provisioning is in progress, the application pod description may throw some errors like:

- `Waiting for CVC to be bound`: Implies volume components are still being created

- `Volume is not ready: Replicas yet to connect to controller`: Implies volume components are already created but yet to interact with each other.




<h3><a class="anchor" aria-hidden="true" id="expand-cstor-volume-created-using-csi-provisioner"></a>Expand a cStor volume created using CSI provisioner</h3>


The following section will give the steps to expand a cStor volume which is created using CSI provisioner. 

**Notes to remember:**

- Only dynamically provisioned cStor volumes can be resized.
- You can only expand cStor volumes containing a file system if the file system is `ext3`, `ext4` or `xfs`.
- Ensure that the corresponding StorageClass has the `allowVolumeExpansion` field set to `true` when the volume is provisioned.
- You will need to enable `ExpandCSIVolumes` and `ExpandInUsePersistentVolumes` feature gates on `kubelets` and `kube-apiserver`. Other general prerequisites related to cStor volume via CSI provisioner can be found from [here](#prerequisites-cstor-csi). 

**Steps to perform the cStor volume expansion:**

1. Perform the following command to get the details of the PVC.

   ```
   kubectl get pvc
   ```

   Example output:

   <div class="co">NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             AGE
      demo-csivol-claim   Bound    pvc-723283b6-02bc-11ea-a139-42010a8000b2   5Gi        RWO            openebs-csi-cstor-disk   66m
      </div>

2. Update the increased PVC size in the following section of the PVC YAML. 

   - `pvc.spec.resources.requests.storage`.

   This can be done by editing the PVC YAML spec using the following command:

   ```
    kubectl edit pvc demo-csivol-claim
   ```

   Example snippet:

   <div class="co">
   spec:
     accessModes:
     - ReadWriteOnce
     resources:
       requests:
         storage: 9Gi   
     storageClassName: openebs-csi-cstor-disk
   </div>
   
   In the above snippet, `storage` is modified to 9Gi from 5Gi. 
   
3. Wait for the updated capacity to reflect in PVC status (`pvc.status.capacity.storage`). Perform the following command to verify the updated size of the PVC:

   ```
   kubectl get pvc
   ```

     Example snippet:

   <div class="co">
   NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             AGE
      demo-csivol-claim   Bound    pvc-723283b6-02bc-11ea-a139-42010a8000b2   9Gi        RWO            openebs-csi-cstor-disk   68m
    </div>

4. Check whether the size is reflected on the application pod where the above volume is mounted.
   

<h3><a class="anchor" aria-hidden="true" id="snapshot-clone-cstor-volume-created-using-csi-provisioner"></a>Snapshot and Cloning the cStor volume created using CSI provisioner</h3>

The following section will give the steps to take snapshot and clone the cStor volume created using CSI provisioner. 

**Notes to remember:**

- You will need to enable `VolumeSnapshotDataSource` Feature Gate on `kubelet` and `kube-apiserver`. Other general prerequisites related to cStor volume via CSI provisioner can be found from [here](#prerequisites-cstor-csi). 

- Recommended OpenEBS Version is 1.8

**Capture the snapshot and cloning the cStor volume:**

1. Get the details of PVC and PV of the CSI based cStor volume using the following  command:
   
   PVC:
   ```
   kubectl get pvc
   ```
   Example output:
   ```
   NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             AGE
   demo-csivol-claim   Bound    pvc-c4868664-1a84-11ea-a1ad-42010aa00fd2   5Gi        RWO            openebs-csi-cstor-disk   8m39s
   ```
   PV:
   ```
   kubectl get pv
   ```
   Example output:
   ```
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                         STORAGECLASS             REASON   AGE
   pvc-c4868664-1a84-11ea-a1ad-42010aa00fd2   5Gi        RWO            Delete           Bound    default/demo-csivol-claim   openebs-    csi-cstor-disk            22s
   ```
2. Create a snapshot class pointing to cStor CSI driver. The following command will create a snapshot class pointing to cStor CSI driver:
   ```
   kubectl apply -f https://raw.githubusercontent.com/openebs/cstor-csi/master/deploy/snapshot-class.yaml
   ```
   Verify if snapshot class is created successfully using the following command:
   ```
   kubectl get volumesnapshotclass
   ```
   Example output:
   ```
   NAME                      AGE
   csi-cstor-snapshotclass   94s
   ```
3. Get the YAML for snapshot creation of a PVC using the following command:
   ```
   wget https://raw.githubusercontent.com/openebs/cstor-csi/master/deploy/snapshot.yaml
   ```
   In this example, downloaded file is saved as `snapshot.yaml`.
4. Edit the snapshot.yaml which is created in previous step to update:
   
   metedata.name :- Name of the snapshot
   
   spec.snapshotClassName :- Name of the `snapshotClass` pointing to cStor CSI driver which you can get from step 2.
   
   spec.source.name :- Source PVC, for which you are going to take the snapshot.

5. Apply the modified snapshot YAML using the following command:
   ```
   kubectl apply -f snapshot.yaml
   ```
   Verify if the snapshot has been created successfully using the following command:
   ```
   kubectl get volumesnapshots.snapshot
   ```
   Example output:
   ```
   NAME            AGE
   demo-snapshot   16s
   ```
   The output shows that snapshot of the source PVC is created successfully.
   
6. Now, let's create clone volume using the above snapshot. Get the PVC YAML spec for creating the clone volume from the given snapshot.
   ```
   wget https://raw.githubusercontent.com/openebs/cstor-csi/master/deploy/pvc-clone.yaml
   ```
   The downloaded file is saved as `pvc-clone.yaml`.

7. Edit the downloaded clone PVC YAML spec to update:
   
   - metadata.name :- Name of the clone PVC.
   - spec.storageClassName :- Same StorageClass used while creating the source PVC.
   - spec.dataSource.name :- Name of the snapshot.
   - spec.resources.requests.storage :- The size of the volume being cloned or restored. This should be same as source PVC.

8. Run the following command with the modified clone PVC YAML to create a cloned PVC.

   ```
   kubectl apply -f pvc-clone.yaml
   ```
   
9. Verify the status of new cloned PVC and PV using the following command:
   
   PVC:  
   ```
   kubectl get pvc
   ```
   Example output:
   ```
   NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             AGE
   demo-csivol-claim   Bound    pvc-c4868664-1a84-11ea-a1ad-42010aa00fd2   5Gi        RWO            openebs-csi-cstor-disk   18m
   pvc-clone           Bound    pvc-43340dc6-1a87-11ea-a1ad-42010aa00fd2   5Gi        RWO            openebs-csi-cstor-disk   16s
   ```
   PV:
   ```
   kubectl get pv
   ```
   Example output:
   ```
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                       STORAGECLASS             REASON   AGE
   pvc-43340dc6-1a87-11ea-a1ad-42010aa00fd2   5Gi        RWO            Delete           Bound    default/pvc-clone           openebs-csi-cstor-disk            17s
   pvc-c4868664-1a84-11ea-a1ad-42010aa00fd2   5Gi        RWO            Delete           Bound    default/demo-csivol-claim   openebs-csi-cstor-disk            9m43s
   ```
10. Now this cloned volume can be mounted in application and access the snapshot data.  


<h3><a class="anchor" aria-hidden="true" id="provision-cstor-pool-using-cspc-operator"></a>Provisioning cStor pool using CSPC operator</h3>

CSPC is a new schema for cStor pool provisioning and also refactors the code to make the cStor a completely pluggable engine into OpenEBS. The new schema also makes it easy to perform day 2 operations on cStor pools. The following are the new terms related to CSPC:

- CStorPoolcluster(CSPC)
- CStorPoolInstance(CSPI) 
- cspc-operator

**Note:** Volume provisioning on CSPC pools will be supported only via OpenEBS CSI provisioner.

The current workflow to provision CSPC pool is as follows:

1. OpenEBS should be installed. Recommended OpenEBS version is 1.8.
2. Install CSPC operator using YAML.
3. Identify the available blockdevices which are `Unclaimed` and `Active`.
4. Apply the CSPC pool YAML spec by filling required fields.
5. Verify the CSPC pool details.

<h4><a class="anchor" aria-hidden="true" id="install-openebs-cspc"></a>Install OpenEBS</h4>

Latest OpenEBS version can be installed using the following command:

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-1.9.0.yaml
```

Verify if OpenEBS pods are in `Running` state using the following command:
```
kubectl get pod -n openebs
```
Example output:
```
NAME                                          READY   STATUS    RESTARTS   AGE
maya-apiserver-77f9cc9f9b-jg825               1/1     Running   3          90s
openebs-admission-server-8c5b8565-d2q58       1/1     Running   0          79s
openebs-localpv-provisioner-f458bc8c4-bjmkq   1/1     Running   0          78s
openebs-ndm-lz4n6                             1/1     Running   0          80s
openebs-ndm-operator-7d7c9d966d-bqlnj         1/1     Running   1          79s
openebs-ndm-spm7f                             1/1     Running   0          80s
openebs-ndm-tm8ff                             1/1     Running   0          80s
openebs-provisioner-5fbd8fc74c-6zcnq          1/1     Running   0          82s
openebs-snapshot-operator-7d6dd4b77f-444zh    2/2     Running   0          81s
```

<h4><a class="anchor" aria-hidden="true" id="install-openebs-cspc-operator"></a>Install CSPC Operator</h4>

Install CSPC operator by using the following command:
```
kubectl apply -f https://raw.githubusercontent.com/openebs/charts/master/docs/cstor-operator-1.9.0.yaml
```
Verify if CSPC operator is in `Running` state using the following command:
```
kubectl get pod -n openebs -l name=cspc-operator
```
Example output:
```
NAME                            READY   STATUS    RESTARTS   AGE
cspc-operator-c4dc96bb9-zvfws   1/1     Running   0          115s
```

<h4><a class="anchor" aria-hidden="true" id="identify-bd-for-cspc"></a>Identify the blockdevices</h4>

Get the details of all blockdevices attached in the cluster using the following command. Identify the available blockdevices which are  `Unclaimed` and `Active`. Also verify these identified blockdevices does not contain any filesystem. These are the candidates for CSPC pool creation which need to be used in next step.

```
kubectl get bd -n openebs
```
Example output:
```
NAME                                           NODENAME                                      SIZE          CLAIMSTATE   STATUS   AGE
blockdevice-1c10eb1bb14c94f02a00373f2fa09b93   gke-ranjith-cspc-default-pool-f7a78720-zr1t   42949672960   Unclaimed    Active   7h43m
blockdevice-2594fa672b07f200f299f59cad340326   gke-ranjith-cspc-default-pool-f7a78720-9436   42949672960   Unclaimed    Active   40s
blockdevice-77f834edba45b03318d9de5b79af0734   gke-ranjith-cspc-default-pool-f7a78720-k1cr   42949672960   Unclaimed    Active   7h43m
blockdevice-936911c5c9b0218ed59e64009cc83c8f   gke-ranjith-cspc-default-pool-f7a78720-9436   42949672960   Unclaimed    Active   7h44m
```

In the above example, two blockdevices are attached to one node and one disk each attached to other two nodes.

<h4><a class="anchor" aria-hidden="true" id="install-openebs-cspc-operator"></a>Apply the CSPC pool YAML</h4>

Create a CSPC pool YAML spec to provision CSPC pools using the sample template provided below.

```
apiVersion: openebs.io/v1alpha1
kind: CStorPoolCluster
metadata:
  name: <CSPC_name>
  namespace: openebs
spec:
  pools:
  - nodeSelector:
      kubernetes.io/hostname: "<Node_name>"
    raidGroups:
    - type: "<RAID_type>"
      isWriteCache: false
      isSpare: false
      isReadCache: false
      blockDevices:
      - blockDeviceName: "<blockdevice_name>"
    poolConfig:
      cacheFile: ""
      defaultRaidGroupType: "<<RAID_type>>"
      overProvisioning: false
      compression: "off"
```
Here, we describe the parameters used in above CSPC pool creation template.

 - CSPC_name :- Name of CSPC cluster
 - Node_name :- Name of node where pool is to be created using the available blockdevices attached to the node.
 - RAID_type :- RAID configuration used for pool creation. Supported RAID types are `stripe`, `mirror`, `raidz` and `raidz2`. If `spec.pools.raidGroups.type` is specified, then `spec.pools.poolConfig.defaultRaidGroupType` will not consider for the particular raid groups. 
 - blockdevice_name :- Identify the available blockdevices which are  `Unclaimed` and `Active`. Also verify these identified blockdevices does not conatin any filesystem.

This is a sample CSPC template YAML configuration which will provision a cStor pool using CSPC operator. The following snippet describe the pool details of one node. If there are multiple pools to be created on different nodes, add below configuration for each node.

```
  - nodeSelector:
      kubernetes.io/hostname: "<Node1_name>"
    raidGroups:
    - type: "<RAID_type>"
      isWriteCache: false
      isSpare: false
      isReadCache: false
      blockDevices:
      - blockDeviceName: "<blockdevice_name>"
    poolConfig:
      cacheFile: ""
      defaultRaidGroupType: "<<RAID_type>>"
      overProvisioning: false
      compression: "off"
```

The following are some of the sample CSPC configuration YAML spec:

- **Striped**- One striped pool on each node using blockdevice attached to the node. In the below example, one node has 2 blockdevices and other two nodes having one disk each.
  
  ```
  apiVersion: openebs.io/v1alpha1
  kind: CStorPoolCluster
  metadata:
    name: cstor-pool-stripe
    namespace: openebs
  spec:
    pools:
    - nodeSelector:
        kubernetes.io/hostname: "gke-ranjith-cspc-default-pool-f7a78720-9436"
      raidGroups:
      - type: "stripe"
        isWriteCache: false
        isSpare: false
        isReadCache: false
        blockDevices:
        - blockDeviceName: "blockdevice-936911c5c9b0218ed59e64009cc83c8f"
        - blockDeviceName: "blockdevice-2594fa672b07f200f299f59cad340326"
    poolConfig:
        cacheFile: ""
        defaultRaidGroupType: "stripe"
        overProvisioning: false
        compression: "off"
    - nodeSelector:
        kubernetes.io/hostname: "gke-ranjith-cspc-default-pool-f7a78720-k1cr"
      raidGroups:
      - type: "stripe"
        isWriteCache: false
        isSpare: false
        isReadCache: false
        blockDevices:
        - blockDeviceName: "blockdevice-77f834edba45b03318d9de5b79af0734"
      poolConfig:
        cacheFile: ""
        defaultRaidGroupType: "stripe"
        overProvisioning: false
        compression: "off"
    - nodeSelector:
        kubernetes.io/hostname: "gke-ranjith-cspc-default-pool-f7a78720-zr1t"
      raidGroups:
      - type: "stripe"
        isWriteCache: false
        isSpare: false
        isReadCache: false
        blockDevices:
        - blockDeviceName: "blockdevice-1c10eb1bb14c94f02a00373f2fa09b93"
      poolConfig:
        cacheFile: ""
        defaultRaidGroupType: "stripe"
        overProvisioning: false
        compression: "off"
  ```

- **Mirror**- One mirror pool on one node using 2 blockdevices.

  ```
  apiVersion: openebs.io/v1alpha1
  kind: CStorPoolCluster
  metadata:
    name: cstor-pool-stripe
    namespace: openebs
  spec:
    pools:
    - nodeSelector:
        kubernetes.io/hostname: "gke-ranjith-cspc-default-pool-f7a78720-9436"
      raidGroups:
      - type: "mirror"
        isWriteCache: false
        isSpare: false
        isReadCache: false
        blockDevices:
        - blockDeviceName: "blockdevice-936911c5c9b0218ed59e64009cc83c8f"
        - blockDeviceName: "blockdevice-78f6be57b9eca9c08a2e18e8f894df30"
    poolConfig:
        cacheFile: ""
        defaultRaidGroupType: "mirror"
        overProvisioning: false
        compression: "off"
  ```

- **RAIDZ**- Single parity raid configuration with 3 blockdevices.

  ```
  apiVersion: openebs.io/v1alpha1
  kind: CStorPoolCluster
  metadata:
    name: cstor-pool-stripe
    namespace: openebs
  spec:
    pools:
    - nodeSelector:
        kubernetes.io/hostname: "gke-ranjith-cspc-default-pool-f7a78720-9436"
      raidGroups:
      - type: "raidz"
        isWriteCache: false
        isSpare: false
        isReadCache: false
        blockDevices:
        - blockDeviceName: "blockdevice-936911c5c9b0218ed59e64009cc83c8f"
        - blockDeviceName: "blockdevice-78f6be57b9eca9c08a2e18e8f894df30"
        - blockDeviceName: "blockdevice-77f834edba45b03318d9de5b79af0734"
    poolConfig:
        cacheFile: ""
        defaultRaidGroupType: "raidz"
        overProvisioning: false
        compression: "off"
  ```
  
- **RAIDZ2**- Dual parity raid configuration with 6 blockdevices.  
  ```
  apiVersion: openebs.io/v1alpha1
  kind: CStorPoolCluster
  metadata:
    name: cstor-pool-stripe
    namespace: openebs
  spec:
    pools:
    - nodeSelector:
        kubernetes.io/hostname: "gke-ranjith-cspc-default-pool-f7a78720-9436"
      raidGroups:
      - type: "raidz2"
        isWriteCache: false
        isSpare: false
        isReadCache: false
        blockDevices:
        - blockDeviceName: "blockdevice-936911c5c9b0218ed59e64009cc83c8f"
        - blockDeviceName: "blockdevice-78f6be57b9eca9c08a2e18e8f894df30"
        - blockDeviceName: "blockdevice-77f834edba45b03318d9de5b79af0734"
        - blockDeviceName: "blockdevice-2594fa672b07f200f299f59cad340326"
        - blockDeviceName: "blockdevice-cbd2dc4f3ff3f463509b695173b6064b"
        - blockDeviceName: "blockdevice-1c10eb1bb14c94f02a00373f2fa09b93"
    poolConfig:
        cacheFile: ""
        defaultRaidGroupType: "raidz2"
        overProvisioning: false
        compression: "off"	  
  ```
  
  Next, you can provision a cStor volume and then provision application on this volume. The steps can be found [here](#running-sample-application-cstor-volume-using-csi-provisioner).

<h4><a class="anchor" aria-hidden="true" id="verify-cspc-pool-details"></a>Verify CSPC Pool Details</h4>

Verify if the pool is in `Running` state by checking the status of CSPC, CSPI and pod running in `openebs` namespace. 

The following command will get the details of CSPC status:
```
kubectl get cspc -n openebs
```
Example output:
```
NAME                AGE
cstor-pool-stripe   18s
```
The following command will get the details of CSPI status:
```
kubectl get cspi -n openebs
```
Example output:
```
NAME                     HOSTNAME                                      ALLOCATED   FREE    CAPACITY   STATUS   AGE
cstor-pool-stripe-cfsm   gke-ranjith-cspc-default-pool-f7a78720-zr1t   69.5K       39.7G   39.8G      ONLINE   87s
cstor-pool-stripe-mnbh   gke-ranjith-cspc-default-pool-f7a78720-k1cr   69.5K       39.7G   39.8G      ONLINE   87s
cstor-pool-stripe-sxpr   gke-ranjith-cspc-default-pool-f7a78720-9436   69.5K       79.5G   79.5G      ONLINE   87s
```
The following command will get the details of CSPC pool pod status:
```
kubectl get pod -n openebs | grep -i <CSPC_name>
```
Example command:
```
kubectl get pod -n openebs | grep -i cstor-pool-stripe
```
Example output:
```
cstor-pool-stripe-cfsm-b947988c7-sdtjz        3/3     Running   0          25s
cstor-pool-stripe-mnbh-74cb58df69-tpkm6       3/3     Running   0          25s
cstor-pool-stripe-sxpr-59c5f46fd6-jz4n4       3/3     Running   0          25s
```

Also verify if all the blockdevices are claimed correctly by checking the `CLAIMSTATE`.
```
kubectl get bd -n openebs
```
Example output:
```
NAME                                           NODENAME                                      SIZE          CLAIMSTATE   STATUS   AGE
blockdevice-1c10eb1bb14c94f02a00373f2fa09b93   gke-ranjith-cspc-default-pool-f7a78720-zr1t   42949672960   Claimed      Active   7h47m
blockdevice-2594fa672b07f200f299f59cad340326   gke-ranjith-cspc-default-pool-f7a78720-9436   42949672960   Claimed      Active   4m24s
blockdevice-77f834edba45b03318d9de5b79af0734   gke-ranjith-cspc-default-pool-f7a78720-k1cr   42949672960   Claimed      Active   7h47m
blockdevice-936911c5c9b0218ed59e64009cc83c8f   gke-ranjith-cspc-default-pool-f7a78720-9436   42949672960   Claimed      Active   7h47m
```
<br>

<h3><a class="anchor" aria-hidden="true" id="blockdevice-replacement-cstor-pool-cspc"></a>Blockdevice replacement in a cStor pool created using CSPC operator</h3>

The following steps will help to perform the blockdevice replacement in cStor pools which were created using CSPC. It is recommended to perform replacement of one blockdevice per raid group of the cStor pool. For example, If cStor pool is created using 2 mirror raid groups, then only one blockdevice can be replaced per raid group. Following are prerequisites to perform replacement of blockdevice

**Prerequisites:**

1. There should be a blockdevice present on the same node where the old blockdevice is attached. The available blockdevice should be in `Unclaimed` & 'Active' state and does not contain any filesystem or partition.

2. The capacity of the new blockdevice should be greater than or equal to that of old blockdevice.

**Note:** Blockdevice replacement is not supported on cStor pool created using stripe configuration.

The following are the steps to perform blockdevice replacement:

- Verify the status of cStor pool instance using the following command:
  
  ```
  kubectl get cspi -n openebs
  ```
  Example output:
  
  <div class="co">
  NAME                     HOSTNAME                                     ALLOCATED   FREE    CAPACITY   STATUS   AGE
  cstor-pool-mirror-6gdq   gke-ranjith-csi-default-pool-6643eeb8-77f7   506K        39.7G   39.8G      ONLINE   103m
  </div>

- Verify the details of cStor pool cluster configuration using the following command:
  ```
  kubectl get cspc <CSPC name> -n <openebs_namespace> -o yaml
  ```
  Example command:
  ```
  kubectl get cspc -n openebs
  ```
  Example output:
  <div class="co">
  NAME                AGE
  cstor-pool-mirror   106m
  </div>
  
- Obtain the details of used blockdevices and available blockdevices using the following command:
  
  ```
  kubectl get bd -n openebs
  ```
  Example output:
  <div class="co">
  NAME                                           NODENAME                                     SIZE          CLAIMSTATE   STATUS   AGE
  blockdevice-070383c017742c82d14103a2d2047c0f   gke-ranjith-csi-default-pool-6643eeb8-77f7   42949672960   Claimed      Active   122m
  blockdevice-41d4416f6199a14b706e2ced69e2694a   gke-ranjith-csi-default-pool-6643eeb8-77f7   42949672960   Claimed      Active   122m
  blockdevice-c0179d93aebfd90c09a7a864a9148f85   gke-ranjith-csi-default-pool-6643eeb8-77f7   42949672960   Unclaimed    Active   122m
  blockdevice-ef810d7dfc8e4507359963fab7e9647e   gke-ranjith-csi-default-pool-6643eeb8-77f7   53687091200   Unclaimed    Active   122m
  </div>
  In this example, blockdevices `blockdevice-070383c017742c82d14103a2d2047c0f` and `blockdevice-41d4416f6199a14b706e2ced69e2694a` are used for the pool creation configuration `cstor-pool-mirror` mentioned in previous step . Both the blockdevices are attached to the same node. Also, there are 2 available blockdevice CRs present on the same node with `Unclaimed` state. These 2 blockdevices satisfied all the prerequisites conditions and can be used to replace any of the above mentioned used blockdevice with a recommended method that, only one blockdevice per raid group can be replaced at a time.

- Get the details of cStor pool configuration using the following command:

  ```
  kubectl get cspc <CSPC name> -n openebs -o yaml
  ```
  Example command:
  ```
  kubectl get cspc cstor-pool-mirror -n openebs -o yaml
  ```
  Example output shows the details of the selected CSPC cluster and used blockdevices. 
  
  <div class="co">
  spec:
  auxResources: {}
  pools:
  - nodeSelector:
      kubernetes.io/hostname: gke-ranjith-csi-default-pool-6643eeb8-77f7
    poolConfig:
      cacheFile: ""
      compression: "off"
      defaultRaidGroupType: mirror
      overProvisioning: false
      resources: null
    raidGroups:
    - blockDevices:
      - blockDeviceName: blockdevice-070383c017742c82d14103a2d2047c0f
        capacity: ""
        devLink: ""
      - blockDeviceName: blockdevice-41d4416f6199a14b706e2ced69e2694a
        capacity: ""
        devLink: ""
      isReadCache: false
      isSpare: false
      isWriteCache: false
      type: mirror
  </div>

- Replace the selected blockdevice from the RAID group by editing the corresponding CSPC configuration. Only requirement is that, one blockdevice per raid group can be replaced at a time. The following command will edit the CSPC configuration and user can replace one blockdevice in the corresponding raid group by replacing with new blockdevice.
  ```
  kubectl edit cspc <CSPC name> -n openebs 
  ```
  Example command:
  ```
  kubectl edit cspc cstor-pool-mirror -n openebs 
  ```
  
  After replacing the required blockdevice with new one, ensure that CSPC configuration is applied successfully with new blockdevice using the following command:
  ```
  kubectl get cspi <CSPI-name> -n openebs -o yaml
  ```
  Example command:
  ```
  kubectl get cspi cstor-pool-mirror-6gdq -n openebs -o yaml
  ```
  The following output shows the snippet of used blockdevice section.
  <div class="co">
  spec:
    auxResources: {}
    hostName: gke-ranjith-csi-default-pool-6643eeb8-77f7
    nodeSelector:
      kubernetes.io/hostname: gke-ranjith-csi-default-pool-6643eeb8-77f7
    poolConfig:
      cacheFile: ""
      compression: "off"
      defaultRaidGroupType: mirror
      overProvisioning: false
      resources: null
    raidGroup:
    - blockDevices:
      - blockDeviceName: blockdevice-070383c017742c82d14103a2d2047c0f
        capacity: ""
        devLink: /dev/disk/by-id/scsi-0Google_PersistentDisk_ranjith-mirror1
      - blockDeviceName: blockdevice-c0179d93aebfd90c09a7a864a9148f85
        capacity: ""
        devLink: /dev/disk/by-id/scsi-0Google_PersistentDisk_ranjith-mirror4
      isReadCache: false
      isSpare: false
      isWriteCache: false
      type: mirror
  </div>
  
  It shows that the details of new blockdevice is replaced with old one.
  
- Verify if blockdevice replacement is successful by using the following command:
  ```
  kubectl get bd -n openebs
  ```
  Example output:
  <div class="co">
  NAME                                           NODENAME                                      SIZE          CLAIMSTATE   STATUS   AGE
  blockdevice-070383c017742c82d14103a2d2047c0f   gke-ranjith-csi-default-pool-6643eeb8-77f7    42949672960   Claimed      Active   147m
  blockdevice-41d4416f6199a14b706e2ced69e2694a   gke-ranjith-csi-default-pool-6643eeb8-77f7    42949672960   Unclaimed    Active   147m
  blockdevice-c0179d93aebfd90c09a7a864a9148f85   gke-ranjith-csi-default-pool-6643eeb8-77f78   42949672960   Claimed      Active   147m
  blockdevice-ef810d7dfc8e4507359963fab7e9647e   gke-ranjith-csi-default-pool-6643eeb8-77f7    53687091200   Unclaimed    Active   147m
  </div>
  
  In the above example output, `blockdevice-41d4416f6199a14b706e2ced69e2694a` is replaced successfully with `blockdevice-c0179d93aebfd90c09a7a864a9148f85`.
  
  If resilvering on the pool is completed , state of old blockdevice will be changed to `Unclaimed` state and new blockdevice will be `Claimed`. In future, different verification methods will be added.
  
<h3><a class="anchor" aria-hidden="true" id="running-sample-application-jiva-volume-using-csi-provisioner"></a>Run a sample application on Jiva volume provisioned via Jiva CSI Provisioner</h3>  

OpenEBS Jiva volumes can now be provisioned with CSI driver from OpenEBS 1.5 version onwards.

**Note:** The current implementation only supports provisioning and de-provisioning of Jiva Volumes. This feature is under active development and considered to be in Alpha state.

**Prerequisites:**

- Kubernetes version 1.14 or higher
- OpenEBS Version 1.5 or higher installed. Recommended OpenEBS version is 1.8.
- iSCSI initiator utils installed on all the worker nodes.
- You have access to install RBAC components into `kube-system` namespace. The Jiva CSI driver components are installed in `kube-system` namespace to allow them to be flagged as system critical components.
- Base OS on worker nodes can be Ubuntu 16.04, Ubuntu 18.04 or CentOS.

**Overview**
- Install OpenEBS. 
- Install Jiva operator
- Install Jiva CSI Driver
- Create a Storage Class with Jiva CSI provisioner
- Provision sample application using a PVC spec  which uses SC with Jiva CSI provisioner


<h4><a class="anchor" aria-hidden="true" id="install-openebs-cspc"></a>Install OpenEBS</h4>

Latest OpenEBS version can be installed using the following command:

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-1.9.0.yaml
```

Verify if OpenEBS pods are in `Running` state using the following command:
```
kubectl get pod -n openebs
```
Example output:
<div class="co">
NAME                                          READY   STATUS    RESTARTS   AGE
maya-apiserver-77f9cc9f9b-jg825               1/1     Running   3          90s
openebs-admission-server-8c5b8565-d2q58       1/1     Running   0          79s
openebs-localpv-provisioner-f458bc8c4-bjmkq   1/1     Running   0          78s
openebs-ndm-lz4n6                             1/1     Running   0          80s
openebs-ndm-operator-7d7c9d966d-bqlnj         1/1     Running   1          79s
openebs-ndm-spm7f                             1/1     Running   0          80s
openebs-ndm-tm8ff                             1/1     Running   0          80s
openebs-provisioner-5fbd8fc74c-6zcnq          1/1     Running   0          82s
openebs-snapshot-operator-7d6dd4b77f-444zh    2/2     Running   0          81s
</div>

<h4><a class="anchor" aria-hidden="true" id="install-jiva-operator"></a>Install Jiva operator</h4>


Install Jiva operator using the following command:

```
kubectl create -f https://raw.githubusercontent.com/openebs/jiva-operator/master/deploy/operator.yaml
```

Verify the status of Jiva operator using the following command:

```
kubectl get pod -n openebs
```
Example output:

<div class="co">
jiva-operator-7765cbfffd-vt787                 1/1     Running   0          10s
maya-apiserver-77f9cc9f9b-jg825                1/1     Running   3          90s
openebs-admission-server-8c5b8565-d2q58        1/1     Running   0          79s
openebs-localpv-provisioner-f458bc8c4-bjmkq    1/1     Running   0          78s
openebs-ndm-lz4n6                              1/1     Running   0          80s
openebs-ndm-operator-7d7c9d966d-bqlnj          1/1     Running   1          79s
openebs-ndm-spm7f                              1/1     Running   0          80s
openebs-ndm-tm8ff                              1/1     Running   0          80s
openebs-provisioner-5fbd8fc74c-6zcnq           1/1     Running   0          82s
openebs-snapshot-operator-7d6dd4b77f-444zh     2/2     Running   0          81s
</div>

<h4><a class="anchor" aria-hidden="true" id="install-jiva-csi-driver"></a>Install Jiva CSI Driver</h4>

The node components make use of the host iSCSI binaries for iSCSI connection management. Depending on the OS, the Jiva operator will have to be modified to load the required iSCSI files into the node pods.

OpenEBS Jiva CSI driver components can be installed by running the following command.

Depending on the base OS, select the appropriate deployment file.

For Ubuntu 16.04 and CentOS:

```
kubectl apply -f https://raw.githubusercontent.com/openebs/jiva-csi/master/deploy/jiva-csi-ubuntu-16.04.yaml
```

For Ubuntu 18.04:

```
kubectl apply -f https://raw.githubusercontent.com/openebs/jiva-csi/master/deploy/jiva-csi.yaml
```

Verify if Jiva CSI Components are installed:

```
kubectl get pods -n kube-system -l role=openebs-jiva-csi
```
Example output:

<div class="co">
NAME                            READY   STATUS    RESTARTS   AGE
openebs-jiva-csi-controller-0   4/4     Running   0          6m14s
openebs-jiva-csi-node-56t5g     2/2     Running   0          6m13s
</div>

<h4><a class="anchor" aria-hidden="true" id="install-jiva-sc-csi-provisioner-"></a>Create a Storage Class with Jiva CSI provisioner</h4>

Create a Storage Class to dynamically provision volumes using Jiva CSI provisioner. You can save the following sample StorageClass YAML spec as `jiva-csi-sc.yaml`.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-csi-sc
provisioner: jiva.csi.openebs.io
parameters:
  cas-type: "jiva"
  replicaCount: "1"
  replicaSC: "openebs-hostpath"
```
Create Storage Class using the above YAML using the following command:

```
kubectl apply -f jiva-csi-sc.yaml
```

<h4><a class="anchor" aria-hidden="true" id="use-sc-to-provision-jiva-volume"></a>Provision a sample application using Jiva StorageClass</h4>

Create PVC by specifying the above Storage Class in the PVC spec. The following is a sample PVC spec which uses the above created Storage Class. In this example, the PVC YAML spec is saved as `jiva-csi-demo-pvc.yaml`.

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: minio-pv-claim
  labels:
    app: minio-storage-claim
spec:
  storageClassName: openebs-jiva-csi-sc
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 7Gi
```
Now, apply the PVC using the following command:

```
kubectl apply -f jiva-csi-demo-pvc.yaml
```

Now, deploy your application by specifying the PVC name. The following is a sample application spec which uses the above PVC.  In this example, the application YAML file is saved as `jiva-csi-demo-app.yaml`. 

```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  # This name uniquely identifies the Deployment
  name: minio-deployment
spec:
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        # Label is used as selector in the service.
        app: minio
    spec:
      # Refer to the PVC created earlier
      volumes:
      - name: storage
        persistentVolumeClaim:
          # Name of the PVC created earlier
                claimName: minio-pv-claim
      containers:
      - name: minio
        # Pulls the default Minio image from Docker Hub
        image: minio/minio
        args:
        - server
        - /storage
        env:
        # Minio access key and secret key
        - name: MINIO_ACCESS_KEY
          value: "minio"
        - name: MINIO_SECRET_KEY
          value: "minio123"
        ports:
        - containerPort: 9000
        # Mount the volume into the pod
        volumeMounts:
        - name: storage # must match the volume name, above
          mountPath: "/storage"
```
Now, apply the application using the following command:
```
kubectl apply -f jiva-csi-demo-app.yaml
```

Now, deploy the service related to the application. In this example, the service YAML file is saved as `jiva-csi-demo--app-service.yaml`. 

```
apiVersion: v1
kind: Service
metadata:
  name: minio-service
  labels:
    app: minio
spec:
  ports:
    - port: 9000
      nodePort: 32701
      protocol: TCP
  selector:
    app: minio
  sessionAffinity: None
  type: NodePort
```
Apply the service using the above YAML spec.
```
kubectl apply -f jiva-csi-demo--app-service.yaml
```
Verify if application pod is created successfully using the following command:

```
kubectl get pod -n <namespace>
```
Example output:
<div class="co">
NAME                                READY   STATUS    RESTARTS   AGE
minio-deployment-7c4ccff854-flt8c   1/1     Running   0          80s
</div>

Verify if PVC is created successfully using the following command:

```
kubectl get pvc -n <namespace>
```
Example output:
<div class="co">
NAME             STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS          AGE
minio-pv-claim   Bound    pvc-0053ef2d-2919-47ea-aeaf-9f1cbd915bae   7Gi        RWO            openebs-jiva-csi-sc   11s
</div>

Verify if PV is created successfully using the following command:

```
kubectl get pv
```
Example output:

<div class="co">
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                                 STORAGECLASS          REASON   AGE
pvc-0053ef2d-2919-47ea-aeaf-9f1cbd915bae   7Gi        RWO            Delete           Bound    default/minio-pv-claim                                                openebs-jiva-csi-sc            17s
pvc-fb21eb55-23ce-4547-922c-44780f2c4c2f   7Gi        RWO            Delete           Bound    openebs/openebs-pvc-0053ef2d-2919-47ea-aeaf-9f1cbd915bae-jiva-rep-0   openebs-hostpath               11s
</div>

In the above output, 2 PVs are created. As the `replicaSC` specified in storage class spec, Jiva replica will consume local PV created  using the Storage Class `openebs-hostpath`. Based on the required Jiva replica count, the number of local PVs will be provisioned. In this example, PV `pvc-fb21eb55-23ce-4547-922c-44780f2c4c2f` is dedicated for Jiva volume replica. If you specifiy `replicaCount` as 3, then a total of 4 PVs will be created. 

## See Also:

### [cStor Concepts](/docs/next/cstor.html)

### [cStor User Guide](/docs/next/ugcstor.html)

<hr>

<br>
