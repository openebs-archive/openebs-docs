---
id: namespace
title: Customizing Namespace
sidebar_label: Customizing Namespace
---

OpenEBS is usually deployed in the *default* namespace. You can deploy OpenEBS in another namespace  other than the *default* namespace.  To customize namespace to *openebs* instead of *default*,  you must change all the namespaces in the *openebs-operator.yaml* file to *openebs*. 

1. Create a namespace as in the following example i.e., modify *name:* to *openebs*.

   ```
   apiVersion: v1
   kind: Namespace
   metadata:
     name: openebs
   ```

2. Change all occurrences of *namespace: default* to *namespace: openebs* in the *openebs-operator.yaml* file.

3. In the openebs-provisioner deployment, add the following ENV.

     - name: OPENEBS_NAMESPACE
              valueFrom:
                fieldRef:
                  fieldPath: metadata.namespace

### Namespace in Application Files

You can also use the following commands to make changes in the application files. In the following example you are creating a percona namespace.

```
kubectl create ns percona
kubectl apply -f openebs-operator.yaml -n percona 
```

You can view the changes by giving the `kubectl get pods --all-namespaces` command which will display output similar to following. You can see that the default namespace is replaced with percona.

```
vagrant@minikube-dev:~$ kubectl get pods --all-namespaces
NAMESPACE     NAME                                                             READY     STATUS   RESTARTS   AGE
percona       maya-apiserver-7cd7478c74-xrxnl                                  1/1       Running   4          8d
percona       openebs-provisioner-fc5cb748b-kqgvt                              1/1       Running   8          8d
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
