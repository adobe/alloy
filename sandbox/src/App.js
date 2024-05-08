/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React from "react.js";
import { BrowserRouter as Router, Route, Link } from "react-router-dom.js";

import Home from "./Home.js";
import Consent from "./Consent.js";
import Personalization from "./Personalization.js";
import PersonalizationSpa from "./PersonalizationSpa.js";
import PersonalizationAjo from "./PersonalizationAjo.js";
import PersonalizationProfile from "./PersonalizationProfile.js";
import Links from "./Links.js";
import EventMerge from "./EventMerge.js";
import LargePayload from "./LargePayload.js";
import OrgTwo from "./OrgTwo.js";
import DualTag from "./DualTag.js";
import RedirectOffers from "./RedirectOffers.js";
import RedirectedNewPage from "./RedirectedNewPage.js";
import PersonalizationAnalyticsClientSide from "./PersonalizationAnalyticsClientSide.js";
import PersonalizationFormBased from "./PersonalizationFormBased.js";
import Identity from "./Identity.js";
import AlloyVersion from "./components/AlloyVersion.js";
import ConfigOverrides from "./ConfigOverrides.jsx.js";
import InAppMessages from "./components/InAppMessagesDemo/InAppMessages.js";

const BasicExample = () => {
  return (
    <>
      <Router>
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/consent">Consent</Link>
            </li>
            <li>
              <Link to="/personalization">Personalization</Link>
            </li>
            <li>
              <Link to="/personalizationSpa">Personalization - SPA</Link>
            </li>
            <li>
              <Link to="/personalizationAjo">Personalization - AJO</Link>
            </li>
            <li>
              <Link to="/personalizationA4TClientSide">
                Personalization - A4T Client Side
              </Link>
            </li>
            <li>
              <Link to="/personalizationProfile">
                Personalization - Profile
              </Link>
            </li>
            <li>
              <Link to="/personalizationFormBased">
                Personalization - Form Based
              </Link>
            </li>
            <li>
              <Link to="/links">Links</Link>
            </li>
            <li>
              <Link to="/eventMerge">Event-Merge</Link>
            </li>
            <li>
              <Link to="/largePayload">Large Payload</Link>
            </li>
            <li>
              <Link to="/orgTwo">Multiple Orgs</Link>
            </li>
            <li>
              {/* Anchor tag to ensure app is reloaded with unsafe CSP */}
              <a href="/dualTag">Dual Tag</a>
            </li>
            <li>
              <a href="/legacy.html">Legacy Visitor ID</a>
            </li>
            <li>
              <a href="/redirectOffers">Redirect Offers</a>
            </li>
            <li>
              <a href="/identity">Identity</a>
            </li>
            <li>
              <a href="/configOverrides">Config Overrides</a>
            </li>
            <li>
              <Link to="/inAppMessages">In-app Messages</Link>
            </li>
          </ul>
          <hr />

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
        </div>
      </Router>
      <AlloyVersion />
    </>
  );
};

export default BasicExample;
