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

/**
 * SDK-level regression guard for the Wave 4 migration.
 *
 * These tests exercise the built dist/alloy.js bundle and verify that the two
 * cookie paths most affected by the migration still work correctly:
 *
 *  1. state:store responses from sendEvent write the identity cookie — exercises
 *     createCookieTransfer.responseToCookies() via platformServices.cookie.set()
 *     in the Identity component flow.
 *
 *  2. setConsent writes the consent cookie AND the Consent component can read
 *     the identity cookie via platformServices.cookie.get() — exercises both
 *     the read and write paths of the cookie service in a realistic sequence.
 */

import {
  test,
  expect,
  describe,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import {
  sendEventWithIdentityHandler,
  setConsentHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

const IDENTITY_COOKIE = "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity";
const CONSENT_COOKIE = "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_consent";

const clearCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

afterEach(() => {
  clearCookie(IDENTITY_COOKIE);
  clearCookie(CONSENT_COOKIE);
});

describe("PlatformServices wiring — cookie service read/write at SDK level", () => {
  test("sendEvent state:store response writes the identity cookie via platformServices.cookie", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventWithIdentityHandler);
    await alloy("configure", alloyConfig);
    await alloy("sendEvent");

    // If platformServices.cookie.set() is mis-wired, this cookie will be absent
    // even though the server returned it in the state:store payload.
    expect(document.cookie).toContain(IDENTITY_COOKIE);
  });

  test("setConsent writes the consent cookie and the Consent component can read the identity cookie", async ({
    alloy,
    worker,
  }) => {
    // First sendEvent establishes the identity cookie, which the Consent
    // component reads via platformServices.cookie.get() on subsequent requests.
    worker.use(sendEventWithIdentityHandler);
    await alloy("configure", alloyConfig);
    await alloy("sendEvent");
    expect(document.cookie).toContain(IDENTITY_COOKIE);

    // Now switch to the setConsent handler and call setConsent.
    worker.use(setConsentHandler);
    await alloy("setConsent", {
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "in" } },
      ],
    });

    // If the cookie service write path is broken, the consent cookie will be absent.
    expect(document.cookie).toContain(CONSENT_COOKIE);
  });
});
