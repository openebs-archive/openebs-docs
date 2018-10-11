---
id: deployjiva
title: Provisioning Jiva
sidebar_label: Provisioning Jiva
---
------

OpenEBS can be used to create Storage Pool on a host disk or an externally mounted disk. This Storage Pool can be used to create Jiva volume which can be utilized to run applications. By default, Jiva volume will be deployed on host path. If you are using an external disk, see [storage pool](setupstoragepools.md#configuring-a-storage-pool-on-openebs) for more details about creating a storage pool with an external disk. 

## Provisioning Jiva Storage Engine

Jiva can be provisioned in your Kubernetes cluster by using the following procedure. 

1. Verify if the OpenEBS installation is complete. If not, go to [installation](installation.md).

   OpenEBS pods are created under “*openebs*” namespace. CAS Template, default Storage Pool and default Storage Classes are created after installation.

   You can get the OpenEBS pods status by running following command

   ```
   kubectl get pods -n openebs
   ```

   CAS Template is an approach to provision persistent volumes that make use of CAS storage engine. The following command helps check the CAS Template components.

   ```
   kubectl get castemplate
   ```

   Also, it installs the default Jiva storage class which can be used in your application yaml to run the application. For more information about sample storage classes used for different applications, see [storage classes](setupstorageclasses.md). You can get the storage classes that are already applied by using the following command.

   ```
   kubectl get sc
   ```

   Following is an example output.

   ```
   NAME                        PROVISIONER                                                AGE
   openebs-cstor-sparse        openebs.io/provisioner-iscsi                               8m
   openebs-jiva-default        openebs.io/provisioner-iscsi                               8m
   openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   8m
   standard (default)          kubernetes.io/gce-pd                                       29m
   ```


2. OpenEBS installation will create Jiva storage pool also.It will be created by default on "/var/openebs" inside the hosted path on the nodes. 

      You can get the storage pool details by running the following command. 

      ```
      kubectl get sp
      ```

3. If you would like to create a storage pool on an external disk which is mounted on the nodes, create a  *openebs-config.yaml* file and add the below example yaml with changing the appropriate mounted disk path in your required node. 

      For example,If your external disk is mounted as */mnt/openebs_disk* in your node, change the path as below. Goto Step 4 if you would like to create storage pool on external disk. Otherwise, goto Step5 to consume default storage pool.

      ```
      path: "/mnt/openebs_disk"
      ```

      **Example:**

      ```
      ---
      apiVersion: openebs.io/v1alpha1
      kind: StoragePool
      metadata:
        name: default
        type: hostdir
      spec:
        path: "/mnt/openebs_disk"
      ---
      ```

4. Apply the modified *openebs-config.yaml* file by using the following command.

      ```
      kubectl apply -f openebs-config.yaml
      ```

5. The storage pool is now created on the Node as per your requirement. You can get the storage pool details by running the following command. 

      ```
      kubectl get sp
      ```

      Following is an example output.

      ```
      NAME                     AGE
      cstor-sparse-pool-53tm   7m
      cstor-sparse-pool-arc6   7m
      cstor-sparse-pool-zvq6   7m
      default                  7m
      ```

6. You have now deployed OpenEBS cluster with Jiva Engine. It can create OpenEBS Jiva volume on default storage pool. By default, OpenEBS Jiva volume runs with 3 replicas. 

7. Apply the sample pvc yaml file to create Jiva volume using the following command.

      ```
      kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-jiva-default.yaml
      ```

      This sample PVC yaml will use default storage class *openebs-jiva-default* storage class created as part of *openebs-operator.yaml* installation.

8. Get the Jiva pvc details by running the following command.

      ```
      kubectl get pvc
      ```

      Following is an example output.

      ```
      NAME              STATUS    VOLUME                              CAPACITY   ACCESS MODES   STORAGECLASS           AGE
      demo-vol1-claim   Bound     default-demo-vol1-claim-473439503   4G         RWO            openebs-jiva-default   2m
      ```

      Get the Jiva pv details by running the following command.

      ```
      kubectl get pv
      ```

      Following is an example output.

      ```
      NAME                                CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                     STORAGECLASS           REASON    AGE
      default-demo-vol1-claim-473439503   4G         RWO            Delete           Bound     default/demo-vol1-claim   openebs-jiva-default             7m
      ```

9. Use this pvc name in your application yaml to run your application using OpenEBS Jiva volume.


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
