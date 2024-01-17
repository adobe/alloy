import React from "react";
import { Heading } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

export default function PersonalizationAjo() {
  useSendPageViewEvent({ instanceName: "cjmProd" });
  return (
    <div>
      <ContentSecurityPolicy />
      <Heading level={1}>AJO Personalization</Heading>
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
