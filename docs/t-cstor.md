---
id: t-cstor
title: Troubleshooting OpenEBS - cStor
sidebar_label: cStor
---
------

<font size="5">General guidelines for troubleshooting</font>

- Contact <a href="/docs/next/support.html" target="_blank">OpenEBS Community</a> for support.
- Search for similar issues added in this troubleshooting section.
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>
<hr>
<br>

[One of the cStorVolumeReplica(CVR) will have its status as `Invalid` after corresponding pool pod gets recreated](#CVR-showing-status-as-invalid-after-poolpod-gets-recreated)

[cStor volume become read only state](#cstor-volume-read-only)

[cStor pools, volumes are offline and pool manager pods are stuck in pending state](#pools-volume-offline)

[Pool Operation Hung Due to Bad Disk](#pool-operation-hung)

[Volume Migration when the underlying cStor pool is lost](#volume-migration-pool-lost)

<br>
<hr>
<br>

<h3><a class="anchor" aria-hidden="true" id="CVR-showing-status-as-invalid-after-poolpod-gets-recreated"></a>One of the cStorVolumeReplica(CVR) will have its status as `Invalid` after corresponding pool pod gets recreated</h3>

When User delete a cStor pool pod, there are high chances for that corresponding pool-related CVR's can goes into `Invalid` state.
Following is a sample output of `kubectl get cvr -n openebs`

<div class="co">NAME                                                         USED   ALLOCATED   STATUS    AGE
pvc-738f76c0-b553-11e9-858e-54e1ad4a9dd4-cstor-sparse-p8yp   6K     6K          Invalid   6m
</div>

**Troubleshooting**

Sample logs of `cstor-pool-mgmt` when issue happens:
<div class="co">rm /usr/local/bin/zrepl
exec /usr/local/bin/cstor-pool-mgmt start
<b>I0802 18:35:13.814623 6 common.go:205] CStorPool CRD found</b>
I0802 18:35:13.822382 6 common.go:223] CStorVolumeReplica CRD found
I0802 18:35:13.824957 6 new_pool_controller.go:103] Setting up event handlers
I0802 18:35:13.827058 6 new_pool_controller.go:105] Setting up event handlers for CSP
I0802 18:35:13.829547 6 new_replica_controller.go:118] will set up informer event handlers for cvr
I0802 18:35:13.830341 6 new_backup_controller.go:104] Setting up event handlers for backup
I0802 18:35:13.837775 6 new_restore_controller.go:103] Setting up event handlers for restore
I0802 18:35:13.845333 6 run_pool_controller.go:38] Starting CStorPool controller
I0802 18:35:13.845388 6 run_pool_controller.go:41] Waiting for informer caches to sync
I0802 18:35:13.847407 6 run_pool_controller.go:38] Starting CStorPool controller
I0802 18:35:13.847458 6 run_pool_controller.go:41] Waiting for informer caches to sync
I0802 18:35:13.856572 6 new_pool_controller.go:124] cStorPool Added event : cstor-sparse-p8yp, 48d3b2ba-b553-11e9-858e-54e1ad4a9dd4
I0802 18:35:13.857226 6 event.go:221] Event(v1.ObjectReference{Kind:"CStorPool", Namespace:"", Name:"cstor-sparse-p8yp", UID:"48d3b2ba-b553-11e9-858e-54e1ad4a9dd4", APIVersion:"openebs.io/v1alpha1", ResourceVersion:"1998", FieldPath:""}): type: 'Normal' reason: 'Synced' Received Resource create event
I0802 18:35:13.867953 6 common.go:262] CStorPool found
I0802 18:35:13.868007 6 run_restore_controller.go:38] Starting CStorRestore controller
I0802 18:35:13.868019 6 run_restore_controller.go:41] Waiting for informer caches to sync
I0802 18:35:13.868022 6 run_replica_controller.go:39] Starting CStorVolumeReplica controller
I0802 18:35:13.868061 6 run_replica_controller.go:42] Waiting for informer caches to sync
I0802 18:35:13.868098 6 run_backup_controller.go:38] Starting CStorBackup controller
I0802 18:35:13.868117 6 run_backup_controller.go:41] Waiting for informer caches to sync
I0802 18:35:13.946730 6 run_pool_controller.go:45] Starting CStorPool workers
I0802 18:35:13.946931 6 run_pool_controller.go:51] Started CStorPool workers
I0802 18:35:13.968344 6 run_replica_controller.go:47] Starting CStorVolumeReplica workers
I0802 18:35:13.968441 6 run_replica_controller.go:54] Started CStorVolumeReplica workers
I0802 18:35:13.968490 6 run_restore_controller.go:46] Starting CStorRestore workers
I0802 18:35:13.968538 6 run_restore_controller.go:53] Started CStorRestore workers
I0802 18:35:13.968602 6 run_backup_controller.go:46] Starting CStorBackup workers
I0802 18:35:13.968689 6 run_backup_controller.go:53] Started CStorBackup workers
I0802 18:35:43.869876 6 handler.go:456] cStorPool pending: 48d3b2ba-b553-11e9-858e-54e1ad4a9dd4
I0802 18:35:43.869961 6 new_pool_controller.go:160] cStorPool Modify event : cstor-sparse-p8yp, 48d3b2ba-b553-11e9-858e-54e1ad4a9dd4
I0802 18:35:43.870552 6 event.go:221] Event(v1.ObjectReference{Kind:"CStorPool", Namespace:"", Name:"cstor-sparse-p8yp", UID:"48d3b2ba-b553-11e9-858e-54e1ad4a9dd4", APIVersion:"openebs.io/v1alpha1", ResourceVersion:"2070", FieldPath:""}): type: 'Normal' reason: 'Synced' Received Resource modify event
<b>I0802 18:35:44.905633 6 pool.go:93] Import command successful with true dontimport: false importattr: [import -c /tmp/pool1.cache -o cachefile=/tmp/pool1.cache cstor-48d3b2ba- b553-11e9-858e-54e1ad4a9dd4] out:</b>   
</div>

From the above highlighted logs, we can confirm `cstor-pool-mgmt` in new pod is communicating with `cstor-pool` in old pod as first highlighted log says `cstor pool found` then next highlighted one says pool is really `imported`.

**Possible Reason:**

When a cstor pool pod is deleted there are high chances that two cstor pool pods of same pool can present i.e old pool pod will be in `Terminating` state(which means not all the containers completely terminated) and new pool pod will be in `Running` state(might be few containers are in running state but not all). In this scenario `cstor-pool-mgmt` container in new pool pod is communicating with `cstor-pool` in old pool pod.  This can cause CVR resource to set to `Invalid`.

**Note:** This issue has observed in all OpenEBS versions up to 1.2.

**Resolution:**

Edit the `Phase` of cStorVolumeReplica (cvr) from `Invalid` to `Offline`. After few seconds CVR will be `Healthy` or `Degraded` state depends on rebuilding progress.


<h3><a class="anchor" aria-hidden="true" id="cstor-volume-read-only"></a>cStor volume become read only state</h3>

Application mount point running on cStor volume went into read only state.

**Possible Reason:**

 If `cStorVolume` is `Offline` or corresponding target pod is unavailable for more than 120 seconds(iSCSI timeout) then the PV will be mounted as `read-only` filesystem. For understanding different states of cStor volume, more details can be found [here](/docs/next/kb.html#verification-of-cStor-storage-volume).

**Troubleshooting**

Check the status of corresponding cStor volume using the following command:
```
kubectl get cstorvolume -n <openebs_installed_namespace> -l openebs.io/persistent-volume=<PV_NAME>
```

If cStor volume exists in `Healthy` or `Degraded` state then restarting of the application pod alone will bring back cStor volume to `RW` mode. If cStor volume exists in `Offline`, reach out to <a href="/docs/next/support.html" target="_blank">OpenEBS Community</a> for assistance. 

<hr>
<h3><a class="anchor" aria-hidden="true" id="pools-volume-offline"></a>cStor pools, volumes are offline and pool manager pods are stuck in pending state</h3>
The cStor pools and volumes are offline, the pool manager pods are stuck in a <code>pending</code> state, as shown below:

``` 
$ kubectl get po -n openebs -l app=cstor-pool
```
Sample Output:
```
NAME                               READY   STATUS    RESTARTS   AGE
cstor-cspc-chjg-85f65ff79d-pq9d2   0/3     Pending   0          16m
cstor-cspc-h99x-57888d4b5-kh42k    0/3     Pending   0          15m
cstor-cspc-xs4b-85dbbbb59b-wvhmr   0/3     Pending   0          18m
```
One such scenario that can lead to such a situation is, when the nodes have been scaled down and then scaled up. This results in nodes coming up with a different hostName and node name, i.e, the nodes that have come up are new nodes and not the same as previous nodes that existed earlier. Due to this, the disks that were attached to the older nodes now get attached to the newer nodes.


<b>Troubleshooting</b><br>
To bring cStor pool back to online state carry out the below mentioned steps,

1. **Update validatingwebhookconfiguration resource's failurePolicy**: <br>
      Update the <code>validatingwebhookconfiguration</code> resource's failure policy to <code>Ignore</code>. It would be previously set to <code>Fail</code>. This informs the kube-APIServer to ignore the error in case cStor admission server is not reachable.
      To edit, execute:
      ```
      $ kubectl edit validatingwebhookconfiguration openebs-cstor-validation-webhook
      ```
      Sample Output with updated <code>failurePolicy</code>
      ```
       kind: ValidatingWebhookConfiguration
       metadata:
         name: openebs-cstor-validation-webhook
         ...
         ...
       webhooks:
       - admissionReviewVersions:
         - v1beta1
       failurePolicy: Fail
         name: admission-webhook.cstor.openebs.io
       ...
       ...

      ```

2. **Scale down the admission**:<br>
     
     The openEBS admission server needs to be scaled down as this would skip the validations performed by cStor admission server when CSPC spec is updated with new node details.
     ```
     $ kubectl scale deploy openebs-cstor-admission-server -n openebs --replicas=0
     ```
     Sample Output:
     ```
     deployment.extensions/openebs-cstor-admission-server scaled
     ```

3. **Update the CSPC spec nodeSelector**:<br>
      The <code>CStorPoolCluster</code> needs to be updated with the new <code>nodeSelector</code> values. The updated CSPC now points to the new nodes instead of the old nodeSelectors.

      Update <code>kubernetes.io/hostname</code> with the new values.

      Sample Output:
```
apiVersion: cstor.openebs.io/v1
kind: CStorPoolCluster
metadata:
  name: cstor-cspc
  namespace: openebs
spec:
  pools:
    - nodeSelector:
        kubernetes.io/hostname: "ip-192-168-25-235"
      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: "blockdevice-798dbaf214f355ada15d097d87da248c"
      poolConfig:
        dataRaidGroupType: "stripe"
    - nodeSelector:
        kubernetes.io/hostname: "ip-192-168-33-15"
      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: "blockdevice-4505d9d5f045b05995a5654b5493f8e0"
      poolConfig:
        dataRaidGroupType: "stripe"
    - nodeSelector:
        kubernetes.io/hostname: "ip-192-168-75-156"
      dataRaidGroups:
      - blockDevices:
          - blockDeviceName: "blockdevice-c783e51a80bc51065402e5473c52d185"
      poolConfig:
        dataRaidGroupType: "stripe"
```
To apply the above configuration, execute:

```
$ kubectl apply -f cspc.yaml
``` 
5. **Update nodeSelectors, labels and NodeName**:
    
    Next, the CSPI needs to be updated with the correct node details. 
     Get the node details on which the previous blockdevice was attached and after fetching node details update hostName, nodeSelector values and <code>kubernetes.io/hostname</code> values in labels of CSPI with new details.
     To update, execute:
     ```
    kubectl edit cspi <cspi_name> -n openebs
     ```
    
    **NOTE**: The same process needs to be repeated for all other CSPIs which are in pending state and belongs to the updated CSPC.

6. **Verification**:<br>
      On successful implementation of the above steps, the updated CSPI generates an event,  <b>pool is successfully imported</b> which verifies the above steps have been completed successfully. 

      ```
      kubectl describe cspi cstor-cspc-xs4b -n openebs
      ```
      Sample Output:
      ```
      ...
      ...
      Events:
        Type    Reason         Age    From               Message
        ----    ------         ----   ----               -------
        Normal  Pool Imported  2m48s  CStorPoolInstance  Pool Import successful: cstor-07c4bfd1-aa1a-4346-8c38-f81d33070ab7
      ```
7. **Scale-up the cStor admission server and update validatingwebhookconfiguration**:<br>
      This brings back the cStor admission server to running state. As well as admission server is required to validate the modifications made to CSPC API in future.
      ```
       $ kubectl scale deploy openebs-cstor-admission-server -n openebs --replicas=1
      ```

    Sample Output:

      ```
       deployment.extensions/openebs-cstor-admission-server scaled
      ```

    Now, update the <code>failurePolicy</code> back to <code>Fail</code> under validatingwebhookconfiguration. To edit, execute:

    ```
    $ kubectl edit validatingwebhookconfiguration openebs-cstor-validation-webhook
    ```
    Sample Output:
    ```
     validatingwebhookconfiguration.admissionregistration.k8s.io/openebs-cstor-validation-webhook edited
    ```
<hr>

<h3><a class="anchor" aria-hidden="true" id="pool-operation-hung"></a>Pool Operation hung due to Bad Disk</h3>


cStor scans all the devices on the node while it tries to import the pool in case there is a pool manager pod restart. Pool(s) are always imported before creation. 
On pool creation all of the devices are scanned and as there are no existing pool(s), a new pool is created. Now, when the pool is created the participating devices are cached for faster import of the pool (in case of pool manager pod restart). If the import utilises cache then this issue won't be hit but there is a chance of import without cache (when the pool is being created for the first time)

In such cases where pool import happens without cache file and if any of the devices(even the devices that are not part of the cStor pool) is bad and is not responding the command issued by cStor keeps on waiting and is stuck. As a result of this, pool manager pod is not able to issue any more command in order to reconcile the state of cStor pools or even perform the IO for the volumes that are placed on that particular pool.

**Troubleshooting**<br>
 This might be encountered because of one of the following situations:

1. The device that has gone bad is actually a part of the cStor pool on the node. In such cases, Block device replacement needs to be done, the detailed steps to it can be found <a href="/docs/next/ugcstor-csi.html#a-class-anchor-aria-hidden-true-id-performance-tunings-in-cstor-pools-a-performance-tunings-in-cstor-pools" target="_blank">here</a>.

**Note**: Block device replacement is not supported for stripe raid configuration. Please visit this link for some use cases and solutions.

2. The device that has gone bad is not part of the cStor pool on the node. In this case, removing the bad disk from the node and restarting the pool manager pod with fix the problem.
<br>
<br>
<hr>
<h3><a class="anchor" aria-hidden="true" id="volume-migration-pool-lost"></a>Volume Migration when the underlying cStor pool is lost</h3>

<h4>Scenarios that can result in losing of cStor pool(s):</h4>

  - If the node is lost.
  - If one or more disks participating in the cStor pool are lost. This occurs when the pool configuration is set to stripe.
  - If all the disks participating in any raid group are lost. This occurs when the pool configuration is set to mirror.
  - If the cStor pool configuration is raidz and more than 1 disk in any raid group is lost.
  - If the cStor pool configuration is raidz2 and more than 2 disks in any raid group are lost.
  
  This situation is often encountered in Kubernetes clusters that have autoscale feature enabled and nodes scale down and scale-up.

 If the volume replica that resided on the lost pool was configured in high availability mode then the volume replica can be migrated to a new cStor pool.

 **NOTE**:The CStorVolume associated to the volume replicas have to be migrated should be in Healthy state. 
<br><br>
  <b>STEP 1:</b><br>
  **Remove the cStorVolumeReplicas from the lost pool**:

  To remove the pool the <code>CStorVolumeConfig</code> needs to updated. The <code>poolName</code> for the corresponding pool needs to be removed from <code>replicaPoolInfo</code>. This ensures that the admission server accepts the scale down request.

 **NOTE**: Ensure that the cstorvolume and target pods are in running state.

A sample CVC resource(corresponding to the volume) that has 3 pools.
```
...
...
  policy:
   provision:
    replicaAffinity: false
     replica: {}
     replicaPoolInfo:
     - poolName: cstor-cspc-4tr5 // This pool needs to be removed
     - poolName: cstor-cspc-xnxx
     - poolName: cstor-cspc-zdvk
...
...

```
Now edit the CVC and remove the desired poolName.

```
$ kubectl edit cvc pvc-81746e7a-a29d-423b-a048-76edab0b0826 -n openebs
```

```
...
...
  policy:
   provision:
    replicaAffinity: false
     replica: {}
     replicaPoolInfo:
     - poolName: cstor-cspc-xnxx
     - poolName: cstor-cspc-zdvk
...
...
```
From the above spec, <code>cstor-cspc-4tr5</code> CSPI entry is removed. This needs to be repeated for all the volumes which have cStor volume replicas on the lost pool. To get the list of volume replicas in lost pool, execute:

```
$ kubectl get cvr -n openebs -l cstorpoolinstance.openebs.io/name=<CSPI_name>
```

```
NAME                                                       USED   ALLOCATED   STATUS    AGE
pvc-81746e7a-a29d-423b-a048-76edab0b0826-cstor-cspc-bf9h   6K     6K          Healthy   4m7s
```

<b>STEP 2:</b><br>

**Remove the finalizer from cStor volume replicas**

The CVRs need to be deleted from the etcd, this requires the <code>finalizer</code> under <code>cstorvolumereplica.openebs.io/finalizer</code> to be removed from the CVRs which were present on the lost cStor pool.

Usually, the finalizer is removed by pool-manager pod but as in this case the pod is not in running state hence manual intervention is required.

To get the list of CVRs, execute:
```
$ kubectl get cvr -n openebs
```
Sample Output:
```
NAME                                                       USED   ALLOCATED   STATUS    AGE
pvc-81746e7a-a29d-423b-a048-76edab0b0826-cstor-cspc-xnxx   6K     6K          Healthy   52m
pvc-81746e7a-a29d-423b-a048-76edab0b0826-cstor-cspc-zdvk   6K     6K          Healthy   52m
```

After this step, CStorVolume will scale down. To verify, execute:

```
$ kubectl describe cvc <pv_name> -n openebs
```
Sample Output:
```
Events:
Type     Reason                 Age    From                         Message
----     ------                 ----   ----                         -------
Normal   ScalingVolumeReplicas  6m10s  cstorvolumeclaim-controller  successfully scaled volume replicas to 2
```

**STEP 3:**<br>
**Remove the pool spec from CSPC belongs to lost node**

Next, the corresponding CSPC needs to be edited and the pool spec that belongs to the nodes, which no longer exists, needs to be removed. To edit the cspc, execute:

```
kubectl edit cspc <cspc_name> -n openebs
```
This updates the number of desired instances. 

To verify, execute:

```
$ kubectl get cspc -n openebs
```
Sample Output:
```
NAME         HEALTHYINSTANCES   PROVISIONEDINSTANCES   DESIREDINSTANCES   AGE
cstor-cspc   2                  3                      2                  56m
```

Since CSPI has pool protection finalizer i.e <code>openebs.io/pool-protection</code> the CSPC operator was unable to delete the CSPI. Due to this reason the count for provisioned instances still remains 3. 

To fix this <code>openebs.io/pool-protection</code> finalizer must be removed from the CSPI that was present on the lost node.

To edit, execute:
```
kubectl edit cspi  <cspi_name>
```
After the finalizer is removed the CSPI count goes to the desired number.

```
$ kubectl get cspc -n openebs
NAME         HEALTHYINSTANCES   PROVISIONEDINSTANCES   DESIREDINSTANCES   AGE
cstor-cspc   2                  2                      2                  68m
```

**STEP 4:**<br>
**Scale the cStorVolumeReplicas back to the original number**


Scale the CStorVolumeReplicas back to the desired number on new or existing cStor pool where a volume replica of the same volume doesn't exist. 

NOTE: A CStorVolume is a collection of 1 or more volume replicas and no two replicas of a CStorVolume should reside on the same CStorPoolInstance. CStorVolume is a custom resource and a logical aggregated representation of all the underlying cStor volume replicas for this particular volume.

To get the list of cspi execute:
```
$ kubectl get cspi -n openebs
```
Sample Output:
```
NAME             HOSTNAME           ALLOCATED  FREE   CAPACITY  READONLY  PROVISIONEDREPLICAS  HEALTHYREPLICAS  TYPE    STATUS  AGE
cstor-cspc-bf9h  ip-192-168-49-174  230k       9630M  9630230k  false     0                    0                stripe  ONLINE  66s
```

Next, add the newly created CStorPoolInstance under CVC.Spec
In this example we are adding, <code>cstor-cspc-bf9h </code>

To edit, execute:
```
$ kubectl edit cvc pvc-81746e7a-a29d-423b-a048-76edab0b0826 -n openebs
```
Sample YAML:
```
...
...
spec:
 policy:
  provision:
   replicaAffinity: false
  replica: {}
  replicaPoolInfo:
  - poolName: cstor-cspc-bf9h
  - poolName: cstor-cspc-xnxx
  - poolName: cstor-cspc-zdvk
...
...

```

The same needs to be repeated for all the scaled down cStor volumes.
Next, verify the status of the new CStorVolumeReplica(CVR) that are provisioned.

To get the list of CVR, execute:
```
$ kubectl get cvr -n openebs
```
Sample Output:
```
NAME                                                       USED   ALLOCATED   STATUS    AGE
pvc-81746e7a-a29d-423b-a048-76edab0b0826-cstor-cspc-bf9h   6K     6K          Healthy   11m
pvc-81746e7a-a29d-423b-a048-76edab0b0826-cstor-cspc-xnxx   6K     6K          Healthy   96m
pvc-81746e7a-a29d-423b-a048-76edab0b0826-cstor-cspc-zdvk   6K     6K          Healthy   96m

```
To get the list of cspi, execute:

```
$ kubectl get cspi -n openebs
```
Sample Output:
```
NAME              HOSTNAME            ALLOCATED  FREE   CAPACITY  READONLY  PROVISIONEDREPLICAS  HEALTHYREPLICAS  TYPE    STATUS  AGE
cstor-cspc-bf9h  ip-192-168-49-174    230k       9630M  9630230k  false     1                    1                stripe  ONLINE  66s
cstor-cspc-xnxx   ip-192-168-79-76    101k       9630M  9630101k  false     1                    1                stripe  ONLINE  4m25s
cstor-cspc-zdvk   ip-192-168-29-217   98k        9630M  9630098k  false     1                    1                stripe  ONLINE  4m25s

```
## See Also:

### [FAQs](/docs/next/faq.html)

### [Seek support or help](/docs/next/support.html)

### [Latest release notes](/docs/next/releases.html)

<br>
<hr>
<br>

