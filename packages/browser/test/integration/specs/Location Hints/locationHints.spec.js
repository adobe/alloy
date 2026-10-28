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

// Identifies this test's own edge requests: each sendEvent carries a marker
// in its event data. Requests from other tests (e.g. still in flight from an
// earlier test in the same page) never carry it.
const MARKER_KEY = "locationHintsSpecStep";

const sendMarkedEvent = (alloy, step) =>
  alloy("sendEvent", { data: { [MARKER_KEY]: step } });

const stepOf = (body) => body?.events?.[0]?.data?.[MARKER_KEY];

const findStepCalls = async (networkRecorder, step) => {
  const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/);
  return calls.filter((call) => stepOf(call.request.body) === step);
};

// Answers this test's marked requests with the given location hints. Any other
// request gets an empty response so it can't set this test's cluster cookie.
const createLocationHintHandler = ({ edgeHint, otherHints = [] }) =>
  http.post(
    /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/interact/,
    async (req) => {
      const url = new URL(req.request.url);
      const body = await req.request
        .clone()
        .json()
        .catch(() => undefined);

      if (
        url.searchParams.get("configId") !== alloyConfig.datastreamId ||
        stepOf(body) === undefined
      ) {
        return HttpResponse.json({ handle: [] });
      }

      return HttpResponse.json({
        requestId: `location-hint-test-${edgeHint}`,
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
              ...otherHints,
              { scope: "EdgeNetwork", hint: edgeHint, ttlSeconds: 1800 },
            ],
            type: "locationHint:result",
          },
          {
            payload: [
              { key: MAIN_CLUSTER_COOKIE_NAME, value: edgeHint, maxAge: 1800 },
            ],
            type: "state:store",
          },
        ],
      });
    },
  );

// A hint no shared mock response uses (they all use "or2"), so the cookie and
// URL checks below can't pass because of another test's response.
const UNIQUE_EDGE_HINT = "va6";

describe("Location Hints", () => {
  test("C6589015 - location hint from first response is included in second request URL", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(createLocationHintHandler({ edgeHint: UNIQUE_EDGE_HINT }));

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
      debugEnabled: false,
    });
    await sendMarkedEvent(alloy, "first");

    const firstCalls = await findStepCalls(networkRecorder, "first");
    expect(firstCalls.length).toBe(1);
    expect(firstCalls[0].request.url).toMatch(
      /^https:\/\/edge\.adobedc\.net\/ee\/v1\/interact/,
    );

    const clusterCookie = await cookieStore.get(MAIN_CLUSTER_COOKIE_NAME);
    expect(clusterCookie?.value).toBe(UNIQUE_EDGE_HINT);

    await sendMarkedEvent(alloy, "second");

    const secondCalls = await findStepCalls(networkRecorder, "second");
    expect(secondCalls.length).toBe(1);
    expect(secondCalls[0].request.url).toMatch(
      new RegExp(`edge\\.adobedc\\.net/ee/${UNIQUE_EDGE_HINT}/v1/interact`),
    );
  });

  test("C6944931 - legacy mboxEdgeCluster cookie is translated to a location hint on the first request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    await cookieStore.set({ name: "mboxEdgeCluster", value: "38", path: "/" });

    // Simulates the edge response when routed via the Singapore cluster:
    // mboxEdgeCluster=38 maps to sgp3 in Konductor.
    worker.use(
      createLocationHintHandler({
        edgeHint: "sgp3",
        otherHints: [
          { scope: "Target", hint: "38", ttlSeconds: 1800 },
          { scope: "AAM", hint: "3", ttlSeconds: 1800 },
        ],
      }),
    );

    await alloy("configure", {
      ...alloyConfig,
      thirdPartyCookiesEnabled: false,
      debugEnabled: false,
    });
    await sendMarkedEvent(alloy, "first");

    const clusterCookie = await cookieStore.get(MAIN_CLUSTER_COOKIE_NAME);
    expect(clusterCookie?.value).toBe("sgp3");

    await sendMarkedEvent(alloy, "second");

    const firstCalls = await findStepCalls(networkRecorder, "first");
    const secondCalls = await findStepCalls(networkRecorder, "second");
    expect(firstCalls.length).toBe(1);
    expect(secondCalls.length).toBe(1);
    expect(firstCalls[0].request.url).toMatch(/edge\.adobedc\.net\/ee\/t38\//);
    expect(secondCalls[0].request.url).toMatch(
      /edge\.adobedc\.net\/ee\/sgp3\//,
    );
  });
});
