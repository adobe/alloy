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
} from "../../helpers/testsSetup/extend.js";
import {
  sendEventHandler,
  sendEventWithIdentityCookieHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";
import { CONSENT_OUT } from "../../helpers/constants/consent.js";
import { appendLink, clickLink } from "../../helpers/utils/domHelpers.js";
import {
  sendBeaconCalls,
  resetSendBeaconCalls,
} from "../../helpers/utils/sendBeacon.js";
import waitFor from "../../helpers/utils/waitFor.js";

// A request that must NOT fire has no signal to poll on, so a fixed wait is required.
const NO_REQUEST_WAIT_MS = 200;

// Synchronous, unlike findCalls() which retries/waits — wrong for "no request fired".
const interactCalls = (networkRecorder) =>
  networkRecorder.calls.filter((c) =>
    /v1\/interact/.test(c.request?.url ?? ""),
  );

describe("C2592 - Event command sends a request", () => {
  test("sendEvent produces an edge interact call with implementationDetails and state", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    const datasetId = "6335faf30f5a161c0b4b1444";

    await alloy("configure", alloyConfig);
    await alloy("sendEvent", { datasetId });

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call).toBeDefined();
    expect(call.response.status).toBeGreaterThanOrEqual(200);
    expect(call.response.status).toBeLessThanOrEqual(207);

    const body = call.request.body;
    expect(body.events[0].xdm.implementationDetails.name).toBe(
      "https://ns.adobe.com/experience/alloy",
    );
    expect(
      body.meta.configOverrides.com_adobe_experience_platform.datasets.event
        .datasetId,
    ).toBe(datasetId);
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

    await waitFor(NO_REQUEST_WAIT_MS);

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
    // onBeforeLinkClickSend always logs a deprecation warning, so use
    // filterClickDetails to isolate the "will be ignored" warning under test.
    await alloy("configure", {
      ...alloyConfig,
      debugEnabled: true,
      clickCollectionEnabled: true,
      clickCollection: {
        filterClickDetails: () => true,
      },
      downloadLinkQualifier: "\\.pdf$",
    });

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

    await waitFor(NO_REQUEST_WAIT_MS);

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

    await waitFor(NO_REQUEST_WAIT_MS);

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
    const { webInteraction } = event.xdm.web;
    expect(webInteraction.name).toBe("Augmented name");
    expect(webInteraction.region).toBe("BODY");
    expect(webInteraction.type).toBe("other");
    expect(webInteraction.linkClicks).toEqual({ value: 1 });
    // URL resolves against the localhost test page, so only check the origin.
    expect(webInteraction.URL).toContain(window.location.origin);
    expect(event.data.customField).toBe("test123");
  });

  // Five C81181 functional tests are interact link-XDM variations, deferred as
  // scope — not blocked (no sendBeacon dependency).
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
    expect(eventXdm.web.webInteraction).toEqual({
      name: "Test Link",
      region: "BODY",
      type: "exit",
      URL: externalUrl,
      linkClicks: { value: 1 },
    });
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

    // Before identity, documentUnloading still uses interact so the response
    // can establish one.
    await alloy("sendEvent", { documentUnloading: true });
    expect(interactCalls(networkRecorder).length).toBe(1);
    expect(sendBeaconCalls().length).toBe(0);

    networkRecorder.reset();
    resetSendBeaconCalls();

    // With identity established, documentUnloading routes to collect (sendBeacon).
    await alloy("sendEvent", { documentUnloading: true });
    expect(sendBeaconCalls().length).toBe(1);
    expect(interactCalls(networkRecorder).length).toBe(0);

    networkRecorder.reset();
    resetSendBeaconCalls();

    // Without documentUnloading it always uses interact.
    await alloy("sendEvent");
    expect(interactCalls(networkRecorder).length).toBe(1);
    expect(sendBeaconCalls().length).toBe(0);
  });
});

describe("Not migrated (see per-test rationale)", () => {
  // 15 functional sub-tests. The one collect-routing case is now doable via the
  // sendBeacon recorder (see C455258); the other 14 are interact link-XDM
  // variations deferred as scope, like the C81181 five.
  test.skip("C8118 - link click routes to interact (no identity) then collect (identity established)", () => {});

  // Asserts the Referer header, but it's a browser-set forbidden header added
  // after MSW's service worker sees the request, so networkRecorder can't
  // capture it (verified). The collect-side referer was already a commented-out
  // TODO in the functional source, and collect routing is covered by C455258.
  test.skip("C9369211 - sendEvent includes a Referer header on interact and collect requests", () => {});

  // Every sub-test is test.skip in the functional source too — they need a
  // specific live-edge personalization response that's hard to mock deterministically.
  test.skip("C81182 - onBeforeLinkClickSend interacts with personalization metric on link (source tests skipped)", () => {});
});

describe("C81183 - getLinkDetails monitoring hook via __alloyMonitors", () => {
  // Install the monitor before configure so onInstanceConfigured fires and
  // exposes getLinkDetails.
  beforeEach(() => {
    window.__alloyMonitors = [
      {
        onInstanceConfigured(data) {
          window.___getLinkDetails = data.getLinkDetails;
        },
      },
    ];
  });

  test("getLinkDetails returns correct link info for a visible link element", async ({
    alloy,
  }) => {
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
    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
    });

    // An absent/non-clickable element yields a details object with undefined
    // fields, not a throw or falsy — mirrors original C81183 test 2.
    const result = window.___getLinkDetails(null);
    expect(result.linkName).toBeUndefined();
    expect(result.linkType).toBeUndefined();
    expect(result.linkUrl).toBeUndefined();
  });
});
