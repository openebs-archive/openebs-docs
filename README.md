# OpenEBS-docs

OpenEBS docs is the documentation repository for OpenEBS documentation. This is using Docusaurus as a documentation framework. It's easy to use and write documentation using Docusaurus, which uses markdown.
More on the Docusaurus can be found here: https://docusaurus.io/docs/en/installation.html


## For Developers

### Install Node.js

```bash
sudo apt-get install python-software-properties
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -

```

### To get the latest Node.js package

```bash
sudo apt-get install -y nodejs
```


### Install yarn
```bash
npm install -g yarn

```

### Clone openebs-docs

```bash
git clone https://github.com/openebs/openebs-docs.git

cd openebs-docs
```

### Start server

```bash
cd openebs-docs/website

openebs-docs/website$ npm start
```
Above step will start server on the `localhost:3000`

### How OpenEBS-docs get published ?

The following procedure lists the tasks from the time you select an issue to publishing the document.

1. Go through the [issues](https://github.com/openebs/openebs-docs/issues/) and select an issue you want to work on.

2. Go to `openebs-docs/website` and execute `npm start`. You can then preview the document at `http://localhost:3000/docs/next/quickstartguide.html`.

3. Work on your issue and create and submit your pull request(PR) for the members to review. Do perform the DCO signoff. DCO stands for Developer Certificate of Origin. It requires the commit message to have a `Signed-off-by:` statement along with the email address of the author of that commit. You can do this using the following command `git commit -s -m 'Commit message related to the issue'`. You can read more about it [here](https://github.com/probot/dco#how-it-works).

4. Make changes to your pull request as suggested by the members. In order to keep the pull request clean you can use `git commit --amend -s -m 'Commit message related to the issue'` along with `git push -f`. This will prevent multiple commits.

5. After you submit your pull request and is approved by atleast one member, it goes for `Travis CI` integration. Your pull request is checked and if it exits with code 0 in all the cases, then its considered as passed and good for merging. If it fails, then identify the errors and work on it and resubmit the pull request. You can use the commands mentioned in point 4.

6. The maintainers can then merge your pull request. Congrats on your contribution to the OpenEBS-docs code-base.
