---
id: prerequisites
title: Prerequisites
sidebar_label: Prerequisites
---

Setting up OpenEBS Cluster
==========================

This section helps you to setup a simple OpenEBS Cluster with three machines, VMs or Servers. OpenEBS is both a scale-out and scale-up solution. The OpenEBS cluster created using this section can be taken into production and scaled up later to meet changing storage demands, by adding additional machines to the cluster.

The clients (docker-hosts) can be configured to consume the OpenEBS storage either via Network (iSCSI) or using TCMU. This section helps you connect to the storage using iSCSI.

In this section, you will setup a simple OpenEBS cluster with three machines as follows:

**master-0** used as OpenEBS Maya Master (omm) and **host-01** and **host-02** used as OpenEBS Storage Host (osh).

If you plan to setup using VMs on a Virtual Box, you can go to the preparing machines using Vagrant section below.

![](/_static/gettingstarted.png%0A%20:align:%20center)

Preparing for OpenEBS Installation
==============================================

Since OpenEBS is delivered through containers, OpenEBS hosts can be run on any operating system with container engine. This section will use Ubuntu 16.04 and docker.

## Preparing Software

OpenEBS is a software-only solution that can be installed using the released binaries or built and installed directly from source. In this section you will use Ubuntu 16.04 as the underlying operating system.

To download and install, you will require wget and unzip.

    sudo apt-get update
    sudo apt-get install -y wget unzip

## Preparing Network

Typically, the storage is accessed through a different network (with high bandwidth 10G or 40G etc.,) rather than management on 1G. You will need to identify the IP address on which the management traffic flows and the interface that is used for data.

It is possible that the same interface can be used for both management and data.

    ubuntu@host-01:~$ ip addr show
    1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1
        link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
        inet 127.0.0.1/8 scope host lo
           valid_lft forever preferred_lft forever
        inet6 ::1/128 scope host 
           valid_lft forever preferred_lft forever
    2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
        link/ether 02:d8:e4:47:7a:33 brd ff:ff:ff:ff:ff:ff
        inet 10.0.2.15/24 brd 10.0.2.255 scope global enp0s3
           valid_lft forever preferred_lft forever
        inet6 fe80::d8:e4ff:fe47:7a33/64 scope link 
           valid_lft forever preferred_lft forever
    3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
        link/ether 08:00:27:9a:7e:b0 brd ff:ff:ff:ff:ff:ff
        inet 172.28.128.9/24 brd 172.28.128.255 scope global enp0s8
           valid_lft forever preferred_lft forever
        inet6 fe80::a00:27ff:fe9a:7eb0/64 scope link 
           valid_lft forever preferred_lft forever
    ubuntu@host-01:~$ 

For example, you will be using the interface enp0s8 and subnet 172.28.128.0/24 for both management and data in this section.

## Preparing Disk Storage

You can use maya to manage the local and remote disks. Optionally create RAID and file system layer on top of the raw disks, and so on.

In this section for the sake of simplicity, you will use the following directory */opt/openebs/*. Ensure that the directory is writeable. Note that you add new replication stores at runtime and attach to VSMs. So when you move this node into production, you can move the content from local directories to local/remote disk based storage.

    sudo mkdir -p /opt/openebs
    sudo chown -R <docker-user> /opt/openebs

Setup Vagrant VMs for OpenEBS Installation
===========================================

The Vagrantfile is available from GitHub repository. You can either copy or download the Vagrant file or clone the code to your box. Ensure that you have VirtualBox 5.0.24 and above and Vagrant 1.9.0 and above.

The commands for setting up using cloned code is as follows:

    git clone https://github.com/openebs/maya.git
    cd maya/demo
    vagrant up
