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
import { http, HttpResponse } from "msw";

describe("identityMap in automatic display notifications", () => {
  let testElement;

  beforeEach(() => {
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
    const personalizationResponseHandler = http.post(
      /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
      async () => {
        return HttpResponse.json({
          requestId: "test-request-id",
          handle: [
            {
              type: "personalization:decisions",
              payload: [
                {
                  id: "test-proposition-id",
                  scope: "__view__",
                  scopeDetails: {
                    decisionProvider: "TGT",
                    activity: { id: "123" },
                  },
                  items: [
                    {
                      id: "test-item-id",
                      schema: "https://ns.adobe.com/personalization/dom-action",
                      data: {
                        type: "setHtml",
                        selector: "#test-element",
                        content: "<div>Test Content</div>",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        });
      },
    );

    worker.use(personalizationResponseHandler);

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
      retries: 15,
      delayMs: 100,
    });

    expect(interactCalls.length).toBeGreaterThanOrEqual(1);

    const sendEventCall = interactCalls[0];
    expect(sendEventCall.request.body.events[0].xdm.identityMap).toBeDefined();
    expect(
      sendEventCall.request.body.events[0].xdm.identityMap.CRM_ID,
    ).toBeDefined();
    expect(
      sendEventCall.request.body.events[0].xdm.identityMap.CRM_ID[0].id,
    ).toBe("test-user-123");

    const displayCalls = interactCalls.filter(
      (call) =>
        call.request.body.events[0].xdm.eventType ===
        "decisioning.propositionDisplay",
    );

    if (displayCalls.length > 0) {
      const displayNotificationCall = displayCalls[0];
      const identityMap =
        displayNotificationCall.request.body.events[0].xdm.identityMap;
      expect(identityMap).toBeDefined();
      expect(identityMap.CRM_ID).toBeDefined();
      expect(identityMap.CRM_ID[0].id).toBe("test-user-123");
      expect(identityMap.CRM_ID[0].primary).toBe(true);
    }
  });

  test("each sendEvent's display notification uses its own identityMap", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    const personalizationResponseHandler = http.post(
      /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
      async () => {
        return HttpResponse.json({
          requestId: "test-request-id",
          handle: [
            {
              type: "personalization:decisions",
              payload: [
                {
                  id: "test-proposition-id",
                  scope: "__view__",
                  scopeDetails: {
                    decisionProvider: "TGT",
                    activity: { id: "123" },
                  },
                  items: [
                    {
                      id: "test-item-id",
                      schema: "https://ns.adobe.com/personalization/dom-action",
                      data: {
                        type: "setHtml",
                        selector: "#test-element",
                        content: "<div>Test Content</div>",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        });
      },
    );

    worker.use(personalizationResponseHandler);

    await alloy("configure", alloyConfig);

    const firstIdentityMap = {
      CRM_ID: [
        {
          id: "user-first",
          primary: true,
        },
      ],
    };

    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        identityMap: firstIdentityMap,
        eventType: "web.webpagedetails.pageViews",
      },
    });

    const firstBatchCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 50,
    });

    const firstDisplayCall = firstBatchCalls.find(
      (call) =>
        call.request.body.events[0].xdm.eventType ===
        "decisioning.propositionDisplay",
    );

    if (firstDisplayCall) {
      expect(
        firstDisplayCall.request.body.events[0].xdm.identityMap.CRM_ID[0].id,
      ).toBe("user-first");
    }

    networkRecorder.reset();

    const secondIdentityMap = {
      CRM_ID: [
        {
          id: "user-second",
          primary: true,
        },
      ],
      EMAIL: [
        {
          id: "test@example.com",
        },
      ],
    };

    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        identityMap: secondIdentityMap,
        eventType: "commerce.productViews",
      },
    });

    const secondBatchCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 50,
    });

    const secondDisplayCall = secondBatchCalls.find(
      (call) =>
        call.request.body.events[0].xdm.eventType ===
        "decisioning.propositionDisplay",
    );

    if (secondDisplayCall) {
      expect(
        secondDisplayCall.request.body.events[0].xdm.identityMap.CRM_ID[0].id,
      ).toBe("user-second");
      expect(
        secondDisplayCall.request.body.events[0].xdm.identityMap.EMAIL,
      ).toBeDefined();
      expect(
        secondDisplayCall.request.body.events[0].xdm.identityMap.EMAIL[0].id,
      ).toBe("test@example.com");
    }
  });

  test("sendEvent without identityMap results in display notification without identityMap", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    const personalizationResponseHandler = http.post(
      /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,
      async () => {
        return HttpResponse.json({
          requestId: "test-request-id",
          handle: [
            {
              type: "personalization:decisions",
              payload: [
                {
                  id: "test-proposition-id",
                  scope: "__view__",
                  scopeDetails: {
                    decisionProvider: "TGT",
                    activity: { id: "123" },
                  },
                  items: [
                    {
                      id: "test-item-id",
                      schema: "https://ns.adobe.com/personalization/dom-action",
                      data: {
                        type: "setHtml",
                        selector: "#test-element",
                        content: "<div>Test Content</div>",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        });
      },
    );

    worker.use(personalizationResponseHandler);

    await alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      renderDecisions: true,
      xdm: {
        eventType: "commerce.productViews",
      },
    });

    const interactCalls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 10,
      delayMs: 50,
    });

    const displayCalls = interactCalls.filter(
      (call) =>
        call.request.body.events[0].xdm.eventType ===
        "decisioning.propositionDisplay",
    );

    if (displayCalls.length > 0) {
      const displayNotificationCall = displayCalls[0];
      expect(
        displayNotificationCall.request.body.events[0].xdm.identityMap,
      ).toBeUndefined();
    }
  });
});
