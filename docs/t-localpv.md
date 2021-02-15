---
id: t-localpv
title: Troubleshooting OpenEBS - Dynamic LocalPV
sidebar_label: LocalPV
---
------

<font size="5">General guidelines for troubleshooting</font>

- Contact <a href="/v250/docs/next/support.html" target="_blank">OpenEBS Community</a> for support.
- Search for similar issues added in this troubleshootiung section.
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>
<hr>
<br>

[LocalPV PVC in Pending state](#pvc-in-pending-state)

[Application pod using LocalPV device not coming into running state](#application-pod-stuck-pending-pvc)

[Stale BDC in pending state after PVC is deleted](#stale-bdc-after-pvc-deletion)

[BDC created by localPV in pending state](#bdc-by-localpv-pending-state)

<h3><a class="anchor" aria-hidden="true" id="pvc-in-pending-state"></a>PVC in Pending state</h3>
Created a PVC using localpv-device / localpv-hostpath storage class. But the PV is not created and PVC in Pending state.

**Troubleshooting:**
The default localpv storage classes from openebs have `volumeBindingMode: WaitForFirstConsumer`. This means that only when the application pod that uses the PVC is scheduled to a node, the provisioner will receive the volume provision request and will create the volume.

**Resolution:**
Deploy an application that uses the PVC and the PV will be created and application will start using the PV

<br>

<h3><a class="anchor" aria-hidden="true" id="application-pod-stuck-pending-pvc"></a>Application pod using LocalPV not coming into running state</h3>
Application pod that uses localpv device is stuck in `Pending` state with error 

```
Warning  FailedScheduling  7m24s (x2 over 7m24s)  default-scheduler  persistentvolumeclaim "<pvc-name>" not found
```


**Troubleshooting:**
Check if there is a blockdevice present on the node (to which the application pod was scheduled,) which mathces the capacity requirements of the PVC.

```
kubectl get bd -n openebs -o wide
```

If matching blockdevices are not present, then the PVC will never get Bound.

**Resolution:**
Schedule the application pod to a node which has a matching blockdevice available on it.

<br>

<h3><a class="anchor" aria-hidden="true" id="stale-bdc-after-pvc-deletion"></a>Stale BDC in pending state after PVC is deleted</h3>
```
kubectl get bdc -n openebs
```
shows stale `Pending` BDCs created by localpv provisioner, even after the corresponding PVC has been deleted.

**Resolution:**
LocalPV provisioner currently does not delete BDCs in Pending state if the corresponding PVCs are deleted. To remove the stale BDC entries,

1. Edit the BDC and remove the `- local.openebs.io/finalizer` finalizer
```
kubectl edit bdc <bdc-name> -n openebs
```

2. Delete the BDC
```
kubectl delete bdc <bdc-name> -n openebs
```

<br>

<h3><a class="anchor" aria-hidden="true" id="bdc-by-localpv-pending-state"></a>BDC created by localPV in pending state</h3>
The BDC created by localpv provisioner (bdc-pvc-xxxx) remains in pending state and PVC does not get Bound

**Troubleshooting:**
Describe the BDC to check the events recorded on the resource
```
kubectl describe bdc bdc-pvc-xxxx -n openebs
```

The following are different types of messages shown when the node on which localpv application pod is scheduled, does not have a blockdevice available.

1. No blockdevices found
```
Warning  SelectionFailed  14m (x25 over 16m)    blockdeviceclaim-operator  no blockdevices found
```
It means that there were no matching blockdevices after listing based on the labels. Check if there is any `block-device-tag` on the storage class and corresponding tags are available on the blockdevices also

2. No devices with matching criteria
```
Warning  SelectionFailed  6m25s (x18 over 11m)  blockdeviceclaim-operator  no devices found matching the criteria
```
It means that the there are no devices for claiming after filtering based on filesystem type and node name. Make sure the blockdevices on the node
have the correct filesystem as mentioned in the storage class (default is `ext4`)

3. No devices with matching resource requirements
```
Warning  SelectionFailed  85s (x74 over 11m)    blockdeviceclaim-operator  could not find a device with matching resource requirements
```
It means that there are no devices available on the node with a matching capacity requirement.

**Resolution**

To schedule the application pod to a node, which has the blockdevices available, a node selector can be used on the application pod. Here the node with hostname `svc1` has blockdevices available, so a node selector is used to schedule the pod to that node.

Example:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: pod1
spec:
  volumes:
  - name: local-storage
    persistentVolumeClaim:
      claimName: pvc1
  containers:
  - name: hello-container
    image: busybox
    command:
       - sh
       - -c
       - 'while true; do echo "`date` [`hostname`] Hello from OpenEBS Local PV." >> /mnt/store/greet.txt; sleep $(($RANDOM % 5 + 300)); done'
    volumeMounts:
    - mountPath: /mnt/store
      name: local-storage
  nodeSelector:
    kubernetes.io/hostname: svc1
```

<br>

<hr>
<br>
<br>

## See Also:

### [FAQs](/v250/docs/next/faq.html)

### [Seek support or help](/v250/docs/next/support.html)

### [Latest release notes](/v250/docs/next/releases.html)

<br>
<hr>
<br>

