# OpenEBS Documentation

[![Open Issues](https://img.shields.io/github/issues/openebs/openebs-docs.svg?style=flat-square)](https://github.com/openebs/openebs-docs/issues)
[![Open Pull Requests](https://img.shields.io/github/issues-pr/openebs/openebs-docs.svg?style=flat-square)](https://github.com/openebs/openebs-docs/pulls)
[![Commit Activity (Year)](https://img.shields.io/github/commit-activity/y/openebs/openebs-docs.svg?style=flat-square)](https://github.com/openebs/openebs-docs/commits)
[![Contributors](https://img.shields.io/github/contributors/openebs/openebs-docs.svg?style=flat-square)](https://github.com/openebs/openebs-docs/graphs/contributors)

openebs-docs is the repository for the official OpenEBS documentation. This is using Docusaurus as a documentation framework. It's easy to use and write documentation using Docusaurus, which uses markdown markup language.
Additional details on the Docusaurus project can be found [here](https://docusaurus.io/docs/en/installation.html).

## For Developers

### Install Node.js

```bash
sudo apt-get install python-software-properties
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
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
./launch.sh
```

The above step will start a server on the `localhost:3000`

### Build

To create a static build of the OpenEBS Docs, run the following script from the website directory:

```bash
yarn run build
```

This will generate a `build` directory inside the `website` directory containing the `.html` files from all of your docs and other pages included in `pages`.

### Deploy to Netlify

Deploying OpenEBS Docs to Netlify is easy as 1-2-3. Simply click the button below to set-up Netlify deployment. All required settings are already defined in the [netlify.toml](/netlify.toml) file.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/openebs/openebs-docs)

### How OpenEBS-docs get published?

The following procedure lists the tasks from the time you select an issue to publish the document:

1. Go through the [issues](https://github.com/openebs/openebs-docs/issues/), and select an issue you want to work on.

2. Go to `openebs-docs/website`, and execute `npm start`. You can then preview the document at `http://localhost:3000/docs/next/quickstartguide.html`.

3. Work on your issue and create and submit your pull request(PR) for the members to review. Do perform the DCO signoff. DCO stands for Developer Certificate of Origin. It requires the commit message to have a `Signed-off-by:` statement along with the email address of the author of that commit. You can do this using the following command `git commit -s -m 'Commit message related to the issue'`. You can read more about it [here](https://github.com/probot/dco#how-it-works).

4. Make changes to your pull request as suggested by the members. In order to keep the pull request clean, you can use `git commit --amend -s -m 'Commit message related to the issue'` along with `git push -f`. This will prevent multiple commits.

5. After you submit your pull request, and after it is approved by at least one member, it goes through `Travis CI` integration. Your pull request is checked, and if it exits with `code 0` for all the cases, then it's considered as passed and good for merging. If it fails, identify and fix the errors and resubmit it. You can use the commands mentioned in point 4.

6. The maintainers can then merge your pull request. Congrats on your contribution to the OpenEBS-docs code-base.

### License

The project is licensed under the Apache 2.0 License. See [LICENSE](LICENSE) for the full license text. 
