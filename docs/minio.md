---
id: minio
title: Using OpenEBS to build Minio object storage on Kubernetes
sidebar_label: Minio
---
------

<img src="/docs/assets/o-minio.png" alt="OpenEBS and Prometheus" style="width:400px;">

## Introduction

Minio is an object storage server released under Apache License v2.0.  It is best suited for storing unstructured data such as photos, videos, log files, backups and container / VM images. Size of an object can range from a few KBs to a maximum of 5TB. In this solution , running a Minio server pod which consumes OpenEBS cStor volume to store the data in a kubernetes cluster.

## Requirements

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

   If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). If cStor pool is already configured, go to the next step. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below.

3. **Create Storage Class**

   You must configure a StorageClass to provision cStor volume on cStor pool. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the [Configure StoragePool](/docs/next/configurepools.html) section. Since Minio is a deployment, it requires high availability of data. So cStor voume `replicaCount` is 3. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStoveVolume Replica count as 3 is provided in the configuration details below.

## Deployment of Minio with OpenEBS 

Sample Minio deployment YAML is provided in the Configuration below. Create a YAML file called **minio.yaml** and add the YAML content from **minio.yaml** provided in the Configuration Details section.

Apply the **minio.yaml** using the below command .

```
kubectl apply -f minio.yaml
```

**Verify Minio Pods**

Run the following to get the status of Minio pods.

```
kubectl get pods
```

Following is an example output.

```
NAME                                READY     STATUS    RESTARTS   AGE
minio-deployment-64d7c79464-wldr5   1/1       Running   0          54s
```

**Verify Minion Services**

Run the following to get the service details of Minio pods.

```
kubectl get svc
```

Following is an example output.

```
NAME            TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
kubernetes      ClusterIP   10.15.240.1     <none>        443/TCP          14m
minio-service   NodePort    10.15.250.174   <none>        9000:32701/TCP   1m
```

## Verify Successful Deployment of Minio 

The minio is deployed with Node port service. So the Minio service can be accessed using External IP of one of the Node and corresponding service port. You can get the Node details using following command.

```
kubectl get nodes -o wide
```

Following is an example output.

```
NAME                                           STATUS    ROLES     AGE       VERSION         EXTERNAL-IP      OS-IMAGE             KERNEL-VERSION    CONTAINER-RUNTIME
gke-ranjith-minio-default-pool-b4985804-0qp7   Ready     <none>    14m       v1.11.6-gke.2   35.188.69.194    Ubuntu 18.04.1 LTS   4.15.0-1023-gcp   docker://17.3.2
gke-ranjith-minio-default-pool-b4985804-ff07   Ready     <none>    14m       v1.11.6-gke.2   104.154.176.87   Ubuntu 18.04.1 LTS   4.15.0-1023-gcp   docker://17.3.2
gke-ranjith-minio-default-pool-b4985804-kcvv   Ready     <none>    14m       v1.11.6-gke.2   35.192.103.51    Ubuntu 18.04.1 LTS   4.15.0-1023-gcp   docker://17.3.2
```

External IP of one of the Node is  35.188.69.194 . You can access minio object storage using 35.188.69.194:32701.

![Home](/docs/assets/Home.PNG)

You can enter access key as "minio" and Secret Key as "minio123".

![home_key](/docs/assets/Home1.PNG)

You can create a bucket from the "+" button showing in the left bottom side.

![bucket](/docs/assets/bucket.PNG)

You can upload a file using "upload" button.

![uplaod-button](/docs/assets/Upload_button.PNG)

You can verify if the file is uploaded.

![finalfile](/docs/assets/Uploaded.PNG)

## Best Practices:



## Troubleshooting Guidelines



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
        value: "3"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
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
      storage: 10G
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
