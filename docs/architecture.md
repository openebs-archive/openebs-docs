---
id: architecture
title: OpenEBS Architecture
sidebar_label: Architecture
---

------

OpenEBS follows CAS model where each volume has a dedicated controller POD and set of replica PODs. The advantages of CAS architecture can be read here.  To simplify the deployment by Operators/Admins and usage by application developers, OpenEBS is integrated nicely into the Kubernetes concepts and recommended patterns.  

![OpenEBS-Architecture-Overview](/docs/assets/openebs-arch.png)



OpenEBS solution/project has many components , which can be grouped into the following categories

- Control plane components, the names of which start with Maya-*
- Data plane components - Jiva and cStor
- Node disk manager
- Integrations with cloud native tools  - Integrations with Prometheus, Grafana, Fluentd and Jaeger



## Control Plane

OpenEBS control plane is responsible for provisioning volumes, associated volume actions such as taking snapshots, making clones, creating storage policies, enforcing storage policies, exporting the volume metrics for consumption by prometheus/grafana,  etc.

 

![Maya is the control plane of OpenEBS](https://raw.githubusercontent.com/openebs/maya/master/docs/openebs-maya-architecture.png)

OpenEBS provides a [dynamic provisioner](https://github.com/kubernetes-incubator/external-storage/tree/master/openebs), which is the standard Kubernetes external storage plugin. Primary task of OpenEBS PV provisioner is to initiate the volume provisioning to application PODS, and to implement the Kubernetes specification for PVs.

m-apiserver exposes storage REST API and takes the bulk of volume policy processing and management. 

The connectivity between control plane data plane is achieved through Kubernetes side-car pattern. There are couple of scenarios in which the control plane needs to communicate with data plane. 

- For volume statistics such as IOPS, throughput, latency etc. This is achieved through volume-exporter side-car
- For volume policy enforcement with volume controller pod and disk/pool management with the volume replica pod. This is achieved through volume-management side-car(s)

The above control plane components are explained in detail below.

### OpenEBS PV Provisioner

This component runs as a POD and is core to the provisioning decisions. Developer constructs a claim with the required volume parameters, chooses the appropriate storage class and invokes kubelet on the yaml spec. The OpenEBS PV dynamic provisioner interacts with the maya-apiserver to create the deployment specifications for volume controller pod and volume replica pod(s) on appropriate nodes. The scheduling of the volume pods (controller/replica) can be controlled using annotations in PVC spec, details of which are discussed in a separate section.

![OpenEBS volume pods provisioning-overview](/docs/assets/volume-provisioning.png)

Currently OpenEBS provisioner supports only one type of binding - iSCSI. 



### Maya-ApiServer

![OpenEBS m-apiserver Internals](/docs/assets/m-apiserver.png)

As shown above, m-apiserver responsible for creating deployment spec files required for creating the volume pods and invokes kube-apiserver which will schedule the pods accordingly. At the end of volume provisioning by the OpenEBS PV provisioner, a Kubernetes object PV is created and is mounted on the application pod and PV is hosted by the controller pod which are supported by a set of replica pods in different nodes. Controller pod and replica pods are part of the data plane and are described in more detail in the [Storage Engines section](/docs/storageengine.html) 

Another important task of m-apiserver is volume policy management. OpenEBS provides very granular specification for expressing policies. m-apiserver interprets these yaml specifications, converts them into enforceable components and enforces them through volume-management side-cars.



### Maya volume exporter



### Volume management side-cars



## Data Plane

### Jiva

### cStor



## Node Disk Manager

## Integrations with cloud native tools

### Prometheus (maya-volexporter)

### Grafana

### Jaeger-Maya

### Kube Dashboard



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
