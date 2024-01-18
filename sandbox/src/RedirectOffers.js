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

/* eslint-disable no-console */

import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Heading } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";

export default function RedirectOffers() {
  const history = useHistory();

  useEffect(() => {
    window
      .alloy("sendEvent", {
        renderDecisions: true
      })
      .then(({ decisions = [] }) => {
        console.log("personalized decisions", decisions);
        history.push("/redirectedNewPage");
      });
  }, [history]);

  return (
    <div className="personalization-container">
      <ContentSecurityPolicy />
      <div>
        <Heading level={1}>Redirect Offers</Heading>
        <h2>You shouldn't see it, this is an old page!!!</h2>

        <h2>The new content was moved to /redirectedNewPage </h2>
      </div>
    </div>
  );
}
