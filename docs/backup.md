---
id: backup
title: Backup and Restore of OpenEBS volumes
sidebar_label: Backup and Restore
---
------

This document contains quick reference of the installation steps for both OpenEBS and heptio Ark which can be used for taking backup of OpenEBS volumes and then restoration of the data whenever it needed.



<img src="/docs/assets/ark-openebs.png" alt="drawing" width="800"/>

## <font size="5">**Recommendation**</font>

Recommended Kubernetes version is 1.10.7 and later. If you are using prior to the recommended version, you may face some issues and this can be rectified with some workaround steps which is mentioned below.

## Prerequisites

- 3 Node Kubernetes cluster with 1.10.7 and later
- Local ubuntu machine with 16.04 LTS with gcloud and gsutil packages. If you do not have the gcloud and gsutil CLIs locally installed, follow the [user guide](https://cloud.google.com/sdk/docs/) to set them up.
- kubectl installed on the local ubuntu machine

<font size="5">Create clsuterrolebinding from the local ubuntu machine if you are using GKE</font>

- gcloud container clusters get-credentials <cluster_name> --zone <zone_name> --project <project_name>
- kubectl create clusterrolebinding <cluster_name>-cluster-admin-binding --clusterrole=cluster-admin --user=<user_email>

## Setup buckets and IAM roles

<font size="5">Buckets for ARK backup and Restic data backup</font>

Heptio Ark requires an object storage bucket in which to store backups.Create GCS bucket using following way

```
gsutil mb gs://<ark_bucket_name>/
gsutil mb gs://<ark-restic_bucket_name>/
```

<font size="5">Identity and Access Management (IAM) setup</font>

- Set the GKE configuration with appropriate project and account on local ubuntu machine if not yet done before.

- Verify the GKE configuration has set correctly using following command.

  ```
  gcloud config list
  ```

- Now, export your corresponding project id obtained from the output of previous command.You can done by following command

  ```
  export PROJECT_ID=<project_id>
  ```

- Create a service account. This can be done by following way.

  ```
  gcloud iam service-accounts create <random_name>-heptio-ark --display-name  “Heptio Ark service account"
  ```

- Now new service account has been created. Verify the service account details using following command

  ```
  gcloud iam service-accounts list
  ```

- Fetch the service account email id of the new service account and export using following way.

  ```
  export SERVICE_ACCOUNT_EMAIL="<email_id>"
  ```

- Attach policies to give heptio-ark the necessary permissions to function. Run below entries in your local ubuntu host.

  ```
  BUCKET=<YOUR_BUCKET>
  ROLE_PERMISSIONS=(
   compute.disks.get
   compute.disks.create
   compute.disks.createSnapshot
   compute.snapshots.get
   compute.snapshots.create
   compute.snapshots.useReadOnly
   compute.snapshots.delete
   compute.projects.get
   )
  ```

  Run following commands to create IAM role and 

  ```
  gcloud iam roles create <random_name>_heptio_ark.server \
       --project PROJECT_ID \
       --title "Heptio Ark Server" \
       --permissions "(IFS=","; echo "${ROLE_PERMISSIONS[*]}")"    
  ```

  ```
  gcloud projects add-iam-policy-binding PROJECT_ID \
       --member serviceAccount:SERVICE_ACCOUNT_EMAIL \
       --role projects/$PROJECT_ID/roles/<random_name>_heptio_ark.server
  ```

  ```
  gsutil iam ch serviceAccount:SERVICE_ACCOUNT_EMAIL:objectAdmin gs://{BUCKET}
  ```

  ```
  gsutil iam ch serviceAccount:SERVICE_ACCOUNT_EMAIL:objectAdmin gs://{RESTIC_BUCKET}
  ```

<font size="5">Download and setup ARK on your local ubuntu host</font>

- Clone the ark repo using the following way.

  ```
  git clone https://github.com/heptio/ark.git
  cd ark
  git checkout v0.9.5
  ```

- Edit **examples/gcp/00-ark-config.yaml** with corresponding bucket name and uncomment restic location and provide restic bucket storage details.

  ```
  apiVersion: ark.heptio.com/v1
  kind: Config
  metadata:
    namespace: heptio-ark
    name: default
  persistentVolumeProvider:
    name: gcp
  backupStorageProvider:
    name: gcp
    bucket: <ark_backup_storage>
    # Uncomment the below line to enable restic integration.
    # The format for resticLocation is <bucket>[/<prefix>],
    # e.g. "my-restic-bucket" or "my-restic-bucket/repos".
    # This MUST be a different bucket than the main Ark bucket
    # specified just above.
    resticLocation: <ark_restic_backup_storage>
  backupSyncPeriod: 30m
  	gcSyncPeriod: 30m
  	scheduleSyncPeriod: 1m
  	restoreOnlyMode: false
  ```

- Download the package for ark and move the binary to executable location. Setps are mentioned below.

  ```
  wget https://github.com/heptio/ark/releases/download/v0.9.5/ark-v0.9.5-linux-amd64.tar.gz
  tar -zxvf ark-v0.9.5-linux-amd64.tar.gz
  sudo mv ark /usr/local/bin/
  sudo mv ark-restic-restore-helper /usr/local/bin/
  ```

## Install ARK on GKE Cluster

- Go to the checked out ark repo on the local ubuntu host.

  ```
  cd ~/ark
  ```

- Install Ark using following command

  ```
  kubectl apply -f examples/common/00-prereqs.yaml
  ```

- set the SERVICE_ACCOUNT_EMAIL and PROJECT_ID using following way

  ```
  export PROJECT_ID=<project_id>
  export SERVICE_ACCOUNT_EMAIL="<email_id>"
  ```

- Create a key for your new service account using following command

  ```
  gcloud iam service-accounts keys create credentials-ark \
   --iam-account $SERVICE_ACCOUNT_EMAIL
  
  kubectl create secret generic cloud-credentials \
   --namespace heptio-ark \
   --from-file cloud=credentials-ark
  ```

- Start the ark server using following commands

  ```
  kubectl apply -f examples/gcp/00-ark-config.yaml
  kubectl apply -f examples/gcp/10-deployment.yaml
  kubectl apply -f examples/gcp/20-restic-daemonset.yaml
  ```

- Check ark components status by running following command. 

  ```
  kubectl get pods -n heptio-ark
  ```

## Setup OpenEBS and a Sample Application

- Install OpenEBS by running following command

  ```
  kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
  ```

- Get the OpenEBS components status by running following command

  ```
  kubectl get pods -n openebs
  ```

- Clone repo for running application

  ```
  git clone <https://github.com/kmova/bootstrap.git>
  cd bootstrap/gke-openebs/jiva-ark-bkp-rcovery/
  ```

- Run the application using following command

  ```
  kubectl apply -f busybox.yaml
  ```

- Login to application by exec into it

  ```
  kubectl exec -it busybox /bin/sh
  ```

- Goto /mnt/store1 and write some data.

- Get the details od pod using the proper label using following command

  ```
  kubectl get pods -l <app-label-selector>
  ```

## Backup

- Login to restic pod on the node where busy box is running . Check data is visible in the following directory.

  ```
  /host_pods/<busybox-pod-id>/volumes/kubernetes.io~iscsi/<pod-name>
  ```

   **Note:**  If your are using K8s 1.10.7 or earlier, the data written on the pods will not visible in the restic daemonset pod on the same node. This feature requires - mount-propogration feature to be enabled in k8s. 

  **Workaround:** Delete the particular restic pod which is being run on the same node where application is running. After it restarts, the data is visible.

- Once data is visible on the restic pod,backup the data to ark backup storage using following command

  ```
  ark backup create <backup_job_name> -l <app-label-selector>
  ```

  Example:

  ```
  ark backup create bbb-01 -l app=test-ark-backup
  ```

-  You can verify the backup status using following commands.

  ```
  ark backup describe <backup_job_name>
  ```

  Example:

  ```
  ark backup describe bbb-01
  ```

-  Verify the backup and restic backup location is having details of backup configuration using below way.

  ```
  gsutil ls gs://<ark_bucket_name>/default/
  gsutil mb gs://<ark-restic_bucket_name>/<backup_job_name>/
  ```

## Scheduled backups 

You can do backup in a scheduled manner so that backup will take automatically as per the cron job. 

- You can schedule back up by using following way.

  ```
  ark schedule create <job-name> --schedule "0 * * * *" -l <app-label-selector>
  ```

  Example:

  ```
  ark schedule create bbb-hourly-percona --schedule "0 * * * *" -l name=percona
  ```

  This will schedule backup with name <job-name> for every hour. You can change the schedule period as you are doing in cron job.

- Check the backup job status by running below command.

  ```
  ark backup get
  ```

<font size="5">Restore of PVC can happen for the following reasons</font>

For testing purpose, you can delete the application.

1. Application data accidentally deleted
2. Application data got corrupted
3. The disks  going bad in case of single replica, or multiple disks going bad across nodes.
4. Entire DC/Cluster down etc…

To test the above mentioned scenario 1,2

- Goto the application yaml file location and execute following command

  ```
  kubectl delete -f busybox.yaml
  ```

To test the scenario 3,4 ,you can follow the below steps.

- Install a new K8S( in this case GKE) cluster

- Install Ark using the steps mentioned in “Install ARK on GKE Cluster”

- Install OpenEBS using following command

  ```
  kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
  ```

## Restore the application

- Recreate the application using its restore pvc yaml. You can execute following command to restore the pvc which was used for running the application.

  ```
  kubectl apply -f busybox-restore-pvc.yaml
  ```

  Example YAML for **busybox-restore-pvc.yaml** given below.

  ```
  ---
  kind: PersistentVolumeClaim
  apiVersion: v1
  metadata:
    name: demo-vol1-claim-percona
  spec:
    storageClassName: openebs-jiva-default
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 5G
  ---
  ```

- Now restore the data from the ark backup storage to the application mount point.

  ```
  ark restore create <restore_job_name> --from-backup <backup_job_name> -l <app-label-selector>
  ```

  Example:

  ```
  ark restore create rbb-01 --from-backup bbb-01 -l app=test-ark-backup
  ```

- Get the restore job status by running following command

  ```
  ark restore describe <restore_job_name> --volume-details
  ```

  Example:

  ```
  ark restore describe rbb-01 --volume-details
  ```

- The above command if it shows succeeded, then you would be able to view the data in PV mounted in the busybox container.

**Note :**  If using k8s versions prior 1.10.7, the restore command fetches the data into host-pods of restic pod, but will not be visible under the busybox pod. Also application pod will be in init state.(Ref: https://github.com/heptio/ark/issues/669)

**Workaround:** Copy the contents from the downloaded dir in restic pod, to the scratch folder. And the move the contents along with **.ark** folder into the **/var/lib/kubelet/restore-pod-id/../mount**. This can be done by following below steps.  

- Get the restic pod name which is running on same node where application pod is running

- Login to restic pod by exec into it and copy the .ark folder to scratch folder.

  ```
  kubectl exec -it <restored_application-pod-name> sh
  ```

- First get the pod id of restored application pod using following way

  ```
  kubectl get pod <restored_application-pod-name> -o yaml 
  ```

- Fetch uuid from the output of above command and use it following command to copy the **.ark** folder

  ```
  cp -r host_pods/<restored_application-pod-id>/volumes/kubernetes.io~iscsi/<pvc-mount-point>/.ark scratch/.
  ```

- To copy all the contents, perform following command

  ```
  cp -r host_pods/<restored_application-pod-id>/volumes/kubernetes.io~iscsi/<pvc-mount-point>/* scratch/.
  ```

- Now ssh to the node where both restic pod and application pod is running and get the root permission.

  ```
  sudo su  -
  ```

- Get the restic pod id using following command 

  ```
  kubectl get pod <restic-pod-name> -n heptio-ark
  ```

- Fetch uuid of the restic-pod from the output of above command and use it in the following step to copy **.ark** folder to pvc 

  ```
  cp -r /var/lib/kubelet/pods/<restic pod id>/volumes/kubernetes.io~empty-dir/scratch/.ark /var/lib/kubelet/pods/<application id>/volumes/kubernetes.io~iscsi/<pvc-id>/.
  ```

- Perform following command to copy the contents to pvc.

  ```
  cp -r /var/lib/kubelet/pods/<restic pod id>/volumes/kubernetes.io~empty-dir/scratch/.ark /var/lib/kubelet/pods/<application id>/volumes/kubernetes.io~iscsi/<pvc-id>/.
  ```

- Now you can see application pod will be in running state.



<br>

## See Also:



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
