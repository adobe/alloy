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
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import alloyConfig from "../../helpers/alloy/config.js";
import { MAIN_CLUSTER_COOKIE_NAME } from "../../helpers/constants/cookies.js";

// Simulates the edge response when routed via the Singapore cluster:
// mboxEdgeCluster=38 maps to sgp3 in Konductor.
const sgp3LocationHintHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === alloyConfig.datastreamId) {
      return HttpResponse.json({
        requestId: "sgp3-location-hint-test",
        handle: [
          {
            payload: [
              {
                id: "41861666193140161934276845651148876988",
                namespace: { code: "ECID" },
              },
            ],
            type: "identity:result",
          },
          {
            payload: [
              { scope: "Target", hint: "38", ttlSeconds: 1800 },
              { scope: "AAM", hint: "3", ttlSeconds: 1800 },
              { scope: "EdgeNetwork", hint: "sgp3", ttlSeconds: 1800 },
            ],
            type: "locationHint:result",
          },
          {
            payload: [
              {
                key: MAIN_CLUSTER_COOKIE_NAME,
                value: "sgp3",
                maxAge: 1800,
              },
            ],
            type: "state:store",
          },
        ],
      });
    }

    throw new Error("Handler not configured properly");
  },
);

// A hint no shared mock response uses, so requests leaking in from other tests
// (which carry the common "or2" hint) can't satisfy this test's assertions.
const UNIQUE_EDGE_HINT = "va6";

const uniqueLocationHintHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === alloyConfig.datastreamId) {
      return HttpResponse.json({
        requestId: "unique-location-hint-test",
        handle: [
          {
            payload: [
              {
                scope: "EdgeNetwork",
                hint: UNIQUE_EDGE_HINT,
                ttlSeconds: 1800,
              },
            ],
            type: "locationHint:result",
          },
          {
            payload: [
              {
                key: MAIN_CLUSTER_COOKIE_NAME,
                value: UNIQUE_EDGE_HINT,
                maxAge: 1800,
              },
            ],
            type: "state:store",
          },
        ],
      });
    }

    throw new Error("Handler not configured properly");
  },
);

describe("Location Hints", () => {
  test("C6589015 - location hint from first response is included in second request URL", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(uniqueLocationHintHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
      debugEnabled: false,
    });
    await alloy("sendEvent", {});

    // Match this test's requests by URL rather than by position: requests
    // leaking in from earlier tests can also be recorded.
    const noHintCalls = await networkRecorder.findCalls(
      /edge\.adobedc\.net\/ee\/v1\/interact/,
    );
    expect(noHintCalls.length).toBeGreaterThan(0);

    const clusterCookie = await cookieStore.get(MAIN_CLUSTER_COOKIE_NAME);
    expect(clusterCookie?.value).toBe(UNIQUE_EDGE_HINT);

    await alloy("sendEvent", {});

    const hintCalls = await networkRecorder.findCalls(
      new RegExp(`edge\\.adobedc\\.net/ee/${UNIQUE_EDGE_HINT}/v1/interact`),
    );
    expect(hintCalls.length).toBe(1);
  });

  test("C6944931 - legacy mboxEdgeCluster cookie is translated to a location hint on the first request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    await cookieStore.set({ name: "mboxEdgeCluster", value: "38", path: "/" });

    worker.use(sgp3LocationHintHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
      debugEnabled: false,
    });
    await alloy("sendEvent", {});

    const clusterCookie = await cookieStore.get(MAIN_CLUSTER_COOKIE_NAME);
    expect(clusterCookie?.value).toBe("sgp3");

    await alloy("sendEvent", {});

    const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
      minCalls: 2,
    });
    expect(calls.length).toBe(2);

    expect(calls[0].request.url).toMatch(/edge\.adobedc\.net\/ee\/t38\//);
    expect(calls[1].request.url).toMatch(/edge\.adobedc\.net\/ee\/sgp3\//);
  });
});
