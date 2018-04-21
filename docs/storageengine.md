---
id: storageengine
title: OpenEBS Storage Engines
sidebar_label: Storage Engines
---

------

`Note: The feature of choosing a storage engine is available only from OpenEBS 0.6 release onwards`



OpenEBS supports two pluggable storage engines - Jiva and cStor

The type of storage engine is specified in the volume policies of OpenEBS. A storage class is chosen by the application developer. 

### Choosing a storage engine

A storage class contains the provisioner details and a reference to the Volume Parameter Group (VPG). Create a storage class that refers to a VPG  

Example of a storage class with a VPG reference is shown below

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-repaffinity-0.6.0
  annotations:
    provisioner.openebs.io/version: 0.6.0
provisioner: openebs.io/provisioner-iscsi
parameters:
  openebs.io/volume-parameter-group: openebs-policy-repaffinity-0.6.0
```



There are two parameters in a VPG that decide if the storage engine is Jiva or cStor. Those are ControllerImage and ReplicaImage. Set these two parameters either to Jiva or cStor. 



#### For Jiva engine, the VPG looks as follows

```
apiVersion: openebs.io/v1alpha1
kind: VolumeParameterGroup
metadata:
  name: openebs-policy-repaffinity-0.6.0
spec:
  policies:

- name: VolumeMonitor
  enabled: "true"
- name: ControllerImage
  value: openebs/jiva:0.5.0
- name: ReplicaImage
  value: openebs/jiva:0.5.0
- name: ReplicaCount
  value: "3"
- name: StoragePool
  value: ssd
```



#### For cStor engine, the VPG looks as follows

```
apiVersion: openebs.io/v1alpha1
kind: VolumeParameterGroup
metadata:
  name: openebs-policy-repaffinity-0.6.0
spec:
  policies:
  - name: VolumeMonitor
    enabled: "true"
  - name: ControllerImage
    value: openebs/cstor:0.5.0
  - name: ReplicaImage
    value: openebs/cstor:0.5.0
  - name: ReplicaCount
    value: "3"
  - name: StoragePool
    value: ssd
```



------

### Overview of Jiva storage engine

![Jiva storage engine of OpenEBS](/docs/assets/jiva.png)



------

### Overview of cStor storage engine

![cStor storage engine of OpenEBS](/docs/assets/cStor.png)





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