---
id: aws
title: Running OpenEBS on AWS
sidebar_label: AWS
---

------

This section covers OpenEBS persistent storage solution using AWS instance store disks for applications running on Kubernetes clusters. Instance store disks provide high performance, but they are not guaranteed to be present in the node all the time which of course means that when the node is rescheduled you can lose the data they are storing. 

#### Instance Store

Instance store is ideal for temporary storage of information that changes frequently, such as buffers, caches, scratch data, and other temporary content or for data that is replicated across a fleet of instances, such as a load-balanced pool of web servers. 

Instance Store volume's drawback is that the data in an instance store persists only during the lifetime of its associated instance. The data in the instance store may be lost due to the following:

- Underlying disk drive fails
- Instance stops
- Instance terminates

## OpenEBS with AWS Instance Store

Some instance types use NVMe or SATA-based solid state drives (SSD) to deliver high random I/O performance. This is a good option when you need storage with very low latency and do not need the data to persist when the instance terminates. You can also take advantage of fault-tolerant architectures. OpenEBS is an option for high availability of data combined with advantages of using physical disks.

## How is replication done with OpenEBS?

OpenEBS will have minimum 3 replicas to run OpenEBS cluster with high availability and if a node fails, OpenEBS will manage the data to be replicated to a new disk which will come up as part of ASG. In the meantime your workload is accessing the live data from one the replicas.

![Stateful Applications using OpenEBS and instance stores](/docs/assets/OpenEBS_AWS.png)

## Prerequisites

- AWS account with full access to EC2, S3, and VPC
- Ubuntu 16.04
- KOPS tool installed
- AWS CLI installed for AWS account access
- SSH key generated to access EC2 instances

## Installing OpenEBS Cluster in AWS

Use local ubuntu 16.04 machine from where you can login to AWS with appropriate user credentials and creating cluster from it.

**Perform following operations from AWS management console**

1. Create VPC and Internet gateway. 
2. Associate this VPC with the Internet Gateway.

**Perform the following procedure from your local ubuntu machine**

1. Download AWSCLI utility in your local machine.

2. Configure with your AWS account by executing the following command.

   ```
   aws configure 
   ```

   **Note:** You have to specify your AWS Access Key, Secret Access Key, Default region name, and Default output format for keeping the configuration details.

3. Create a S3 bucket to store your cluster configuration details as follows.

   ```
   aws s3 mb s3://<bucket_name> 
   ```

4. Export the s3 bucket details using following command.

   ```
   export KOPS_STATE_STORE=s3://<bucket_name>
   ```

5. Create the cluster using following command.

   ```
   kops create cluster --name=<cluster_name>.k8s.local --vpc=<vpc_id> --zones=<zone_name>
   ```

   This will create a cluster in the mentioned zone in your region provided as part of AWS configuration.

6. The above step will give a set of commands which can be used for customizing your cluster configuration such as Cluster name change, Instance group for Nodes, and master etc. Following is an example output.

   **Example:**

   Cluster configuration has been created.

   Suggestions:

   - list clusters with: kops get cluster
   - edit this cluster with: kops edit cluster ranjith.k8s.local
   - edit your node instance group: kops edit ig --name=ranjith.k8s.local nodes
   - edit your master instance group: kops edit ig --name=ranjith.k8s.local master-us-west-2a

   Finally configure your cluster with: kops update cluster name.k8s.local --yes

7. Change your instance image type and number of machines by executing corresponding commands. The exact command needed for your cluster will be shown at the end of the previous step. Following is an example.

   **Example:**   

   Change your node configuration by executing as follows.

   ```
   kops edit ig --name=<cluster_name>.k8s.local nodes
   ```

   Change your master instance type and number of machines by executing as follows.

   ```
   kops edit ig --name=<cluster_name>.k8s.local master-<zone_name> 
   ```

   **Note:** We used c3.xlarge as instance type for both Master and Nodes. Number nodes used is 3.

8. Once the customization is done, you can update the changes as follows.

   ```
    kops update cluster <cluster_name>.k8s.local --yes
   ```

9. The above step will deploy a 3 Node OpenEBS cluster in AWS. You can check the instance creation status by going to EC2 instance page and choosing the corresponding region.

10. From EC2 instance page, you will get each instance type Public IP.

  **Example:**

  ![EC2_instance_PublicIP](/docs/assets/insatnce_with_public_ip.PNG)

11. Go to **Launch Configuration** section in the EC2 page and take a *copy of Launch configuration* for nodes. Select the configuration for Node group and click on Actions pane.

    **Example:**

    ![Launch configuration for nodes](/docs/assets/Launch_config_nodes.PNG)

12. Perform changes in the **Configure Details** section as follows.

    - Change the new configuration name if required.

    - Edit **Advanced Details** section and add the following entry at the end of **User data** section.

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

    - Click **Skip** to review and proceed with Create launch configuration.

13. Go to **Auto Scale Group** section in the EC2 page. Select the configuration for Node group and click on Actions pane to edit Launch Configuration. Change the existing one with new Launch Configuration and save the new configuration.

    **Example:**

    ![ASG](/docs/assets/ASG.PNG)

14. SSH to each node using its public key as follows.

    ```
    ssh -i ~/.ssh/id_rsa admin@<public_ip>
    ```

15. SSH to all the Nodes where OpenEBS will be installed and perform the following commands to install iSCSI packages and auto mounting of local disk during reboot.

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

16. SSH to Master Node and perform the following commands to clone OpenEBS yaml file and deploy.

    wget https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-operator.yaml

    wget https://raw.githubusercontent.com/openebs/openebs/v0.6/k8s/openebs-storageclasses.yaml

17. Edit *openebs-operator.yaml* and add the following entry. This will create storage pool on one of the local disks attached to the hosts. Refer [OpenEBS Storage Pools](docs/next/setupstoragepools.html) for more information.

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

18. Edit *openebs-storageclasses.yaml* by adding the following entry in your corresponding storage class.

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

19. Apply openebs-operator.yaml by executing the following command.

    ```
    kubectl apply -f openebs-operator.yaml
    ```

20. Apply openebs-storageclasses.yaml by executing the following command.

    ```
    kubectl apply -f openebs-storageclasses.yaml
    ```

21. Deploy your application yaml which will be created on the local disk.

    Example:

    ```
    kubectl apply -f percona-openebs-deployment.yaml
    ```

22. To check the status of application and Jiva Pods, use the following command.

    ```
    kubectl get pods -o wide
    ```

     Output similar to the following is displayed.

    ```
    NAME                                                             READY     STATUS    RESTARTS   AGE       IP           NODE
    percona-7f6bff67f6-cz47d                                         1/1       Running   0          1m        100.96.3.7   ip-172-20-		40-26.us-west-2.compute.internal
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6-ctrl-84bcf764d6-269rj   2/2       Running   0          1m        100.96.1.4   ip-172-20-62-11.us-west-2.compute.internal
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6-rep-54b8f49ff8-bzjq4    1/1       Running   0          1m        	100.96.1.5   ip-172-20-62-11.us-west-2.compute.internal
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6-rep-54b8f49ff8-lpz2k    1/1       Running   0          1m        100.96.2.8   ip-172-20-32-255.us-west-2.compute.internal
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6-rep-54b8f49ff8-rqnr7    1/1       Running   0          1m        100.96.3.6   ip-172-20-40-26.us-west-2.compute.internal
    ```


23. Get the status of PVC using the following command.

    ```
    kubectl get pvc 
    ```

    Output similar to the following is displayed. 

    ```
    NAME              STATUS    VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS      AGE
    demo-vol1-claim   Bound     pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6   5G         RWO        openebs-percona   3m 
    ```


24. Get the status of PV using the following command.

    ```
    kubectl get pv
    ```

     Output of the above command will be similar to the following.

    ```
    NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS  CLAIM                     STORAGECLASS      REASON    AGE
    pvc-ef813ecc-9c8d-11e8-bdcc-0641dc4592b6   5G         RWO            Delete           Bound  default/demo-vol1-claim   openebs-percona             3m 
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
