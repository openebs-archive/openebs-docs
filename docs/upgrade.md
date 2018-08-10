---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---

------

OpenEBS supports the upgrade to 0.6 version only from 0.5.3 and 0.5.4.
For older verions, upgrade to either 0.5.3 or 0.5.4 before upgrading to 0.6. For steps to upgrade to 0.5.3 or 0.5.4,[cLick](https://v05-docs.openebs.io/) here.


1. Upgrade the OpenEBS Operator.

2. Upgrade the OpenEBS volumes that were created with older OpenEBS Operator.

Upgrading OpenEBS Operator depends on how OpenEBS was installed. Based on the type of installation select one of the following.
**Step-1 Upgrade OpenEBS Operator**

**Upgrade Using Kubectl** ( OpenEBS was installed by kubectl using the openebs-operator.yaml file)

**Note** The following sample steps will work only if you have installed OpenEBS without modifying the default values.

Delete the older openebs-operator and storage classes. Use the following command to delete the old openebs-operator file.
```
kubectl delete -f openebs-operator.yaml
```

The output must be displayed as follows.
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

Delete the storage classes using the following command.
```
kubectl delete -f openebs-storageclasses.yaml
```

The output must be similar to the following.
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
Wait for the objects to be deleted. You can verify the same using the following command.
```
kubectl get deploy
```
You can now install the 0.6 operator using following command.
```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-operator.yaml
```
The output must be similar to the following.
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
You must deploy the 0.6 storage classes using the following command.
```
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-storageclasses.yaml
```

The output must be similar to the following.
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

**Note** The following sample steps below will work if you have installed OpenEBS with default values provided by stable/openebs helm chart.

Run the following command to view the release name.
```
helm ls
```
The response is similar to the following.
```
NAME    REVISION        UPDATED                         STATUS          CHART           NAMESPACE
openebs 1               Fri Aug  3 14:50:11 2018        DEPLOYED        openebs-0.5.3   openebs
```

Here the release name is openebs.

Upgarde using following command. You have to replace <release-name> with your actual release name.
```
helm upgrade -f https://openebs.github.io/charts/helm-values-0.6.0.yaml <release-name> stable/openebs
```

**Using customized operator YAML or helm chart**

Before proceeding with the upgrade, you must update your custom helm chart or YAML with 0.6 release tags and changes made in the values/templates.

Use the following as reference for the changes made in 0.6: 
- stable/openebs [PR#6768](https://github.com/helm/charts/pull/6768) or 
- openebs-charts [PR#1646](https://github.com/openebs/openebs/pull/1646)

After updating the YAML or helm chart values, you can use the steps mentioned above to upgrade the OpenEBS operator depending upon your type of installation.

**Step-2 Upgrade OpenEBS (old volumes) created with 0.5.3 or 0.5.4**

Even after the OpenEBS Operator has been upgraded to 0.6, the old volumes will continue to work with 0.5.3 or 0.5.4. Each of the volumes should be upgraded (one at a time) to 0.6, using the steps provided below.

**Note:** There has been a change in the way OpenEBS Controller Pods communicate with the Replica Pods. Hence, it is recommended to schedule a downtime for the application using the OpenEBS PV while performing this upgrade. Also, ensure that you have taken a backup of the data before starting the following upgrade procedure.

**Download the upgrade scripts**

You can get the requied scripts to your working directory using the following commands.
```
wget https://raw.githubusercontent.com/kmova/openebs/599e062a2251d2c16bca59aeac4a7ed77e445e6e/k8s/upgrades/0.5.x-0.6.0/controller.patch.tpl.yml
wget https://raw.githubusercontent.com/kmova/openebs/599e062a2251d2c16bca59aeac4a7ed77e445e6e/k8s/upgrades/0.5.x-0.6.0/oebs_update.sh
wget https://raw.githubusercontent.com/kmova/openebs/599e062a2251d2c16bca59aeac4a7ed77e445e6e/k8s/upgrades/0.5.x-0.6.0/patch-strategy-recreate.json
wget https://raw.githubusercontent.com/kmova/openebs/599e062a2251d2c16bca59aeac4a7ed77e445e6e/k8s/upgrades/0.5.x-0.6.0/replica.patch.tpl.yml
```

In 0.5.x releases, when a replica is shutdown, it will get rescheduled to another availble node in the cluster and starts copying the data from the other replicas. This is not a desired behaviour during upgrades, as it creates new replicas due to rolling-upgrade. To pin the replicas or force them to the nodes where the data is already present, starting with 0.6, we use the concept of NodeSelector and Tolerations that will make sure replicas are not moved on node during pod delete operation.

As part of upgrade, OpenEBS recommends that you label the nodes where the replica pods are scheduled as follows:
```
kubectl label nodes gke-kmova-helm-default-pool-d8b227cc-6wqr "openebs-pv"="openebs-storage"
```

Note that the key `openebs-pv` is fixed. However you can use any value in place of `openebs-storage`. This value will be taken as a parameter in the upgrade script below. 

Repeat the above step of labellilng the node for all the nodes where replicas are scheduled. The assumption is that all the PV replicas are scheduled on the same set of 3 nodes. 



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
