/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* List of projects/orgs using your project for the users page */
const users = [
  {
    caption: 'User1',
    image: '/test-site/img/docusaurus.svg',
    infoLink: 'https://www.facebook.com',
    pinned: true,
  },
];

const siteConfig = {
  title: 'OpenEBS Doc' /* title for your website */,
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
  headerIcon: 'img/mayaonline.png',
  favicon: 'img/favicon.png',
  /* colors for website */
  colors: {
    primaryColor: '#f93',
    secondaryColor: '#205C3B',
  },
  /* custom fonts for website */
  /*fonts: {
    myFont: [
      "Times New Roman",
      "Serif"
    ],
    myOtherFont: [
      "-apple-system",
      "system-ui"
    ]
  },*/
  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright:
    'Copyright © ' +
    new Date().getFullYear() +
    ' MayaData Inc.',
  // organizationName: 'deltice', // or set an env variable ORGANIZATION_NAME
  // projectName: 'test-site', // or set an env variable PROJECT_NAME
  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default',
  },
  scripts: ['https://buttons.github.io/buttons.js'],
  // You may provide arbitrary config keys to be used as needed by your template.
  repoUrl: 'https://github.com/facebook/test-site',
};

module.exports = siteConfig;
