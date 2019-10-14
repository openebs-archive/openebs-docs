/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary');
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const CWD = process.cwd();

const siteConfig = require(CWD + '/siteConfig.js');
const versions = require(CWD + '/versions.json').slice().concat([
  "1.1.0",
  "1.0.0",
  "0.9.0",
  "0.8.2",
  "0.8.1",
  "0.8.0",
]);


class Versions extends React.Component {
  render() {
    const latestVersion = versions[0];
    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer versionsContainer">
          <div className="post">
            <header className="postHeader">
              <h2>{siteConfig.title + ' Versions'}</h2>
            </header>
            <p>New versions of this project are released every so often.</p>
            <h3 id="latest">Current version (Stable)</h3>
            <table className="versions">
              <tbody>
                <tr>
                  <th>{latestVersion}</th>
                  <td>
                    <a href='/docs/overview.html'>Documentation</a>
                  </td>
                </tr>
              </tbody>
            </table>
            <h3 id="rc">Latest Version</h3>
            <table className="versions">
              <tbody>
                <tr>
                  <th>master</th>
                  <td>
                    <a href='https://github.com/openebs/openebs'>Source Code</a>
                  </td>
                </tr>
              </tbody>
            </table>
            <h3 id="archive">Past Versions</h3>
            <table className="versions">
              <tbody>
                {versions.map(
                  version =>
                    version !== latestVersion && (
                      <tr>
                        <th>{version}</th>
                        <td>
                          <a href={`https://docs.openebs.io/v${version.replace(/\./g, '')}/`}>Documentation</a>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
            <p>
              You can find past versions of this project{' '}
              <a href="https://github.com/openebs/openebs/releases"> on GitHub </a>.
            </p>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Versions;
