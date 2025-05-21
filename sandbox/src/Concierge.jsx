import React from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import useSendPageViewEvent from "./helpers/useSendPageViewEvent";

export default function Concierge() {
  useAlloy({
    instanceNames:["alloy"],
    configurations: {
      datastreamId:
        "211312ed-d9ca-4f51-b09c-2de37a2a24d0",
      orgId: "52C418126318FCD90A494134@AdobeOrg",
    }
  });
  useSendPageViewEvent({ renderDecisions: true });

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Concierge Demo Page</h1>
      <p>
       This page will be used to test the Concierge feature of the Adobe Experience Platform.
      </p>
      <div style={{ border: "1px solid red" }} id="personalization-container">

      </div>
    </div>
  );
}
