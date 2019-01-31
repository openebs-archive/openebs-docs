---
id: tsgiscsi
title: iSCSI 
sidebar_label: iSCSI
---

------

## Issue:
**iSCSI login works from the host/node, but when you login from within the container, it fails.**

## Troubleshooting the issue and Workaround:
**If the following error occurs when you are trying to login from kubelet, then the issue is because of the difference in versions between the kubelet and the node.**
```
root@worker3:/# iscsiadm -m discovery -t st -p 10.43.21.74:3260
10.43.21.74:3260,1 iqn.2016-09.com.openebs.jiva:pvc-641131af-75e2-11e8-990b-9600000c0999
root@worker3:/# iscsiadm -m node -l -T iqn.2016-09.com.openebs.jiva:pvc-641131af-75e2-11e8-990b-9600000c0999 -p 10.43.21.74:3260
Logging in to [iface: default, target: iqn.2016-09.com.openebs.jiva:pvc-641131af-75e2-11e8-990b-9600000c0999, portal: 10.43.21.74,3260] (multiple)
iscsiadm: Could not login to [iface: default, target: iqn.2016-09.com.openebs.jiva:pvc-641131af-75e2-11e8-990b-9600000c0999, portal: 10.43.21.74,3260].
iscsiadm: initiator reported error (12 - iSCSI driver not found. Please make sure it is loaded, and retry the operation)
iscsiadm: Could not log into all portals
```
**You can use the following command to verify the issue.**
```
root@worker1 ~ # iscsiadm -V
iscsiadm version 2.0-873
root@worker1 ~ # sudo docker exec kubelet iscsiadm -V
iscsiadm version 2.0-874
```
**Remove iscsi from the host/node by using the following command.**
```
service iscsid stop
sudo apt remove open-iscsi
```
**The above command only removes iSCSI from the node, but iSCSI inside the kubelet will be running. Verify using the following command.**
```
root@worker1 ~ # iscsiadm -V
-bash: /usr/bin/iscsiadm: No such file or directory
root@worker1 ~ # ps -auxfwww | grep iscsi
root       660  0.0  0.0      0     0 ?        S<   16:34   0:00  \_ [iscsi_eh]
root     25460  0.0  0.0  12944  1032 pts/0    S+   17:27   0:00          \_ grep --color=auto iscsi
root@worker1 ~ # sudo docker exec kubelet iscsiadm -V
iscsiadm version 2.0-874
root@worker1 ~ # sudo docker exec kubelet ps -auxfwww | grep iscsid
root     25492  0.0  0.0  12944   924 pts/0    S+   15:27   0:00          \_ grep --color=auto iscsid
```

**The iSCSI login within kubelet will now be successful.**




<!-- Hotjar Tracking Code for https://docs.openebs.io -->
<script>


```
   (function(h,o,t,j,a,r){
   		h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
   		h._hjSettings={hjid:785693,hjsv:6};
   		a=o.getElementsByTagName('head')[0];
   		r=o.createElement('script');r.async=1;
   		r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
   		a.appendChild(r);
   })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
```


</script>

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
