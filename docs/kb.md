---
id: kb
title: Knowledge Base
sidebar_label: Knowledge Base
---

------

<font size="5">Summary</font>

[How do I reuse an existing PV - after re-creating Kubernetes StatefulSet and its PVC](#resuse-pv-after-recreating-sts)

[How to scale up Jiva replica?](#how-to-scale-up-jiva-replica)

[How to install OpenEBS in OpenShift 4.1?](#OpenEBS-install-openshift-4.1)

[How to enable Admission-Controller in OpenShift environment?](#enable-admission-controller-in-openshift)

[How to setup default PodSecurityPolicy to allow the OpenEBS pods to work with all permissions?](#how-to-setup-default-podsecuritypolicy-to-allow-the-openebs-pods-to-work-with-all-permissions)

[How to prevent container logs from exhausting disk space?](#enable-log-rotation-on-cluster-nodes)

[How to create a BlockDeviceClaim for a particular BlockDevice?](#create-bdc-for-a-blockdevice) 

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

<h3><a class="anchor" aria-hidden="true" id="OpenEBS-install-openshift-4.1"></a>How to install OpenEBS in OpenShift 4.1</h3>


In earlier documentation, it was referred to install OpenEBS by disabling SELinux. But, you can install OpenEBS in OpenShift environment without disabling SELinux using the following steps.

1. Add OpenEBS Service account to the privileged scc of OpenShift.

   ```
   oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:openebs-maya-operator
   ```

   Example output:

   ```
   scc "privileged" added to: ["system:serviceaccount:openebs:default"]
   ```

2. Find the latest OpenEBS release version from [here](/docs/next/releases.html) and download the latest OpenEBS operator YAML in your master node. The latest openebs-operator YAML file can be downloaded using the following way.

   ```
   wget https://openebs.github.io/charts/openebs-operator-1.1.0.yaml
   ```

3. Apply the modified the YAML using the following command. 

   ```
   kubectl apply -f openebs-operator-1.1.0.yaml
   ```

4. Verify OpenEBS pod status by using `kubectl get pods -n openebs`

   <div class="co">NAME                                          READY   STATUS    RESTARTS   AGE
   maya-apiserver-594699887-4x6bj                1/1     Running   0          60m
   openebs-admission-server-544d8fb47b-lxd52     1/1     Running   0          60m
   openebs-localpv-provisioner-59f96b699-dpf8l   1/1     Running   0          60m
   openebs-ndm-4v6kj                             1/1     Running   0          60m
   openebs-ndm-8g226                             1/1     Running   0          60m
   openebs-ndm-kkpk7                             1/1     Running   0          60m
   openebs-ndm-operator-74d9c78cdc-lbtqt         1/1     Running   0          60m
   openebs-provisioner-5dfd95987b-nhwb9          1/1     Running   0          60m
   openebs-snapshot-operator-5d58bd848b-94nnt    2/2     Running   0          60m </div>

5. For provisioning OpenEBS volumes, you have to edit SCC to allow HostPath volumes and Privileged containers. This can be done in two ways. 

   - Using “Restricted” SCC
   - Using “Privileged” SCC

   <font size="5">Using “Restricted” SCC</font>

   By default, **any/all users** (manual, serviceaccount), use the “restricted” securityContextConstraint (SCC). This SCC doesn’t allow: 

   - HostPath Volumes
   - Privileged Containers

   Following have to be set to ensure volume replica pods can run on the cluster:

   ```
   allowHostDirVolumePlugin: true
   allowPrivilegeEscalation: true
   allowPrivilegedContainer: true
   ```

   Run following command from OpenShift cluster.

   ```
   oc edit scc restricted
   ```

   It will show an output similar to the following.

   <div class="co">could not be patched: the body of the request was in an unknown format - accepted media types include: application/json-patch+json, application/merge-patch+json
   You can run `oc replace -f /tmp/oc-edit-vvh25.yaml` to try this update again.</div>

   **Note:** The above command will not patch the SCC directly. It will generate a temporary file and you have to run the mentioned command in the output to update the restricted SCC.

   <font size="5">Using “Privileged” SCC</font>

   In openshift, the users are mapped to “Projects” & SCC are mapped to users (or serviceAccounts). This method is more preferred.
   In case, where you want your application to run in privileged containers with particular user/serviceaccount, it can be added to the privileged SCC using following command from OpenShift cluster. 

   ```
   oc adm policy add-scc-to-user privileged system:serviceaccount:<project>:<serviceaccountname>  
   ```

   Example:

   ```
    oc adm policy add-scc-to-user privileged system:serviceaccount:openebs:default
   ```

   **Note:** 

   - In OpenShift each namespace automatically creates a project - into which one or more users can be created.
   - An `oc apply` from inside a `project` will cause all resources to get created with same, i.e., project namespace.

    Example output:

   <div class="co">scc "privileged" added to: ["system:serviceaccount:openebs:default"]</div>	

6.  Now,you can provision OpenEBS volumes. More details for provisioning OpenEBS volumes can be obtained from the User Guide section.

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

<h3><a class="anchor" aria-hidden="true" id="enable-log-rotation-on-cluster-nodes"></a>How to prevent container logs from exhausting disk space?</h3>


Container logs, if left unchecked, can eat into the underlying disk space causing `disk-pressure` conditions
leading to eviction of pods running on a given node. This can be prevented by performing log-rotation
based on file-size while specifying retention count. One recommended way to do this is by configuring the
docker logging driver on the individual cluster nodes. Follow the steps below to enable log-rotation.


1. Configure the docker configuration file /etc/docker/daemon.json (create one if not already found) with the
log-options similar to ones shown below (with desired driver, size at which logs are rotated, maximum logfile
retention count & compression respectively):

   ```
   {
     "log-driver": "json-file",
     "log-opts": {
        "max-size": "400k",
        "max-file": "3",
        "compress": "true"
     }
   }
   ```

2. Restart the docker daemon on the nodes. This may cause a temprary disruption of the running containers & cause
the node to show up as `Not Ready` until the daemon has restarted successfully.

   ```
   systemctl daemon-reload
   systemctl restart docker
   ```

3. To verify that the newly set log-options have taken effect, the following commands can be used:

   * At a node-level, the docker logging driver in use can be checked via the following command:

     ```
     docker info
     ```

     The `LogConfig` section of the output must show the desired values:

     ```
      "LogConfig": {
      "Type": "json-file",
      "Config": {}
     ```

   - At the individual container level, the log options in use can be checked via the following command:

     ```
     docker inspect <container-id>
     ```

     The `LogConfig` section of the output must show the desired values:

     ```
      "LogConfig": {
             "Type": "json-file",
             "Config": {
                 "max-file": "3",
                 "max-size": "400k",
                 "compress": "true"
              }
      }      
     ```

4. To view the current & compressed files, check the contents of the `/var/lib/docker/containers/<container-id>/` directory. The symlinks at `/var/log/containers/<container-name>` refer to the above.

**NOTES:**

- The steps are common for Linux distributions (tested on CentOS, RHEL, Ubuntu)

- Log rotation via the specified procedure is supported by docker logging driver types: `json-file (default), local`

- Ensure there are no dockerd cli flags specifying the `--log-opts` (verify via `ps -aux` or service definition
  files in `/etc/init.d` or `/etc/systemd/system/docker.service.d`). The docker daemon fails to start if an option
  is duplicated between the file and the flags, regardless their value.

- These log-options are applicable only to the containers created after the dockerd restart (which is automatically
  taken care by the kubelet)

- The `kubectl log` reads the uncompressed files/symlinks at `/var/log/containers` and thereby show rotated/rolled-over
  logs. If you would like to read the retained/compressed log content as well use `docker log` command on the nodes.
  Note that reading from compressed logs can cause temporary increase in CPU utilization (on account of decompression
  actions performed internally)

- The log-opt `compress: true:` is supported from Docker version: 18.04.0. The `max-file` & `max-size` opts are supported
  on earlier releases as well.

<br>

<a href="#top">Go to top</a>

<h3><a class="anchor" aria-hidden="true" id="create-bdc-for-a-blockdevice"></a>How to create a BlockDeviceClaim for a particular BlockDevice? </h3>



There are certain use cases where the user does not need some of the BlockDevices discovered by OpenEBS to be used by any of the storage engines (cStor, LocalPV, etc.). In such scenarios, users can manually create a BlockDeviceClaim to claim that particular BlockDevice, so that it won't be used by cStor or Local PV. The following steps can be used  to claim a particular BlockDevice: 

1. Download the BDC CR YAML from `node-disk-manager` repository.

   ```
   wget https://raw.githubusercontent.com/openebs/node-disk-manager/master/deploy/crds/openebs_v1alpha1_blockdeviceclaim_cr.yaml
   ```

2.  Provide the BD name of the corresponding BlockDevice which can be obtained by running `kubectl get bd -n <openebs_installed_namespace>` 

3.  Apply the modified YAML spec using the following command:

   ```
   kubectl apply -f openebs_v1alpha1_blockdeviceclaim_cr.yaml
   ```

4.  Verify if particular BD is claimed using the following command:

   ```
   kubectl get bdc -n <openebs_installed_namespace>
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
