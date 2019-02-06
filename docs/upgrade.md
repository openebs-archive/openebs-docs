---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrading OpenEBS
---
------

Latest version of OpenEBS is 0.8.1. Check the release notes here. 





## Supported upgrade paths

0.8 to 0.8.1

0.7 to 0.8.1

## Unsupported upgrade paths

Grade to 0.8.1 from any version below 0.7 is not supported

## Overview of the upgrade process

<font size="5">Terminology</font>

- **OpenEBS Operator:** Refers to maya-apiserver and openebs-provisioner along with respective services, service account, roles, rolebindings.
- **OpenEBS Volume:** Storage Engine pods like cStor or Jiva controller(target)  and replica pods.



The upgrade of OpenEBS is a three step process:

1. [Download upgrade scripts](/docs/next/upgrade.html#download-upgrade-scripts)

2. [Upgrade  OpenEBS Operator](/docs/next/upgrade.html#upgrade-openebs-operator)

3. [Upgrade OpenEBS Volumes](/docs/next/upgrade.html#upgrade-volumes-one-by-one) that were created with older OpenEBS Operator (0.8.0), one at a time.

   

## Upgrade steps 

**Note**

All steps described in this document must be performed on the Kubernetes master or from a machine that has access to Kubernetes master.

1. ### Download upgrade scripts

    `git clone`  

   ```
   
   git clone https://github.com/openebs/openebs.git
   cd openebs/k8s/upgrade/0.8.0-0.8.1/
   ```

   

   **Note:**The upgrade  procedure uses the node labels to pin the Jiva replicas to the nodes where they are present. On node restart, these labels will disappear and can cause the replica to be un-scheduled.

2. ### Upgrade OpenEBS operator

   Upgrading OpenEBS Operator CRDs and Deployments**

   The upgrade steps vary depending on the way OpenEBS was installed. You can upgrade your OpenEBS cluster if you have already deployed your cluster using one of the following approach.

   1. Using kubectl
   2. Using helm

   Select one of the following:

   **Install/Upgrade using kubectl (using openebs-operator.yaml )**

   The following sample steps will work if you have installed OpenEBS cluster without modifying the default values in the *openebs-operator.yaml* file.  The following command will upgrade all the openebs-operator components to 0.8.1 version.  

   ```
   kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.1.yaml
   ```

   This will upgrade all OpenEBS components to latest image.

   **Note:** *If you have customized it for your cluster, you will have to download the 0.8.1 openebs-operator.yaml using below command and customize it again.* 

   ```
   wget https://openebs.github.io/charts/openebs-operator-0.8.1.yaml
   ```

   Customize the downloaded YAML file and apply the modified YAML using the following command

   ```
   kubectl apply -f openebs-operator-0.8.1.yaml
   ```

   **Note:** Starting with OpenEBS 0.6, all the components are installed in namespace `openebs` as opposed to `default` namespace in earlier releases.

   **Install/Upgrade using stable helm chart**

   The following procedure will work if you have installed OpenEBS with default values provided by stable helm chart.

   - Run `helm repo update` to update local cache with latest package
   - Run `helm ls` to get the OpenEBS `release-name`. Use the `release-nam` in the following upgrade command
   - Upgrade using `helm upgrade -f https://openebs.github.io/charts/openebs-operator-0.8.1.yaml <release-name> stable/openebs`

   **Using Customized Operator YAML or Helm Chart.**

   As a first step, you must update your custom helm chart or YAML with 0.8.1 release tags and changes made in the values/templates.

   After updating the YAML or helm chart or helm chart values, you can use the above [procedures](https://staging-docs.openebs.io/docs/next/upgrade.html#install-upgrade-using-table-openebs-helm-chart) to upgrade the OpenEBS Operator.

   - You can use the following as references to know about the changes in 0.8.1:
     - openebs-charts [PR#](https://github.com/openebs/openebs/pull/) as reference.

   

3. ### Upgrade volumes one by one



Even after the OpenEBS Operator has been upgraded to 0.8.1, the cStor Storage Pools and volumes (both Jiva and cStor) will continue to work with older versions. Use the following steps in the same order to upgrade cStor Pools and volumes.

**Note:** Upgrade functionality is still under active development. It is highly recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, make sure you have taken a backup of the data before starting the below upgrade procedure.

**Limitations:**

- This is a preliminary script only intended for using on volumes where data has been backed-up.
- Have the following link handy in case the volume gets into read-only during upgrade <https://docs.openebs.io/docs/next/readonlyvolumes.html>
- Automatic rollback option is not provided. To rollback, you need to update the controller, exporter and replica pod images to the previous version
- In the process of running the below steps, if you run into issues, you can always reach us on slack

**Upgrade the Jiva based OpenEBS PV**

Extract the PV name using `kubectl get pv`



**Upgrade cStor Pools**

Extract the SPC name using `kubectl get spc`



**Upgrade cStor Volumes**

Extract the PV name using `kubectl get pv`





## Verifying the upgrade

<TBD>

## Troubleshooting 

<TBD>

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
