import React from "react";
import ContentSecurityPolicy from "./ContentSecurityPolicy";

const executeSetConsentCommand = generalPurpose => () => {
  window
    .alloy("setConsent", {
      consent: [
        {
          standard: "Adobe",
          version: "1.0",
          value: {
            general: generalPurpose
          }
        }
      ]
    })
    .catch(console.error);
};

export default function Consent() {
  return (
    <div>
      <ContentSecurityPolicy />
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
