---
id: deploycstor
title: Provisioning cStor
sidebar_label: Provisioning cStor
---
------

cStor provides storage scalability along with ease of deployment and usage. cStor can handle multiple disks of same size per Node and create different storage pools. These Storage Pools can be used to create cStor volumes which can be utilized to run applications. 

Additionally, you can add disks using the documentation available at [Kubernetes docs](https://cloud.google.com/compute/docs/disks/add-persistent-disk). These disks can be used for creating the OpenEBS cStor pool by combining all the disks per node. You can scale the storage pool by adding more disks to the instance and in turn to the storage pool. Storage pools will be created in a striped manner.

**Note:**

1. cStor synchronizes data periodically to the disks. The application must send explicit 'sync' CDBs to commit the data to disks.
2. cStor assumes that data written to a disk is persistent. Hence, write cache of disk must be disabled if it's cache is not backed by non-volatile memory.

## Provisioning cStor Storage Engine 

cStor can be provisioned in your Kubernetes cluster by performing the following steps.

1. Verify if the OpenEBS installation is complete. If not, go to [installation](/docs/next/installation.html).

   OpenEBS pods are created under “*openebs*” namespace. Node Disk Manager, CAS Template and default Storage Classes are created after installation.

   **Node Disk Manager** manages the disks associated with each node in the cluster. You can get the disk details by running the following command.

   ```
   kubectl get disk
   ```

   Following is an example output.

   ```
   NAME                                      AGE
   disk-184d99015253054c48c4aa3f17d137b1     2m
   disk-2f6bced7ba9b2be230ca5138fd0b07f1     2m
   disk-806d3e77dd2e38f188fdaf9c46020bdc     2m
   disk-8b6fb58d0c4e0ff3ed74a5183556424d     2m
   disk-bad1863742ce905e67978d082a721d61     2m
   disk-d172a48ad8b0fb536b9984609b7ee653     2m
   sparse-52222d74cbf29ed20a563fdb97195bf7   2m
   sparse-54c305f78e51106beb48696434f194b5   2m
   sparse-c4898b7e99b99f850968c99d0fe7bf52   2m
   ```

   **CAS Template** is an approach to provision persistent volumes that make use of CAS storage engine. The following command helps check the CAS Template components.

   ```
   kubectl get cast 
   ```

   It also installs the default cStor **Storage Class** which can be used in your pvc yaml file to create Persistent Volume. For more information about sample storage classes used for different applications, see [storage classes](/docs/next/setupstorageclasses.html). You can get the storage classes that are already applied by using the following command.

   ```
   kubectl get sc
   ```

   Following is an example output.

   ```
   NAME                        PROVISIONER                                                AGE
   openebs-cstor-sparse        openebs.io/provisioner-iscsi                               1h
   openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   2m
   openebs-standard            openebs.io/provisioner-iscsi                               2m
   standard (default)          kubernetes.io/gce-pd                                       3h
   ```

2. Installing OpenEBS creates cStor sparse pool by default on each node with a name such as *cstor-spare-pool-<wxyz>*. These sparse pools are created on the host disk of each node. You can get the default cStor pool names by using the following command. 

   ```
   kubectl get sp
   ```

   Following is an example output.

   ```
   NAME                     AGE
   cstor-sparse-pool-5gfj   1m
   cstor-sparse-pool-6bbe   1m
   cstor-sparse-pool-kn4x   1m
   default                  1m
   ```

   If you are using default cstor-sparse-pool, skip step 3, 4, and 5. 

3. If you would like to create a storage pool using external disks which are mounted on nodes, then create a file called *openebs-config.yaml* in your master node and add the following contents into the file. In this case, there are 2 disks per node attached and creates a storage pool using these 2 disks per node in a striped manner. Hence there are a total of 6 external disks i.e. 2 disks per node which are mentioned in the following yaml file.

   ```
   ---
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: openebs-cstor-default-0.7.0
     annotations:
       openebs.io/cas-type: cstor
       cas.openebs.io/config: |
         - name: StoragePoolClaim
           value: "cstor-pool-default-0.7.0"
   provisioner: openebs.io/provisioner-iscsi
   ---
   #Use the following YAMLs to create a cStor Storage Pool.
   # and associated storage class.
   apiVersion: openebs.io/v1alpha1
   kind: StoragePoolClaim
   metadata:
     name: cstor-pool-default-0.7.0
   spec:
     name: cstor-pool-default-0.7.0
     type: disk
     maxPools: 3
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

4. Edit *openebs-config.yaml* file to include disk details associated to each node in the cluster which you are using for creating the OpenEBS cStor Pool. Replace the disk names under *diskList* section, which you can get from running `kubectl get disks` command.

   ```
   disks:
       diskList:
   # Replace the following with actual disk CRs from your cluster `kubectl get disks`
   #      - disk-0c84c169ab2f398b92914f56dad41f81
   #      - disk-66a74896b61c60dcdaf7c7a76fde0ebb
   #      - disk-b34b3f97840872da9aa0bac1edc9578a
   ```

   Following is an example.

   ```
   disks:
       diskList:
   	   - disk-184d99015253054c48c4aa3f17d137b1     	
   	   - disk-2f6bced7ba9b2be230ca5138fd0b07f1     
   	   - disk-806d3e77dd2e38f188fdaf9c46020bdc     
   	   - disk-8b6fb58d0c4e0ff3ed74a5183556424d     
   	   - disk-bad1863742ce905e67978d082a721d61     	
   	   - disk-d172a48ad8b0fb536b9984609b7ee653
   ```

5. Apply the modified *openebs-config.yaml* file by running the following command.

   ```
   kubectl apply -f openebs-config.yaml
   ```

    Using the above command will create different storage pools using 2 disks per node in a striped manner. You can get the storage pool details by running following command.

   ```
   kubectl get sp
   ```

   Following is an example output.

   ```
   NAME                            AGE
   cstor-pool-default-0.7.0-n4tz   17s
   cstor-pool-default-0.7.0-okk0   17s
   cstor-pool-default-0.7.0-u6rf   17s
   cstor-sparse-pool-5gfj          4m
   cstor-sparse-pool-6bbe          4m
   cstor-sparse-pool-kn4x          4m
   default                         4m
   ```

6. You have now deployed OpenEBS cluster with cStor Engine with 3 different storage pools. It can create OpenEBS cStor volume on these Storage Pools. By default, OpenEBS cStor volume will be running with 3 replica count.  Check cstor pool are created and their running status by following command

    ```
     kubectl get pods  -n openebs
    ```

    Following is an example output

    ```
    NAME                                             READY     STATUS    RESTARTS   AGE
    cstor-pool-default-0.7.0-n4tz-5547d56d47-7pzh5   2/2       Running   0          54s
    cstor-pool-default-0.7.0-okk0-56f6d48985-4zp8k   2/2       Running   0          54s
    cstor-pool-default-0.7.0-u6rf-567f7fc48d-wp8dw   2/2       Running   0          54s
    cstor-sparse-pool-5gfj-585854bc57-h4jx4          2/2       Running   0          5m
    cstor-sparse-pool-6bbe-84896cc4df-qh27j          2/2       Running   0          5m
    cstor-sparse-pool-kn4x-8497545d69-hd7sf          2/2       Running   0          5m
    maya-apiserver-5c48dd4f74-bp2h4                  1/1       Running   0          5m
    openebs-ndm-b6xs9                                1/1       Running   0          5m
    openebs-ndm-jzmr7                                1/1       Running   0          5m
    openebs-ndm-m8zxz                                1/1       Running   0          5m
    openebs-provisioner-95c8cb5df-8wmq2              1/1       Running   0          5m
    openebs-snapshot-operator-6dbcb558b4-2pwfp       2/2       Running   0          5m
    ```

7. Get the sample PVC yaml file which can be used to create OpenEBS cStor volume with default CAS Template values. The following command will help you get the sample pvc yaml file.

   ```
   git clone https://github.com/openebs/openebs.git
   cd openebs/k8s/demo/
   ```

   This sample PVC yaml will use default storage class *openebs-cstor-default-0.7.0* created as part of *openebs-operator.yaml* installation.

8. Apply the sample pvc yaml file to create cStor volume using the following command.

   ```
   kubectl apply -f pvc-standard-cstor-default.yaml
   ```

9. Get the pvc details by running the following command.

   ```
   kubectl get pvc
   ```

   Following is an example output.

   ```
   NAME                    STATUS    VOLUME                                    CAPACITY   ACCESS MODES   STORAGECLASS                  AGE
   demo-cstor-vol1-claim   Bound     default-demo-cstor-vol1-claim-290751863   4G         RWO    openebs-cstor-default-0.7.0   17s
   ```

10. Get the pv details by running the following command.

    ```
    kubectl get pv
    ```

    Following is an example output.

    ```
    NAME                                      CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS  CLAIM                           STORAGECLASS                  REASON    AGE
    default-demo-cstor-vol1-claim-290751863   4G         RWO            Delete           Bound    default/demo-cstor-vol1-claim   openebs-cstor-default-0.7.0             31s
    ```

11. Use this pvc name in your application yaml to run your application using OpenEBS cStor volume.


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
