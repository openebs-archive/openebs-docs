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
            <a href="https://openebs.io/events" target="_blank">
              Events
            </a>
            <a href="https://openebs.io/hackfests" target="_blank">
              Hackfests
            </a>
            <a href="https://openebs.io/hangouts" target="_blank">
              Hangouts
            </a>
            <a href="https://openebs.io/meetups" target="_blank">
             Meetups
            </a>
            <a href="https://openebs.io/cafe" target="_blank">
              Cafe
            </a>
          </div>

          <div>
            <a href="https://openebs.io/careers" target="_blank">
              Careers
            </a>
            <a href="https://openebs.io/newsletter" target="_blank">
              Newsletters
            </a>
            <a href="https://www.youtube.com/channel/UC3ywadaAUQ1FI4YsHZ8wa0g" target="_blank">
              Videos
            </a>
            <a href="" target="_blank">
             Docs
            </a>
            <a href="" target="_blank">
              Releases
            </a>
          </div>

          <div>
            <a href="https://slack.openebs.io/" target="_blank">
              Slack
            </a>
            <a href="https://github.com/openebs/" target="_blank">
              GitHub
            </a>
            <a href="https://twitter.com/openebs" target="_blank">
              Twitter
            </a>
            <a href="https://blog.openebs.io" target="_blank">
              Blogs
            </a>
            <a href="" target="_blank">
              Email
            </a>
            <a href="https://facebook.com/openebs" target="_blank">
              Facebook
            </a>
          </div>

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
            <br />
            <div>
              <a href="https://mayaonline.io" target="_blank">
              <img
                src={`${this.props.config.baseUrl}docs/assets/mayaonline-logo.svg`}
                alt={this.props.config.title}
                width="130"
                height="110"
               />
              </a>
            </div>
            <br />
            <div>
              <a href="https://mayadata.io" target="_blank">
              <img
                src={`${this.props.config.baseUrl}docs/assets/mayadata-logo.svg`}
                alt={this.props.config.title}
                width="130"
                height="110"
               />
              </a>
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
