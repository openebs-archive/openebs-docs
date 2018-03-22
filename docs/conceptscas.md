---
id: conceptscas
title: Container Attached Storage (CAS)
sidebar_label: CAS
---

## What is CAS ?

CAS is software that includes a micro services based storage controller and a multiples of micro services based storage replicas which can be orchestrated  by Kubernetes like any other micro service or container. 

![CAS](/docs/assets/cas.png)

CAS is truly cloud native. The control plane of storage software (called storage controller) and the data plane of storage software (called storage replica) are micro services based or containerized and hence truly cloud native. One can apply all the advantages of being cloud native to CAS, primarily.

## Advantages of CAS

#### Agility

Each storage volume in CAS has a containerized storage controller and corresponding containerized replicas, because of which, the maintenance and tuning of resources around these components become agile. The software upgrades of either storage controller or storage replica are done through the tested method of Kubernetes rolling upgrades. Resources such as CPU and memory can be tuned using container cGroups. 

#### Granularity of storage policies

Containerization of storage software and dedicating such controller for each volume brings in maximum granularity in storage policies. With CAS architecture, all storage policies can be configured as per volume. The storage parameters can be monitored on a per volume basis and storage policies can be dynamically updated at run time to achieve the desired result for a given workload. Control on storage throughput, IOPS and latency increases with this level of granularity in the volume storage policies.

#### Avoids lock-in 

Avoiding vendor/cloud lock-in is the common goal for most of the users and enterprises and this goal has contributed significantly to the adoption of Kubernetes as it is the widely accepted orchestration platform for containers. However, data of the stateful application data remains as the lock-in contributor either to a given technology or to a cloud. With CAS approach, orchestration is made possible in a way storage controllers can migrate the data in the background to anywhere and live migration becomes fairly easy task. In other words, stateful workloads can be moved from from Kubernetes cluster to any other Kubernetes cluster.

#### Cloud native

CAS containerizes storage software and also uses Kubernetes Custom Resource Definitions (CRDs) to represent the low level storage resources such as disks and storage pools. This model enables storage to be integrated into other Cloud Native tools in a seamless manner. The storage resources can be provisioned, monitored, managed using cloud native tools such as Prometheus, Grafana, Fluentd, Weavescope, Jaeger etc.



## Architecture of CAS on Kubernetes

![CAS](/docs/assets/cas-arch.png)















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
