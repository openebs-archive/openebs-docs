# Adding disks to a StoragePoolClaim

**Note:** These steps are applicable only for OpenEBS version installed upto 0.9 version. From OpenEBS 1.0, there are changes in the steps.


1. Attach the disks
This will be different based on where your Kubernetes cluster is running.  For on premises installations, follow your normal procedures for adding block storage.  For the cloud, follow the documentation provided by your cloud provider.

1. Find the names of all the disks.  This command will return all the disks.  We are only interested in the ones that that will be added to the existing StoragePoolClaim.

	```
	$ kubectl get disks | grep -v sparse
	NAME                                      SIZE          STATUS   AGE
	disk-4f2a4a2a4bea01b8fd4726ae622b27d1     53687091200   Active   22m
	disk-590aee6d5da0597112cdb9640f7884e3     53687091200   Active   22m
	disk-660f41ef1532998708dc5eb78c20a784     53687091200   Active   18m
	disk-a61e996aced4271e9b31ef6acba1d2f9     53687091200   Active   19m
	disk-b9c937bd02ae7097d5eb866508427be7     53687091200   Active   22m
	disk-d113231a87dde7d125286454d6e03609     53687091200   Active   19m
	```

2. Find the host the disk is on and the disk-id.  Now you will need to go through each of the disks and get the host they are on as well as their "disk-id".  Here I use grep to filter out only the hostname and the device ids.

	```
	$ kubectl describe disk <DISK_NAME> | grep "\(hostname\|/dev/\)"
	Labels:       kubernetes.io/hostname=k8s-openebs-demo-node-2
	      /dev/disk/by-id/scsi-0Google_PersistentDisk_test-disk-2
	      /dev/disk/by-id/google-test-disk-2
	      /dev/disk/by-path/pci-0000:00:03.0-scsi-0:0:3:0
	  Path:  /dev/sdc
	```

3. Find the pool pod that is running on that host

	```
	$ kubectl -n openebs get pods -o wide | grep <HOSTNAME> | grep <POOL_NAME>
	cstor-test-ul35-6cf7499458-f7zlw               3/3     Running   0          36m   10.244.1.4      k8s-openebs-demo-node-2   <none>           <none>
	```

4. Get pool name.  We need to get the zfs pool name from the pool pod we found above.

	```
	$ kubectl -n openebs exec -it <POD_NAME> --container cstor-pool -- zpool status
	  pool: cstor-64863faa-883d-11e9-afbe-42010a800fc7
	 state: ONLINE
	  scan: none requested
	config:

		NAME                                        STATE     READ WRITE CKSUM
		cstor-64863faa-883d-11e9-afbe-42010a800fc7  ONLINE       0     0     0
		  scsi-0Google_PersistentDisk_node-disk-2   ONLINE       0     0     0

	errors: No known data errors
	```

5. Add the new disk to the pool.  Now we use the disk-id we got in the earlier step and we add it to the pool we just looked up.  For the disk-id, we only need the name of the device, not the full path that we found in the disk description.

	```
	$ kubectl -n openebs exec -it <POOL_POD_NAME> --container cstor-pool -- zpool add <POOL_NAME> <DISK_ID>
	```

6. Verify the disk was added to the pool

	```
	$ kubectl -n openebs exec -it <POOL_POD_NAME> --container cstor-pool -- zpool status
	  pool: cstor-64863faa-883d-11e9-afbe-42010a800fc7
	 state: ONLINE
	  scan: none requested
	config:

		NAME                                        STATE     READ WRITE CKSUM
		cstor-64863faa-883d-11e9-afbe-42010a800fc7  ONLINE       0     0     0
		  scsi-0Google_PersistentDisk_node-disk-2   ONLINE       0     0     0
		  scsi-0Google_PersistentDisk_test-disk-2   ONLINE       0     0     0

	errors: No known data errors
	```

7. Repeat steps 2 - 6 for each cStor disk.
8. Add the new disks to the YAML file for your StoragePoolClaim
9. Apply the updated yaml

	```
	$ kubectl apply -f <SPC_YAML_FILE>
	storagepoolclaim.openebs.io/cstor-test configured
	```

10. Verify the size of the cStorStoragePools has updated.

	```
	$ kubectl get csp
	NAME              ALLOCATED   FREE    CAPACITY   STATUS    TYPE      AGE
	cstor-test-c7z5   254K        99.5G   99.5G      Healthy   striped   47m
	cstor-test-i8gw   1.22M       99.5G   99.5G      Healthy   striped   47m
	cstor-test-ul35   3.67M       99.5G   99.5G      Healthy   striped   47m
	```
