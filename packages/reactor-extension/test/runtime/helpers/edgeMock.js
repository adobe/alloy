/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { http, HttpResponse } from "msw";
import { worker } from "./worker.js";

// Host-agnostic like the TestCafe logger: Alloy sends the first request to
// adobedc.demdex.net and later ones to edge.adobedc.net.
const EDGE_ENDPOINT = /^https:\/\/[^/]+\/ee\/.*v1\/(interact|collect)/;
const ACQUIRE_ENDPOINT = /^https:\/\/[^/]+\/ee\/.*v1\/identity\/acquire/;

export const ECID = "41861666193140161934276845651148876988";

const createHandler = (endpoint, requests) =>
  http.post(endpoint, async ({ request }) => {
    const url = new URL(request.url);
    const body = await request.clone().json();
    const responseBody = {
      requestId: crypto.randomUUID(),
      handle: [
        {
          payload: [{ id: ECID, namespace: { code: "ECID" } }],
          type: "identity:result",
        },
      ],
    };
    const status = 200;
    requests.push({ url, body, response: { status, body: responseBody } });
    return HttpResponse.json(responseBody, { status });
  });

/**
 * Mocks the Edge Network endpoints and records what the runtime library sent.
 * Replaces the TestCafe RequestLogger. `requests` holds interact/collect
 * calls, `acquireRequests` holds identity/acquire calls.
 */
export default () => {
  const requests = [];
  const acquireRequests = [];

  worker.use(
    createHandler(EDGE_ENDPOINT, requests),
    createHandler(ACQUIRE_ENDPOINT, acquireRequests),
  );

  return { requests, acquireRequests };
};
