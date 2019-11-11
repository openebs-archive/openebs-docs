---
id: alphafeatures
title: Alpha Features
sidebar_label: Alpha Features
---
------



This section give different features of OpenEBS which is presently in Alpha version. These features are not recommend to perform on a production clusters. We suggest to familiarize these features on test clusters and reach out to OpenEBS [community slack](https://openebs.io/join-our-slack-community) if you have  any queries or help on trying out these features.



## cStor

[Running a sample application on a cStor volume provsioned via CSI provisioner](#running-sample-application-cstor-volume-using-csi-provisioner)

[Expand a cStor volume created using CSI provisioner](#expand-cstor-volume-created-using-csi-provisioner)



<font size="6">cStor</font>

<h3><a class="anchor" aria-hidden="true" id="running-sample-application-cstor-volume-using-csi-provisioner"></a>Running a sample application on a cStor volume provsioned via CSI provisioner</h3>


The [Container Storage Interface](https://github.com/container-storage-interface/spec/blob/master/spec.md) (CSI) is a standard for exposing arbitrary block and file storage systems to containerized workloads on Container Orchestration Systems(COs)  like Kubernetes combined with different storage vendors. This means, implementing a single CSI for a storage vendor is guaranteed to work with all COs. OpenEBS cStor volume can be now provisioned with CSI driver from OpenEBS 1.2 version onwards. This feature is under active development and considered to be in Alpha state. 

**Note:** The current implementation only supports provisioning, de-provisioning, snapshot & clone and expansion of cStor Volumes.

**Prerequisites**

- Kubernetes version 1.14 or higher is installed.
- OpenEBS Version 1.2 or higher installed. 
- The steps to install OpenEBS is [here](/docs/next/quickstart.html).
- iSCSI initiator utils installed on all the worker nodes.
- You have access to install RBAC components into `kube-system` namespace. The OpenEBS CSI driver components are installed in `kube-system` namespace to allow them to be flagged as system critical components.
- You will need to enable `ExpandCSIVolumes` and `ExpandInUsePersistentVolumes` feature gates on `kubelets` and `kube-apiserver` . 
- Base OS on worker should be Ubuntu 16.04, Ubuntu 18.04 or CentOS.



<h4><a class="anchor" aria-hidden="true" id="install-OpenEBS-csi-driver"></a>Install OpenEBS CSI Driver</h4>
The node components make use of the host iSCSI binaries for iSCSI connection management. Depending on the OS, the csi-operator will have to be modified to load the required iSCSI files into the node pods.

OpenEBS CSI driver components can be installed by running the following command:

Depending on the OS, select the appropriate deployment file.

- For Ubuntu 16.04 and CentOS:

  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/cstor-csi/master/deploy/csi-operator.yaml 
  ```

- For Ubuntu 18.04:

  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/cstor-csi/master/deploy/csi-operator-ubuntu-18.04.yaml
  ```

- Verify that the OpenEBS CSI Components are installed.

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
Apply CSPC operator YAML file using the following command:

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/cspc-operator.yaml
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

Edit the following parameter in the sample CSPC YAML:

**blockDeviceName**:- Provide the block device names to be used for provisioning cStor pool. All the block devices must be on the same node. 

**kubernetes.io/hostname**: Provide the hostname where the cStor pool will be created using the set of block devices attached to that node.



The above sample YAML creates a cStor pool on the corresponding node with provided block device. The above example will create a cStor pool in the CSPC cluster. If you need to create multiple cStor pools in a CSPC cluster, get the YAML from [here](https://raw.githubusercontent.com/sonasingh46/artifacts/master/day2ops/cspc/cspc-stripe.yaml).

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

<div class="co">NAME                   HOSTNAME                                     ALLOCATED   FREE    CAPACITY   STATUS   AGEcstor-disk-cspc-7hkl   gke-ranjith-csi-default-pool-a9a13f27-6qv1   50K         39.7G   39.8G      ONLINE   2m43s
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

You should specify the correct cStor `cstorPoolCluster` name from your cluster and specify the desired `replicaCount` for the cStor volume.

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

Verify the status of the app by running the following command:

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



The busybox is instructed to write the date when it starts into the mounted path at `/.mnt/openebs-csi/date.txt`. 

Example output:

<div class="co">
Sat Nov  9 06:59:27 UTC 2019
</div>

**Note:** While the asynchronous handling of the Volume provisioning is in progress, the application pod description may throw some errors like:

- Waiting for CVC to be bound: Implies volume components are still being created

- Volume is not ready: Replicas yet to connect to controller: Implies volume components are already created but yet to interact with each other.





<h3><a class="anchor" aria-hidden="true" id="expand-cstor-volume-created-using-csi-provisioner"></a>Expand a cStor volume created using CSI provisioner</h3>


The following section will give the steps to expand a cStor volume which is created using CSI provisioner. 

**Notes to remember:**

- Only dynamically provisioned cStor volumes can be resized.
- You can only expand cStor volumes containing a file system if the file system is XFS, ext3, or ext4.
- Ensure that the corresponding StorageClass has the `allowVolumeExpansion` field set to `true` when the volume is provisioned.

**Steps to perform the cStor volume expansion:**

1. Perform the following command to get the details of the PVC.

   ```
   kubectl get pvc
   ```

   Example output:

   <div class="co">NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             AGE
      demo-csivol-claim   Bound    pvc-723283b6-02bc-11ea-a139-42010a8000b2   5Gi        RWO            openebs-csi-cstor-disk   66m
      </div>

2.  Update the increased PVC size in the following section of the PVC YAML. 

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

3.  Wait for the updated capacity to reflect in PVC status (pvc.status.capacity.storage). Perform the following command to verify the updated size of the PVC:

   ```
   kubectl get pvc
   ```

     Example snippet:

   <div class="co">
   NAME                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS             AGE
      demo-csivol-claim   Bound    pvc-723283b6-02bc-11ea-a139-42010a8000b2   9Gi        RWO            openebs-csi-cstor-disk   68m
    </div>





<br>

## See Also:

### [cStor Concepts](/docs/next/cstor.html)

### [cStor User Guide](/docs/next/ugcstor.html)

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
