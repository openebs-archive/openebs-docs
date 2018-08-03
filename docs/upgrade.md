---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---

------

OpenEBS supports the upgrade to 0.6 version only from 0.5.3 and 0.5.4.
For older verions please upgrade to either 0.5.3 or 0.5.4 before upgrading to 0.6. For steps tp upgrade 0.5.3 or 0.5.4 please [cLick](https://v05-docs.openebs.io/) here.

The upgrade of OpenEBS is a two step process.

*Step-1*: Upgrade the OpenEBS Operator

*Steo-2*: Upgrade the OpenEBS volumes that were created with older OpenEBS Operator.

Upgrade steps for OpenEBS Operator depends on how OpenEBS was installed. Depending upon the type of installation please select one of the following.
**Steps-1 Upgrade OpenEBS Operator**

**Upgrade Using Kubectl** ( OpenEBS was installed by kubectl using openebs-operator.yaml file)

**Note** The sample steps below will work only if you have installed openebs without modifying the default values.

Delete the older openebs-operator and storage classes. Use the follwing command to delete the old openebs-operator.
```
kubectl delete -f openebs-operator.yaml
```

The response sholud be like this.
```
serviceaccount "openebs-maya-operator" deleted
clusterrole "openebs-maya-operator" deleted
clusterrolebinding "openebs-maya-operator" deleted
deployment "maya-apiserver" deleted
service "maya-apiserver-service" deleted
deployment "openebs-provisioner" deleted
customresourcedefinition "storagepoolclaims.openebs.io" deleted
customresourcedefinition "storagepools.openebs.io" deleted
storageclass "openebs-standard" deleted
```

Next delete the storage classes. Use the follwing command,
```
kubectl delete -f openebs-storageclasses.yaml
```

The response should be like this.
```
storageclass "openebs-standalone" deleted
storageclass "openebs-percona" deleted
storageclass "openebs-jupyter" deleted
storageclass "openebs-mongodb" deleted
storageclass "openebs-cassandra" deleted
storageclass "openebs-redis" deleted
storageclass "openebs-kafka" deleted
storageclass "openebs-zk" deleted
storageclass "openebs-es-data-sc" deleted
```
Wait for the objects to got delete, you can verify the same using the following command.
```
kubectl get deploy
```
Now you can install the 0.6 operator using following command
```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-operator.yaml
```
The response should be like this.
```
namespace "openebs" created
serviceaccount "openebs-maya-operator" created
clusterrole "openebs-maya-operator" created
clusterrolebinding "openebs-maya-operator" created
deployment "maya-apiserver" created
service "maya-apiserver-service" created
deployment "openebs-provisioner" created
deployment "openebs-snapshot-operator" created
customresourcedefinition "storagepoolclaims.openebs.io" created
customresourcedefinition "storagepools.openebs.io" created
storageclass "openebs-standard" created
storageclass "openebs-snapshot-promoter" created
customresourcedefinition "volumepolicies.openebs.io" created
```
Next you have to deploy the 0.6 storage classes, using the follwing command.
```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-storageclasses.yaml
```

The response should be like this.
```
storageclass "openebs-standalone" created
storageclass "openebs-percona" created
storageclass "openebs-jupyter" created
storageclass "openebs-mongodb" created
storageclass "openebs-cassandra" created
storageclass "openebs-redis" created
storageclass "openebs-kafka" created
storageclass "openebs-zk" created
storageclass "openebs-es-data-sc" created
```

**Upgrade Using Helm** ( OpenEBS was installed by helm chart)

**Note** The sample steps below will work if you have installed openebs with default values provided by stable/openebs helm chart.

Run the following command to get the release name.
```
helm ls
```
The response should be like below.
```
NAME    REVISION        UPDATED                         STATUS          CHART           NAMESPACE
openebs 1               Fri Aug  3 14:50:11 2018        DEPLOYED        openebs-0.5.3   openebs
```

Here the release name is openebs.

Next you you have to upgarde using following command. You have to replace <release-name> with your actual release name.
```
helm upgrade -f https://openebs.github.io/charts/helm-values-0.6.0.yaml <release-name> stable/openebs
```

**Using customized operator YAML or helm chart**

Before you proceed with upgradation, you must update your custom helm chart or YAML with 0.6 release tags and changes made in the values/templates.

You can use the following as references to know about the changes in 0.6: 
- stable/openebs [PR#6768](https://github.com/helm/charts/pull/6768) or 
- openebs-charts [PR#1646](https://github.com/openebs/openebs/pull/1646) as reference.

After updating the YAML or helm chart values, you can use the steps mentioned above to upgrade the OpenEBS operator depending upon your type of installation.

**Step-2 Upgrade OpenEBS old volumes created with 0.5.3 or0.5.4**

Even after the OpenEBS Operator has been upgraded to 0.6, the old volumes will continue to work with 0.5.3 or 0.5.4. Each of the volumes should be upgraded (one at a time) to 0.6, using the steps provided below.

**Note:** There has been a change in the way OpenEBS Controller Pods communicate with the Replica Pods. So, it is recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, make sure you have taken a backup of the data before starting the below upgrade procedure.

**Download the upgrade scripts**

You can get the requied scripts to your working directory using the following commands.
```
wget https://raw.githubusercontent.com/kmova/openebs/599e062a2251d2c16bca59aeac4a7ed77e445e6e/k8s/upgrades/0.5.x-0.6.0/controller.patch.tpl.yml
wget https://raw.githubusercontent.com/kmova/openebs/599e062a2251d2c16bca59aeac4a7ed77e445e6e/k8s/upgrades/0.5.x-0.6.0/oebs_update.sh
wget https://raw.githubusercontent.com/kmova/openebs/599e062a2251d2c16bca59aeac4a7ed77e445e6e/k8s/upgrades/0.5.x-0.6.0/patch-strategy-recreate.json
wget https://raw.githubusercontent.com/kmova/openebs/599e062a2251d2c16bca59aeac4a7ed77e445e6e/k8s/upgrades/0.5.x-0.6.0/replica.patch.tpl.yml
```

In 0.5.x releases, when a replica is shutdown, it will get rescheduled to another availble node in the cluster and start copying the data from the other replicas. This is not a desired behaviour during upgrades, which will create new replica's as part of the rolling-upgrade. To pin the replicas or force them to the nodes where the data is already present, starting with 0.6 - we use the concept of nodeSelector and Tolerations that will make sure replica's are not moved on node or pod delete operations.

So as part of upgrade, we recommend that you label the nodes where the replica pods are scheduled as follows:
```
kubectl label nodes gke-kmova-helm-default-pool-d8b227cc-6wqr "openebs-pv"="openebs-storage"
```

Note that the key `openebs-pv` is fixed, however you can use any value in place of `openebs-storage`. This value will be taken as a parameters in the upgrade script below. 

Repeat the above step of labellilng the node for all the nodes where replica's are scheduled. The assumption is that all the PV replica's are scheduled on the same set of 3 nodes. 

**Limitations:**
- Need to handle cases where there are a mix of PVs with 1 and 3 replicas or 
- Scenario like PV1 replicas are on nodes - n1, n2, n3, where as PV2 replicas are on nodes - n2, n3, n4
- This is a preliminary script only intended for using on volumes where data has been backed-up.
- please have the following link handy in case the volume gets into read-only during upgrade 
  https://docs.openebs.io/docs/next/readonlyvolumes.html
- In the process of running the below steps, if you run into issues, you can always reach us on slack

Select the PV that needs to be upgraded

Use the following command to get the PV.
```
kubectl get pv
```
Upgrade the PV that needs to be upgraded. Use the following command.
```
./oebs_update.sh pvc-48fb36a2-947f-11e8-b1f3-42010a800004 openebs-storage

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
