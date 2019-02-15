---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---
------

Latest version of OpenEBS is 0.8.0. Check the release notes [here]().  This section describes about the upgrade from OpenEBS 0.7.x to 0.8.0.

## Supported upgrade paths

From 0.6.0 to 0.7.x - Get it from [here](https://v07-docs.openebs.io/docs/next/upgrade.html).

From 0.5.3 or 0.5.4 to 0.6.0 - Get it from [here](https://v06-docs.openebs.io/docs/next/upgrade.html).

Currently upgrade to latest OpenEBS 0.8.0 version is supported from 0.7.x only. You have to follow the above mentioned upgrade path to the next level from the previous version as per the supported path.

## Overview of the upgrade process

<font size="5">Terminology</font>

- **OpenEBS Operator:** Refers to maya-apiserver and openebs-provisioner along with respective services, service account, roles, rolebindings.
- **OpenEBS Volume:** Storage Engine pods like cStor or Jiva controller(target)  and replica pods.

<font size="5">Workflow</font>

The upgrade of OpenEBS is a three step process:

1. [Download upgrade scripts](/docs/next/upgrade.html#download-upgrade-scripts)

2. [Upgrade  OpenEBS Operator](/docs/next/upgrade.html#upgrade-openebs-operator)

3. [Upgrade OpenEBS Volumes](/docs/next/upgrade.html#upgrade-volumes-one-by-one) that were created with older OpenEBS Operator (0.8.0), one at a time.

   

## Upgrade steps 

All steps described in this document must be performed on the Kubernetes master or from a machine that has access to Kubernetes master.

1. ### Download upgrade scripts

  You can do `git clone` of the upgrade scripts.

  ```
  git clone https://github.com/openebs/openebs.git
  cd openebs/k8s/upgrades/0.7.0-0.8.0/
  ```

  **Note:**The upgrade  procedure uses the node labels to pin the Jiva replicas to the nodes where they are present. On node restart, these labels will disappear and can cause the replica to be un-scheduled.

2. ### Upgrade OpenEBS operator

   **Upgrading OpenEBS Operator CRDs and Deployments**

   The upgrade steps may vary depending on the way OpenEBS was installed. You can upgrade your OpenEBS cluster if you have already deployed your cluster using one of the following approach.

   1. Using kubectl
   2. Using helm

   Select one of the following:

   **Install/Upgrade using kubectl (using openebs-operator.yaml )**

   The following sample steps will work if you have installed OpenEBS cluster without modifying the default values in the *openebs-operator.yaml* file.  The following command will upgrade all the openebs-operator components to 0.8.0 version.  

   ```
   kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
   ```

   This will upgrade all OpenEBS components to latest image.

   **Note:** *If you have customized it for your cluster, you have to download the 0.8.0 openebs-operator.yaml using below command and customize it again.* 

   ```
   wget https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
   ```

   Customize the downloaded YAML file and apply the modified YAML using the following command.

   ```
   kubectl apply -f openebs-operator-0.8.0.yaml
   ```

   **Note:** Starting with OpenEBS 0.6, all the components are installed in namespace `openebs` as opposed to `default` namespace in earlier releases.

   **Install/Upgrade using stable helm chart**

   The following procedure will work if you have installed OpenEBS with default values provided by stable helm chart.

   - Run `helm repo update` to update local cache with latest package.
   - Run `helm ls` to get the OpenEBS `release-name`. Use the `release-nam` in the following upgrade command.
   - Upgrade using `helm upgrade -f https://openebs.github.io/charts/openebs-operator-0.8.0.yaml <release-name> stable/openebs`.

   **Using Customized Operator YAML or Helm Chart.**

   As a first step, you must update your custom helm chart or YAML with 0.8.0 release tags and changes made in the values/templates.

   After updating the YAML or helm chart or helm chart values, you can use the above [procedures](https://staging-docs.openebs.io/docs/next/upgrade.html#install-upgrade-using-table-openebs-helm-chart) to upgrade the OpenEBS Operator.

   - You can use the following as references to know about the changes in 0.8.0:
     - openebs-charts [PR#2314](https://github.com/openebs/openebs/pull/2314)  as reference.

3. ### Upgrade volumes one by one

    Even after the OpenEBS Operator has been upgraded to 0.8.0, the cStor Storage Pools and volumes (both Jiva and cStor) will continue to work with older versions. Use the following steps in the same order to upgrade cStor Pools and volumes.

    **Note:** Upgrade functionality is still under active development. It is highly recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, make sure you have taken a backup of the data before starting the below upgrade procedure.

    **Limitations:**

    1. This is a preliminary script only intended for using on volumes where data has been backed-up.

    2. Have the following link handy in case the volume gets into read-only during upgrade <https://docs.openebs.io/docs/next/readonlyvolumes.html>

    3. Automatic rollback option is not provided. To rollback, you need to update the controller, exporter and replica pod images to the previous version

    In the process of running the below steps, if you run into issues, you can always reach us on [slack](https://openebs-community.slack.com/messages/C3NPGQ6G3/)

    #### Jiva PV

    **Upgrade the Jiva based OpenEBS PV**

    Get the Jiva PV that you want to upgrade and use the PV name in the following command to upgrade the particular PV to the latest version. You should perform upgrade one volume at a time.

    ```
    ./jiva_volume_update.sh <jiva_pv_name> <node_label>
    ```

    **Example:**

    Extract the PV name using `kubectl get pv`

    Output will be similar to the following.

    ```
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                           STORAGECLASS           REASON    AGE
    pvc-edd68f7e-fd0c-11e8-b0fd-42010a800225   5G         RWO            Delete           Bound     default/demo-vol1-claim         openebs-jiva-default             47m
    ```

    Using this Jiva PVC name, upgrade the particular volume using the following command. ​	

    ```
    ./jiva_volume_upgrade.sh pvc-edd68f7e-fd0c-11e8-b0fd-42010a800225
    ```

    Here `pvc-edd68f7e-fd0c-11e8-b0fd-42010a800225` is the PV name and `node-label`is the node where corresponding replica pods has been labeled. If node is not labelled, then nodes will be labelled as `openebs-jiva`

    #### cStor PV

    **Upgrade cStor Pools**

    Extract the SPC name using `kubectl get spc`

    Output will be similar to the following.

    ```
    NAME                AGE
    cstor-sparse-pool   24m
    ```

    Upgrade the cStor Pools using the following command one at a time. In the following command, *cStor_SPC_name* is the cStor storage pool claim and *openebs_namespace* is the namespace where OpenEBS pods are installed. You should perform upgrade one SPC at a time.

    ```
    ./cstor_pool_update.sh <cStor_SPC_name> <openebs_namespace>
    ```

    **Example:**

    Using the SPC name,upgrade the corresponding cStorStoragePool using the following command.

    ```
    ./cstor_pool_upgrade.sh cstor-sparse-pool openebs
    ```

    Make sure that this step completes successfully before proceeding to next step.

    

    **Upgrade cStor Volumes**

    Get the cStor PV that you want to upgrade and use the PV name in the following command to upgrade the particular PV to the latest version. From the Step2 output, you will get the cStor PV details. You should perform upgrade one volume at a time.

    ```
    ./cstor_target_update.sh <cStor_PV_name> <openebs_namespace>
    ```

    Extract the PV name using `kubectl get pv`

    Output will be similar to the following.

    ```
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                  STORAGECLASS           REASON    AGE
    pvc-1085415d-f84c-11e8-aadf-42010a8000bb   5G         RWO            Delete           Bound     default/demo-cstor-sparse-vol1-claim   openebs-cstor-sparse             22m
    ```

    Using this PVC name, upgrade the particular volume using the following command.

    ```
    ./cstor_volume_upgrade.sh pvc-1085415d-f84c-11e8-aadf-42010a8000bb openebs
    ```

## Verifying the upgrade

Upgrade can be verified using the following command.

```
kubectl get deployment -o yaml -n openebs | grep -i image | grep -i quay | grep -v metadata
```

Output will be similar to the following.

```
  image: quay.io/openebs/cstor-pool:v0.8.0
  image: quay.io/openebs/cstor-pool-mgmt:v0.8.0
  image: quay.io/openebs/cstor-pool:v0.8.0
  image: quay.io/openebs/cstor-pool-mgmt:v0.8.0
  image: quay.io/openebs/cstor-pool:v0.8.0
  image: quay.io/openebs/cstor-pool-mgmt:v0.8.0
  image: quay.io/openebs/m-apiserver:v0.8.0
  image: quay.io/openebs/openebs-k8s-provisioner:v0.8.0
  image: quay.io/openebs/snapshot-controller:v0.8.0
  image: quay.io/openebs/snapshot-provisioner:v0.8.0
- image: quay.io/openebs/cstor-istgt:v0.8.0
  image: quay.io/openebs/m-exporter:v0.8.0
  image: quay.io/openebs/cstor-volume-mgmt:v0.8.0
```

This will show the images of all the OpenEBS components after the upgrade. All image tag should in v0.8.0

## Troubleshooting 

<TBD>

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
