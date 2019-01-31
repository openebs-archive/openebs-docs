---
id: mayactl
title: OpenEBS CLI - mayactl
sidebar_label: mayactl
---
------

`mayactl` is the command line tool for interacting with OpenEBS volumes. `mayactl` is not used/required while provisioning or managing the OpenEBS volumes, but it is currently used while debugging and troubleshooting. 

For getting access to mayactl command line tool, you will have to login / execute into the maya-apiserver pod on Kubernetes. The steps are outlined below.

## Accesssing mayactl

1. Find out the name of the maya-apiserver

   ```
   kubectl get pods -n openebs | grep -i maya-apiserver
   ```
   Following is an example output

   ```
   maya-apiserver-7bc857bb44-wm2g4              1/1       Running   0          4h
   ```

2. It is possible that there are multiple instances of maya-apiserver pods for scaling purposes. You can run mayactl in any one of them. Pick one of the pods using ` kubectl exec` command . You can do as following way.

   ```
   kubectl exec -it <maya-apiserver-podname> /bin/bash  -n openebs
   ```

   You will get access to the bash shell of maya-apiserver pod like shown below.

   `bash-4.3# ` 

## Using mayactl

Once you are inside the maya -apiserver,use mayactl help command for more details.

```
mayactl --help
```

**Example:**

```
/ # mayactl --help
Maya means 'Magic' a tool for storage orchestration

Usage:
  mayactl [command]

Available Commands:
  completion  Outputs shell completion code for the specified shell (bash or zsh)
  help        Help about any command
  pool        Provides operations related to a storage pool
  version     Prints version and other details relevant to maya
  volume      Provides operations related to a Volume
```

### mayactl for OpenEBS Storage Volume

OpenEBS storage volume command usage examples are shown below.

```
/ # mayactl volume

The following commands helps in operating a Volume such as create, list, and so on.

Usage: mayactl volume <subcommand> [options] [args]

Examples:
 # List Volumes:
   $ mayactl volume list

 # Statistics of a Volume:
   $ mayactl volume stats --volname <vol>

 # Statistics of a Volume created in 'test' namespace:
   $ mayactl volume stats --volname <vol> --namespace test

 # Info of a Volume:
   $ mayactl volume describe --volname <vol>

 # Info of a Volume created in 'test' namespace:
   $ mayactl volume describe --volname <vol> --namespace test

 # Delete a Volume:
   $ mayactl volume delete --volname <vol>

 # Delete a Volume created in 'test' namespace:
   $ mayactl volume delete --volname <vol> --namespace test

Usage:
  mayactl volume [command]

Available Commands:
  delete      Deletes a Volume
  describe    Displays Openebs Volume information
  list        Displays status information about Volume(s)
  stats       Displays the runtime statisics of Volume
```

**Example:**

The following command shows the list all the OpenEBS volumes including both Jiva and cStor.

```
/ # mayactl volume list
Namespace  Name                                      Status   Type   Capacity

---

default    pvc-c7f9b9a2-f6d9-11e8-9883-42010a8000b7  Running  jiva   4G
openebs    pvc-743678ac-f6cf-11e8-9883-42010a8000b7  Running  cstor  4G
openebs    pvc-e5116635-f6d6-11e8-9883-42010a8000b7  Running  cstor  4G
```

The following is an example output of description of cstor volume.

```
/ # mayactl volume describe --volname pvc-743678ac-f6cf-11e8-9883-42010a8000b7

Portal Details :

IQN               :   iqn.2016-09.com.openebs.cstor:pvc-743678ac-f6cf-11e8-9883-42010a8000b7
Volume            :   pvc-743678ac-f6cf-11e8-9883-42010a8000b7
Portal            :   10.79.240.103:3260
Size              :   4G
Controller Status :   running,running,running
Controller Node   :   gke-ranjith-080-default-pool-8d4e3480-qsvn
Replica Count     :   3

Replica Details :

NAME                                                                STATUS      POOL NAME                  NODE

---

pvc-743678ac-f6cf-11e8-9883-42010a8000b7-cstor-sparse-pool-h8gl     Running     cstor-sparse-pool-h8gl     gke-ranjith-080-default-pool-8d4e3480-b50p
pvc-743678ac-f6cf-11e8-9883-42010a8000b7-cstor-sparse-pool-s7rs     Running     cstor-sparse-pool-s7rs     gke-ranjith-080-default-pool-8d4e3480-rb03
pvc-743678ac-f6cf-11e8-9883-42010a8000b7-cstor-sparse-pool-wt1u     Running     cstor-sparse-pool-wt1u     gke-ranjith-080-default-pool-8d4e3480-qsvn
```

The following is an example output of description of Jiva volume.

```
/ # mayactl volume describe --volname pvc-c7f9b9a2-f6d9-11e8-9883-42010a8000b7

Portal Details :

IQN               :   iqn.2016-09.com.openebs.jiva:pvc-c7f9b9a2-f6d9-11e8-9883-42010a8000b7
Volume            :   pvc-c7f9b9a2-f6d9-11e8-9883-42010a8000b7
Portal            :   10.79.246.86:3260
Size              :   4G
Controller Status :   running,running
Controller Node   :   gke-ranjith-080-default-pool-8d4e3480-rb03
Replica Count     :   3

Replica Details :

NAME                                                              ACCESSMODE      STATUS      IP             NODE

---

pvc-c7f9b9a2-f6d9-11e8-9883-42010a8000b7-rep-76f8ff8db5-k596j     RW              running     10.76.0.8      gke-ranjith-080-default-pool-8d4e3480-rb03
pvc-c7f9b9a2-f6d9-11e8-9883-42010a8000b7-rep-76f8ff8db5-w6dwv     RW              running     10.76.2.13     gke-ranjith-080-default-pool-8d4e3480-qsvn
pvc-c7f9b9a2-f6d9-11e8-9883-42010a8000b7-rep-76f8ff8db5-xmcq8     RW              running     10.76.1.9      gke-ranjith-080-default-pool-8d4e3480-b50p
```

The following is an example output of statistics of cStor volume.

```
/ # mayactl volume stats --volname pvc-511632a0-fa0a-11e8-b091-42010a800143 -n openebs

Portal Details :
---------------
IQN     :   iqn.2016-09.com.openebs.cstor:pvc-511632a0-fa0a-11e8-b091-42010a800143
Volume  :   pvc-511632a0-fa0a-11e8-b091-42010a800143
Portal  :   localhost
Size    :   5.000000

Performance Stats :
--------------------
r/s      w/s      r(MB/s)      w(MB/s)      rLat(ms)      wLat(ms)
----     ----     --------     --------     ---------     ---------
0        2022     0.000        1.991        0.000         267.145

Capacity Stats :
---------------
LOGICAL(GB)      USED(GB)
------------     ---------
0.000            0.178
```



### mayactl for OpenEBS Storage Pools

OpenEBS storage pool command usage examples are shown below.

```
/ # mayactl pool

Command provides operations related to a storage pools.

Usage: mayactl pool <subcommand> [options] [args]

Examples:
  # Lists pool:
    $ mayactl pool list

Usage:
  mayactl pool [command]

Available Commands:
  describe    Describes the pools
  list        Lists all the pools


```

**Example:**

The following command shows the list all the OpenEBS cStor Pools.

```
/ # mayactl pool list

POOL NAME                  NODE NAME                                      POOL TYPE
---------                  ---------                                      ---------
cstor-sparse-pool-h8gl     gke-ranjith-080-default-pool-8d4e3480-b50p     striped
cstor-sparse-pool-s7rs     gke-ranjith-080-default-pool-8d4e3480-rb03     striped
cstor-sparse-pool-wt1u     gke-ranjith-080-default-pool-8d4e3480-qsvn     striped

```

The following is an example output of description of cstor pool.

```
/ # mayactl pool describe --poolname cstor-sparse-pool-h8gl

Pool Details :
--------------
Storage Pool Name  : cstor-sparse-pool-h8gl
Node Name          : gke-ranjith-080-default-pool-8d4e3480-b50p
CAS Template Used  : cstor-pool-create-default-0.8.0
CAS Type           : cstor
StoragePoolClaim   : cstor-sparse-pool
UID                : 9f9ae3fc-f6cd-11e8-9883-42010a8000b7
Pool Type          : striped
Over Provisioning  : false

Disk List :
-----------
sparse-59357cb2a1a5e0c8b5a5ac5ed3d7e050
```

### mayactl version

You can get the installed mayactl version by using the following command. This will show the OpenEBS released version also.

```
mayactl version
```

 **Examples:**

```
/ # mayactl version
Version: 0.8.0-unreleased
Git commit: 87d14b636ad24db973403d5d8acdd65aa4ba4357
GO Version: go1.11.2
GO ARCH: amd64
GO OS: linux
m-apiserver url:  http://10.76.2.6:5656
m-apiserver status:  running
```

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
