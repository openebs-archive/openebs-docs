---
id: uglocalpv
title: OpenEBS Local PV User Guide
sidebar_label: Local PV
---
------

A local PV represents a mounted local storage device such as a disk or a hostpath (or subpath) directory.  Local PVs are an extension to hostpath volumes, but are more secure. 

OpenEBS Dynamic Local PV provisioner will help provisioning the Local PVs dynamically by integrating into the features offered by OpenEBS Node Storage Device Manager, and also offers the flexibility to either select a complete storage device or a hostpath (or subpath) directory.

<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>Prerequisites</h2>

Kubernetes 1.12 or higher is required to use OpenEBS Local PV.

<br>

<font size="5">User operations</font>

[Provision OpenEBS Local PV based on hostpath](#Provision-OpenEBS-Local-PV-based-on-hostpath)

[Provision OpenEBS Local PV based on Device](#Provision-OpenEBS-Local-PV-based-on-Device)



<font size="5">Admin operations</font>

[General Verification of disk mount status for Local PV based on device](#General-verification-for-disk-mount-status-for-Local-PV-based-on-device)

[Configure hostpath](#configure-hostpath)





<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations</h2>

<br>

<h3><a class="anchor" aria-hidden="true" id="Provision-OpenEBS-Local-PV-based-on-hostpath"></a>Provision OpenEBS Local PV based on hostpath</h3>

The simplest way to provision an OpenEBS Local PV based on hotspath is to use the default StorageClass for hostapth which is created as part of latest 1.0.0-RC1 operator YAML. The default StorageClass name for hostpath configuration is `openebs-hostpath`. The default hostapth is configured as `/var/openebs/local`.

The following is the sample deployment configuration of Percona application which is going to consume OpenEBS Local PV. For utilizing default OpenEBS Local PV based on hostpath, use StorageClass name as `openebs-hostpath` in the PVC spec of the Percona deployment.

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

Run the application using the following command. In this example, the above configuration YAML spec is saved as `demo-percona-mysql-pvc.yaml`

```
kubectl apply -f demo-percona-mysql-pvc.yaml
```

The Percona application now runs using the OpenEBS local PV volume on hostpath. Verify the application running status using the following command.

```
kubectl get pod
```

The output will be similar to the following.

<div class="co">NAME                       READY   STATUS    RESTARTS   AGE
percona-7b64956695-hs7tv   1/1     Running   0          21s</div>

Verify the PVC status using the following command.

```
kubectl get pvc
```

The output will be similar to the following.

<div class="co">NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
demo-vol1-claim   Bound    pvc-2e4b123e-88ff-11e9-bc28-42010a8001ff   5G         RWO            openebs-hostpath   28s</div>

Verify the PV status using the following command.

```
kubectl get pv
```

The output will be similar to the following.

<div class="co">NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS       REASON   AGE
pvc-2e4b123e-88ff-11e9-bc28-42010a8001ff   5G         RWO            Delete           Bound    default/demo-vol1-claim   openebs-hostpath            22s</div>



<h3><a class="anchor" aria-hidden="true" id="Provision-OpenEBS-Local-PV-based-on-Device"></a>Provision OpenEBS Local PV based on Device</h3>

The simplest way to provision an OpenEBS Local PV based on Device is to use the default StorageClass for Local PV based on device which is created as part of latest 1.0.0-RC1 operator YAML. The default StorageClass name for based on Device configuration is `openebs-device`. 

The following is the sample deployment configuration of Percona application which is going to consume OpenEBS Local PV based on Device. For utilizing default OpenEBS Local PV based device, use StorageClass name as `openebs-device` in the PVC spec of the Percona deployment.

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
  storageClassName: openebs-device
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

Run the application using the following command. In this example, the above configuration YAML spec is saved as `demo-percona-mysql-pvc.yaml`

```
kubectl apply -f demo-percona-mysql-pvc.yaml
```

The Percona application now runs using the OpenEBS local PV volume on device. Verify the application running status using the following command.

```
kubectl get pod
```

The output will be similar to the following.

<div class="co">NAME                       READY   STATUS    RESTARTS   AGE
percona-7b64956695-lnzq4   1/1     Running   0          46s</div>

Verify the PVC status using the following command.

```    
kubectl get pvc
```

The output will be similar to the following.

<div class="co">NAME              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS     AGE
demo-vol1-claim   Bound    pvc-d0ea3a06-88fe-11e9-bc28-42010a8001ff   5G         RWO            openebs-device   38s</div>

Verify the PV status using the following command.

```    
kubectl get pv
```

The output will be similar to the following.

<div class="co">NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                     STORAGECLASS     REASON   AGE
pvc-d0ea3a06-88fe-11e9-bc28-42010a8001ff   5G         RWO            Delete           Bound    default/demo-vol1-claim   openebs-device            35s</div>

<br>

<hr>

<h2><a class="anchor" aria-hidden="true" id="admin-operations"></a>Admin Operations</h2>

<br>

<h3><a class="anchor" aria-hidden="true" id="General-verification-for-disk-mount-status-for-Local-PV-based-on-device"></a>General Verification of disk mount status for Local PV based on device</h3>

The application can be provisioned using OpenEBS Local PV based on device. The general check need to be done about the status of disk is the following.

* The disks should be already attached and mounted to the nodes.

* Verify that mount path are configured for disk using the following command. Blockdevice(BD) name can be get using `kubectl get blockdevice -n <openebs_installed_namespace>`

  ```
  kubectl get bd -o yaml -n openebs <blockdevice-name>
  ```

  If the disk is mounted with a file system, then the output will be similar to the following.

  <div class="co">filesystem:
      fsType: ext4
      mountPoint: /mnt/disks/ssd0</div>

  

<h3><a class="anchor" aria-hidden="true" id="configure-hostpath"></a>Configure hostpath</h3>

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
        value: "/mnt/"
provisioner: openebs.io/local
volumeBindingMode: WaitForFirstConsumer
reclaimPolicy: Delete
```

Apply the above StorageClass configuration after making the necessary changes and use this StorageClass name in the corresponding PVC specification to provision application on OpenEBS Local PV volume.

Verify if the StorageClass is having the updated hostpath using the following command and verify the `value` is set properly for the `BasePath` config value.

```
kubectl describe sc openebs-hostpath
```



<br>

## See Also:



### [Understand OpenEBS Local PVs ](/docs/next/localpv.html)


### [Node Disk Manager](/docs/next/ugndm.html)


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
