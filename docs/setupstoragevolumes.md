---
id: setupstoragevolumes
title: Setting up Peristent Storage Volumes
sidebar_label: Storage Volumes
---

------

### Storage Volumes

A OpenEBS Volume comprises of a Target and Replica component. There can be one or more Replicas. The Replica component are the ones that access the underlying disk resources for storing the data. Storage volumes need to be persistent to the application.

OpenEBS storage provides several features that can be customized for each volume. Some of the features that could be customized per application are as follows:

- Number of replications
- Zone or node affinity
- Snapshot scheduling
- Volume expansion policy
- Replication policy


There are two type of storage volumes in OpenEBS.

```
Jiva storage volume 
Cstor storage volume
```


### Jiva Storage Volume


Jiva storage engine creates Jiva volume. By default, OpenEBS Jiva volume runs with 3 replica count.
This sample PVC yaml will use storage class openebs-jiva-default created as part of openebs-operator.yaml installation.

The sample pvc yaml file to create Jiva volume using the following command

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-jiva-default.yaml
```

Get the Jiva pvc details by running the following command.

```
kubectl get pvc
```

Get the Jiva pv details by running the following command.

```
kubectl get pv
```

This pvc name is used in application yaml to run application using OpenEBS Jiva volume.

Jiva volume can also be created dynamically.Following is the sample yaml for the same.

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
  storageClassName: openebs-jiva-default
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

### Cstor Storage Volume


Cstor storage engine creates Cstor volume. By default, OpenEBS cStor volume will be running with 3 replica count.
This sample PVC yaml will use storage class openebs-cstor-sparse created as part of openebs-operator.yaml installation.

This pvc yaml can be applied by running following command.

```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/pvc-standard-cstor-default.yaml
```

If you want to create cStor volume on cStor Pool created using external disks.The details can be found in this link.[Cstor vol](/docs/next/deploycstor.html)


Get the Cstor pvc details by running the following command.

```
kubectl get pvc
```

Get the Cstor pv details by running the following command.

```
kubectl get pv
```

This pvc name is used in application yaml to run application using OpenEBS cStor volume.

Cstor volume can also be created dynamically.Following is the sample yaml for the same.

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
  name: demo-cstor-vol1-claim
spec:
  storageClassName: openebs-cstor-sparse
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
