---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---

------

# Upgrade from OpenEBS 0.6.0 to 0.7.0

## Overview

This document describes the steps for upgrading OpenEBS from 0.6.0 to 0.7.x. 

The upgrade of OpenEBS is a two step process:

- *Step 1* - Upgrade the OpenEBS Operator
- *Step 2* - Upgrade the OpenEBS Volumes that were created with older OpenEBS Operator (0.6.0)

**Note:**
For older versions, OpenEBS supports upgrade to 0.6 version only from 0.5.3 and 0.5.4. For steps to upgrade to 0.6.0, [click](https://v06-docs.openebs.io/docs/next/upgrade.html) here.

### Terminology

- **OpenEBS Operator:** Refers to maya-apiserver and openebs-provisioner along with respective services, service account, roles, rolebindings.
- **OpenEBS Volume:**The Jiva controller and replica pods.

### Prerequisites

- All steps described in this document must be performed on the Kubernetes master or from a machine that has access to Kubernetes master.

#### Download the upgrade scripts

You can either `git clone` or download the upgrade scripts.

```
mkdir upgrade-openebs
cd upgrade-openebs
git clone https://github.com/openebs/openebs.git
cd openebs/k8s/upgrade/0.6.0-0.7.0/
```

Or

Download the following files to your work directory from <https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.6.0-0.7.0>

- `patch-strategy-recreate.json`
- `jiva-replica-patch.tpl.json`
- `jiva-target-patch.tpl.json`
- `jiva-target-svc-patch.tpl.json`
- `target-patch-remove-labels.json`
- `target-svc-patch-remove-labels.json`
- `replica-patch-remove-labels.json`
- `sc.patch.tpl.yaml`
- `upgrade_sc.sh`
- `oebs_update.sh`
- `pre_upgrade.sh`

### Breaking Changes in 0.7.x

- #### Default Jiva Storage Pool

  - OpenEBS 0.7.0 auto installs a default Jiva Storage Pool and a default Storage Class named `default` and `openebs-jiva-default`respectively. If you have a storage pool named `default` created in earlier version, you will have to re-apply your Storage Pool after the upgrade is completed.

    Before upgrading the OpenEBS Operator, check if you are using a storage pool named `default`   which will conflict with default jiva pool installed with OpenEBS 0.7.0. You can use following command to check if you have already a Jiva pool named with `default`

    ```
    ./pre_upgrade.sh <openebs-namespace>
    ```

    **Example:**

    ```
     ./pre_upgrade.sh openebs
    ```

- #### Storage Classes

  - OpenEBS supports specified Storage Policies in Storage Classes. The way storage policies are specified has changed in 0.7.x. The policies will have to be specified under metadata instead of parameters.

    For example, if your storage class looks like this in 0.6.0:

    ```
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
       name: openebs-mongodb
    provisioner: openebs.io/provisioner-iscsi
    parameters:
      openebs.io/storage-pool: "default"
      openebs.io/jiva-replica-count: "3"
      openebs.io/volume-monitor: "true"
      openebs.io/capacity: 5G
      openebs.io/fstype: "xfs"
    ```

    If you are using `ext4` for FSType, you could use the following script to upgrade your StorageClasses.

    ```
    ./upgrade_sc.sh
    ```

    Alternatively, you can skip the above command  and re-apply your StorageClasses as per the 0.7.0 		volume policy specification as given in the following yaml. There is no need to mention the volume-monitor and capacity with 0.7.0. The remaining policies like storage pool, replica count and the fstype should be specified as follows:

    ```
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
       name: openebs-mongodb
       annotations:
        cas.openebs.io/config: |
          - name: ReplicaCount
            value: "3"
          - name: StoragePool
            value: default
          - name: FSType
            value: "xfs"
    provisioner: openebs.io/provisioner-iscsi
    ```

  **Important Note: StorageClasses have to be updated prior to provisioning any new volumes with 0.7.0.**

## Step 1: Upgrade the OpenEBS Operator

OpenEBS 0.7.0 has made the following significant changes to the OpenEBS Operator (aka OpenEBS control plane components):
- Integrated with OpenEBS NDM project. A new Daemonset will be launched to discover the block devices attached to the nodes.

### Upgrading OpenEBS Operator CRDs and Deployments

The upgrade steps vary depending on the way OpenEBS was installed. You can upgrade your OpenEBS cluster if you have already deployed your cluster using one of the following approach.

1. Using `kubectl`
2. Using helm

Select one of the following:

#### Install/Upgrade using kubectl (using openebs-operator.yaml )

The following sample steps will work if you have installed OpenEBS cluster without modifying the default values in the *openebs-operator.yaml* file.  If you have customized it for your cluster, you will have to download the 0.7.0 openebs-operator.yaml using below command and customize it again. 

You can delete the existing older version of OpenEBS cluster using the following command.

```
kubectl delete -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-operator.yaml
```

Wait for the objects to delete. Check if OpenEBS control plane components are deleted using the `kubectl get deploy` command.

Now you can upgrade to 0.7.x version.

```
kubectl apply -f https://openebs.github.io/charts/openebs-operator-0.7.2.yaml
```

**Note:** Starting with OpenEBS 0.6, all the components are installed in namespace `openebs` as opposed to `default` namespace in earlier releases.

#### Install/Upgrade using table/openebs helm chart

The following procedure will work if you have installed OpenEBS with default values provided by stable/openebs helm chart.

- Run `helm ls` to get the OpenEBS release name.
- Upgrade using `helm upgrade -f https://openebs.github.io/charts/openebs-operator-0.7.2.yaml <release-name> stable/openebs`

#### Using Customized Operator YAML or Helm Chart.

As a first step, you must update your custom helm chart or YAML with 0.7 release tags and changes made in the values/templates.

You can use the following as a reference to know about the changes in 0.7.
- openebs-charts [PR#1878](https://github.com/openebs/openebs/pull/1878).

After updating the YAML or helm chart or helm chart values, you can use the above procedures to upgrade the OpenEBS Operator

## Step 2: Upgrade the OpenEBS Volumes

Even after the OpenEBS Operator has been upgraded to 0.7, the volumes will continue to work with older versions. Each volume should be upgraded (one at a time) to 0.7, using the following procedure.

**Note:** Upgrade functionality is still under active development. It is highly recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, ensure you have taken a backup of the data before starting the following upgrade procedure.

**Limitations:**

- This is a preliminary script only intended for use on volumes where data has been backed up.
- Please have the following link handy in case the volume gets into read-only during an upgrade.
  https://docs.openebs.io/docs/next/readonlyvolumes.html
- Automatic rollback option is not provided. To rollback, you must update the controller, exporter, and replica pod images to the previous version.
- In the process of running the following procedure, if you run into issues, you can always reach us on [Slack](openebs-community.slack.com).

Now, you can get the list of OpenEBS volumes which are going to upgrade using following command

```
kubectl get pv
```

Output of above command will be similar to the following

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                          STORAGECLASS      REASON    AGE
pvc-48fb36a2-947f-11e8-b1f3-42010a800004   5G         RWO            Delete           Bound     percona-test/demo-vol1-claim   openebs-percona             8m
```

### Upgrade the PV

 Upgrade the PV that you want to upgrade using the following command.

```
./oebs_update.sh pvc-48fb36a2-947f-11e8-b1f3-42010a800004 <node-label>
```

**Example:**

```
./oebs_update.sh pvc-48fb36a2-947f-11e8-b1f3-42010a800004 openebs-storage
```

Here `pvc-48fb36a2-947f-11e8-b1f3-42010a800004` is the pv name and  `node-label`is the node where corresponding replica pods has been labeled. If node is not labelled, then nodes will be labelled as per the given name.

After executing this above script, it will show that OpenEBS Jiva volume has been successfully upgraded to 0.7 version. You can run your application for using the upgraded volume.

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
