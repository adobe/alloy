import React from "react";

export default function LargePayload() {

  const makePayload = size => () => {
    const payload = new Uint8Array(size * 1024);
    window.alloy("event", {
      data: {
        payload
      }
    });
  };

  return (
    <div>
      <h2>Large Payloads</h2>
      <p>This page tests send really large payloads to the edge.</p>
      <p>All those requests should not use beacon calls, and should not fail.</p>
      <p>The sizes below do not include the size of the Context data:</p>

      <p onClick={makePayload(5)}>Send 5kb payload</p>
      <p onClick={makePayload(10)}>Send 10kb payload</p>
      <p onClick={makePayload(20)}>Send 20kb payload</p>
      <p onClick={makePayload(50)}>Send 50kb payload</p>
      <p onClick={makePayload(100)}>Send 100kb payload</p>
      <p onClick={makePayload(200)}>Send 200kb payload</p>
    </div>
  );
}
