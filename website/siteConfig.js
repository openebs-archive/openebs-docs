const users = [
  {
    caption: 'User1',
    image: '/test-site/img/docusaurus.svg',
    infoLink: 'https://www.facebook.com',
    pinned: true,
  },
];

const siteConfig = {
  title: '' /* title for your website */,
  tagline: 'A website for OpenEBS Documentation',
  url: 'https://docs.openebs.io' /* your website url */,
  baseUrl: '/' /* base url for your project */,
  projectName: 'OpenEBS',

  algolia: {
    apiKey: "",
    indexName: "",
    inputSelector: "",
    debug: true
    },

    headerLinks: [
       
        {
            search: true
        },
    //{page: 'help', label: 'Help'},
  ],
  users,
  /* path to images for header/footer */
  headerIcon: 'img/openebs-logo.svg',
  favicon: 'img/favicon.png',
  /* colors for website */
  colors: {
    primaryColor: '#084766',
    secondaryColor: '#205C3B',
  },
  // organizationName: 'deltice', // or set an env variable ORGANIZATION_NAME
  // projectName: 'test-site', // or set an env variable PROJECT_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default',
  },
  scripts: ['https://buttons.github.io/buttons.js'],
};

module.exports = siteConfig;
