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

import About from "./About";
import Home from "./Home";
import OrgTwo from "./OrgTwo";
import Links from "./Links";
import EventMerge from "./EventMerge";
import OptIn from "./OptIn";
import LargePayload from "./LargePayload";
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
            <Link to="/DualTag">Dual Tag</Link>
          </li>
        </ul>

        <hr />

        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/orgTwo" component={OrgTwo} />
        <Route path="/links" component={Links} />
        <Route path="/eventMerge" component={EventMerge} />
        <Route path="/optIn" component={OptIn} />
        <Route path="/largePayload" component={LargePayload} />
        <Route path="/DualTag" component={DualTag} />
      </div>
    </Router>
  );
}

export default BasicExample;
