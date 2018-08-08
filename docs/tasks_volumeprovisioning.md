---
id: tasks_volumeprovisioning
title: OpenEBS tasks around provisioning of volumes
sidebar_label: Volume provisioning
---
------

## Specifying Volume Size

## Specifying Number of Replicas

## Increasing Number of Jiva Replicas

The following procedure must be performed for increasing number of replicas. You can scale up the Jiva replica online, if the current replica count is 2 or more. OpenEBS recommends you to perform the change with no load on the volume if current replica count is 1.

1. Get the current  Jiva replica count using the following command.

```
kubectl get deploy
```

The following output is displayed. In this example, it shows that current Jiva replica count is 1.

```
NAME                                            DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
pvc-564ae713-95fb-11e8-8754-42010a8000df-ctrl   1         1         1            1           19s
pvc-564ae713-95fb-11e8-8754-42010a8000df-rep    1         1         1            1           19s
```

2. Check the value of *REPLICATION_FACTOR* under environment variable in Jiva controller deployment using the following command.

```
kubectl get deploy <jiva_controller_deployment> -o yaml 
```

**Example:**

```
 kubectl get deploy pvc-564ae713-95fb-11e8-8754-42010a8000df-ctrl -o yaml
```

3. Update the value of REPLICATION_FACTOR under environmental variable by increasing one count from current value in Jiva deployment yaml using the following command.

```
kubectl edit deploy <jiva_controller_deployment>
```

**Example:**

```
kubectl edit deploy pvc-564ae713-95fb-11e8-8754-42010a8000df-ctrl
deployment "pvc-564ae713-95fb-11e8-8754-42010a8000df-ctrl" edited
```

4. Increase the Jiva replica count by 1 using the following command.

```
kubectl scale deployment <jiva_replica_deployment> --replicas=<new_count>
```

**Example:**

```
kubectl scale deploy pvc-564ae713-95fb-11e8-8754-42010a8000df-rep --replicas=2
deployment "pvc-564ae713-95fb-11e8-8754-42010a8000df-rep" scaled
```

The corresponding deployment is scaled. Repeat the procedure if you want to increase Jiva replica count further.

### Verifying if expanded replica is running

Get the number of running pods using following command.

```
kubectl get pods
```

The following output is displayed. The new replica is displayed as running.

```
NAME                                                             READY     STATUS    RESTARTS   AGE
percona                                                          1/1       Running   0          3m
pvc-564ae713-95fb-11e8-8754-42010a8000df-ctrl-7c8dcdf78c-85szs   2/2       Running   0          1m
pvc-564ae713-95fb-11e8-8754-42010a8000df-rep-688cc58bbf-qhb8c    1/1       Running   0          37s
pvc-564ae713-95fb-11e8-8754-42010a8000df-rep-688cc58bbf-rbxnw    1/1       Running   0          3m
```



## Decreasing  Number of Jiva Replicas

The following procedure must be performed for decreasing number of Jiva replicas. You can scale down the Jiva replica online, if the current replica count is 3 or more. OpenEBS recommends you to perform the change with no load on the volume if current replica count is 2.

Do the below steps from master.

1. Get the maya-apiserver pod name  using below command.

   ```
   kubectl get pods -n openebs
   ```

2. Do health check up of all replicas of particular volume using below command before doing the change.

   - [ ] Log in to maya-apiserver

     ```
     kubectl exec -it <maya-apiserver> bash -n openebs
     ```

     **Example:**

     ```
     kubectl exec -it maya-apiserver-dc8f6bf4d-ldl6b bash -n openebs
     ```


   - [ ] Get the volume list and put the required volume name in next step.

     ```
     mayactl volume list
     ```

   - [ ] Get the health of all replicas . All replicas Access Mode should be in RW mode.

     ```
     mayactl volume info --volname <volume_name>
     ```

   **Note:** Add namespace along with above commands if PVC is deployed in particular namespace.

3. Get the current Jiva replica count using the following command.

   ```
   kubectl get deploy
   ```

   The following output is displayed. In this example, it shows that current Jiva replica count is 3.

   ```
   NAME                                            DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
   percona                                         1         1         1            1           1m
   pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl   1         1         1            1           1m
   pvc-339754eb-9add-11e8-a167-067880c021ee-rep    3         3         3            3           1m
   ```

4. Check the value of *REPLICATION_FACTOR* under environment variable in Jiva controller deployment using the following command.

   ```
   kubectl get deploy <jiva_controller_deployment> -o yaml 
   ```

   **Example:**

   ```
   kubectl get deploy pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl -o yaml
   ```

5. Now, ssh to all the Nodes where the OpenEBS volume are mounted

6. Goto the directory where required volume is mounted

   ```
   cd /mnt/openebs_xvdd/<pvc_name>
   ```

   Example:

   ```
   cd /mnt/openebs_xvdd/pvc-339754eb-9add-11e8-a167-067880c021ee/
   ```

7. Edit the file **peer.details** with *ReplicaCount":<one number less>*

   `{"ReplicaCount":2,"QuorumReplicaCount":0}`  

   **Note:** Previously ReplicaCount was 3, Now it has modified to 2. Also,there should be only one count change from the existing replica number.

8. Repeat step 6 & 7 in other Nodes where OpenEBS volume are mounted.

   Do following operations from master Node

9. scale down the replica by reducing one count. Following command will help you to do this. 

   ```
   kubectl scale deployment <jiva_replica_deployment> --replicas=<one count less>
   ```

   **Example:**

   ```
   kubectl scale deployment pvc-339754eb-9add-11e8-a167-067880c021ee-rep --replicas=2
   ```

10. Check replica count from replica deployment by using below command

    ```
    kubectl get deploy
    ```

    The following output will be displayed. Here, Jiva replica count has changed from 3 to 2.

    ```
    NAME                                            DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
    percona                                         1         1         1            1           8m
    pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl   1         1         1            1           8m
    pvc-339754eb-9add-11e8-a167-067880c021ee-rep    2         2         2            2           8m
    ```

11. Update the value of REPLICATION_FACTOR under environmental variable by decreasing one count from current value in Jiva deployment yaml using the following command.

    ```
    kubectl edit deploy <jiva_controller_deployment>
    ```

    Then, modify below entry

    ```
      env:
      - name: REPLICATION_FACTOR
        value: "2"
    ```

    **Example:**

    ```
    kubectl edit deploy  pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl
    deployment "pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl" edited
    ```

12. After this change, new replica set for controller will be deployed and we need to clean up old controller replica set. Get the replica set using below command

    ```
    kubectl get rs
    ```

    The following output will be displayed.

    ```
    NAME                                                       DESIRED   CURRENT   READY     AGE
    percona-7f6bff67f6                                         1         1         1         10m
    pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl-545dd7cfc    1         1         1         1m
    pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl-7849d8f54b   0         0         0         10m
    pvc-339754eb-9add-11e8-a167-067880c021ee-rep-6cf4bcf886    2         2         2         10m
    ```

13. Now, delete previous Jiva controller replica set  using below command

    ```
    kubectl delete rs <old_jiva_controller_replicaset>
    ```

    **Example:**

    ```
    kubectl delete rs pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl-7849d8f54b
    replicaset "pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl-7849d8f54b" deleted
    ```

    Now, the scale down process is completed.Repeat the procedure if you want to decrease Jiva replica count further.

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
