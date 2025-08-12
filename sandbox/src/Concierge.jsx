import React, {useEffect} from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import {styles} from "./acom-hackathon";
export default function Concierge() {
  useAlloy();

  useEffect(() => {
    window["alloy"]("sendEvent", {
      conversation: {fetchExperience: true}
    }).then(result=> {
      window["alloy"]("bootstrapConversationalExperience", {
        selector: "#brand-concierge-mount",
        src: "https://experience-stage.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js",
        stylingConfigurations: styles
      })
    });
  }, []);

  return (
    <div>
      <ContentSecurityPolicy/>
      <h1>Concierge Demo Page</h1>
      <p>
        This page will be used to test the Concierge feature of the Adobe Experience Platform.
      </p>
      <div id="brand-concierge-mount">

      </div>
    </div>

  );
}
