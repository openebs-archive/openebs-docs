# cStor

## When to use cStor

If you have an application that needs high availability for data and resiliency more than speed.
 
## set up a cStor storage class
​
1. Install OpenEBS
2. Identify disks to use
3. Create a StoragePoolClaim matching those disks
4. Create a StorageClass matching that claim

### 0. Read the docs!
* https://docs.openebs.io/docs/next/ugcstor.html
* https://docs.openebs.io/docs/next/casengines.html
** https://docs.openebs.io/docs/next/uglocalpv.html
** https://docs.openebs.io/docs/next/jivaguide.html

### 1. Install OpenEBS

#### Always check your context!
* `kubectl config get-contexts`
* `kubectl config use-context CONTEXT_NAME`

#### And maybe check to see if OpenEBS is present:
* `kubectl get ns openebs`

#### Pull down and inspect the operator manifest:

* `wget https://openebs.github.io/charts/openebs-operator.yaml`

Setup disk filters for Node Disk Manager if needed (you may want to
ignore some devices).  You can search for the 'exclude' line, and
update the comma-separated list of device node paths:

"exclude":"loop,/dev/fd0,/dev/sr0,/dev/ram,/dev/dm-"

#### Install OpenEBS:

* `kubectl apply -f openebs-operator.yaml`

#### And watch it come up:

* `kubectl get pods -n openebs -w`

### 2. Identify disks to use

* `kubectl get bd -n openebs`

e.g.:
```
bmath@timesink:~/maya/gitlab/cStor-examples$ kubectl get bd -A
NAMESPACE   NAME                                           NODENAME                       SIZE           CLAIMSTATE   STATUS   AGE
openebs     blockdevice-4367569c506a7b757738fdaa7d50030d   ip-10-0-129-7.ec2.internal     107374182400   Unclaimed    Active   3d14h
openebs     blockdevice-7567bc6317a14b1ee331ed34dc0218b2   ip-10-0-129-177.ec2.internal   107374182400   Unclaimed    Active   3d14h
openebs     blockdevice-8bf90bb7b0fc09345455a02dfe484e61   ip-10-0-130-168.ec2.internal   107374182400   Unclaimed    Active   3d14h
openebs     blockdevice-c6fe90dbb3847e4b6aafd21368d226d3   ip-10-0-129-177.ec2.internal   107374182400   Unclaimed    Active   2d21h
openebs     blockdevice-ca534d050ab5ae496ef453da3a3d6508   ip-10-0-130-168.ec2.internal   107374182400   Unclaimed    Active   2d21h
openebs     blockdevice-f2504cf77338ed627d1a3ace17dbd107   ip-10-0-129-7.ec2.internal     107374182400   Unclaimed    Active   2d21h
openebs     sparse-03e1e22d44920c227e13c3addba97dce        ip-10-0-129-7.ec2.internal     10737418240    Unclaimed    Active   3d14h
openebs     sparse-194f6ec2ef83d4b190af5fc668de4ca1        ip-10-0-129-177.ec2.internal   10737418240    Unclaimed    Active   3d14h
openebs     sparse-4f250c1ebd3e97388fd70d3f1f840fa4        ip-10-0-131-74.ec2.internal    10737418240    Unclaimed    Active   3d14h
openebs     sparse-6f87133d72f57d8817aa920e1ff3cc2d        ip-10-0-130-168.ec2.internal   10737418240    Unclaimed    Active   3d14h
```
In the preceeding note some sparse devs are present.  In this case these are the operating system disks (I can tell this by the device size)

### 3. Create a cStor StoragePoolClaim

Like so:
```
kind: StoragePoolClaim
apiVersion: openebs.io/v1alpha1
metadata:
  name: cstor
  annotations:
    cas.openebs.io/config: |
      - name: PoolResourceRequests
        value: |-
          memory: 2Gi
      - name: PoolResourceLimits
        value: |-
          memory: 4Gi
spec:
  name: cstor
  type: disk
  poolSpec:
    poolType: striped
  blockDevices:
    blockDeviceList:
      - blockdevice-4367569c506a7b757738fdaa7d50030d
      - blockdevice-7567bc6317a14b1ee331ed34dc0218b2
      - blockdevice-8bf90bb7b0fc09345455a02dfe484e61
      - blockdevice-c6fe90dbb3847e4b6aafd21368d226d3
      - blockdevice-ca534d050ab5ae496ef453da3a3d6508
      - blockdevice-f2504cf77338ed627d1a3ace17dbd107
```

Note the 2G memory request.  If you don't have 2-4G to dedicate to
your cloud native storage controller, but you want replication, take a
look at Jiva (https://docs.openebs.io/docs/next/jivaguide.html).  If
you don't need replication, use OpenEBS LocalPV
(https://docs.openebs.io/docs/next/uglocalpv.html).

### 4. Create a cStor StorageClass

```
---
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: cstor
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor"
      - name: ReplicaCount
        value: "3"
    storageclass.kubernetes.io/is-default-class: 'true'
provisioner: openebs.io/provisioner-iscsi
```

* Note the StoragePoolClaim value matches the name of the
StoragePoolClaim we've created.

* Note also the ReplicaCount of 3, indicating that we'll create cstor
pods on 3 nodes to redundantly data of this class.

* And we're making this the default storage class for new claims.

### 5. Use your new default cStor StorageClass!

`helm install minio helm/minio`
`kubectl get pvc minio`
