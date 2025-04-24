import React, { useEffect } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import setupAlloy from "./helpers/setupAlloy";
import configureAlloy from "./helpers/configureAlloy";

export default function RedirectedNewPage() {
  useEffect(() => {
    setupAlloy();
    configureAlloy();

    window.alloy("sendEvent", {
      renderDecisions: true,
    });
  }, []);
  return (
    <div className="personalization-container">
      <ContentSecurityPolicy />
      <div>
        <h1>You have qualified for the redirect offer</h1>
        <h2>Here are the newer offers!</h2>
      </div>
    </div>
  );
}
