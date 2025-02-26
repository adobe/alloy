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

import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Home from "./Home.jsx";
import Consent from "./Consent.jsx";
import Personalization from "./Personalization.jsx";
import PersonalizationSpa from "./PersonalizationSpa.jsx";
import PersonalizationAjo from "./PersonalizationAjo.jsx";
import PersonalizationProfile from "./PersonalizationProfile.jsx";
import Links from "./Links.jsx";
import EventMerge from "./EventMerge.jsx";
import LargePayload from "./LargePayload.jsx";
import OrgTwo from "./OrgTwo.jsx";
import DualTag from "./DualTag.jsx";
import RedirectOffers from "./RedirectOffers.jsx";
import RedirectedNewPage from "./RedirectedNewPage.jsx";
import PersonalizationAnalyticsClientSide from "./PersonalizationAnalyticsClientSide.jsx";
import PersonalizationFormBased from "./PersonalizationFormBased.jsx";
import Identity from "./Identity.jsx";
import AlloyVersion from "./components/AlloyVersion.jsx";
import ConfigOverrides from "./ConfigOverrides.jsx";
import InAppMessages from "./components/InAppMessagesDemo/InAppMessages.jsx";
import ContentCards from "./components/ContentCardsDemo/ContentCards.jsx";

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
            <li>
              <Link to="/contentCards">Content Cards</Link>
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
          <Route path="/contentCards" component={ContentCards} />
        </div>
      </Router>
      <AlloyVersion />
    </>
  );
};

export default BasicExample;
