---
id: t-mayastor
title: Troubleshooting Mayastor
sidebar_label: Mayastor
---
------
# Troubleshooting

## Logs

The right log file to collect depends on the nature of the problem. If unsure,
then the best thing is to collect log files for all Mayastor containers.

To list all Mayastor pods execute,
```
kubectl -n mayastor get pods -o wide
```

Sample output:
```
NAME                    READY   STATUS    RESTARTS   AGE   IP             NODE       NOMINATED NODE   READINESS GATES
mayastor-csi-7pg82      2/2     Running   0          15m   10.0.84.131    worker-2   <none>           <none>
mayastor-csi-gmpq6      2/2     Running   0          15m   10.0.239.174   worker-1   <none>           <none>
mayastor-csi-xrmxx      2/2     Running   0          15m   10.0.85.71     worker-0   <none>           <none>
mayastor-qgpw6          1/1     Running   0          14m   10.0.85.71     worker-0   <none>           <none>
mayastor-qr84q          1/1     Running   0          14m   10.0.239.174   worker-1   <none>           <none>
mayastor-xhmj5          1/1     Running   0          14m   10.0.84.131    worker-2   <none>           <none>
moac-b8f4446b5-r5gwk    3/3     Running   0          15m   10.244.2.2     worker-2   <none>           <none>
nats-6fdd6dfb4f-swlm8   1/1     Running   0          16m   10.244.3.2     worker-0   <none>           <none>
```


### moac's log file

`moac` is the control plane of Mayastor. There is only one `moac` container running
in the cluster. It is generally useful as it captures all high-level operations
related to mayastor volumes in the cluster. So it is a good idea to always
inspect this log file.

To obtaining moac's log, execute:
```
kubectl -n mayastor logs $(kubectl -n mayastor get pod -l app=moac -o jsonpath="{.items[0].metadata.name}") moac
```
Sample output:
```
Mar 09 10:44:47.560 info [csi]: CSI server listens at /var/lib/csi/sockets/pluginproxy/csi.sock
Mar 09 10:44:47.565 debug [nats]: Connecting to NATS at "nats" ...
Mar 09 10:44:47.574 info [node-operator]: Initializing node operator
Mar 09 10:44:47.602 info [nats]: Connected to NATS message bus at "nats"
Mar 09 10:44:47.631 info [node-operator]: Created CRD mayastornode
Mar 09 10:44:47.709 debug [watcher]: mayastornode watcher with 0 objects was started
Mar 09 10:44:47.710 trace: Initial content of the "mayastornode" cache:
Mar 09 10:44:47.711 info [pool-operator]: Initializing pool operator
Mar 09 10:44:47.729 info [pool-operator]: Created CRD mayastorpool
Mar 09 10:44:47.787 debug [watcher]: mayastorpool watcher with 0 objects was started
Mar 09 10:44:47.788 trace: Initial content of the "mayastorpool" cache:
Mar 09 10:44:47.788 info: Warming up will take 7 seconds ...
Mar 09 10:44:53.335 debug [csi]: probe request (ready=false)
Mar 09 10:44:54.201 debug [csi]: probe request (ready=false)
Mar 09 10:44:54.788 info [volume-operator]: Initializing volume operator
Mar 09 10:44:54.803 info [volume-operator]: Created CRD mayastorvolume
Mar 09 10:44:56.339 debug [csi]: probe request (ready=false)
Mar 09 10:44:57.340 debug [csi]: probe request (ready=false)
Mar 09 10:44:57.861 debug [watcher]: mayastorvolume watcher with 0 objects was started
Mar 09 10:44:57.861 trace: Initial content of the "mayastorvolume" cache:
Mar 09 10:44:57.866 info [api]: API server listening on port 4000
Mar 09 10:44:57.866 info: MOAC is warmed up and ready to 🚀
Mar 09 10:44:58.206 debug [csi]: probe request (ready=true)
```

### mayastor's log file

mayastor containers form the data plane of Mayastor.  A cluster should schedule as many container instances as 
storage nodes that have been configured. This log file is most useful when troubleshooting
IO errors. Management operations could also fail because of
a problem on the storage node.

To obtain mayastor's log execute:
```
kubectl -n mayastor logs mayastor-qgpw6 mayastor
```

### mayastor CSI agent's log file

When having a problem with (un)mounting volume on an application node, this log
file can be useful. Generally, all nodes in the cluster run mayastor CSI agent,
so it's good to know which node is having the problem and inspect the log file
only on that node.


To obtain mayastor CSI driver's log execute:
```
kubectl -n mayastor logs mayastor-csi-7pg82 mayastor-csi
```

### CSI sidecars

These containers implement the CSI spec for Kubernetes and run in the same pods
with moac and mayastor-csi containers. Although they are not part of
Mayastor, they can contain useful information when Mayastor CSI
control/node plugin fails to register with k8s cluster.


To obtain CSI control containers logs execute:
```
kubectl -n mayastor logs $(kubectl -n mayastor get pod -l app=moac -o jsonpath="{.items[0].metadata.name}") csi-attacher
kubectl -n mayastor logs $(kubectl -n mayastor get pod -l app=moac -o jsonpath="{.items[0].metadata.name}") csi-provisioner
```


To obtain CSI node container log execute:
```
kubectl -n mayastor logs mayastor-csi-7pg82 csi-driver-registrar
```


## Coredumps

A coredump is a snapshot of process' memory with auxiliary information
(PID, state of registers, etc.) saved to a file. It is used for post-mortem
analysis and it is generated by the operating system in case of a severe error
(i.e. memory corruption). Using a coredump for a problem analysis requires
deep knowledge of program internals and is usually done only by developers.
However, there is a very useful piece of information that even users can
retrieve and this information alone can often identify the root cause of
the problem. It is the stack (backtrace). Put differently, the thing that the
program was doing at the time when it crashed. Here we describe how to get it.
The steps as shown apply specifically to Ubuntu; other Linux distros might employ variations.

We rely on systemd-coredump that saves and manages coredumps on the system,
`coredumpctl` utility that is part of the same package and finally
the `gdb` debugger.


To install systemd-coredump and gdb execute:
```
sudo apt-get install -y systemd-coredump gdb lz4
```

If installed correctly then the global core pattern will be set so that all
generated coredumps will be piped to the `systemd-coredump` binary.


Next, verify coredump configuration,
```
cat /proc/sys/kernel/core_pattern
```

Sample output:
```
|/lib/systemd/systemd-coredump %P %u %g %s %t 9223372036854775808 %h
```

To list coredumps execute:

```
coredumpctl list
```

Sapmle Output:
```
TIME                            PID   UID   GID SIG COREFILE  EXE
Tue 2021-03-09 17:43:46 UTC  206366     0     0   6 present   /bin/mayastor
```


If there is a new coredump from mayastor container, the coredump alone won't
be that useful. GDB needs to access the binary of crashed process in order
to be able to print at least some information in the backtrace. For that, we
need to copy the contents of the container's filesystem to the host.


To get the ID of the mayastor container execute:
```
docker ps | grep mayadata/mayastor
```
 Sample output:
```
b3db4615d5e1        mayadata/mayastor                          "sleep 100000"           27 minutes ago      Up 27 minutes                           k8s_mayastor_mayastor-n682s_mayastor_51d26ee0-1a96-44c7-85ba-6e50767cd5ce_0
d72afea5bcc2        mayadata/mayastor-csi                      "/bin/mayastor-csi -…"   7 hours ago         Up 7 hours                              k8s_mayastor-csi_mayastor-csi-xrmxx_mayastor_d24017f2-5268-44a0-9fcd-84a593d7acb2_0
```

Next, you need to copy the relevant parts of the container's fs. To copy, execute:
```
mkdir -p /tmp/rootdir
docker cp b3db4615d5e1:/bin /tmp/rootdir
docker cp b3db4615d5e1:/nix /tmp/rootdir
```

Now we can start GDB. *Don't use* `coredumpctl` command for starting the
debugger. It invokes GDB with invalid path to the debugged binary hence
stack unwinding fails for Rust functions then. At first we extract the
compressed coredump.

To find the location of the compressed coredump execute:
```
coredumpctl info | grep Storage | awk '{ print $2 }'
```

Sample output:
```
/var/lib/systemd/coredump/core.mayastor.0.6a5e550e77ee4e77a19bd67436ce7a98.64074.1615374302000000000000.lz4
```

To extract the coredump execute:
```
sudo lz4cat /var/lib/systemd/coredump/core.mayastor.0.6a5e550e77ee4e77a19bd67436ce7a98.64074.1615374302000000000000.lz4 >core
```

Next, open coredump in GDB, execute:
```
gdb -c core /tmp/rootdir/bin/mayastor
```

 Sample output:
```
GNU gdb (Ubuntu 9.2-0ubuntu1~20.04) 9.2
Copyright (C) 2020 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...
[New LWP 13]
[New LWP 17]
[New LWP 14]
[New LWP 16]
[New LWP 18]
Core was generated by `/bin/mayastor -l0 -nnats'.
Program terminated with signal SIGABRT, Aborted.
#0  0x00007ffdad99fb37 in clock_gettime ()
[Current thread is 1 (LWP 13)]
```

Once in GDB we need to set a sysroot so that GDB knows where to find the
binary for the debugged program.

To set sysroot in GDB, execute:
```
set auto-load safe-path /tmp/rootdir
set sysroot /tmp/rootdir
```
Sample output:
```
Reading symbols from /tmp/rootdir/nix/store/f1gzfqq10dlha1qw10sqvgil34qh30af-systemd-246.6/lib/libudev.so.1...
(No debugging symbols found in /tmp/rootdir/nix/store/f1gzfqq10dlha1qw10sqvgil34qh30af-systemd-246.6/lib/libudev.so.1)
Reading symbols from /tmp/rootdir/nix/store/0kdiav729rrcdwbxws653zxz5kngx8aa-libspdk-dev-21.01/lib/libspdk.so...
Reading symbols from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libdl.so.2...
(No debugging symbols found in /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libdl.so.2)
Reading symbols from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libgcc_s.so.1...
(No debugging symbols found in /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libgcc_s.so.1)
Reading symbols from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libpthread.so.0...
...
```


After that we can print backtrace(s).


To obtain backtraces for all threads in GDB, execute:
```
thread apply all bt
```

Sample output:
```
Thread 5 (Thread 0x7f78248bb640 (LWP 59)):
#0  0x00007f7825ac0582 in __lll_lock_wait () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libpthread.so.0
#1  0x00007f7825ab90c1 in pthread_mutex_lock () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libpthread.so.0
#2  0x00005633ca2e287e in async_io::driver::main_loop ()
#3  0x00005633ca2e27d9 in async_io::driver::UNPARKER::{{closure}}::{{closure}} ()
#4  0x00005633ca2e27c9 in std::sys_common::backtrace::__rust_begin_short_backtrace ()
#5  0x00005633ca2e27b9 in std::thread::Builder::spawn_unchecked::{{closure}}::{{closure}} ()
#6  0x00005633ca2e27a9 in <std::panic::AssertUnwindSafe<F> as core::ops::function::FnOnce<()>>::call_once ()
#7  0x00005633ca2e26b4 in core::ops::function::FnOnce::call_once{{vtable-shim}} ()
#8  0x00005633ca723cda in <alloc::boxed::Box<F,A> as core::ops::function::FnOnce<Args>>::call_once () at /rustc/d1206f950ffb76c76e1b74a19ae33c2b7d949454/library/alloc/src/boxed.rs:1546
#9  <alloc::boxed::Box<F,A> as core::ops::function::FnOnce<Args>>::call_once () at /rustc/d1206f950ffb76c76e1b74a19ae33c2b7d949454/library/alloc/src/boxed.rs:1546
#10 std::sys::unix::thread::Thread::new::thread_start () at /rustc/d1206f950ffb76c76e1b74a19ae33c2b7d949454//library/std/src/sys/unix/thread.rs:71
#11 0x00007f7825ab6e9e in start_thread () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libpthread.so.0
#12 0x00007f78259e566f in clone () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libc.so.6

Thread 4 (Thread 0x7f7824cbd640 (LWP 57)):
#0  0x00007f78259e598f in epoll_wait () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libc.so.6
#1  0x00005633ca2e414b in async_io::reactor::ReactorLock::react ()
#2  0x00005633ca583c11 in async_io::driver::block_on ()
#3  0x00005633ca5810dd in std::sys_common::backtrace::__rust_begin_short_backtrace ()
#4  0x00005633ca580e5c in core::ops::function::FnOnce::call_once{{vtable-shim}} ()
#5  0x00005633ca723cda in <alloc::boxed::Box<F,A> as core::ops::function::FnOnce<Args>>::call_once () at /rustc/d1206f950ffb76c76e1b74a19ae33c2b7d949454/library/alloc/src/boxed.rs:1546
#6  <alloc::boxed::Box<F,A> as core::ops::function::FnOnce<Args>>::call_once () at /rustc/d1206f950ffb76c76e1b74a19ae33c2b7d949454/library/alloc/src/boxed.rs:1546
#7  std::sys::unix::thread::Thread::new::thread_start () at /rustc/d1206f950ffb76c76e1b74a19ae33c2b7d949454//library/std/src/sys/unix/thread.rs:71
#8  0x00007f7825ab6e9e in start_thread () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libpthread.so.0
#9  0x00007f78259e566f in clone () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libc.so.6

Thread 3 (Thread 0x7f78177fe640 (LWP 61)):
#0  0x00007f7825ac08b7 in accept () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libpthread.so.0
#1  0x00007f7825c930bb in socket_listener () from /tmp/rootdir/nix/store/0kdiav729rrcdwbxws653zxz5kngx8aa-libspdk-dev-21.01/lib/libspdk.so
#2  0x00007f7825ab6e9e in start_thread () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libpthread.so.0
#3  0x00007f78259e566f in clone () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libc.so.6

Thread 2 (Thread 0x7f7817fff640 (LWP 60)):
#0  0x00007f78259e598f in epoll_wait () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libc.so.6
#1  0x00007f7825c7f174 in eal_intr_thread_main () from /tmp/rootdir/nix/store/0kdiav729rrcdwbxws653zxz5kngx8aa-libspdk-dev-21.01/lib/libspdk.so
#2  0x00007f7825ab6e9e in start_thread () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libpthread.so.0
#3  0x00007f78259e566f in clone () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libc.so.6

Thread 1 (Thread 0x7f782559f040 (LWP 56)):
#0  0x00007fff849bcb37 in clock_gettime ()
#1  0x00007f78259af1d0 in clock_gettime@GLIBC_2.2.5 () from /tmp/rootdir/nix/store/a6rnjp15qgp8a699dlffqj94hzy1nldg-glibc-2.32/lib/libc.so.6
#2  0x00005633ca23ebc5 in <tokio::park::either::Either<A,B> as tokio::park::Park>::park ()
#3  0x00005633ca2c86dd in mayastor::main ()
#4  0x00005633ca2000d6 in std::sys_common::backtrace::__rust_begin_short_backtrace ()
#5  0x00005633ca2cad5f in main ()
```
