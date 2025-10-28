import React from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import { styles } from "./acom-hackathon";
import includeScript from "./helpers/includeScript";
export default function Concierge() {
  useAlloy();
  includeScript(
    "https://experience-stage.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js",
  ).then(() => {
    window.bc_styles = styles;

    window.dispatchEvent(
      new CustomEvent("alloy-brand-concierge-instance", {
        detail: {
          instanceName: "alloy",
          stylingConfigurations: window.bc_styles,
          selector: "#brand-concierge-mount",
        },
      }),
    );
  });
  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Concierge Demo Page</h1>
      <p>
        This page will be used to test the Concierge feature of the Adobe
        Experience Platform.
      </p>
      <div id="brand-concierge-mount"></div>
    </div>
  );
}
