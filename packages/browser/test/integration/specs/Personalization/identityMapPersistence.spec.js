/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import alloyConfig from "../../helpers/alloy/config.js";
import {
  describe,
  test,
  expect,
  beforeEach,
} from "../../helpers/testsSetup/extend.js";
import { networkRecorder } from "../../helpers/mswjs/networkRecorder.js";
import { http, HttpResponse } from "msw";

const createPersonalizationHandler = () => {
  return http.post(
    /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
    async ({ request }) => {
      const body = await request.json();
      const eventType = body.events?.[0]?.xdm?.eventType;

      // If this is a display notification, return empty response
      if (eventType === "decisioning.propositionDisplay") {
        return HttpResponse.json({
          requestId: `display-notification-ack-${Date.now()}`,
          handle: [],
        });
      }

      // This is a sendEvent requesting personalization
      const surfaces = body.events?.[0]?.query?.personalization?.surfaces || [];

      // Use the first surface, or default to __view__
      const scope = surfaces[0] || "__view__";

      const requestId = `test-request-id-${Date.now()}`;
      return HttpResponse.json({
        requestId,
        handle: [
          {
            type: "personalization:decisions",
            payload: [
              {
                id: `${requestId}-proposition-id`,
                scope,
                scopeDetails: {
                  decisionProvider: "TGT",
                  activity: { id: "123" },
                },
                items: [
                  {
                    id: `${requestId}-item-id`,
                    schema: "https://ns.adobe.com/personalization/dom-action",
                    data: {
                      type: "setHtml",
                      selector: "#test-element",
                      content: `<div>Test Content ${requestId}</div>`,
                    },
                  },
                ],
              },
            ],
            eventIndex: 0,
          },
        ],
      });
    },
  );
};

describe("identityMap in automatic display notifications", () => {
  let testElement;

  beforeEach(() => {
    networkRecorder.reset();

    testElement = document.createElement("div");
    testElement.id = "test-element";
    testElement.innerHTML = "Original content";
    document.body.appendChild(testElement);

    return () => {
      if (testElement && testElement.parentNode) {
        document.body.removeChild(testElement);
      }
    };
  });

  test("display notifications include identityMap from the originating sendEvent", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    worker.use(createPersonalizationHandler());

    await alloy("configure", alloyConfig);

    const customIdentityMap = {
      CRM_ID: [
        {
          id: "test-user-123",
          primary: true,
          authenticatedState: "authenticated",
        },
      ],
    };

    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        identityMap: customIdentityMap,
        eventType: "web.webpagedetails.pageViews",
      },
    });

    const interactCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 2,
    });

    expect(interactCalls.length).toBeGreaterThanOrEqual(2);

    const sendEventCall = interactCalls.find(
      (call) =>
        call.request.body.events[0].xdm.eventType ===
        "web.webpagedetails.pageViews",
    );
    expect(sendEventCall).toBeDefined();
    expect(sendEventCall.request.body.events[0].xdm.identityMap).toBeDefined();
    expect(
      sendEventCall.request.body.events[0].xdm.identityMap.CRM_ID[0].id,
    ).toBe("test-user-123");

    const displayCall = interactCalls.find(
      (call) =>
        call.request.body.events[0].xdm.eventType ===
        "decisioning.propositionDisplay",
    );

    expect(displayCall).toBeDefined();
    const identityMap = displayCall.request.body.events[0].xdm.identityMap;
    expect(identityMap).toBeDefined();
    expect(identityMap.CRM_ID).toBeDefined();
    expect(identityMap.CRM_ID[0].id).toBe("test-user-123");
    expect(identityMap.CRM_ID[0].primary).toBe(true);
  });

  test("each sendEvent's display notification uses its own identityMap", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    worker.use(createPersonalizationHandler());

    await alloy("configure", alloyConfig);

    // Use different surfaces to get unique page-wide propositions
    await alloy("sendEvent", {
      renderDecisions: true,
      personalization: {
        surfaces: ["web://test.com/page1"],
      },
      xdm: {
        identityMap: {
          CRM_ID: [{ id: "user-first", primary: true }],
        },
        eventType: "web.webpagedetails.pageViews",
      },
    });

    await alloy("sendEvent", {
      renderDecisions: true,
      personalization: {
        surfaces: ["web://test.com/page2"],
      },
      xdm: {
        identityMap: {
          CRM_ID: [{ id: "user-second", primary: true }],
          EMAIL: [{ id: "test@example.com" }],
        },
        eventType: "commerce.productViews",
      },
    });

    const allCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 50,
      delayMs: 100,
      minCalls: 4,
    });

    const displayCalls = allCalls.filter(
      (call) =>
        call.request.body.events[0].xdm.eventType ===
        "decisioning.propositionDisplay",
    );

    expect(displayCalls.length).toBeGreaterThanOrEqual(2);

    const firstDisplayCall = displayCalls.find(
      (call) =>
        call.request.body.events[0].xdm.identityMap?.CRM_ID?.[0]?.id ===
        "user-first",
    );

    const secondDisplayCall = displayCalls.find(
      (call) =>
        call.request.body.events[0].xdm.identityMap?.CRM_ID?.[0]?.id ===
        "user-second",
    );

    expect(
      firstDisplayCall.request.body.events[0].xdm.identityMap.CRM_ID[0].id,
    ).toBe("user-first");

    expect(
      secondDisplayCall.request.body.events[0].xdm.identityMap.CRM_ID[0].id,
    ).toBe("user-second");
  });

  test("sendEvent without identityMap results in display notification without identityMap", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    worker.use(createPersonalizationHandler());

    await alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        eventType: "commerce.productViews",
      },
    });

    const allCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 40,
      delayMs: 100,
      minCalls: 2,
    });

    const displayCall = allCalls.find(
      (call) =>
        call.request.body.events[0].xdm.eventType ===
        "decisioning.propositionDisplay",
    );

    expect(displayCall).toBeDefined();
    expect(displayCall.request.body.events[0].xdm.identityMap).toBeUndefined();
  });
});
