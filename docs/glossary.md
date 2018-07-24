




# Glossary

Term        Definition/Description




backend vs. replica
frontend vs. frontend controller
volume vs. persistent volume
storage vs. volume
backing storage vs. persistent location
volume provisioner vs. volume provider

"openebs.io" namespace is used for all openebs related parameters and objects.
OpenEBS Volume is mapped to a Persistent Volume
OpenEBS Volume comprises of VolumeController and Volume Replicas. Volume Controller acts as the target to which the Application sends the Data. the Volume controller will then send the data synchronously to Volume Replicas.
OpenEBS Replicas write the data to StoragePools. StoragePools are logical objects created by OpenEBS, that are formed using one more Disks or a hostPath.
