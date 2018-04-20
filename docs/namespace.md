---
id: namespace
title: Customizing Namespace
sidebar_label: Customizing Namespace
---
<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  Documentation for OpenEBS v0.5-old is no longer actively maintained. The version you are currently viewing is a static snapshot. For up-to-date documentation, see the [latest](https://docs.openebs.io) version.
</strong></p></center>

OpenEBS is usually deployed in the *default* namespace. You can deploy OpenEBS in another namespace  other than the *default* namespace.  For example, you can customize namespace to *openebs* instead of *default*, in the *openebs-operator.yaml* file. 

1. Create a namespace as in the following example i.e., modify *name:* to *openebs*.

   ```
   apiVersion: v1
   kind: Namespace
   metadata:
     name: openebs
   ```

2. Change all occurrences of *namespace: default* to *namespace: openebs*.

3. In the openebs-provisioner deployment, add the following ENV.

     - name: OPENEBS_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace

### Namespace in Application Files

You can also use the following commands to create a percona namespace and deploy the percona application in the new percona namespace that you have created.

```
kubectl create ns percona
kubectl apply -f percona.yaml -n percona 
```

You can view the changes by running the `kubectl get pods --all-namespaces` command which will display output similar to following. You can see that the percona application is created with the percona namespace.

```
vagrant@minikube-dev:~$ kubectl get pods --all-namespaces
NAMESPACE     NAME                                                             READY     STATUS   RESTARTS   AGE
openebs       maya-apiserver-7cd7478c74-xrxnl                                  1/1       Running   4          8d
openebs       openebs-provisioner-fc5cb748b-kqgvt                              1/1       Running   8          8d
percona       percona                                                          1/1		 Running   1          8d
percona       pvc-17e21bd3-c948-11e7-a157-000c298ff5fc-ctrl-3572426415-n8ctb   1/1       Running   0          8d
percona       pvc-17e21bd3-c948-11e7-a157-000c298ff5fc-rep-3113668378-9437w    1/1       Running   0          8d
percona       pvc-17e21bd3-c948-11e7-a157-000c298ff5fc-rep-3113668378-xnt12    1/1       Running   0          8d
kube-system   kube-addon-manager-minikube                                      1/1       Running   13         8d
kube-system   kube-dns-86f6f55dd5-8fxkr                                        3/3       Running   40         8d
kube-system   kubernetes-dashboard-vsdmh                                       1/1       Running   13         8d
vagrant@minikube-dev:~$ 
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
