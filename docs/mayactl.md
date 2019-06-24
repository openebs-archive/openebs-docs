---
id: mayactl
title: mayactl
sidebar_label: mayactl
---
------

The `mayactl` is the command line tool for interacting with OpenEBS volumes and Pools. The  `mayactl` is not used or required while provisioning or managing the OpenEBS volumes, but it is currently used while debugging and troubleshooting.  OpenEBS volume and pool status can be get using the `mayactl` command.



<h3><a class="anchor" aria-hidden="true" id="summary"></a>Summary</h3>

[Command used with mayactl](#commands-used-with-mayactl)

[Accesssing mayactl](#accesssing-mayactl)

[Using mayactl](#using-mayactl)



## Commands used with mayactl

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



## Accesssing mayactl

For getting access to `mayactl` command line tool, you have to login or execute into the maya-apiserver pod on Kubernetes. The steps are outlined below.

1. Find out the name of the maya-apiserver

   ```
   kubectl get pod -n openebs | grep -i api
   ```

   Following is an example output.

   <div class="co">maya-apiserver-7f5689b96b-tfssh                                   1/1       Running   0          10d</div>

   

2. It is possible that there are multiple instances of maya-apiserver pods for scaling purposes. You can run mayactl in any one of them. Shell into one of the pods using ` kubectl exec` command . You can do as following way.

   ```
   kubectl exec -it <maya-apiserver-podname> /bin/bash  -n openebs
   ```

   You will get access to the bash shell of maya-apiserver pod like shown below.

   <div class="co">bash-4.3#</div>



## Using mayactl

Once you are inside the maya -apiserver,use mayactl help command for more details.

```
mayactl help
```

**Example Output:**

<div class="co">Maya means 'Magic' a tool for storage orchestration
Usage:
  mayactl [command]
Available Commands:
  completion  Outputs shell completion code for the specified shell (bash or zsh)
  help        Help about any command
  pool        Provides operations related to a storage pool
  version     Prints version and other details relevant to maya
  volume      Provides operations related to a Volume</div>


<h3><a class="anchor" aria-hidden="true" id="mayactl-for-OpenEBS-Storage-Volume"></a>mayactl for OpenEBS Storage Volume</h3>

OpenEBS storage volume command usage examples are shown below.

```
mayactl volume
```

 **Example Output:**

<div class="co">The following commands helps in operating a Volume such as create, list, and so on.
Usage: mayactl volume <subcommand> [options] [args]
Examples:
 > List Volumes: 
   $ mayactl volume list
 > Statistics of a Volume:
   $ mayactl volume stats --volname <vol>
 > Statistics of a Volume created in 'test' namespace:
   $ mayactl volume stats --volname <vol> --namespace test
 > Info of a Volume:
   $ mayactl volume describe --volname <vol>
 > Info of a Volume created in 'test' namespace:
   $ mayactl volume describe --volname <vol> --namespace test
Usage:
  mayactl volume [command]
Available Commands:
  describe    Displays Openebs Volume information
  list        Displays status information about Volume(s)
  stats       Displays the runtime statisics of Volume
</div>



The following command shows the list of all OpenEBS volumes including both Jiva and cStor.

```
mayactl volume list
```

**Example Output:**

<div class="co">Namespace  Name                                      Status   Type   Capacity  StorageClass          Access Mode
---------  ----                                      ------   ----   --------  -------------         -----------
openebs    pvc-dc3cb979-51ec-11e9-803f-42010a800179  Running  cstor  8G        openebs-cstor-sparse  ReadWriteOnce</div>



The following command shows the description of a OpenEBS volume.

```
mayactl volume describe --volname pvc-dc3cb979-51ec-11e9-803f-42010a800179 -n openebs
```

**Example Output:**

<div class="co">Portal Details :
-------- --------
IQN               :   iqn.2016-09.com.openebs.cstor:pvc-dc3cb979-51ec-11e9-803f-42010a800179
Volume            :   pvc-dc3cb979-51ec-11e9-803f-42010a800179
Portal            :   10.67.247.34:3260
Size              :   8G
Controller Status :   running,running,running
Controller Node   :   gke-ranjith-082-default-pool-2cd2b6cb-l4ck
Replica Count     :   3
Replica Details :
-----------------
NAME                                                                STATUS      POOL NAME                  NODE
----                                                                ------      ---------                  -----  
pvc-dc3cb979-51ec-11e9-803f-42010a800179-cstor-sparse-pool-ejs2     Running     cstor-sparse-pool-ejs2     gke-ranjith-082-default-pool-2cd2b6cb-dphl
pvc-dc3cb979-51ec-11e9-803f-42010a800179-cstor-sparse-pool-gf1d     Running     cstor-sparse-pool-gf1d     gke-ranjith-082-default-pool-2cd2b6cb-l4ck
pvc-dc3cb979-51ec-11e9-803f-42010a800179-cstor-sparse-pool-m8cy     Running     cstor-sparse-pool-m8cy     gke-ranjith-082-default-pool-2cd2b6cb-x571
</div>

The following command shows the live statistics of OpenEBS volume.

```
mayactl volume stats --volname pvc-448deccf-40d9-11e9-a23b-0050569331ce -n openebs
```

**Example Output:**

<div class="co">Portal Details :
------ ---------
Volume  :   pvc-dc3cb979-51ec-11e9-803f-42010a800179
Size    :   5.000000
Performance Stats :
------ ---------
r/s      w/s      r(MB/s)      w(MB/s)      rLat(ms)      wLat(ms)
----     ----     --------     --------     ---------     ---------
0        121      0.000        0.013        0.000         9.495
Capacity Stats :
------ ---------
LOGICAL(GB)      USED(GB)
------------     ---------
0.000            3.246
</div>



<h3><a class="anchor" aria-hidden="true" id="mayactl-for-OpenEBS-Storage-Pools"></a>mayactl for OpenEBS Storage Pools</h3>

OpenEBS storage pool command usage examples are shown below.

```
mayactl pool
```

It will show the available commands which can run with `mayactl` for getting details of OpenEBS pools.



<div class="co">Command provides operations related to a storage pools.
Usage: mayactl pool <subcommand> [options] [args]
Examples:
  > Lists pool:
    $ mayactl pool list
Usage:
  mayactl pool [command]
Available Commands:
  describe    Describes the pools
  list        Lists all the pools
</div>



The following command shows the list of all OpenEBS StoragePools.

```
mayactl pool list
```

**Example Output:**

<div class="co">POOL NAME                  NODE NAME              POOL TYPE
---------                  ---------              ---------
cstor-pool1-5lwv           node3.mayalab.com      striped
cstor-pool1-qba6           node2.mayalab.com      striped
cstor-pool1-v4oy           node4.mayalab.com      striped
</div>



The following command show the description of OpenEBS StoragePool.

```
 mayactl pool describe --poolname cstor-pool1-5lwv
```

**Example Output:**

<div class="co">Pool Details :
------ ------
Storage Pool Name  : cstor-pool1-5lwv
Node Name          : node3.mayalab.com
CAS Template Used  : cstor-pool-create-default-0.9.0
CAS Type           : cstor
StoragePoolClaim   : cstor-pool1
UID                : fb2bd1d8-2f88-11e9-a23b-0050569331ce
Pool Type          : striped
Over Provisioning  : false
Disk List :
------ ------
disk-42b4fb20cd36896dfc2a486b977363de
</div>



<h3><a class="anchor" aria-hidden="true" id="mayactl-Version"></a>mayactl Version</h3>

OpenEBS installed version can be obtained using the following command. This will show the status of maya-apiserver and its URL.

```
mayactl version
```

 **Example Output:**

<div class="co">Version: 0.9.0-released
Git commit: e696a06dc4be38ea7d2f5689f2ed5bd30ee92e89
GO Version: go1.11.2
GO ARCH: amd64
GO OS: linux
m-apiserver url:  http://10.64.0.13:5656
m-apiserver status:  running
</div>





<br>

## See Also:

### [Day 2 Operations](/v090/docs/next/operations.html)

### [Troubleshooting Guide](/v090/docs/next/troubleshooting.html)

### <br>

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
