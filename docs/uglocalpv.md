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

[General Verification for disk mount status for Local PV based on device](#General-verification-for-disk-mount-status-for-Local-PV-based-on-device)

[Configure hostpath](#configure-hostpath)





<h2><a class="anchor" aria-hidden="true" id="user-operations"></a>User Operations</h2>

<br>

<h3><a class="anchor" aria-hidden="true" id="Provision-OpenEBS-Local-PV-based-on-hostpath"></a>Provision OpenEBS Local PV based on hostpath</h3>





<h3><a class="anchor" aria-hidden="true" id="Provision-OpenEBS-Local-PV-based-on-Device"></a>Provision OpenEBS Local PV based on Device</h3>



<br>

<hr>

<h2><a class="anchor" aria-hidden="true" id="admin-operations"></a>Admin Operations</h2>

<br>

<h3><a class="anchor" aria-hidden="true" id="General-verification-for-disk-mount-status-for-Local-PV-based-on-device"></a>General Verification for disk mount status for Local PV based on device</h3>

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
