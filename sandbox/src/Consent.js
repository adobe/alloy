import React from "react";

const executeSetConsentCommand = generalPurpose => () => {
  window
    .alloy("setConsent", {
      purposes: {
        general: generalPurpose
      }
    })
    .catch(console.error);
};

export default function Consent() {
  return (
    <div>
      <h2>Opt-In</h2>
      <p>This page tests user consent:</p>
      <div>
        <button onClick={executeSetConsentCommand("in")}>
          Set consent to "in"
        </button>
        <span>should trigger all queued up commands.</span>
      </div>
      <div>
        <button onClick={executeSetConsentCommand("out")}>
          Set consent to "out"
        </button>
        <span>should stop most commands and throw an error.</span>
      </div>
    </div>
  );
}
