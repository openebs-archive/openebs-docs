---
id: contribute
title: OpenEBS Contribution Guide
sidebar_label: OpenEBS Contribution Guide
---
<center><p style="padding: 20px; margin: 20px 0; border-radius: 3px; background-color: #eeeeee;"><strong>
  Our docs for version 0.5 release are getting updated. The documentation you are currently viewing is a static snapshot of earlier version for the same 0.5 release.  Click here for [latest](https://docs.openebs.io) version.
</strong></p></center>

You can access the latest documents at https://docs.openebs.io.

1.  If you would like to give feedback on existing content, create an issue on documentation see, [Creating an Issue](http://openebs.readthedocs.io/en/latest/contribute/contribute_openebs_doc.html#creating-an-issue).
2.  If you would like to contribute to new content,

    > -   create an issue see, [Creating an Issue](#createissue).
    > -   create your own branch see, [Creating a Branch](#createbranch).
    > -   work on the content by creating an RST file, and
    > -   create a pull request see, [Creating a Pull Request](createpullrequest)

Review Process for Documentation Issues and Pull Requests
---------------------------------------------------------

1.  OpenEBS Lead receives documentation issues/pull requests raised by Documentation/Internal contributors.
2.  Lead will tag issues to relevant labels which start with the name **documentation** and assign reviewers and approvers such as feature owner, doc person, and approver.
3.  The assignee works on the issue either developing content in .md files or editing the content.
4.  The assignee can get the content from other collaborators of the OpenEBS project either as rst/md file or as a comment in the issue. The assignee can also use the "OpenEBS Slack" channel to collect
    additional information from the community.

    Documentation content is located under documentation/source in reStructured (rst) files. documentation/source/index.rst contains the high level documentation structure (Table of Contents), which links to the content provided in other rst files either in the same directory or in child directories.

    **Note:**

    Before editing the files, familiarize yourself with the reStructured markup.

5.  Once you are done with your edits and ready for review, you must create a PR see [Creating a Pull Request](createpullrequest).
6.  The documents must be approved. see, [PR Approval Process](#prapprovalprocess).

Creating an Issue  <a name="createissue"></a>
------------------------------------------------------

1.  Go to <https://github.com/openebs/openebs/issues>.
2.  Click **New issue**.
3.  Add a short description in the **Title**.
4.  You can enter a detailed description in the edit box below.
5.  Click **Submit new issue**.

Creating a Branch <a name="createbranch"></a>
-----------------

1.  Create your openebs fork from (<https://github.com/openebs/openebs>). If you already have a forked
    openebs, rebase with the master to get the latest changes.

2.  Create a branch on the openebs fork using the following command. 

    ```
    git checkout -b <issue name>-#<issue number>
    ```

Creating a Pull Request <a name="createpullrequest"></a>
-----------------------

1.  Go to your fork on Github.
2.  Under Branch: master select the branch you created.
3.  Click **New pull request**.
4.  Add "Fixes \#\<*Issue number*\>" in the commit message.

PR Approval Process <a name="prapprovalprocess"></a>
-------------------

1.  Once the assignee is ready with the final draft, the reviewers have to approve the content.
2.  Open the pull request and click on **Review changes**.
3.  Click **Approve** and **Submit review**.
4.  The approver sees that the document is approved by all the reviewers and closes the issue. The issue gets merged and the documentation is available at <http://openebs.readthedocs.io/en/latest/>.

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
