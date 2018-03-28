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

### Maya-ApiServer

### Maya-Provisioner



## Data Plane

### Jiva

### cStor



## Node Disk Manager

## Integrations with cloud native tools

### Prometheus (maya-volexporter)

### Grafana

### Jaeger-Maya

### Kube Dashboard



## OpenEBS Scheduler

For volume provisioning to application PODs, OpenEBS provides a [dynamic provisioner](https://github.com/kubernetes-incubator/external-storage/tree/master/openebs). For provisioning and managing the controller PODs and replica PODs, OpenEBS provides additional tunable parameters to Kubernetes scheduler.



## Volume provisioning 





## Volume pod scheduling  





## Volume policies 















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
