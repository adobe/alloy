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
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import { MAIN_CLUSTER_COOKIE_NAME } from "../../helpers/constants/cookies.js";

// Handler that returns sgp3 (Singapore, region 3) as the EdgeNetwork location hint.
// This simulates the edge response when the client is routed via the Singapore cluster
// (mboxEdgeCluster=38 maps to sgp3 in Konductor).
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

describe("Location Hints", () => {
  // C6589015 - The Experience Edge location hint is used on the second request.
  test("C6589015 - location hint from first response is included in second request URL", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
      debugEnabled: false,
    });
    await alloy("sendEvent", {});

    // After the first request, the edge response (sendEventResponse.json) sets
    // EdgeNetwork hint "or2" and a cluster cookie "or2".
    const clusterCookie = await cookieStore.get(MAIN_CLUSTER_COOKIE_NAME);
    const locationHint = clusterCookie?.value;
    expect(locationHint).toBeTruthy();

    await alloy("sendEvent", {});

    const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
      minCalls: 2,
    });
    expect(calls.length).toBe(2);

    // The first request goes to the base URL without a hint segment
    expect(calls[0].request.url).toMatch(
      /^https:\/\/[^/]+\/[^/]+\/v1\/interact/,
    );
    // The second request should include the location hint in the URL path
    expect(calls[1].request.url).toMatch(
      new RegExp(`edge\\.adobedc\\.net/ee/${locationHint}/v1/interact`),
    );
  });

  // C6944931 - The legacy Adobe Target location hint is used.
  test("C6944931 - legacy mboxEdgeCluster cookie is translated to a location hint on the first request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    // Set mboxEdgeCluster=38 (Singapore, Konductor region ID 3 = sgp3)
    // Alloy reads this cookie and uses it as the initial location hint (/t38/)
    await cookieStore.set({ name: "mboxEdgeCluster", value: "38", path: "/" });

    worker.use(sgp3LocationHintHandler);

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
      debugEnabled: false,
    });
    await alloy("sendEvent", {});

    // The edge response's state:store sets the cluster cookie to sgp3; assert it
    // explicitly so a storage failure surfaces here rather than as a confusing
    // URL-path mismatch on the second request below.
    const clusterCookie = await cookieStore.get(MAIN_CLUSTER_COOKIE_NAME);
    expect(clusterCookie?.value).toBe("sgp3");

    await alloy("sendEvent", {});

    const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
      minCalls: 2,
    });
    expect(calls.length).toBe(2);

    // First request uses the legacy mboxEdgeCluster=38 hint (/t38/ in URL path)
    expect(calls[0].request.url).toMatch(/edge\.adobedc\.net\/ee\/t38\//);
    // Second request uses the sgp3 hint returned in the edge response
    expect(calls[1].request.url).toMatch(/edge\.adobedc\.net\/ee\/sgp3\//);
  });
});
