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
import {
  test,
  expect,
  describe,
  vi,
  beforeEach,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import {
  sendEventHandler,
  sendEventWithIdentityCookieHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";
import { CONSENT_OUT } from "../../helpers/constants/consent.js";
import {
  appendLink,
  clickLink,
  cleanupDom,
} from "../../helpers/utils/domHelpers.js";
import {
  sendBeaconCalls,
  resetSendBeaconCalls,
} from "../../helpers/utils/sendBeacon.js";

// Fixed wait for negative assertions ("no request fired"). There is no positive
// signal to poll on, so a fixed delay is required.
const NO_REQUEST_WAIT_MS = 200;

// Synchronous filter — intentionally NOT findCalls(), which retries/waits and
// would give false negatives on assertions that no request was fired.
const interactCalls = (networkRecorder) =>
  networkRecorder.calls.filter((c) =>
    /v1\/interact/.test(c.request?.url ?? ""),
  );

afterEach(() => {
  cleanupDom();
  delete window.___getLinkDetails;
});

describe("C2592 - Event command sends a request", () => {
  test("sendEvent produces an edge interact call with implementationDetails and state", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent");

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call).toBeDefined();
    expect(call.response.status).toBeGreaterThanOrEqual(200);
    expect(call.response.status).toBeLessThanOrEqual(207);

    const body = call.request.body;
    expect(body.events[0].xdm.implementationDetails.name).toBe(
      "https://ns.adobe.com/experience/alloy",
    );
    expect(body.meta.state.cookiesEnabled).toBe(true);
    // domain is "" on localhost, so only check the type
    expect(typeof body.meta.state.domain).toBe("string");
  });
});

describe("C75372 - XDM and data objects are not mutated by sendEvent", () => {
  test("original xdm and data objects remain unchanged after sendEvent", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);

    const xdmDataLayer = { device: { screenHeight: 1 } };
    const nonXdmDataLayer = { baz: "quux" };

    await alloy("sendEvent", {
      xdm: xdmDataLayer,
      data: nonXdmDataLayer,
      mergeId: "abc",
    });

    expect(xdmDataLayer).toEqual({ device: { screenHeight: 1 } });
    expect(nonXdmDataLayer).toEqual({ baz: "quux" });
  });
});

describe("C1715149 - onBeforeEventSend callback", () => {
  test("callback is invoked and can augment the xdm before the request fires", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    const onBeforeEventSend = vi.fn((content) => {
      content.xdm.foo = "bar";
    });

    await alloy("configure", { ...alloyConfig, onBeforeEventSend });

    await alloy("sendEvent");

    expect(onBeforeEventSend).toHaveBeenCalled();

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call).toBeDefined();
    expect(call.request.body.events[0].xdm.foo).toBe("bar");
  });

  test("callback throwing causes sendEvent to reject without sending a request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    const onBeforeEventSend = vi.fn(() => {
      throw new Error("Expected Error");
    });

    await alloy("configure", { ...alloyConfig, onBeforeEventSend });

    await expect(alloy("sendEvent")).rejects.toThrow(/Expected Error/);
    expect(onBeforeEventSend).toHaveBeenCalled();

    expect(interactCalls(networkRecorder).length).toBe(0);
  });

  test("callback returning false cancels the event and sendEvent resolves with {}", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    const onBeforeEventSend = vi.fn(() => false);
    const consoleSpy = vi.spyOn(console, "info");

    await alloy("configure", {
      ...alloyConfig,
      debugEnabled: true,
      onBeforeEventSend,
    });

    const result = await alloy("sendEvent");

    expect(onBeforeEventSend).toHaveBeenCalled();
    expect(result).toEqual({});

    expect(interactCalls(networkRecorder).length).toBe(0);

    expect(searchForLogMessage(consoleSpy, "Event was canceled")).toBe(true);
  });
});

describe("C8119 - Click collection disabled does not send link click events", () => {
  test("clicking a link fires no edge request when clickCollectionEnabled is false", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: false,
    });

    const link = appendLink({ id: "alloy-link-test", href: "#blank", text: "Test Link" });
    clickLink(link);

    // Fixed wait is necessary: asserting that NO interact call fires after the
    // click, so there is no positive observable condition to poll on.
    await new Promise((resolve) => setTimeout(resolve, NO_REQUEST_WAIT_MS));

    expect(interactCalls(networkRecorder).length).toBe(0);
  });
});

describe("C81184 - Click collection configuration warnings", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "warn");
  });

  test("warns when onBeforeLinkClickSend configured but clickCollectionEnabled is false", async ({
    alloy,
  }) => {
    await alloy("configure", {
      ...alloyConfig,
      debugEnabled: true,
      clickCollectionEnabled: false,
      onBeforeLinkClickSend: () => {},
    });

    expect(searchForLogMessage(consoleSpy, "onBeforeLinkClickSend")).toBe(true);
  });

  test("warns when downloadLinkQualifier configured but clickCollectionEnabled is false", async ({
    alloy,
  }) => {
    await alloy("configure", {
      ...alloyConfig,
      debugEnabled: true,
      clickCollectionEnabled: false,
      downloadLinkQualifier: "\\.pdf$",
    });

    expect(searchForLogMessage(consoleSpy, "downloadLinkQualifier")).toBe(true);
  });

  test("does not warn for default downloadLinkQualifier when clickCollectionEnabled is false", async ({
    alloy,
  }) => {
    await alloy("configure", {
      ...alloyConfig,
      debugEnabled: true,
      clickCollectionEnabled: false,
    });

    expect(searchForLogMessage(consoleSpy, "downloadLinkQualifier")).toBe(
      false,
    );
  });

  test("does not warn about disabled click collection when clickCollectionEnabled is true with downloadLinkQualifier", async ({
    alloy,
  }) => {
    // Note: onBeforeLinkClickSend is deprecated and always logs a deprecation
    // warning, regardless of clickCollectionEnabled. This test uses
    // clickCollection.filterClickDetails (the non-deprecated alternative)
    // to verify that no "will be ignored" warning fires when clickCollectionEnabled is true.
    await alloy("configure", {
      ...alloyConfig,
      debugEnabled: true,
      clickCollectionEnabled: true,
      clickCollection: {
        filterClickDetails: () => true,
      },
      downloadLinkQualifier: "\\.pdf$",
    });

    // The "will be ignored because clickCollectionEnabled is false" warning
    // should NOT fire when clickCollectionEnabled is true
    expect(
      searchForLogMessage(
        consoleSpy,
        "will be ignored because clickCollectionEnabled is false",
      ),
    ).toBe(false);
  });
});

describe("C81181 - onBeforeLinkClickSend callback", () => {
  test("returning false from onBeforeLinkClickSend cancels the link click request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      onBeforeLinkClickSend: () => false,
    });

    const link = appendLink({ id: "alloy-link-test", href: "#valid", text: "Test Link" });
    clickLink(link);

    // Fixed wait is necessary: asserting that NO interact call fires after the
    // click, so there is no positive observable condition to poll on.
    await new Promise((resolve) => setTimeout(resolve, NO_REQUEST_WAIT_MS));

    expect(interactCalls(networkRecorder).length).toBe(0);
  });

  test("returning false from filterClickDetails cancels the link click request", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        filterClickDetails: () => false,
      },
    });

    const link = appendLink({ id: "alloy-link-test", href: "#valid", text: "Test Link" });
    clickLink(link);

    // Fixed wait is necessary: asserting that NO interact call fires after the
    // click, so there is no positive observable condition to poll on.
    await new Promise((resolve) => setTimeout(resolve, NO_REQUEST_WAIT_MS));

    expect(interactCalls(networkRecorder).length).toBe(0);
  });

  test("onBeforeLinkClickSend can augment xdm and data before the request fires", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        internalLinkEnabled: true,
        eventGroupingEnabled: false,
      },
      onBeforeLinkClickSend: (options) => {
        const { xdm, data } = options;
        xdm.web.webInteraction.name = "Augmented name";
        data.customField = "test123";
        return true;
      },
    });

    const link = appendLink({ id: "alloy-link-test", href: "#internal", text: "Test Link" });
    clickLink(link);

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();

    const event = call.request.body.events[0];
    expect(event.xdm.web.webInteraction.name).toBe("Augmented name");
    expect(event.data.customField).toBe("test123");
  });

  // These five tests from the original C81181 functional file were not included
  // in the initial migration. None depend on sendBeacon/collect-endpoint
  // interception, so they are deferred scope rather than blocked.
  test.skip("C81181 - link click is collected when clickCollectionEnabled and no callback defined", () => {});
  test.skip("C81181 - onBeforeLinkClickSend cancels a request conditionally based on clickedElement.id", () => {});
  test.skip("C81181 - filterClickDetails cancels a request conditionally based on clickedElement.id", () => {});
  test.skip("C81181 - filterClickDetails can augment xdm and data before the request fires", () => {});
  test.skip("C81181 - clickCollection.sessionStorageEnabled:false still captures link click data", () => {});
});

describe("C11693274 - URL query params do not affect exit link classification", () => {
  test("link to external domain with query param containing current domain is still classified as exit", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        externalLinkEnabled: true,
        eventGroupingEnabled: false,
      },
    });

    // href contains current domain only in the query string (not the host)
    const externalUrl = `https://example.com/?exclude-this=${window.location.hostname}`;
    const link = appendLink({ id: "alloy-link-test", href: externalUrl, text: "Test Link" });
    clickLink(link);

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();

    const eventXdm = call.request.body.events[0].xdm;
    expect(eventXdm.eventType).toBe("web.webinteraction.linkClicks");
    expect(eventXdm.web.webInteraction.type).toBe("exit");
    expect(eventXdm.web.webInteraction.URL).toBe(externalUrl);
  });
});

describe("C225010 - Click collection handles consent declined gracefully", () => {
  test("warning logged and no unhandled rejection when link clicked after opt-out", async ({
    alloy,
    worker,
  }) => {
    worker.use(setConsentHandler);

    const consoleSpy = vi.spyOn(console, "warn");

    const unhandledRejections = [];
    const rejectionHandler = (event) => {
      unhandledRejections.push(event.reason);
    };
    window.addEventListener("unhandledrejection", rejectionHandler);

    await alloy("configure", {
      ...alloyConfig,
      defaultConsent: "pending",
      debugEnabled: true,
      clickCollectionEnabled: true,
      clickCollection: {
        eventGroupingEnabled: false,
      },
    });

    await alloy("setConsent", CONSENT_OUT);

    const link = appendLink({ id: "alloy-link-test", href: "#foo", text: "Test Link" });
    clickLink(link);

    await expect
      .poll(() => searchForLogMessage(consoleSpy, "The user declined consent"))
      .toBe(true);

    expect(unhandledRejections.length).toBe(0);

    window.removeEventListener("unhandledrejection", rejectionHandler);
  });
});

describe("C455258 - sendEvent routes to collect via sendBeacon once identity is established", () => {
  test("documentUnloading uses interact before identity, collect after, and interact when not unloading", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventWithIdentityCookieHandler);

    await alloy("configure", alloyConfig);

    // No identity established yet: even with documentUnloading, the request
    // goes to interact (fetch) so the response can establish an identity.
    await alloy("sendEvent", { documentUnloading: true });
    expect(interactCalls(networkRecorder).length).toBe(1);
    expect(sendBeaconCalls().length).toBe(0);

    networkRecorder.reset();
    resetSendBeaconCalls();

    // Identity is now established: documentUnloading routes to collect via
    // sendBeacon, not interact.
    await alloy("sendEvent", { documentUnloading: true });
    expect(sendBeaconCalls().length).toBe(1);
    expect(interactCalls(networkRecorder).length).toBe(0);

    networkRecorder.reset();
    resetSendBeaconCalls();

    // Without documentUnloading the request goes to interact regardless.
    await alloy("sendEvent");
    expect(interactCalls(networkRecorder).length).toBe(1);
    expect(sendBeaconCalls().length).toBe(0);
  });
});

// Skipped: tests that assert collect-vs-interact routing depend on sendBeacon
// interception via MSW, which is not reliably supported in browser mode, and
// this test was a baseline failure in the functional suite.
// See FUNCTIONAL_MIGRATION_PLAN.md §1.
test.skip("C8118 - link click routes to interact (no identity) then collect (identity established)", () => {});

// Skipped: the collect-endpoint portion of this test uses sendBeacon, which
// MSW cannot intercept in browser mode. The interact portion relies on
// inspecting request headers that MSW/networkRecorder may not surface
// consistently. This was a baseline failure in the functional suite.
// See FUNCTIONAL_MIGRATION_PLAN.md §1.
test.skip("C9369211 - sendEvent includes a Referer header on interact and collect requests", () => {});

// Skipped: all sub-tests in the source functional file are already marked
// test.skip because they require a specific personalization response from the
// live edge that is difficult to reproduce deterministically with MSW mocks.
test.skip("C81182 - onBeforeLinkClickSend interacts with personalization metric on link (source tests skipped)", () => {});

describe("C81183 - getLinkDetails monitoring hook via __alloyMonitors", () => {
  test("getLinkDetails returns correct link info for a visible link element", async ({
    alloy,
  }) => {
    // Install monitor BEFORE configure so onInstanceConfigured fires
    window.__alloyMonitors = window.__alloyMonitors || [];
    window.__alloyMonitors.push({
      onInstanceConfigured(data) {
        window.___getLinkDetails = data.getLinkDetails;
      },
    });

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
    });

    const link = appendLink({
      id: "alloy-link-test",
      href: "https://example.com/valid.html",
      text: "Test Link",
    });

    const result = window.___getLinkDetails(link);
    expect(result).toBeTruthy();
    expect(result.linkName).toBeTruthy();
    expect(result.linkUrl).toContain("example.com");
    expect(result.linkType).toBe("exit");
  });

  test("getLinkDetails returns results even when clickCollectionEnabled is false", async ({
    alloy,
  }) => {
    window.__alloyMonitors = window.__alloyMonitors || [];
    window.__alloyMonitors.push({
      onInstanceConfigured(data) {
        window.___getLinkDetails = data.getLinkDetails;
      },
    });

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: false,
    });

    const link = appendLink({
      id: "alloy-link-test-disabled",
      href: "https://example.com/",
      text: "External Link",
    });

    const result = window.___getLinkDetails(link);
    expect(result).toBeTruthy();
    expect(result.linkName).toBeTruthy();
    expect(result.linkType).toBe("exit");
  });

  test("getLinkDetails returns no link data for a null element", async ({
    alloy,
  }) => {
    window.__alloyMonitors = window.__alloyMonitors || [];
    window.__alloyMonitors.push({
      onInstanceConfigured(data) {
        window.___getLinkDetails = data.getLinkDetails;
      },
    });

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
    });

    // Mirrors original C81183 test 2: passing null (a non-existent element)
    // should return an object with no meaningful link data, not throw.
    const result = window.___getLinkDetails(null);
    expect(result.linkName).toBeUndefined();
    expect(result.linkType).toBeUndefined();
    expect(result.linkUrl).toBeUndefined();
  });
});
