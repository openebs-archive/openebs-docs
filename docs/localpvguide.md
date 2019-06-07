---
id: openebslocalpv
title: OpenEBS Local PV 
sidebar_label: OpenEBS Local PV user guide
---
------

A local PV represents a mounted local storage device such as a disk or a hostpath (or subpath) directory.  Local PVs are an extension to hostpath volumes, but are more secure. 

OpenEBS Dynamic Local PV provisioner will help provisioning the Local PVs dynamically by integrating into the features offered by OpenEBS Node Storage Device Manager, and also offers the flexibility to either select a complete storage device or a hostpath (or subpath) directory.

<br>

## Use case of OpenEBS Local PV 

Local PVs are great in the following cases where 

* The Stateful Workload can take care of replicating the data across the nodes to handle cases like a complete node (and/or its storage) failure.

*  Only require higher performance from the underlying storage, close to what is served by raw IOs on the disk. 

* For long running Stateful workloads, the Backup/Recovery is provided by Operators/tools that can make use the workload mounts and do not require the capabilities to be available in the underlying storage

*  If the hostpaths are created on external storage like EBS/GPD, administrator have tools that can periodically take snapshots/backups.

<br>

## Prerequisites

Kubernetes 1.12 or higher is required to use OpenEBS Local PV.

</br>

## OpenEBS Local PV

OpenEBS Local PV can be provisioned by using two ways.

* With a hostpath (or subpath) directory.
* With a mounted disk

The default StorageClass for both type of OpenEBS Local PV will be created after applying latest OpenEBS operator YAML. The default StorageClass name for using hostpath is `openebs-hostpath`. The default StorageClass name for using mounted disk is `openebs-hostdevice`.



<h3><a class="anchor" aria-hidden="true" id="storaegclass-based-hostpath"></a>StorageClass for Local PV Based on hostpath</h3>



<h3><a class="anchor" aria-hidden="true" id="storaegclass-based-disk"></a>StorageClass for Local PV Based on Disk</h3>



<h3><a class="anchor" aria-hidden="true" id="configure-hostpathr"></a>Configure hostpath</h3>

The default hostpath is configured as `/var/openebs/local`,  which can either be changed during the OpenEBS operator install by passing in the `OPENEBS_IO_BASE_PATH` ENV parameter to the Local PV dynamic provisioner or via the StorageClass. The example for both approaches are showing below.

<h4><a class="anchor" aria-hidden="true" id="using-openebs-opeartor"></a>Using OpenEBS operator YAML</h3>

The example of changing the ENV variable to the Local PV dynamic provisioner in the operator YAML. This has to be done before applying openebs operator YAML file.

```
name: OPENEBS_IO_BASE_PATH
value: “/mnt/”
```

<h4><a class="anchor" aria-hidden="true" id="using-storageclass"></a>Using StorageClass</h3>

The Example for changing the Basepath via StorageClass

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-hostpath
  annotations:
    openebs.io/cas-type: local
    cas.openebs.io/config: |
      # (Default)
      - name: BasePath
        value: "/var/openebs/local"
provisioner: openebs.io/local
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
```

Apply the above StorageClass configuration after making the necessary changes and use this StorageClass name in the corresponding PVC specification to provision application on OpenEBS Local PV volume.

Verify if the StorageClass is created using the following command.

```
kubectl get sc
```

<br>

## Provision OpenEBS Local PV Volumes

Once the storage class is created, provision the volumes using the standard PVC interface. In the example below, the StorageClass `openebs-hostpath` is specified in the `PersistentVolumeClaim` specification. 

**Percona example**

```
---
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: percona
  labels:
    name: percona
spec:
  replicas: 1
  selector: 
    matchLabels:
      name: percona 
  template: 
    metadata:
      labels: 
        name: percona
    spec:
      securityContext:
        fsGroup: 999
      tolerations:
      - key: "ak"
        value: "av"
        operator: "Equal"
        effect: "NoSchedule"
      containers:
        - resources:
            limits:
              cpu: 0.5
          name: percona
          image: percona
          args:
            - "--ignore-db-dir"
            - "lost+found"
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: k8sDem0
          ports:
            - containerPort: 3306
              name: percona
          volumeMounts:
            - mountPath: /var/lib/mysql
              name: demo-vol1
      volumes:
        - name: demo-vol1
          persistentVolumeClaim:
            claimName: demo-vol1-claim
---
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-vol1-claim
spec:
  storageClassName: openebs-hostpath
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5G
---
apiVersion: v1
kind: Service
metadata:
  name: percona-mysql
  labels:
    name: percona-mysql
spec:
  ports:
    - port: 3306
      targetPort: 3306
  selector:
      name: percona
```

Run the application using the following command. In this example, the file name save as `demo-percona-mysql-pvc.yaml`

```
kubectl apply -f demo-percona-mysql-pvc.yaml
```

The Percona application now runs using the OpenEBS local PV volume.

</br>

<h4><a class="anchor" aria-hidden="true" id="verify-local-pv-pod"></a>Verify OpenEBS Local PV Pods</h3>

The OpenEBS Local PV can be verified below. The following command will get the details of PVC created using OpenEBS Local PV provisioner.

```
kubectl get pvc -n <openebs namespace>
```

The following command will get the details of PV created using OpenEBS Local PV provisioner.

```
kubectl get pv
```

</br>

## Roadmap

OpenEBS Local PV dynamic provisioner is introduced as a beta feature in the current release and work is underway to integrate this feature with the Device Management capabilities of OpenEBS Node (Storage) Device Manager.

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
