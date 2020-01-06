import React from "react";

const executeOptOutCommand = purposes => () => {
  window
    .alloy("optOut", {
      purposes
    })
    .catch(console.error);
};

export default function OptOut() {
  return (
    <div>
      <h2>Opt-Out</h2>
      <p>This page tests opting out of purposes:</p>
      <div>
        <button onClick={executeOptOutCommand("all")}>
          Opt out of all purposes
        </button>
      </div>
    </div>
  );
}
