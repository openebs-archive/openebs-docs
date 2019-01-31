---
id: contribute
title: Contributing to OpenEBS
sidebar_label: Contributor's Guide
---
------



We at OpenEBS are always on the lookout for more OpenEBS hackers. 

OpenEBS is innovation in OpenSource. Following are some ways in which you can contribute to OpenEBS

- Raise Issues on either the functionality or documentation
- Submit Proposals for new Features/Enhancements 
- Submit Changes to the Source Code
- Submit Changes to Improve Documentation 

There are a few simple guidelines that you need to follow before providing your hacks

## Raising Issues

When Raising issues, please specify the following:
- Setup details (like hyperconverged/dedicated), orchestration engine - kubernetes, docker swarm etc,. 
- Scenario where the issue was seen to occur
- If the issue is with storage, include maya version, maya osh-status and maya omm-status
- Errors and log messages that are thrown by the software

## Submit Proposals for New Features

There is always something more that is required, to make it easier to suit your use-cases. Feel free to join the discussion on the features or raise a new PR with your proposed change

## Contributing to Source Code

Provide PRs for bug fixes or enhancements

### Sign your work

We use the Developer Certificate of Origin (DCO) as a additional safeguard
for the OpenEBS project. This is a well established and widely used
mechanism to assure contributors have confirmed their right to license
their contribution under the project's license

Please read [developer-certificate-of-origin](https://github.com/openebs/openebs/blob/master/contribute/developer-certificate-of-origin)



If you can certify it, then just add a line to every git commit message:

````
  Signed-off-by: Random J Developer <random@developer.example.org>
````

Use your real name (sorry, no pseudonyms or anonymous contributions).
If you set your `user.name` and `user.email` git configs, you can sign your
commit automatically with `git commit -s`. You can also use git [aliases](https://git-scm.com/book/tr/v2/Git-Basics-Git-Aliases)
like `git config --global alias.ci 'commit -s'`. Now you can commit with
`git ci` and the commit will be signed 


# Contributing to Documentation

Getting Documentation right is hard! Please raise a PR with your proposed changes




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
