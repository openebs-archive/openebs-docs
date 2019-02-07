---
id: postgres
title: Using OpenEBS as storage for PostgreSQL on Kubernetes
sidebar_label: PostgreSQL
---
------

<img src="/docs/assets/o-postgres.png" alt="OpenEBS and Prometheus" style="width:400px;">	

## Introduction

The Postgres container used in the StatefulSet is sourced from [CrunchyData](https://github.com/CrunchyData/crunchy-containers). CrunchyData provides cloud agnostic PostgreSQL container technology that is designed for production workloads with cloud native High Availability, Disaster Recovery, and monitoring. In this solution, running a PostgreSQL StatefulSet application on OpenEBS cStor volume  and perform simple database operations to verify successful deployment.

## Requirements

1. **Install OpenEBS**

   If OpenEBS is not installed in your K8s cluster, this can done from [here](/docs/next/installation.html). If OpenEBS is already installed, go to the next step. 

2. **Configure cStor Pool**

   If cStor Pool is not configure in your OpenEBS cluster, this can be done from [here](/docs/next/configurepools.html). If cStor pool is already configured, go to the next step. Sample YAML named **openebs-config.yaml** for configuring cStor Pool is provided in the Configuration details below.

3. **Create Storage Class**

   ## You must configure a StorageClass to provision cStor volume on cStor pool. In this solution we are using a StorageClass to consume the cStor Pool which is created using external disks attached on the Nodes. The storage pool is created using the steps provided in the [Configure StoragePool](/docs/next/configurepools.html) section. Since PostgreSQL is a StatefulSet application, it requires only one replication at the storage level. So cStor volume `replicaCount` is 1. Sample YAML named **openebs-sc-disk.yaml**to consume cStor pool with cStorVolume Replica count as 1 is provided in the configuration details below.

## Deployment of PostgreSQL with OpenEBS

The Postgres pods are configured as primary/master or as replica/slave by a startup script which decides the role based on ordinality assigned to the pod. 

Run the following commands to get the files for running PostgreSQL application.

```
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-sa.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-service.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-primary-service.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/set-replica-service.json
wget https://raw.githubusercontent.com/openebs/openebs/master/k8s/demo/crunchy-postgres/run.sh
```

You must create a new file called **set.json** and add the content from **set.json** shows in the Configuration details section below to this new file.

Once you have downloaded the files, you can do the modification on the required files. Once modification is done, you can run the following command to change the permission on the `run.sh` file to install the PostgreSQL application.

```
 chmod +x run.sh
```

Now you can execute the following command to install the PostgreSQL  application.

```
./run.sh
```

## Verify PostgreSQL  Pods

Run the following to get the status of PostgreSQL pods.

```
kubectl get pods
```

Following is an example output.

```
NAME      READY     STATUS    RESTARTS   AGE
pgset-0   1/1       Running   0          5m
pgset-1   1/1       Running   0          4m
```

### Verify PostgreSQL services

The verification procedure can be carried out using the following steps:

- Check cluster replication status between the Postgres primary and replica.
- Create a table in the default database as Postgres user "testuser" on the primary.
- Check data synchronization on the replica for the table you have created.
- Verify that table is not created on the replica.

Once you enter into the pod, do the following.

**Step-1:** Install the PostgreSQL-Client

You can ssh to any of your Kubernetes Nodes and install the PostgreSQL CLient Utility (psql) to perform database operations from the command line.

```
sudo apt-get install postgresql-client -y
```

**Step 2:** Verify Cluster Replication Status on Crunchy-Postgres Cluster.

Identify the IP Address of the primary (pgset-0) pod or the service (pgset-primary) .

```
kubectl describe pod pgset-0 | grep IP
```

Output of above command will be similar to the following.

```
IP:             10.76.0.35
```

**Step 3:** Use the IP obtained from the above output in the following query and execute the following.

```
psql -h 10.76.0.35 -U testuser postgres -c 'select * from pg_stat_replication'
```

Output of above command will be similar to the following.

```
pid | usesysid | usename | application_name | client_addr | client_hostname | client_port | backend_start | backend_xmin | state | sent_lsn | write_lsn | flush_lsn | replay_lsn | write_lag
| flush_lag | replay_lag | sync_priority | sync_state
-----+----------+-------------+------------------+-------------+-----------------+------------+-------------------------------+--------------+-----------+-----------+-----------+-----------+------------+-----------+-----------+------------+---------------+------------
94 | 16391 | primaryuser | pgset-1 | 10.44.0.0 | | 60460 | 2018-12-05 09:29:21.990782-05 | |streaming | 0/30142
```

The replica should be registered for *asynchronous* replication.
**Step 4:**  Create a Table with Test Content on the Default Database. The following queries should be executed on the primary pod.

```
psql -h 10.47.0.3 -U testuser postgres -c 'create table foo(id int)'
```

After entering the password, it will create a table.

Once table is created, add a value to it using the following command.

```
psql -h 10.47.0.3 -U testuser postgres -c 'insert into foo values (1)'
```

After entering the password, it will add a value to the table.

**Step 5:**  Verify Data Synchronization on Replica.

Identify the IP Address of the replica (pgset-1) pod or the service (pgset-replica) using the following command.

```
 kubectl describe pod pgset-1 | grep IP
```

Output of above command will be similar to the following.

```
IP:             10.76.2.53
```

Now use the above IP in the following command and execute the following command.

```
 psql -h 10.76.2.53 -U testuser postgres -c 'table foo'
```

Output of above command will be similar to the following.

```
 id
----
  1
(1 row)
```

Verify that the table content is replicated successfully.

**Step 6:** Verify Database Write is Restricted on Replica.

Attempt to create a new table on the replica using the following command and verify that the creation is unsuccessful.

```
 psql -h 10.76.2.53 -U testuser postgres -c 'create table bar(id int)'
```

Output of above command will be similar to the following.

```
ERROR:  cannot execute CREATE TABLE in a read-only transaction
```

## Best Practices:



## Troubleshooting Guidelines



## Configuration Details

**openebs-config.yaml**

```
#Use the following YAMLs to create a cStor Storage Pool.
# and associated storage class.
apiVersion: openebs.io/v1alpha1
kind: StoragePoolClaim
metadata:
  name: cstor-disk
spec:
  name: cstor-disk
  type: disk
  poolSpec:
    poolType: striped
  # NOTE - Appropriate disks need to be fetched using `kubectl get disks`
  #
  # `Disk` is a custom resource supported by OpenEBS with `node-disk-manager`
  # as the disk operator
# Replace the following with actual disk CRs from your cluster `kubectl get disks`
# Uncomment the below lines after updating the actual disk names.
  disks:
    diskList:
# Replace the following with actual disk CRs from your cluster from `kubectl get disks`
#   - disk-184d99015253054c48c4aa3f17d137b1
#   - disk-2f6bced7ba9b2be230ca5138fd0b07f1
#   - disk-806d3e77dd2e38f188fdaf9c46020bdc
#   - disk-8b6fb58d0c4e0ff3ed74a5183556424d
#   - disk-bad1863742ce905e67978d082a721d61
#   - disk-d172a48ad8b0fb536b9984609b7ee653
---
```

**openebs-sc-disk.yaml**

```
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: openebs-cstor-disk
  annotations:
    openebs.io/cas-type: cstor
    cas.openebs.io/config: |
      - name: StoragePoolClaim
        value: "cstor-disk"
      - name: ReplicaCount
        value: "1"       
provisioner: openebs.io/provisioner-iscsi
reclaimPolicy: Delete
---
```

**set.json**

```
{
  "apiVersion": "apps/v1beta1",
  "kind": "StatefulSet",
  "metadata": {
    "name": "pgset"
  },
  "spec": {
    "serviceName": "pgset",
    "replicas": 2,
    "template": {
      "metadata": {
        "labels": {
          "app": "pgset"
        }
      },
      "spec": {
        "securityContext":
          {
            "fsGroup": 26
          },
        "containers": [
          {
            "name": "pgset",
            "image": "crunchydata/crunchy-postgres:centos7-10.0-1.6.0",
            "ports": [
              {
                "containerPort": 5432,
                "name": "postgres"
              }
            ],
            "env": [{
                "name": "PG_PRIMARY_USER",
                "value": "primaryuser"
            }, {
                "name": "PGHOST",
                "value": "/tmp"
            }, {
                "name": "PG_MODE",
                "value": "set"
            }, {
                "name": "PG_PRIMARY_PASSWORD",
                "value": "password"
            }, {
                "name": "PG_USER",
                "value": "testuser"
            }, {
                "name": "PG_PASSWORD",
                "value": "password"
            }, {
                "name": "PG_DATABASE",
                "value": "userdb"
            }, {
                "name": "PG_ROOT_PASSWORD",
                "value": "password"
            }, {
                "name": "PG_PRIMARY_PORT",
                "value": "5432"
            }, {
                "name": "PG_PRIMARY_HOST",
                "value": "pgset-primary"
            }],
            "volumeMounts": [
              {
                "name": "pgdata",
                "mountPath": "/pgdata",
                "readOnly": false
              }
            ]
          }
        ]
      }
    },
    "volumeClaimTemplates": [
      {
        "metadata": {
          "name": "pgdata"
        },
        "spec": {
          "accessModes": [
            "ReadWriteOnce"
          ],
          "storageClassName": "openebs-cstor-disk",
          "resources": {
            "requests": {
              "storage": "5G"
            }
          }
        }
      }
    ]
  }
}
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
