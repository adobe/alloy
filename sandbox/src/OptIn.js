import React from "react";

const executeOptInCommand = purposes => () => {
  window
    .alloy("optIn", {
      purposes
    })
    .catch(console.error);
};

export default function OptIn() {
  return (
    <div>
      <h2>Opt-In</h2>
      <p>This page tests opting into purposes:</p>
      <div>
        <button onClick={executeOptInCommand("all")}>
          Opt into all purposes
        </button>
        <span>should trigger all queued up commands.</span>
      </div>
      <div>
        <button onClick={executeOptInCommand("none")}>
          Opt into no purposes
        </button>
        <span>should stop most commands and throw and error.</span>
      </div>
    </div>
  );
}
