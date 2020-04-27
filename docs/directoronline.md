---
id: directoronline
title: Connecting OpenEBS to Director Online
sidebar_label: Director Online
---

------



<br><br><div align="center"><font size="5">Director Online offers free visibility to OpenEBS. 

Users get access to Prometheus metrics, logs and topology view of OpenEBS volumes </font></div> <br>

<a href="https://director.mayadata.io" target="_blank">Director Online</a> offers visibility into Stateful application and associated OpenEBS persistent volumes present on the Kubernetes cluster. The basic services on this SaaS platform are free for OpenEBS community. A Kubernetes cluster can be connected to Director Online before or after OpenEBS installation. By connecting a Kubernetes cluster to Director Online, OpenEBS users get the following benefits.

- Topology view of all Kubernetes resources related to Persistent Volumes. This granular visualization help users to understand the relationships between storage and pod resources, get the real-time status of such resources and easy to do troubleshooting during the debugging process. 
- User can take snapshots/clones of OpenEBS persistent volumes on the fly with ease.
- Prometheus monitoring is instantly made available for the OpenEBS volumes.
- Customizable Grafana dashboards for the collected Prometheus metrics .
- Logs of all pods related to OpenEBS components on the Kubernetes cluster are instantly available through Kibana dashboard interface.
- Alerts related to OpenEBS storage are provided on the portal as well as at user configured Slack channel.

## <br><br>System Requirements (or Resource Required)

- Installation of Director Online agents happen into `maya-system` namespace. On an average, the agents consume around 500mi node memory and 300-400m node cpu per node. 

- Users can in general connect any Kubernetes cluster versioned above 1.10.x to Director Online and OpenShift versioned above 3.x. If you are facing troubles connecting your Kubernetes cluster, report the details in the <a href="<https://openebs.io/join-our-slack-community" target="_blank">Slack OpenEBS Community</a> .

- Users need to authenticate to Director Online using their GitHub/Google credentials or with Local authentication.

- Users need to have access to Kubernetes admin context to install Director Online agents on Kubernetes.

   

## Installing Director Online agents on Kubernetes

1. Sign up at MayaData [account portal](https://account.mayadata.io/) using GitHub/Google credentials or with Local authentication .
2. Click on **Go to Director Online** from portal page.  
3. Create a profile and project for the first time and choose the Kubernetes platform.
4. Copy the kubectl command that is presented on the screen and run it in your Kubernetes environment.

Once your cluster is connected to Director Online, start exploring stateful applications and OpenEBS storage which are running in your cluster.  

<br><br>

## What information is sent from my Kubernetes to Director Online?



<img src="/docs/assets/moconnect.svg" alt="Secure connectivity between Director Online and K8s" width="800"/>

<br><br>

Director Online agents are installed in a namespace called `maya-system`. These agents primarily include 

- Prometheus client that collects metrics from OpenEBS volumes and export them to Director Online.
- Topology client that queries Kubernetes resources and send the status when requested.
- Fluentd aggregators that export the logs to Director Online.

User's data is never looked into or exported to Director Online by the agents. 

**Note**: Director Online administrators will have read-only access to the topology, metrics and logs that are exported to Director Online.  

<br>

[<img src="/docs/assets/mo-getstarted.png" width="400">](https://director.mayadata.io)

<br>



## Example Dashboards at Director Online

### Landing page

<img src="/docs/assets/MO-import2.png" alt="Sample dashboard at Director Online" width="800"/>

<br><br>

### cStor pool view

<img src="/docs/assets/mo-pool-view.png" alt="Sample dashboard at Director Online" width="800"/>

<br><br>

### cStor volume pod view

<img src="/docs/assets/mo-pod-view.png" alt="Sample dashboard at Director Online" width="800"/>

<br><br>

### cStor custom resources view 

<img src="/docs/assets/mo-cr-view.png" alt="Sample dashboard at Director Online" width="800"/>

<br><br>



### See Also


#### [Connect to Director Online](https://director.mayadata.io/)

#### [Getting started with Director Online](https://help.mayadata.io/hc/en-us/articles/360033029212-Getting-started-with-DirectorOnline)

<br>

<hr>

<br>

