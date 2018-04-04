---
id: cicd
title: OpenEBS Usecases - CI/CD
sidebar_label: CI/CD
---

Description <TBD>

## Problems

Application developers of containerized applications rely on the development ecosystem for agility. CI/CD is part of the eco-system that enables applications to be tested through various pipelines (CI) and deployed into production automatically (CD) at the end of successful CI. Many of these containerized applications are stateful in nature, databases in most cases, go through state changes while being tested in the CI pipeline stages. When one of the stages of pipeline fails, developers would like to reproduce the state of the stateful application for further debugging. DevOps admins need a solution where preserving the state of the application at each stage of the pipeline is very easy and seamlessly integrated into the CI/CD platforms such as Jenkins using the API. 

## OpenEBS solution

OpenEBS provides a perfect solution for this problem. OpenEBS has integrated the snapshot capabilities into Kubernetes way of taking stateful application snapshots and provides a snapshot provisioner to reproduce the state of the application from a given snapshot. 



![CI/CD pipeline for Developers](/docs/assets/cicd-snapshots.png)



DevOps admin integrates Jenkins/Travis/other CI-CD system to provision and take snapshot as shown above. At the end of CI pipeline, the OpenEBS volume and all the snapshots are deleted/destroyed. Once CD is done, DevOps admin configures the OpenEBS volume such that periodic snapshots are taken and preserved.

<< Spec file for taking a snapshot>>

<<kubectl apply -f >>

<<Kubeapi for taking a snapshot>>



How to take periodic snapshots of a given OpenEBS volume

When a stage of CI pipeline fails, the DevOps admin can easily restore the state of the stateful application and provide access to the application developer, most like in an automated way. 



![Restoring the state of a stateful application](/docs/assets/snap-restore.png)

<< spec file for new PVC with snapshot>>

<<Kubectl apply -f pvc.yaml>>



## Conclusion

With OpenEBS , developers and DevOps admin can easily and seamlessly automate the process of reproducing the status of a failed stateful application pipeline stage. 



### See Also

Learn more about how OpenEBS volumes work

Volume Policies of OpenEBS



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
