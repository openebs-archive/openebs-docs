---
id: tasks_volumeprovisioning
title: OpenEBS tasks around provisioning of volumes
sidebar_label: Volume provisioning
---
------

## Increasing Number of Jiva Replicas

The following procedure must be performed for increasing number of replicas. You can increase the Jiva replica online if the current replica count is 2 or more. OpenEBS recommends you to perform the change with no load on the volume if current replica count is 1.

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

The corresponding deployment now displays that the Jiva replica count has increased. Repeat the procedure if you want to increase Jiva replica count further.

### Verifying if Expanded Replica is Running

Get the number of running pods using the following command.

```
kubectl get pods
```

The following output is displayed. The new replica state displays as running.

```
NAME                                                             READY     STATUS    RESTARTS   AGE
percona                                                          1/1       Running   0          3m
pvc-564ae713-95fb-11e8-8754-42010a8000df-ctrl-7c8dcdf78c-85szs   2/2       Running   0          1m
pvc-564ae713-95fb-11e8-8754-42010a8000df-rep-688cc58bbf-qhb8c    1/1       Running   0          37s
pvc-564ae713-95fb-11e8-8754-42010a8000df-rep-688cc58bbf-rbxnw    1/1       Running   0          3m
```


## Decreasing Number of Jiva Replicas

The following procedure must be performed for a decreasing number of Jiva replicas. You can decrease the Jiva replica online, if the current replica count is 3 or more. OpenEBS recommends you to perform the change with no load on the volume if current replica count is 2.

Perform the following steps 1 to 4 from master.

1. Get the maya-apiserver pod name using the following command.

```
kubectl get pods -n openebs
```
2. Perform health check for all replicas of a particular volume using the following command before updating.

- Log in to maya-apiserver.

  ```
  kubectl exec -it <maya-apiserver> bash -n openebs
  ```

  **Example:**

  ```
  kubectl exec -it maya-apiserver-dc8f6bf4d-ldl6b bash -n openebs
  ```

- Get the volume list and enter the required volume name in the next step.  

  ```
  mayactl volume list
  ```

- Get the health of all replicas. The Access Mode of all replicas must be in RW mode.

  ```
   mayactl volume info --volname <volume_name>
  ```

  **Note:** Add namespace along with above commands if PVC is deployed in a particular namespace.

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
   Perform the following steps from Nodes.

5. SSH to all Nodes where the OpenEBS volume is mounted.

6. Go to the directory where the required volume is mounted.

   ```
   cd /mnt/openebs_xvdd/<pvc_name>
   ```

   **Example:**

   ```
   cd /mnt/openebs_xvdd/pvc-339754eb-9add-11e8-a167-067880c021ee/
   ```

7. Edit the file **peer.details** with *ReplicaCount":<one number less>*

   `{"ReplicaCount":2,"QuorumReplicaCount":0}`  

   **Note:** Previously ReplicaCount was 3 and it is now modified to 2. Also, there should be only one count change from the existing replica number.

8. Repeat steps 6 and 7 in other Nodes where OpenEBS volume is mounted.

   Perform the following operations from the master Node.

9. Decrease replica count by reducing one count using the following command.

   ```
   kubectl scale deployment <jiva_replica_deployment> --replicas=<one count less>
   ```

   **Example:**

   ```
   kubectl scale deployment pvc-339754eb-9add-11e8-a167-067880c021ee-rep --replicas=2
   ```

10. Check replica count from replica deployment by executing the following command.

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

    Modify the following entry

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

12. After this change, new replica set for the controller will be deployed and you must clean up the old controller replica set. Get the replica set using the following command.

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

13. Delete the previous Jiva controller replica set using the following command.

    ```
    kubectl delete rs <old_jiva_controller_replicaset>
    ```

    **Example:**

    ```
    kubectl delete rs pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl-7849d8f54b
    replicaset "pvc-339754eb-9add-11e8-a167-067880c021ee-ctrl-7849d8f54b" deleted
    ```

    Now, decreasing the Jiva replica process is complete. Repeat the procedure if you want to decrease the count further.

## Verifying Jiva Replica Health Synchronization

You can verify the Jiva replica health synchronization by using the mayactl command. You must first find the name of maya-apiserver pod using the following command.

```
kubectl get pods -n openebs
```

The output will be similar to the following.

```
NAME                                       READY     STATUS    RESTARTS   AGE
maya-apiserver-dc8f6bf4d-c2cqh             1/1       Running   0          10m
openebs-provisioner-7b975bcd56-j2x7d       1/1       Running   0          10m
openebs-snapshot-operator-7f96fc56-h4w7h   2/2       Running   0          10m

```

Login to the maya-apiserver pod using the following command.

```
 kubectl exec -it maya-apiserver-dc8f6bf4d-c2cqh -n openebs bash
```

Execute the following command to get the volume list.

```
mayactl volume list
```

Get all the replica information of required volume using the following command.

```
mayactl volume info --volname pvc-7f00bc57-9bb7-11e8-a48f-0667b9b343d
```

The output will be similar to the following.

```
Name                                      Status
pvc-7f00bc57-9bb7-11e8-a48f-0667b9b343dc  Running
cash-4.3#  mayactl volume info --volname pvc-7f00bc57-9bb7-11e8-a48f-0667b9b343d

Portal Details :

IQN     :   iqn.2016-09.com.openebs.jiva:pvc-7f00bc57-9bb7-11e8-a48f-0667b9b343dc
Volume  :   pvc-7f00bc57-9bb7-11e8-a48f-0667b9b343dc
Portal  :   100.70.162.71:3260
Size    :   5G
Status  :   Running

Replica Details :

NAME                                                              ACCESSMODE      STATUS      IP             NODE

------

pvc-7f00bc57-9bb7-11e8-a48f-0667b9b343dc-rep-789c9958b9-84mqh     RW              Running     100.96.2.7     ip-172-20-38-252.us-west-2.compute.internal
pvc-7f00bc57-9bb7-11e8-a48f-0667b9b343dc-rep-789c9958b9-fb9v5     RW              Running     100.96.3.5     ip-172-20-41-104.us-west-2.compute.internal
pvc-7f00bc57-9bb7-11e8-a48f-0667b9b343dc-rep-789c9958b9-x8pjf     RW              Running     100.96.1.6     ip-172-20-45-220.us-west-2.compute.internal
```

Get the status and access mode of each replica from both the Nodes. Some access mode labels are NA, WO etc. **NA** means that Node is not running yet and **WO** means node has started replication after Node started running.

## Deploying Jiva Pods with Custom Namespace

Create the custom namespace if it is not existing in your cluster using the following command.

    kubectl create namespace <custom_namespace_name>

**Example:**

    kubectl create namespace app

Deploy your pvc yaml using the custom namespace using the following command.

    kubectl apply -f <pvc_yaml> -n <custom_namespace_name>

**Example:**

    kubectl apply -f percona-openebs-deployment.yaml -n app

The OpenEBS Jiva Pods and application will be created in the same custom namespace. You can check using the following command.

    kubectl get pods -n app

The following output will be displayed.

    NAME                                                             READY     STATUS    RESTARTS   AGE
    percona-7f6bff67f6-hw4ml                                         1/1       Running   0          1m
    pvc-579a6a9a-9bc9-11e8-a48f-0667b9b343dc-ctrl-6b598f7c6c-46dvx   2/2       Running   0          1m
    pvc-579a6a9a-9bc9-11e8-a48f-0667b9b343dc-rep-7c66dd6b84-7mh4m    1/1       Running   0          1m
    pvc-579a6a9a-9bc9-11e8-a48f-0667b9b343dc-rep-7c66dd6b84-xkc85    1/1       Running   0          1m
    pvc-579a6a9a-9bc9-11e8-a48f-0667b9b343dc-rep-7c66dd6b84-zw6vl    1/1       Running   0          1m

Check the pvc status by using the following command with custom namespace.

    kubectl get pvc -n app

The following output is displayed.

    demo-vol1-claim   Bound     pvc-579a6a9a-9bc9-11e8-a48f-0667b9b343dc   5G         RWO            openebs-percona   39s

## Expanding Jiva Storage Volumes

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


## Node Affinity for an Application

To know about node selector, see [scheduler](/docs/next/scheduler.html) section.

**Modifying the application yaml**

For scheduling application on required nodes, you must have labelled the nodes appropriately. For example, the nodes are labelled as `openebs: controlnode`. The same label must be added in the application yaml file. For example, in the mongo-statefulset.yml file, under spec section, you can add the following.

    nodeSelector:
       openebs: controlnode

**Example:**

Following is a mongo statefulset application yaml file with the above entry added.

    ---
    apiVersion: apps/v1beta1
    kind: StatefulSet
    metadata:
     name: mongo
    spec:
     serviceName: "mongo"
     replicas: 3
     template:
       metadata:
         labels:
           role: mongo
           environment: test
       spec:
         terminationGracePeriodSeconds: 10
         nodeSelector:
            openebs: controlnode
         containers:



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
