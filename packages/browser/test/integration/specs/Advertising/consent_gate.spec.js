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

import { http, HttpResponse } from "msw";
import { test, describe, expect } from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import { createAdvertisingConfig } from "../../helpers/advertising.js";
import waitFor from "../../helpers/utils/waitFor.js";

const getNamespacedCookieName = (key) => {
  const sanitizedOrg = alloyConfig.orgId.replace("@", "_");
  return `kndctr_${sanitizedOrg}_${key}`;
};

const getAdvertisingCookie = () => {
  const name = getNamespacedCookieName("advertising");
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.split("=").slice(1).join("=") : null;
};

const clearCookie = (key) => {
  const name = getNamespacedCookieName(key);
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

const clearUrlParams = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("s_kwcid");
  url.searchParams.delete("ef_id");
  window.history.replaceState({}, "", url.toString());
};

const cleanupAll = () => {
  clearUrlParams();
  clearCookie("advertising");
  clearCookie("consent");
};

/**
 * A setConsent handler that returns a state:store handle to set the consent cookie,
 * matching what the real Edge Network returns.
 */
const setConsentAcceptHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/(?:[^/]+\/)?v1\/privacy\/set-consent/,
  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      return HttpResponse.json({
        requestId: "consent-request-id",
        handle: [
          {
            type: "state:store",
            payload: [
              {
                key: getNamespacedCookieName("consent"),
                value: "general=in",
                maxAge: 15552000,
              },
            ],
          },
        ],
      });
    }

    throw new Error("Handler not configured properly");
  },
);

describe("Advertising - Consent gate", () => {
  test("should not write advertising cookies while consent is pending (click-through)", async ({
    alloy,
    worker,
  }) => {
    cleanupAll();
    worker.use(sendEventHandler, setConsentAcceptHandler);

    // Set URL params for click-through BEFORE configure
    const url = new URL(window.location.href);
    url.searchParams.set("s_kwcid", "AL!test_kwcid_123");
    url.searchParams.set("ef_id", "test_efid_456");
    window.history.replaceState({}, "", url.toString());

    // Configure with consent pending — advertising component should NOT
    // write any cookies until consent is granted.
    await alloy("configure", {
      ...alloyConfig,
      ...createAdvertisingConfig(),
      defaultConsent: "pending",
    });

    // Wait enough time for the component to have set cookies if it were going to.
    await waitFor(500);

    // Verify: NO advertising cookie should exist while consent is pending.
    expect(getAdvertisingCookie()).toBeNull();

    cleanupAll();
  });

  test("should not write advertising cookies while consent is pending (view-through)", async ({
    alloy,
    worker,
  }) => {
    cleanupAll();
    worker.use(sendEventHandler, setConsentAcceptHandler);

    // Configure with consent pending and advertiser settings for view-through
    await alloy("configure", {
      ...alloyConfig,
      ...createAdvertisingConfig(),
      defaultConsent: "pending",
    });

    // Wait for view-through flow to have resolved IDs if it were running
    await waitFor(500);

    // Verify: NO advertising cookie while consent is pending
    expect(getAdvertisingCookie()).toBeNull();

    cleanupAll();
  });

  test("should write cookies and send conversion after consent is accepted (click-through)", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    cleanupAll();
    worker.use(sendEventHandler, setConsentAcceptHandler);

    // Set URL params for click-through
    const url = new URL(window.location.href);
    url.searchParams.set("s_kwcid", "AL!test_kwcid_789");
    url.searchParams.set("ef_id", "test_efid_012");
    window.history.replaceState({}, "", url.toString());

    await alloy("configure", {
      ...alloyConfig,
      ...createAdvertisingConfig(),
      defaultConsent: "pending",
    });

    // Verify no cookies yet
    await waitFor(300);
    expect(getAdvertisingCookie()).toBeNull();

    // Grant consent — the mock returns a state:store handle that sets the
    // consent cookie, which makes the SDK transition consent to "in".
    await alloy("setConsent", {
      consent: [
        {
          standard: "Adobe",
          version: "1.0",
          value: { general: "in" },
        },
      ],
    });

    // Wait for the fire-and-forget conversion flow to complete.
    // After consent transitions to "in", sendAdConversion resumes,
    // writes cookies, and sends the conversion network call.
    await waitFor(3000);

    // Verify: advertising cookie should now exist (written during click-through)
    const cookieValue = getAdvertisingCookie();
    expect(cookieValue).not.toBeNull();

    // Verify a click-through conversion call was made
    const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
      retries: 10,
      delayMs: 200,
    });
    const conversionCall = calls.find((call) => {
      const body =
        typeof call.request.body === "string"
          ? JSON.parse(call.request.body)
          : call.request.body;
      return body?.events?.[0]?.xdm?.eventType === "advertising.enrichment_ct";
    });
    expect(conversionCall).toBeTruthy();

    cleanupAll();
  });

  // This test is last because declining consent triggers internal SDK
  // promise rejections that can contaminate subsequent tests.
  // The SDK's consent state machine rejects all pending deferreds when consent
  // is declined. Some of these come from internal lifecycle hooks that don't
  // explicitly handle the rejection — this is expected SDK behavior.
  test("should not write cookies or send conversion when consent is rejected", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    // Suppress expected "declined consent" unhandled rejections from the SDK
    const suppressDeclined = (event) => {
      if (event?.reason?.message?.includes("declined consent")) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", suppressDeclined);

    cleanupAll();

    const setConsentDeclineHandler = http.post(
      /https:\/\/edge\.adobedc\.net\/ee\/(?:[^/]+\/)?v1\/privacy\/set-consent/,
      async (req) => {
        const url = new URL(req.request.url);
        const configId = url.searchParams.get("configId");

        if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
          return HttpResponse.json({
            requestId: "consent-request-id",
            handle: [
              {
                type: "state:store",
                payload: [
                  {
                    key: getNamespacedCookieName("consent"),
                    value: "general=out",
                    maxAge: 15552000,
                  },
                ],
              },
            ],
          });
        }

        throw new Error("Handler not configured properly");
      },
    );

    worker.use(sendEventHandler, setConsentDeclineHandler);

    // Set URL params for click-through
    const url = new URL(window.location.href);
    url.searchParams.set("s_kwcid", "AL!test_kwcid_reject");
    url.searchParams.set("ef_id", "test_efid_reject");
    window.history.replaceState({}, "", url.toString());

    await alloy("configure", {
      ...alloyConfig,
      ...createAdvertisingConfig(),
      defaultConsent: "pending",
    });

    // Verify no cookies yet
    await waitFor(300);
    expect(getAdvertisingCookie()).toBeNull();

    // Decline consent
    await alloy("setConsent", {
      consent: [
        {
          standard: "Adobe",
          version: "1.0",
          value: { general: "out" },
        },
      ],
    });

    // Wait to ensure nothing fires after decline
    await waitFor(500);

    // Verify: NO advertising cookie should exist after decline
    expect(getAdvertisingCookie()).toBeNull();

    // Verify no conversion calls were made (only consent call should exist)
    const calls = await networkRecorder.findCalls(/edge\.adobedc\.net/, {
      retries: 3,
      delayMs: 100,
    });
    const conversionCall = calls.find((call) => {
      const body =
        typeof call.request.body === "string"
          ? JSON.parse(call.request.body)
          : call.request.body;
      return body?.events?.[0]?.xdm?.eventType === "advertising.enrichment_ct";
    });
    expect(conversionCall).toBeFalsy();

    cleanupAll();
    window.removeEventListener("unhandledrejection", suppressDeclined);
  });
});
