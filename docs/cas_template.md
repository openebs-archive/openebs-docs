---
id: castemplate
title: CAS Template
sidebar_label: CAS Template
---


CAS Template
==================

OpenEBS control plane provides CAS templating as an approach to provision persistent volume that make use of CAS storage engine. CAS Template allows operators to specify the desired state of storage which in turn takes action to converge towards this desired state which means creating and updating kubernetes resources as appropriate. CAS template based provisioning forms a part of kubernetes PVC to PV state transition.

OpenEBS dynamic storage provisioner along with maya api service works towards accomplishing the goal of provisioning CAS storage volume via CAS template and  finally exposing this storage volume as a PV object to be consumed by a kubernetes application.

As mentioned in installation section, install OpenEBS in your k8s environment.  Verify OpenEBS are components are running. 

```
root@ranjith:~# kubectl get pods
NAME                                                             READY     STATUS    RESTARTS   AGE
maya-apiserver-59b466f987-m29wj                                  1/1       Running   0          1h
openebs-provisioner-55ff5cd67f-2fbdv                             1/1       Running   0          1h
```

Check maya api service and custom resource definitions are created and  running

```
root@ranjith:~# kubectl get svc
NAME                                                TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)             AGE
kubernetes                                          ClusterIP   10.75.240.1     <none>        443/TCP             23h
maya-apiserver-service                              ClusterIP   10.75.246.127   <none>        5656/TCP            17h


```

```
root@ranjith:~# kubectl get crd
NAME                                    AGE
scalingpolicies.scalingpolicy.kope.io   23h
storagepoolclaims.openebs.io            18h
storagepools.openebs.io                 18h
volumeparametergroups.openebs.io        17h
volumepolicies.openebs.io               18h
```

Now you are ready to apply CAS template which will provision persistent volume according to your customized changes in volume properties and pinning to corresponding nodes. 

```
root@ranjith:~/community/feature-demos/volumepolicies/replica-pinning# kubectl apply -f vol-policies.yaml
```

Verify jiva controller and replica pods are running

```
root@ranjith:~/community/feature-demos/volumepolicies/replica-pinning# kubectl get pods
NAME                                                             READY     STATUS    RESTARTS   AGE
maya-apiserver-59b466f987-m29wj                                  1/1       Running   0          1h
openebs-provisioner-55ff5cd67f-2fbdv                             1/1       Running   0          1h
pvc-63f8178a-6346-11e8-a784-42010a80011c-ctrl-7cf5574bf9-br6jc   1/1       Running   0          1h
pvc-63f8178a-6346-11e8-a784-42010a80011c-rep-67bcffd9b6-452ht    1/1       Running   0          1h
pvc-63f8178a-6346-11e8-a784-42010a80011c-rep-67bcffd9b6-4dwpr    1/1       Running   0          1h
pvc-63f8178a-6346-11e8-a784-42010a80011c-rep-67bcffd9b6-6w9z4    1/1       Running   0          1h
```

Verify PVC and PV are created with required properties

```
root@ranjith:~/community/feature-demos/volumepolicies/replica-pinning# kubectl get pvc
NAME                        STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS                AGE
openebs-repaffinity-0.6.0   Bound     pvc-63f8178a-6346-11e8-a784-42010a80011c   1Gi        RWO            openebs-repaffinity-0.6.0   17h
```

```
root@ranjith:~/community/feature-demos/volumepolicies/replica-pinning# kubectl get pv
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                               STORAGECLASS                REASON    AGE
pvc-63f8178a-6346-11e8-a784-42010a80011c   1Gi        RWO            Delete           Bound     default/openebs-repaffinity-0.6.0   openebs-repaffinity-0.6.0             17h


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