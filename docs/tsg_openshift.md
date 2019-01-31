---
id: tsgopenshift
title: Troubleshooting OpenShift Issues
sidebar_label: OpenShift
---

------

This section captures steps to troubleshoot and resolve some errors faced while using OpenShift. 

The following issue is covered in this section.

[multipath.conf file claims all SCSI devices](#OpenShiftMultipath)


## Issue: 

### A multipath.conf file without either find_multipaths or a manual blacklist claims all SCSI devices. <a name="OpenShiftMultipath"></a>

## Workaround:

1. Add the find_multipaths line to */etc/multipath.conf* file similar to the following snippet.

```
defaults {
    user_friendly_names yes
    find_multipaths yes
}
```

2. Run `multipath -w /dev/sdc` command (replace the devname with your persistent devname).



<!-- Hotjar Tracking Code for https://docs.openebs.io -->
<script>


```
   (function(h,o,t,j,a,r){
   		h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
   		h._hjSettings={hjid:785693,hjsv:6};
   		a=o.getElementsByTagName('head')[0];
   		r=o.createElement('script');r.async=1;
   		r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
   		a.appendChild(r);
   })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
```


</script>

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-92076314-12"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-92076314-12');
</script>
