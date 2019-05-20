---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---
------

Latest version of OpenEBS is 0.9.0. Check the release notes [here](https://github.com/openebs/openebs/releases/tag/0.9.0).  This section describes about the upgrade from OpenEBS 0.8.2 to 0.9.0.

## Supported upgrade paths

From 0.8.1 to 0.8.2 - Get the steps from [here](https://v082-docs.openebs.io/docs/next/upgrade.html).

From 0.8.0 to 0.8.1 - Get the steps from [here](https://v081-docs.openebs.io/docs/next/upgrade.html).

From 0.7.x to 0.8.0 - Get the steps from [here](https://v08-docs.openebs.io/docs/next/upgrade.html).

From 0.6.0 to 0.7.x - Get the steps from [here](https://v07-docs.openebs.io/docs/next/upgrade.html).

From 0.5.3 or 0.5.4 to 0.6.0 - Get the steps from [here](https://v06-docs.openebs.io/docs/next/upgrade.html).

Currently, upgrade to latest OpenEBS 0.9.0 version is supported only from 0.8.2. You have to follow the above mentioned upgrade path to the next level from the previous version as per the supported path.

## Overview of the upgrade process

<font size="5">Terminology</font>

- **OpenEBS Operator:** Refers to maya-apiserver and openebs-provisioner along with respective services, service account, roles, rolebindings.
- **OpenEBS Volume:** Storage Engine pods like cStor or Jiva controller(target)  and replica pods.

<font size="5">Workflow</font>

The upgrade of OpenEBS is a three step process:

1. Download upgrade scripts
2. Upgrade the OpenEBS Operator
3. Upgrade OpenEBS Volumes that were created with older OpenEBS Operator (0.8.2), one at a time.


## Upgrade steps 

All steps described in this document must be performed on the Kubernetes master or from a machine that has access to Kubernetes master.

1. <h3><a class="anchor" aria-hidden="true" id="Download-scripts"></a>Download upgrade scripts</h3>

   You can do git clone of the upgrade scripts.

   ```
   mkdir 0.8.2-0.9.0/
   cd 0.8.2-0.9.0/
   git clone https://github.com/openebs/openebs.git
   cd openebs/k8s/upgrades/0.8.2-0.9.0/
   ```

   

2. <h3><a class="anchor" aria-hidden="true" id="upgrade-operator"></a>Upgrade OpenEBS operator</h3>

   <h4><a class="anchor" aria-hidden="true" id="upgrade-operator-crds-deployment"></a>Upgrading OpenEBS Operator CRDs and Deployments</h4>

   The upgrade steps may vary depending on the way OpenEBS was installed. You can upgrade your OpenEBS cluster if you have already deployed your cluster using one of the following approach.

   1. Using kubectl
   2. Using helm

   Select the same approach that you have used for the installation of previous version.

   <font size="4">**Install/Upgrade using kubectl (using openebs-operator.yaml )**</font>

   The following sample steps will work if you have installed OpenEBS cluster without modifying the default values in the openebs-operator.yaml file.  The following command will upgrade all the openebs-operator components to 0.9.0 version.  

   ```
   kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.9.0.yaml
   ```

   **Note:** If you have customized it for your cluster, then you have to download the 0.9.0 openebs-operator.yaml using below command and customize it again. 

   ```
   wget https://openebs.github.io/charts/openebs-operator-0.9.0.yaml
   ```

   Customize the downloaded YAML file and apply the modified YAML using the following command.

   ```
   kubectl apply -f openebs-operator-0.9.0.yaml
   ```

   **Note:** All the OpenEBS components are installed in  `openebs`  namespace by default.

   <font size="4">**Install/Upgrade using stable helm chart**</font>

   The following procedure will work if you have installed OpenEBS with default values provided by stable helm chart.

   1. Run `helm repo update` to update local cache with latest package.

   2. Run `helm ls` to get the OpenEBS release-name. Use the release-name in the next step.

   3. Upgrade using the following command. In the following command,`openebs` is the release name. This name has to be changed as per the release name that is given during the initial deployment.

      ```
      helm upgrade <release name> stable/openebs
      ```

   <font size="4">Using Customized Operator YAML or Helm Chart</font>

   As a first step, you must update your custom helm chart or YAML with 0.9.0 release tags and changes made in the values/templates. The changes in the latest release can be get from [here](https://github.com/helm/charts/blob/master/stable/openebs/values.yaml).
   After updating the YAML or helm chart or helm chart values, you can use the following command to upgrade the OpenEBS Operator. In the following example, use the exact release name which you have used during the initial OpenEBS installation. 

   ```
   helm upgrade openebs -f values.yml stable/openebs
   ```

   

3. <h3><a class="anchor" aria-hidden="true" id="upgrade-volume"></a>Upgrade volumes one by one</h3>

   Even after the OpenEBS Operator has been upgraded to 0.9.0, the cStor Storage Pools and volumes (both Jiva and cStor) will continue to work with older versions. Use the following steps in the same order to upgrade cStor Pools and volumes.

   **Note:** Upgrade functionality is still under active development. It is highly recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, make sure you have taken a backup of the data before starting the below upgrade procedure.

   **Limitations:**

   1. This is a preliminary script only intended for using on volumes where data has been backed-up.
   2. Have the following link handy in case the volume gets into read-only during upgrade https://docs.openebs.io/docs/next/troubleshooting.html#recovery-readonly-when-kubelet-is-container
   3. Automatic rollback option is not provided. To rollback, you need to update the controller, exporter and replica pod images to the previous version.

   In the process of running the below steps, if you run into issues, you can always reach us on <a href="https://openebs.io/join-our-community" target="_blank">Slack OpenEBS Community</a>

   <h4><a class="anchor" aria-hidden="true" id="openEBS-upgrade-via-CAS-templates"></a>OpenEBS Upgrade Via CAS Templates</h4>

   The upgrade from 0.8.2 to 0.9.0 is handled by using CAS Templates and it is only supported for OpenEBS version 0.8.2.

   **Note**: Trying to upgrade a OpenEBS version other than 0.8.2 to 0.9.0 using these CAS templates can result in undesired behaviors. If you are having any OpenEBS version lower than 0.8.2, first upgrade it to 0.8.2 using the above suggested upgrade path and then these CAS templates can be used safely for 0.9.0 upgrade.

   <h4><a class="anchor" aria-hidden="true" id="Jiva-PV"></a>Jiva PV</h4>

   **Prerequisites**

   1. Go to the particular upgrade script directory.

   2. Run the following command to go inside of `jiva` folder.

      ```
   cd jiva
      ```
   
   3. Apply the `cr.yaml` using the following command. It installs a custom resource definition for UpgradeResult custom resource. This custom resource is used to capture the upgrade related information such as success or failure status.

      ```
   kubectl apply -f cr.yaml
      ```
   
   
**Upgrade the Jiva based OpenEBS PV**
   
1. Extract the PV name using the following command. This output details is needed in Step 3.
   
   ```
      kubectl get pv
   ```
   
      Output will be similar to the following.
   
   ```
      NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                    STORAGECLASS           REASON   AGE
   pvc-fec1cf09-7adf-11e9-ae1c-42010a8000b4   30G        RWO            Delete                Bound    default/minio-pv-claim   openebs-jiva-default            5m51s
      ```
   
   2. Apply `jiva_upgrade_runtask.yaml` using the following command.
   
   ```
      kubectl apply -f jiva_upgrade_runtask.yaml
   ```
   
   3. Edit `volume-upgrade-job.yaml` by adding the names of required Jiva volume names similar to the details showing in the following snippet.
   
   The following is the sample snippet where the Jiva volume details has to be entered in the similar manner.  Add the following snippet  in the `ConfigMap` section for each of the required Jiva volume under `data.upgrade.resources` field for each of the Jiva Volume.
   
   ```
        - name: <Jiva_PV_Name>
       kind: jiva-volume
          namespace: default
      ```
   
      For the Jiva PV mentioned in Step1, the following will be an example snippet.
   
   ```
      data:
     upgrade: |
          casTemplate: jiva-volume-update-0.8.2-0.9.0
          resources:
          - name: pvc-fec1cf09-7adf-11e9-ae1c-42010a8000b4
            kind: jiva-volume
            namespace: default
      ```
   
   4. Apply the modified YAML file using the following command.
   
   ```
      kubectl apply -f volume-upgrade-job.yaml
   ```
   
   5.  Check the status of the upgrading activity of Jiva volume using the following command.
   
   ```
   kubectl get upgraderesult -o yaml
   ```
   
   6. Also upgrade job activity can be checked using the following command. Here check the Job name that is provided in the `volume-upgrade-job.yaml` file as part of Step 3.
   
   ```
      kubectl get job
   ```
   
      If it is showing similar to the following output, then the upgrade Job is completed.
   
   ```
      NAME             COMPLETIONS   DURATION   AGE
   volume-upgrade   1/1           23s        2m24s
      ```
   
   7. Verify the Jiva Pods running status using the following command.
   
   ```
      kubectl get pods
   ```
   
   8. Verify application status by checking corresponding pods.
   
9. The completed jobs can be deleted using the following command.
   
   ```
      kubectl delete job <job_name>
   ```
   
   <h4><a class="anchor" aria-hidden="true" id="cStor-PV"></a>cStor PV</h4>
   
**Prerequisites**
   
1. Goto the particular upgrade script directory.
   
2. Run the following command to go inside of `cstor` folder.
   
   ```
      cd cstor
   ```
   
3.  Apply the `cr.yaml` using the following command. It installs a custom resource definition for UpgradeResult custom resource. This custom resource is used to capture upgrade related information for success or failure case.
   
      ```
      kubectl apply -f cr.yaml
   ```
   
4. Apply `rbac.yaml` for having permission related reasons.
   
   **Upgrade cStor Pools**
   
1. Extract the corresponding cStorStoragePool name using the following command. This output details is needed in Step 3.
   
   ```
      kubectl get csp
   ```
   
   Output will be similar to the following.
   
   ```
      NAME                     ALLOCATED   FREE    CAPACITY   STATUS    TYPE      AGE
      cstor-pool2-n8fm         911K        39.7G   39.8G      Healthy   striped   2h
      cstor-sparse-pool-bue5   1.11M       9.94G   9.94G      Healthy   striped   2h
   ```
   
2. Apply `cstor-pool-update-082-090.yaml` using the following command.
   
      ```
      kubectl apply -f cstor-pool-update-082-090.yaml
      ```
   
3. Edit `pool-upgrade-job.yaml` file and update the required pool names in the `ConfigMap` section. Save the configuration after the required modifications.
   
   The following is the sample snippet where the pool name has to be entered.  Add the following snippet  in the `ConfigMap` section for each of the required pool under `data.upgrade.resources` field.
   
      ```
          - name: cstor-pool2-n8fm
         kind: cStorPool
            namespace: openebs
   ```
   
   In this example scenarios, there is one more pool is running in the cluster. So it should create similar kind of entry for other pool also by changing the appropriate name of the pool. 
   
      The following is an example output of resource section after adding both pools details.
   
      ```
      resources:
   # Put the name of cstor pool resource that you want to upgrade.
      # Command to view the cstorpool resource :
   # `kubectl get csp`
      - name: cstor-pool2-n8fm
     kind: cStorPool
        namespace: openebs
      # Similiary, you can fill details below for other cstorpool upgrades.
      # If not required, delete it.
      - name: cstor-sparse-pool-bue5
        kind: cStorPool
        namespace: openebs
      ```
      
   4. Apply the modified YAML file using the following command.
   
      ```
      kubectl apply -f pool-upgrade-job.yaml
      ```
   
   5.  Check the status of the upgrade activity of cStorStoragePools using the following command.
   
   ```
      kubectl get upgraderesult -o yaml
      ```
   
6.  Also upgrade job activity can be checked using the following command. Here check the Job name that is provided in the `pool-upgrade-job.yaml` file as part of Step 3.
   
   ```
      kubectl get job
      ```
   
   If it is showing similar to the following output, then the upgrade Job is completed.
   
   ```
      NAME                            COMPLETIONS   DURATION   AGE
      spc-cstor-sparse-pool-upgrade   1/1           2m8s       6m29s
      ```

   7. The completed jobs can be deleted using the following command.

      ```
      kubectl delete job <job_name>
      ```
   
8. Make sure that this step completes successfully before proceeding to next step.
   

   **Upgrade cStor Volumes**
   
   1. Apply `cstor-volume-update-082-090.yaml` using the following command.

      ```
   kubectl apply -f cstor-volume-update-082-090.yaml
      ```

   2. Get the cStorVolume details using the following command.

      ```
   kubectl get cstorvolume -n openebs
      ```
   
      Example Output:

      ```
   NAME                                       STATUS   AGE
      pvc-d7bed874-7abb-11e9-ae1c-42010a8000b4   Init     3h
      ```
   
   **Note:** The above details can also be collected using `kubeclt get pv`.
   
3. Edit `volume-upgrade-job.yaml` file and update the required volume names in the `ConfigMap` section. Save the configuration after the required modifications.
   
      The following is the sample snippet where the volume name has to be entered.  Add the following snippet  in the `ConfigMap` section for each of the required volumes under `data.upgrade.resources` field.
   
      ```
    - name: <cStor_PV_name>
         kind: cstor-volume
      namespace: openebs
      ```

      For the cStor PV showing in Step2, following will be the details has to be added in the mentioned field.

      ```
       - name: pvc-d7bed874-7abb-11e9-ae1c-42010a8000b4
         kind: cstor-volume
         namespace: openebs
      ```

   4. Apply the modified file which is saved in Step 3 using the following command.

      ```
      kubectl apply -f volume-upgrade-job.yaml
      ```
   
   5. Check the status of the upgrading activity of cStor volumes using the following command.

      ```
   kubectl get upgraderesult -o yaml
      ```
   
      Also upgrade job activity can be checked using the following command. Here check the job name that is provided in the `volume-upgrade-job.yaml` file as part of Step 3.

      ```
   kubectl get job
      ```
   
      If it is showing similar to the following output, then the upgrade Job for cStor Volume is completed.

      ```
   NAME             COMPLETIONS   DURATION   AGE
      volume-upgrade   1/1           64s        4m47s	
      ```
   
7. Verify application status by checking corresponding pods.
   
8. The completed jobs can be deleted using the following command.
   
      ```
      kubectl delete job <job_name>
      ```

   <br>

## Verifying the Upgrade

Upgrade can be verified using the following command.

    kubectl get deployment -o yaml -n openebs | grep -i image | grep -i quay | grep -v metadata

Output will be similar to the following.

      image: quay.io/openebs/cstor-pool:0.9.0
      image: quay.io/openebs/cstor-pool-mgmt:0.9.0
      image: quay.io/openebs/cstor-pool:0.9.0
      image: quay.io/openebs/cstor-pool-mgmt:0.9.0
      image: quay.io/openebs/cstor-pool:0.9.0
      image: quay.io/openebs/cstor-pool-mgmt:0.9.0
      image: quay.io/openebs/m-apiserver:0.9.0
      image: quay.io/openebs/openebs-k8s-provisioner:0.9.0
      image: quay.io/openebs/snapshot-controller:0.9.0
      image: quay.io/openebs/snapshot-provisioner:0.9.0
    - image: quay.io/openebs/cstor-istgt:0.9.0
      image: quay.io/openebs/m-exporter:0.9.0
      image: quay.io/openebs/cstor-volume-mgmt:0.9.0

All image tag should in 0.9.0 in the above output.



Check the NDM image using the following command.

```
kubectl get ds -o yaml  -n openebs| grep -i image |  grep -i quay | grep -v metadata
```

Output will be similar to the following.

```
  image: quay.io/openebs/node-disk-manager-amd64:v0.3.5
```

The image tag of NDM will be 0.3.4 in the above output.



This will verify all the OpenEBS components are successfully upgraded to the latest image.

<br>

## See Also:

### [Releases](/docs/next/releases.html)

### [MayaOnline](/docs/next/mayaonline.html)



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
