/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { useState } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { useMediaQuery } from "@react-spectrum/utils";
import { Button, Text, Menu, Provider } from "@adobe/react-spectrum";
import ShowMenu from "@spectrum-icons/workflow/ShowMenu";

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

const MenuIcon = function MenuIcon() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="primary" onPress={handleOpen}>
        <Menu />
        <ShowMenu />
        <Text>Menu</Text>
      </Button>
      {isOpen && (
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "200px",
            height: "100vh",
            background: "white",
            zIndex: 1000
          }}
        >
          <ul>
            <li style={{ display: "block" }}>
              <img
                src="logo.png"
                alt="Adobe AEP Web SDK"
                style={{ width: "150px" }}
              />
            </li>
            <li>
              <Link to="/" onClick={handleClose}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/consent" onClick={handleClose}>
                Consent
              </Link>
            </li>
            <li>
              <Link to="/personalization" onClick={handleClose}>
                Personalization
              </Link>
            </li>
            <li>
              <Link to="/personalizationSpa" onClick={handleClose}>
                Personalization - SPA
              </Link>
            </li>
            <li>
              <Link to="/personalizationAjo" onClick={handleClose}>
                Personalization - AJO
              </Link>
            </li>
            <li>
              <Link to="/personalizationA4TClientSide" onClick={handleClose}>
                Personalization - A4T Client Side
              </Link>
            </li>
            <li>
              <Link to="/personalizationProfile" onClick={handleClose}>
                Personalization - Profile
              </Link>
            </li>
            <li>
              <Link to="/personalizationFormBased" onClick={handleClose}>
                Personalization - Form Based
              </Link>
            </li>
            <li>
              <Link to="/links" onClick={handleClose}>
                Links
              </Link>
            </li>
            <li>
              <Link to="/eventMerge" onClick={handleClose}>
                Event-Merge
              </Link>
            </li>
            <li>
              <Link to="/largePayload" onClick={handleClose}>
                Large Payload
              </Link>
            </li>
            <li>
              <Link to="/orgTwo" onClick={handleClose}>
                Multiple Orgs
              </Link>
            </li>
            <li>
              <a href="/dualTag" onClick={handleClose}>
                Dual Tag
              </a>
            </li>
            <li>
              <a href="/legacy.html" onClick={handleClose}>
                Legacy Visitor ID
              </a>
            </li>
            <li>
              <a href="/redirectOffers" onClick={handleClose}>
                Redirect Offers
              </a>
            </li>
            <li>
              <a href="/identity" onClick={handleClose}>
                Identity
              </a>
            </li>
            <li>
              <a href="/configOverrides" onClick={handleClose}>
                Config Overrides
              </a>
            </li>
            <li>
              <Link to="/inAppMessages" onClick={handleClose}>
                In-app Messages
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </>
  );
};

const BasicExample = () => {
  const isMobileView = useMediaQuery("(max-width: 700px)");
  return (
    <Provider colorScheme="light">
      <Router>
        <div style={{ display: "flex" }}>
          {isMobileView ? (
            <MenuIcon />
          ) : (
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
          )}
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
    </Provider>
  );
};

export default BasicExample;
