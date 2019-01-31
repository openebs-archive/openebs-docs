---
id: setupstorageclasses
title: Setting up Storage Classes
sidebar_label: Storage Classes
---

------

**Storage Class**

A Storage Class provides a way for administrators to describe the “classes” of storage they offer. Different classes may map to quality-of-service levels, backup policies, or arbitrary policies determined by the cluster administrators. This concept is sometimes called “profiles” in other storage systems.

**Setting Up Storage Class On OpenEBS**

Once OpenEBS is installed on your Kubernetes cluster either by [kubectl](/docs/next/installation.html#install-openebs-using-kubectl) method or [Helm](/docs/next/installation.html#install-openebs-using-helm-charts) method, you can start using it by specifying corresponding OpenEBS Storage Classes in your PVCs. By default, default storage classes will be installed for both Jiva and cStor when OpenEBS gets installed.

You can get the status of StorageClass information using the following command

```
kubectl get sc
```

OpenEBS Storage provides several features that can be customized for each volume. Some of features that could be customized per application are as follows:

- Number of replications
- Zone or node affinity
- Volume expansion policy
- Replication policy
- File System policy

OpenEBS comes with some pre-defined set of storage classes that can be readily used. They help in provisioning Jiva and cStor. 

The default storage classes are as follows. 

### Storage Class for Provisioning Jiva

Starting with OpenEBS 0.7, the volume policies must be specified under the `annotations` > `openebs.io/config:`. The sample Jiva storage class is as follows:

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-jiva-default
  annotations:
    openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: ControllerImage
        value: openebs/jiva:0.8.0
      - name: ReplicaImage
        value: openebs/jiva:0.8.0
      - name: VolumeMonitorImage
        value: openebs/m-exporter:0.8.0
      - name: ReplicaCount
        value: "3"
      - name: StoragePool
        value: default
      #- name: TargetResourceLimits
      #  value: |-
      #      memory: 1Gi
      #      cpu: 100m
      #- name: AuxResourceLimits
      #  value: |-
      #      memory: 0.5Gi
      #      cpu: 50m
      #- name: ReplicaResourceLimits
      #  value: |-
      #      memory: 2Gi
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
```

OpenEBS supports both ext4 and XFS file systems. By default, it comes with ext4 file system for the mounted volumes. Some applications require using the XFS as file system. The policy to specify XFS as the file system, you must add `openebs.io/fstype: "xfs"` under section `annotations:`. Following is a sample storage class for application which need to be run of XFS.

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
   name: openebs-xfs
   annotations:
   	openebs.io/cas-type: jiva
    cas.openebs.io/config: |
      - name: ControllerImage
        value: openebs/jiva:0.8.0
      - name: ReplicaImage
        value: openebs/jiva:0.8.0
      - name: VolumeMonitorImage
        value: openebs/m-exporter:0.8.0
      - name: ReplicaCount
        value: "1"
      - name: StoragePool
        value: default
      - name: FSType
        value: "xfs"
      #- name: TargetResourceLimits
      #  value: |-
      #      memory: 1Gi
      #      cpu: 100m
      #- name: AuxResourceLimits
      #  value: |-
      #      memory: 0.5Gi
      #      cpu: 50m
      #- name: ReplicaResourceLimits
      #  value: |-
      #      memory: 2Gi
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
```

**Note:** Support for xfs file system has been introduced from 0.5.4 and onwards. In order to change the file system you must have 0.5.4 or latest build.


### Storage Class for Provisioning cStor

A new OpenEBS component called Storage Pool Claim (SPC) watcher has been introduced. This allows you to define an SPC name, for example,  `cstor-sparse-pool`. Pools will be created with the specified SPC name and the desired number of replicas specified in the `ReplicaCount`. The PVC that uses the storage class will create cStor volumes on the specified pools. ReplicaCount mentioning under StorageClass will create replicas of OpenEBS volume.

The sample cStor storage class is as follows:

```
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-sparse
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-sparse-pool"
      - name: ReplicaCount
        value: "3"
     #- name: TargetResourceLimits
      #  value: |-
      #      memory: 1Gi
      #      cpu: 200m
      #- name: AuxResourceLimits
      #  value: |-
      #      memory: 0.5Gi
      #      cpu: 50m
provisioner: openebs.io/provisioner-iscsi
---
```

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
