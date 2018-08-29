---
id: deploycstor
title: Deploying cStor
sidebar_label: Deploying cStor
---
------

cStor provides storage scalability along with ease of deployment and usage. cStor can handle multiple disks of same size per Node and create different storage pools. These Storage Pools can be used to create cStor volumes which can be utilized to run applications. 

Additionally, disk addition can be done from [Kubernetes docs](https://cloud.google.com/compute/docs/disks/add-persistent-disk). These disks can be used for creating the OpenEBS cStor pool by combining all the disks per node. You can scale the storage pool by adding more disks to the instance and in turn to the storage pool. Storage pools will be created in a striped manner.

**Note:**

1. cStor synchronizes data periodically to the disks. The application must send explicit 'sync' CDBs to commit the data to disks.
2. cStor assumes that data written to a disk is persistent. Hence, write cache of disk must be disabled if it's cache is not backed by non-volatile memory.

## Deploying cStor Storage Engine 

cStor can be deployed in your Kubernetes cluster by performing the following steps. Before installation, the [prerequisites](/docs/next/prerequisites.html) must be met on the Nodes. 

1. Clone latest OpenEBS repository. You can do this by using the following commands.

   ```
   git clone https://github.com/openebs/openebs.git
   cd openebs/k8s
   wget https://raw.githubusercontent.com/openebs/charts/master/docs/openebs-config-0.7.0-RC1.yaml
   ```

   Apply openebs-operator.yaml file to create OpenEBS control plane components. 

   ```
   kubectl apply -f https://raw.githubusercontent.com/openebs/charts/master/docs/openebs-operator-0.7.0-RC1.yaml
   ```
   OpenEBS pods are created under “*openebs*” namespace. By applying the above commands, Node Disk Manager, CAS Template, and default storage classes are created. 

   Node Disk Manager manages the disks associated to each node in the cluster. You can get the disk details by running the following command.

   ```
   kubectl get disk
   ```

   Following is an example output.

   ```
   NAME                                      AGE
   disk-0499a2bab98221e64150f5513bfac8c6     14m
   disk-129537edc4d30afd270e81336b11b0dc     57m
   disk-32d8c7cee653fbc891fc240fc314593c     12m
   disk-4671be626b3ce51a25e54dacdf593d4b     14m
   disk-6f6e7f7679277cc6d75dc60399bc74e9     57m
   disk-7f8a9fbca89efc5b58b372f6eaa53b51     11m
   disk-a63541055013103f251530f1885e6399     12m
   disk-ef271a88c5aacfcc5b8601bcba9eeb10     11m
   sparse-11635daedd59c23d9db366133355bac8   57m
   sparse-a2c87c5af87d196a68f650d674650bfa   57m
   sparse-ab505639a146687dfb62c4a49a05afb7   57m
   ```

   CAS Template is an approach to provision persistent volumes that make use of CAS storage engine. The following command will help check the CAS Template components

   ```
   kubectl get cast -n openebs
   ```

   It also installs the default cStor storage class which can be used in your application yaml to run the application. For more information about sample storage classes used for different applications, see [storage classes](/docs/next/setupstorageclasses.html). You can get the storage classes that are already applied by using the following command.

   ```
   kubectl get sc
   ```

   Following is an example output.

   ```
   NAME                          PROVISIONER                                                AGE
   openebs-cstor-default-0.7.0   openebs.io/provisioner-iscsi                               2h
   openebs-cstor-sparse          openebs.io/provisioner-iscsi                               2h
   openebs-snapshot-promoter     volumesnapshot.external-storage.k8s.io/snapshot-promoter   3h
   openebs-standard              openebs.io/provisioner-iscsi                               3h
   standard (default)            kubernetes.io/gce-pd                                       3h
   ```

2. Edit **openebs-config.yaml** to include the disk details associated to each node in the cluster which you are using for creating the OpenEBS cStor Pool. Replace the disk name under diskList section, which you can get from running `kubectl get disks` command.

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
          - disk-0499a2bab98221e64150f5513bfac8c6
          - disk-32d8c7cee653fbc891fc240fc314593c
          - disk-4671be626b3ce51a25e54dacdf593d4b
          - disk-7f8a9fbca89efc5b58b372f6eaa53b51
          - disk-a63541055013103f251530f1885e6399
          - disk-ef271a88c5aacfcc5b8601bcba9eeb10
   ```

3. Apply the modified openebs-config.yaml by running the following command.

   ```
   kubectl apply -f openebs-config-0.7.0-RC1.yaml
   ```

   This will create custom resource deployments which you can get by running the following command.

   ```
   kubectl get crd -n openebs
   ```

   Following is an example output.

   ```
   NAME                                                         AGE
   castemplates.openebs.io                                      59m
   cstorpools.openebs.io                                        59m
   cstorvolumereplicas.openebs.io                               59m
   cstorvolumes.openebs.io                                      59m
   disks.openebs.io                                             59m
   runtasks.openebs.io                                          59m
   storagepoolclaims.openebs.io                                 59m
   storagepools.openebs.io                                      59m
   volumesnapshotdatas.volumesnapshot.external-storage.k8s.io   59m
   volumesnapshots.volumesnapshot.external-storage.k8s.io       59m
   ```

4. Here, 2 additional disks per node are added and using the above command will create different storage pools using 2 disks per node in a striped manner. You can get Storage Pool details by running following command.

   ```
   kubectl get sp -n openebs
   ```

   Following is an example output.

   ```
   NAME                            AGE
   cstor-pool-default-0.7.0-1xjt   26s
   cstor-pool-default-0.7.0-22eq   26s
   cstor-pool-default-0.7.0-wwy8   26s
   default                         6m
   ```

5. You have now deployed OpenEBS cluster with cStor Engine with 3 different storage pools. It can create OpenEBS cStor volume on these Storage Pools. By default, OpenEBS cStor volume will be running with 3 replica count. 

6. Get the sample PVC yaml which can be used to create OpenEBS cStor volume with default CAS Template values. The following command will help you get the sample pvc yaml file.

   ```
   cd openebs/k8s/demo/
   ```

   This sample PVC yaml will use default storage class **openebs-cstor-default-0.7.0** created as part of **openebs-operator.yaml** installation.

7. Apply the sample pvc yaml to create cStor volume using the following command.

   ```
   kubectl apply -f pvc-standard-cstor-default.yaml
   ```

8. Get the pvc details by running the following command.

   ```
   kubectl get pvc
   ```

   Following is an example output.

   ```
   NAME                   STATUS    VOLUME                          CAPACITY   ACCESS MODES   STORAGECLASS                  AGE
   demo-cstor-vol1-claim   Bound     default-demo-cstor-vol1-claim   4G        RWO           openebs-cstor-default-0.7.0   21s
   ```

9. Get the pv details by running the following command.

    ```
    kubectl get pv
    ```

    Following is an example output.

    ```
    NAME                           CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM     STORAGECLASS                  REASON    AGE
    default-demo-cstor-vol1-claim  4G         RWO            Delete           Bound     default/demo-cstor-vol1-claim   openebs-cstor-default-0.7.0             27s
    ```

10. Use this pvc name in your application yaml to run your application using OpenEBS cStor volume.



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
