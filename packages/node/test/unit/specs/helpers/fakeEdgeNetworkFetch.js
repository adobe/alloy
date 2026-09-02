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

import { vi } from "vitest";
import getNamespacedCookieName from "@adobe/alloy-core/utils/getNamespacedCookieName.js";
import {
  CONSENT,
  IDENTITY,
} from "@adobe/alloy-core/constants/cookieNameKey.js";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status });

const resolveGeneralConsent = (consentOptions = []) => {
  let generalConsent = "in";
  consentOptions.forEach((option) => {
    if (option.standard === "Adobe" && option.version === "1.0") {
      if (option.value?.general === "out") {
        generalConsent = "out";
      }
    } else if (option.standard === "Adobe" && option.version === "2.0") {
      if (option.value?.collect?.val === "n") {
        generalConsent = "out";
      }
    }
  });
  return generalConsent;
};

const identityCookiePayload = ({ orgId, ecid }) => ({
  key: getNamespacedCookieName(orgId, IDENTITY),
  value: `fake-identity-cookie-value-${ecid}`,
  maxAge: 34128000,
});

const buildInteractResponse = ({ orgId, ecid }) => ({
  requestId: "fake-interact-request-id",
  handle: [
    {
      type: "identity:result",
      payload: [{ id: ecid, namespace: { code: "ECID" } }],
    },
    {
      type: "state:store",
      payload: [identityCookiePayload({ orgId, ecid })],
    },
  ],
});

const buildIdentityAcquireResponse = ({ ecid }) => ({
  requestId: "fake-identity-acquire-request-id",
  handle: [
    {
      type: "identity:result",
      payload: [{ id: ecid, namespace: { code: "ECID" } }],
    },
  ],
});

const buildSetConsentResponse = ({ orgId, ecid, requestBody }) => {
  const generalConsent = resolveGeneralConsent(requestBody?.consent);
  const migratedEcid = requestBody?.identityMap?.ECID?.[0]?.id || ecid;
  return {
    requestId: "fake-set-consent-request-id",
    handle: [
      {
        type: "identity:result",
        payload: [{ id: migratedEcid, namespace: { code: "ECID" } }],
      },
      {
        type: "state:store",
        payload: [
          identityCookiePayload({ orgId, ecid: migratedEcid }),
          {
            key: getNamespacedCookieName(orgId, CONSENT),
            value: `general=${generalConsent}`,
            maxAge: 15552000,
          },
        ],
      },
    ],
  };
};

/**
 * A `vi.fn()`-based fetch stub standing in for Edge Network's real
 * `/v1/interact` and `/v1/privacy/set-consent` endpoints, realistic enough
 * for consent tests: every response includes a `state:store` handle (so
 * cookies actually get written through the real cookie service), and
 * set-consent's response general in/out is derived from the request body
 * the same way the real endpoint would (Adobe 1.0 `general`, Adobe 2.0
 * `collect.val`).
 *
 * @param {Object} [options]
 * @param {string} [options.orgId]
 * @param {string} [options.ecid]
 * @param {number} [options.setConsentStatus] When set, every set-consent
 * call responds with this status and an error body instead, for testing
 * how a rejected setConsent() is handled.
 */
const createFakeEdgeNetworkFetch = ({
  orgId = "TEST_ORG@AdobeOrg",
  ecid = "fake-ecid",
  setConsentStatus,
} = {}) =>
  vi.fn(async (url, init) => {
    const requestBody = init?.body ? JSON.parse(init.body) : {};

    if (/\/v1\/privacy\/set-consent\b/.test(url)) {
      if (setConsentStatus !== undefined) {
        return jsonResponse(
          { type: "https://ns.adobe.com/aep/errors/EXEG-0104-422" },
          setConsentStatus,
        );
      }
      return jsonResponse(
        buildSetConsentResponse({ orgId, ecid, requestBody }),
      );
    }

    if (/\/v1\/interact\b/.test(url)) {
      return jsonResponse(buildInteractResponse({ orgId, ecid }));
    }

    if (/\/v1\/identity\/acquire\b/.test(url)) {
      return jsonResponse(buildIdentityAcquireResponse({ ecid }));
    }

    throw new Error(`fakeEdgeNetworkFetch: no handler configured for ${url}`);
  });

export default createFakeEdgeNetworkFetch;
