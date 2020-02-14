---
id: uninstall
title: Uninstalling OpenEBS
sidebar_label: Uninstall
---
------

This section is to describe about the graceful deletion/uninstall of your OpenEBS cluster. OpenEBS cluster has three different storage engine, cStor,Local PV and Jiva. The deletion for the data from the disks after this operation is different for these storage Engines. 

## Uninstall OpenEBS Gracefully

The recommended steps to uninstall the OpenEBS cluster gracefully is as follows.

- Delete all the OpenEBS PVCs that were created. You can check the status of PVC using the following command. 

  ```
  kubectl get pvc -n <namespace>
  ```

  There should not have any entries of OpenEBS PVC.

- Delete all the SPCs (In case of cStor storage engine).  You can check the status of SPC using the following command.

  ```
  kubectl get spc 
  ```

  There should not have any entries of OpenEBS SPC.

- Ensure that no OpenEBS volume or pool pods are in terminating state . You can check the running status of Pods using the following command.

  ```
  kubectl get pods -n <openebs namespace>
  ```

- Ensure that no `openebs` custom resources are present using the following command.

  ```
  kubectl get cvr -n <openebs namespace>
  ```

- Ensure to delete OpenEBS related `StorageClass`. You can check the status of OpenEBS related StorageClasses using the following command.

  ```
  kubectl get sc
  ```

- Delete the OpenEBS namespace either via `helm delete <chart name> --purge` if helm version is v2 or `helm uninstall <chart name> -n <namespace>` if helm version is v3 or `kubectl delete ns openebs` or you can delete the corresponding `openebs-operator` YAML using `kubectl delete -f <openebs-operator.yaml>`. You can check the status of OpenEBS namespace using the following command.

  ```
  kubectl get ns
  ```

- Uninstalling the OpenEBS doesn't automatically delete the CRDs that were created. If you would like to completely remove the CRDs and the associated objects, run the following commands:

  ```
  kubectl delete crd castemplates.openebs.io
  kubectl delete crd cstorpools.openebs.io
  kubectl delete crd cstorpoolinstances.openebs.io
  kubectl delete crd cstorvolumeclaims.openebs.io
  kubectl delete crd cstorvolumereplicas.openebs.io
  kubectl delete crd cstorvolumes.openebs.io
  kubectl delete crd runtasks.openebs.io
  kubectl delete crd storagepoolclaims.openebs.io
  kubectl delete crd storagepools.openebs.io
  kubectl delete crd volumesnapshotdatas.volumesnapshot.external-storage.k8s.io
  kubectl delete crd volumesnapshots.volumesnapshot.external-storage.k8s.io
  kubectl delete crd disks.openebs.io
  kubectl delete crd blockdevices.openebs.io
  kubectl delete crd blockdeviceclaims.openebs.io
  kubectl delete crd cstorbackups.openebs.io
  kubectl delete crd cstorrestores.openebs.io
  kubectl delete crd cstorcompletedbackups.openebs.io
  kubectl delete crd cstorpoolclusters.openebs.io
  kubectl delete crd upgradetasks.openebs.io
  ```



## Deletion of Jiva Volumes

As part of deleting the Jiva Volumes - OpenEBS launches scrub jobs for clearing the data from the nodes.  This job will be running in OpenEBS installed namespace. The completed jobs need to be cleared using the following command.

```
kubectl delete jobs -l openebs.io/cas-type=jiva -n <openebs_namespace>
```

In addition, the job is set with a TTL to get cleaned up, if the cluster version is greater than 1.12. However, for the feature to work, the alpha feature needs to be enabled in the cluster. More information can be read from [here](https://kubernetes.io/docs/concepts/workloads/controllers/jobs-run-to-completion/#clean-up-finished-jobs-automatically).

<br>

## See Also:

### [FAQ](/docs/next/faq.html)

### [Troubleshooting](/docs/next/troubleshooting.html)

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
