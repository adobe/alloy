import React, { useEffect } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";

export default function TopBottom() {
  useEffect(async () => {
    let { propositions } = await window.alloy("sendEvent", {
      renderDecisions: false,
      personalization: {
        decisionScopes: ["__view__"]
      },
      xdm: {
        eventType: "decisioning.propositionFetch"
      }
    });

    ({ propositions } = await window.alloy("applyPropositions", {
      propositions
    }));

    await window.alloy("sendEvent", {
      xdm: {
        eventType: "page-view"
      },
      propositions
    });
  }, []);

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Top/Bottom Example</h1>
      <p>
        This page tests rendering of activities using an AJO surface. If you
        navigated here from another sandbox view, you will probably need to
        refresh your browser because this is how to properly simulate a non-SPA
        workflow.
      </p>
      <div
        style={{ border: "1px solid red" }}
        className="personalization-container"
      >
        This is the personalization placeholder. Personalized content has not
        been loaded.
      </div>
    </div>
  );
}
