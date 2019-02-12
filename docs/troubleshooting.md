---
id: troubleshooting
title: Troubleshooting OpenEBS
sidebar_label: Troubleshooting
---
------

<font size="5">General guidelines for troubleshooting</font>

Connecting Kubernetes cluster to MayaOnline is the simplest and easiest way to monitor OpenEBS resources and volumes. Logs of OpenEBS pods available at MayaOnline are helpful for troubleshooting. Topology views of OpenEBS custom resources provide the live status which are helpful in the troubleshooting process.



**Steps for troubleshooting:**

- Join <a href="https://slack.openebs.io" target="_blank">OpenEBS slack </a>community
- Connect Kubernetes cluster to MayaOnline and observe the following
  - Any alerts that may be relevant to the issue under troubleshooting 
  - Logs that throw up any errors
  - Status of custom resources of OpenEBS volumes in the topology view
- Search for any reported issues on <a href=" https://stackoverflow.com/questions/tagged/openebs" target="_blank">StackOverflow under OpenEBS tag</a>



<br>

<font size="5">Areas of troubleshooting</font>

**Installation**

[Installation failed because insufficient user rights](/docs/next/troubleshooting.html#installation-failed-because-insufficient-user-rights)

[iSCSI client not setup. Pod is in ContainerCreating state](/docs/next/troubleshooting.html#iscsi-client-not-setup-pod-is-in-containercreating-state)

**Volume provisioning**

[Appliation complaining ReadOnly filesystem](/docs/next/troubleshooting.html#appliation-complaining-readonly-filesystem)

**Upgrades**



**Kubernetes related**

[Kubernetes node reboots because of increase in memory consumed by  Kubelet](/docs/next/troubleshooting.html#kubernetes-node-reboots-because-of-increase-in-memory-consumed-by-kubelet)



<hr>

<font size="6" color="blue">Installation</font>

### Installation failed because insufficient user rights

<br>

### iSCSI client not setup. Pod is in ContainerCreating state

<br>

<hr>



<font size="6" color="green">Volume provisioning</font>

<hr>

### Appliation complaining ReadOnly filesystem

<br>



<font size="6" color="orange">Upgrades</font>

<hr>

<br>



<font size="6" color="red">Kubernetes related</font>

<hr>

### Kubernetes node reboots because of increase in memory consumed by  Kubelet





<br>

## See Also:

### [FAQs](/docs/next/faq.html)

### [Seek support or help](/docs/next/support.html)

### [Latest release notes]()

<br>

<hr>

<br>



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
