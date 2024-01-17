/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React from "react";
import { Heading } from "@adobe/react-spectrum";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

const makePayload = (size, times = 1) => () => {
  for (let i = 0; i < times; i += 1) {
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
      <ContentSecurityPolicy />
      <Heading level={1}>Large Payload</Heading>
      <p>This page tests send really large payloads to the edge.</p>
      <p>
        All those requests should attempt to use <code>sendBeacon</code> and
        fall back to <code>fetch</code> if the request can't be queued.
      </p>
      <p>The sizes below do not include the size of the Context data:</p>

      <button type="button" onClick={makePayload(5)}>
        Send 5kb payload
      </button>
      <button type="button" onClick={makePayload(10)}>
        Send 10kb payload
      </button>
      <button type="button" onClick={makePayload(20)}>
        Send 20kb payload
      </button>
      <button type="button" onClick={makePayload(50)}>
        Send 50kb payload
      </button>
      <button type="button" onClick={makePayload(100)}>
        Send 100kb payload
      </button>
      <button type="button" onClick={makePayload(200)}>
        Send 200kb payload
      </button>

      <button type="button" onClick={makePayload(5, 2)}>
        Send 2 5kb payloads
      </button>
      <button type="button" onClick={makePayload(5, 3)}>
        Send 3 5kb payloads
      </button>
      <button type="button" onClick={makePayload(5, 4)}>
        Send 4 5kb payloads
      </button>
    </div>
  );
}
