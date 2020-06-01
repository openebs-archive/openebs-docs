/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const GithubButton = props => (
  <a
    className="github-button" // part of the https://buttons.github.io/buttons.js script in siteConfig.js
    href={`https://github.com/${props.config.organizationName}/${props.config.projectName}`}
    data-icon="octicon-star"
    data-count-href={`/${props.config.organizationName}/${props.config.projectName}/stargazers`}
    data-count-api={`/repos/${props.config.organizationName}/${props.config.projectName}#stargazers_count`}
    data-count-aria-label="# stargazers on GitHub"
    aria-label="Star this project on GitHub"
  >
    Star
  </a>
);

GithubButton.propTypes = {
  config: React.PropTypes.object
};

class Footer extends React.Component {
    docUrl(doc, language) {
        const baseUrl = this.props.config.baseUrl;
        return baseUrl + 'docs/' + (language ? language + '/' : '') + doc;
    }

    pageUrl(doc, language) {
        const baseUrl = this.props.config.baseUrl;
        return baseUrl + (language ? language + '/' : '') + doc;
    }

    render() {
        return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <div>
           <br />
           <div>
             <a href="https://openebs.io" target="_blank">
             <img
                src={`${this.props.config.baseUrl}docs/assets/openebs-logo.svg`}
                alt={this.props.config.title}
                width="130"
                height="110"
              />
            </a>
            </div>
	  <div>
		<a href="/docs/next/support.html" target="_blank">Get in touch with OpenEBS community</a>
          </div>
          </div>
        </section>

        
        <section className="copyright">
          {this.props.config.copyright && (
            <span>{this.props.config.copyright}</span>
          )}
        </section>
      </footer>
    );

    }
}

module.exports = Footer;
