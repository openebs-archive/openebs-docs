# Adding disks to a StoragePoolClaim

Note: The following steps are applicable only for OpenEBS version installed from 1.0 onwards. The cStor pool running on OpenEBS version upto 0.9, follow the steps mentioned [here](https://github.com/openebs/openebs-docs/blob/day_2_ops/docs/cstor_add_disks_to_spc_disk_cr.md) to expand the cStor pool.

1. Attach the new disks to the node

   Attach new disks to the node on which the cStor pool need to be expanded. If there are some available disk already present on the corresponding node, then skip to step 2. If you don't have any avaialble disk on the correponding node, add the disks to the node. The steps for attaching disks will be different based on where your Kubernetes cluster is running.  For on premises installations, follow your normal procedures for adding block storage.  For the cloud, follow the documentation provided by your cloud provider.

2. Find the names of all the blockdevice CR. This command will return all the disks details including node name where the disk is attached, size, claim state etc. In this example, we are considering OpenEBS is installed in `openebs` namespace. Get the available blockdevice CR details on the node where cStor pool need to be expanded.

   ```
   kubectl get bd -n openebs
   NAME                                           NODENAME                                       SIZE          CLAIMSTATE   STATUS   AGE
   blockdevice-77f834edba45b03318d9de5b79af0734   gke-ranjith-minio-default-pool-e076cf5f-q1k1   42949672960   Unclaimed    Active   10s
   blockdevice-936911c5c9b0218ed59e64009cc83c8f   gke-ranjith-minio-default-pool-e076cf5f-q1k1   42949672960   Claimed      Active   16h
   ```
3. Get the `disk-id` and `nodename` of blockdevice which is going to be added to the cStor pool. This `disk-id` is required in step 11. The following command will obatin the `disk-id` and `nodename` of the corresponding blockdevice:
   
   ```
   kubectl describe bd <blockdevice-id> -n openebs | grep -i "\(hostname\|by-id\)"
   ```
   Example command:
   ```
   kubectl describe bd blockdevice-77f834edba45b03318d9de5b79af0734 -n openebs | grep -i "\(hostname\|by-id\)"
   ```
   Example output:
   ```
   Labels:       kubernetes.io/hostname=gke-ranjith-minio-default-pool-e076cf5f-q1k1
       Kind:  by-id
         /dev/disk/by-id/scsi-0Google_PersistentDisk_ranjith-disk2
         /dev/disk/by-id/google-ranjith-disk2
   ```

4. Get the StoragePoolClaim(SPC) name of the corresponding cStor pool and then get the `UID` of the obtained SPC using the following commands:
   SPC:
   ```
   kubectl get spc
   ```
   Example output:
   ```
   NAME              AGE
   cstor-disk-pool   20m
   ```
   
   Describe of SPC:
   ```
   kubectl describe spc cstor-disk-pool | grep UID
   ```
   The `UID` should be obtained using the path `metadata.UID`.
   Example output:
   ```
     UID:               225a5367-17f0-11ea-8c06-42010aa00032
   ```
5. Get the `UID` of the selected blockdevice using the following command. You have to get the details from from the path `metadata.UID`.
   ```
   kubectl describe bd <blockdevice_name> -n <openebs_installed_namespace>
   ```
   Example command:
   ```
   kubectl describe bd blockdevice-936911c5c9b0218ed59e64009cc83c8f -n openebs
   ```
   The following is the sample snippet of the above command:
   ```
   Kind:         BlockDevice
   Metadata:
     Creation Timestamp:  2019-12-06T06:23:55Z
     Generation:          2
     Resource Version:    25822
     Self Link:           /apis/openebs.io/v1alpha1/namespaces/openebs/blockdevices/blockdevice-936911c5c9b0218ed59e64009cc83c8f
     UID:                 fae4dadd-17f0-11ea-8c06-42010aa00032
   Spec:
     Capacity:
       Logical Sector Size:   512
       Physical Sector Size:  0
       Storage:    
   ```
   From the example output, UID of the selected blockdevice is `fae4dadd-17f0-11ea-8c06-42010aa00032`

6. Now, create a BlockDeviceClaim(BDC) CR using the following YAML spec.
   ```
   apiVersion: openebs.io/v1alpha1
   kind: BlockDeviceClaim
   metadata:
     finalizers:
     - storagepoolclaim.openebs.io/finalizer
     labels:
       openebs.io/storage-pool-claim: <spc_name>
     name: bdc-<blockdevice_uid>
     namespace: openebs
     ownerReferences:
     - apiVersion: openebs.io/v1alpha1
       blockOwnerDeletion: true
       controller: true
       kind: StoragePoolClaim
       name: <spc_name>
       uid: <spc_uid>
   spec:
     blockDeviceName: <blockdevice_name>
     blockDeviceNodeAttributes:
       hostName: <hostName>
     resources:
       requests:
         storage: <capacity>
   ```
   Fill the following details in to the BDC YAML spec:
   - <spc_name> : SPC name of the corresponding cStor pool which is identified in step 4.
   - <blockdevice_uid> : UID of the selected blockdevice which is identified in step 5.
   - <spc_uid> : UID of corresonding SPC which is identified in step 4.
   - <hostName> : Hostname of the selected blockdevice which can be identified in step 2
   - <capacity> : Provide the Capacity of selected blockdevice like 100G, 2T etc.
   
   
   In this example, a new file is created as `bdc-cstor-bd2.yaml`. Example snippet of modified YAML:
   ```
   apiVersion: openebs.io/v1alpha1
   kind: BlockDeviceClaim
   metadata:
     finalizers:
     - storagepoolclaim.openebs.io/finalizer
     labels:
       openebs.io/storage-pool-claim: cstor-disk-pool
     name: bdc-fae4dadd-17f0-11ea-8c06-42010aa00032
     namespace: openebs
     ownerReferences:
     - apiVersion: openebs.io/v1alpha1
       blockOwnerDeletion: true
       controller: true
       kind: StoragePoolClaim
       name: cstor-disk-pool
       uid: 225a5367-17f0-11ea-8c06-42010aa00032
   spec:
     blockDeviceName: blockdevice-936911c5c9b0218ed59e64009cc83c8f
     blockDeviceNodeAttributes:
       hostName: gke-ranjith-cstor-default-pool-85ebc9b5-vhw6
     resources:
       requests:
         storage: 40G
   ```
   Apply the BDC YAML spec to claim the selected BD CR using the following command:
   ```
   kubectl apply -f bdc-cstor-bd2.yaml
   ```
   Example output:
   ```
   blockdeviceclaim.openebs.io/bdc-fae4dadd-17f0-11ea-8c06-42010aa00032 created
   ```
7. Verify BDC is created for the selected blorkcdevice using the following command:
   ```
   kubectl get bdc -n openebs
   ```
   Example output:
   ```
   NAME                                       BLOCKDEVICENAME                                PHASE   AGE
   bdc-bfde0fb4-17ef-11ea-8c06-42010aa00032   blockdevice-77f834edba45b03318d9de5b79af0734   Bound   54m
   bdc-fae4dadd-17f0-11ea-8c06-42010aa00032   blockdevice-936911c5c9b0218ed59e64009cc83c8f   Bound   28s
   ```
   From the example output, BDC for selected BD CR, in this case `blockdevice-936911c5c9b0218ed59e64009cc83c8f` is created. 
   
   Verify if `CLAIMSTATE` of the selected BD cr is changed to `Claimed` using the following command:
   ```
   kubectl get bd -n openebs
   ```
   Example output:
   ```
   NAME                                           NODENAME                                       SIZE          CLAIMSTATE   STATUS   AGE
   blockdevice-77f834edba45b03318d9de5b79af0734   gke-ranjith-cstor-default-pool-85ebc9b5-vhw6   42949672960   Claimed      Active   57m
   blockdevice-936911c5c9b0218ed59e64009cc83c8f   gke-ranjith-cstor-default-pool-85ebc9b5-vhw6   42949672960   Claimed      Active   48m
   ```
   In the example output, `CLAIMSTATE` of the selected BD CR is changed.
   
8. Get the cStor pools details using the following command:

   ```
   kubectl get csp
   ```
   
   Example output:
   
   ```
   NAME                   ALLOCATED   FREE    CAPACITY   STATUS    TYPE      AGE
   cstor-disk-pool-f7gq   688K        39.7G   39.8G      Healthy   striped   15m
   ```
   In the above example, only one cStor pool is running. If there are multiple cStor pools running on the cluster, identify the pool which need to be expanded and find the avaialble blockdevice on the same node where associated pool pod is running . The availble blockdevice should be `Active`, `Unclaimed` and does not contain any filesystem. 
   
9. Find the pool pod that is running on that host where the cStor pool need to be expanded.
   ```
   kubectl -n openebs get pods -o wide | grep <HOSTNAME> | grep <POOL_NAME>
   ```
   Example command:
   ```
   kubectl -n openebs get pods -o wide | grep gke-ranjith-minio-default-pool-e076cf5f-q1k1 | grep cstor-disk-pool-f7gq
   ```
   Example output:
   ```
   cstor-disk-pool-f7gq-6c94857b9c-q7v2w                             3/3     Running   0          16m   10.108.0.43   gke-ranjith-minio-default-pool-e076cf5f-q1k1   <none>      <none>

   ```
   From the output, identify the cStor pool pod name. This pool pod name will be required in step 10. 
   From the example output, cStor pool pod name is `cstor-disk-pool-f7gq-6c94857b9c-q7v2w`.
   
10. Identify the ZFS storage pool corresponding to the cStor pool pod. The following steps will obtain the ZFS storage pool of corresponding cStor pool pod.

   ```
   kubectl -n openebs exec -it <cStor_POOL_POD_NAME> -c cstor-pool -- zpool status
   ```
   Example command:
   ```
   kubectl exec -it cstor-disk-pool-f7gq-6c94857b9c-q7v2w -n openebs -c cstor-pool -- zpool status
   ```
   Example output:
   ```
    pool: cstor-edd5005d-17ce-11ea-8413-42010aa00017
   state: ONLINE
    scan: none requested
   config:

          NAME                                         STATE     READ WRITE CKSUM
   	  cstor-edd5005d-17ce-11ea-8413-42010aa00017   ONLINE       0     0     0
    	   scsi-0Google_PersistentDisk_ranjith-disk1  ONLINE       0     0     0
   
   errors: No known data errors
   ```
   
11. Add the new disk to the pool by adding `disk-id` which is obtained in step 3. For the `disk-id`, it requires only the name of the device, not the full path that found in the disk description. For example, in case of example output in step 3, use `scsi-0Google_PersistentDisk_ranjith-disk2` as `DISK_ID` in below command.

    ```
    kubectl -n openebs exec -it <POOL_POD_NAME> -c cstor-pool -- zpool add <POOL_NAME> <DISK_ID>
    ```
    Example command:
    ```
    kubectl -n openebs exec -it cstor-disk-pool-f7gq-6c94857b9c-q7v2w -c cstor-pool -- zpool add cstor-edd5005d-17ce-11ea-8413-42010aa00017 scsi-0Google_PersistentDisk_ranjith-disk2
    ```
    If command is successfull, it will goto a new line.

12. Verify the disk was added to the pool using the following command:

    ```
    kubectl -n openebs exec -it <POOL_POD_NAME> --container cstor-pool -- zpool status
    ```
    Example command:
    ```
    kubectl exec -it cstor-disk-pool-f7gq-6c94857b9c-q7v2w -n openebs -c cstor-pool -- zpool status
    ```
    Example output:
    ```
     pool: cstor-edd5005d-17ce-11ea-8413-42010aa00017
    state: ONLINE
     scan: none requested
    config:

	   NAME                                         STATE     READ WRITE CKSUM
           cstor-edd5005d-17ce-11ea-8413-42010aa00017   ONLINE       0     0     0
             scsi-0Google_PersistentDisk_ranjith-disk1  ONLINE       0     0     0
             scsi-0Google_PersistentDisk_ranjith-disk2  ONLINE       0     0     0

    errors: No known data errors
    ```
13. Verify if the size of the cStor pool has updated or not using the following command:
    ```
    kubectl get csp
    ```
    Example output:
    ```
    NAME                   ALLOCATED   FREE    CAPACITY   STATUS    TYPE      AGE
    cstor-disk-pool-f7gq   650K        79.5G   79.5G      Healthy   striped   20m
    ```
    The example output shows that `CAPACITY` is exapnded to `79.5G` from `39.8G`.

14. Update the CSP spec by adding the selected blockdevice details. This can be performed by following command:
    ```
    kubectl edit csp <cStor_Pool_Name>
    ```
    Example command:
    ```
    kubectl edit csp cstor-disk-pool-q3ga
    ```
    The following snippet contains the details of the selected blockdevice CR which needs to be added to the corresponding CSP.
    ```
    - deviceID: /dev/disk/by-id/scsi-0Google_PersistentDisk_ranjith-disk1
      inUseByPool: true
      name: blockdevice-936911c5c9b0218ed59e64009cc83c8f
    ```
    Example snippet after modification:
    ```
    spec:
      group:
      - blockDevice:
        - deviceID: /dev/disk/by-id/scsi-0Google_PersistentDisk_ranjith-disk2
          inUseByPool: true
          name: blockdevice-77f834edba45b03318d9de5b79af0734
        - deviceID: /dev/disk/by-id/scsi-0Google_PersistentDisk_ranjith-disk1
          inUseByPool: true
          name: blockdevice-936911c5c9b0218ed59e64009cc83c8f
    poolSpec:
      cacheFile: ""
      overProvisioning: false
      poolType: striped
    ```
15. Repeat steps 2 - 14 for each disk to be added to the required cStor pool.

16. Add the new blockdevice CR which is added to the cStor pools to the YAML file of your StoragePoolClaim and apply the updated YAML using the following command:

    ```
    kubectl apply -f <SPC_YAML_FILE>
    ```
    Example command:
    ```
    kubectl apply -f spcnew.yaml
    ```
    In this example, existing StoragePoolClaim YAML is stored as `spcnew.yaml`.
    Example output:
    ```
    storagepoolclaim.openebs.io/cstor-disk-pool configured
    ```
