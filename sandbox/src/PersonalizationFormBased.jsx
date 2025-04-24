import React, { useEffect, useState } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import sendPageViewEvent from "./helpers/sendPageViewEvent";
import configureAlloy from "./helpers/configureAlloy";
import setupAlloy from "./helpers/setupAlloy";

const SCOPES_FOR_PAGE = ["sandbox-personalization-page2"];

const metadata = {
  "sandbox-personalization-page2": {
    selector: "#form-based-personalization",
    actionType: "setHtml",
  },
};

export default function Personalization() {
  const [renderCounter, setRenderCounter] = useState(0);
  const [propositions, setPropositions] = useState(undefined);

  useEffect(() => {
    setupAlloy();
    configureAlloy();
    sendPageViewEvent({
      renderDecisions: true,
      setPropositions,
      decisionScopes: SCOPES_FOR_PAGE, // Note: this option will soon be deprecated, please use personalization.decisionScopes instead
    });
  }, []);

  useEffect(() => {
    if (propositions) {
      window.alloy("applyPropositions", {
        propositions,
        metadata,
      });
    }
  }, [propositions]);

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Personalization</h1>
      <h2>Number of times rendered: {renderCounter}</h2>
      <button onClick={() => setRenderCounter((u) => u + 1)}>
        Re-render component
      </button>
      <p>
        This page tests rendering of form-based activities, which need a
        user-provided selector and actionType in order to be properly rendered
        for a given scope. If you navigated here from another sandbox view, you
        will probably need to refresh your browser because this is how to
        properly simulate a non-SPA workflow.
      </p>
      <div style={{ border: "1px solid red" }} id="form-based-personalization">
        This is a form-based personalization placeholder. Personalized content
        has not been loaded.
      </div>
    </div>
  );
}
