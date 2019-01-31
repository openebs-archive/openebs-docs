---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---

------

# Upgrade from OpenEBS 0.7.x to 0.8.0

## Overview

This document describes the steps for upgrading OpenEBS from 0.7.x to 0.8.0

The upgrade of OpenEBS is a two step process:

- *Step 1* - Upgrade the OpenEBS Operator
- *Step 2* - Upgrade the OpenEBS Volumes that were created with older OpenEBS Operator (0.7.x), one at a time.

**Note:**
For older versions, OpenEBS supports upgrade to 0.7.0 version only from 0.5.3, 0.5.4and 0.6.0. For steps to upgrade to 0.7.x from 0.6, [click](https://v07-docs.openebs.io/docs/next/upgrade.html) here.

### Terminology

- **OpenEBS Operator:** Refers to maya-apiserver and openebs-provisioner along with respective services, service account, roles, rolebindings.
- **OpenEBS Volume:** Storage Engine pods like cStor or Jiva controller(aka target) & replica pods

### Prerequisites

- All steps described in this document must be performed on the Kubernetes master or from a machine that has access to Kubernetes master.

#### Download the upgrade scripts

You can either `git clone` or download the upgrade scripts.

```
mkdir upgrade-openebs
cd upgrade-openebs
git clone https://github.com/openebs/openebs.git
cd openebs/k8s/upgrades/0.7.0-0.8.0/
```

Else you can download the following files to your work directory from https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.7.0-0.8.0 .

- `patch-strategy-recreate.json`
- `jiva-replica-patch.tpl.json`
- `jiva-target-patch.tpl.json`
- `jiva-target-svc-patch.tpl.json`
- `jiva_volume_update.sh`
- `cstor-pool-patch.tpl.json`
- `cstor-target-patch.tpl.json`
- `cstor-target-svc-patch.json`
- `cstor_pool_update.sh`
- `cstor_target_update.sh`
- `pre_upgrade.sh` 

**Note:**The upgrade  procedure uses the node labels to pin the Jiva replicas to the nodes where they are present. On node restart, these labels will disappear and can cause the replica to be un-scheduled.

## Step 1: Upgrade the OpenEBS Operator

### Upgrading OpenEBS Operator CRDs and Deployments

The upgrade steps vary depending on the way OpenEBS was installed. You can upgrade your OpenEBS cluster if you have already deployed your cluster using one of the following approach.

1. Using kubectl
2. Using helm

Select one of the following:

#### Install/Upgrade using kubectl (using openebs-operator.yaml )

The following sample steps will work if you have installed OpenEBS cluster without modifying the default values in the *openebs-operator.yaml* file.  The following command will upgrade all the openebs-operator components to 0.8.0 version.  

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
```

This will upgrade all OpenEBS components to latest image.

**Note:** *If you have customized it for your cluster, you will have to download the 0.8.0 openebs-operator.yaml using below command and customize it again.* 

```
wget https://openebs.github.io/charts/openebs-operator-0.8.0.yaml
```

Customize the downloaded YAML file and apply the modified YAML using the following command

```
kubectl apply -f openebs-operator-0.8.0.yaml
```

**Note:** Starting with OpenEBS 0.6, all the components are installed in namespace `openebs` as opposed to `default` namespace in earlier releases.

#### Install/Upgrade using table/openebs helm chart

The following procedure will work if you have installed OpenEBS with default values provided by stable/openebs helm chart.

- Run `helm ls` to get the OpenEBS release name.
- Upgrade using `helm upgrade -f https://openebs.github.io/charts/openebs-operator-0.8.0.yaml <release-name> stable/openebs`

#### Using Customized Operator YAML or Helm Chart.

If you are using customized Operator YAML or Helm Chart which has used for OpenEBS installation using helm method, then you must update your custom helm chart or YAML with 0.8 release tags and changes made in the values/templates.

After updating the YAML or helm chart or helm chart values, you can use the above [procedures](https://staging-docs.openebs.io/docs/next/upgrade.html#install-upgrade-using-table-openebs-helm-chart) to upgrade the OpenEBS Operator.

- You can use the following as references to know about the changes in 0.8:
  - openebs-charts [PR#2314](https://github.com/openebs/openebs/pull/2314) as reference.

## Step 2: Upgrade the OpenEBS Volumes

Even after the OpenEBS Operator has been upgraded to 0.8, the cStor Storage Pools and volumes (both jiva and cStor) will continue to work with older versions. Use the following steps to upgrade the cStor Pools and Volumes.

**Note:** *Upgrade functionality is still under active development. It is highly recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, make sure you have taken a backup of the data before starting the below upgrade procedure.*

**Limitations:**

- this is a preliminary script only intended for using on volumes where data has been backed-up.
- please have the following link handy in case the volume gets into read-only during upgrade<https://docs.openebs.io/docs/next/readonlyvolumes.html>
- automatic rollback option is not provided. To rollback, you need to update the controller, exporter and replica pod images to the previous version
- in the process of running the below steps, if you run into issues, you can always reach us on slack

Now, you can get the list of OpenEBS volumes which are going to upgrade using following command

```
kubectl get pv
```

Output of above command will be similar to the following. This will list all the volumes created with both Jiva and cStor storage engine.

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                           STORAGECLASS           REASON    AGE
pvc-dd52535e-fd0d-11e8-b0fd-42010a800225   5G         RWO            Delete           Bound     default/demo-vol1-claim-cstor   openebs-cstor-sparse             40m
pvc-edd68f7e-fd0c-11e8-b0fd-42010a800225   5G         RWO            Delete           Bound     default/demo-vol1-claim         openebs-jiva-default             47m
```

### Upgrade the Jiva Volume

Get the Jiva PV that you want to upgrade and use the PV name in the following command to upgrade the particular PV to the latest version. You should perform upgrade one volume at a time.

```
./jiva_volume_update.sh <jiva_pv_name> <node_label>
```

**Example:**

```
./jiva_volume_update.sh pvc-edd68f7e-fd0c-11e8-b0fd-42010a800225
```

Here `pvc-edd68f7e-fd0c-11e8-b0fd-42010a800225` is the pv name and  `node-label`is the node where corresponding replica pods has been labeled. If node is not labelled, then nodes will be labelled as `openebs-jiva`

After executing this above script, it will show that OpenEBS Jiva volume has been successfully upgraded to 0.8 version. You can run your application for using the upgraded volume.

### Upgrade the cStor Pools

Extract the SPC name using the following command.

```
kubectl get spc
```

Output of above command will be similar to the following.

```
NAME                CREATED AT
cstor-sparse-pool   1h
```

Upgrade the cStor Pools using the following command one at a time. In the following command, *cStor_SPC_name* is the cStor storage pool claim and *openebs_namespace* is the namespace where OpenEBS pods are installed. You should perform upgrade one SPC at a time.

```
./cstor_pool_update.sh <cStor_SPC_name> <openebs_namespace>
```

**Example:**

```
./cstor_pool_update.sh cstor-sparse-pool openebs
```

After executing this above script, it will show that OpenEBS cStor Pool has been successfully upgraded to 0.8 version. 

### Upgrade the cStor Volumes

Get the cStor PV that you want to upgrade and use the PV name in the following command to upgrade the particular PV to the latest version.  From the Step2 output, you will get the cStor PV details. You should perform upgrade one volume at a time.

```
./cstor_target_update.sh <cStor_PV_name> <openebs_namespace>
```

After executing this above script, it will show that OpenEBS cStor volume has been successfully upgraded to 0.8 version. . You can run your application for using the upgraded volume.

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
