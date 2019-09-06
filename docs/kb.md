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

[How to provision Local PV on K3OS?](#provision-localpv-on-k3os)

[How to make cStor volume online if 2 replicas of 3 are lost?](#how-to-make-cstor-volume-online-if-replicas-2-of-are-lost)

[How to reconstruct data from healthy replica to replaced one?](#how-to-reconstruct-data-from-healthy-replica-to-replaced-ones)

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

5. For provisioning OpenEBS volumes, you have to edit SCC to allow HostPath volumes and Privileged containers. This can be done by following way. 

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


The following procedure will help to enable admission-controller in OpenShift 3.10 and above.

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

<h3><a class="anchor" aria-hidden="true" id="create-bdc-for-a-blockdevice"></a>How to create a BlockDeviceClaim for a particular BlockDevice?</h3>


There are certain use cases where the user does not need some of the BlockDevices discovered by OpenEBS to be used by any of the storage engines (cStor, LocalPV, etc.). In such scenarios, users can manually create a BlockDeviceClaim to claim that particular BlockDevice, so that it won't be used by cStor or Local PV. The following steps can be used  to claim a particular BlockDevice: 

1. Download the BDC CR YAML from `node-disk-manager` repository.

   ```
   wget https://raw.githubusercontent.com/openebs/node-disk-manager/master/deploy/crds/openebs_v1alpha1_blockdeviceclaim_cr.yaml
   ```

2. Provide the BD name of the corresponding BlockDevice which can be obtained by running `kubectl get bd -n <openebs_installed_namespace>` 

3. Apply the modified YAML spec using the following command:

   ```
   kubectl apply -f openebs_v1alpha1_blockdeviceclaim_cr.yaml
   ```

4. Verify if particular BD is claimed using the following command:

   ```
   kubectl get bdc -n <openebs_installed_namespace>
   ```

<br>

<a href="#top">Go to top</a>

<h3><a class="anchor" aria-hidden="true" id="provision-localpv-on-k3os"></a>How to provision Local PV on K3OS?</h3>


K3OS can be installed on any hypervisor The procedure for deploying K3OS on VMware environment is provided in the following section. There are 3 steps for provisioning OpenEBS Local PV on K3OS.

1. Configure server(master)
2. Configure agent(worker)
3. Deploying OpenEBS

The detailed information of each steps are provided below.

- **Configure server(master)**

  - Download the ISO file from the latest [release](https://github.com/rancher/k3os/releases) and create a virtual machine in VMware. Mount the ISO file into hypervisor and start a virtual machine.

  - Select **Run k3OS LiveCD or Installation** and press <ENTER>.

  - The system will boot-up and gives you the login prompt.

  - Login as **rancher** user without providing password.

  - Set a password for **rancher** user to enable connectivity from other machines by running `sudo passwd rancher`.

  - Now, install K3OS into disk. This can be done by running the command `sudo os-config`.

  - Choose the option 1.Install to disk . Answer the proceeding questions and provide rancher user password.

  - As part of above command execution, you can configure the host as either server or agent. Select `1.server` to configure K3s master.

  - While configuring server, set cluster secret which would be used while joining nodes to the server. After successful installation and server reboot, check the cluster status.

  - Run following command to get the details of nodes:

    ```
    kubectl get nodes
    ```

    Example output:

    ```
    NAME         STATUS   ROLES    AGE     VERSION
    k3os-14539   Ready    <none>   2m33s   v1.14.1-k3s.4
    ```

- **Configure agent(worker)**

  - Follow the above steps till installing K3OS into disk in all the hosts that you want to be part of K3s cluster.

  - To configure kubernetes agent with K3OS, select the option `2. agent` while running `sudo os-config` command. You need to provide URL of server and secret configured during server configuration.

  - After performing this, Kubernetes agent will be configured as follows and it will be added to the server.

  - Check the cluster configuration by checking the nodes using the following command:

    ```
    Kubectl get nodes
    ```

    Example output:

    ```
    NAME         STATUS   ROLES    AGE     VERSION
    k3os-14539   Ready    <none>   5m16s   v1.14.1-k3s.4
    k3os-32750   Ready    <none>   49m     v1.14.1-k3s.4
    ```

- **Installing OpenEBS**

  - Run the following command to install OpenEBS from master console:

    ```
    kubectl apply -f https://openebs.github.io/charts/openebs-operator-1.1.0.yaml
    ```

  - Check the OpenEBS components by running the following command:

    ```
    NAME                                           READY   STATUS              RESTARTS   AGE
    maya-apiserver-78c966c446-zpvhh                1/1     Running             2          101s
    openebs-admission-server-66f46564f5-8sz8c      1/1     Running             0          101s
    openebs-localpv-provisioner-698496cf9b-wkf95   1/1     Running             0          101s
    openebs-ndm-9kt4n                              0/1     ContainerCreating   0          101s
    openebs-ndm-mxqcf                              0/1     ContainerCreating   0          101s
    openebs-ndm-operator-7fb4894546-d2whz          1/1     Running             1          101s
    openebs-provisioner-7f9c99cf9-9jlgc            1/1     Running             0          101s
    openebs-snapshot-operator-79f7d56c7d-tk24k     2/2     Running             0          101s
    ```

    Note that `openebs-ndm` pods are in not created successfully. This is due to the lack of udev support in K3OS. More details can be found [here](https://github.com/openebs/openebs/issues/2686).

  - Now user can install Local PV on this cluster. Check the StorageClasses created as part of OpenEBS deployment by running the following command.

    ```
    kubectl get sc
    ```

    Example output:

    ```
    NAME                        PROVISIONER                                                AGE
    openebs-device              openebs.io/local                                           57m
    openebs-hostpath            openebs.io/local                                           57m
    openebs-jiva-default        openebs.io/provisioner-iscsi                               57m
    openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   57m
    ```

  - The default StorageClass `openebs-hostpath` can be used to create local PV on the path `/var/openebs/local` in your Kubernetes node. You can either use `openebs-hostpath` storage class to create volumes or create new storage class by following the steps mentioned [here](/docs/next/uglocalpv.html).

    **Note:** OpenEBS local PV will not be bound until the application pod is scheduled as its **volumeBindingMode** is set to **WaitForFirstConsumer.** Once the application pod is scheduled on a certain node, OpenEBS Local PV will be bound on that node.

<br>

<h3><a class="anchor" aria-hidden="true" id="how-to-make-cstor-volume-online-if-replicas-2-of-are-lost"></a>How to make cStor volume online if 2 replicas of 3 are lost ?</h3>



Application that is using cStor volume can run IOs, if at least 2 out of 3 replicas (i.e., > 50% of ReplicationFactor) have data with them. If 2 out of 3 replicas lost data, cStor volume goes into RO (read-only) mode, and, application can get into crashed state.
This section is to provide the steps to bring back volume online by scaling down replicas to 1 with a consideration of ReplicationFactor as 3 in the examples.

Perform the following steps to make the cStor volume online:

1. Check the current state of CVRs of a cStor volume.
2. Scaling down the replica count to 1 from 3.
3. Make the volume mount point into RW mode from the Worker node where application is scheduled.

The detailed information of each steps are provided below.

1. **Check the current state of CVRs of a cStor volume**

   - Run the following command to get the current state of CVR of a cStor volume.

     ```
     kubectl get cvr -n openebs
     ```

     Output will be similar to the following:

     ```
     NAME                                             USED	ALLOCATED   STATUS     AGE
     pvc-5c52d001-..........-cstor-sparse-pool-1irk   7.07M  4.12M   	Degraded   12m
     pvc-5c52d001-..........-cstor-sparse-pool-a1ud   6K  	6K       	Degraded   12m
     pvc-5c52d001-..........-cstor-sparse-pool-sb1v   8.15M  4.12M   	Healthy	   12m
     ```

   - Check the details of the corresponding cStor volume using the following command:

     ```
     kubectl get cstorvolume <cStor_volume_name> -n openebs -o yaml
     ```

     The following is a snippet of the output of the above command:

     ```
     apiVersion: v1
     items:
     - apiVersion: openebs.io/v1alpha1
       kind: CStorVolume
       metadata:
     …..
     	name: pvc-5c52d001-c6a1-11e9-be30-42010a800094
     	namespace: openebs
     	uid: 5c767ae5-c6a1-11e9-be30-42010a800094
       spec:
     …..
     	iqn: iqn.2016-09.com.openebs.cstor:pvc-5c52d001-c6a1-11e9-be30-42010a800094
     	targetPortal: 10.108.4.158:3260
       status:
     ......
     	**phase: Offline**  
     	replicaStatuses:
     	- checkpointedIOSeq: "0"
     ......
     	mode: **Healthy**
       	quorum: **"1"**
       	replicaId: "10135959964398189975"
     	- checkpointedIOSeq: "0"
     ......
     	mode: **Degraded**
       	quorum: **"0"**
       	replicaId: "9431770906853612612"
     	- checkpointedIOSeq: "0"
     ......
     	mode: **Degraded**
       	quorum: **"0"**
       	replicaId: "3920180363968537568"
     ```

     In the above snippet, one replica is in `Healthy` and the other two are in `Degraded` mode and cStor volume is in `Offline` state. Running IOs now on this cStor volume will get IO error on Node as below:

     ```
     / # touch /mnt/store1/file2
     touch: /mnt/store1/file2: Input/output error
     ```

2. **Scaling down the replica count to 1 from 3.**

   At this point, user can make the target pod healthy with the single replica which is in quorum. 

   **Note:** Target pod is made healthy on the assumption that the replica which is in quorum have the latest data with it. In other words, only the data that is available with the replica which is in quorum will be served.

   The following steps will help to make the target pod healthy with a single replica which is in quorum.

   1. Edit CStorVolume CR to set ReplicationFactor and ConsistencyFactor to 1.

      - Check the details of the corresponding cStor volume using the following command:

        ```
        kubectl get cstorvolume <cStor_volume_name> -n openebs -o yaml
        ```

        The following is a snippet of the output of the above command:

        ```
        apiVersion: v1
        items:
        - apiVersion: openebs.io/v1alpha1
          kind: CStorVolume
          metadata:
        …..
        	name: pvc-5c52d001-c6a1-11e9-be30-42010a800094
        	namespace: openebs
        	uid: 5c767ae5-c6a1-11e9-be30-42010a800094
          spec:
        …..
        	replicationFactor: 1
        	consistencyFactor: 1
        	iqn: iqn.2016-09.com.openebs.cstor:pvc-5c52d001-c6a1-11e9-be30-42010a800094
        	targetPortal: 10.108.4.158:3260
          status:
        ......
        	**phase: Healthy**  
        	replicaStatuses:
        	- checkpointedIOSeq: "0"
        ......
        	mode: **Healthy**
            quorum: **"1"**
          	replicaId: **"10135959964398189975"**
        ```

   2. Restart target pod by running following command

      ```
      kubectl delete pod -n openebs <target pod name>
      ```

   Now the cStor volume will be running with a single replica.

3. **Make the volume mount point into RW mode from the Worker node where application is scheduled.**

   Next, user should make the volume mount point into RW mode using the following steps.

   - If mount point of the volume went to RO, restart the application pod to bring back the mount point to RW state.

   - If application still remains in `CrashLoopback` state due to RO mode of mount point (`kubectl describe` of application pod will show the reason), follow below steps to convert it into RW:

     - Login to node where application pod is running.

       Get the node details where the application pod is running using the following command.

       ```
       Kubectl get pod -n <namespace> -o wide
       ```

       After identifying the node, ssh into the node.

     - Find the iSCSI disk related to this PVC.

       Run following command inside the node to get the iSCSI disk related to the PVC.

       ```
       sudo iscsiadm -m session -P 3
       ```

       The output will be similar to the following:

       ```
       iSCSI Transport Class version 2.0-870
       version 2.0-874
       **Target: iqn.2016-09.com.openebs.cstor:pvc-5c52d001-c6a1-11e9-be30-42010a800094** (non-flash)
           **Current Portal: 10.108.4.158:3260,1**
       ……
          	 ************************
          	 Attached SCSI devices:
          	 ************************
          	 Host Number: 1    State: running
          	 scsi1 Channel 00 Id 0 Lun: 0
          		 **Attached scsi disk sdb   	 State: running**
       
       ```

       From the above output, user can obtain the iSCSI disk related to this PV. In this example, SCSI disk related to this PV is `sdb`.

     - Unmount the mount points related to this PVC that are in RO.

       Next, perform unmount operation on mount points that are related to sdb. The following output will help to get the mount details related to disk sdb:

       ```
       sudo mount | grep sdb
       ```

       The output will be similar to the following:

       ```
       **/dev/sdb** on /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.108.4.158:3260-iqn.2016-09.com.openebs.cstor:pvc-5c52d001-c6a1-11e9-be30-42010a800094-lun-0 type ext4
       **/dev/sdb** on /home/kubernetes/containerized_mounter/rootfs/var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.108.4.158:3260-iqn.2016-09.com.openebs.cstor:pvc-5c52d001-c6a1-11e9-be30-42010a800094-lun-0 type ext4 (ro,relatime,stripe=256,data=ordered)
       **/dev/sdb** on /var/lib/kubelet/pods/5cb0af5a-c6a1-11e9-be30-42010a800094/volumes/kubernetes.io~iscsi/pvc-5c52d001-c6a1-11e9-be30-42010a800094 type ext4 (ro,relatime,stripe=256,data=ordered)
       **/dev/sdb** on /home/kubernetes/containerized_mounter/rootfs/var/lib/kubelet/pods/5cb0af5a-c6a1-11e9-be30-42010a800094/volumes/kubernetes.io~iscsi/pvc-5c52d001-c6a1-11e9-be30-42010a800094 type ext4 (ro,relatime,stripe=256,data=ordered)
       ```

       Perform unmount on the above found mountpoints.

     - Perform `iscsiadm logout` and `iscsiadm login` of the iSCSI session related to this PVC.

       From the node related to application pod, perform below command to logout:

       ```
       sudo iscsiadm -m node -t iqn.2016-09.com.openebs.cstor:pvc-5c52d001-c6a1-11e9-be30-42010a800094 -p 10.108.4.158:3260 -u
       ```

       From the node related to application pod, perform below command to login:

       ```
       sudo iscsiadm -m node -t iqn.2016-09.com.openebs.cstor:pvc-5c52d001-c6a1-11e9-be30-42010a800094 -p 10.108.4.158:3260 -l
       ```

     - Find the new iSCSI disk related to this PVC.

       Get the new iSCSI disk name after login using the following command:

       ```
       sudo iscsiadm -m session -P 3
       ```

       Output will be similar to the following:

       ```
       iSCSI Transport Class version 2.0-870
       version 2.0-874
       **Target: iqn.2016-09.com.openebs.cstor:pvc-5c52d001-c6a1-11e9-be30-42010a800094** (non-flash)
       ……..
          	 ************************
          	 Attached SCSI devices:
          	 ************************
          	 Host Number: 1    State: running
          	 scsi1 Channel 00 Id 0 Lun: 0
          		 **Attached scsi disk sdc   	 State: running**
       ```

     - Mount the mount points that are unmounted in 3rd step .

       Perform mount of the SCSI disk on the mount points which are unmounted in 3rd step.
       The application may still remain in RO state. If so, restart the application pod.

<br>

<a href="#top">Go to top</a>

<h3><a class="anchor" aria-hidden="true" id="how-to-reconstruct-data-from-healthy-replica-to-replaced-ones"></a>How to reconstruct data from healthy replica to replaced one?</h3>

To reconstruct data from healthy replica to the replaced ones can be performed using the following steps. To perform the following steps, cStor volume should be in `Online`. If cStor volume is not in `Online`, make it  online using the steps mentioned [here](#how-to-make-cstor-volume-online-if-replicas-2-of-are-lost).

Run the following command to get the current state of CVR of a cStor volume.

```
kubectl get cvr -n openebs
```

Output will be similar to the following:

```
NAME                                             USED	ALLOCATED   STATUS     AGE
pvc-5c52d001-..........-cstor-sparse-pool-1irk   7.07M  4.12M   	Degraded   12m
pvc-5c52d001-..........-cstor-sparse-pool-a1ud   6K  	6K       	Degraded   12m
pvc-5c52d001-..........-cstor-sparse-pool-sb1v   8.15M  4.12M   	Healthy	   12m
```

For easy representation, healthy replica will be referred to as R1, and offline replica that needs to be reconstructed with data will be referred to as R2. User should keep the information of healthy replica and replaced replica and associated pool in handy. 

In this example, R1 is `pvc-5c52d001-c6a1-11e9-be30-42010a800094-cstor-sparse-pool-sb1v` and R2 is `pvc-5c52d001-c6a1-11e9-be30-42010a800094-cstor-sparse-pool-a1ud` . Pool name associated to R1 is `cstor-sparse-pool-sb1v-77658f4c85-jcgwc` and pool name related to R2 is `cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md`. Pool name can be found by doing `zpool list` in the pool pod of that particular node.

The following are the steps to reconstruct data from healthy replica to a replaced replica:

1. Take base snapshot on R.
2. Copy the base snapshot to R2’s node.
3. Apply the base snapshot to the pool of R2.
4. Take incremental snapshot on R1.
5. Copy the incremental snapshot to R2’s node.
6. Apply the above incremental snapshot to the pool of R2.
7. Repeat steps 4, 5 and 6 till incremental snapshot is of lesser size.
8. Scale down spec.replicas to 0 of client application so that final changes can be transferred.
9. Scale down spec.replicas of target pod deployment to 0.
10. Perform steps 4, 5 and 6.
11. Set TargetIP and Quorum properties on R2.
12. Edit cStorVolume CR of this PVC to increase `ReplicationFactor` by 1 and to set `ConsistencyFactor` to (ReplicationFactor/2 + 1).
13. Scale up `spec.replicas` to 1 of target pod deployment.
14. Scale up `spec.replicas` of client application
15. Edit cStorVolume CR of this PVC to increase `ReplicationFactor` by 1 and to set `ConsistencyFactor` to (ReplicationFactor/2 + 1).
16. Restart the cStor target pod deployment.

**Step1:** Take base snapshot on R

Exec into cstor-pool-mgt container of pool pod of R1 to run snapshot command:

```
kubectl exec -it -n openebs -c cstor-pool-mgmt <pool pod name> -- bash
```

Run the following command inside the pool pod container to take the base snapshot 

```
zfs snapshot <pool_name>/<PV name>@<base_snap_name>
```

Example command:

```
root@cstor-sparse-pool-sb1v-77658f4c85-jcgwc:/# zfs snapshot cstor-231fca0f-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094@snap_data1
```

**Step2:** Copy the base snapshot to R2’s node

There are multiple ways to do this. In this article, above created snapshot is streamed to a file. This streamed file is copied to node related to R2. As /tmp directory of the pool pod is mounted on the host node at `/var/openebs/sparse/shared-<spc name>`, streamed file will be created at R1 and copied at R2 to this location.

- Stream snapshot to a file:

  Exec into cstor-pool-mgmt container of pool pod of R1 to run the below command:

  ```
   zfs send <pool_name>/<PV name>@<base_snap_name> > /tmp/base_snap_file
  ```

  Example command:

  ```
  root@cstor-sparse-pool-sb1v-77658f4c85-jcgwc:/# zfs send cstor-231fca0f-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094@snap_data1 > /tmp/pvc-5c52d001-c6a1-11e9-be30-42010a800094_snap_data1
  ```

- Copy the streamed file to local machine:

  ```
  gcloud compute --project "<project name>" scp --zone "us-central1-a" <user>@gke-vitta1-default-pool-0337597c-3b5d:/var/openebs/sparse/shared-cstor-sparse-pool/pvc-5c52d001-c6a1-11e9-be30-42010a800094_snap_data1 
  ```

- Copy the local copy of streamed file to another node:

  ```
  gcloud beta compute --project "<project name>" scp --zone "us-central1-a" pvc-5c52d001-c6a1-11e9-be30-42010a800094_snap_data1 <user>@gke-vitta1-default-pool-0337597c-vdg1:/var/openebs/sparse/shared-cstor-sparse-pool/
  ```

**Step3:** Apply the base snapshot to the pool of R2

Applying base snapshot to pool related to R2 involves setting a few parameters. Below are the steps:

- Exec into `cstor-pool-mgmt` container of pool pod related to R2.

  ```
  kubectl exec -it -c cstor-pool-mgmt -n <associated_pool_pod> -- bash
  ```

  Example command:

  ```
  kubectl exec -it -c cstor-pool-mgmt -n openebs cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md -- bash
  ```

- Identify the PV related datasets. 

  ```
  zfs list -t all
  ```

  The output will be similar to the following:

  ```
  NAME                                       	USED   AVAIL   REFER  MOUNTPOINT
  cstor-2292c294-c6a1-11e9-be30-42010a800094  9.86M  9.62G   512B   /cstor-2292c294-c6a1-11e9-be30-42010a800094
  **cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094**               				 6K     9.62G 	6K     -
  **cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094@rebuild_snap**  				 0B  	- 	    6K     -
  **cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094_rebuild_clone** 				 0B     9.62G 	6K     -
  ```

  Look for PV name in the above list output. In this example, datasets that are in bold are related to this PV.

  **Note:** Dataset which is <pool name>/<PV name> is the main replica. Dataset that ends with `@rebuild_snap` is the internally created snapshot, and the one that ends with `_rebuild_clone` is internally created clone.

- Unset target IP on the main volume.

  Run the following command to unset target ip on the main volume:

  ```
  zfs set io.openebs:targetip= <pool_name>/<PV name>
  ```

  Example command:

  ```
  root@cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md:/# zfs set io.openebs:targetip= cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094
  ```

- Delete rebuild_snap snapshot.

  **Note:** Below are destructive steps and need to be performed on verifying that they are the correct ones to be deleted.

  ```
  zfs destroy <pool_name>/<PV name_rebuild_clone>
  ```

  Example command:

  ```
  root@cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md:/# zfs destroy cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094_rebuild_clone
  ```

- Delete internally created clone related to this PV with suffix as _rebuild_clone.

  **Note:** Below are destructive steps and need to be performed on verifying that they are the correct ones to be deleted.

  ```
  zfs destroy <pool_name>/<PV name>@rebuild_snap
  ```

  Example command:

  ```
  root@cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md:/# zfs destroy cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094@rebuild_snap
  ```

- Apply the streamed file to offline pool:

  ```
  cat <base snapshot streamed file> | zfs recv -F <pool name>/<PV name>
  ```

  Example command:

  ```
  root@cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md:/# cat /tmp/pvc-5c52d001-c6a1-11e9-be30-42010a800094_snap_data1 | zfs recv -F cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a8000
  94
  ```

  Capacity “USED” can be verified by doing `zfs list -t all`

**Step4:** Take incremental snapshot on R1

From `cstor-pool-mgmt` container of pool pod related to R1, perform following command:

```
zfs snapshot <pool name>/<PV name>@<incr_snap_name>
```

Example command:

```
root@cstor-sparse-pool-sb1v-77658f4c85-jcgwc:/# zfs snapshot cstor-231fca0f-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094@snap_data1_data2
```

Please note that snapshot name which is <incr_snap_name> as mentioned above need to be different for each incremental snapshot. 

**Step5:** Copy the data in incremental snapshot to R2’s node

This involves streaming the incremental data to a file, copying it to R2.

- Stream incremental snapshot to a file:

  From cstor-pool-mgmt container of pool pod of R1, run below command:

  ```
  zfs send -i <pool_name>/<PV_name>@<prev_snap_name> <pool_name>/<PV_name>@<cur_snap_name> > /tmp/<incr_snap_file1>
  ```

  Example command:

  ```
  root@cstor-sparse-pool-sb1v-77658f4c85-jcgwc:/# zfs send -i cstor-231fca0f-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094@snap_data1 cstor-231fca0f-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094@snap_data1_data2 > /tmp/pvc-5c52d001-c6a1-11e9-be30-42010a800094_snap_data1_data2
  ```

  Copy the streamed file to R2 following the steps similar to copying the streamed file related to base snapshot.

**Step6:** Apply the above incremental snapshot to pool of R2

Exec into `cstor-pool-mgmt` container of pool pod of R2 to run:

```
cat /tmp/<incr_snap_file1> | zfs recv <pool name>/<PV name>
```

Example command to apply incremental snapshot:

```
root@cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md:/# cat /tmp/pvc-5c52d001-c6a1-11e9-be30-42010a800094_snap_data1_data2 | zfs recv cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094
```

`zfs list -t all` should show the dataset related to this PVC with increased "USED" space.

Example command:

```
root@cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md:/# zfs list -t all
```

Output will be similar to the following:

```
NAME                                         USED   AVAIL   REFER  MOUNTPOINT
cstor-2292c294-c6a1-11e9-be30-42010a800094   85.7M  9.54G   512B   /cstor-2292c294-c6a1-11e9-be30-42010a800094
**cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094**                                                84.9M  9.54G   84.9M   -
cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094@snap_data1    	                41.5K  -       4.12M  -
cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094@snap_data1_data2 				0B     -       84.9M  -
```

**Step7:** Repeat steps 4, 5 and 6 till incremental snapshot is of lesser size

**Step 8**: Scale down `spec.replicas` to 0 of client application so that final changes can be transferred.

**Step 9**:Scale down `spec.replicas` of target pod deployment to 0.

**Step 10**: Perform steps 4, 5 and 6

**Step 11**: Set TargetIP and Quorum properties on R2

Once **steps 8,9 and 10** are followed, set `targetIP` and quorum properties of newly reconstructed R2.

- Set quorum on the newly reconstructed dataset on R2.

  In the cstor-pool-mgmt container of pool pod related to R2, perform the following command:

  ```
  zfs set quorum=on <pool name>/<PV name>
  ```

  Example command:

  ```
  root@cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md:/# zfs set quorum=on cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094
  ```

- Set `targetIP` on the newly rebuilt dataset on R2 

  ```
  zfs set io.openebs:targetip=<service IP related to PV’s target pod> <pool name>/<PV name>
  ```

  Example command:

  ```
  root@cstor-sparse-pool-a1ud-5dd8bb6fb6-f54md:/# zfs set io.openebs:targetip=10.108.4.158 cstor-2292c294-c6a1-11e9-be30-42010a800094/pvc-5c52d001-c6a1-11e9-be30-42010a800094
  ```

**Step 12**: Edit ‘CStorVolume’ CR of this PVC to increase `ReplicationFactor` by 1 and to set `ConsistencyFactor` to (ReplicationFactor/2 + 1)

**Step 13**: Scale up `spec.replicas` to 1 of target pod deployment

On performing  step 12 and 13, this newly reconstructed replica gets added to the cStor volume.

Status of CStorVolume and CVRs related to this PV looks like:

```
NAME                                              USED	  ALLOCATED   STATUS	AGE
pvc-5c52d001-...........-cstor-sparse-pool-1irk   7.07M   4.12M   	  Offline   3d
pvc-5c52d001-...........-cstor-sparse-pool-a1ud   90.8M   85.0M   	  Healthy   3d
pvc-5c52d001-...........-cstor-sparse-pool-sb1v   90.8M   85.0M   	  Healthy   3d
```

Check the details of the corresponding cStor volume using the following command:

```
kubectl get cstorvolume <cStor_volume_name> -n openebs -o yaml
```

The following is a snippet of the output of the above command:

```
apiVersion: v1
items:
- apiVersion: openebs.io/v1alpha1
  kind: CStorVolume
  metadata:
…….
	name: pvc-5c52d001-c6a1-11e9-be30-42010a800094
	uid: 5c767ae5-c6a1-11e9-be30-42010a800094
  spec:
…….
	consistencyFactor: 2
	iqn: iqn.2016-09.com.openebs.cstor:pvc-5c52d001-c6a1-11e9-be30-42010a800094
	replicationFactor: 2
	targetPortal: 10.108.4.158:3260
  status:
…….
	phase: **Healthy**
	replicaStatuses:
	- checkpointedIOSeq: "1049425"
…….
	mode: **Healthy**
  	quorum: **"1"**
  	replicaId: "10135959964398189975"
	- checkpointedIOSeq: "1049282"
…….
	mode: **Healthy**
  	quorum: **"1"**
  	replicaId: "3920180363968537568"
```

**Step 14**: Scale up `spec.replicas` of client application.

**Step 15**: To make third replica healthy, edit ‘CStorVolume’ CR of this PVC to increase `ReplicationFactor` by 1 and to set `ConsistencyFactor` to (ReplicationFactor/2 + 1). After doing this change, `ReplicationFactor` will be 3 and  `ConsistencyFactor` to 2.

**Step 16:** Restart the cStor target pod deployment of the volume using the following command:

```
kubectl delete pod <cStor_target_pod> -n openebs
```

Step 17: After sometime, the third replica will come to healthy state. Status of  CVRs related to this PV will looks like below:

```
NAME                                              USED	  ALLOCATED   STATUS	AGE
pvc-5c52d001-...........-cstor-sparse-pool-1irk   90.8M   85.0M   	  Healthy   3d
pvc-5c52d001-...........-cstor-sparse-pool-a1ud   90.8M   85.0M   	  Healthy   3d
pvc-5c52d001-...........-cstor-sparse-pool-sb1v   90.8M   85.0M   	  Healthy   3d
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
