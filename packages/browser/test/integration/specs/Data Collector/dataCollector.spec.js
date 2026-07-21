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
import {
  appendLink,
  appendHtmlToBody,
  clickLink,
} from "../../helpers/utils/domHelpers.js";
import {
  sendBeaconCalls,
  resetSendBeaconCalls,
} from "../../helpers/utils/sendBeacon.js";
import waitFor from "../../helpers/utils/waitFor.js";

// A request that must NOT fire has no signal to poll on, so a fixed wait is required.
const NO_REQUEST_WAIT_MS = 200;

// Pin the full edge host and path so a wrong host or malformed path is not
// counted as an interact call. Synchronous, unlike findCalls() which
// retries/waits — wrong for "no request fired".
const EDGE_INTERACT =
  /^https:\/\/edge\.adobedc\.net\/ee\/(?:[^?]*\/)?v1\/interact\?configId=/;
const interactCalls = (networkRecorder) =>
  networkRecorder.calls.filter((c) => EDGE_INTERACT.test(c.request?.url ?? ""));

const firstEvent = (call) => call.request.body.events[0];

// Link clicks are fire-and-forget: clickLink returns before the request is sent,
// so there is no promise to await. waitForCall resolves the moment the matching
// response is captured (no polling), which findCall's short retry window can
// miss under CI load.
const findInteractCall = (networkRecorder) =>
  networkRecorder.waitForCall(/v1\/interact/);

const activityMap = (event) =>
  event.data.__adobe.analytics.contextData.a.activitymap;

// Functional originals pinned absolute alloyio.com URLs; on localhost the
// relative hrefs resolve against the test page, so derive the expected URL.
const absoluteUrl = (href) =>
  /^https?:\/\//.test(href) ? href : new URL(href, window.location.href).href;

const expectedWebInteraction = ({ name, type, href, region = "BODY" }) => ({
  name,
  region,
  type,
  URL: absoluteUrl(href),
  linkClicks: { value: 1 },
});

const expectedActivityMap = ({ link, region = "BODY", pageIDType = 0 }) => ({
  page: window.location.href,
  link,
  region,
  pageIDType,
});

const PERSONALIZATION_PROPOSITION = {
  id: "c81182-proposition",
  scope: "__view__",
  scopeDetails: {
    decisionProvider: "TGT",
    activity: { id: "c81182-activity" },
  },
};

const applyClickProposition = (alloy) =>
  alloy("applyResponse", {
    renderDecisions: true,
    responseBody: {
      requestId: "c81182-request",
      handle: [
        {
          type: "personalization:decisions",
          eventIndex: 0,
          payload: [
            {
              ...PERSONALIZATION_PROPOSITION,
              items: [
                {
                  id: "c81182-click-item",
                  schema: "https://ns.adobe.com/personalization/dom-action",
                  data: {
                    type: "click",
                    selector: "#c81182-link",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  });

const appendPersonalizationLink = () =>
  appendLink({
    id: "c81182-link",
    href: "personalized.html",
    text: "Personalized Link",
  });

const expectPersonalizationMetric = (event) => {
  expect(event.xdm.eventType).toBe("decisioning.propositionInteract");
  expect(event.xdm._experience.decisioning).toEqual({
    propositionEventType: { interact: 1 },
    propositions: [PERSONALIZATION_PROPOSITION],
  });
};

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

    const link = appendLink({
      id: "alloy-link-test",
      href: "#blank",
      text: "Test Link",
    });
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

    expect(
      searchForLogMessage(
        consoleSpy,
        "The 'onBeforeLinkClickSend' configuration was provided but will be ignored because clickCollectionEnabled is false.",
      ),
    ).toBe(true);
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

    const link = appendLink({
      id: "alloy-link-test",
      href: "#valid",
      text: "Test Link",
    });
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

    const link = appendLink({
      id: "alloy-link-test",
      href: "#valid",
      text: "Test Link",
    });
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

    const link = appendLink({
      id: "alloy-link-test",
      href: "valid.html",
      text: "Test Link",
    });
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();

    const event = firstEvent(call);
    expect(event.xdm.eventType).toBe("web.webinteraction.linkClicks");
    expect(event.xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Augmented name",
        type: "other",
        href: "valid.html",
      }),
    );
    // The activity-map link is unchanged: the callback only augmented the xdm
    // webInteraction name, not the data.
    expect(activityMap(event)).toEqual(
      expectedActivityMap({ link: "Test Link" }),
    );
    expect(event.data.customField).toBe("test123");
  });

  test("link click is collected with full XDM when no callback is defined", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        eventGroupingEnabled: false,
      },
    });

    const link = appendLink({
      id: "alloy-link-test",
      href: "valid.html",
      text: "Test Link",
    });
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();

    const event = firstEvent(call);
    expect(event.xdm.eventType).toBe("web.webinteraction.linkClicks");
    expect(event.xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Test Link",
        type: "other",
        href: "valid.html",
      }),
    );
  });

  test("onBeforeLinkClickSend cancels conditionally based on clickedElement.id", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        eventGroupingEnabled: false,
      },
      onBeforeLinkClickSend: (options) =>
        options.clickedElement.id !== "canceled-alloy-link-test",
    });

    const canceledLink = appendLink({
      id: "canceled-alloy-link-test",
      href: "canceled.html",
      text: "Canceled Link",
    });
    clickLink(canceledLink);
    await waitFor(NO_REQUEST_WAIT_MS);
    expect(interactCalls(networkRecorder).length).toBe(0);

    const link = appendLink({
      id: "alloy-link-test",
      href: "valid.html",
      text: "Test Link",
    });
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();
    expect(firstEvent(call).xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Test Link",
        type: "other",
        href: "valid.html",
      }),
    );
  });

  test("filterClickDetails cancels conditionally based on clickedElement.id", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        eventGroupingEnabled: false,
        filterClickDetails: (props) =>
          props.clickedElement.id !== "canceled-alloy-link-test",
      },
    });

    const canceledLink = appendLink({
      id: "canceled-alloy-link-test",
      href: "canceled.html",
      text: "Canceled Link",
    });
    clickLink(canceledLink);
    await waitFor(NO_REQUEST_WAIT_MS);
    expect(interactCalls(networkRecorder).length).toBe(0);

    const link = appendLink({
      id: "alloy-link-test",
      href: "valid.html",
      text: "Test Link",
    });
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();
    expect(firstEvent(call).xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Test Link",
        type: "other",
        href: "valid.html",
      }),
    );
  });

  test("filterClickDetails can augment xdm and data before the request fires", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        eventGroupingEnabled: false,
        filterClickDetails: (props) => {
          if (props.clickedElement.id === "alloy-link-test") {
            props.linkName = "Augmented name";
            return true;
          }
          return false;
        },
      },
    });

    const link = appendLink({
      id: "alloy-link-test",
      href: "valid.html",
      text: "Test Link",
    });
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();

    const event = firstEvent(call);
    expect(event.xdm.eventType).toBe("web.webinteraction.linkClicks");
    // filterClickDetails mutates linkName, so both the webInteraction name and
    // the activity-map link reflect the augmented value.
    expect(event.xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Augmented name",
        type: "other",
        href: "valid.html",
      }),
    );
    expect(activityMap(event)).toEqual(
      expectedActivityMap({ link: "Augmented name" }),
    );
  });

  test("link click data is captured when clickCollection.sessionStorageEnabled is false", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        eventGroupingEnabled: false,
        sessionStorageEnabled: false,
      },
    });

    const link = appendLink({
      id: "alloy-link-test",
      href: "valid.html",
      text: "Test Link",
    });
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();
    expect(firstEvent(call).xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Test Link",
        type: "other",
        href: "valid.html",
      }),
    );
  });
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
    const link = appendLink({
      id: "alloy-link-test",
      href: externalUrl,
      text: "Test Link",
    });
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
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

    const link = appendLink({
      id: "alloy-link-test",
      href: "#foo",
      text: "Test Link",
    });
    // Let the click navigate so a regression that blocks default navigation
    // (the original C225010 concern) would be caught.
    clickLink(link, { preventNavigation: false });
    expect(window.location.href).toContain("#foo");

    await expect
      .poll(() => searchForLogMessage(consoleSpy, "The user declined consent"))
      .toBe(true);

    expect(unhandledRejections.length).toBe(0);

    window.removeEventListener("unhandledrejection", rejectionHandler);
    window.location.hash = "";
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
    const beacons = sendBeaconCalls();
    expect(beacons.length).toBe(1);
    expect(interactCalls(networkRecorder).length).toBe(0);

    expect(beacons[0].url).toMatch(/\/v1\/collect\?configId=/);
    const beaconBody = JSON.parse(await beacons[0].data.text());
    expect(Array.isArray(beaconBody.events)).toBe(true);
    expect(beaconBody.events.length).toBeGreaterThanOrEqual(1);

    networkRecorder.reset();
    resetSendBeaconCalls();

    // Without documentUnloading it always uses interact.
    await alloy("sendEvent");
    expect(interactCalls(networkRecorder).length).toBe(1);
    expect(sendBeaconCalls().length).toBe(0);
  });
});

describe("C8118 - Collects and sends link click information", () => {
  const clickById = (id = "alloy-link-test") =>
    clickLink(document.getElementById(id));

  const waitForIdentityCookie = () =>
    expect
      .poll(async () =>
        (await cookieStore.getAll()).some((c) => c.name.endsWith("_identity")),
      )
      .toBe(true);

  test("link click uses interact before identity and collect (sendBeacon) after", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventWithIdentityCookieHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: { eventGroupingEnabled: false },
    });

    appendLink({
      id: "alloy-link-test",
      href: "blank.html",
      text: "Test Link",
    });
    clickById();

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();
    expect(firstEvent(call).xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Test Link",
        type: "other",
        href: "blank.html",
      }),
    );
    expect(sendBeaconCalls().length).toBe(0);

    // The interact response establishes an identity; wait for the cookie before
    // the second click so it can route to collect.
    await waitForIdentityCookie();
    networkRecorder.reset();
    resetSendBeaconCalls();

    clickById();
    await expect.poll(() => sendBeaconCalls().length).toBe(1);
    expect(interactCalls(networkRecorder).length).toBe(0);
    expect(sendBeaconCalls()[0].url).toMatch(/\/v1\/collect\?configId=/);
  });

  test("download link click is not sent when downloadLinkEnabled is false", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        downloadLinkEnabled: false,
        eventGroupingEnabled: false,
      },
    });

    appendHtmlToBody(
      `<a href="example.zip" id="alloy-link-test" download>Download Zip File</a>`,
    );
    clickById();

    await waitFor(NO_REQUEST_WAIT_MS);
    expect(interactCalls(networkRecorder).length).toBe(0);
    expect(sendBeaconCalls().length).toBe(0);
  });

  test("download link click is sent with download type when downloadLinkEnabled is true", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        downloadLinkEnabled: true,
        eventGroupingEnabled: false,
      },
    });

    appendHtmlToBody(
      `<a href="example.zip" id="alloy-link-test" download>Download Zip File</a>`,
    );
    clickById();

    const call = await findInteractCall(networkRecorder);
    const event = firstEvent(call);
    expect(event.xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Download Zip File",
        type: "download",
        href: "example.zip",
      }),
    );
    expect(activityMap(event)).toEqual(
      expectedActivityMap({ link: "Download Zip File" }),
    );
  });

  test("internal link click is not sent when internalLinkEnabled is false", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        internalLinkEnabled: false,
        eventGroupingEnabled: false,
      },
    });

    appendLink({
      id: "alloy-link-test",
      href: "blank.html",
      text: "Test Link",
    });
    clickById();

    await waitFor(NO_REQUEST_WAIT_MS);
    expect(interactCalls(networkRecorder).length).toBe(0);
    expect(sendBeaconCalls().length).toBe(0);
  });

  test("internal link click is sent with full XDM when internalLinkEnabled is true", async ({
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
    });

    appendLink({
      id: "alloy-link-test",
      href: "blank.html",
      text: "Internal Link",
    });
    clickById();

    const call = await findInteractCall(networkRecorder);
    const event = firstEvent(call);
    expect(event.xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Internal Link",
        type: "other",
        href: "blank.html",
      }),
    );
    expect(activityMap(event)).toEqual(
      expectedActivityMap({ link: "Internal Link" }),
    );
  });

  test("external link click is not sent when externalLinkEnabled is false", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: {
        externalLinkEnabled: false,
        eventGroupingEnabled: false,
      },
    });

    appendLink({
      id: "alloy-link-test",
      href: "https://example.com/",
      text: "External Link",
    });
    clickById();

    await waitFor(NO_REQUEST_WAIT_MS);
    expect(interactCalls(networkRecorder).length).toBe(0);
    expect(sendBeaconCalls().length).toBe(0);
  });

  test("external link click is sent with exit type when externalLinkEnabled is true", async ({
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

    appendLink({
      id: "alloy-link-test",
      href: "https://example.com/",
      text: "External Link",
    });
    clickById();

    const call = await findInteractCall(networkRecorder);
    const event = firstEvent(call);
    expect(event.xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "External Link",
        type: "exit",
        href: "https://example.com/",
      }),
    );
    expect(activityMap(event)).toEqual(
      expectedActivityMap({ link: "External Link" }),
    );
  });

  test("internal link click is not sent immediately when event grouping is enabled", async ({
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
        eventGroupingEnabled: true,
      },
    });

    appendLink({
      id: "alloy-link-test",
      href: "blank.html",
      text: "Test Link",
    });
    clickById();

    await waitFor(NO_REQUEST_WAIT_MS);
    expect(interactCalls(networkRecorder).length).toBe(0);
    expect(sendBeaconCalls().length).toBe(0);
  });

  test("cached internal link click is sent on the next page view event", async ({
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
        eventGroupingEnabled: true,
      },
    });

    appendLink({
      id: "alloy-link-test",
      href: "blank.html",
      text: "Test Link",
    });
    clickById();
    await waitFor(NO_REQUEST_WAIT_MS);
    expect(interactCalls(networkRecorder).length).toBe(0);

    networkRecorder.reset();

    await alloy("sendEvent", {
      xdm: {
        web: {
          webPageDetails: { name: "Test Page", pageViews: { value: 1 } },
        },
      },
    });

    const call = await findInteractCall(networkRecorder);
    const event = firstEvent(call);
    expect(event.xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Test Link",
        type: "other",
        href: "blank.html",
      }),
    );
    expect(event.xdm.web.webPageDetails).toEqual({
      URL: window.location.href,
      name: "Test Page",
      pageViews: { value: 1 },
    });
    expect(activityMap(event)).toEqual(
      expectedActivityMap({ link: "Test Link" }),
    );
  });

  test("internal link click data with custom region", async ({
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
    });

    appendHtmlToBody(
      `<div id="custom-region"><a href="blank.html" id="alloy-link-test">Internal Link</a></div>`,
    );
    clickById();

    const call = await findInteractCall(networkRecorder);
    expect(firstEvent(call).xdm.web.webInteraction.region).toBe(
      "custom-region",
    );
  });

  test("external link click data with custom link type", async ({
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

    appendHtmlToBody(
      `<a href="https://example.com/" id="alloy-link-test" data-linktype="exit">External Link</a>`,
    );
    clickById();

    const call = await findInteractCall(networkRecorder);
    expect(firstEvent(call).xdm.web.webInteraction.type).toBe("exit");
  });

  test("link click with custom activity map data", async ({
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
    });

    appendHtmlToBody(
      `<div id="custom-region"><a href="blank.html" id="alloy-link-test" data-activitymap-region="custom-region" data-activitymap-link-id="custom-link">Custom Activity Map Link</a></div>`,
    );
    clickById();

    const call = await findInteractCall(networkRecorder);
    expect(activityMap(firstEvent(call))).toEqual(
      expectedActivityMap({
        link: "Custom Activity Map Link",
        region: "custom-region",
      }),
    );
  });

  test("multiple grouped link clicks surface on the next page view event", async ({
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
        eventGroupingEnabled: true,
      },
    });

    appendLink({ id: "alloy-link-test-1", href: "blank.html", text: "Link 1" });
    appendLink({ id: "alloy-link-test-2", href: "blank.html", text: "Link 2" });
    clickById("alloy-link-test-1");
    clickById("alloy-link-test-2");

    await waitFor(NO_REQUEST_WAIT_MS);
    expect(interactCalls(networkRecorder).length).toBe(0);

    networkRecorder.reset();

    await alloy("sendEvent", {
      xdm: {
        web: {
          webPageDetails: { name: "Test Page", pageViews: { value: 1 } },
        },
      },
    });

    const call = await findInteractCall(networkRecorder);
    const { webInteraction } = firstEvent(call).xdm.web;
    expect(webInteraction).toBeDefined();
    // Event grouping caches one click at a time, so the last click wins. The
    // payload shape is not guaranteed, so accept either an array or an object.
    if (Array.isArray(webInteraction)) {
      expect(webInteraction.at(-1).name).toBe("Link 2");
    } else {
      expect(webInteraction.name).toBe("Link 2");
    }
  });

  test("link click with custom XDM data via onBeforeLinkClickSend", async ({
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
        options.xdm.customField = "customValue";
        return true;
      },
    });

    appendLink({
      id: "alloy-link-test",
      href: "blank.html",
      text: "Internal Link",
    });
    clickById();

    const call = await findInteractCall(networkRecorder);
    expect(firstEvent(call).xdm.customField).toBe("customValue");
  });

  test("page view name is stored and the grouped click surfaces with it", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: { eventGroupingEnabled: true },
    });

    appendLink({
      id: "alloy-link-test",
      href: "blank.html",
      text: "Test Link",
    });
    clickById();

    await alloy("sendEvent", {
      xdm: { web: { webPageDetails: { name: "Test Page" } } },
    });

    const call = await findInteractCall(networkRecorder);
    const { web } = firstEvent(call).xdm;
    expect(web.webPageDetails.name).toBe("Test Page");
    expect(web.webInteraction).toBeDefined();
  });
});

describe("C81182 - onBeforeLinkClickSend preserves personalization metrics", () => {
  test("cancellation removes link details but retains the personalization metric", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: { eventGroupingEnabled: false },
      onBeforeLinkClickSend: ({ data }) => {
        data.customField = "test";
        return false;
      },
    });
    const link = appendPersonalizationLink();
    await applyClickProposition(alloy);
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();
    const event = firstEvent(call);
    expectPersonalizationMetric(event);
    expect(event.xdm.web?.webInteraction).toBeUndefined();
    expect(event.data).toBeUndefined();
  });

  test("augmentation retains the personalization metric", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: true,
      clickCollection: { eventGroupingEnabled: false },
      onBeforeLinkClickSend: ({ xdm, data }) => {
        xdm.web.webInteraction.name = "Augmented link name";
        data.customField = "augmented";
        return true;
      },
    });
    const link = appendPersonalizationLink();
    await applyClickProposition(alloy);
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();
    const event = firstEvent(call);
    expectPersonalizationMetric(event);
    expect(event.xdm.web.webInteraction).toEqual(
      expectedWebInteraction({
        name: "Augmented link name",
        type: "other",
        href: "personalized.html",
      }),
    );
    expect(event.data.customField).toBe("augmented");
  });

  test("clickCollectionEnabled false still sends the personalization metric", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", {
      ...alloyConfig,
      clickCollectionEnabled: false,
    });
    const link = appendPersonalizationLink();
    await applyClickProposition(alloy);
    clickLink(link);

    const call = await findInteractCall(networkRecorder);
    expect(call).toBeDefined();
    const event = firstEvent(call);
    expectPersonalizationMetric(event);
    expect(event.xdm.web?.webInteraction).toBeUndefined();
  });
});

describe("C9369211 - sendEvent request referrer", () => {
  test("interact exposes the page URL through Request.referrer", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent");

    const call = await networkRecorder.findCall(EDGE_INTERACT);
    expect(call).toBeDefined();
    const expectedReferrer = new URL(window.location.href);
    expectedReferrer.hash = "";
    expect(call.request.referrer).toBe(expectedReferrer.href);
  });

  test("documentUnloading retains collect routing after identity is established", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(sendEventWithIdentityCookieHandler);

    await alloy("configure", alloyConfig);
    await alloy("sendEvent");
    networkRecorder.reset();
    resetSendBeaconCalls();

    await alloy("sendEvent", { documentUnloading: true });

    expect(interactCalls(networkRecorder).length).toBe(0);
    expect(sendBeaconCalls()).toHaveLength(1);
    expect(sendBeaconCalls()[0].url).toMatch(/\/v1\/collect\?configId=/);
  });
});
