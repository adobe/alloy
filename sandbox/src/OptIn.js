import React from "react";

const makeOptInCommand = purposes => () => {
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
      <p>This page tests Opting into purposes:</p>
      <div>
        <button onClick={makeOptInCommand("all")}>OptIn to all purposes</button>
        <span>should trigger all queued up commands.</span>
      </div>
      <div>
        <button onClick={makeOptInCommand("none")}>OptIn to no purposes</button>
        <span>should stop most commands and throw and error.</span>
      </div>
    </div>
  );
}
