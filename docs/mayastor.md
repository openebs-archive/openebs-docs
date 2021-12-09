---
id: mayastor
title: Mayastor
sidebar_label: Mayastor
---
----
<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  OpenEBS Documentation is now migrated to https://openebs.io/docs. The page you are currently viewing is a static snapshot and will be removed in the upcoming releases. </strong></p></center>

## What is Mayastor?

**Mayastor** is currently under development as a sub-project of the Open Source CNCF project [**OpenEBS**](https://openebs.io/).  OpenEBS is a "Container Attached Storage" or CAS solution which extends Kubernetes with a declarative data plane, providing flexible, persistent storage for stateful applications.

Design goals for Mayastor include:

* Highly available, durable persistence of data.
* To be readily deployable and easily managed by autonomous SRE or development teams.
* To be a low-overhead abstraction.

OpenEBS Mayastor incorporates Intel's [Storage Performance Development Kit](https://spdk.io/).  It has been designed from the ground up to leverage the protocol and compute efficiency of NVMe-oF semantics,  and the performance capabilities of the latest generation of solid-state storage devices, in order to deliver a storage abstraction with performance overhead measured to be within the range of single-digit percentages. 

By comparison, most pre-CAS shared everything storage systems are widely thought to impart an overhead of at least 40% and sometimes as much as 80% or more than the capabilities of the underlying devices or cloud volumes. Additionally, pre-CAS shared storage scales in an unpredictable manner as I/O from many workloads interact and complete for the capabilities of the shared storage system.  

While Mayastor utilizes NVMe-oF, it does not require NVMe devices or cloud volumes to operate, as is explained below.  

>**Mayastor is beta software** and is under active development. 

To learn more about Mayastor architecture, concepts and get started, please visit the user documentation published here in GitBook format: [mayastor.gitbook.io](https://mayastor.gitbook.io/).

## Source Code

If you would like to check out the source code or contribute to Mayastor, head over to GitHub: https://github.com/openebs/mayastor.

## Community Support via Slack

OpenEBS has a vibrant community that can help you get started. If you have further question and want to learn more about OpenEBS and/or Mayastor, please join [OpenEBS community on Kubernetes Slack](https://kubernetes.slack.com). If you are already signed up, head to our discussions at [#openebs](https://kubernetes.slack.com/messages/openebs/) channel. 

<br>
<br>
