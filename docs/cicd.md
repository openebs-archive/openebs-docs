---
id: cicd
title: OpenEBS use case - CI/CD
sidebar_label: Snapshots in CI/CD 
---

------


## Problem Statement

Application developers of containerized applications rely on the development ecosystem for agility. CI/CD is part of the eco-system that enables applications to be tested through various pipelines (CI) and deployed into production automatically (CD) at the end of successful CI. Many of these containerized applications are stateful in nature, databases in most cases, go through state changes while being tested in the CI pipeline stages. When one of the stages of pipeline fails, developers would like to reproduce the state of the stateful application for further debugging. DevOps admins need a solution where preserving the state of the application at each stage of the pipeline is very easy and seamlessly integrated into the CI/CD platforms such as Jenkins using the API. 

## OpenEBS solution

OpenEBS provides a perfect solution for this problem. OpenEBS has integrated the snapshot capabilities into Kubernetes way of taking stateful application snapshots and provides a snapshot provisioner to reproduce the state of the application from a given snapshot. 



![CI/CD pipeline for Developers](/docs/assets/cicd-snapshots.png)



DevOps admin integrates Jenkins/Travis/other CI-CD systems to provision and take snapshot as shown above. At the end of CI pipeline, the OpenEBS volume and all the snapshots are deleted/destroyed. Once CD is done, DevOps admin configures the OpenEBS volume such that periodic snapshots are taken and preserved.

```
apiVersion: volumesnapshot.external-storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: snapshot-demo
  namespace: default
spec:
  persistentVolumeClaimName: demo-vol1-claim
```

The following command creates the snapshot named snapshot-demo.  

```
$ cd e2e/ansible/playbooks/feature/snapshots/kubectl_snapshot
$ kubectl apply -f snapshot.yaml
volumesnapshot "snapshot-demo" created
$ kubectl get volumesnapshot 
NAME            AGE 
snapshot-demo   18s

```



When a stage of CI pipeline fails, the DevOps admin can easily restore the state of the stateful application and provide access to the application developer, most likely in an automated way. 



![Restoring the state of a stateful application](/docs/assets/snap-restore.png)



After a snapshot is created, it can be used to restore to a  new PVC. To do this we need to create a special StorageClass implemented by snapshot-provisioner. We will then create a PersistentVolumeClaim referencing this StorageClass for dynamically provision new PersistentVolume.  

You can use `$ vi restore-storageclass.yaml` to create the yaml and add the below entries.

```
kind: StorageClass
apiVersion: storage.k8s.io/v1
metadata:
  name: snapshot-promoter
provisioner: volumesnapshot.external-storage.k8s.io/snapshot-promoter
```

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

Finally mount the “demo-snap-vol-claim” PersistentVolumeClaim into a percona-snapsot Pod to see that the snapshot was restored properly. While deploying the percona-snapshot Pod you have to edit the deplyment yaml and mention the restore PersistentVolumeClaim name, volume name and volume mount accordingly. Please find the below example for your reference.



## Conclusion

With OpenEBS , developers and DevOps admin can easily and seamlessly automate the process of reproducing the status of a failed stateful application pipeline stage. 


## See Also

#### Learn more about how OpenEBS volumes work
#### Volume Policies of OpenEBS



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
