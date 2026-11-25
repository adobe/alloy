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

import { cdp } from "vitest/browser";
import { test, expect } from "../../helpers/testsSetup/extend.js";

const config = {
  orgId: "5BFE274A5F6980A50A495C08@AdobeOrg",
  datastreamId: "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
  edgeDomain: "edge.adobedc.net",
  edgeBasePath: "ee-pre-prd",
  debugEnabled: true,
};

const withEdgeHeaders = async (run) => {
  const session = cdp();
  const requests = new Map();
  const extraInfo = new Map();
  const responses = new Map();
  const onRequest = ({ requestId, request }) => {
    if (
      request.method === "POST" &&
      /^https:\/\/(?:adobedc\.demdex\.net|edge\.adobedc\.net)\/ee-pre-prd\/(?:[^/]+\/)?v1\/interact\?/.test(
        request.url,
      )
    ) {
      requests.set(requestId, request);
    }
  };
  const onExtraInfo = ({ requestId, headers }) => {
    extraInfo.set(requestId, headers);
  };
  const onResponse = ({ requestId, response }) => {
    responses.set(requestId, response.status);
  };
  // Initialize the shared CDP handler before subscribing: concurrent first-use
  // RPCs can otherwise create separate server-side listener registries.
  await session.send("Network.enable");
  session.on("Network.requestWillBeSent", onRequest);
  session.on("Network.requestWillBeSentExtraInfo", onExtraInfo);
  session.on("Network.responseReceived", onResponse);
  try {
    // MSW's bypass fetch runs in its worker target, so page CDP cannot see its
    // network extra-info. Bypass the worker while capturing these live calls.
    await session.send("Network.setBypassServiceWorker", { bypass: true });
    await run(async () => {
      const getCall = () => {
        const [requestId, request] = [...requests][0] || [];
        if (!request || !extraInfo.has(requestId) || !responses.has(requestId))
          return undefined;
        return {
          request,
          headers: extraInfo.get(requestId),
          status: responses.get(requestId),
        };
      };
      await expect.poll(getCall).toBeDefined();
      expect(requests.size).toBe(1);
      const call = getCall();
      expect([200, 207]).toContain(call.status);
      const headers = Object.fromEntries(
        Object.entries(call.headers).map(([name, value]) => [
          name.toLowerCase(),
          value,
        ]),
      );
      expect(headers["sec-ch-ua"]).toBeTruthy();
      expect(headers["sec-ch-ua-mobile"]).toBeTruthy();
      expect(headers["sec-ch-ua-platform"]).toBeTruthy();
      return JSON.parse(call.request.postData);
    });
  } finally {
    session.off("Network.requestWillBeSent", onRequest);
    session.off("Network.requestWillBeSentExtraInfo", onExtraInfo);
    session.off("Network.responseReceived", onResponse);
    await session.send("Network.setBypassServiceWorker", { bypass: false });
  }
};

// Live edge is required because Target, not Alloy, decides activity eligibility.
test("C3272624: profile attribute qualifies for an offer", async ({
  alloy,
  networkRecorder,
}) => {
  const heading = document.createElement("h1");
  document.body.appendChild(heading);
  try {
    await alloy("configure", config);
    // The activity targets the original functional page URL, not localhost.
    const xdm = {
      web: {
        webPageDetails: {
          URL: "https://alloyio.com/functional-test/testPage.html?test=C3272624",
        },
      },
    };
    await alloy("sendEvent", {
      renderDecisions: true,
      xdm,
      data: { __adobe: { target: { "profile.favoriteCategory": "shoes" } } },
    });
    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 40,
      minCalls: 2,
    });
    expect(calls).toHaveLength(2);
    expect([200, 207]).toContain(calls[0].response.status);
    expect([200, 207]).toContain(calls[1].response.status);
    expect(
      calls[0].request.body.events[0].query.personalization.decisionScopes,
    ).toEqual(["__view__"]);
    const decisions = calls[0].response.body.handle
      .filter((h) => h.type === "personalization:decisions")
      .flatMap((h) => h.payload);
    const hasProfileOffer = (propositions) =>
      propositions.some((d) =>
        d.items.some(
          (i) =>
            i.data?.content ===
            '<span id="action_insert_1622750393761927">C3272624: An activity based on profile data attribute: `favoriteCategory`</span>',
        ),
      );
    expect(decisions.find((d) => hasProfileOffer([d]))?.scope).toBe("__view__");
    const shirts = await alloy("sendEvent", {
      renderDecisions: true,
      personalization: { defaultPersonalizationEnabled: true },
      xdm,
      data: { __adobe: { target: { "profile.favoriteCategory": "shirts" } } },
    });
    const allCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 40,
      minCalls: 3,
    });
    const shirtsEvent = allCalls[2].request.body.events[0];
    expect(shirtsEvent.query?.personalization?.decisionScopes).toContain(
      "__view__",
    );
    expect(shirtsEvent.data.__adobe.target["profile.favoriteCategory"]).toBe(
      "shirts",
    );
    expect(hasProfileOffer(shirts.propositions)).toBe(false);
  } finally {
    heading.remove();
    document.getElementById("action_insert_1622750393761927")?.remove();
  }
}, 30000);

const qaConfig = {
  ...config,
  orgId: "6FC947105BB267B70A495EE9@AdobeOrg",
  datastreamId: "e05e7d28-e293-454a-82f8-4c808cd973a8",
};
const experiences = [
  [
    1,
    "A",
    "<p>Geckos are a group of usually small, usually nocturnal lizards. They are found on every continent except Australia.</p>\n \n<p>Some species live in houses where they hunt insects attracted by artificial light.</p>",
  ],
  [
    2,
    "B",
    "<p>Apollo astronauts:</p>\n\n<ul>\n    <li>Neil Armstrong</li>\n    <li>Alan Bean</li>\n    <li>Peter Conrad</li>\n    <li>Edgar Mitchell</li>\n    <li>Alan Shepard</li>\n</ul>",
  ],
];

// Live edge is required to resolve the Target QA token and experience index.
experiences.forEach(([index, name, content]) => {
  test(`C44363: QA mode selects experience ${name}`, async ({ alloy }) => {
    await alloy("configure", qaConfig);
    document.cookie = `at_qa_mode={%22token%22:%22g3PFzsGla-P0L3BEgkx-3ZQUkS6jIDyBvQrMH-va-2c%22%2C%22listedActivitiesOnly%22:true%2C%22previewIndexes%22:[{%22activityIndex%22:1%2C%22experienceIndex%22:${index}}]}; path=/`;
    const result = await alloy("sendEvent", {
      renderDecisions: true,
      decisionScopes: ["Happy-mbox"],
    });
    expect(
      result.propositions.find((p) => p.scope === "Happy-mbox")?.items[0]?.data
        ?.content,
    ).toBe(content);
  }, 30000);
});

// Formerly TestCafe C8631576 (packages/browser/test/functional/specs/Personalization/C8631576.js): send scope chromeBrowserClientHint and assert Chrome qualifies for a non-default Target offer. Not ported: live edge returned no scoped proposition for HeadlessChrome 156, even with the original page URL in XDM.

// Live edge is needed to exercise real HTTPS request headers, not a mocked request.
test("C8631576: low entropy client hints are sent to edge", async ({
  alloy,
}) => {
  await withEdgeHeaders(async (captureCall) => {
    await alloy("configure", config);
    await alloy("sendEvent", { decisionScopes: ["chromeBrowserClientHint"] });
    const body = await captureCall();
    expect(body.events[0].query.personalization.decisionScopes).toContain(
      "chromeBrowserClientHint",
    );
  });
}, 30000);

// Live edge is required to determine whether Target qualifies the browser hints.
test("C8631577: high entropy browser hints qualify for an experience", async ({
  alloy,
}) => {
  await withEdgeHeaders(async (captureCall) => {
    await alloy("configure", {
      ...config,
      context: ["highEntropyUserAgentHints"],
    });
    const result = await alloy("sendEvent", {
      decisionScopes: ["64BitClientHint"],
    });
    const body = await captureCall();
    const hints =
      body.events[0].xdm.environment.browserDetails.userAgentClientHints;
    const nativeHints = await navigator.userAgentData.getHighEntropyValues([
      "bitness",
      "architecture",
      "platformVersion",
    ]);
    expect(hints.bitness).toBe(nativeHints.bitness);
    expect(hints.bitness).toBeTruthy();
    expect(hints.architecture).toBe(nativeHints.architecture);
    expect(hints.architecture).toBeTruthy();
    expect(hints.platformVersion).toBe(nativeHints.platformVersion);
    expect(hints.platformVersion).toBeTruthy();
    const proposition = result.propositions.find(
      (p) => p.scope === "64BitClientHint",
    );
    const qualifies =
      proposition !== undefined &&
      proposition.items[0].schema !==
        "https://ns.adobe.com/personalization/default-content-item";
    expect(qualifies).toBe(hints.bitness.includes("64"));
  });
}, 30000);
