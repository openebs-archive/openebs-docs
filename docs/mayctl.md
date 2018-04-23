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
   kubeshell:~$ kubectl get pods | grep maya-apiserver
   maya-apiserver-3053842955-zdlz4       1/1       Running            0          24d
   ```

2. It is possible that there are multiple instances of maya-apiserver pods for scaling purposes. You can run mayactl in any one of them. Pick one of the pods for the below `exec` command

   ```
   kubeshell:~$ kubectl exec -it maya-apiserver-3053842955-zdlz4 /bin/bash
   bash-4.3#
   ```

3. Use mayactl -- help to get further help

   `Note: In OpenEBS versions 0.5.3 and earlier the tool name is maya . From version 0.6 onwards, the tool is renamed from maya to mayactl `

   ​

   ```
   bash-4.3# mayactl -- help
   Usage: maya [--version] [--help] <command> [<args>]

   Available commands are:
       snapshot    Provides operations related to snapshot of a Volume
       version     Prints version and other details relevant to maya
       volume      Provides operations related to a Volume
   ```

4. Volume related mayactl commands are as follows:

   ```
   bash-4.3# mayactl --help volume
   Usage: mayactl volume <subcommand> [options] [args]

           This command provides operations related to a Volume.

           Create a Volume:
           $ mayactl volume create -volname <vol> -size <size>

           List Volumes:
           $ mayactl volume list

           Delete a Volume:
           $ mayactl volume delete -volname <vol>

           Statistics of a Volume:
           $ mayactl volume stats <vol>
   ```

5. Volume snapshot related mayactl commands are as follows:

   ```
   bash-4.3# mayactl --help snapshot
   Usage: mayactl snapshot <subcommand> [options] [args]

           This command provides operations related to snapshot of a Volume.

           Create snapshot:
           $ mayactl snapshot create -volname <vol> -snapname <snap>

           List snapshots:
           $ mayactl snapshot list -volname <vol>

           Revert to snapshot:
           $ mayactl snapshot revert -volname <vol> -snapname <snap>

   Subcommands:
       create    Creates snapshot of a Volume
       list      Lists all the snapshots of a Volume
       revert    Reverts to specific snapshot of a Volume
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
