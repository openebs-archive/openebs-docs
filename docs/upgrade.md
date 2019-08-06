---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---
------

Latest stable version of OpenEBS is 1.0.0. Check the release notes [here](https://github.com/openebs/openebs/releases/tag/1.0.0).  This section describes about the upgrade from OpenEBS 0.9.0 to 1.0.0.

## Supported upgrade paths

From 0.8.2 to 0.9.0 - Get the steps from [here](https://docs.openebs.io/v090/docs/next/upgrade.html).

From 0.8.1 to 0.8.2 - Get the steps from [here](https://v08-docs.openebs.io/v082/docs/next/upgrade.html).

From 0.8.0 to 0.8.1 - Get the steps from [here](https://v081-docs.openebs.io/docs/next/upgrade.html).

From 0.7.x to 0.8.0 - Get the steps from [here](https://v08-docs.openebs.io/docs/next/upgrade.html).

From 0.6.0 to 0.7.x - Get the steps from [here](https://v07-docs.openebs.io/docs/next/upgrade.html).

From 0.5.3 or 0.5.4 to 0.6.0 - Get the steps from [here](https://v06-docs.openebs.io/docs/next/upgrade.html).

Currently, upgrade to latest OpenEBS 1.0.0 version is supported only from 0.9.0. You have to follow the above mentioned upgrade path to the next level from the previous version as per the supported path.

## Overview of the upgrade process

<font size="5">Terminology</font>

- **OpenEBS Operator:** Refers to maya-apiserver and openebs-provisioner along with respective services, service account, roles, rolebindings.
- **OpenEBS Volume:** Storage Engine pods like cStor or Jiva controller(target) and replica pods.

<font size="5">Workflow</font>

The upgrade of OpenEBS is a four step process:

1. Download the upgrade scripts.

2. Verify prerequisites.

3. Upgrade the OpenEBS Operator.

4. Upgrade OpenEBS Pools and Volumes that were created from previous OpenEBS version (0.9.0).

   


## Upgrade steps 

All steps described in this document must be performed on the Kubernetes master or from a machine that has access to Kubernetes master.

1.  <h3><a class="anchor" aria-hidden="true" id="Download-yamls"></a>Download upgrade scripts</h3>
    You can do git clone of the upgrade scripts.
    
    ```
    mkdir 0.9.0-1.0.0/
    cd 0.9.0-1.0.0/
    git clone https://github.com/openebs/openebs.git
    cd openebs/k8s/upgrades/0.9.0-1.0.0/
    ```
    
2. <h3><a class="anchor" aria-hidden="true" id="Verify-prerequisites"></a>Verify Prerequisites</h3>
  
   - OpenEBS current version should be 0.9.0. This can be verified by using the following command. Output will contain 0.9.0 as image for all the OpenEBS deployments.
   
     ```
     kubectl get deployment -o yaml -n openebs | grep -i image | grep -i quay | grep -v metadata
     ```
   
   - Verify current NDM image is 0.3.5 using the following command.
   
     ```
     kubectl get ds -o yaml  -n openebs| grep -i image |  grep -i quay | grep -v metadata
     ```
   
   - If OpenEBS has been deployed using stable helm charts, it has to be in chart version `0.9.2` . Run `helm list` to verify the chart version. If not, you have to update openebs chart version to `0.9.2` using below commands.
   
   - First, you have to delete the `admission-server` secret, which will be deployed again once you upgrade charts to `0.9.2` version using below command:
     
     ```
     kubectl delete secret admission-server-certs -n openebs
     ```
   
   - Upgrade OpenEBS chart version to 0.9.2 using below command:
     
     Run below command to update local cache with latest package.
     
     ```
     helm repo update
     ```
     
     Upgrade openebs helm chart version to 0.9.2 using the following command.
     
     ```
     helm upgrade <release-name> stable/openebs --version 0.9.2
     ```
     
   - Run `helm list` to verify deployed OpenEBS chart version:
     
     ```
     helm list
     ```
     
     Output will be similar to the following:
     
     ```
     NAME    REVISION        UPDATED                         STATUS          CHART           APP VERSION     NAMESPACE
     openebs 3               Mon Jun 24 20:57:05 2019        DEPLOYED        openebs-0.9.2   0.9.0           openebs
     ```
     
   - Before proceeding with below steps please make sure the NDM daemonset `DESIRED` count is equal to `CURRENT` count. This can be checked by using the following command.
   
     ```
     kubectl get ds openebs-ndm -n <openebs-installed-namespace>
     ```
   
     Output will be similar to the following.
   
     ```
     NAME          DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
     openebs-ndm   3         3         3       3            3           <none>          7m6s
     ```
     
     Sometimes, the `DESIRED` count may not be equal to the `CURRENT` count. This may happen due to following cases:
     
     - If any NodeSelector has been used to deploy openebs related pods.
     
     - Master or any Node has been tainted in k8s cluster.
     
   - Ensure that you are inside of upgrade script directory (openebs/k8s/upgrades/0.9.0-1.0.0/). This step will update OpenEBS control plane components labels. Run below command to update OpenEBS control plane components labels.
   
     ```
     ./pre-upgrade.sh <openebs_installed_namespace> <mode>
     ```
   
     Here, `<openebs_installed_namespace>` is the namespace where OpenEBS control plane components are installed. `<mode>` is the way how OpenEBS is installed. Provide mode as `helm` if OpenEBS is installed via helm chart (or) provide mode as `operator` if OpenEBS is installed via operator yaml.
   
     Eg: 
   
     - If OpenEBS 0.9.0 version was installed via operator YAML method then run below command.
   
       ```
       ./pre-upgrade.sh openebs operator
       ```
   
     - If OpenEBS 0.9.0 version was installed via helm then run below command.
   
       ```
       ./pre-upgrade.sh openebs helm
       ```
   
     Choose appropriate command from above and complete the pre-upgrade procedure. 
   
     After executing the above command, if the output shows that `Pre-Upgrade is successful `, then proceed with next step.
   
     **Notes:** 
   
     - No new SPC should be created after this step until the upgrade is completed. If it is created then execute `pre-upgrade.sh` again.
     - It is mandatory to make sure that all OpenEBS control plane components are running on version 0.9.0 before the upgrade.
   
3. <h3><a class="anchor" aria-hidden="true" id="upgrade-operator"></a>Upgrade OpenEBS operator</h3>

   

   <h4><a class="anchor" aria-hidden="true" id="upgrade-operator-crds-deployment"></a>Upgrading OpenEBS Operator CRDs and Deployments</h4>

   The upgrade steps may vary depending on the way OpenEBS was installed. You can upgrade your OpenEBS cluster if you have already deployed your cluster using one of the following approach.

   1. Using kubectl
   2. Using helm

   Select the same approach that you have used for the installation of previous version.

   <font size="4">**Install/Upgrade using kubectl (using openebs-operator.yaml )**</font>

   The following sample steps will work if you have installed OpenEBS cluster without modifying the default values in the openebs-operator.yaml file.  The following command will upgrade all the openebs-operator components to 1.0.0 version.  

   ```
   kubectl apply -f https://openebs.github.io/charts/openebs-operator-1.0.0.yaml
   ```

   **Note:** If you have customized it for your cluster, then you have to download the 1.0.0 openebs-operator.yaml using below command and customize it again. 

   ```
   wget https://openebs.github.io/charts/openebs-operator-1.0.0.yaml
   ```

   Customize the downloaded YAML file and apply the modified YAML using the following command.

   ```
   kubectl apply -f openebs-operator-1.0.0.yaml
   ```

   **Note:** All the OpenEBS components are installed in  `openebs`  namespace by default.

   <font size="4">**Install/Upgrade using stable helm chart**</font>

   The following procedure will work if you have installed OpenEBS with default values provided by stable helm chart.

   1. Run `helm repo update` to update local cache with latest package.

   2. Run `helm ls` to get the OpenEBS release-name. Use the release-name in the next step.

   3. Upgrade using the following command. In the following command, provide the release name used for 0.9.0 version of OpenEBS installation time.

      ```
      helm upgrade <release name> stable/openebs --version 1.0.0
      ```

   <font size="4">Using Customized Operator YAML or Helm Chart</font>

   As a first step, you must update your custom helm chart or YAML with 1.0.0 release tags and changes made in the values/templates. The changes in the latest release can be get from [here](https://github.com/helm/charts/blob/master/stable/openebs/values.yaml).
   After updating the YAML or helm chart or helm chart values, you can use the following command to upgrade the OpenEBS Operator. In the following example, use the exact release name which you have used during the initial OpenEBS installation. 

   ```
   helm upgrade <release name> --version 1.0.0 -f values.yml stable/openebs
   ```

4. <h3><a class="anchor" aria-hidden="true" id="upgrade-volume"></a>Upgrade volumes one by one</h3>

   Even after the OpenEBS Operator has been upgraded to 1.0.0, the cStor Storage Pools and volumes (both Jiva and cStor) will continue to work with older versions. Use the following steps in the same order to upgrade cStor Pools and volumes.
   
   **Note:** Upgrade functionality is still under active development. It is highly recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, make sure you have taken a backup of the data before starting the below upgrade procedure.
   
   **Limitations:**
   
   1. This is a preliminary script only intended for using on volumes where data has been backed-up.
   
   2. Have the following link handy in case the volume gets into read-only during upgrade <https://docs.openebs.io/docs/next/troubleshooting.html#recovery-readonly-when-kubelet-is-container>
   
   3. Automatic rollback option is not provided. To rollback, you need to update the controller, exporter and replica pod images to the previous version.
   
   4. In the process of running the below steps, if you run into issues, you can always reach us on <a href="https://openebs.org/community" target="_blank">Slack OpenEBS Community.
   
   <h4><a class="anchor" aria-hidden="true" id="Jiva-PV"></a>Jiva PV</h4>
 
   1. Go to `jiva` folder.

      ```
      cd jiva
      ```
   
   2. Obtain the PV name using the following command. 

      ```
      kubectl get pv
      ```
   
      Output will be similar to the following.

      ```
      NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS           REASON   AGE
      pvc-aeb93081-93d0-11e9-a7c6-42010a800fc0   5G         RWO            Delete           Bound    default/demo-vol1-claim   openebs-jiva-  default            118m
      ```
   
   3. Select the appropriate Jiva volume one at a time and upgrade the particular PV using the following command.

      ```
      ./jiva_volume_upgrade.sh <PV_name>
      ```
   
      Eg:

      ```
      ./jiva_volume_upgrade.sh pvc-aeb93081-93d0-11e9-a7c6-42010a800fc0
      ```
   
      If the output shows that the corresponding PV is Successfully upgraded to 1.0.0, then particular Jiva PV is upgraded successfully. The same steps can be applied for other PVs one by one to upgrade the PV to 1.0.0. version.

   4. Verify PV is bounded using the following command.

      ```
      kubectl get pv
      ```
   
   5. Verify application pod is running using the following command.

      ```
      kubectl get pod -n <namespace> 
      ```
   
   <h4><a class="anchor" aria-hidden="true" id="cStor-PV"></a>cStor PV</h4>
   
   Upgradation of cStor volume is a two step process. First step is to upgrade cStor pools one by one and then volumes one by one.
   
   **Upgrade cStor Pools**
   
   1. Obtain SPC name using the following command.
   
      ```
      kubectl get spc
      ```
   
      Output will be similar to the following.
   
      ```
      NAME          AGE
      cstor-pool1   3h	
      ```
   
   2. Go to the particular upgrade script directory of `cstor`  using the following command.
   
      ```
      cd cstor
      ```
   
   3. Verify corresponding pool pods are running using the following command. The particular pool pods should be running state before going to the next step.
   
      ```
      kubectl get pod -n openebs | grep <spc_name>
      ```
   
      Eg:
   
      ```
      kubectl get pod -n openebs | grep cstor-pool1
      ```
   
   4. Upgrade cStor pool using the following command.
   
      ```
      ./cstor_pool_upgrade.sh <spc_name> <openebs_installed_namespace>
      ```
   
      where `<openebs_installed_namespace>` is the namespace where OpenEBS control plane components are installed.
   
      Eg:
   
      ```
      ./cstor_pool_upgrade.sh cstor-pool1 openebs
      ```
   
      If the output shows that the corresponding cStor pool is successfully upgraded to 1.0.0, then upgrade job is completed for the corresponding pool. The same steps can be applied to other cStor pools one by one.
   
   5. Verify cStor pool upgrade using following command.
   
      ```
      ./verify_pool_upgrade.sh <spc_name> <openebs_installed_namespace>
      ```
   
   **Upgrade cStor Volumes**
   
   1. Obtain PV name using the following command.
   
      ```
      kubectl get pv
      ```
   
      Output will be similar to the following.
   
      ```
      NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                    STORAGECLASS              REASON      AGE
      pvc-9b43e8a6-93d2-11e9-a7c6-42010a800fc0   2Gi        RWO            Delete           Bound    default/minio-pv-claim   openebs-cstor-disk                   4h10m
      ```
   
   2. Select the appropriate cStor volume one at a time and upgrade the particular PV using the following command. 
   
      ```
      ./cstor_volume_upgrade.sh <PV_name> <namespace>
      ```
   
      where `<namespace>` is the namespace where OpenEBS  is installed.
   
      Eg:
   
      ```
      ./cstor_volume_upgrade.sh pvc-9b43e8a6-93d2-11e9-a7c6-42010a800fc0 openebs
      ```
   
      If the output shows that the corresponding PV is successfully upgraded to 1.0.0, then  upgrade job is completed for corresponding cStor volume. The same steps can be applied for other PVs one by one.
   
   3. Verify application status by checking corresponding pods.

<br>

## Verifying the Upgrade

Upgrade can be verified using the following command.

```
kubectl get deployment -o yaml -n openebs | grep -i image | grep -i quay | grep -v metadata
```
Output will be similar to the following.

              ```
              image: quay.io/openebs/cstor-pool:1.0.0
              image: quay.io/openebs/cstor-pool-mgmt:1.0.0
              image: quay.io/openebs/m-exporter:1.0.0
              image: quay.io/openebs/cstor-pool:1.0.0
              image: quay.io/openebs/cstor-pool-mgmt:1.0.0
              image: quay.io/openebs/m-exporter:1.0.0
              image: quay.io/openebs/cstor-pool:1.0.0
              image: quay.io/openebs/cstor-pool-mgmt:1.0.0
              image: quay.io/openebs/m-exporter:1.0.0
              image: quay.io/openebs/m-apiserver:1.0.0
              image: quay.io/openebs/admission-server:1.0.0
              image: quay.io/openebs/provisioner-localpv:1.0.0
              image: quay.io/openebs/node-disk-operator-amd64:0.4.0
              image: quay.io/openebs/openebs-k8s-provisioner:1.0.0
              image: quay.io/openebs/snapshot-controller:1.0.0
              image: quay.io/openebs/snapshot-provisioner:1.0.0
            - image: quay.io/openebs/cstor-istgt:1.0.0
              image: quay.io/openebs/m-exporter:1.0.0
              image: quay.io/openebs/cstor-volume-mgmt:1.0.0
              ```

All image tag should be in 1.0.0 except for ndm-disk-operator in the above output. For ndm-disk-operator, image tag should be 0.4.0.

Check the NDM image using the following command.

```
kubectl get ds -o yaml  -n openebs| grep -i image |  grep -i quay | grep -v metadata
```

Output will be similar to the following.

```
 image: quay.io/openebs/node-disk-manager-amd64:0.4.0
```

The image tag of NDM will be 0.4.0 in the above output.

This will verify all the OpenEBS components are successfully upgraded to the latest image.

<hr>

## See Also:

### [Releases](/v100/docs/next/releases.html)

### [MayaOnline](/v100/docs/next/mayaonline.html)



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
