---
id: t-cstor
title: Troubleshooting OpenEBS - cStor
sidebar_label: cStor
---
------

<font size="5">General guidelines for troubleshooting</font>

- Contact <a href="/v240/docs/next/support.html" target="_blank">OpenEBS Community</a> for support.
- Search for similar issues added in this troubleshootiung section.
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>
<hr>
<br>

[One of the cStorVolumeReplica(CVR) will have its status as `Invalid` after corresponding pool pod gets recreated](#CVR-showing-status-as-invalid-after-poolpod-gets-recreated)

[cStor volume become read only state](#cstor-volume-read-only)

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

**Note:** This issue has observed in all OpenEBS versions upto 1.2.

**Resolution:**

Edit the `Phase` of cStorVolumeReplica (cvr) from `Invalid` to `Offline`. After few seconds CVR will be `Healthy` or `Degraded` state depends on rebuilding progress.


<h3><a class="anchor" aria-hidden="true" id="cstor-volume-read-only"></a>cStor volume become read only state</h3>

Application mount point running on cStor volume went into read only state.

**Possible Reason:**

 If `cStorVolume` is `Offline` or corresponding target pod is unavailable for more than 120 seconds(iSCSI timeout) then the PV will be mounted as `read-only` filesystem. For understanding different states of cStor volume, more details can be found [here](/v240/docs/next/kb.html#verification-of-cStor-storage-volume).

**Troubleshooting**

Check the status of corresponding cStor volume using the following command:
```
kubectl get cstorvolume -n <openebs_installed_namespace> -l openebs.io/persistent-volume=<PV_NAME>
```

If cStor volume exists in `Healthy` or `Degraded` state then restarting of the application pod alone will bring back cStor volume to `RW` mode. If cStor volume exists in `Offline`, reach out to <a href="/v240/docs/next/support.html" target="_blank">OpenEBS Community</a> for assistance. 

<hr>
<br>
<br>

## See Also:

### [FAQs](/v240/docs/next/faq.html)

### [Seek support or help](/v240/docs/next/support.html)

### [Latest release notes](/v240/docs/next/releases.html)

<br>
<hr>
<br>

