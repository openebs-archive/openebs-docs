---
id: t-uninstall
title: Troubleshooting OpenEBS - Uninstall
sidebar_label: Uninstall
---
------
<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  OpenEBS Documentation is now migrated to https://openebs.io/docs. The page you are currently viewing is a static snapshot and will be removed in the upcoming releases. </strong></p></center>
<font size="5">General guidelines for troubleshooting</font>

- Contact <a href="/docs/next/support.html" target="_blank">OpenEBS Community</a> for support.
- Search for similar issues added in this troubleshooting section.
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>
<hr>
<br>

## Uninstall

[Whenever a Jiva PVC is deleted, a job will created and status is seeing as `completed`](#jiva-deletion-scrub-job)

[cStor Volume Replicas are not getting deleted properly](#cvr-deletion)

<br>
<hr>
<br>

<h3><a class="anchor" aria-hidden="true" id="jiva-deletion-scrub-job"></a>Whenever a Jiva based PVC is deleted, a new job gets created.</h3>


As part of deleting the Jiva Volumes, OpenEBS launches scrub jobs for clearing data from the nodes. This job will be running in OpenEBS installed namespace. The completed jobs can be cleared using following command.

```
kubectl delete jobs -l openebs.io/cas-type=jiva -n <openebs_namespace>
```

In addition, the job is set with a TTL to get cleaned up, if the cluster version is greater than 1.12. However, for the feature to work, the alpha feature needs to be enabled in the cluster. More information can be read from [here](https://kubernetes.io/docs/concepts/workloads/controllers/jobs-run-to-completion/#clean-up-finished-jobs-automatically).



<h3><a class="anchor" aria-hidden="true" id="cvr-deletion"></a>cStor Volume Replicas are not getting deleted properly</h3>


Sometimes, there are chances that cStor volumes Replicas (CVR) may not be deleted properly if some unforeseen scenarios happened such as network loss during the deletion of PVC. To resolve this issue, perform the following command.

```
kubectl edit cvr <cvr_name> -n openebs
```

And then remove finalizers from the corresponding CVR. Need to remove following entries and save it.

```
finalizers:
- cstorvolumereplica.openebs.io/finalizer
```

This will automatically remove the pending CVR and delete the cStor volume completely.


<br>
<hr>
<br>

## See Also:

### [FAQs](/docs/next/faq.html)

### [Seek support or help](/docs/next/support.html)

### [Latest release notes](/docs/next/releases.html)

<br>
<hr>
<br>

