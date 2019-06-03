---
id: kb
title: Knowledge Base
sidebar_label: Knowledge Base
---

------

<font size="5">Summary</font>

[How do I reuse an existing PV - after re-creating Kubernetes StatefulSet and its PVC](#resuse-pv-after-recreating-sts)

[How to scale up Jiva replica?](#how-to-scale-up-jiva-replica)

[How to install OpenEBS in OpenShift environment?](#OpenEBS-install-openshift-without-SELinux-disabled)

[How to enable Admission-Controller in OpenShift environment?](#enable-admission-controller-in-openshift)

[How to setup default PodSecurityPolicy to allow the OpenEBS pods to work with all permissions?](#how-to-setup-default-podsecuritypolicy-to-allow-the-openebs-pods-to-work-with-all-permissions)

[How Can I create cStor Pools using partitioned disks?](#create-cstor-pool-partioned-disks)

</br>

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

<a href="#top">Go to top</a>

</br>


<h3><a class="anchor" aria-hidden="true" id="how-to-scale-up-jiva-replica"></a>How to scale up Jiva replica?</h3>

From 0.9.0 OpenEBS version, Jiva pod deployment are scheduling with nodeAffinity. For scaling up Jiva replica count, the following steps has to be performed.

1. Get the deployment details of replica of corresponding Jiva volume using the following command. If it is deployed in `openebs` namespace, use corresponding namespace appropriately in the following commands.

   ```
   kubectl get deploy
   ```

   Following is an example output.

   ```
   NAME                                            DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
   percona                                         1         1         1            1           54s
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-ctrl   1         1         1            1           53s
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-rep    1         1         1            1           53s
   ```

2. Edit the corresponding replica deployment of the Jiva volume using the following command.

   ```
   kubectl edit deploy <replica_deployment_of_corresponding_volume>
   ```

   **Example:**

   ```
   kubectl edit deploy pvc-4cfacfdd-76d7-11e9-9319-42010a800230-rep
   ```

   Perform Step 3 and 4 and then save the changes. It is required to modify the fields of replica count and hostname details where the replica pods has to be scheduled.

3. Edit `replicas` value under `spec` with the required number. In this example, it was `replicas: 1` during the initial deployment. With following change, replicas count will change to 2. 

   **Example:**

   ```
   replicas: 2
   ```

4. Add corresponding hostnames under value in   `spec.template.spec.affinity.nodeAffinity.nodeSelectorTerms.key.values`. The following is the sample snippet for adding the required hostnames. In the following snippet, it is added the hostname of second node in the mentioned path.

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
   kubectl get pod -o wide
   ```

   The following is an example output.

   ```
   NAME                                                             READY     STATUS    RESTARTS   AGE    IP           NODE                                   NOMINATED NODE  
   percona-66b4fd4ddf-xvswn                                         1/1       Running   0          32m      
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-ctrl-68d94478df-drj6r   2/2       Running   0          32m
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-rep-f9ff69c6-6lcfz      1/1       Running   0          25s
   pvc-4cfacfdd-76d7-11e9-9319-42010a800230-rep-f9ff69c6-9jbfm      1/1       Running   0          25s
   ```

<a href="#top">Go to top</a>

</br>


<h3><a class="anchor" aria-hidden="true" id="OpenEBS-install-openshift-without-SELinux-disabled"></a>How to install OpenEBS in OpenShift environment?</h3>

In earlier documentation, it was referred to install OpenEBS by disabling SELinux. But, you can install OpenEBS in OpenShift environment without disabling SELinux using the following steps.

1. Add OpenEBS Service account to the privileged scc of OpenShift.

   ```
   oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-maya-operator
   ```

2. Find the latest OpenEBS release version from [here](/docs/next/releases.html) and download the latest OpenEBS operator YAML in your master node. The latest openebs-operator YAML file can be downloaded using the following way.

   ```
   wget https://openebs.github.io/charts/openebs-operator-0.9.0.yaml
   ```

3. Apply the modified the YAML using the following command. The OpenEBS operator YAML file name has to be changed based on the latest version.

   ```
   oc apply -f openebs-operator-0.9.0.yaml
   ```

4. Verify OpenEBS pods status by using `oc get pods -n openebs`

<a href="#top">Go to top</a>

</br>

<h3><a class="anchor" aria-hidden="true" id="enable-admission-controller-in-openshift"></a>How to enable Admission-Controller in OpenShift 3.10 and above</h3>

The following proceedure will help to enable admission-controller in OpenShift 3.10 and above.

1. Update the `/etc/origin/master/master-config.yaml`  file with below configuration.

   ```
   admissionConfig:
     pluginConfig:
       ValidatingAdmissionWebhook: 
         configuration:
           kind: DefaultAdmissionConfig
           apiVersion: v1
           disable: false 
       MutatingAdmissionWebhook: 
         configuration:
           kind: DefaultAdmissionConfig
           apiVersion: v1
           disable: false 
   ```

2. Restart the API and controller services using the following commands.

   ```
   # master-restart api
   # master-restart controllers
   ```

<a href="#top">Go to top</a>

<br>

<h3><a class="anchor" aria-hidden="true" id="how-to-setup-default-podsecuritypolicy-to-allow-the-openebs-pods-to-work-with-all-permissions"></a>How to setup default PodSecurityPolicy to allow the OpenEBS pods to work with all permissions?</h3>

Apply the following YAML in your cluster.

- Create a Privileged PSP

  ```
  apiVersion: extensions/v1beta1
  kind: PodSecurityPolicy
   metadata:
     name: privileged
     annotations:
       seccomp.security.alpha.kubernetes.io/allowedProfileNames: '*'
   spec:
     privileged: true
     allowPrivilegeEscalation: true
     allowedCapabilities:
     - '*'
     volumes:
     - '*'
     hostNetwork: true
     hostPorts:
     - min: 0
       max: 65535
     hostIPC: true
     hostPID: true
     runAsUser:
       rule: 'RunAsAny'
     seLinux:
       rule: 'RunAsAny'
     supplementalGroups:
       rule: 'RunAsAny'
     fsGroup:
       rule: 'RunAsAny'    
  ```

- Associate the above PSP to a ClusterRole

  ```
  kind: ClusterRole
  apiVersion: rbac.authorization.k8s.io/v1
  metadata:
    name: privilegedpsp
  rules:
  - apiGroups: ['extensions']
    resources: ['podsecuritypolicies']
    verbs:     ['use']
    resourceNames:
    - privileged
  ```

- Associate the above Privileged ClusterRole to OpenEBS Service Account

  ```
  apiVersion: rbac.authorization.k8s.io/v1
  kind: ClusterRoleBinding
  metadata:
    annotations:
      rbac.authorization.kubernetes.io/autoupdate: "true"
    name: openebspsp
  roleRef:
    apiGroup: rbac.authorization.k8s.io
    kind: ClusterRole
    name: privilegedpsp
  subjects:
  - kind: ServiceAccount
    name: openebs-maya-operator
    namespace: openebs
  ```

- Proceed to install the OpenEBS. Note that the namespace and service account name used by the OpenEBS should match what is provided in   the above ClusterRoleBinding.

<a href="#top">Go to top</a>

<br>

<h3><a class="anchor" aria-hidden="true" id="create-cstor-pool-partioned-disks"></a>How Can I create cStor Pools using partitioned disks?</h3>

Currently,NDM is not selecting partition disks for creating device resource. But, you can create device resource for the partition disks manually. The following are the steps for the creation of device resource.

1. Download the device CR YAML for creating the device CR manually. The sample device CR can be downloaded from [here](https://raw.githubusercontent.com/openebs/node-disk-manager/master/deploy/crds/openebs_v1alpha1_device_cr.yaml).

2. Modify the downloaded device CR sample YAML with the partition disk information. Following is the sample device CR YAML.

   ```
   apiVersion: openebs.io/v1alpha1
   kind: Device
   metadata:
     name: example-device
     labels:
       kubernetes.io/hostname: <host name in which disk/device is attached> # like gke-openebs-user-default-pool-044afcb8-bmc0
       ndm.io/managed: "false" # for manual disk creation put false
       ndm.io/disk-type: partition
   status:
     state: Active
   spec:
     capacity:
       logicalSectorSize: <logical sector size of device> # like 512
       storage: <total capacity in bits> #like 53687091200
     details:
       firmwareRevision: <firmware revision> #firmware version
       model: <model name of device> # like PersistentDisk
       serial: <serial no of disk> # like google-disk-2
       compliance: <compliance of disk> #like "SPC-4"
       vendor: <vendor of disk> #like Google
     devlinks:
     - kind: by-id
       links:
       - <link1> # like /dev/disk/by-id/scsi-0Google_PersistentDisk_disk-2
       - <link2> # like /dev/disk/by-id/google-disk-2
     - kind: by-path
       links:
       - <link1> # like /dev/disk/by-path/virtio-pci-0000:00:03.0-scsi-0:0:2:0 
     Partitioned: No
     path: <devpath> # like /dev/sdb1
   ```

   In the above device CR sample spec, following field must be filled before applying the YAML.

   - kubernetes.io/hostname
   - logicalSectorSize
   - storage
   - links
     - This is applicable for both `by-id` and `by-path`
   - path

3. Repeat the same steps for each partitioned device that you have chosen for creating cStor pool.

4. Get the `diskname` from `kubectl get disks` command and add the `diskname` in cStor StoragePoolClaim YAML. The steps for the creation of cStorStoragePool can be read [here](/docs/next/configurepools.html#creating-a-new-pool).

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
