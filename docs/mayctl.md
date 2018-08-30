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
   `maya-apiserver-68c98fdb76-xhvxg              1/1       Running   0          3m `

2. It is possible that there are multiple instances of maya-apiserver pods for scaling purposes. You can run mayactl in any one of them. Pick one of the pods for the below `exec` command

   ```
   kubectl exec -it <maya-apiserver-podname> /bin/bash  -n openebs
   ```

   You will get access to the bash shell of maya-apiserver pod like shown below.

   `bash-4.3# ` 

## Using mayactl

1. Use mayactl help command for more details

   ```
   mayactl —help 
   ```


   **Example:**

   ```
   bash-4.3#mayactl --help
   Maya means 'Magic' a tool for storage orchestration
      
   Usage:
   mayactl [command]
      
   Available Commands:
   help        Help about any command
   snapshot    Provides operations related to a Volume snapshot
   version     Prints version and other details relevant to maya
   volume      Provides operations related to a Volume
   ```

2. mayactl volume command is the most often used one. In 0.6 release `mayactl volume info` command is added

   Volume command usage examples are shown below.

   ```
   # Create a Volume:
   $ mayactl volume create --volname <vol> --size <size>
     
   # List Volumes:
   $ mayactl volume list
      
   # Delete a Volume:
   $ mayactl volume delete --volname <vol>
      
   # Delete a Volume created in 'test' namespace:
   $ mayactl volume delete --volname <vol> --namespace test
      
   # Statistics of a Volume:
   $ mayactl volume stats --volname <vol>
      
   # Statistics of a Volume created in 'test' namespace:
   $ mayactl volume stats --volname <vol> --namespace test
      
   # Info of a Volume:
   $ mayactl volume info --volname <vol>

   # Info of a Volume created in 'test' namespace:
   $ mayactl volume info --volname <vol> --namespace test
   ```

   

3. `mayactl volume snapshot` command is used to manage the snapshots of a volume. Some examples of the usage are shown below. 

   ```
   Examples:
   # Create a snapshot:
   $ mayactl snapshot create --volname <vol> --snapname <snap>
   
   # Create a snapshot for a volume created in 'test' namespace
   $ mayactl snapshot create --volname <vol> --snapname <snap> --namespace test
   
   # Lists snapshot:
   $ mayactl snapshot list --volname <vol>
   
   # Lists snapshots for a volume created in 'test' namespace
   $ mayactl snapshot list --volname <vol> --namespace test
   
   # Reverts a snapshot:
   $ mayactl snapshot revert --volname <vol> --snapname <snap>
   
   # Revert a snapshot for a volume created in 'test' namespace
   $ mayactl snapshot revert --volname <vol> --snapname <snap> --namespace test
   
   Usage:
     mayactl snapshot [command]
   
   Available Commands:
     create      Creates a new Snapshot
     list        Lists all the snapshots of a Volume
     revert      Reverts to specific snapshot of a Volume
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
