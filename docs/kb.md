---
id: kb
title: Knowledge Base
sidebar_label: Knowledge Base
---

------

<br>

## Summary

[How do I reuse an existing PV - after re-creating Kubernetes StatefulSet and its PVC](#)





## How do I reuse an existing PV - after re-creating Kubernetes StatefulSet and its PVC

There are some cases where it had to delete the StatefulSet and re-install a new StatefulSet. In the process you may have to delete the PVCs used by the StatefulSet and retain PV policy by ensuring the Retain as the "Reclaim Policy". In this case, following are the procedures for re-using an existing PV in your StatefulSet application.

1. Patch corresponding PV to retain the PV after deletion of PVC. This can be done by using the steps mentioned [here](https://kubernetes.io/docs/tasks/administer-cluster/change-pv-reclaim-policy/#why-change-reclaim-policy-of-a-persistentvolume).

2. Get the application Pod name by following command and note down the application pod name

   ```
   kubectl get pods -n <applicationnamespace> 
   ```

3. Get the PVC name by following command and note down the PVC name. You have to use this same PVC name while creating new PVC.
4. Get the PV name by following the command.

<br>

## See Also:

### [Creating cStor Pool](/docs/next/configurepools.html)

### [Provisioning cStor volumes](/docs/next/deploycstor.html)

### [BackUp and Restore](/docs/next/backup.html)

### [Uninstall](/docs/next/uninstall.html)

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
