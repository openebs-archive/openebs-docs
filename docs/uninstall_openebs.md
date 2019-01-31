---
id: uninstall
title: Uninstall OpenEBS
sidebar_label: Uninstall OpenEBS
---

------

This section is to describe about the graceful deletion/uninstall of your OpenEBS cluster. OpenEBS cluster has two different storage engine,Jiva and cStor. The deletion for the data from the disks which are being used, after this operation is different for both of these storage Engine. 

## Uninstall OpenEBS Gracefully

The recommended steps to uninstall the OpenEBS cluster gracefully is as follows.

- Delete all the OpenEBS PVCs that were created. You can check the status of PVC using the following command

  ```
  kubectl get pvc
  ```

  There should not have any entries of OpenEBS PVC.

- Delete all the SPCs (In case of cStor storage engine)

  ```
  kubectl get spc -n openebs
  ```

  There should not have any entries of OpenEBS SPC.

- Ensure that no volume or pool pods are pending in terminating state . You can check the running status of Pods using the following command.

  ```
  kubectl get pods -n <openebs namespace>
  ```

- Delete the OpenEBS namespace either via helm purge or `kubectl delete ns openebs`.

- Uninstalling the OpenEBS doesn't automatically delete the CRDs that were created. If you would like to complete remove the CRDs and the associated objects, run the following commands:

  ```
  kubectl delete crd castemplates.openebs.io
  kubectl delete crd cstorpools.openebs.io
  kubectl delete crd cstorvolumereplicas.openebs.io
  kubectl delete crd cstorvolumes.openebs.io
  kubectl delete crd runtasks.openebs.io
  kubectl delete crd storagepoolclaims.openebs.io
  kubectl delete crd storagepools.openebs.io
  kubectl delete crd volumesnapshotdatas.volumesnapshot.external-storage.k8s.io
  kubectl delete crd volumesnapshots.volumesnapshot.external-storage.k8s.io
  ```

- As part of deleting the Jiva Volumes, OpenEBS launches scrub jobs for clearing the data from the nodes. The completed jobs need to be cleared using the following command.

  ```
  kubectl delete jobs -l openebs.io/cas-type=jiva -n <namespace>
  ```


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
