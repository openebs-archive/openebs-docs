---
id: aws
title: Running OpenEBS on AWS
sidebar_label: AWS
---

------

In this section , we mentioning about the OpenEBS cluster installation in AWS. AWS has instance type which can be used for different type of use cases. Many of the instance type have EBS as storage for both root and general purposes, but some of the instance type have instance store volume which  is a temporary storage type located on disks that are physically attached to a host machine.

### Instance Store Volume

Instance store is ideal for temporary storage of information that changes frequently, such as buffers, caches, scratch data, and other temporary content, or for data that is replicated across a fleet of instances, such as a load-balanced pool of web servers. 

### Instance Store Lifetime

Instance Store volume has some drawback that the data in an instance store persists only during the lifetime of its associated instance. The data in the instance store is lost under any of the following circumstances:

- The underlying disk drive fails
- The instance stops
- The instance terminates

### Why OpenEBS with Instance Store?

Some instance types use NVMe or SATA-based solid state drives (SSD) to deliver high random I/O performance. 
This is a good option when you need storage with very low latency, but you don't need the data to persist when the instance terminates or you can take advantage of fault-tolerant architectures. OpenEBS will be the best option  in this case to get the high availability of the data along with advantages of using physical disks.

## Pre-requisites

- AWS account with full access to EC2,S3,VPC.
- Ubuntu 16.04
- KOPS tool must be installed
- AWS CLI must be installed for AWS account access
- SSH key should be generated to access EC2 instances.

## Installation of K8s cluster in AWS

Use local ubuntu 16.04 machine from where you can login into AWS with appropriate user credentials and creating cluster from it.

**Perform following operations from AWS management console.**

1. Create VPC and then Internet gateway  and then associate this VPC with this Internet Gateway so that It can communicated to outside. 

**Perform below steps from your local ubuntu machine**

1. Download AWSCLI utility in your local machine

2. Configure with your AWS account by running command as follows.

   ```
   aws configure 
   ```

   Note:You have to specify your AWS Access Key,Secret Access Key,Default region name and Default output format for keeping the configuration details.

3. Create a S3 bucket to store your cluster configuration details as follows

   ```
   aws s3 mb s3://<bucket_name> 
   ```

4.  Export the s3 bucket details using following command.

   ```
   export KOPS_STATE_STORE=s3://<bucket_name>
   ```

5. Create the cluster using following command

   ```
   kops create cluster --name=<cluster_name>.k8s.local --vpc=<vpc_id> --zones=<zone_name>
   ```

   This will create a cluster in the mentioned zone in your region provided as part of AWS configuration.

6. Above step will give set of command which can be used for customizing your cluster configuration such as Cluster name change,Instance group for Nodes and master etc. Following shows the example output.

   **Example:**

   Cluster configuration has been created.

   Suggestions:

   - list clusters with: kops get cluster
   - edit this cluster with: kops edit cluster ranjith.k8s.local
   - edit your node instance group: kops edit ig --name=ranjith.k8s.local nodes
   - edit your master instance group: kops edit ig --name=ranjith.k8s.local master-us-west-2a

   Finally configure your cluster with: kops update cluster ranjith.k8s.local --yes

7. Change your instance image type and no. of machines by executing corresponding commands. The exact command needed for your cluster will be shown at the end of the previous step command. The following shows some example.

   **Example:**   

   Change your node configuration by executing following way

   ```
   kops edit ig --name=<cluster_name>.k8s.local nodes
   ```

   Change your master instance type,no. of machines by executing following way

   ```
     kops edit ig --name=<cluster_name>.k8s.local master-<zone_name> 
   ```

   **Note:** We used c3.xlarge as instance type for both Master and Nodes. Number nodes used is 3.

8. Once the customization has done, you can update the changes as follows.

   ```
    kops update cluster <cluster_name>.k8s.local --yes
   ```

9. Above step will deploy a 3 Node k8s cluster in AWS. You can check the instance creation stus by going to EC2 instance page with choosing corresponding region.

10. From EC2 instance page, you will get the each instance type Public IP.

    **Example:**

    ![EC2_instance_PublicIP](/docs/assets/insatnce_with_public_ip.PNG)

11. Goto **Launch Configuration** section in the EC2 page and take a *copy of Launch configuration* for nodes. Select the configuration for Node group and click on Actions pane.

    **Example:**

    ![Launch configuration for nodes](/docs/assets/Launch_config_nodes.PNG)

12. Perform changes in the **Configure Details** section as follows.

    - [ ] Change the new configuration name if you need

    - [ ] Edit **Advanced Details** section and add following entry at the end of **User data** section

      ```
      #!/bin/bash
      set -x
      date
      apt-get install open-iscsi
       grep "@reboot root sleep 120;service open-iscsi restart" /etc/crontab || sudo sh -c 'echo "@reboot root sleep 120;service open-iscsi restart" >> /etc/crontab'
      systemctl enable open-iscsi
      sh -c 'echo "/dev/xvdd       /mnt/openebs_xvdd       auto    defaults,nofail,comment=cloudconfig     0       2" >> /etc/fstab'
      reboot
      set -x
      umount /mnt/openebs/xvdd
      mount /dev/xvdd /mnt/openebs_xvdd
      ```

      **Example:**

      ![User_data](/docs/assets/User_data.PNG)

    - [ ] Click on Skip to review and proceed with Create launch configuration.

13. Goto **Auto Scale Group** section in the EC2 page. Select the configuration for Node group and click on Actions pane to edit Launch Configuration. Change the existing one with new Launch Configuration and save the new configuration.

    **Example:**

    ![ASG](/docs/assets/ASG.PNG)

14. SSH to each nodes using its public key  as follows

    ```
    ssh -i ~/.ssh/id_rsa admin@<public_ip>
    ```

15. SSH to all the Nodes where OpenEBS is going to install and perform following commands to install iSCSI packages and auto mounting of local disk during reboot.

    ```
    sudo apt-get update
    sudo apt-get install open-iscsi
    sudo service open-iscsi restart
    sudo cat /etc/iscsi/initiatorname.iscsi
    sudo service open-iscsi status
    sudo sudo sh -c 'echo "/dev/xvdd       /mnt/openebs_xvdd       auto    defaults,nofail,comment=cloudconfig     0       2" >> /etc/fstab'
    grep "@reboot root sleep 120;service open-iscsi restart" /etc/crontab || sudo sh -c 'echo "@reboot root sleep 120;service open-iscsi restart" >> /etc/crontab'
    sudo reboot
    ```

16. SSH to Master Node and perform following commands to clone OpenEBS yaml file to deploy.

    wget https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-operator.yaml
    wget https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-storageclasses.yaml

17. Edit *openebs-operator.yaml* and add below entry into it. This is to create storage pool on one of the local disk attached to the hosts. Refer [OpenEBS Storage Pools](docs/next/setupstoragepools.html) for more information.

    ```
    ---
    apiVersion: openebs.io/v1alpha1
    kind: StoragePool
    metadata:
        name: jivaawspool
        type: hostdir
    spec:
        path: "/mnt/openebs_xvdd"
    ---
    ```

18. Edit *openebs-storageclasses.yaml* by adding following entry in your corresponding storage class.

    ```
    openebs.io/storage-pool: "jivaawspool"
    ```

    **Example:** 

    ```
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
       name: openebs-percona
    provisioner: openebs.io/provisioner-iscsi
    parameters:
      openebs.io/storage-pool: "default"
      openebs.io/jiva-replica-count: "3"
      openebs.io/volume-monitor: "true"
      openebs.io/capacity: 5G
      openebs.io/storage-pool: "jivaawspool"
    ```

19.  Apply openebs-operator.yaml by following command

    ```
    kubectl apply -f openebs-operator.yaml
    ```

20.  Apply openebs-storageclasses.yaml by following command

    ```
    kubectl apply -f openebs-storageclasses.yaml
    ```

21. Deploy your application yaml which will be created on the local disk.

    Example:

    ```
    kubectl apply -f percona-openebs-deployment.yaml
    ```

22. To check the status of application and Jiva Pods, use following command

    ```
    kubectl get pods -o wide
    ```

23. The following will be similar output.

    ```
    NAME                                                             READY     STATUS    RESTARTS   AGE       IP           NODE
    percona-7f6bff67f6-cz47d                                         1/1       Running   0          1m        100.96.3.7   ip-172-20-40-26.us-west-2.compute.internal
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6-ctrl-84bcf764d6-269rj   2/2       Running   0          1m        100.96.1.4   ip-172-20-62-11.us-west-2.compute.internal
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6-rep-54b8f49ff8-bzjq4    1/1       Running   0          1m        100.96.1.5   ip-172-20-62-11.us-west-2.compute.internal
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6-rep-54b8f49ff8-lpz2k    1/1       Running   0          1m        100.96.2.8   ip-172-20-32-255.us-west-2.compute.internal
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6-rep-54b8f49ff8-rqnr7    1/1       Running   0          1m        100.96.3.6   ip-172-20-40-26.us-west-2.compute.internal
    ```

24. Get the status of PVC

    ```
    kubectl get pvc
    ```

25. Output of above command will be similar as follows

    ```
    NAME              STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS      AGE
    demo-vol1-claim   Bound     pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6   5G         RWO            openebs-percona   3m 
    ```

26. Get the status PV using below command

    ```
    kubectl get pv
    ```

27. Output of above command will be similar as follows

    ```
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS    CLAIM                     STORAGECLASS      REASON    AGE
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6   5G         RWO            Delete           Bound     default/demo-vol1-claim   openebs-percona             3m 
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