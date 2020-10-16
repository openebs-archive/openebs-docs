const users = [
  {
    caption: 'User1',
    image: '/test-site/img/docusaurus.svg',
    infoLink: 'https://www.facebook.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'OpenEbs Documents' /* title for your website */,
  tagline: 'A website for OpenEBS Documentation',
  url: 'https://docs.openebs.io' /* your website url */,
  baseUrl: '/' /* base url for your project */,
  projectName: 'OpenEBS',
  themeConfig:{
    algolia: {
      apiKey: "dc657dfe30f42f228671f557f49ced7a",
      indexName: "openebs",
      startUrls: ["https://docs.openebs.io/docs/next"],
      inputSelector: "### REPLACE ME ####",
      debug: true
      },
    navbar:{
      logo: {
        src: 'img/OpenEBS-logo.svg',
      }
    }
  },
  
  //users,
  //onPageNav: 'separate',
  
  //createIssueUrl: 'https://github.com/openebs/openebs/issues/new/',
  /* path to images for header/footer */
  
  //headerText: 'img/openebs-docs-logo.svg',
  favicon: 'img/favicon.ico',
  /* colors for website */
  /*colors: {
    primaryColor: '#a9a9a9',
    secondaryColor: '#205C3B',
  },*/
  // organizationName: 'deltice', // or set an env variable ORGANIZATION_NAME
  // projectName: 'test-site', // or set an env variable PROJECT_NAME
  /*highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default',
  },*/
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
    '/js/code-blocks-buttons.js',
  ],
  stylesheets: [],
  /*markdownPlugins: [
    // Highlight admonitions.
    require('remarkable-admonitions')({ icon: 'svg-inline' })
  ],*/
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // Docs folder path relative to website dir.
          path: '../docs',
          editUrl: 'https://github.com/openebs/openebs-docs/edit/staging/website/',
          // Sidebars file relative to website dir.
          sidebarPath: require.resolve('./sidebars.json'),
        },
        // ...
      },
    ],
  ],
};

module.exports = siteConfig;
