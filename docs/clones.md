---
id: clones
title: Creating Clone From Snapshot
sidebar_label: Clones
---

------
## Cloning and Restoring a Snapshot 

After creating a snapshot, you can restore it to a new Persitent Volume Claim. To do this you must create a special StorageClass implemented by snapshot-provisioner. We will then create a PersistentVolumeClaim referencing this StorageClass for dynamically provisioning new PersistentVolume. An annotation on the PersistentVolumeClaim will inform snapshot-provisioner on where to find the information it needs to deal with the OpenEBS Apiserver to restore the snapshot. 

A StorageClass can be defined as below. Here the provisioner field defines which provisioner should be used and what parameters should be passed to that provisioner when dynamic provisioning is invoked.

Such Storage Class is necessary for restoring a Persistent Volume from already created Volume Snapshot and Volume Snapshot Data.

You can use `$ vi restore-storageclass.yaml` to create the yaml and add the below entries.

```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: snapshot-promoter
provisioner: volumesnapshot.external-storage.k8s.io/snapshot-promoter
```

`annotations:` snapshot.alpha.kubernetes.io/snapshot: the name of the Volume Snapshot that will be restored.
`storageClassName:` Storage Class created by the admin for restoring Volume Snapshots.

Once the restore-storageclass.yaml is created, you have to deploy the yaml by using the below command.

```
$ kubectl apply -f restore-storageclass.yaml
```

We can now create a PersistentVolumeClaim that will use the StorageClass to dynamically provision a PersistentVolume that contains the info of our snapshot. Please create yaml that will delpoy  a PersistentVolumeClaim  using the below entries.  Use `$ vi restore-pvc.yaml` command to create the yaml and then add the below entries to the yaml.

```
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: demo-snap-vol-claim
  annotations:
    snapshot.alpha.kubernetes.io/snapshot: snapshot-demo
spec:
  storageClassName: snapshot-promoter
  accessModes: ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
```

Once the restore-pvc.yaml is created ,  you have to deploy the yaml by using the below command.

```
$ kubectl apply -f restore-pvc.yaml
```

Let’s finally mount the “demo-snap-vol-claim” PersistentVolumeClaim into a percona-snapsot Pod to see that the snapshot was restored properly. While deploying the percona-snapshot Pod you have to edit the deplyment yaml and mention the restore PersistentVolumeClaim name, volume name and volume mount accordingly. Please find the below example for your reference. You can create a yaml by using the command `$ vi percona-openebs-deployment-2.yaml` and add the below entries.

```
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: percona2
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
              name: demo-snap-vol1
      volumes:
        - name: demo-snap-vol1
          persistentVolumeClaim:
            claimName: demo-snap-vol-claim
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

 Once restore-storageclass.yaml is created, you have to deploy the yaml by using the below command.

```
$ kubectl apply -f percona-openebs-deployment-2.yaml
```

After percona-snapshot pod is in running state we can check the integrity of files which were created earlier before taking the snapshot. 

## Deleting a Snapshot

You can delete snapshot you have taken which will also delete the corresponding Volume Snapshot Data resource from Kubernetes. The following command will delete the *snapshot.yaml* file.

```
kubectl apply -f snapshot.yaml
```

This will not affect any `PersistentVolumeClaims` or `PersistentVolumes` you have already provisioned using the snapshot. On the other hand, deleting any `PersistentVolumeClaims` or `PersistentVolumes` that you have used to take a snapshot or have been provisioned using a snapshot will not delete the snapshot from the OpenEBS backend. You have to delete them manually. 




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
