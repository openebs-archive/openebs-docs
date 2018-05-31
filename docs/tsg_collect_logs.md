---
id: tsgcollectlogs
title: Collecting OpenEBS Logs
sidebar_label: Collecting Logs
---

<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  Documentation for OpenEBS v0.5 is no longer actively maintained. The version you are currently viewing is a static snapshot. Click here for [latest](https://docs.openebs.io) version.
</strong></p></center>

------



### Overview of OpenEBS Logger 

Logger is a Kubernetes job which can be run on a cluster to extract pod logs and cluster information. It helps in troubleshoot/debugging activities. Logger runs the logger container *openebs/logger* and it is recommended to run for a specific duration to capture logs while attempting to reproduce issues.

### Benefits

Following are the benefits of using Logger.

- The purpose of Logger is to obtain debug-information/quick logs in clusters where more standard logging frameworks like EFK are not already configured. Logger creates a simple support bundle which can be provided to debug teams.
- This may be the case with most "non-production/development" infrastructures.

### Where is the Logger found?

You can find the Logger file at [https://github.com/openebs/litmus/blob/master/tools/logger/debugjob.yaml](https://github.com/openebs/test-storage/blob/master/logger/debugjob.yaml).

### How does Logger work?

Logger uses the following tool/command to work.

- Logger uses a **stern** tool to collect the pod logs.
- It uses kubectl commands to extract cluster information.

### Prerequisite

Logger requires the *kubeconfig* file mounted as a configmap (passed to stern binary). *kubeconfig* file is generally found under */etc/kubernetes/admin.conf* or *~/.kube/config* path.

## Running Logger

The following procedure helps you run Logger.

1. In the logger job's command, edit the logging duration (-d) and pod regex (-r) to specify which pods' logs should be captured and for how long. 

   For example, in the  `./logger.sh -d 5 -r maya,openebs,pvc;` command, the logs for pods starting with literals "maya", "openebs" and "pvc" are captured for a period of 5 minutes.

   **Note:** The duration is arrived depending on the average time taken for the issue/bug to manifest from the time a pod starts.

2. Create a Kubernetes job to run logger using the `kubectl apply -f debugjob.yaml` command.

3. This job will run for the duration specified in the previous steps.

4. The logs thus collected are placed in a logbundle (tarball) in */mnt* directory of the node in which the debug pod was scheduled.

5. Logs will be available in the node in which the debug pod/logger is scheduled when you run  a `kubectl get pod -o wide` command.

6. Attach this log support bundle while raising issues on the OpenEBS repository.

   ​


<!-- Hotjar Tracking Code for https://docs.openebs.io -->
<script>


```
   (function(h,o,t,j,a,r){
   		h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
   		h._hjSettings={hjid:785693,hjsv:6};
   		a=o.getElementsByTagName('head')[0];
   		r=o.createElement('script');r.async=1;
   		r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
   		a.appendChild(r);
   })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
```


</script>
