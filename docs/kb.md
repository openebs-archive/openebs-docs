---
id: kb
title: Knowledge Base
sidebar_label: Knowledge Base
---

------

<font size="5">Summary</font>

[How do I reuse an existing PV - after re-creating Kubernetes StatefulSet and its PVC](#resuse-pv-after-recreating-sts)

[How to scale up Jiva replica?](#how-to-scale-up-jiva-replica)

<h3><a class="anchor" aria-hidden="true" id="resuse-pv-after-recreating-sts"></a>How do I reuse an existing PV - after re-creating Kubernetes StatefulSet and its PVC</h3>
There are some cases where it had to delete the StatefulSet and re-install a new StatefulSet. In the process you may have to delete the PVCs used by the StatefulSet and retain PV policy by ensuring the Retain as the "Reclaim Policy". In this case, following are the procedures for re-using an existing PV in your StatefulSet application.

1. Get the PV name by following command and use it in Step 2.

   ```
   kubectl get pv
   ```

   Following is an example output

   ```
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
   pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   5G         RWO            Delete           Bound     default/mongo-persistent-storage-mongo-0   mongo-pv-az              9m
   ```

   

2. Patch corresponding PV's reclaim policy from "Delete" to "Retain". So that PV will retain even its PVC is deleted.This can be done by using the steps mentioned [here](https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/#why-change-reclaim-policy-of-a-persistentvolume).

   Example Output:

   ```
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                      STORAGECLASS   REASON    AGE
   pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   5G         RWO            Retain           Bound     default/mongo-persistent-storage-mongo-0   mongo-pv-az              9m
   ```

   

3. Get the PVC name by following command and note down the PVC name. You have to use this same PVC name while creating new PVC.

   ```
   kubectl get pvc
   ```

   Example Output:

   ```
   NAME                               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   mongo-persistent-storage-mongo-0   Lost      pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   0                        mongo-pv-az    4s
   ```

   

4. Delete StatefulSet application and associated PVCs.

   

5. Create a new PVC YAML named *newPVC.yaml* with same configuration. Specify old PV name belongs to *volumeName* under the PVC spec.

   ```
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     annotations:
       pv.kubernetes.io/bind-completed: "yes"
       pv.kubernetes.io/bound-by-controller: "yes"
       volume.beta.kubernetes.io/storage-provisioner: openebs.io/provisioner-iscsi
     labels:
       environment: test
       openebs.io/replica-anti-affinity: vehicle-db
       role: mongo
     name: mongo-persistent-storage-mongo-0
     namespace: default
   spec:
     accessModes:
     - ReadWriteOnce
     resources:
       requests:
         storage: 5G
     storageClassName: mongo-pv-az
     volumeName: pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7
   status:
     accessModes:
     - ReadWriteOnce
     capacity:
       storage: 5G
   ```

   

6. Apply the modified PVC YAML using the following command

   ```
   kubectl apply -f newPVC.yaml
   ```

   Example Output:

   ```
   NAME                               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   mongo-persistent-storage-mongo-0   Lost      pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   0                        mongo-pv-az    4s
   ```

   

7. Get the newly created PVC UID using `kubectl get pvc mongo-persistent-storage-mongo-0 -o yaml`.

   ​    

8. Update the uid under the claimRef in the PV using the following command. The PVC will get attached to the PV after editing the pv with correct uid.

   ```
   kubectl edit pv pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7
   ```

   

9. Get the updated PVC status using the following command.

   ```
   kubectl get pvc
   ```

   Example Output:

   ```
   NAME                               STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
   mongo-persistent-storage-mongo-0   Bound     pvc-cc6767b4-52e8-11e9-b1ef-42010a800fe7   5G         RWO            mongo-pv-az    5m
   ```

   

10. Apply the same StatefulSet application YAML. The pod will come back online by re-using the existing PVC. The application pod status can be get by following command.

  ```
  kubectl get pods -n <namespace>
  ```




<h3><a class="anchor" aria-hidden="true" id="how-to-scale-up-jiva-replica"></a>How to scale up Jiva replica?</h3>

From 0.9.0 OpenEBS version, Jiva pod deployment are scheduling with nodeAffinity. For scaling up Jiva replica count, the following steps has to be performed.

1. Get the deployment details of target and replica of corresponding Jiva volume using the following command. If it is deployed in namespace, use corresponding namespace.

   ```
   kubectl get deploy
   ```

   Following is an example output.

   ```
   NAME                                            DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
   percona                                         1         1         1            0           54s
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-ctrl   1         1         1            1           53s
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-rep    1         1         1            1           53s
   ```

2. Edit the corresponding replica deployment of the Jiva volume similar the following command.

   ```
   kubectl edit deploy pvc-4cfacfdd-76d7-11e9-9319-42010a800230-rep
   ```

   Perform Step 3 and 4 and then save the changes. There will require to modify the replica count and required hostname details where the replica pod has to be scheduled.

3. Edit `replicas` value under `spec` with the required number.  It was `replicas: 1` during the initial deployment. With following change, replicas count will change to 2. 

   **Example:**

   ```
   replicas: 2
   ```

4. Add corresponding hostnames under value in   `spec.template.spec.affinity.nodeAffinity.nodeSelectorTerms`. The following the sample snippet for adding the required hostnames.

   ```
       spec:
         affinity:
           nodeAffinity:
             requiredDuringSchedulingIgnoredDuringExecution:
               nodeSelectorTerms:
               - matchExpressions:
                 - key: kubernetes.io/hostname
                   operator: In
                   values:
                   - gke-md-jiva-default-pool-15a2475b-bxr5
                   - gke-md-jiva-default-pool-15a2475b-gzx3
   ```

5. After modifying the above changes, save the configuration.  With this change , new replica pods will be running and following command will get the details of replica pods.

   ```
   kubectl get pod
   ```

   The following is an example output.

   ```
   NAME                                                             READY     STATUS    RESTARTS   AGE
   percona-66b4fd4ddf-xvswn                                         1/1       Running   0          32m
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-ctrl-68d94478df-drj6r   2/2       Running   0          32m
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-rep-f9ff69c6-6lcfz      1/1       Running   0          25s
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-rep-f9ff69c6-9jbfm      1/1       Running   0          25s
   ```

   

<br>

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
