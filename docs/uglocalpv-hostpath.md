---
id: uglocalpv-hostpath
title: OpenEBS Local PV Hostpath User Guide
sidebar_label: Local PV Hostpath
---
------

<br>

This guide will help you to set up and use OpenEBS Local Persistent Volumes backed by Hostpath. 

*OpenEBS Dynamic Local PV provisioner* can create Kubernetes Local Persistent Volumes using a unique Hostpath (directory) on the node to persist data, hereafter referred to as *OpenEBS Local PV Hostpath* volumes. 

*OpenEBS Local PV Hostpath* volumes have the following advantages compared to native Kubernetes hostpath volumes. 
- OpenEBS Local PV Hostpath allows your applications to access hostpath via StorageClass, PVC, and PV. This provides you the flexibility to change the PV providers without having to redesign your Application YAML. 
- Data protection using the Velero Backup and Restore.
- Protect against hostpath security vulnerabilities by masking the hostpath completely from the application YAML and pod.

OpenEBS Local PV uses volume topology aware pod scheduling enhancements introduced by [Kubernetes Local Volumes](https://kubernetes.io/docs/concepts/storage/volumes/#local)

<br>

:::tip QUICKSTART

OpenEBS Local PV Hostpath volumes will be created under `/var/openebs/local` directory. You can customize the location by [configuring install parameters](#install) or by creating new [StorageClass](#create-storageclass). 

If you have OpenEBS already installed, you can create an example pod that persists data to *OpenEBS Local PV Hostpath* with following kubectl commands. 
```
kubectl apply -f https://openebs.github.io/charts/examples/local-hostpath/local-hostpath-pvc.yaml
kubectl apply -f https://openebs.github.io/charts/examples/local-hostpath/local-hostpath-pod.yaml
```

Verify using below kubectl commands that example pod is running and is using a OpenEBS Local PV Hostpath.
```
kubectl get pod hello-local-hostpath-pod
kubectl get pvc local-hostpath-pvc
```

For a more detailed walkthrough of the setup, follow along the rest of this document.
:::

## Minimum Versions

- Kubernetes 1.12 or higher is required
- OpenEBS 1.0 or higher is required. 

## Prerequisites

Setup the directory on the nodes where Local PV Hostpaths will be created. This directory will be referred to as `BasePath`. The default location is `/var/openebs/local`.  

`BasePath` can be any of the following:
- A directory on root disk (or `os disk`). (Example: `/var/openebs/local`). 
- In the case of bare-metal Kubernetes nodes, a mounted directory using the additional drive or SSD. (Example: An SSD available at `/dev/sdb`, can be formatted with Ext4 and mounted as `/mnt/openebs-local`) 
- In the case of cloud or virtual instances, a mounted directory created from attaching an external cloud volume or virtual disk. (Example, in GKE, a Local SSD can be used which will be available at `/mnt/disk/ssd1`.)

:::note air-gapped environment
If you are running your Kubernetes cluster in an air-gapped environment, make sure the following container images are available in your local repository.
- openebs/localpv-provisioner
- openebs/linux-utils
:::

:::note Rancher RKE cluster
If you are using the Rancher RKE cluster, you must configure kubelet service with `extra_binds` for `BasePath`. If your `BasePath` is the default directory `/var/openebs/local`, then extra_binds section should have the following details:
```
services:
  kubelet:
    extra_binds:
      - /var/openebs/local:/var/openebs/local
```
:::

## Install 

You can skip this section if you have already installed OpenEBS.

1. Prepare to install OpenEBS by providing custom values for configurable parameters. 

   *OpenEBS Dynamic Local Provisioner* offers some configurable parameters that can be applied during the OpenEBS Installation. Some key configurable parameters available for OpenEBS Dynamic Local Provisioner are:

   - The location of the *OpenEBS Dynamic Local PV provisioner* container image.
     <div class="co">
     Default value: openebs/provisioner-localpv
     YAML specification: spec.image on Deployment(localpv-provisioner)
     Helm key: localprovisioner.image
     </div>

   - The location of the *Provisioner Helper* container image. *OpenEBS Dynamic Local Provisioner* create a *Provisioner Helper* pod to create and delete hostpath directories on the nodes.
     <div class="co">
     Default value: openebs/linux-utils
     YAML specification: Environment Variable (OPENEBS_IO_HELPER_IMAGE) on Deployment(localpv-provisioner) 
     Helm key: helper.image
     </div>

   - The absolute path on the node where the Hostpath directory of a Local PV Volume will be created.
     <div class="co">
     Default value: /var/openebs/local
     YAML specification: Environment Variable (OPENEBS_IO_LOCALPV_HOSTPATH_DIR) on Deployment(maya-apiserver)
     Helm key: localprovisioner.basePath
     </div>

2. You can proceed to install OpenEBS either using kubectl or helm using the steps below. 

   - Install using kubectl
  
     If you would like to change the default values for any of the configurable parameters mentioned in the previous step, download the `openebs-operator.yaml` and make the necessary changes before applying. 
     ```
     kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml
     ```

     :::note 
     If you would like to use only Local PV (hostpath and device), you can install a lite verison of OpenEBS using the following command.

     kubectl apply -f https://openebs.github.io/charts/openebs-operator-lite.yaml
     kubectl apply -f https://openebs.github.io/charts/openebs-lite-sc.yaml
     :::

   - Install using helm stable charts
  
     If you would like to change the default values for any of the configurable parameters mentioned in the previous step, specify each parameter using the `--set key=value[,key=value]` argument to `helm install`.
  
     ```
     helm repo update
     helm install --namespace openebs --name openebs stable/openebs
     ```

## Create StorageClass

You can skip this section if you would like to use default OpenEBS Local PV Hostpath StorageClass created by OpenEBS. 

The default Storage Class is called `openebs-hostpath` and its `BasePath` is configured as `/var/openebs/local`. 

1. To create your own StorageClass with custom `BasePath`, save the following StorageClass definition as `local-hostpath-sc.yaml`

   ```
   apiVersion: storage.k8s.io/v1
   kind: StorageClass
   metadata:
     name: local-hostpath
     annotations:
       openebs.io/cas-type: local
       cas.openebs.io/config: |
         - name: StorageType
           value: hostpath
         - name: BasePath
           value: /var/local-hostpath
   provisioner: openebs.io/local
   reclaimPolicy: Delete
   volumeBindingMode: WaitForFirstConsumer
   ```

   :::note 
   The `volumeBindingMode` MUST ALWAYS be set to `WaitForFirstConsumer`. `volumeBindingMode: WaitForFirstConsumer` instructs Kubernetes to initiate the creation of PV only after Pod using PVC is scheduled to the node.
   :::

2. Edit `local-hostpath-sc.yaml` and update with your desired values for `metadata.name` and `cas.openebs.io/config.BasePath`.

   :::note 
   If the `BasePath` does not exist on the node, *OpenEBS Dynamic Local PV Provisioner* will attempt to create the directory, when the first Local Volume is scheduled on to that node. You MUST ensure that the value provided for `BasePath` is a valid absolute path. 
   :::

3. Create OpenEBS Local PV Hostpath Storage Class. 
   ```
   kubectl apply -f local-hostpath-sc.yaml
   ```

4. Verify that the StorageClass is successfully created. 
   ```
   kubectl get sc local-hostpath -o yaml
   ```


## Install verification

Once you have installed OpenEBS, verify that *OpenEBS Local PV provisioner* is running and Hostpath StorageClass is created. 

1. To verify *OpenEBS Local PV provisioner* is running, execute the following command. Replace `-n openebs` with the namespace where you installed OpenEBS. 

   ```
   kubectl get pods -n openebs -l openebs.io/component-name=openebs-localpv-provisioner
   ```

   The output should indicate `openebs-localpv-provisioner` pod is running. 
   <div class="co">
   NAME                                           READY   STATUS    RESTARTS   AGE
   openebs-localpv-provisioner-5ff697f967-nb7f4   1/1     Running   0          2m49s
   </div>

2. To verify *OpenEBS Local PV Hostpath* Storageclass is created, execute the following command. 

   ```
   kubectl get sc
   ```

   The output should indicate either the default StorageClass `openebs-hostpath` and/or custom StorageClass `local-hostpath` are displayed.
   <div class="co">
   NAME                        PROVISIONER                                                AGE
   local-hostpath              openebs.io/local                                           5h26m
   openebs-hostpath            openebs.io/local                                           6h4m
   </div>


## Create a PersistentVolumeClaim

The next step is to create a PersistentVolumeClaim. Pods will use PersistentVolumeClaims to request Hostpath Local PV from *OpenEBS Dynamic Local PV provisioner*.

1. Here is the configuration file for the PersistentVolumeClaim. Save the following PersistentVolumeClaim definition as `local-hostpath-pvc.yaml`

   ```
   kind: PersistentVolumeClaim
   apiVersion: v1
   metadata:
     name: local-hostpath-pvc
   spec:
     storageClassName: openebs-hostpath
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 5G
   ```

2. Create the PersistentVolumeClaim

   ```
   kubectl apply -f local-hostpath-pvc.yaml
   ```

3. Look at the PersistentVolumeClaim:
   
   ```
   kubectl get pvc local-hostpath-pvc
   ```

   The output shows that the `STATUS` is `Pending`. This means PVC has not yet been used by an application pod. The next step is to create a Pod that uses your PersistentVolumeClaim as a volume.

   <div class="co">
   NAME                 STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS       AGE
   local-hostpath-pvc   Pending                                      openebs-hostpath   3m7s
   </div>

## Create Pod to consume OpenEBS Local PV Hospath Storage

1. Here is the configuration file for the Pod that uses Local PV. Save the following Pod definition to `local-hostpath-pod.yaml`.

   ```
   apiVersion: v1
   kind: Pod
   metadata:
     name: hello-local-hostpath-pod
   spec:
     volumes:
     - name: local-storage
       persistentVolumeClaim:
         claimName: local-hostpath-pvc
     containers:
     - name: hello-container
       image: busybox
       command:
          - sh
          - -c
          - 'while true; do echo "`date` [`hostname`] Hello from OpenEBS Local PV." >> /mnt/store/greet.txt; sleep $(($RANDOM % 5 + 300)); done'
       volumeMounts:
       - mountPath: /mnt/store
         name: local-storage
   ```

   :::note
   As the Local PV storage classes use `waitForFirstConsumer`, do not use `nodeName` in the Pod spec to specify node affinity. If `nodeName` is used in the Pod spec, then PVC will remain in `pending` state. For more details refer https://github.com/openebs/openebs/issues/2915.
   :::

2. Create the Pod:

   ```
   kubectl apply -f local-hostpath-pod.yaml
   ```

3. Verify that the container in the Pod is running.

   ```
   kubectl get pod hello-local-hostpath-pod
   ```
4. Verify that the data is being written to the volume.

   ```
   kubectl exec hello-local-hostpath-pod -- cat /mnt/store/greet.txt
   ```
   
5. Verify that the container is using the Local PV Hostpath.
   ```
   kubectl describe pod hello-local-hostpath-pod
   ```

   The output shows that the Pod is running on `Node: gke-kmova-helm-default-pool-3a63aff5-1tmf` and using the peristent volume provided by `local-hostpath-pvc`.

   <div class="co">
   Name:         hello-local-hostpath-pod
   Namespace:    default
   Priority:     0
   Node:         gke-kmova-helm-default-pool-3a63aff5-1tmf/10.128.0.28
   Start Time:   Thu, 16 Apr 2020 17:56:04 +0000  
   ...  
   Volumes:
     local-storage:
       Type:       PersistentVolumeClaim (a reference to a PersistentVolumeClaim in the same namespace)
       ClaimName:  local-hostpath-pvc
       ReadOnly:   false
   ...
   </div>

6. Look at the PersistentVolumeClaim again to see the details about the dynamically provisioned Local PersistentVolume
   ```
   kubectl get pvc local-hostpath-pvc
   ```

   The output shows that the `STATUS` is `Bound`. A new Persistent Volume `pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425` has been created. 

   <div class="co">
   NAME                 STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
   local-hostpath-pvc   Bound    pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425   5G         RWO            openebs-hostpath   28m
   </div>

7. Look at the PersistentVolume details to see where the data is stored. Replace the PVC name with the one that was displayed in the previous step. 
   ```
   kubectl get pv pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425 -o yaml
   ```
   The output shows that the PV was provisioned in response to PVC request  `spec.claimRef.name: local-hostpath-pvc`. 

   <div class="co">
   apiVersion: v1
   kind: PersistentVolume
   metadata:
     name: pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425
     annotations:
       pv.kubernetes.io/provisioned-by: openebs.io/local
     ...
   spec:
     accessModes:
       - ReadWriteOnce
     capacity:
       storage: 5G
     claimRef:
       apiVersion: v1
       kind: PersistentVolumeClaim
       name: local-hostpath-pvc
       namespace: default
       resourceVersion: "291148"
       uid: 864a5ac8-dd3f-416b-9f4b-ffd7d285b425  
     ...
     ...
     local:
       fsType: ""
       path: /var/openebs/local/pvc-864a5ac8-dd3f-416b-9f4b-ffd7d285b425
     nodeAffinity:
       required:
         nodeSelectorTerms:
         - matchExpressions:
           - key: kubernetes.io/hostname
             operator: In
             values:
             - gke-kmova-helm-default-pool-3a63aff5-1tmf
     persistentVolumeReclaimPolicy: Delete
     storageClassName: openebs-hostpath
     volumeMode: Filesystem
   status:
     phase: Bound
   </div>
   <br/>

:::note 
A few important characteristics of a *OpenEBS Local PV* can be seen from the above output: 
- `spec.nodeAffinity` specifies the Kubernetes node where the Pod using the Hostpath volume is scheduled. 
- `spec.local.path` specifies the unique subdirectory under the `BasePath (/var/local/openebs)` defined in corresponding StorageClass.
:::
  
## Cleanup

Delete the Pod, the PersistentVolumeClaim and StorageClass that you might have created. 

```
kubectl delete pod hello-local-hostpath-pod
kubectl delete pvc local-hostpath-pvc
kubectl delete sc local-hostpath
```

Verify that the PV that was dynamically created is also deleted. 
```
kubectl get pv
```

## Backup and Restore

OpenEBS Local Volumes can be backed up and restored along with the application using [Velero](https://velero.io).

:::note
The following steps assume that you already have Velero with Restic integration is configured. If not, please follow the [Velero Documentation](https://velero.io/docs/) to proceed with install and setup of Velero.  If you encounter any issues or have questions, talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).
:::

### Backup

The following steps will help you to prepare and backup the data from the volume created for the example pod (`hello-local-hostpath-pod`), with the volume mount (`local-storage`). 

1. Prepare the application pod for backup. Velero uses Kubernetes labels to select the pods that need to be backed up. Velero uses annotation on the pods to determine which volumes need to be backed up. For the example pod launched in this guide, you can inform velero to backup by specifing the following label and annotation. 
   
   ```
   kubectl label pod hello-local-hostpath-pod app=test-velero-backup
   kubectl annotate pod hello-local-hostpath-pod backup.velero.io/backup-volumes=local-storage
   ```
2. Create a Backup using velero. 

   ```
   velero backup create bbb-01 -l app=test-velero-backup
   ```

3. Verify that backup is successful. 

   ```
   velero backup describe bbb-01 --details
   ```

   On successful completion of the backup, the output of the backup describe command will show the following:
   <div class="co">
   ...
   Restic Backups:
     Completed:
       default/hello-local-hostpath-pod: local-storage
   </div>
 
### Restore

1. Install and Setup Velero, with the same provider where backups were saved. Verify that backups are accessible. 
   
   ```
   velero backup get
   ```
   
   The output of should display the backups that were taken successfully. 
   <div class="co">
   NAME     STATUS      CREATED                         EXPIRES   STORAGE LOCATION   SELECTOR
   bbb-01   Completed   2020-04-25 15:49:46 +0000 UTC   29d       default            app=test-velero-backup
   </div>

2. Restore the application. 

   :::note
   Local PVs are created with node affinity. As the node names will change when a new cluster is created, create the required PVC(s) prior to proceeding with restore.
   :::
   
   Replace the path to the PVC yaml in the below commands, with the PVC that you have created. 
   ```
   kubectl apply -f https://openebs.github.io/charts/examples/local-hostpath/local-hostpath-pvc.yaml
   velero restore create rbb-01 --from-backup bbb-01 -l app=test-velero-backup
   ```

3. Verify that application is restored.

   ```
   velero restore describe rbb-01
   ```
   
   Depending on the data, it may take a while to initialize the volume. On successful restore, the output of the above command should show:
   <div class="co">
   ...
   Restic Restores (specify --details for more information):
     Completed:  1
   </div>
   
4. Verify that data has been restored. The application pod used in this example, write periodic messages (greetings) to the volume. 

   ```
   kubectl exec hello-local-hostpath-pod -- cat /mnt/store/greet.txt
   ```
   
   The output will show that backed up data as well as new greetings that started appearing after application pod was restored. 
   <div class="co">
   Sat Apr 25 15:41:30 UTC 2020 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
   Sat Apr 25 15:46:30 UTC 2020 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
   Sat Apr 25 16:11:25 UTC 2020 [hello-local-hostpath-pod] Hello from OpenEBS Local PV.
   </div>

## Troubleshooting 

Review the logs of the OpenEBS Local PV provisioner. OpenEBS Dynamic Local Provisioner logs can be fetched using. 

```
kubectl logs -n openebs -l openebs.io/component-name=openebs-localpv-provisioner
```

## Support

If you encounter issues or have a question, file an [Github issue](https://github.com/openebs/openebs/issues/new), or talk to us on the [#openebs channel on the Kubernetes Slack server](https://kubernetes.slack.com/messages/openebs/).

## See Also:

### [Understand OpenEBS Local PVs ](/docs/next/localpv.html)


<br>

