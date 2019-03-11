---
id: mayactl
title: Mayactl
sidebar_label: Mayactl
---
------

The `mayactl` is the command line tool for interacting with OpenEBS volumes and Pools. The  `mayactl` is not used or required while provisioning or managing the OpenEBS volumes, but it is currently used while debugging and troubleshooting.  OpenEBS volume and pool status can be get using the mayactl command.



## Summary

Command used with mayactl

Accesssing mayactl

Using mayactl



Accesssing mayactl

For getting access to mayactl command line tool, you will have to login / execute into the maya-apiserver pod on Kubernetes. The steps are outlined below.

1. Find out the name of the maya-apiserver

   ```
   kubectl get pods -n openebs | grep -i maya-apiserver
   ```

   Following is an example output

   ```
   maya-apiserver-7bc857bb44-wm2g4              1/1       Running   0          4h
   ```

2. It is possible that there are multiple instances of maya-apiserver pods for scaling purposes. You can run mayactl in any one of them. Pick one of the pods using ` kubectl exec` command . You can do as following way.

   ```
   kubectl exec -it <maya-apiserver-podname> /bin/bash  -n openebs
   ```

   You will get access to the bash shell of maya-apiserver pod like shown below.

   `bash-4.3# ` 



<br>

## See Also:



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
