---
id: chaostest
title: Chaos Engineering with Litmus
sidebar_label: Chaos Engineering
---

------



Litmus is a tool to practice chaos engineering in a kubernetes native way. Litmus provides chaos specific CRDs for Cloud-Native developers and SREs to inject, orchestrate and monitor chaos to find weaknesses in Kubernetes deployments. 

In this section, an experiment that can inject chaos into the OpenEBS cStor volume and Application using a Litmus chart is mentioned. This way a user can validate the resiliency of the application by injecting chaos. There are multiple OpenEBS experiments available in [chart hub](https://hub.litmuschaos.io/) which can be used to check resiliency of the application. To understand better, more details can be found [here](https://docs.litmuschaos.io/docs/getstarted/).



## Installation & Setup



<h3><a class="anchor" aria-hidden="true" id="install-litmus"></a>Install Litmus</h3>



Installation of litmus can be done by executing the following command:

```
kubectl apply -f https://litmuschaos.github.io/pages/litmus-operator-v0.9.0.yaml
```

Verify if the chaos operator is running using the following command:

```
kubectl get pods -n litmus
```

The following is a sample output:

<div class="co">
chaos-operator-ce-554d6c8f9f-slc8k 1/1 Running 0 6m41s
</div>

Verify if chaos CRDs are installed using the following command:

```
kubectl get crds | grep chaos
```

<div class="co">
chaosengines.litmuschaos.io 2019-10-02T08:45:25Z
chaosexperiments.litmuschaos.io 2019-10-02T08:45:26Z
chaosresults.litmuschaos.io 2019-10-02T08:45:26Z
</div>



<h3><a class="anchor" aria-hidden="true" id="install-openebs-chaos-experiments-crs"></a>Install OpenEBS chaos experiments Custom Resources</h3>



To create OpenEBS chaos experiments CRs, execute the following command:

```
kubectl create -f https://hub.litmuschaos.io/api/chaos?file=charts/openebs/experiments.yaml -n <application_namespace>
```

Verify if the chaos experiments are installed using the following command:

```
kubectl get chaosexperiments -n <application_namespace>
```

The output will be similar to the following:

<div class="co">
NAME                               AGE
openebs-pool-container-failure     1h
openebs-pool-pod-failure           1h
openebs-target-container-failure   1h
openebs-target-network-delay       1h
openebs-target-network-loss        1h
openebs-target-pod-failure         1h
</div>



## cStor Volume Chaos Experiments



<h3><a class="anchor" aria-hidden="true" id="cStor-target-container-failure"></a>cStor Target Container Failure</h3>




<h4><a class="anchor" aria-hidden="true" id="setup-service-account"></a>Setup Service Account</h4>

A Service Account should be created to allow chaos engine to run experiments in the application namespace. Copy the following YAML spec into `rbac-chaos.yaml`. You can change the service account name and namespace as needed.

```
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: mysql-chaos
  # app namespace
  namespace: default   
  labels:
    app: mysql
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: mysql-chaos
rules:
- apiGroups: ["", "extensions", "apps", "batch", "litmuschaos.io", "openebs.io", "storage.k8s.io"]
  resources: ["daemonsets", "deployments", "replicasets", "jobs", "pods", "pods/exec","nodes","events", "chaosengines", "chaosexperiments", "chaosresults", "storageclasses", "persistentvolumes", "persistentvolumeclaims", "services", "cstorvolumereplicas", "configmaps"]
  verbs: ["*"] 
---
kind: ClusterRoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: mysql-chaos
subjects:
- kind: ServiceAccount
  name: mysql-chaos
  namespace: default 
roleRef:
  kind: ClusterRole
  name: mysql-chaos
  apiGroup: rbac.authorization.k8s.io
```

Apply the following command  to create one such account on your provided namespace. In this example, namespace is mentioned as `default`.

```
kubectl apply -f rbac-chaos.yaml 
```



<h4><a class="anchor" aria-hidden="true" id="annotate-application"></a>Annotate your application</h4>

Your application has to be annotated with `litmuschaos.io/chaos="true"`. As a security measure, Chaos Operator checks for this annotation on the application before invoking chaos experiment(s) on the application.

```
kubectl annotate deploy/<deployment_name> -n <application_namespace> litmuschaos.io/chaos="true"
```

Example command:

```
kubectl annotate deploy/mysql -n default litmuschaos.io/chaos="true" 
```

**NOTE:** To get the deployment name, run `kubectl get deploy -n <application_namespace>`



<h4><a class="anchor" aria-hidden="true" id="prepare-and-run-chaos-engine-cstor-target-container-failure"></a>Prepare and Run ChaosEngine</h4>

ChaosEngine connects application to the Chaos Experiment. Prepare the chaos engine template to inject container failure on the OpenEBS cStor target pod. 

Copy the following YAML spec into `chaosengine.yaml`.

```
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: target-chaos
  namespace: default 
spec:
  appinfo:
    # App namespace
    appns: default 
    applabel: 'app=mysql'
    appkind: deployment
  chaosServiceAccount: mysql-chaos
  monitoring: false
  jobCleanUpPolicy: delete
  experiments:
    - name: openebs-target-container-failure
      spec:
        components:
          - name: TARGET_CONTAINER
            value: 'cstor-istgt'
          - name: APP_PVC
            value: 'mysql-claim'    
          - name: DEPLOY_TYPE
            value: deployment     
```

Update the following parameters in the above chaos engine template with the details of PVC whose corresponding target container has to be killed.

- spec.appinfo.appns :- Namespace where the application is deployed.
- spec.appinfo.applabel :- Any one of the label of application pod. Run `kubectl get pod <appliction_pod_name> --show-labels` to get the labels.
- spec.appinfo.appkind :- Type of application such as Deployment or StatefulSet.
- spec.chaosServiceAccount :- Name of Service Account created in [setup service account](#setup-service-account) section.
- spec.experiments.spec.components :- Update value for `APP_PVC` with the application PVC name and value for `DEPLOY_TYPE` as the type of application such as Deployment or StatefulSet.

 
After updating the above details in chaos engine template, run the following command to run the `openebs-target-container-kill` chaos experiment.

```
kubectl create -f chaosengine.yaml
```

**NOTE**: It is recommended to create Application, ChaosEngine, ChaosExperiment and Service Account in the same namespace for smooth execution of experiments.

A chaos experiment job is launched that carries out the intended chaos. It may take some time to start the job. Check if the job is completed by executing the following command:

```
kubectl get jobs -n <application-namespace> | grep <experiment-name>
```

Run the following command to check the staus of the pod created by the above job:

```
kubectl get pods -n <application-namespace> | grep <experiment-name>
```



<h4><a class="anchor" aria-hidden="true" id="observe-chaos-results"></a>Observe Chaos results</h4>

After completion of chaos experiment job, verify if the application deployment is resilient to momentary loss of the storage target by describing the `chaosresult` through the following command. 

```
kubectl describe chaosresult <chaosengine name>-<chaos-experiment name> -n <application_namespace>
```

Example command:

```
kubectl describe chaosresult target-chaos openebs-target-container-failure -n default
```

The `spec.verdict` is set to `Running` when the experiment is in progress, eventually changing to either `Pass` or `Fail`.

You can ensure the resiliency of cStor volume by checking if the target pod is healthy and running successfully. This can be checked by running following command:

```
kubectl get pod -n openebs | grep <PV_name>
```

</br>

<a href="#top">Go to top</a>

<hr>



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
