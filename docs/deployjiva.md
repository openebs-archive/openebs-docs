---
id: deployjiva
title: Deploying Jiva
sidebar_label: Deploying Jiva
---
------

OpenEBS can be used to create Storage Pool on a host disk or an externally mounted disk. This Storage Pool can be used to create Jiva volume which can be utilized to run applications. By default, Jiva volume will be deployed on host root disk. If you are using an external disk, see [storage pool](/docs/next/setupstoragepools.html#configuring-a-storage-pool-on-openebs) for more details about creating a storage pool with an external disk. 

## Deploying Jiva Storage Engine

Jiva can be deployed in your Kubernetes cluster by using the following procedure. Before installation, all [prerequisites](/docs/next/prerequisites.html) must be set on the Nodes. 

1. Apply *openebs-operator.yaml* file to create OpenEBS control plane components. 

  ```
  kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.7.0-RC2.yaml
  ```

  OpenEBS pods are created under “*openebs*” namespace. CAS Template and default Storage Classes are created after executing the above command.

  CAS Template is an approach to provision persistent volumes that make use of CAS storage engine. The following command helps check the CAS Template components.

  ```
  kubectl get cast -n openebs
  ```

  Also, it installs the default Jiva storage class which can be used in your application yaml to run the application. For more information about sample storage classes used for different applications, see [storage classes](/docs/next/setupstorageclasses.html). You can get the storage classes that are already applied by using the following command.

  ```
  kubectl get sc
  ```

   Following is an example output.

      NAME                        PROVISIONER                                                AGE
      openebs-cstor-default-0.7.0 openebs.io/provisioner-iscsi				     		 14m
      openebs-cstor-sparse        openebs.io/provisioner-iscsi                               14m
      openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   14m
      openebs-standard            openebs.io/provisioner-iscsi                               14m
      standard (default)          kubernetes.io/gce-pd  									14m

2. Create an **openebs-config.yaml** file in your node and paste the below yaml file to create a Storage Pool on your hosted path on the Node. Jiva storage pool will be created by default at *var/openebs* inside the hosted path on the nodes. 

      ```
      ---
      apiVersion: openebs.io/v1alpha1
      kind: StoragePool
      metadata:
        name: default
        type: hostdir
      spec:
        path: "/var/openebs"
      ---
      ```
      If you would like to create a storage pool on an external disk which is mounted on the nodes, change the path mentioned in the above yaml file with the appropriate disk mounted path on the Nodes. 

      If your external disk is mounted as */mnt/openebs_disk* in your node, change the path as below.

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

3. Apply the modified *openebs-config.yaml* file by using the following command.

      ```
      kubectl apply -f openebs-config.yaml
      ```

4. The storage pool is now created on the Node as per your requirement. You can get the storage pool details by running the following command. 

      ```
      kubectl get sp -n openebs
      ```

      Following is an example output.

      ```
      NAME                            AGE
      cstor-pool-default-0.7.0-3xnj   2h
      cstor-pool-default-0.7.0-t9n1   2h
      cstor-pool-default-0.7.0-y5ql   2h
      cstor-sparse-pool-41o7          13h
      cstor-sparse-pool-5cpp          13h
      cstor-sparse-pool-m1ff          13h
      default                         13h
      ```

5. You have now deployed OpenEBS cluster with Jiva Engine. It can create OpenEBS Jiva volume on default storage pool. By default, OpenEBS Jiva volume runs with 3 replica count. 

6. Get the sample PVC yaml which can be used to create OpenEBS Jiva volume with default CAS Template values. The following command will help you get the sample pvc yaml file *pvc-standard-jiva-default.yaml*.

      ```
      git clone https://github.com/openebs/openebs.git
      cd openebs/k8s/demo/
      ```

      This sample PVC yaml will use default storage class *openebs-standard* created as part of *openebs-operator.yaml* installation.

7. Apply the sample pvc yaml to create Jiva volume using the following command.

      ```
      kubectl apply -f pvc-standard-jiva-default.yaml
      ```

8. Get the Jiva pvc details by running the following command.

      ```
      kubectl get pvc
      ```

      Following is an example output.

      ```
      NAME              STATUS    VOLUME                               CAPACITY   ACCESS MODES   STORAGECLASS       AGE
      demo-vol1-claim   Bound     default-demo-vol1-claim-3249598138   4G         RWO            openebs-standard   52s
      ```

      Get the Jiva pv details by running the following command.

      ```
      kubectl get pv
      ```

      Following is an example output.

      ```
      NAME                                 CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                     STORAGECLASS       REASON    AGE
      default-demo-vol1-claim-3249598138   4G         RWO            Delete           Bound     default/demo-vol1-claim   openebs-standard             45m
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
