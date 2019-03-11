---
id: mayactl
title: Mayactl
sidebar_label: Mayactl
---
------

The `mayactl` is the command line tool for interacting with OpenEBS volumes and Pools. The  `mayactl` is not used or required while provisioning or managing the OpenEBS volumes, but it is currently used while debugging and troubleshooting.  OpenEBS volume and pool status can be get using the `mayactl` command.



## Summary

### [Command used with mayactl](#Commands-used-with-mayactl)

### [Accesssing mayactl](#Accesssing-mayactl)

### [Using mayactl](#Using-mayactl)



<h3><a class="anchor" aria-hidden="true" id="Commands-used-with-mayactl"></a>Commands used with mayactl</h3>

The following commands can be run using mayactl to get the details of OpenEBS volume, StoragePool and installed version.

1. OpenEBS volume related
   - mayactl volume list
   - mayactl volume stats
   - mayactl volume describe
2. OpenEBS StoragePool related
   - mayactl pool list
   - mayactl pool describe
3. OpenEBS version related
   - mayactl version

<h3><a class="anchor" aria-hidden="true" id="Accesssing-mayactl"></a>Accesssing mayactl</h3>

For getting access to `mayactl` command line tool, you have to login or execute into the maya-apiserver pod on Kubernetes. The steps are outlined below.

1. Find out the name of the maya-apiserver

   ```
   kubectl get pod -n openebs | grep -i api
   ```

   Following is an example output

   ```
   maya-apiserver-7f5689b96b-tfssh                                   1/1       Running   0          10d
   ```

2. It is possible that there are multiple instances of maya-apiserver pods for scaling purposes. You can run mayactl in any one of them. Shell into one of the pods using ` kubectl exec` command . You can do as following way.

   ```
   kubectl exec -it <maya-apiserver-podname> /bin/bash  -n openebs
   ```

   You will get access to the bash shell of maya-apiserver pod like shown below.

   `bash-4.3# ` 



<h3><a class="anchor" aria-hidden="true" id="Using-mayactl"></a>Using mayactl</h3>

Once you are inside the maya -apiserver,use mayactl help command for more details.

```
mayactl help
```

**Example Output:**

```
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



<h4><a class="anchor" aria-hidden="true" id="mayactl-for-OpenEBS-Storage-Volume"></a>mayactl for OpenEBS Storage Volume</h4>

OpenEBS storage volume command usage examples are shown below.

```
mayactl volume
```

 **Example Output:**

```
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

Usage:
  mayactl volume [command]

Available Commands:
  describe    Displays Openebs Volume information
  list        Displays status information about Volume(s)
  stats       Displays the runtime statisics of Volume
```

The following command shows the list all the OpenEBS volumes including both Jiva and cStor.

```
 mayactl volume list
```

**Example Output:**

```
Namespace   Name                                      Status   Type   Capacity  StorageClass            Access Mode
---------   ----                                      ------   ----   --------           -------------           -----------
openebs     pvc-448deccf-40d9-11e9-a23b-0050569331ce  Running  cstor  5G        	cstor081-demo-pool1     ReadWriteOnce
```

The following command shows the description of a cStor volume.

```
 mayactl volume describe --volname pvc-448deccf-40d9-11e9-a23b-0050569331ce -n openebs
```

**Example Output:**

```
Portal Details :
----------------
IQN               :   iqn.2016-09.com.openebs.cstor:pvc-448deccf-40d9-11e9-a23b-0050569331ce
Volume            :   pvc-448deccf-40d9-11e9-a23b-0050569331ce
Portal            :   172.28.9.26:3260
Size              :   5G
Controller Status :   running,running,running
Controller Node   :   node7.mayalab.com
Replica Count     :   3

Application Details:
--------------------
Application Pod Name      : N/A
Application Pod Namespace : N/A

Replica Details :
-----------------
NAME                                                          STATUS      POOL NAME          	   NODE
----                                                          ------      ---------           	   -----
pvc-448deccf-40d9-11e9-a23b-0050569331ce-cstor-pool1-5lwv     Running     cstor-pool1-5lwv     node3.mayalab.com
pvc-448deccf-40d9-11e9-a23b-0050569331ce-cstor-pool1-qba6     Running     cstor-pool1-qba6     node2.mayalab.com
pvc-448deccf-40d9-11e9-a23b-0050569331ce-cstor-pool1-v4oy     Running     cstor-pool1-v4oy     node4.mayalab.com

```

The following command shows the live statistics of cStor volume.

```
mayactl volume stats --volname pvc-448deccf-40d9-11e9-a23b-0050569331ce -n openebs
```

**Example Output:**

```
Portal Details :
---------------
IQN     :
Volume  :   pvc-448deccf-40d9-11e9-a23b-0050569331ce
Portal  :
Size    :   5.000000

Performance Stats :
--------------------
r/s      w/s      r(MB/s)      w(MB/s)      rLat(ms)      wLat(ms)
----     ----     --------     --------     ---------     ---------
0        121      0.000        0.013        0.000         9.495

Capacity Stats :
---------------
LOGICAL(GB)      USED(GB)
------------     ---------
0.000            3.246

```



<h4><a class="anchor" aria-hidden="true" id="mayactl-for-OpenEBS-Storage-Pools"></a>mayactl for OpenEBS Storage Pools</h4>

OpenEBS storage pool command usage examples are shown below.

```
mayactl pool
```

It will show the available commands which can run with `mayactl` for getting details of OpenEBS pools.

<div class="co">Command provides operations related to a storage pools.
Usage: mayactl pool <subcommand> [options] [args]
Examples:
  # Lists pool:
    $ mayactl pool list
Usage:
  mayactl pool [command]
Available Commands:
  describe    Describes the pools
  list        Lists all the pools
</div>

```
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

The following command shows the list all the OpenEBS cStor Pools.

**Example Output:**

<div class="co">POOL NAME                  NODE NAME              POOL TYPE
---------                  ---------              ---------
cstor-pool1-5lwv           node3.mayalab.com      striped
cstor-pool1-qba6           node2.mayalab.com      striped
cstor-pool1-v4oy           node4.mayalab.com      striped
</div>

```
POOL NAME                  NODE NAME              POOL TYPE
---------                  ---------              ---------
cstor-pool1-5lwv           node3.mayalab.com      striped
cstor-pool1-qba6           node2.mayalab.com      striped
cstor-pool1-v4oy           node4.mayalab.com      striped
```

The following command show the description of cStor pool.

```
 mayactl pool describe --poolname cstor-pool1-5lwv
```

**Example Output:**

<div class="co">Pool Details :
------ ------
Storage Pool Name  : cstor-pool1-5lwv
Node Name          : node3.mayalab.com
CAS Template Used  : cstor-pool-create-default-0.8.1
CAS Type           : cstor
StoragePoolClaim   : cstor-pool1
UID                : fb2bd1d8-2f88-11e9-a23b-0050569331ce
Pool Type          : striped
Over Provisioning  : false
Disk List :
------ ------
disk-42b4fb20cd36896dfc2a486b977363de
</div>

```
Pool Details :
--------------
Storage Pool Name  : cstor-pool1-5lwv
Node Name          : node3.mayalab.com
CAS Template Used  : cstor-pool-create-default-0.8.1
CAS Type           : cstor
StoragePoolClaim   : cstor-pool1
UID                : fb2bd1d8-2f88-11e9-a23b-0050569331ce
Pool Type          : striped
Over Provisioning  : false

Disk List :
-----------
disk-42b4fb20cd36896dfc2a486b977363de
```



<h4><a class="anchor" aria-hidden="true" id="mayactl-Version"></a>mayactl Version</h4>

You can get the installed mayactl version by using the following command. This will show the OpenEBS released version also.

```
mayactl version
```

 **Example Output:**

<div class="co">Version: 0.8.1-released
Git commit: 43ad5ca8f3d36995afbce3914d0be8ecd8a8de13
GO Version: go1.11.2
GO ARCH: amd64
GO OS: linux
m-apiserver url:  http://192.29.0.188:5656
m-apiserver status:  running
</div>



<br>

## See Also:



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
