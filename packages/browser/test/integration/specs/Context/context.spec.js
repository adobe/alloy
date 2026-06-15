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
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import { withTemporaryReferrer } from "../../helpers/utils/referrer.js";

describe("Context", () => {
  // C2597 - Adds all context data to requests by default.
  test("C2597 - adds all context data to requests by default", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent");

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call).toBeDefined();

    const xdm = call.request.body.events[0].xdm;
    expect(xdm.device).toBeTruthy();
    expect(xdm.placeContext).toBeTruthy();
    expect(xdm.environment.type).toBeTruthy();
    expect(xdm.web.webPageDetails).toBeTruthy();
    // userAgentClientHints should NOT be present by default (only with highEntropyUserAgentHints context)
    expect(xdm.environment?.browserDetails?.userAgentClientHints).toBeFalsy();
  });

  // C2598 - Adds only web context data when only web is specified in configuration.
  test("C2598 - adds only web context data when only web context is configured", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    const referrer = "https://example.com/referring-page";

    await alloy("configure", { ...alloyConfig, context: ["web"] });
    await withTemporaryReferrer(referrer, () => alloy("sendEvent"));

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call).toBeDefined();

    const xdm = call.request.body.events[0].xdm;
    expect(xdm.web).toBeTruthy();
    expect(xdm.web.webPageDetails).toBeTruthy();
    expect(xdm.web.webPageDetails.URL).toBe(window.location.href);
    expect(xdm.web.webReferrer).toBeTruthy();
    expect(xdm.web.webReferrer.URL).toBe(referrer);
    expect(xdm.device).toBeFalsy();
    expect(xdm.placeContext).toBeFalsy();
    expect(xdm.environment).toBeFalsy();
    expect(xdm.environment?.browserDetails?.userAgentClientHints).toBeFalsy();
  });

  // C2599 - Adds only device context data when only device is specified in configuration.
  test("C2599 - adds only device context data when only device context is configured", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", { ...alloyConfig, context: ["device"] });
    await alloy("sendEvent", {
      xdm: {
        web: {
          webPageDetails: {
            URL: window.location.href,
          },
        },
      },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call).toBeDefined();

    const xdm = call.request.body.events[0].xdm;
    expect(xdm.device).toBeTruthy();
    expect(xdm.web.webPageDetails).toBeTruthy();
    expect(xdm.placeContext).toBeFalsy();
    expect(xdm.environment).toBeFalsy();
    expect(xdm.environment?.browserDetails?.userAgentClientHints).toBeFalsy();
  });

  // C2600 - Adds only environment context data when only environment is specified in configuration.
  test("C2600 - adds only environment context data when only environment context is configured", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", { ...alloyConfig, context: ["environment"] });
    await alloy("sendEvent", {
      xdm: {
        web: {
          webPageDetails: {
            URL: window.location.href,
          },
        },
      },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call).toBeDefined();

    const xdm = call.request.body.events[0].xdm;
    expect(xdm.environment).toBeTruthy();
    expect(xdm.web.webPageDetails).toBeTruthy();
    expect(xdm.device).toBeFalsy();
    expect(xdm.placeContext).toBeFalsy();
    expect(xdm.environment?.browserDetails?.userAgentClientHints).toBeFalsy();
  });

  // C2601 - Adds only placeContext context data when only placeContext is specified in configuration.
  test("C2601 - adds only placeContext data when only placeContext context is configured", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", { ...alloyConfig, context: ["placeContext"] });
    await alloy("sendEvent", {
      xdm: {
        web: {
          webPageDetails: {
            URL: window.location.href,
          },
        },
      },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call).toBeDefined();

    const xdm = call.request.body.events[0].xdm;
    expect(xdm.placeContext).toBeTruthy();
    expect(xdm.web.webPageDetails).toBeTruthy();
    expect(xdm.environment).toBeFalsy();
    expect(xdm.device).toBeFalsy();
    expect(xdm.environment?.browserDetails?.userAgentClientHints).toBeFalsy();
  });

  // C1911390 - Ensure user-provided fields for context data don't leak across requests.
  test("C1911390 - user-provided context fields do not leak to subsequent requests", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent", {
      xdm: {
        device: { customDeviceField: "foo" },
        environment: { customEnvironmentField: "foo" },
        implementationDetails: { customImplementationDetailsField: "foo" },
        placeContext: { customPlaceContextField: "foo" },
        web: { customWebField: "foo" },
      },
    });

    const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/);
    expect(calls.length).toBe(1);

    const xdm1 = calls[0].request.body.events[0].xdm;
    expect(xdm1.device.customDeviceField).toBe("foo");
    expect(xdm1.environment.customEnvironmentField).toBe("foo");
    expect(xdm1.implementationDetails.customImplementationDetailsField).toBe(
      "foo",
    );
    expect(xdm1.placeContext.customPlaceContextField).toBe("foo");
    expect(xdm1.web.customWebField).toBe("foo");

    networkRecorder.reset();

    await alloy("sendEvent", {});

    const calls2 = await networkRecorder.findCalls(/edge\.adobedc\.net/);
    expect(calls2.length).toBe(1);

    const xdm2 = calls2[0].request.body.events[0].xdm;
    expect(xdm2.device?.customDeviceField).toBeFalsy();
    expect(xdm2.environment?.customEnvironmentField).toBeFalsy();
    expect(
      xdm2.implementationDetails?.customImplementationDetailsField,
    ).toBeFalsy();
    expect(xdm2.placeContext?.customPlaceContextField).toBeFalsy();
    expect(xdm2.web?.customWebField).toBeFalsy();
  });

  // C7311732 - Adds only userAgentClientHints context data when only highEntropyUserAgentHints is specified.
  test("C7311732 - adds only userAgentClientHints when highEntropyUserAgentHints context is configured", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      context: ["highEntropyUserAgentHints"],
    });
    await alloy("sendEvent", {
      xdm: {
        web: {
          webPageDetails: {
            URL: window.location.href,
          },
        },
      },
    });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call).toBeDefined();

    const xdm = call.request.body.events[0].xdm;
    expect(xdm.placeContext).toBeFalsy();
    expect(xdm.web.webPageDetails).toBeTruthy();
    expect(xdm.device).toBeFalsy();

    // userAgentClientHints is only populated in browsers that support the
    // User-Agent Client Hints API. When supported, it should be present;
    // when not, environment.type should also be absent.
    if (typeof navigator.userAgentData !== "undefined") {
      expect(xdm.environment?.type).toBeFalsy();
      expect(
        xdm.environment?.browserDetails?.userAgentClientHints,
      ).toBeTruthy();
    }
  });
});
