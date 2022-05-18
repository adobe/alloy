import React, { useEffect, useState } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

const SCOPES_FOR_PAGE = ["sandbox-personalization-page2"];

const metadata = {
  "sandbox-personalization-page2": {
    selector: "#form-based-personalization",
    actionType: "setHtml"
  }
};

const usePropositions = () => {
  const [propositions, setPropositions] = useState(undefined);
  useSendPageViewEvent({ setPropositions, decisionScopes: SCOPES_FOR_PAGE });
  useEffect(() => {
    if (propositions) {
      window.alloy("applyPropositions", {
        propositions,
        metadata
      });
    }
  });
};

const updateComponent = ({ renderCounter, setRenderCounter }) => {
  setRenderCounter(renderCounter + 1);
};

export default function Personalization() {
  const [renderCounter, setRenderCounter] = useState(0);
  usePropositions();
  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Personalization</h1>
      <h2>Number of times rendered: {renderCounter}</h2>
      <button
        onClick={() => updateComponent({ renderCounter, setRenderCounter })}
      >
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
