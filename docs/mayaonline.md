---
id: mayaonline
title: Connecting OpenEBS to MayaOnline
sidebar_label: MayaOnline
---

------

[MayaOnline](https://docs.mayaonline.io/docs/overview.html)  offers visibility into OpenEBS persistent volumes present in Kubernetes. The basic services on this SaaS platform are free for OpenEBS community. A Kubernetes cluster can be connected to MayaOnline before or after OpenEBS installation. By connecting a Kubernetes cluster to MayaOnline,  OpenEBS users get the following benefits

- Topology view of all Kubernetes resources related to persistent volumes. This granular visualization helps to understand the relationships between storage and pod resources, get the real-time status of such resources and troubleshoot related issues   
- User can take snapshots/clones of OpenEBS persistent volumes on the fly with ease
- Prometheus monitoring is instantly made available for the stateful applications running with OpenEBS
- Customizable Grafana dashboards for the collected Prometheus metrics 
- Logs of all pods related to OpenEBS components on the Kubernetes cluster are instantly available through Kibana dashboard interface
- Alerts related to OpenEBS storage are provided on the portal as well as at user configured Slack channel



![MayaOnline Overview](/docs/assets/docOverview.png)



<br><br>

## What information is sent from my Kubernetes to MayaOnline ?



<img src="/docs/assets/moconnect.png" alt="Secure connectivity between MayaOnline and K8s" width="700"/>

<br><br>

MayaOnline agents are installed in a namespace called "maya-system". These agents primarily include 

- prometheus client that collects metrics from OpenEBS volumes and export them to MayaOnline
- Topology client that queries Kubernetes resources and send the status when requested
- Fluentd aggregators that export the logs to MayaOnline

User's data is never looked into or exported to MayaOnline by the agents. 



**Note**: MayaOnline administrators will have read-only access to the topology, metrics and logs that are exported to MayaOnline.  

<br><br>

## Connecting a Kubernetes cluster to MayaOnline

### System requirements

- Users can in general connect any Kubernetes cluster versioned above 1.10.x to MayaOnline and OpenShift versioned above 3.x. If you are facing troubles connecting your Kubernetes cluster, report the details in the OpenEBS community slack channel ([slack.openebs.io](https://slack.openebs.io) )

- Users need to authenticate to MayaOnline using their GitHub credentials

- Users need to have access to Kubernetes admin context to install MayaOnline agents on Kubernetes

   

### Installing MayaOnline agents on  Kubernetes

1. Sign up at app.mayaonline.io using GitHub credentials
2. Create a project and choose the Kubernetes platform 
3. Copy the kubectl command that is presented and run it in your Kubernetes environment 

Once your cluster is connected to MayaOnline, start exploring your OpenEBS resources through the topology view of your cluster. 



### Example Dashboards at MayaOnline

#### Landing page

<img src="/docs/assets/MO-import2.png" alt="Sample dashboard at MayaOnline" width="800"/>

<br><br>

#### cStor pool view

<img src="/docs/assets/mo-pool-view.png" alt="Sample dashboard at MayaOnline" width="800"/>

<br><br>

#### cStor volume pod view

<img src="/docs/assets/mo-pod-view.png" alt="Sample dashboard at MayaOnline" width="800"/>

<br><br>

#### cStor custom resources view

<img src="/docs/assets/mo-cr-view.png" alt="Sample dashboard at MayaOnline" width="800"/>

<br><br>



### See Also

#### [cStor Overview](/docs/next/cstor.html)

#### [Connect to MayaOnline](https://app.mayaonline.io)

#### [MayaOnline Documentation](https://docs.mayaonline.io)
















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
