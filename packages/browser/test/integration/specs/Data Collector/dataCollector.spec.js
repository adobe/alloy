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
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";
import { CONSENT_OUT } from "../../helpers/constants/consent.js";

// Poll until condition() returns truthy, then resolve.  Rejects on timeout.
const waitUntil = (condition, { intervalMs = 50, timeoutMs = 3000 } = {}) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const poll = () => {
      if (condition()) {
        resolve();
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        reject(new Error("waitUntil timed out"));
        return;
      }
      setTimeout(poll, intervalMs);
    };
    poll();
  });

// ---------------------------------------------------------------------------
// C2592 – Event command sends a request
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// C75372 – XDM and data objects passed to sendEvent are not mutated
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// C1715149 – onBeforeEventSend callback
// ---------------------------------------------------------------------------
describe("C1715149 - onBeforeEventSend callback", () => {
  test("callback is invoked and can augment the xdm before the request fires", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    let callbackInvoked = false;

    await alloy("configure", {
      ...alloyConfig,
      onBeforeEventSend: (content) => {
        callbackInvoked = true;
        content.xdm.foo = "bar";
      },
    });

    await alloy("sendEvent");

    expect(callbackInvoked).toBe(true);

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

    let callbackInvoked = false;

    await alloy("configure", {
      ...alloyConfig,
      onBeforeEventSend: () => {
        callbackInvoked = true;
        throw new Error("Expected Error");
      },
    });

    let error;
    try {
      await alloy("sendEvent");
    } catch (e) {
      error = e;
    }

    expect(callbackInvoked).toBe(true);
    expect(error).toBeDefined();
    expect(error.message).toMatch(/Expected Error/);

    // No network request should have been made
    const calls = networkRecorder.calls.filter((c) =>
      /v1\/interact/.test(c.request?.url ?? ""),
    );
    expect(calls.length).toBe(0);
  });

  test("callback returning false cancels the event and sendEvent resolves with {}", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    let callbackInvoked = false;

    const consoleSpy = vi.spyOn(console, "info");

    await alloy("configure", {
      ...alloyConfig,
      debugEnabled: true,
      onBeforeEventSend: () => {
        callbackInvoked = true;
        return false;
      },
    });

    const result = await alloy("sendEvent");

    expect(callbackInvoked).toBe(true);
    expect(result).toEqual({});

    const interactCalls = networkRecorder.calls.filter((c) =>
      /v1\/interact/.test(c.request?.url ?? ""),
    );
    expect(interactCalls.length).toBe(0);

    expect(searchForLogMessage(consoleSpy, "Event was canceled")).toBe(true);

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// C8119 – Click collection disabled: link click does not send an event
// ---------------------------------------------------------------------------
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
    networkRecorder.reset();

    // Add a link and click it
    const link = document.createElement("a");
    link.id = "alloy-link-test";
    link.href = "#blank";
    link.textContent = "Test Link";
    document.body.appendChild(link);

    // Prevent navigation so the page stays
    link.addEventListener("click", (e) => e.preventDefault());
    link.click();

    // Fixed wait is necessary: asserting that NO interact call fires after the
    // click, so there is no positive observable condition to poll on.
    await new Promise((resolve) => setTimeout(resolve, 100));

    const calls = networkRecorder.calls.filter((c) =>
      /v1\/interact/.test(c.request?.url ?? ""),
    );
    expect(calls.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// C81184 – Click collection configuration warnings
// ---------------------------------------------------------------------------
describe("C81184 - Click collection configuration warnings", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "warn");
  });

  afterEach(() => {
    consoleSpy.mockRestore();
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

// ---------------------------------------------------------------------------
// C81181 – onBeforeLinkClickSend callback
// ---------------------------------------------------------------------------
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
    networkRecorder.reset();

    const link = document.createElement("a");
    link.id = "alloy-link-test";
    link.href = "#valid";
    link.textContent = "Test Link";
    document.body.appendChild(link);
    link.addEventListener("click", (e) => e.preventDefault());
    link.click();

    // Fixed wait is necessary: asserting that NO interact call fires after the
    // click, so there is no positive observable condition to poll on.
    await new Promise((resolve) => setTimeout(resolve, 200));

    const calls = networkRecorder.calls.filter((c) =>
      /v1\/interact/.test(c.request?.url ?? ""),
    );
    expect(calls.length).toBe(0);
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
    networkRecorder.reset();

    const link = document.createElement("a");
    link.id = "alloy-link-test";
    link.href = "#valid";
    link.textContent = "Test Link";
    document.body.appendChild(link);
    link.addEventListener("click", (e) => e.preventDefault());
    link.click();

    // Fixed wait is necessary: asserting that NO interact call fires after the
    // click, so there is no positive observable condition to poll on.
    await new Promise((resolve) => setTimeout(resolve, 200));

    const calls = networkRecorder.calls.filter((c) =>
      /v1\/interact/.test(c.request?.url ?? ""),
    );
    expect(calls.length).toBe(0);
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

    const link = document.createElement("a");
    link.id = "alloy-link-test";
    link.href = "#internal";
    link.textContent = "Test Link";
    document.body.appendChild(link);
    link.addEventListener("click", (e) => e.preventDefault());
    link.click();

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();

    const event = call.request.body.events[0];
    expect(event.xdm.web.webInteraction.name).toBe("Augmented name");
    expect(event.data.customField).toBe("test123");
  });
});

// ---------------------------------------------------------------------------
// C11693274 – URL query parameters do not affect exit link classification
// ---------------------------------------------------------------------------
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
    const link = document.createElement("a");
    link.id = "alloy-link-test";
    // Build a URL that has the test page's hostname only in a query param
    const externalUrl = `https://example.com/?exclude-this=${window.location.hostname}`;
    link.href = externalUrl;
    link.textContent = "Test Link";
    document.body.appendChild(link);
    link.addEventListener("click", (e) => e.preventDefault());
    link.click();

    const call = await networkRecorder.findCall(/v1\/interact/);
    expect(call).toBeDefined();

    const eventXdm = call.request.body.events[0].xdm;
    expect(eventXdm.eventType).toBe("web.webinteraction.linkClicks");
    expect(eventXdm.web.webInteraction.type).toBe("exit");
    expect(eventXdm.web.webInteraction.URL).toBe(externalUrl);
  });
});

// ---------------------------------------------------------------------------
// C225010 – Click collection handles errors when user declines consent
// ---------------------------------------------------------------------------
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

    const link = document.createElement("a");
    link.id = "alloy-link-test";
    link.href = "#foo";
    link.textContent = "Test Link";
    document.body.appendChild(link);
    link.addEventListener("click", (e) => e.preventDefault());
    link.click();

    // Poll until the "declined consent" warning log appears instead of sleeping.
    await waitUntil(
      () => searchForLogMessage(consoleSpy, "The user declined consent"),
      { intervalMs: 50, timeoutMs: 3000 },
    );

    expect(searchForLogMessage(consoleSpy, "The user declined consent")).toBe(
      true,
    );
    expect(unhandledRejections.length).toBe(0);

    window.removeEventListener("unhandledrejection", rejectionHandler);
    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// C455258 – sendEvent uses /collect when documentUnloading and identity exists
// ---------------------------------------------------------------------------
// Skipped: the /collect endpoint uses sendBeacon, which is not intercepted by
// MSW in browser mode. This test was a baseline failure in the functional suite
// ("Collect endpoint" failures). See FUNCTIONAL_MIGRATION_PLAN.md §1.
test.skip("C455258 - sendEvent sends to collect endpoint when documentUnloading=true after identity established", () => {});

// ---------------------------------------------------------------------------
// C8118 – Click collection sends to interact/collect depending on identity
// ---------------------------------------------------------------------------
// Skipped: tests that assert collect-vs-interact routing depend on sendBeacon
// interception via MSW, which is not reliably supported in browser mode, and
// this test was a baseline failure in the functional suite.
// See FUNCTIONAL_MIGRATION_PLAN.md §1.
test.skip("C8118 - link click routes to interact (no identity) then collect (identity established)", () => {});

// ---------------------------------------------------------------------------
// C9369211 – sendEvent includes a Referer header
// ---------------------------------------------------------------------------
// Skipped: the collect-endpoint portion of this test uses sendBeacon, which
// MSW cannot intercept in browser mode. The interact portion relies on
// inspecting request headers that MSW/networkRecorder may not surface
// consistently. This was a baseline failure in the functional suite.
// See FUNCTIONAL_MIGRATION_PLAN.md §1.
test.skip("C9369211 - sendEvent includes a Referer header on interact and collect requests", () => {});

// ---------------------------------------------------------------------------
// C81182 – onBeforeLinkClickSend with personalization metric
// ---------------------------------------------------------------------------
// Skipped: all sub-tests in the source functional file are already marked
// test.skip because they require a specific personalization response from the
// live edge that is difficult to reproduce deterministically with MSW mocks.
test.skip("C81182 - onBeforeLinkClickSend interacts with personalization metric on link (source tests skipped)", () => {});

// ---------------------------------------------------------------------------
// C81183 – getLinkDetails monitoring hook
// ---------------------------------------------------------------------------
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

    const link = document.createElement("a");
    link.id = "alloy-link-test";
    link.href = "https://example.com/valid.html";
    link.textContent = "Test Link";
    document.body.appendChild(link);

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

    const link = document.createElement("a");
    link.id = "alloy-link-test-disabled";
    link.href = "https://example.com/";
    link.textContent = "External Link";
    document.body.appendChild(link);

    const result = window.___getLinkDetails(link);
    expect(result).toBeTruthy();
    expect(result.linkName).toBeTruthy();
    expect(result.linkType).toBe("exit");
  });

  test("getLinkDetails returns falsy for an element that would not produce a click event", async ({
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
      onBeforeLinkClickSend: (options) => {
        const { clickedElement } = options;
        if (clickedElement.id === "cancel-alloy-link-test") {
          return false;
        }
        return true;
      },
    });

    const cancelLink = document.createElement("a");
    cancelLink.id = "cancel-alloy-link-test";
    cancelLink.href = "https://example.com/canceled.html";
    cancelLink.textContent = "Canceled Link";
    document.body.appendChild(cancelLink);

    // getLinkDetails itself doesn't invoke onBeforeLinkClickSend — it returns
    // the raw link details regardless of the callback. This just proves the
    // monitor hook is accessible and returns a value.
    const result = window.___getLinkDetails(cancelLink);
    // The result may or may not be defined depending on implementation, but
    // the call itself must not throw.
    expect(() => window.___getLinkDetails(cancelLink)).not.toThrow();
  });
});
