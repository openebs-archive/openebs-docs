---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---
------

Latest version of OpenEBS is 0.8.2. Check the release notes [here](https://github.com/openebs/openebs/releases/tag/0.8.2).  This section describes about the upgrade from OpenEBS 0.8.1 to 0.8.2.

## Supported upgrade paths

From 0.8.0 to 0.8.1 - Get the steps from [here](https://docs.openebs.io/v081/docs/next/upgrade.html).

From 0.7.x to 0.8.0 - Get the steps from [here](https://docs.openebs.io/v080/docs/next/upgrade.html).

From 0.6.0 to 0.7.x - Get the steps from [here](https://docs.openebs.io/v070/docs/next/upgrade.html).

From 0.5.3 or 0.5.4 to 0.6.0 - Get the steps from [here](https://docs.openebs.io/v060/docs/next/upgrade.html).

Currently, Upgrade to latest OpenEBS 0.8.2 version is supported only from 0.8.1. You have to follow the above mentioned upgrade path to the next level from the previous version as per the supported path.

## Overview of the upgrade process

<font size="5">Terminology</font>

- **OpenEBS Operator:** Refers to maya-apiserver and openebs-provisioner along with respective services, service account, roles, rolebindings.
- **OpenEBS Volume:** Storage Engine pods like cStor or Jiva controller(target)  and replica pods.

<font size="5">Workflow</font>

The upgrade of OpenEBS is a three step process:

1. Download upgrade scripts
2. Upgrade the OpenEBS Operator
3. Upgrade OpenEBS Volumes that were created with older OpenEBS Operator (0.8.1), one at a time.


## Upgrade steps 

All steps described in this document must be performed on the Kubernetes master or from a machine that has access to Kubernetes master.

1. <h3><a class="anchor" aria-hidden="true" id="Download-scripts"></a>Download upgrade scripts</h3>

   You can do git clone of the upgrade scripts.

   ```
   mkdir upgrade-openebs
   cd upgrade-openebs
   git clone https://github.com/openebs/openebs.git
   cd openebs/k8s/upgrades/0.8.1-0.8.2/
   ```

   

2. <h3><a class="anchor" aria-hidden="true" id="checking-openebs-labels"></a>Checking the  openebs labels</h3>

   - Run `./pre-check.sh` to get all the openebs volume resources not having `openebs.io/version` tag.

     - If there are no "unlabeled resources", then proceed with Step3. If there are some "unlabeled resources",perform following command.
   - Run `./labeltagger.sh 0.8.1` to add `openebs.io/version` label to all the OpenEBS volume resources.

   **Note:** Please make sure that all pods are back to running state before proceeding to Step 3.

   

3. <h3><a class="anchor" aria-hidden="true" id="upgrade-operator"></a>Upgrade OpenEBS operator</h3>

   <h4><a class="anchor" aria-hidden="true" id="upgrade-operator-crds-deployment"></a>Upgrading OpenEBS Operator CRDs and Deployments</h4>

   The upgrade steps may vary depending on the way OpenEBS was installed. You can upgrade your OpenEBS cluster if you have already deployed your cluster using one of the following approach.

   1. Using kubectl
   2. Using helm

   Select the same approach that you have used for the installation of 0.8.1 version.

   <font size="4">**Install/Upgrade using kubectl (using openebs-operator.yaml )**</font>

   The following sample steps will work if you have installed OpenEBS cluster without modifying the default values in the openebs-operator.yaml file.  The following command will upgrade all the openebs-operator components to 0.8.2 version.  

   ```
   kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.2.yaml
   ```

   **Note:** If you have customized it for your cluster, then you have to download the 0.8.2 openebs-operator.yaml using below command and customize it again. 

   ```
   wget https://openebs.github.io/charts/openebs-operator-0.8.2.yaml
   ```

   Customize the downloaded YAML file and apply the modified YAML using the following command.

   ```
   kubectl apply -f openebs-operator-0.8.2.yaml
   ```

   **Note:** Starting with OpenEBS 0.6, all the components are installed in namespace `openebs` as opposed to default namespace in earlier releases.

   <font size="4">**Install/Upgrade using stable helm chart**</font>

   The following procedure will work if you have installed OpenEBS with default values provided by stable helm chart.

   1. Run `helm repo update` to update local cache with latest package.

   2. Run `helm ls` to get the OpenEBS release-name. Use the release-name in the following upgrade command.

   3. Upgrade using the following command. In the following command,`openebs` is the release name. This name has to be changed as per the release name that is given during the initial deployment.

      ```
      helm upgrade openebs stable/openebs --version 0.8.6
      ```

   <font size="4">Using Customized Operator YAML or Helm Chart</font>

   As a first step, you must update your custom helm chart or YAML with 0.8.2 release tags and changes made in the values/templates. The changes in the latest release can be get from [here](https://github.com/helm/charts/blob/master/stable/openebs/values.yaml).
   After updating the YAML or helm chart or helm chart values, you can use the following command to upgrade the OpenEBS Operator. In the following example, use the exact release name which you have used during the initial OpenEBS installation. 

   ```
   helm upgrade openebs --version 0.8.6 -f values.yml stable/openebs
   ```

   

4. <h3><a class="anchor" aria-hidden="true" id="upgrade-volume"></a>Upgrade volumes one by one</h3>

   Even after the OpenEBS Operator has been upgraded to 0.8.2, the cStor Storage Pools and volumes (both Jiva and cStor) will continue to work with older versions. Use the following steps in the same order to upgrade cStor Pools and volumes.

   **Note:** Upgrade functionality is still under active development. It is highly recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, make sure you have taken a backup of the data before starting the below upgrade procedure.

   **Limitations:**

   1. This is a preliminary script only intended for using on volumes where data has been backed-up.
   2. Have the following link handy in case the volume gets into read-only during upgrade https://docs.openebs.io/docs/next/troubleshooting.html#recovery-readonly-when-kubelet-is-container
   3. Automatic rollback option is not provided. To rollback, you need to update the controller, exporter and replica pod images to the previous version.

   In the process of running the below steps, if you run into issues, you can always reach us on <a href="https://openebs.io/join-our-community" target="_blank">Slack OpenEBS Community</a>

   <h4><a class="anchor" aria-hidden="true" id="Jiva-PV"></a>Jiva PV</h4>

   **Upgrade the Jiva based OpenEBS PV**

   Extract the PV name using the following command

   ```
   kubectl get pv
   ```

   Output will be similar to the following.

    ```
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                          STORAGECLASS      REASON    AGE
   pvc-48fb36a2-947f-11e8-b1f3-42010a800004   5G         RWO            Delete           Bound     percona-test/demo-vol1-claim   openebs-percona             8m
    ```

   Using this PV name, upgrade the particular volume using the following command. 

   ```
   ./jiva_volume_upgrade.sh <Jiva_PV_name>
   ```

   **Example:**

   ```
   ./jiva_volume_upgrade.sh pvc-48fb36a2-947f-11e8-b1f3-42010a800004
   ```

   **Note:** The script will check whether the node, where corresponding Jiva pod is running, is already labelled or not. If node is not labelled, then nodes will be labelled as `openebs-jiva`. 

   <h4><a class="anchor" aria-hidden="true" id="cStor-PV"></a>cStor PV</h4>

   **Upgrade cStor Pools**

   Extract the corresponding SPC name using the following command.

   ```
   kubectl get spc
   ```

   Output will be similar to the following.

   ```
   NAME                AGE
   cstor-sparse-pool   24m
   ```

   Using the SPC name,upgrade the corresponding cStorStoragePool using the following command.

   ```
   ./cstor_pool_upgrade.sh <spc_name> <openebs-namepsace>
   ```

   **Example:**

    ```
   ./cstor_pool_upgrade.sh cstor-sparse-pool openebs
    ```

   Make sure that this step completes successfully before proceeding to next step.

   **Upgrade cStor Volumes**

   Extract the PV name using the following command.

   ```
   kubectl get pv
   ```

   Output will be similar to the following.

   ```
   NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                  STORAGECLASS           REASON    AGE
   pvc-1085415d-f84c-11e8-aadf-42010a8000bb   5G         RWO            Delete           Bound     default/demo-cstor-sparse-vol1-claim   openebs-cstor-sparse             22m
   ```

     Using this PV name, upgrade the particular volume using the following command.

   ```
   ./cstor_volume_upgrade.sh <cStor_PV_name> <openebs-namepsace>
   ```

   **Example:**

   ```
   ./cstor_volume_upgrade.sh pvc-1085415d-f84c-11e8-aadf-42010a8000bb openebs
   ```

   

## Verifying the Upgrade

Upgrade can be verified using the following command.

    kubectl get deployment -o yaml -n openebs | grep -i image | grep -i quay | grep -v metadata

Output will be similar to the following.

      image: quay.io/openebs/cstor-pool:v0.8.2
      image: quay.io/openebs/cstor-pool-mgmt:v0.8.2
      image: quay.io/openebs/cstor-pool:v0.8.2
      image: quay.io/openebs/cstor-pool-mgmt:v0.8.2
      image: quay.io/openebs/cstor-pool:v0.8.2
      image: quay.io/openebs/cstor-pool-mgmt:v0.8.2
      image: quay.io/openebs/m-apiserver:v0.8.2
      image: quay.io/openebs/openebs-k8s-provisioner:v0.8.2
      image: quay.io/openebs/snapshot-controller:v0.8.2
      image: quay.io/openebs/snapshot-provisioner:v0.8.2
    - image: quay.io/openebs/cstor-istgt:v0.8.2
      image: quay.io/openebs/m-exporter:v0.8.2
      image: quay.io/openebs/cstor-volume-mgmt:v0.8.2

All image tag should in v0.8.2 in the above output.



Check the NDM image using the following command.

```
kubectl get ds -o yaml  -n openebs| grep -i image |  grep -i quay | grep -v metadata
```

Output will be similar to the following.

```
  image: quay.io/openebs/node-disk-manager-amd64:v0.3.4
```

The image tag of NDM will be 0.3.4 in the above output.



This will verify all the OpenEBS components are successfully upgraded to the latest image.

<br>

## See Also:

### [Releases](/v082/docs/next/releases.html)

### [MayaOnline](/v082/docs/next/mayaonline.html)



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
