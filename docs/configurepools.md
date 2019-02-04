---
id: configurepools
title: Configuring Storage Pools
sidebar_label:Configure StoragePools
---
------

<img src="/docs/assets/sm-pool.png" alt="OpenEBS configuration flow" style="width:1000px">

cStor provides storage scalability along with ease of deployment and usage. cStor can handle multiple disks of any size per Node and create different storage pools. You can use these storage pools to create cStor volumes which you can utilize to run your stateful applications.

OpenEBS creates cStorStoragePool(CSP) on each nodes by combining disks belongs to each Node.  [Node Disk Manager](https://docs.openebs.io/docs/next/architecture.html#cstor)(NDM) is handling the disks for creating cStor Storage pool. Currently NDM is excluding some of the device paths detected on Nodes to avoid from creating cStor Pools. You will get more information from [here](https://docs.openebs.io/docs/next/faq.html#what-are-different-device-paths-excluded-by-ndm). 

You can create cStor pools on OpenEBS clusters once you have installed OpenEBS 0.8 version. Verify if the OpenEBS installation is complete. If not, go to [installation](https://docs.openebs.io/docs/next/installation.html).

The storage pool can be created either manually or by auto pool configuration. cStorStoragePool is getting created by applying the StoragePoolClaim(SPC) YAMLs. StoragePoolClaim YAMLs are different for manual method and auto method.  The following section describes about the configuration of cStorStoragePool using manual and auto configuration.

### By Using Manual Method

In manual method, following sections types can be changed.

-  `diskList`

  You must give the selected disk name which is listed by NDM. This details has to be entered in the below StoragePoolClaim YAML under `diskList`. 

- `type`

  The `type` can be either `sparse` or `disk`.

- `maxPools`

  This value represents the maximum number cStorStoragePool is creating on the cluster. 

  This value should be less than or equal to the total number of Nodes in the cluster.

-  `poolType`

  This value represents the type of cStorStoragePool is getting created. Currently `striped` and `mirrored` are supported.

You can create a YAML file named *openebs-config.yaml* and add below contents to it for creating storage pool with striped manner.

```
#Use the following YAMLs to create a cStor Storage Pool.
# and associated storage class.
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  poolSpec:
    poolType: striped
  # NOTE - Appropriate disks need to be fetched using `kubectl get disks`
  #
  # `Disk` is a custom resource supported by OpenEBS with `node-disk-manager`
  # as the disk operator
# Replace the following with actual disk CRs from your cluster `kubectl get disks`
# Uncomment the below lines after updating the actual disk names.
  disks:
    diskList:
# Replace the following with actual disk CRs from your cluster from `kubectl get disks`
#   - disk-184d99015253054c48c4aa3f17d137b1
#   - disk-2f6bced7ba9b2be230ca5138fd0b07f1
#   - disk-806d3e77dd2e38f188fdaf9c46020bdc
#   - disk-8b6fb58d0c4e0ff3ed74a5183556424d
#   - disk-bad1863742ce905e67978d082a721d61
#   - disk-d172a48ad8b0fb536b9984609b7ee653
---
```

Edit *openebs-config.yaml* file to include disk details associated to each node in the cluster which you are using for creation of  the OpenEBS cStor Pool. Replace the disk names under *diskList* section, which you can get from running *kubectl get disks* command. Once it is modified, you can apply this YAML. This will create cStor Storage Pool on each Node and StorageClass named `openebs-cstor-disk`.  

For example, you have a 3 Node cluster. Each Node have 2 disks each. So if you select these disks in the above sample YAML, it will create a cStor Pool on each Node by using the disks attached to each Node.

Once you have modified the YAML file with required changes, you can apply the YAML using the following command.

```
kubectl apply -f openebs-config.yaml
```

Following is an example output.

```
storagepoolclaim.openebs.io "cstor-disk" created
```

### By Using Auto Method

In the auto pool method, you must not select the disks which are detected by NDM for creating cStor Pools. You can create a file called **openebs-config.yaml** in your master node and add the following contents into the file. You can modify the following types in the YAML file.

- `type`

  The `type` can be either `sparse` or `disk`.

- `maxPools`

  This value represents the maximum number cStorStoragePool is creating on the cluster. 

  This value should be less than or equal to the total number of Nodes in the cluster.

-  `poolType`

  This value represents the type of cStorStoragePool is getting created. Currently `striped` and `mirrored` are supported.

Following is a sample SPC YAML file to use the physical disks for the cStor Pool creation with auto configuration.

```
---
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  maxPools: 3
  poolSpec:
    poolType: striped
---
```

Once you have modified the YAML file with required changes, you can apply the YAML using the following command. This will create one cStorStoragePool in each of the 3 Nodes.

```
kubectl apply -f openebs-config.yaml
```

Following is an example output. 

```
storageclass.storage.k8s.io "openebs-cstor-disk" created
storagepoolclaim.openebs.io "cstor-disk" created
```

## Verify StoragePoolClaim status

Once the StoragePoolClaim YAML is applied using either of the method from the above section, the status of the StoragePoolClaim can be checked using the following command.

```
 kubectl get spc
```

Following is an example output. 

```
NAME                AGE
cstor-disk          1m
cstor-sparse-pool   22m
```

As mentioned in the above YAML, a SPC will be created with the name `cstor-disk`.

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