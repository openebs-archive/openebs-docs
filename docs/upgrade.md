---
id: upgrade
title: Upgrading OpenEBS
sidebar_label: Upgrade
---
------

Latest stable version of OpenEBS is 2.4.0. Check the release notes [here](https://github.com/openebs/openebs/releases/tag/v2.4.0).  Upgrade to the latest OpenEBS 2.4.0 version is supported only from 1.0.0 and later. The steps for upgrading from these versions can be found [here](https://github.com/openebs/openebs/blob/master/k8s/upgrades/README.md).

Note: If you are upgrading Jiva volumes that are running in version 1.6 and 1.7, you must use these [pre-upgrade steps](https://github.com/openebs/charts/tree/gh-pages/scripts/jiva-tools) to check if your jiva volumes are impacted by [#2956](https://github.com/openebs/openebs/issues/2956). If they are, please reach out to [OpenEBS Community](/docs/next/support.html) for helping you with the upgrade.


## Supported upgrade paths

:::note
To upgrade to the latest version from your current version, you have to follow the below upgrade path.
:::

From 1.0.0 and higher to latest version - Get the steps from [here](https://github.com/openebs/openebs/blob/master/k8s/upgrades/README.md).

From 0.9.0 to 1.0.0 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.9.0-1.0.0).

From 0.8.2 to 0.9.0 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.8.2-0.9.0).

From 0.8.1 to 0.8.2 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.8.1-0.8.2).

From 0.8.0 to 0.8.1 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades/0.8.0-0.8.1).

From versions prior to 0.8.0 - Get the steps from [here](https://github.com/openebs/openebs/tree/master/k8s/upgrades).



<hr>

## See Also:

### [See Release Notes](/docs/next/releases.html)

### [Join our Community](/docs/next/support.html)

### [Checkout Troubleshooting guides](/docs/next/troubleshooting.html)


<br>
<hr>
<br>


