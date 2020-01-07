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

import Home from "./Home";
import OptIn from "./OptIn";
import OptOut from "./OptOut";
import Links from "./Links";
import EventMerge from "./EventMerge";
import LargePayload from "./LargePayload";
import OrgTwo from "./OrgTwo";
import DualTag from "./DualTag";

function BasicExample() {
  return (
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/optIn">Opt-In</Link>
          </li>
          <li>
            <Link to="/optOut">Opt-Out</Link>
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
            <Link to="/dualTag">Dual Tag</Link>
          </li>
          <li>
            <a href="/legacy.html">legacy</a>
          </li>
        </ul>

        <hr />

        <Route exact path="/" component={Home} />
        <Route path="/optIn" component={OptIn} />
        <Route path="/optOut" component={OptOut} />
        <Route path="/links" component={Links} />
        <Route path="/eventMerge" component={EventMerge} />
        <Route path="/largePayload" component={LargePayload} />
        <Route path="/orgTwo" component={OrgTwo} />
        <Route path="/dualTag" component={DualTag} />
      </div>
    </Router>
  );
}

export default BasicExample;
