---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---

------

# Upgrade from OpenEBS 0.6.0 to 0.7.0

## Overview

This document describes the steps for upgrading OpenEBS from 0.6.0 to 0.7.0. Upgrading OpenEBS is a two step process.
- *Step 1* - Upgrade the OpenEBS Operator
- *Step 2* - Upgrade the OpenEBS Volumes that were created with older OpenEBS Operator (0.6.0)

**Note:**
For older versions, OpenEBS supports upgrade to 0.6 version only from 0.5.3 and 0.5.4. For steps to upgrade to 0.6.0, [click](https://v06-docs.openebs.io/docs/next/upgrade.html) here.

### Terminology

- *OpenEBS Operator : Refers to maya-apiserver and openebs-provisioner along with respective services, service account, roles, rolebindings*
- *OpenEBS Volume: The Jiva controller and replica pods*
- *All steps described in this document must be performed on the Kubernetes master or from a machine that has access to Kubernetes master*

## Step 1: Upgrade the OpenEBS Operator

OpenEBS 0.7.0 has made the following significant changes to the OpenEBS Operator (aka OpenEBS control plane components):
- A new provisioning and policy enforcement engine. This introduces formatting changes as it expects the volume policies to be present as annotations in storage class as opposed to `parameters` or `environment variables`.
- OpenEBS will install default jiva storage pool (named `default`) and storage class (named `openebs-jiva-default`). If these names conflict with your existing storage pool or storage classes, rename and re-apply your storage classes.
- Integrated with OpenEBS NDM project. A new Daemonset will be launched to discover the block devices attached to the nodes.

### Download the Upgrade Scripts

Either `git clone` or download the following files to your work directory.
https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.6.0-0.7.0
- `patch-strategy-recreate.json`
- `replica.patch.tpl.yml`
- `controller.patch.tpl.yml`
- `oebs_update.sh`
- `pre_upgrade.sh`

### Prerequisites

Before upgrading the OpenEBS Operator, check if you are using a storage pool named `default` which will conflict with default jiva pool installed with OpenEBS 0.7.0:

```
./pre_upgrade.sh <openebs-namespace>
```

### Upgrade volume Policies in Existing Storage Classes

Use the following command to upgrade the storage class volume policies. Move from parameters to annotations. This script will only update the following volume policies:

- `openebs.io/replica-count`
- `openebs.io/storage-pool`
- `openebs.io/volume-monitor`

The remaining policies will fall back to their default values.

```
./upgrade_sc.sh
```

Alternatively, you can skip this step and re-apply your storage classes as per the 0.7.0 volume policy specification.

**Note: Storage classes must be updated prior to provisioning any new volumes with 0.7.0.**

### Upgrading OpenEBS Operator CRDs and Deployments

The upgrade steps vary depending on the way OpenEBS was installed. Select one of the following:

#### Install/Upgrade using kubectl (using openebs-operator.yaml )

**The sample steps below will work if you have installed openebs without modifying the default values in the *openebs-operator.yaml* file. If you have customized it for your cluster, you must download the 0.7.0 *openebs-operator.yaml* file and customize it again.**

```
# Starting with OpenEBS 0.6, all the components are installed in namespace `openebs`
# as opposed to `default` namespace in earlier releases.

kubectl delete -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-operator.yaml

#Wait for the objects to delete. Check if they are deleted using the `kubectl get deploy` command.

#Upgrade to 0.7 OpenEBS Operator

kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.7.0.yaml
```

#### Install/Upgrade using helm chart (using stable/openebs, openebs-charts repo, etc.)

**The following procedure will work if you have installed OpenEBS with default values provided by stable/openebs helm chart.**

- Run `helm ls` to get the OpenEBS release name.
- Upgrade using `helm upgrade -f https://openebs.github.io/charts/helm-values-0.7.0.yaml <release-name> stable/openebs`

#### Using Customized Operator YAML or Helm Chart.

As a first step, you must update your custom helm chart or YAML with 0.7 release tags and changes made in the values/templates.

You can use the following as a reference to know about the changes in 0.7.
- openebs-charts [PR#1878](https://github.com/openebs/openebs/pull/1878).

After updating the YAML or helm chart or helm chart values, you can use the above procedures to upgrade the OpenEBS Operator

## Step 2: Upgrade the OpenEBS Volumes

Even after the OpenEBS Operator has been upgraded to 0.7, the volumes will continue to work with older versions. Each volume should be upgraded (one at a time) to 0.7, using the following procedure.

*Note: Upgrade functionality is still under active development. It is highly recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, ensure you have taken a backup of the data before starting the following upgrade procedure.*

Limitations:
- This is a preliminary script only intended for use on volumes where data has been backed up.
- Please have the following link handy in case the volume gets into read-only during an upgrade.
  https://docs.openebs.io/docs/next/readonlyvolumes.html
- Automatic rollback option is not provided. To rollback, you must update the controller, exporter, and replica pod images to the previous version.
- In the process of running the following procedure, if you run into issues, you can always reach us on Slack.


```
kubectl get pv
```

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                          STORAGECLASS      REASON    AGE
pvc-48fb36a2-947f-11e8-b1f3-42010a800004   5G         RWO            Delete           Bound     percona-test/demo-vol1-claim   openebs-percona             8m
```

### Upgrade the PV

 Upgrade the PV that you want to upgrade using the following command.

```
./oebs_update.sh pvc-48fb36a2-947f-11e8-b1f3-42010a800004 openebs-storage
```

**Note:** You can use any value(string) in place of openebs-storage. This value will be taken as a parameter in the upgrade script.


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
