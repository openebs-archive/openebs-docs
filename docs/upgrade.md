---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---
------


Latest stable version of OpenEBS is 2.9.0. Check the release notes [here](https://github.com/openebs/openebs/releases/tag/v2.9.0).  


Upgrade to the latest OpenEBS 2.9.0 version is supported only from 1.0.0 and later. The steps for upgrading from can be found [here](https://github.com/openebs/openebs/blob/master/k8s/upgrades/README.md).



:::note
The community e2e pipelines verify upgrade testing only from non-deprecated releases (1.8 and higher) to 2.9. If you are running on release older than 1.8, OpenEBS recommends you upgrade to the latest version as soon as possible. 
:::

:::note
OpenEBS has deprecated arch specific container images in favor of multi-arch container images. After 2.6, the arch specific images are not pushed to Docker or Quay repositories. For example, images like `cstor-pool-arm64:2.8.0` should be replaced with corresponding multi-arch image `cstor-pool:2.8.0`. For further queries or support, please reach out to [OpenEBS Community](/v290/docs/next/support.html) for helping you with the upgrade.
:::

:::note
If you are upgrading Jiva volumes that are running in version 1.6 and 1.7, you must use these [pre-upgrade steps](https://github.com/openebs/charts/tree/gh-pages/scripts/jiva-tools) to check if your jiva volumes are impacted by [#2956](https://github.com/openebs/openebs/issues/2956). If they are, please reach out to [OpenEBS Community](/v290/docs/next/support.html) for helping you with the upgrade.
:::


## Supported upgrade paths

To upgrade to the latest version from your current version, you have to follow the below upgrade path.
- From 1.0.0 and higher to latest version - Get the steps from [here](https://github.com/openebs/openebs/blob/master/k8s/upgrades/README.md).
- From 0.9.0 to 1.0.0 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.9.0-1.0.0).
- From 0.8.2 to 0.9.0 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.8.2-0.9.0).
- From 0.8.1 to 0.8.2 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.8.1-0.8.2).
- From 0.8.0 to 0.8.1 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.8.0-0.8.1).
- From versions prior to 0.8.0 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades).

<hr>

## See Also:

### [See Release Notes](/v290/docs/next/releases.html)

### [Join our Community](/v290/docs/next/support.html)

### [Checkout Troubleshooting guides](/v290/docs/next/troubleshooting.html)


<br>
<hr>
<br>


