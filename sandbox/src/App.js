import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Home from "./Home";
import Consent from "./Consent";
import Personalization from "./Personalization";
import PersonalizationSpa from "./PersonalizationSpa";
import PersonalizationAjo from "./PersonalizationAjo";
import PersonalizationProfile from "./PersonalizationProfile";
import Links from "./Links";
import EventMerge from "./EventMerge";
import LargePayload from "./LargePayload";
import OrgTwo from "./OrgTwo";
import DualTag from "./DualTag";
import RedirectOffers from "./RedirectOffers";
import RedirectedNewPage from "./RedirectedNewPage";
import PersonalizationAnalyticsClientSide from "./PersonalizationAnalyticsClientSide";
import PersonalizationFormBased from "./PersonalizationFormBased";
import Identity from "./Identity";
import AlloyVersion from "./components/AlloyVersion";
import ConfigOverrides from "./ConfigOverrides.jsx";
import InAppMessages from "./components/InAppMessagesDemo/InAppMessages";

const BasicExample = () => {
  return (
    <>
      <Router>
        <div style={{ display: "flex" }}>
          <nav style={{ listStyleType: "none", padding: 0 }}>
            <li style={{ display: "block" }}>
              <img
                src="logo.png"
                alt="Adobe AEP Web SDK"
                style={{ width: "150px" }}
              />
            </li>
            <li style={{ display: "block" }}>
              <Link to="/">Home</Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/consent">Consent</Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/personalization">Personalization</Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/personalizationSpa">Personalization - SPA</Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/personalizationAjo">Personalization - AJO</Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/personalizationA4TClientSide">
                Personalization - A4T Client Side
              </Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/personalizationProfile">
                Personalization - Profile
              </Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/personalizationFormBased">
                Personalization - Form Based
              </Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/links">Links</Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/eventMerge">Event-Merge</Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/largePayload">Large Payload</Link>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/orgTwo">Multiple Orgs</Link>
            </li>
            <li style={{ display: "block" }}>
              {/* Anchor tag to ensure app is reloaded with unsafe CSP */}
              <a href="/dualTag">Dual Tag</a>
            </li>
            <li style={{ display: "block" }}>
              <a href="/legacy.html">Legacy Visitor ID</a>
            </li>
            <li style={{ display: "block" }}>
              <a href="/redirectOffers">Redirect Offers</a>
            </li>
            <li style={{ display: "block" }}>
              <a href="/identity">Identity</a>
            </li>
            <li style={{ display: "block" }}>
              <a href="/configOverrides">Config Overrides</a>
            </li>
            <li style={{ display: "block" }}>
              <Link to="/inAppMessages">In-app Messages</Link>
            </li>
          </nav>
          <main
            style={{
              float: "right",
              marginLeft: "50px",
              padding: "1em",
              width: "calc(100% - 200px)"
            }}
          >
            <Route exact path="/" component={Home} />
            <Route path="/consent" component={Consent} />
            <Route path="/personalization" component={Personalization} />
            <Route path="/personalizationSpa" component={PersonalizationSpa} />
            <Route path="/personalizationAjo" component={PersonalizationAjo} />
            <Route
              path="/personalizationA4TClientSide"
              component={PersonalizationAnalyticsClientSide}
            />
            <Route
              path="/personalizationProfile"
              component={PersonalizationProfile}
            />
            <Route
              path="/personalizationFormBased"
              component={PersonalizationFormBased}
            />
            <Route path="/links" component={Links} />
            <Route path="/eventMerge" component={EventMerge} />
            <Route path="/largePayload" component={LargePayload} />
            <Route path="/orgTwo" component={OrgTwo} />
            <Route path="/dualTag" component={DualTag} />
            <Route path="/redirectOffers" component={RedirectOffers} />
            <Route path="/redirectedNewPage" component={RedirectedNewPage} />
            <Route path="/identity" component={Identity} />
            <Route path="/configOverrides" component={ConfigOverrides} />
            <Route path="/inAppMessages" component={InAppMessages} />
          </main>
          <hr />
        </div>
      </Router>
      <AlloyVersion />
    </>
  );
};

export default BasicExample;
