---
id: version-0.8.2-configurepools
title: Configuring Storage Pools
sidebar_label: Configure StoragePools
original_id: configurepools
---
------

<br>

<img src="/docs/assets/svg/2-config-sequence.svg" alt="OpenEBS configuration flow" style="width:100%">

<br>



<font size="6">Summary:</font>

[Using default pool](#using-default-cstor-pool)

[Creating a new pool](#creating-a-new-pool)

[Pool policies](#pool-policies)

[Day 2 operations on cStorPools](#day-2-operations-on-cstorpools)

[Verifying pool status](#verifying-pool-status)



*Note: This page describes how to create, use and maintain cStorPools. For details about Jiva pools, see [Jiva user guide](/v082/docs/next/jivaguide.html)* 

<br>

<hr>

<br>

## Using default cStor pool

<br>

`openebs-cstor-sparse` storageClass and `cstor-sparse-pool` are created for convenience and ease of use. The data stored to this pool is stored on the sparse disks created during installation. This storageClass can be used in test setups and learning OpenEBS but not for production. For production use, create cStorPools on read disks.

If you want to know more details about sparse pools and disks, see [sparse pool deep dive](#sparse-pool-deepdive)

<br>

<hr>

<br>



## Creating a new pool

<br>

Process of creating a new cStor storage pool

- Create a YAML spec `cstor-pool-config.yaml`. You can create a cStorPool in two ways.
  - [By specifying disks list](#manual-mode) (or)
  - [Without specifying disks list](#auto-mode) method
- Create pool config through `kubectl apply` 



<br>

<h3><a class="anchor" aria-hidden="true" id="manual-mode"></a>Create a cStorPool by specifying diskList </h3>

**Step1:**

Create a YAML file called `cstor-pool1-config.yaml` with the following content. In the following YAML, `PoolResourceRequests` value is limted to `2Gi` and `PoolResourceLimits` value is set to `2Gi`. This will be shared for all the volume replicas that resides on the pool. The value of these resources can be 2Gi to 4Gi per pool on a given node for a better performance. These values can be changed as per the Node configuration. 

```
#Use the following YAMLs to create a cStor Storage Pool.
# and associated storage class.
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-pool1
  annotations:
    cas.openebs.io/config: |
      - name: PoolResourceRequests
        value: |-
            memory: 2Gi
      - name: PoolResourceLimits
        value: |-
            memory: 2Gi
spec:
  name: cstor-pool1
  type: disk
  maxPools: 3
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



In the above file, change the parameters as required

- `poolType`

  This filed is not named very aptly. This field may be changed to `diskAggType` in future. This filed  represents how the data will be written to the disks on a given pool instance on a node. Supported values are `striped` or `mirrored`

  Note: In OpenEBS, the pool instance do not extend beyond a node. The replication happens at volume level but not at pool level. See [volumes and pools relationship](/v082/docs/next/cstor.html#relationship-between-cstor-volumes-and-cstor-pools) in cStor for a deeper understanding.

- `maxPools`

  This value represents the maximum number cStorPool instances to be created. In other words if `maxPools` is `3`, then three nodes are randomly chosen by OpenEBS and one cStorPool instance each will be created on them with one disk (if poolType is `striped`) or two disks (if poolType is `mirrored`)

  This value should be less than or equal to the total number of Nodes in the cluster.

- `diskList`

  Select the list of disk CRs in each participating nodes and enter them under `diskList`. To get the list of disk CRs use `kubectl get disks` . To know which node a given disk CR belongs, use `kubectl describe disk <disk-cr>`

  You must enter all the disk CRs manually together from the selected nodes. 

  When the `poolType` = `mirrored` make sure the disk CRs selected from from each node are in even number.  The data is striped across mirrors. For example, if 4x1TB disks are selected on `node1`, the raw capacity of the pool instance of `cstor-pool1` on `node1` is 2TB. 

  When the `pooltype` = `striped` the number of disk CRs from each node can be in any number, the data is striped across each disk. For example, if 4x1TB disks are selected on `node1`, the raw capacity of the pool instance of `cstor-pool1` on that `node1` is 4TB. 

  The number of selected disk CRs across nodes need not be same. The disk CRs can be added to the pool spec dynamically as the used capacity gets filled up. 

  Note: Some of the pool expansion features of the cStorpools are under development. See [pool day2 operations](#day2-operations-on-cstorpools)

- `type`

  This value can be either `sparse` or `disk`. 

**Step2:**

After the pool YAML spec is created, run the following command to create the pool instances on nodes.

```
kubectl apply -f cstor-pool1-config.yaml
```

If the pool creation is successful, you will see the example result as shown below.

<div class="co">storagepoolclaim.openebs.io "cstor-pool1" created</div>

**Note:** The cStor pool can be horizontally scale up on new OpenEBS Node by editing  the corresponding pool configuration YAML with the new disks name under `diskList` and update the `maxPools` count accordingly. More details can be found [here](/v082/docs/next/operations.html#with-disklist).

<br>

<hr>

<br>



<h3><a class="anchor" aria-hidden="true" id="auto-mode"></a>Create a cStorPool WITHOUT specifying diskList </h3>

Sometimes for new users, identifying the correct disks CRs and node-citizenship could be time consuming.  To make the process of cStorPool creation simple for users to quickly test cStor with real disks, OpenEBS supports creation of a cStorPool even when `diskList` is not specified in the YAML specification.  In this case, one pool instance on each node is created  with just one striped disk or one mirrored group of disks. 

Follow the below steps to create a quick cStorPool in this method.



**Step1:**

Create a YAML file called `cstor-pool-config2.yaml` with the following content.  In the following YAML, `PoolResourceRequests` value is limted to `2Gi` and `PoolResourceLimits` value is set to `2Gi`. This will be shared for all the volume replicas that resides on the pool. The value of these resources can be 2Gi to 4Gi per pool on a given node for a better performance. These values can be changed as per the Node configuration.

```
---
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-pool2
  annotations:
    cas.openebs.io/config: |
      - name: PoolResourceRequests
        value: |-
            memory: 2Gi
      - name: PoolResourceLimits
        value: |-
            memory: 2Gi
spec:
  name: cstor-pool2
  type: disk
  maxPools: 3
  poolSpec:
    poolType: striped
---
```



- `type`

  This value can be either `sparse` or `disk`.

- `maxPools`

  This value represents the maximum number cStorPool instances to be created. In other words if `maxPools` is `3`, then three nodes are randomly chosen by OpenEBS and one cStorPool instance each is created on them  with one disk (`striped`) or two disks (`mirrored`)

  This value should be less than or equal to the total number of Nodes in the cluster.

- `poolType`

  This filed is not named very aptly. This field may be changed to `diskAggType` in future. This filed  represents how the data will be written to the disks on a given pool instance on a node. Supported values are `striped` or `mirrored`

  

  Note: In OpenEBS, the pool instance do not extend beyond a node. The replication happens at volume level but not at pool level. See [volmes and pools relationship](/v082/docs/next/cstor.html#relationship-between-cstor-volumes-and-cstor-pools) in cStor for a deeper understanding.

**Step2:**

After the pool YAML spec is created, run the following command to create the pool instances on nodes.



```
kubectl apply -f cstor-pool2-config.yaml
```

If the pool creation is successful, you will see the example result as shown below.

<div class="co">storagepoolclaim.openebs.io "cstor-pool2" created</div>

**Note:** You can horizontally scale up the cStor pool on new OpenEBS Node by editing the corresponding pool configuration YAML with updating the `maxPools` count. More details can be see [here](/docs/next/operations.html#without-disklist).

<br>

<hr>
<br>

## Pool Policies

This section captures the policies supported for cStorPools in `StoragePoolClaim` under `spec`  in the name and value pair format. 



<h3><a class="anchor" aria-hidden="true" id="PoolResourceLimits-Policy"></a>PoolResourceLimits Policy</h3>

This feature allow you to set the limits on memory and cpu for pool pods. The resource and limit value should be in the same format as expected by Kubernetes. The `name` of SPC can be changed if you need.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name: PoolResourceLimits
        value: |-
            memory: 2Gi
spec:
  name: cstor-disk
  type: disk
```





<h3><a class="anchor" aria-hidden="true" id="PoolResourceRequests-Policy"></a>PoolResourceRequests Policy</h3>

This feature allow you to specify resource requests that need to be available before scheduling the containers. If not specified, the default values are used. The `name` of SPC can be changed if you need.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name: PoolResourceRequests
        value: |-
            memory: 2Gi
spec:
  name: cstor-disk
  type: disk
```





<h3><a class="anchor" aria-hidden="true" id="Tolerations"></a>Tolerations</h3>

cStor pool pods can be ensure that pods are not scheduled onto inappropriate nodes. This can be acheived using taint and tolerations method. If Nodes are tainted to schedule the pods which are tolerating the taint, then cStor pool pods also can be scheduled using this method.  Tolerations are applied to cStor pool pods, and allow (but do not require) the pods to schedule onto nodes with matching taints.

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name: Tolerations
        value: |-
          t1:
            effect: NoSchedule
            key: nodeA
            operator: Equal
          t2:
            effect: NoSchedule
            key: app
            operator: Equal
            value: storage
spec:
  name: cstor-disk
  type: disk
  maxPools: 3
  poolSpec:
    poolType: striped
```





<h3><a class="anchor" aria-hidden="true" id="AuxResourceLimits-Policy"></a>AuxResourceLimits Policy</h3>

You can specify the *AuxResourceLimits* which allow you to set limits on side cars. 

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name:  AuxResourceLimits
        value: |-
            memory: 0.5Gi
            cpu: 50m
    openebs.io/cas-type: cstor
```





<h3><a class="anchor" aria-hidden="true" id="AuxResourceRequests-Policy"></a>AuxResourceRequests Policy</h3>

This feature is useful in cases where user has to specify minimum requests like ephemeral storage etc. to avoid erroneous eviction by K8s. `AuxResourceRequests` allow you to set requests on side cars. Requests have to be specified in the format expected by Kubernetes

```
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
  annotations:
    cas.openebs.io/config: |
      - name: AuxResourceRequests
        value: "none"
    openebs.io/cas-type: cstor
```



<br>

<hr>

<br>

## Day 2 operations on cStorPools

With latest release,only some day2 operations are supported. Many of day2 operations are under active development. See [cStor roadmap](/v082/docs/next/cstor.html#cstor-roadmap) for more details. 

**Note:** *All pools created using 0.8.1 will receive the pool expansion capabilities when those features are available in future releases.* 

<br>

<hr>

<br>

## Verifying pool status

<br>

Detailed metrics for cStorPool are under development. See [cStor Roadmap](/v082/docs/next/cstor.html#cstor-roadmap) for more details. 

At the moment, status of cStor pools is obtained via the standard `kubectl get` and `kubectl describe` commands of pool  custom resources (spc, csp)

**StoragePoolClaim status**

```
 kubectl get spc
```

Following is an example output. 

<div class="co">NAME                AGE
cstor-disk          1m
cstor-sparse-pool   22m
</div>





**cStorStoragePool status**

Once StoragePoolClaim is created, corresponding cStorStoragePool will be created. This can be check using the following command.

```
kubectl get csp
```

Following is an example output.

<div class="co">NAME                     AGE
cstor-disk-8qvy          5s
cstor-disk-k6si          6s
cstor-disk-tns6          6s
cstor-sparse-pool-a8qk   21m
cstor-sparse-pool-d1zm   21m
cstor-sparse-pool-sbv5   21m
</div>

**cStorStoragePool pods status**

Once cStorStoragePool is created, corresponding pool pods will be created and running. This can be verified using the following command.

```
kubectl get pods -n openebs
```

Following is an example output. 

<div class="co">cstor-disk-2xtj-6748d7f57d-tbqrp           2/2       Running   0          38s
cstor-disk-m7xa-6f7bd8447c-nr5z4           2/2       Running   0          38s
cstor-disk-sn5y-5688f94888-hmgkf           2/2       Running   0          38s
cstor-sparse-pool-io1y-88cbf9bc-c6g29      2/2       Running   0          21m
cstor-sparse-pool-lsm9-766567747b-rfplx    2/2       Running   0          21m
cstor-sparse-pool-y8pf-598d794ff4-jn8gg    2/2       Running   0          21m
maya-apiserver-5f8899f44f-hbnj2            1/1       Running   0          22m
openebs-ndm-6w68f                          1/1       Running   0          22m
openebs-ndm-9ktvv                          1/1       Running   0          22m
openebs-ndm-g4d6l                          1/1       Running   0          22m
openebs-provisioner-69956599d5-jlnb4       1/1       Running   0          22m
openebs-snapshot-operator-c88544f5-76px8   2/2       Running   0          22m
</div>

In the above example output, name starts with `cstor-disk-\*` are the cStorStoragePool pods. It must be in running state to provision cStor Volumes.

**Note:** By default, OpenEBS cStorStoragePool pods will be running in `openebs` namespace.

<br>

<hr>

<br>



<h2><a class="anchor" aria-hidden="true" id="sparse-pool-deepdive"></a>Sparse Pool deep dive </h2>

OpenEBS installation process creates the following defaults : 

- One sparse disk is created on each node in the cluster  
- A ready to use cStorPool config called `cstor-sparse-pool` .  This `cstor-sparse-pool` config has a `cStor Pool` instance on every node of the cluster. 
- One StorageClass called `openebs-cstor-sparse` that points to `cstor-sparse-pool` 

<img src="/docs/assets/svg/sparsepool.svg" alt="OpenEBS configuration flow" style="width:100%">

`kubectl describe StorageClass openebs-cstor-sparse` provides the relationship  details

<div class="co">

Name:            openebs-cstor-sparse
IsDefaultClass:  No
Annotations:     cas.openebs.io/config=- name: StoragePoolClaim
  value: "cstor-sparse-pool"
  -name: ReplicaCount
  value: "3"
,openebs.io/cas-type=cstor
Provisioner:           openebs.io/provisioner-iscsi
Parameters:            <none>
AllowVolumeExpansion:  <unset>
MountOptions:          <none>
ReclaimPolicy:         Delete
VolumeBindingMode:     Immediate
Events:                <none>

</div>



cStor provides storage scalability along with ease of deployment and usage. cStor can handle multiple disks with different size per Node and create different storage pools. You can use these storage pools to create cStor volumes which you can utilize to run your stateful applications.

<br>

<hr>

<br>

## See Also:



### [Understand cStorPools ](/v082/docs/next/cstor.html#cstor-pools)

### [cStorPool use case for Prometheus](/v082/docs/next/prometheus.html)

### [cStor roadmap](/v082/docs/next/cstor.html#cstor-roadmap)



<br>

<hr>

<br>



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