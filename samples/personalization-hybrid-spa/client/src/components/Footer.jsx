import React, { Component } from 'react'
/**
 * Create Footer Component
 */
class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="container">
          <ul className="Footernav-disclaimers">
            <li className="Footernav-disclaimer">Copyright &copy; 2019 Adobe. All rights reserved.</li>
            <li className="Footernav-disclaimer" id="Globalnav.copyright.Privacy">
              <a href="//www.adobe.com/privacy.html" className="Footernav-disclaimer-link" target="_self">Privacy</a>
            </li>
            <li className="Footernav-disclaimer" id="Globalnav.copyright.Terms_of_Use">
              <a href="//www.adobe.com/legal/terms.html" className="Footernav-disclaimer-link" target="_self">Terms of
                Use</a>
            </li>
            <li className="Footernav-disclaimer" id="Globalnav.copyright.Cookies">
              <a href="//www.adobe.com/privacy/cookies.html" className="Footernav-disclaimer-link" target="_self">Cookies</a>
            </li>
          </ul>
        </div>
      </footer>
    )
  }
}
export default Footer
