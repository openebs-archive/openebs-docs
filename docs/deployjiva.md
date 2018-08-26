---
id: deployjiva
title: Deploying Jiva
sidebar_label: Deploying Jiva
---
OpenEBS can be used to create Storage Pool on host disk or externally mounted disk. This Storage Pool can be used to create Jiva volume which can be utilizing to run applications. By default, Jiva volume will be deploying on host root disk. If you are using external disk, more details are mentioned on [storage pool](next/setupstoragepools.html) to create storage pool with external disk. 

### Deploying Jiva Storage Engine

Jiva can be deployed in your Kubernetes cluster by following steps. Before installation, all [prerequisites](next/prerequisites.html) have to be achieved on the Nodes. 

1. Clone latest OpenEBS repository. This can be done by following way.

  ```
  git clone https://github.com/openebs/openebs.git
  cd openebs/k8s
  ```

  Apply openebs-operator.yaml file to create OpenEBS control plane components. 

  ```
  kubectl apply -f openebs-operator.yaml	
  ```

  OpenEBS pods are created under *openebs* namespace. By applying above command, this will create node disk manager which will manage the disks associated to each node in the cluster. Disk details are
  getting by running following command.

  ```
  kubectl get disk
  ```

  Following is an example output

  ```
  NAME                                      AGE
  disk-1ff520175e1b073c9686eb6e766c382c     18s
  disk-99e493868eb213dd776b248f542d1c79     18s
  disk-c88cbc696fc8d523372ab291ef83f4bd     18s
  sparse-2112d48d72a3f8a083e4ad26068b44bf   18s
  sparse-98f52f461c60564140e7178603b71858   18s
  sparse-d3b73e4ba41134752893190aece77c01   18s
  ```

2. Deploy CAS template which is an approach to provision persistent volumes that make use of CAS storage engine. This can be run by following command.

      ```
      kubectl apply -f openebs-pre-release-features.yaml
      ```

      Following command will help to check the CAS Template components.

      ```
      kubectl get cast -n openebs
      ```

      Also, it installs OpenEBS Jiva default storage class which can be used in your application yaml to run application. This can be getting by following below command.

      ```
      kubectl get sc
      ```

      Following is an example output.

      ```
      NAME                        PROVISIONER                                                AGE
      openebs-cstor-sparse        openebs.io/provisioner-iscsi                               1m
      openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   14m
      openebs-standard            openebs.io/provisioner-iscsi                               14m
      standard (default)          kubernetes.io/gce-pd  
      ```

3. Edit **openebs-config.yaml** to include the mounted disk path associated to each node in the cluster using which you are creating the OpenEBS Storage Pool. Change the *path* under *spec* section
      with the mounted directory created under each Nodes.

      ```
      path: "/mnt/openebs_disk"
      Example:
      apiVersion: openebs.io/v1alpha1
      kind: StoragePool
      metadata:
        name: default
        type: hostdir
      spec:
        path: "/mnt/openebs_disk"
      ```

4. Apply modified **openebs-config.yaml** by following command

      ```
       kubectl apply -f openebs-config.yaml
      ```

      This will create custom resource deployments. This can be get by running below command.

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

5. In this case, it is added one additional disk per each node and using above command will create default
      storage Pool using single disk per each node. Storage pool details can be get by running following  command. 

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

6. Now, you are deployed OpenEBS cluster with Jiva Engine. It can create OpenEBS Jiva volume on default storage Pool. By default, OpenEBS Jiva volume will be running with 3 replica count. 

7. Get the sample PVC yaml which can be used to create OpenEBS Jiva volume with default CAS Template values. Following command will help you to get the sample pvc yaml file.

      ```
      cd openebs/k8s/demo/
      ```

      In this sample PVC yaml, it will use default storage class *openebs-standard* created as part of
      **openebs-operator.yaml** installation.

8. Apply the sample pvc yaml to create Jiva volume using following command.

      ```
      kubectl apply -f pvc-standard-jiva-default.yaml
      ```

9. Get the pvc details by running following command .

      ```
      kubectl get pvc
      ```

      Following is an example output.

      ```
      NAME              STATUS    VOLUME                               CAPACITY   ACCESS MODES   STORAGECLASS       AGE
      demo-vol1-claim   Bound     default-demo-vol1-claim-3249598138   4G         RWO            openebs-standard   52s
      ```

      Get the pv details by running below command.

      ```
      kubectl get pv
      ```

      Following is an example output.

      ```
      NAME                                 CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                     STORAGECLASS       REASON    AGE
      default-demo-vol1-claim-3249598138   4G         RWO            Delete           Bound     default/demo-vol1-claim   openebs-standard             45m
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
