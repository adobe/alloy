import React, { useEffect, useState } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

const usePropositions = () => {
  const [propositions, setPropositions] = useState(undefined);
  useSendPageViewEvent({ setPropositions, renderDecisions: true });
  useEffect(() => {
    if (propositions) {
      window.alloy("applyPropositions", {
        propositions
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
        This page tests rendering of activities using a <i>__view__</i> scope.
        If you navigated here from another sandbox view, you will probably need
        to refresh your browser because this is how to properly simulate a
        non-SPA workflow.
      </p>
      <div style={{ border: "1px solid red" }} id="personalization-container">
        This is the personalization placeholder. Personalized content has not
        been loaded.
      </div>
    </div>
  );
}
