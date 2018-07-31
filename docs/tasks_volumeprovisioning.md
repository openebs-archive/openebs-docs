---
id: tasks_volumeprovisioning
title: OpenEBS tasks around provisioning of volumes
sidebar_label: Volume provisioning
---
------

## Specify volume size

## Specify number of  replicas

## Increase  number of  Jiva replicas

## Move the data to another cluster

## Move the replicas to another node

## Permanently delete volume data

## Expanding the Jiva Storage Volumes

You can resize/expand the OpenEBS volume using the following procedure.                                                     

1. Obtain iSCSI target and disk details using the following command.

  ```
  iscsiadm -m session -P 3
  Target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2 (non-flash)
          Current Portal: 10.106.254.221:3260,1
          Persistent Portal: 10.106.254.221:3260,1                  
          Attached scsi disk sdb          State: running
  ```


2. Check the mount path on disk sdb using the following command.

  ```
  mount | grep /dev/sdb | more
  /dev/sdb on /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.106.254.221:3260-iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-lun-0 type ext4 (rw,relatime,data=ordered)
  /dev/sdb on /var/lib/kubelet/pods/8de04c10-64a3-11e8-994b-000c2959d9a2/volumes/kubernetes.io~iscsi/pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2 type ext4 (rw,relatime,data=ordered)
  ```


3. Unmount the file system using the following command.

  ```
  umount /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.106.254.221:3260-iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-lun-0
  umount /var/lib/kubelet/pods/8de04c10-64a3-11e8-994b000c2959d9a2/volumes/kubernetes.io~iscsi/pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2
  ```


4. Logout from the iSCSI target using the following command.

```
iscsiadm -m node -u
Logging out of session [sid: 1, target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2, portal: 10.106.254.221,3260]
Logout of [sid: 1, target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2, portal: 10.106.254.221,3260] successful
```

5. Get the volume ID using the following command.

  ```
  curl http://10.106.254.221:9501/v1/volumes

  {"data":[{"actions":{"revert":"http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==?action=revert","shutdown":"http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==?action=shutdown","snapshot":"http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==?action=snapshot"},"id":"**cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==**","links":{"self":"http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg=="},"name":"pvc-8de2f9e7-64a3-11e8-994b000c2959d9a2","replicaCount":1,"type":"volume"}],"links":{"self":"http://10.106.254.221:9501/v1/volumes"},"resourceType":"volume","type":"collection"}
  ```


6. Modify the volume capacity using the following command. 

  ```
  syntax:curl -H "Content-Type: application/json" -X POST -d '{"name":"<volname>","size":"<size>"}' http://<target ip>:9501/v1/volumes/<id>?action=resize

  curl -H "Content-Type: application/json" -X POST -d '{"name":"pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2","size":"7G"}' http://10.106.254.221:9501/v1/volumes/cHZjLThkZTJmOWU3LTY0YTMtMTFlOC05OTRiLTAwMGMyOTU5ZDlhMg==?action=resize
  ```


7. Restart the replicas. You must delete all the replicas of a pod using a single command. In the example given below, Percona is running with a single replica.

  ```
  kubectl get pods
  NAME                                                             READY     STATUS    RESTARTS   AGE
  maya-apiserver-9679b678-n79bz                                    1/1       Running   0          3h
  openebs-provisioner-55ff5cd67f-lgwh2                             1/1       Running   0          3h
  percona                                                          1/1       Running   0          3h
  pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-ctrl-75bf7d6bdd-wg2gk   2/2       Running   0          3h
  pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-rep-5f4d48987c-rmdbq    1/1       Running   0          3h

   kubectl delete pod pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-rep-5f4d48987c-rmdbq

    pod "pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2-rep-5f4d48987c-rmdbq" deleted

  ```


8. Log in to the target using the following commands. 

```
 iscsiadm -m discovery -t st -p 10.106.254.221:326
  10.106.254.221:3260,1 iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2

  iscsiadm -m node -T iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2 -p 10.106.254.221:3260 -l
  Logging in to [iface: default, target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2, portal: 10.106.254.221,3260] (multiple)
  Login to [iface: default, target: iqn.2016-09.com.openebs.jiva:pvc-8de2f9e7-64a3-11e8-994b-000c2959d9a2, portal: 10.106.254.221,3260] successful.
```

9. Check the file system consistency using the following command. sdc is the device after logging.

```
e2fsck -f /dev/sdc
```


10. Expand the file system using the following command.

```
 resize2fs /dev/sdc
```


11. Mount the file system using the following command.

```
mount /dev/sdc /var/lib/kubelet/plugins/kubernetes.io/iscsi/iface-default/10.99.197.30:3260-iqn.2016-09.com.openebs.jiva:pvc-3d6eb5dd-6893-11e8-994b-000c2959d9a2-lun-0

mount /dev/sdc /var/lib/kubelet/pods/3d71c842-6893-11e8-994b-000c2959d9a2/volumes/kubernetes.io~iscsi/pvc-3d6eb5dd-6893-11e8-994b-000c2959d9a2
```


12. Restart the application pod using the following command.

```
kubectl delete pod percona-b98f87dbd-nqssn
```


13. Application pod must be in running state and you can use the resized volume. 



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
