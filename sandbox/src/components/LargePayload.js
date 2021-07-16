import React from "react";
import useSendPageViewEvent from "./useSendPageViewEvent";
import { Button } from "./Button";

const makePayload = (size, times = 1) => () => {
  var i;
  for (i = 0; i < times; i++) {
    const payload = new Uint8Array(size * 1024);
    window.alloy("sendEvent", {
      documentUnloading: true,
      data: {
        payload
      }
    });
  }
};

export default function LargePayload() {
  useSendPageViewEvent();
  return (
    <div>
      <h1>Large Payload</h1>
      <p>This page tests send really large payloads to the edge.</p>
      <p>
        All those requests should attempt to use <code>sendBeacon</code> and
        fall back to <code>fetch</code> if the request can't be queued.
      </p>
      <p>The sizes below do not include the size of the Context data:</p>

      <Button type="button" onClick={makePayload(5)}>
        Send 5kb payload
      </Button>
      <Button type="button" onClick={makePayload(10)}>
        Send 10kb payload
      </Button>
      <Button type="button" onClick={makePayload(20)}>
        Send 20kb payload
      </Button>
      <Button type="button" onClick={makePayload(50)}>
        Send 50kb payload
      </Button>
      <Button type="button" onClick={makePayload(100)}>
        Send 100kb payload
      </Button>
      <Button type="button" onClick={makePayload(200)}>
        Send 200kb payload
      </Button>

      <Button type="button" onClick={makePayload(5, 2)}>
        Send 2 5kb payloads
      </Button>
      <Button type="button" onClick={makePayload(5, 3)}>
        Send 3 5kb payloads
      </Button>
      <Button type="button" onClick={makePayload(5, 4)}>
        Send 4 5kb payloads
      </Button>
    </div>
  );
}
