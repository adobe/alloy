/* eslint-disable no-console */

import React, { useEffect } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";

export default function RedirectOffers() {
  useAlloy();
  useEffect(() => {
    window
      .alloy("sendEvent", {
        renderDecisions: true,
      })
      .then(({ decisions = [] }) => {
        console.log("personalized decisions", decisions);
      });
  }, []);

  return (
    <div className="personalization-container">
      <ContentSecurityPolicy />
      <div>
        <h1>Redirect Offers</h1>
        <h2>You shouldn&apos;t see it, this is an old page!!!</h2>

        <h2>The new content was moved to /redirectedNewPage </h2>
      </div>
    </div>
  );
}
