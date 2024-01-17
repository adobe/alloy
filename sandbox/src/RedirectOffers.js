/* eslint-disable no-console */

import React, { useEffect } from "react";
import { Heading } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";

export default function RedirectOffers() {
  useEffect(() => {
    window
      .alloy("sendEvent", {
        renderDecisions: true
      })
      .then(({ decisions = [] }) => {
        console.log("personalized decisions", decisions);
      });
  }, []);

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
