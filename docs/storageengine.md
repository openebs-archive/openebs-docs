---
id: storageengine
title: Pluggable OpenEBS Storage Engines
sidebar_label: Storage Engines
---

------

`Feature status: Pre-Alpha /Experimental. Users are advised to use this feature with caution.`

## Overview of a storage engine

OpenEBS follows CAS architecture, where in each storage volume is provided with it's own storage controller and replica pods. A storage engine refers to the software functionality that is associated with a storage volume. The storage engine will usually have one controller pod and multiple replication pods. Storage engines are usually hardened to optimize a given workload for either with a feature set or for performance. Operators or administrators typically choose a storage engine with a specific software version and build optimized volume templates that are fine tuned with type of underlying disks, resiliency, number of replicas, set of nodes participating in the Kubernetes cluster. Users can then choose an optimal volume template at the time of volume provisioning, thus providing the maximum flexibility in running the optimum software and storage combination for all the storage volumes on a given Kubernetes cluster.



## Types of storage engines

OpenEBS provides two types of storage engines. 

1. Jiva (Recommended engine and reliable)
2. cStor (Initial availability is planned for 0.7 release. Currently a developer build can be chosen if desired)



### Jiva

Jiva has a single container image for both controller and replica. Docker image is available at https://hub.docker.com/r/openebs/jiva/ iva storage engine is developed with Rancher's LongHorn and gotgt as the base. The entire Jiva engine is written in GO language and runs entirely in the user space. LongHorn controller synchronously replicates the incoming IO to the LongHorn replicas. The replica considers a Linux sparse file as the foundation. It supports  thin provisioning, snapshotting, cloning of storage volumes.

![Jiva storage engine of OpenEBS](/docs/assets/jiva.png)



### cStor

cStor storage engine has separate container image files for storage controller and storage replica. Docker images for controller is at << https://hub.docker.com/r/openebs/cstor-controller/>> and for replica is at << https://hub.docker.com/r/openebs/cstor-pool/>>. cStor is a high performing storage engine built with proven building blocks of storage components. Access protocol iSCSI stack is a linux ported  BSD based Multi-threaded iSCSI protocol stack originally developed at CloudByte. This iSCSI is field tested at thousands of installations for many years". The storage block layer is the DMU layer of user space ZFS inherited from the proven OpenSolaris stack. With these proven building blocks, cStor engine is highly reliable for storing and protecting enterprise data. 

![cStor storage engine of OpenEBS](/docs/assets/cStor.png)

## Choosing a storage engine

Developer does not directly choose a storage engine, but chooses a pre-defined storage class. Operator or Adminstrator constructs a storage class that refers to a CAS template containing the type of storage engine. 

![Choosing a storage engine](/docs/assets/cas-template.png)

## CAS template

CAS template is a customizable resource template (or a YAML file ). In kubernetes terminology it is a custom resource (CR). Operator typically builds several of this templates with various combinations of storage engines and storage pool details. Currently, following properties can be specified in a CAS template CR. 

```
apiVersion: openebs.io/v1alpha1
kind: CASTemplate
metadata:  
  name: openebs-jiva-v0.6.0-with-3-ssd-replica-v0.1
spec:  
  defaultConfig:  
  - name: ControllerImage    
    value: "openebs/jiva:0.6.0"  
  - name: ReplicaImage    
    value: "openebs/jiva:0.6.0"  
  - name: ReplicaCount    
    value: "3"  
  - name: StoragePool    
    value: "default"  
  - name: Monitoring    value: "true"  
run:    
  tasks:    ... 
```



## Use case example



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