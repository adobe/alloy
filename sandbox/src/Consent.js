import React from "react";

const executeSetConsentCommand = purposes => () => {
  window
    .alloy("setConsent", {
      purposes
    })
    .catch(console.error);
};

export default function Consent() {
  return (
    <div>
      <h2>Opt-In</h2>
      <p>This page tests user consent:</p>
      <div>
        <button onClick={executeSetConsentCommand("all")}>
          Consent to all purposes
        </button>
        <span>should trigger all queued up commands.</span>
      </div>
      <div>
        <button onClick={executeSetConsentCommand("none")}>
          Consent to no purposes
        </button>
        <span>should stop most commands and throw an error.</span>
      </div>
    </div>
  );
}
