---
id: conceptscas
title: Container Attached Storage (CAS)
sidebar_label: CAS
---

------



CAS is software that includes a micro services based storage controller and a multiples of micro services based storage replicas which can be orchestrated  by Kubernetes like any other micro service or container.  CAS gives benefits of both DAS and NAS. In the non-CAS models, all the persistent volumes of Kubernetes are still tightly coupled to the Kernel modules, making the storage software on Kubernetes node a monolithic in nature.  

![NON-CAS](/docs/assets/non-cas.png)

In contrast, CAS is truly cloud native. The storage software that defines a Kubernetes PV (Persistent Volume) is  micro services based. The control plane of storage software (called storage controller) and the data plane of storage software (called storage replica) are run as Kubernetes PODs and hence truly cloud native. One can apply all the advantages of being cloud native to CAS.

![CAS](/docs/assets/cas.png)

## Advantages of CAS

### Agility

Each storage volume in CAS has a containerized storage controller and corresponding containerized replicas, because of which, the maintenance and tuning of resources around these components become agile. The software upgrades of either storage controller or storage replica are done through the tested method of Kubernetes rolling upgrades. Resources such as CPU and memory can be tuned using container cGroups. 

### Granularity of storage policies

Containerization of storage software and dedicating such controller for each volume brings in maximum granularity in storage policies. With CAS architecture, all storage policies can be configured as per volume. The storage parameters can be monitored on a per volume basis and storage policies can be dynamically updated at run time to achieve the desired result for a given workload. Control on storage throughput, IOPS and latency increases with this level of granularity in the volume storage policies.

### Avoids lock-in 

Avoiding vendor/cloud lock-in is the common goal for most of the users and enterprises and this goal has contributed significantly to the adoption of Kubernetes as it is the widely accepted orchestration platform for containers. However, data of the stateful application data remains as the lock-in contributor either to a given technology or to a cloud. With CAS approach, orchestration is made possible in a way storage controllers can migrate the data in the background to anywhere and live migration becomes fairly easy task. In other words, stateful workloads can be moved from from Kubernetes cluster to any other Kubernetes cluster.

### Cloud native

CAS containerizes storage software and also uses Kubernetes Custom Resource Definitions (CRDs) to represent the low level storage resources such as disks and storage pools. This model enables storage to be integrated into other Cloud Native tools in a seamless manner. The storage resources can be provisioned, monitored, managed using cloud native tools such as Prometheus, Grafana, Fluentd, Weavescope, Jaeger etc.



## Architecture of CAS on Kubernetes

![CAS](/docs/assets/cas-arch.png)













As shown in the above diagram, in CAS architecture, the software of storage controller and replicas are completely micro services based and hence no kernel components are involved.  Typically, the storage controller POD is scheduled on the same node as the persistent volume to increase the efficiency and the  replica pods can be scheduled anywhere on the cluster nodes. Each replica is configured completely independently from the others using any combination of  local disks, SAN disks  and cloud disks. This allows huge flexibility in managing the storage allocation for workloads at scale. 

### HyperConverged and not Distributed:

CAS architecture does not follow a typical distributed storage architecture with blast radius limitations. With synchronous replication happening from storage controller onto the storage replicas, the storage becomes highly available.  The metadata of replicas of a volumes are not shared among the nodes and is independently managed on each local node. If a node fails, the storage controller, which is a stateless container in this case, is spun on a node where second or third replica is running and data continues to be available.  Hence, with CAS there is no blast radius effect that is typically seen distributed storage systems such as Ceph, Glusterfs etc in the event of node failures. 

Similar to hyperconverged systems, storage and performance of a volume in CAS is scalable. As each volume is having it's own storage controller, the storage can scale up within the permissible limits of a storage capacity of a node. As the number of container applications increase in a given Kubernetes cluster, more nodes are added, which increases the overall availability of storage capacity and performance, thereby making the storage available to the new application containers. This process is exactly similar to the successful HyperConverged systems like Nutanix. 



### See Also:

- Link to OpenEBS architecture
- Link to a video or article on how scalability is achieved in hyperconverged systems



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
