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
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import {
  inAppMessageHandler,
  inAppMessageUntilClickThroughHandler,
} from "../../helpers/mswjs/handlers.js";

const IN_APP_MESSAGE_SCHEMA =
  "https://ns.adobe.com/personalization/message/in-app";

const removeInAppMessage = () => {
  ["alloy-messaging-container", "alloy-overlay-container"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  });
};

describe("AJO In-App Messages", () => {
  afterEach(() => {
    removeInAppMessage();
    localStorage.clear();
  });

  test("are rendered correctly and with the correct styles applied", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    worker.use(inAppMessageHandler);

    alloy("configure", alloyConfig);

    await alloy("sendEvent", {
      renderDecisions: true,
      personalization: {
        surfaces: ["web://testing.alloy.adobe.com"],
      },
    });

    const messageContainerLocator = document.getElementById(
      "alloy-messaging-container",
    );
    await expect.element(messageContainerLocator).toBeInTheDocument();

    expect(messageContainerLocator.style.width).toBe("55%");

    const calls = await networkRecorder.findCalls(/v1\/interact/, {
      retries: 30,
      delayMs: 100,
      minCalls: 2,
    });
    expect(
      calls.some(
        (call) =>
          call.request.body?.events?.[0]?.xdm?.eventType ===
          "decisioning.propositionDisplay",
      ),
    ).toBe(true);

    document.body.removeChild(messageContainerLocator);
    document.body.removeChild(
      document.getElementById("alloy-overlay-container"),
    );
  });

  // A message configured with the frequency "Show until click through" is
  // delivered with a historical condition on
  // { "iam.eventType": "interact", "iam.action": "clicked", "iam.id": ... }.
  // Once the CTA is clicked, the message must not qualify again.
  test("are not shown again after the CTA is clicked when configured to show until click through", async ({
    worker,
    alloy,
    networkRecorder,
  }) => {
    localStorage.clear();
    worker.use(inAppMessageUntilClickThroughHandler);

    alloy("configure", {
      ...alloyConfig,
      personalizationStorageEnabled: true,
    });

    const sendPageView = () =>
      alloy("sendEvent", {
        renderDecisions: true,
        personalization: {
          surfaces: ["web://testing.alloy.adobe.com"],
        },
      });

    // First page view: the message qualifies and is shown.
    await sendPageView();

    const iframe = document.querySelector("#alloy-messaging-container iframe");
    await expect.element(iframe).toBeInTheDocument();

    // The click handler is attached when the message document loads (the
    // iframe starts out with an already "complete" about:blank document).
    const ctaSelector = 'a[href^="adbinapp://dismiss?interaction=clicked"]';
    await expect
      .poll(() => {
        const iframeDocument = iframe.contentDocument;
        return (
          iframeDocument?.readyState === "complete" &&
          iframeDocument.querySelector(ctaSelector) !== null
        );
      })
      .toBe(true);
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    iframe.contentDocument.querySelector(ctaSelector).click();

    // The click is reported as an interaction with the "clicked" action...
    await expect
      .poll(async () => {
        const calls = await networkRecorder.findCalls(
          /v1\/(interact|collect)/,
          { retries: 1 },
        );
        const interactCall = calls.find(
          (call) =>
            call.request.body?.events?.[0]?.xdm?.eventType ===
            "decisioning.propositionInteract",
        );
        return interactCall?.request.body.events[0].xdm._experience.decisioning;
      })
      .toMatchObject({
        propositionEventType: { interact: 1, dismiss: 1 },
        propositionAction: { id: "clicked" },
      });

    // ...and the message is dismissed.
    await expect
      .poll(() => document.getElementById("alloy-messaging-container"))
      .toBeNull();

    // Second page view: the click was recorded in event history, so the
    // "until click through" condition no longer qualifies the message.
    const { propositions } = await sendPageView();

    const inAppMessageItems = propositions
      .flatMap(({ items }) => items)
      .filter(({ schema }) => schema === IN_APP_MESSAGE_SCHEMA);
    expect(inAppMessageItems).toEqual([]);
    expect(document.getElementById("alloy-messaging-container")).toBeNull();
  });
});
