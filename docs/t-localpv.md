---
id: t-localpv
title: Troubleshooting OpenEBS - Dynamic LocalPV
sidebar_label: LocalPV
---
------

<font size="5">General guidelines for troubleshooting</font>

- Contact <a href="/docs/next/support.html" target="_blank">OpenEBS Community</a> for support.
- Search for similar issues added in this troubleshootiung section.
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>

<br>
<hr>
<br>

[LocalPV PVC in Pending state](#pvc-in-pending-state)

[Application pod using LocalPV device not coming into running state](#application-pod-stuck-pending-pvc)

[Stale BDC in pending state after PVC is deleted](#stale-bdc-after-pvc-deletion)


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

<hr>
<br>
<br>

## See Also:

### [FAQs](/docs/next/faq.html)

### [Seek support or help](/docs/next/support.html)

### [Latest release notes](/docs/next/releases.html)

<br>
<hr>
<br>

