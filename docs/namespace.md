---
id: namespace
title: Customizing Namespace
sidebar_label: Customizing Namespace
---

OpenEBS is usually deployed with the *default* namespce. You can customize the namespace and specify a name other than *default*.  To customize namespace to *openebs* instead of *default*,  you must change all the namespaces in the *openebs-operator.yaml* file to *openebs*. 

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

You can also use the following commands and retain the *openebs-operator.yaml* file as is. In the following example you are creating a percona namespace.

```
kubectl create ns percona
kubectl apply -f openebs-operator.yaml -ns percona 
```

You can view the changes by giving the `kubectl get pods --all-namespaces` command which will display output similar to following.

```
vagrant@minikube-dev:~$ kubectl get pods --all-namespaces
NAMESPACE     NAME                              READY     STATUS    RESTARTS   AGE
percona   kube-addon-manager-minikube-dev   	1/1       Running   1          8m
percona   kube-dns-910330662-4q4bm          	3/3       Running   3          8m
percona   kubernetes-dashboard-txn8f        	1/1       Running   1          8m
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
