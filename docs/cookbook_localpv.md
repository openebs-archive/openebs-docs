# LocalPV (optionally With LVM)

## When to use cStor

If you have an application that needs speed above all else.

When using OpenEBS, LocalPV is the storage engine for speed. It does miss out on the many features of cStor, however, we can still have snapshots by using LVM. Thankfully, it's also rather easy to setup. If you do not have LVM  or do not want to use it, you can simply miss out step 2 entirely, although the BasePath in step 3's yaml will have to exist. In this guide, we will have some base assumptions:

* You are using Helm v2. If you have already upgraded to Helm 3, then please change to taste.
* You have a 'data drive' attached to the node on 'vdb' with one empty partition. If not, this will still work if you have LVM setup on your main drive, simply miss out steps 2.1 and 2.2 and use whichever volume group you have instead of 'data_vg'. 
​
1. Install OpenEBS
2. Setup LVM on one or all of the nodes
3. Create a StorageClass matching that claim


### 1. Install OpenEBS

```
helm install stable/openebs --name openebs --namespace openebs
```
### 2. Setup LVM on one or all of the nodes

* `pvcreate /dev/vdb1`
* `vgcreate data_vg /dev/vdb1`
* `lvcreate -L 10G -n data_lv data_vg`
* `mkfs.xfs /dev/data_vg/data_lv`
* `mkdir -p /usr/local/data_lv`
* `mount /dev/data_vg/data_lv /usr/local/data_lv`


### 3. Create a StorageClass

Apply the following yaml;
```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-hostpath
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      - name: BasePath
        value: "/usr/local/data_lv"
      - name: StorageType
        value: "hostpath"
provisioner: openebs.io/local
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```
