---
id: minio
title: OpenEBS for Minio
sidebar_label: Minio
---
------

<img src="/docs/assets/o-minio.png" alt="OpenEBS and Minio" style="width:400px;">

## Introduction

Minio is an object storage server released under Apache License v2.0.  It is best suited for storing unstructured data such as photos, videos, log files, backups and container / VM images. Size of an object can range from a few KBs to a maximum of 5TB. In this solution , running a Minio server pod which consumes OpenEBS cStor volume to store these type of data as object storage in a kubernetes cluster.



## Deployment model



## Configuration workflow

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Connect to MayaOnline (Optional)** : Connecting the Kubernetes cluster to [MayaOnline](https://staging-docs.openebs.io/docs/next/app.mayaonline.io) provides good visibility of storage resources. MayaOnline has various **support options for enterprise customers**.

3. **Configure cStor Pool**

   After OpenEBS installation, cStor pool has to be configured.If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below. During cStor Pool creation, make sure that the maxPools parameter is set to >=4. If cStor pool is already configured, go to the next step. 

4. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on given cStor pool. StorageClass is the interface through which most of the OpenEBS storage policies are defined. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes.  Since Minio is a deployment, it requires high availability of data. So cStor voume `replicaCount` is >=4. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStoveVolume Replica count as 4 is provided in the configuration details below.

5. **Configure PVC** 

    Minio needs only one volume to store the data with a replication factor of 4. See **minio-pv-claim.yaml** below.

6. **Launch and test Minio**

   Created a sample `minio.yaml` file in the Configuration details section. This can be applied to deploy Minio Object storage with OpenEBS. Run `kubectl apply -f minio.yaml` to see Minio running. Otherwise you can use stable minio image with helm to deploy Minio in your cluster using the following command.

   ```
   helm install --set accessKey=minio,secretKey=minio123 --storage-class=openebs-cstor-disk stable/minio
   ```

   For more information on configuring more services to be monitored, see Minio [documentation](https://docs.minio.io/docs/deploy-minio-on-kubernetes).


## Reference at [openebs.ci](https://openebs.ci/)

A live deployment of Minio using OpenEBS volumes as highly available object storage can be seen at the website [www.openebs.ci](https://openebs.ci/)

Deployment YAML spec files for Minio and OpenEBS resources are found [here]()

[OpenEBS-CI dashboard of Minio]()

[Live access to Minio dashboard]()



## Post deployment Operations

**Monitor OpenEBS Volume size**

It is not seamless to increase the cStor volume size (refer to the roadmap item). Hence, it is recommended that sufficient size is allocated during the initial configuration. However, an alert can be setup for volume size threshold using MayaOnline.

**Monitor cStor Pool size**

As in most cases, cStor pool may not be dedicated to just Minio Object storage alone. It is recommended to watch the pool capacity and add more disks to the pool before it hits 80% threshold.



## Best Practices:

**Maintain volume replica quorum always**

**Maintain cStor pool used capacity below 80%**



## Troubleshooting Guidelines

**Read-Only volume**

**Snapshots were failing**



## Configuration details

**openebs-config.yaml**

```
#Use the following YAMLs to create a cStor Storage Pool.
# and associated storage class.
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  poolSpec:
    poolType: striped
  # NOTE - Appropriate disks need to be fetched using `kubectl get disks`
  #
  # `Disk` is a custom resource supported by OpenEBS with `node-disk-manager`
  # as the disk operator
# Replace the following with actual disk CRs from your cluster `kubectl get disks`
# Uncomment the below lines after updating the actual disk names.
  disks:
    diskList:
# Replace the following with actual disk CRs from your cluster from `kubectl get disks`
#   - disk-184d99015253054c48c4aa3f17d137b1
#   - disk-2f6bced7ba9b2be230ca5138fd0b07f1
#   - disk-806d3e77dd2e38f188fdaf9c46020bdc
#   - disk-8b6fb58d0c4e0ff3ed74a5183556424d
#   - disk-bad1863742ce905e67978d082a721d61
#   - disk-d172a48ad8b0fb536b9984609b7ee653
---
```

**openebs-sc-disk.yaml**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
      - name: ReplicaCount
        value: "4"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
---
```

**minio-pv-claim.yaml**

```
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: minio-pv-claim
  labels:
    app: minio-storage-claim
spec:
  storageClassName: openebs-cstor-disk
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50G
---
```

**minio.yaml**

```
# For k8s versions before 1.9.0 use apps/v1beta2  and before 1.8.0 use extensions/v1beta1
apiVersion: apps/v1beta2 
kind: Deployment
metadata:
  # This name uniquely identifies the Deployment
  name: minio-deployment
spec:
  selector:
    matchLabels:
      app: minio
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        # Label is used as selector in the service.
        app: minio
    spec:
      # Refer to the PVC 
      volumes:
      - name: storage
        persistentVolumeClaim:
          # Name of the PVC created earlier
          claimName: minio-pv-claim
      containers:
      - name: minio
        # Pulls the default Minio image from Docker Hub
        image: minio/minio:latest
        args:
        - server
        - /storage
        env:
        # Minio access key and secret key
        - name: MINIO_ACCESS_KEY
          value: "minio"
        - name: MINIO_SECRET_KEY
          value: "minio123"
        ports:
        - containerPort: 9000
          hostPort: 9000
        # Mount the volume into the pod
        volumeMounts:
        - name: storage # must match the volume name, above
          mountPath: "/home/username"
---
apiVersion: v1
kind: Service
metadata:
  name: minio-service
spec:
  type: LoadBalancer
  ports:
    - port: 9000
      nodePort: 32701
      protocol: TCP
  selector:
    app: minio
  sessionAffinity: None
  type: NodePort
```

<br>

## See Also:



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
