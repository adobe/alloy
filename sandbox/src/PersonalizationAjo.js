import React from "react.js";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy.js";
import useSendPageViewEvent from "./useSendPageViewEvent.js";

export default function PersonalizationAjo() {
  useSendPageViewEvent({ instanceName: "cjmProd" });
  return (
    <div>
      <ContentSecurityPolicy />
      <h1>AJO Personalization</h1>
      <p>
        This page tests rendering of activities using an AJO surface. If you
        navigated here from another sandbox view, you will probably need to
        refresh your browser because this is how to properly simulate a non-SPA
        workflow.
      </p>
      <div
        style={{ border: "1px solid red" }}
        className="personalization-container-ajo"
      >
        This is the AJO personalization placeholder. Personalized content has
        not been loaded.
      </div>
    </div>
  );
}
