const siteConfig = {
  title: '',
  tagline: 'A website for OpenEBS Documentation',
  url: 'http://localhost:3000',
  baseUrl: '/',
  projectName: 'OpenEBS',
  organizationName: 'OpenEBS',
  algolia: {
    apiKey: "dc657dfe30f42f228671f557f49ced7a",
    indexName: "openebs",
    startUrls: ["https://docs.openebs.io/docs/next"],
    debug: false,
  },
  headerLinks: [
    {
      search: true
    },
  ],
  headerIcon: 'img/openebs-docs-logo.svg',
  favicon: 'img/favicon.ico',
  colors: {
    primaryColor: '#a9a9a9',
    secondaryColor: '#205C3B',
  },
  copyright: `Copyright © ${new Date().getFullYear()} MayaData Inc.`,
  highlight: {
    theme: 'default',
  },
  scripts: [
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.4/clipboard.min.js',
    '/js/code-blocks-buttons.js',
  ],
  stylesheets: [
    '/css/code-blocks-buttons.css',
  ],
  editUrl: 'https://github.com/openebs/openebs-docs/edit/staging/docs/',
  onPageNav: 'separate',
  docsSideNavCollapsible: true,
  cleanUrl: true,
  scrollToTop: true,
  scrollToTopOptions: {
    zIndex: 100,
  },
};

module.exports = siteConfig;
