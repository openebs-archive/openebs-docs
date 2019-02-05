---
id: configuresc
title: Configuring Storage Classes
sidebar_label: Configuring StorageClasses
---
------

<img src="/docs/assets/sm-sc.png" alt="OpenEBS configuration flow" style="width:1000px">

As the definition of StorageClass a Storage Class provides a way for administrators to describe the “classes” of storage they offer.  

### **Setting Up StorageClass On OpenEBS**

For setting up the a StorageClass for providing cStor volume, you must include `StoragePoolClaim` parameter to use the particular cStorStoragePool. This is the must requirement for provisioning cStor volume.

### Default StorageClass

The default cStor StorageClass is as follows:

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

In the above sample StorageClass YAML, `StoragePoolClaim` used is default StorageClass`cstor-sparse-pool` which is created as part of OpenEBS installation.

### Customized StorageClass

if you want to use the StoragePoolClaim created with the external disks which is mentioned in the [storage pool](/docs/next/configurepools.html) section, then you have to use the StoragePoolClaim name in the new StorageClass YAML. Then the cStor volume will be provisioned in the cStorStroagePool which is specified in the StoragePoolClaim.

You can create a new file called  **openebs-sc-disk.yaml** and add below contents to it. This StorageClass YAML include the StoragePoolClaim created in storage pool section.

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
provisioner: openebs.io/provisioner-iscsi
---
```

in the above sample StorageClass YAML, `ReplicaCount` represents the desired number of cStor Volume Replica (CVR). The PVC that uses this storage class will create cStor volumes on the corresponding cStorStoragePools specified the `StoragePoolClaim` parameter in the StorageClass . 

You can apply the modified StorageClass YAML before provisioning cSor volume using the following command.

```
kubectl apply -f openebs-sc-disk.yaml
```

Following is an example output.

```
storageclass.storage.k8s.io "openebs-cstor-disk" created
```

You can get the StorageClass details using the following command.

```
kubectl get sc
```

Following is an example output

```
NAME                        PROVISIONER                                                AGE
openebs-cstor-disk			openebs.io/provisioner-iscsi							   2m
openebs-cstor-sparse        openebs.io/provisioner-iscsi                               6m
openebs-jiva-default        openebs.io/provisioner-iscsi                               6m
openebs-snapshot-promoter   volumesnapshot.external-storage.k8s.io/snapshot-promoter   6m
standard (default)          kubernetes.io/gce-pd                                       9m

```

You can use the StorageClass  name`openebs-cstor-disk` in the PVC YAML to provision cStor Volume on the corresponding cStorStoragePool.

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
