---
id: provisionvols
title: Provisioning OpenEBS Storage Volumes - Using PVC
sidebar_label: Provisioning Volumes
---
------

<img src="/docs/assets/sm-pv.png" alt="OpenEBS configuration flow" style="width:1000px">

In this section , it explains how a cStor volume can be provisioned on cStorStoragePools and verification of this cStor volume. 

## Provisioning cStor Volume

cStor volume can be provisioned on sparse pool as well as on disk pool. OpenEBS installation create default cStorStoragePool using sparse disks on the Nodes. You can provision cStor volume on cStor sparse pool  for testing purpose. 

### On Sparse Pool

If you are using cStor sparse pool which is created using sparse disk, then apply the sample PVC yaml file which can be used to create OpenEBS cStor volume. This sample PVC yaml will use default storage class *openebs-cstor-sparse* created as part of *openebs-operator.yaml* installation.

**Note:** cStor sparse pool should be used for POC and testing environments. We recommend to use disk pool for actual workloads. 

Apply the sample pvc yaml file to create cStor volume on cStor sparse Pool using the following command.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-cstor-default.yaml
```

### On Disk Pool

The disk pools are created using the external disks attached on the Node. The detailed explanation of the creation of cStorStoragePool  using external disks is mentioned [here](/docs/next/configurepools.html).

#### Prerequisites Check

The prerequisite checks before provisioning cStorStoragePool is below.

- OpenEBS cStorStoragePool is created and cStorStoragePool  pods are running. Verify from [here](/docs/next/configurepools.html)
- StorageClass which include the parameter `StoragePoolClaim` to consume the cStorStoragePool created using StoragePoolClaim. Verify from [here](/docs/next/configuresc.html).

if above prerequisites are meet the requirement, cStor volume can be provisioned. You can download the PVC YAML from [here](https://raw.githubusercontent.com/openebs/openebs/master/k8s/sample-pv-yamls/pvc-standard-cstor-disk.yaml)  or you can create a new file named **pvc-standard-cstor-disk.yaml** and add the following content to it.

```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-cstor-disk-vol1-claim
spec:
  storageClassName: openebs-cstor-disk
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 4G
---
```

In this example YAML, StorageClassName is `openebs-cstor-disk` which is created in [Configure StorageClass](/docs/next/configuresc.html) section. You can do the modification for the parameters as per your requirement. 

You can apply the modified **pvc-standard-cstor-disk.yaml** to provision cStor volume on the disk pool using the following command.

```
kubectl apply -f pvc-standard-cstor-disk.yaml
```

## Verify the cStor Volume status

Get the pvc details by running the following command.

```
kubectl get pvc
```

Following is an example output 

```
NAME                         STATUS    VOLUME                                        CAPACITY   ACCESS MODES   STORAGECLASS         AGE
demo-cstor-disk-vol1-claim   Bound     default-demo-cstor-disk-vol1-claim-2386477986   	   4G         RWO            openebs-cstor-disk   12s
```

Get the pv details by running the following command.

```
kubectl get pv
```

Following is an example output.

```
NAME                                            CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                                STORAGECLASS         REASON    AGE
default-demo-cstor-disk-vol1-claim-2386477986   4G         RWO            Delete           Bound     default/demo-cstor
```

Use this PVC name in your application YAML to run your application using OpenEBS cStor volume.

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
