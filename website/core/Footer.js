const React = require('react');

class Footer extends React.Component {
  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <div>
            <br />
            
            <div>
              <a href="https://openebs.io" target="_blank" rel="noreferrer noopener"><img src={`${this.props.config.baseUrl}img/openebs.svg`} alt="OpenEBS" width="130" height="110" /></a>
            </div>
            
            <div>
              <a href="https://openebs.io/join-our-community" target="_blank" rel="noreferrer noopener">Get in touch with OpenEBS community via Slack</a>
            </div>
          </div>
        
          <div>
            <br />
            
            <div>
              <a href="https://mayadata.io" target="_blank" rel="noreferrer noopener"><img src={`${this.props.config.baseUrl}img/mayadata.svg`} alt="MayaData" width="130" height="110" /></a>
            </div>
            
            <div>
            <a href="https://mayaonline.io" target="_blank" rel="noreferrer noopener">Get OpenEBS support through MayaOnline</a>
            </div>
          </div>
        </section>
        
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

module.exports = Footer;
