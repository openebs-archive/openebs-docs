# OpenEBS Documentation (Deprecated)

**The content in this repository has been migrated to https://github.com/openebs/website**



---

[![Open Issues](https://img.shields.io/github/issues/openebs/openebs-docs.svg?style=flat-square)](https://github.com/openebs/openebs-docs/issues)
[![Open Pull Requests](https://img.shields.io/github/issues-pr/openebs/openebs-docs.svg?style=flat-square)](https://github.com/openebs/openebs-docs/pulls)
[![Commit Activity (Year)](https://img.shields.io/github/commit-activity/y/openebs/openebs-docs.svg?style=flat-square)](https://github.com/openebs/openebs-docs/commits)
[![Contributors](https://img.shields.io/github/contributors/openebs/openebs-docs.svg?style=flat-square)](https://github.com/openebs/openebs-docs/graphs/contributors)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fopenebs%2Fopenebs-docs.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fopenebs%2Fopenebs-docs?ref=badge_shield)
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/openebs/openebs-docs)

openebs-docs is the repository for the official OpenEBS documentation. This is using Docusaurus as a documentation framework. It's easy to use and write documentation using Docusaurus, which uses markdown markup language.
Additional details on the Docusaurus project can be found [here](https://docusaurus.io/docs/en/installation.html).

## For Developers

Instead of performing the following steps, you might just want to edit the docs in a fully pre-configured development environment 
in the browser: [![Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://github.com/openebs/openebs-docs).

### Install Node.js

```bash
sudo apt-get install software-properties-common
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
```

### Get the latest Node.js package

```bash
sudo apt-get install -y nodejs
```

### Install Yarn

```bash
npm install -g yarn
```

### Clone openebs-docs repository

```bash
git clone https://github.com/openebs/openebs-docs.git
cd openebs-docs
```

### Start the server

```bash
cd website
npm start
```

The above step will start a server on the `localhost:3000`

### How OpenEBS-docs get published?

The following procedure lists the tasks from the time you select an issue to publish the document:

1. Go through the [issues](https://github.com/openebs/openebs-docs/issues/), and select an issue you want to work on.

2. Go to `openebs-docs/website`, and execute `npm start`. You can then preview the document at `http://localhost:3000/docs/next/overview.html`.

3. Work on your issue and create and submit your pull request(PR) for the members to review. Do perform the DCO signoff. DCO stands for Developer Certificate of Origin. It requires the commit message to have a `Signed-off-by:` statement along with the email address of the author of that commit. You can do this using the following command `git commit -s -m 'Commit message related to the issue'`. You can read more about it [here](https://github.com/probot/dco#how-it-works).

4. Make changes to your pull request as suggested by the members. In order to keep the pull request clean, you can use `git commit --amend -s -m 'Commit message related to the issue'` along with `git push -f`. This will prevent multiple commits.

5. After you submit your pull request, and after it is approved by at least one member, it goes through `Travis CI` integration. Your pull request is checked, and if it exits with `code 0` for all the cases, then it's considered as passed and good for merging. If it fails, identify and fix the errors and resubmit it. You can use the commands mentioned in point 4.

6. The maintainers can then merge your pull request. Congrats on your contribution to the OpenEBS-docs code-base.

### License

The project is licensed under the Apache 2.0 License. See [LICENSE](LICENSE) for the full license text. 

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fopenebs%2Fopenebs-docs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fopenebs%2Fopenebs-docs?ref=badge_large)

