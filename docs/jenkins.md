---
id: Jenkins
title: Using OpenEBS for Jenkins
sidebar_label: Jenkins
---
------

This section demonstrates the deployment of Jenkins as a pod in a Kubernetes cluster. You can spawn a Jenkins deployment which will use OpenEBS as its persistent storage.

## Deploying Jenkins as a Pod

Deploying Jenkins as a pod provides the following benefits.

- Isolates different jobs from one another
- Quickly cleans a job’s workspace.
- Dynamically deploys or schedules jobs with Kubernetes pods
- Allows increased resource utilization and efficiency

## Deploying Jenkins Pod with Persistent Storage

We are using OpenEBS cStor storage engine for running  Jenkins. Before we start, check the status of the cluster using the following command. 

    kubectl get nodes

The following output shows the status of the nodes in the cluster

```
NAME                                                STATUS    ROLES     AGE       VERSION
gke-doc-update-chandan-default-pool-80bd877e-50r3   Ready     <none>    26m       v1.11.3-gke.18
gke-doc-update-chandan-default-pool-80bd877e-5jqh   Ready     <none>    26m       v1.11.3-gke.18
gke-doc-update-chandan-default-pool-80bd877e-jhc9   Ready     <none>    26m       v1.11.3-gke.18
```



Also make sure that you have deployed OpenEBS in your cluster. If not deployed, you can install from [here](/docs/next/quickstartguide.html).

You can check the status of OpenEBS pods by running following command.

```
kubectl get pods -n openebs
```

Output of above command will be similar to the following.

```
NAME                                        READY     STATUS    RESTARTS   AGE
cstor-sparse-pool-0zpr-5dc4b74d4f-l9jmb     2/2       Running   0          19m
cstor-sparse-pool-9xz0-5b6895889f-crpsz     2/2       Running   0          19m
cstor-sparse-pool-ood5-798cd977f9-fvngr     2/2       Running   0          19m
maya-apiserver-5565f79ddc-k2h99             1/1       Running   0          20m
openebs-ndm-7fg7l                           1/1       Running   0          20m
openebs-ndm-kjg8p                           1/1       Running   0          20m
openebs-ndm-wvtqt                           1/1       Running   0          20m
openebs-provisioner-5c65ff5d55-ljhbh        1/1       Running   0          20m
openebs-snapshot-operator-9898bbb95-68rw7   2/2       Running   0          20m
```

Create a YAML file named *jenkins.yaml* and copy the following contents to the YAML file.

    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: jenkins-claim
      annotations:
        volume.beta.kubernetes.io/storage-class: openebs-cstor-sparse
    spec:
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 5G
    ---
    apiVersion: extensions/v1beta1
    kind: Deployment
    metadata:
     name: jenkins
    spec:
     replicas: 1
     template:
      metadata:
       labels:
        app: jenkins-app
      spec:
       securityContext:
         fsGroup: 1000
       containers:
       - name: jenkins
         imagePullPolicy: IfNotPresent
         image: jenkins/jenkins:lts
         ports:
         - containerPort: 8080
         volumeMounts:
           - mountPath: /var/jenkins_home
             name: jenkins-home
       volumes:
         - name: jenkins-home
           persistentVolumeClaim:
             claimName: jenkins-claim
    ---
    apiVersion: v1
    kind: Service
    metadata:
      name: jenkins-svc
    spec:
      ports:
        - port: 80
          targetPort: 8080
      selector:
        app: jenkins-app
      type: NodePort

Once you have copied the above content to *jenkins.yaml*, you can run the following command to launch Jenkins application on OpenEBS cStor volume.

```
kubectl apply -f jenkins.yaml
```

Output similar to following can be observed for the above command

```
persistentvolumeclaim "jenkins-claim" created
deployment.extensions "jenkins" created
service "jenkins-svc" created
```

Get the status of Jenkins pods using the following command. 

```
kubectl get pods
```

Output of above command will be similar to the following.

```
NAME                      READY     STATUS    RESTARTS   AGE
jenkins-9cd8ff666-hlhpb   1/1       Running   0          21m
```

Get the status of underlying persistent volumes used by Jenkins deployment using the following command.

```
kubectl get pvc
```

Observed output will be similar to following.

```
NAME            STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS           AGE
jenkins-claim   Bound     pvc-e7c4eee3-f925-11e8-a3dd-42010a8001bf   5G         RWO            openebs-cstor-sparse   27s
```

Get the status of Jenkins service using the following command. 

```
kubectl get svc
```

Following output should be observed for the above command.

```
NAME          TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
jenkins-svc   NodePort    10.35.246.129   <none>        80:30900/TCP   18m
kubernetes    ClusterIP   10.35.240.1     <none>        443/TCP        1h
```



## Launching Jenkins

The Jenkins deployment YAML, creates a NodePort service type to make Jenkins available outside the cluster.

**Note:**

The we have used gke environment for this cluster. If your setup is created vagrant VMs and the IP addresses are autogenerated by vagrant or if the cluster is on local VMs then you have assigned the IPs manually. In gke environment the NodePort  service can be accessed by any node external IP using the NodePort.

Get the node IP address that is running the Jenkins pod using the following command. 

```
kubectl describe pod jenkins-6bc67f99d7-r6hw7 | grep Node:
```

Output will be similar to following.

```
Node:           kubeminion-02/172.28.128.5
```

For gke the above output will be similar to below.

```
Node:               gke-doc-update-chandan-default-pool-80bd877e-50r3/10.128.0.4
```

Here 10.128.0.4 is the internal IP of the gke node. You can get the external IP of the gke node using the following command.

```
gcloud compute instances list 
```

Output of the above command will be similar to following output.

```
gke-doc-update-chandan-default-pool-80bd877e-50r3    us-central1-a  custom (1 vCPU, 6.00 GiB)                10.128.0.4   35.202.82.200    RUNNING
gke-doc-update-chandan-default-pool-80bd877e-5jqh    us-central1-a  custom (1 vCPU, 6.00 GiB)                10.128.0.7   35.239.98.223    RUNNING
gke-doc-update-chandan-default-pool-80bd877e-jhc9    us-central1-a  custom (1 vCPU, 6.00 GiB)                10.128.0.3   35.238.235.184   RUNNING
```

 Get the port number from the Jenkins service using the following command. 

```
kubectl describe svc jenkins-svc | grep NodePort:
```

Following output will be observed

```
NodePort:                 <unset>  30900/TCP
```

Open the [http://172.28.128.5:30900](http://172.28.128.5:30577) URL in your browser for local environment.

For gke it will be http://35.202.82.200:30900 

**Note:**

The NodePort is dynamically allocated and may vary in a different deployment. As mentioned above in gke environment NodePort can be accessed through any nodes external IP. In case of local or vagarnt VMs the service can be accessed in the local network only. To access it outside local network you must configure ingress in your setup. 

Once you access the URL the Getting Started page is displayed. The following procedure helps you setup Jenkins.

1. It will ask for **initialAdminPassword**. 

    ![unlock](/docs/assets/unlock_jenkins.PNG)

    Get the password by executing  below way.

    kubectl exec -it jenkins-6bc67f99d7-l9p5h cat /var/jenkins_home/secrets/initialAdminPassword

    Note: Replace **jenkins-6bc67f99d7-l9p5h** with your jenkin pod name. 

2. Provide the **initialAdminPassword** in the *Unlock Jenkins* screen ..

3. Click **Continue**.

4. In the *Customize Jenkins* screen click **Install suggested plugins**.

    ![customize](/docs/assets/customize_jenkins.PNG)

5. Configure the Administrator user in the *Create First Admin User* screen. 

    ![create_user](/docs/assets/create_user_jenkins.PNG)

6. Click **Continue as admin** if you want to perform further administrator tasks or click **Save and Continue**.

7. Do final configuration by providing the required IP to access Jenkin application or go with the provided IP and click **Save and Finish**.

    ![final_config](/docs/assets/final_config_jenkins.PNG)

You can now start using Jenkins.

![ready](/docs/assets/ready_jenkins.PNG)

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
