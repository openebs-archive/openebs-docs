---
id: mayactl
title: OpenEBS CLI - mayactl
sidebar_label: mayactl
---
------

`mayactl` is the command line tool for interacting with OpenEBS volumes. `mayactl` is not used/required while provisioning or managing the OpenEBS volumes, but it is currently used while debugging and troubleshooting. 

For getting access to mayactl command line tool, you will have to login / execute into the maya-apiserver pod on Kubernetes. The steps are outlined below.



1. Find out the name of the maya-apiserver

   ```
   ubuntu@kubemaster-01:~$ kubectl get pods -n openebs | grep -i maya-apiserver
   maya-apiserver-84fd4f776d-wx6vp                1/1       Running   0          17h
   ```

2. It is possible that there are multiple instances of maya-apiserver pods for scaling purposes. You can run mayactl in any one of them. Pick one of the pods for the below `exec` command

   ```
   ubuntu@kubemaster-01:~$ kubectl exec -it maya-apiserver-84fd4f776d-wx6vp /bin/bash  -n openebs
   bash-4.3#
   ```

3. Use mayactl -- help to get further help

   `Note: In OpenEBS versions 0.5.3 and earlier the tool name is maya . From version 0.6 onwards, the tool is renamed from maya to mayactl `

   ​

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

4. Volume related mayactl commands are as follows:

   ```
   bash-4.3#  mayactl volume --help

   The following commands helps in operating a Volume such as create, list, and so on.

   Usage: mayactl volume <subcommand> [options] [args]

   Examples:

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

   Usage:
     mayactl volume [command]

   Available Commands:
     create      Creates a new Volume
     delete      Deletes a Volume
     info        Displays Openebs Volume information
     list        Displays status information about Volume(s)
     stats       Displays the runtime statisics of Volumes

   ```

5. Volume snapshot related mayactl commands are as follows:

   ```
   bash-4.3#  mayactl snapshot --help

   Command provides operations related to a volume snapshot.

   If you have specified an OpenEBS volume in a namespace other than the 'default',
   you must use --namespace flag with a command. If not, you will see the results only
   in the 'default' namespace.

   Usage: mayactl snapshot <subcommand> [options] [args]

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
