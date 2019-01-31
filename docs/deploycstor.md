---
id: deploycstor
title: Provisioning cStor
sidebar_label: Provisioning cStor
---
------

cStor provides storage scalability along with ease of deployment and usage. cStor can handle multiple disks of same size per Node and create different storage pools. These Storage Pools can be used to create cStor volumes which can be utilized to run applications. 

Additionally, you can add disks using the documentation available at [Kubernetes docs](https://cloud.google.com/compute/docs/disks/add-persistent-disk#create_disk). These disks can be used for creating the OpenEBS cStor pool by combining all the disks per node. You can scale the storage pool by adding more disks to the instance and in turn to the storage pool. Storage pools will be created in a striped manner. Refer [Storage Pools](/docs/next/setupstoragepools.html) section to know more about Storage Pool and how cStor pools are getting created.

**Note:**

1. cStor synchronizes data periodically to the disks. The application must send explicit 'sync' CDBs to commit the data to disks.
2. cStor assumes that data written to a disk is persistent. Hence, write cache of disk must be disabled if it's cache is not backed by non-volatile memory.

## Provisioning cStor Storage Engine 

cStor can be provisioned in your Kubernetes cluster by performing the following steps.

1. Verify if the OpenEBS installation is complete. If not, go to [installation](/docs/next/installation.html).

   OpenEBS pods are created under “*openebs*” namespace. Node Disk Manager, CAS Template and default Storage Classes are created after installation.

   You can get the OpenEBS pods status by running following command

   ```
   kubectl get pods -n openebs
   ```

   **Node Disk Manager** manages the disks associated with each node in the cluster. You can get the disk details by running the following command.

   ```
   kubectl get disk
   ```

   Following is an example output.

   ```
   NAME                                      AGE
   disk-184d99015253054c48c4aa3f17d137b1     5m
   disk-2f6bced7ba9b2be230ca5138fd0b07f1     5m
   disk-806d3e77dd2e38f188fdaf9c46020bdc     5m
   disk-8b6fb58d0c4e0ff3ed74a5183556424d     5m
   disk-bad1863742ce905e67978d082a721d61     5m
   disk-d172a48ad8b0fb536b9984609b7ee653     5m
   sparse-ba87c290cada443a16acd06a7e35edf6   5m
   sparse-c91b608b053885bd1707fe743ecef216   5m
   sparse-da7ab0d0a62240ef2ae3acbce024379e   5m
   ```

   **CAS Template** is an approach to provision persistent volumes that make use of CAS storage engine. The following command helps check the CAS Template components.

   ```
   kubectl get castemplate
   ```

   It also installs the default cStor **Storage Class** which can be used in your pvc yaml file to create Persistent Volume. For more information about sample storage classes used for different applications, see [storage classes](/docs/next/setupstorageclasses.html). You can get the storage classes that are already applied by using the following command.

   ```
   kubectl get sc
   ```

   Following is an example output.

   ```
   NAME                        PROVISIONER                                                AGE
   openebs-cstor-sparse        openebs.io/provisioner-iscsi                               2h
   openebs-jiva-default        openebs.io/provisioner-iscsi                               2h
   openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   2h
   standard (default)          kubernetes.io/gce-pd                                       2h
   ```

2. Installing OpenEBS creates cStor sparse pool by default on each node with a name such as *cstor-spare-pool-wxyz*. These sparse pools are created on the host disk of each node. You can get the default cStor pool names by using the following command. 

   ```
   kubectl get sp
   ```

   Following is an example output.

   ```
   NAME                     AGE
   cstor-sparse-pool-3dud   5m
   cstor-sparse-pool-jip4   5m
   cstor-sparse-pool-pag5   5m
   default                  6m
   ```

   If you are using default cstor-sparse-pool, skip to step 9. 

3. If you would like to create a storage pool using external disks which are mounted on nodes, you can create storage pool either manually or by auto pool method.

   In the manual method, you have to select the disks which will be used for cStor pool creation in the sample YAML file provided in Step4. You can create a file called *openebs-config.yaml* in your master node and add the following contents into the file. In this case, there are 2 disks per node attached which creates a storage pool per node in a striped manner. Hence there are a total of 6 external disks i.e. 2 disks per node which are mentioned in the following yaml file.  Go to Step4 to edit the *openebs-config.yaml* to include the required disks for creating cStor Pool.

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

   In the auto pool method, you must not select the disks which are detected by NDM for creating cStor Pools. You can create a file called *openebs-config.yaml* in your master node and add the following contents into the file.  Go to Step5 to apply the modified *openebs-config.yaml* for creating cStor Pools.

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

4. Edit *openebs-config.yaml* file to include disk details associated to each node in the cluster which you are using for creating the OpenEBS cStor Pool. Replace the disk names under *diskList* section, which you can get from running the `kubectl get disks` command.

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
   # Replace the following with actual disk CRs from your cluster from `kubectl get disks`
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
   NAME                     AGE
   cstor-disk-0xlf          12s
   cstor-disk-79pr          12s
   cstor-disk-r2ho          12s
   cstor-sparse-pool-3dud   10m
   cstor-sparse-pool-jip4   10m
   cstor-sparse-pool-pag5   10m
   default                  10m
   ```
   Also it will create Storage Class called *cstor-disk*. You can get the storage class details by running following command.

   ```
   kubectl  get sc
   ```

   Following is an example output.

   ```
   NAME                        PROVISIONER                                                AGE
   openebs-cstor-disk          openebs.io/provisioner-iscsi                               10m
   openebs-cstor-sparse        openebs.io/provisioner-iscsi                               1h
   openebs-jiva-default        openebs.io/provisioner-iscsi                               1h
   openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   1h
   standard (default)          kubernetes.io/gce-pd                                       2h
   ```

6. You have now deployed OpenEBS cluster with cStor Engine with 3 different storage pools. It can create OpenEBS cStor volume on these Storage Pools. By default, OpenEBS cStor volume will be running with 3 replica count.  Check cStor pools are created and their running status by following command

    ```
    kubectl get pods -n openebs
    ```

    Following is an example output

    ```
    NAME                                         READY     STATUS    RESTARTS   AGE
    cstor-disk-0xlf-74f844cc66-tg8qv             2/2       Running   0          31s
    cstor-disk-79pr-649bf7749d-m4b5w             2/2       Running   0          31s
    cstor-disk-r2ho-5ffc787649-9dw7k             2/2       Running   0          31s
    cstor-sparse-pool-3dud-5bd96595dc-xgbq7      2/2       Running   0          10m
    cstor-sparse-pool-jip4-d955bd6c6-bz928       2/2       Running   0          10m
    cstor-sparse-pool-pag5-7f49dc78d9-4mg9m      2/2       Running   0          10m
    maya-apiserver-79449598d8-dps4p              1/1       Running   0          10m
    openebs-ndm-6nmb8                            1/1       Running   0          10m
    openebs-ndm-7zf5h                            1/1       Running   0          10m
    openebs-ndm-hmrnr                            1/1       Running   0          10m
    openebs-provisioner-78d5757698-84gnw         1/1       Running   0          10m
    openebs-snapshot-operator-849f69b9bb-2vqwl   2/2       Running   0          10m\
    ```

7. If you are using cStor Pool which is created using external disks, then apply the sample PVC yaml file which can be used to create OpenEBS cStor volume with default CAS Template values. This sample PVC yaml will use storage class named *openebs-cstor-disk* which is created as part of *openebs-config.yaml* installation.

8. Apply the sample pvc yaml file to create cStor volume on cStor Pool created using external disks by following command.

   ```
   kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/sample-pv-yamls/pvc-standard-cstor-disk.yaml
   ```
   Goto Step 11 for checking the pvc running status.

9. If you are using cStor sparse pool which is created on sparse disk, then apply  the sample PVC yaml file which can be used to create OpenEBS cStor volume with default CAS Template values.  This sample PVC yaml will use default storage class *openebs-cstor-sparse* created as part of *openebs-operator.yaml* installation.

   **Note:** cStor sparse pool should be used for POC and testing environments. We recommend to use disk pool for actual workloads.


10. Apply the sample pvc yaml file to create cStor volume on cStor sparse Pool using the following command. 

  ```
  kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-cstor-default.yaml
  ```

11. Get the pvc details by running the following command.

    ```
    kubectl get pvc
    ```

    Following is an example output which is created as part of step 8.

    ```
    NAME                         STATUS    VOLUME                                        CAPACITY   ACCESS MODES   STORAGECLASS         AGE
    demo-cstor-disk-vol1-claim   Bound     default-demo-cstor-disk-vol1-claim-2386477986   	   4G         RWO            openebs-cstor-disk   12s
    ```

12. Get the pv details by running the following command.

   ```
   kubectl get pv
   ```

   Following is an example output.

   ```
   NAME                                            CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                STORAGECLASS         REASON    AGE
   default-demo-cstor-disk-vol1-claim-2386477986   4G         RWO            Delete           Bound     default/demo-cstor-disk-vol1-claim   openebs-cstor-disk             33s
   ```

13. Use this pvc name in your application yaml to run your application using OpenEBS cStor volume.

<br><br>



### See Also:

#### [cStor Overview](/docs/next/cStor.html)

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
