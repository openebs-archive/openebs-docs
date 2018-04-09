# OpenEBS-docs

OpenEBS docs is the documentation repository for OpenEBS documentation. This is using Docusaurus as a documentation framework. It's easy to use and write documentation using Docusaurus, which uses markdown. 
More on the Docusaurus can be found here: https://docusaurus.io/docs/en/installation.html


## For Developers

### Install nodejs

```
sudo apt-get install python-software-properties
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
```

### To get the latest nodejs package

```
sudo apt-get install -y nodejs
```

### Install yarn

```
npm install -g yarn
```

### Clone openebs-docs

```
git clone https://github.com/openebs/openebs-docs.git
cd openebs-docs
```

### Start server

```
cd openebs-docs/website
openebs-docs/website$ npm install docusaurus
openebs-docs/website$ npm start
```
Above steps will start the server on the localhost:3000
