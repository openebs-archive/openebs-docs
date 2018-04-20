---
id: RabbitMQ
title: RabbitMQ
sidebar_label: RabbitMQ
---
<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  Our docs for version 0.5 release are getting updated. The documentation you are currently viewing is a static snapshot of earlier version for the same 0.5 release.  Click here for [latest](https://docs.openebs.io) version.
</strong></p></center>

## Deploying RabbitMQ as a StatefulSet

This section provides detailed instructions on how to run a RabbitMQ pod on OpenEBS storage in a Kubernetes cluster. To deploy RabbitMQ run the following commands.
```
devops@Ubuntu:~$ cd openebs/k8s/demo/rabbitmq/
devops@Ubuntu:~/openebs/k8s/demo/rabbitmq$ ls
cleanup.sh  rabbitmq-statefulset.yaml  run.sh
devops@Ubuntu:~/openebs/k8s/demo/rabbitmq$ sh run.sh
```
Running the above command creates the persistent volume claim, deployment, and a service for the RabbitMQ application.

Check if the RabbitMQ pods are running by running the following command.
```
devops@Ubuntu:~/openebs/k8s/demo/rabbitmq$ kubectl get pods --all-namespaces
NAMESPACE     NAME                                                             READY     STATUS    RESTARTS   AGE
default       cortex-agent-5986bd9f86-6qlbh                                    1/1       Running   0          50m
default       maya-apiserver-7cd7478c74-r4clj                                  1/1       Running   0          1h
default       openebs-provisioner-fc5cb748b-nf8j5                              1/1       Running   0          1h
default       pvc-419f0916-1609-11e8-86e5-000c29983430-ctrl-57cdd769bb-jvs69   2/2       Running   0          1h
default       pvc-419f0916-1609-11e8-86e5-000c29983430-rep-664579dbf5-strw2    1/1       Running   0          1h
default       rabbitmq-0                                                       1/1       Running   0          1h
kube-system   kube-addon-manager-minikube                                      1/1       Running   6          14d
kube-system   kube-dns-86f6f55dd5-8fxkr                                        3/3       Running   19         14d
kube-system   kubernetes-dashboard-vsdmh                                       1/1       Running   6          14d
kube-system   storage-provisioner                                              1/1       Running   6          14d
maya-system   maya-io-agent-z2wn2                                              1/1       Running   0          50m
```
To obtain the status of underlying persistent volumes used by RabbitMQ, run the following command.
```
devops@Ubuntu:~/openebs/k8s/demo/rabbitmq$ kubectl get pvc
NAME                  STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS       AGE
rabbitmq-rabbitmq-0   Bound     pvc-419f0916-1609-11e8-86e5-000c29983430   5G         RWO            openebs-standard   1h
```
Check the status of the RabbitMQ service by running the following command.
```
devops@Ubuntu:~/openebs/k8s/demo/rabbitmq$ kubectl get svc
NAME                                                TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)                       AGE
cortex-agent-service                                NodePort    10.103.83.253    <none>        80:31011/TCP                  53m
kubernetes                                          ClusterIP   10.96.0.1        <none>        443/TCP                       14d
maya-apiserver-service                              ClusterIP   10.101.163.249   <none>        5656/TCP                      1h
pvc-419f0916-1609-11e8-86e5-000c29983430-ctrl-svc   ClusterIP   10.98.56.152     <none>        3260/TCP,9501/TCP             1h
rabbitmq                                            ClusterIP   None             <none>        5672/TCP,4369/TCP,25672/TCP   1h
rabbitmq-management                                 NodePort    10.107.39.5      <none>        15672:30146/TCP               1h
```
### Launching  RabbitMQ
The RabbitMQ deployment YAML, creates a NodePort service type to make RabbitMQ accessible outside the cluster.

1. Get the node IP Address that is running the RabbitMQ pod using the following command. NodeIP is any of the node's external IP.

```
devops@Ubuntu:~/openebs/k8s/demo/rabbitmq$ kubectl describe pod rabbitmq-0 | grep Node:
Node:           minikube/20.10.24.52
```

 **Note** : AWS users must use the public or external IP of the node where RabbitMQ is running. You can find the internal IP address of the node by running the following command.

```
devops@ip-172-20-61-151:~$ kubectl describe pod rabbitmq-0 | grep Node
Node:           ip-172-20-50-190.ec2.internal/172.20.50.190
```

The internal IP address of node is 172.20.50.190 in above instance. We can map find out the external IP address of the respective node by running the following command.

```
devops@ip-172-20-61-151:~$ kubectl get nodes -o wide
NAME                            STATUS    ROLES     AGE       VERSION   EXTERNAL-IP      OS-IMAGE             KERNEL-VERSION     CONTAINER-RUNTIME
ip-172-20-50-190.ec2.internal   Ready     node      1h        v1.8.6    35.170.55.32     Ubuntu 16.04.2 LTS   4.4.0-66-generic   docker://1.13.1
ip-172-20-61-151.ec2.internal   Ready     master    1h        v1.8.6    34.234.225.152   Ubuntu 16.04.2 LTS   4.4.0-66-generic   docker://1.13.1
ip-172-20-63-17.ec2.internal    Ready     node      1h        v1.8.6    34.237.138.202   Ubuntu 16.04.2 LTS   4.4.0-66-generic   docker://1.13.1
```

In the above example, the external IP address of the node is 35.170.55.32 where RabbitMQ pod runs.

2. Get the port number from the RabbitMQ service using the following command.

```
devops@Ubuntu:~/openebs/k8s/demo/rabbitmq$ kubectl describe svc rabbitmq-management | grep NodePort:
NodePort:                 http  30146/TCP 
```

**Note** : Google Cloud users perform the following procedure to launch RabbitMQ. Get the external IP of the node which is running RabbitMQ using the following command `kubectl get nodes -o wide`. 


```
devops@strong-eon-153112:~/doc/openebs/k8s/demo/rabbitmq$ kubectl get nodes -o wide
NAME                                      STATUS    ROLES     AGE       VERSION         EXTERNAL-IP      OS-IMAGE             KERNEL-VERSION   CONTAINER-RUNTIME
gke-doc-test-default-pool-5ca42e90-f49d   Ready     <none>    20d       v1.7.11-gke.1   104.197.83.15    Ubuntu 16.04.3 LTS   4.4.0-1027-gke   docker://1.12.6
gke-doc-test-default-pool-5ca42e90-mc9k   Ready     <none>    20d       v1.7.11-gke.1   35.184.18.36     Ubuntu 16.04.3 LTS   4.4.0-1027-gke   docker://1.12.6
gke-doc-test-default-pool-5ca42e90-wr8g   Ready     <none>    20d       v1.7.11-gke.1   35.224.226.117   Ubuntu 16.04.3 LTS   4.4.0-1027-gke   docker://1.12.6
```

In the above example, the external IP address of the node where RabbitMQ pod runs is 104.197.83.15 which can be found by mapping the internal IP address. To launch RabbitMQ, use the external IP address.

3. After getting the Node IP go to the browser and type the URL as **_https:// External node_IP :NodePort_**(for example, https://20.10.24.52:30146 ) and perform the following procedure from the UI.

**Note:** To reach the above URL, you may need to disable firewall on the node.

1. Access the above URL from the web browser. The following screen will appear. 
  ![rabbitmq](assets/rabbitmqlogin.jpg)

2. Enter the username/password to login (Default is guest/guest). The following screen will appear once you login to RabbitMQ.

   ![rabbitmqlogin](assets/rabbitmqdashboard.jpg)


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
