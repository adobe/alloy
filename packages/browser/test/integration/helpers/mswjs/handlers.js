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

import { server } from "vitest/browser";

const { readFile } = server.commands;

export const sendEventHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (
      configId &&
      configId.startsWith("bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83")
    ) {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/sendEventResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const sendEventWithIdentityHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/sendEventWithIdentityResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const sendEventWithIdentityCookieHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (
      configId &&
      configId.startsWith("bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83")
    ) {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/sendEventWithIdentityCookieResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const sendEventErrorHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "BOGUS") {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/sendEventErrorResponse.json`,
        ),
        {
          status: 400,
        },
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const pullDestinationsHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/pullDestinationsResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const demdexHandler = http.post(
  "https://adobedc.demdex.net/ee/v1/interact",

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/demdexResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const firstPartyAlloyHandler = http.post(
  "https://firstparty.alloyio.com/ee/*/v1/interact",

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/firstPartyAlloyResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const inAppMessageHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      const requestBody = await req.request.json();
      if (
        requestBody.events?.[0]?.xdm?.eventType ===
        "decisioning.propositionDisplay"
      ) {
        return HttpResponse.json({
          requestId: "display-notification-ack",
          handle: [],
        });
      }

      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/inAppMessageResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const contentCardsAndEventHistoryOperationsOnSendEvent = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      let response = await readFile(
        `${server.config.root}/packages/browser/test/integration/helpers/mocks/contentCardsAndEventHistoryOperations.json`,
      );
      response = response.replace(
        "{{value}}",
        "com.adobe.eventSource.requestContent",
      );

      return HttpResponse.text(response);
    }

    throw new Error("Handler not configured properly");
  },
);

export const contentCardsAndEventHistoryOperations = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      let response = await readFile(
        `${server.config.root}/packages/browser/test/integration/helpers/mocks/contentCardsAndEventHistoryOperations.json`,
      );
      response = response.replace("{{value}}", "someOtherValue");

      return HttpResponse.text(response);
    }

    throw new Error("Handler not configured properly");
  },
);

export const setConsentHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/(?:[^/]+\/)?v1\/privacy\/set-consent/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (
      configId &&
      configId.startsWith("bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83")
    ) {
      const body = await req.request.json().catch(() => ({}));
      const consentOptions = body?.consent ?? [];

      const IAB_OUT_STRINGS = [
        "CO052oTO052oTDGAMBFRACBgAABAAAAAAIYgEawAQEagAAAA", // no Purpose 1
        "CO052qdO052qdDGAMBFRACBgAIBAAAAAAIYgAAoAAAAA", // no Adobe vendor
      ];
      const IAB_IN_STRINGS = [
        "CO052l-O052l-DGAMBFRACBgAIBAAAAAAIYgEawAQEagAAAA", // all required purposes
        "CO052kIO052kIDGAMBFRACBgAIAAAAAAAIYgEawAQEagAAAA", // no Purpose 10
      ];

      let generalConsent = "in";
      for (const option of consentOptions) {
        if (option.standard === "Adobe" && option.version === "1.0") {
          if (option.value?.general === "out") {
            generalConsent = "out";
          }
        } else if (option.standard === "Adobe" && option.version === "2.0") {
          if (option.value?.collect?.val === "n") {
            generalConsent = "out";
          }
        } else if (option.standard === "IAB TCF") {
          if (option.gdprApplies === false) {
            generalConsent = "in";
          } else if (IAB_OUT_STRINGS.includes(option.value)) {
            generalConsent = "out";
          } else if (IAB_IN_STRINGS.includes(option.value)) {
            generalConsent = "in";
          } else {
            throw new Error(
              "Handler received an unexpected IAB consent string",
            );
          }
        }
      }

      return HttpResponse.json({
        requestId: "consent-request-id",
        handle: [
          {
            type: "identity:result",
            payload: [
              {
                id: "41861666193140161934276845651148876988",
                namespace: {
                  code: "ECID",
                },
              },
            ],
          },
          {
            type: "state:store",
            payload: [
              {
                key: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity",
                value:
                  "CiQ0MTg2MTY2NjE5MzE0MDE2MTkzNDI3Njg0NTY1MTE0ODg3Njk4OA==",
                maxAge: 34128000,
              },
              {
                key: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_consent",
                value: `general=${generalConsent}`,
                maxAge: 15552000,
              },
              {
                key: "kndctr_5BFE274A5F6980A50A495C08_AdobeOrg_identity",
                value:
                  "CiY0MTg2MTY2NjE5MzE0MDE2MTkzNDI3Njg0NTY1MTE0ODg3Njk4OFIQCM68vcXoMhgBKgNPUjIwAaAB0ry9xegysAHCqAHwAc68vcXoMg==",
                maxAge: 34128000,
                attrs: { SameSite: "None" },
              },
            ],
          },
        ],
      });
    }

    throw new Error("Handler not configured properly");
  },
);

export const setConsentErrorHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/(?:[^/]+\/)?v1\/privacy\/set-consent/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (
      configId &&
      configId.startsWith("bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83")
    ) {
      const body = await req.request.json().catch(() => ({}));
      const option = body?.consent?.[0] ?? {};
      let status;
      let errorCode;

      if (option.standard !== "IAB TCF" || option.version !== "2.0") {
        status = 400;
        errorCode = "EXEG-0102-400";
      } else if (option.value === undefined) {
        status = 400;
        errorCode = "EXEG-0103-400";
      } else if (option.value === "") {
        status = 422;
        errorCode = "EXEG-0104-422";
      } else {
        throw new Error("Handler received valid IAB consent");
      }

      return HttpResponse.json(
        {
          type: `https://ns.adobe.com/aep/errors/${errorCode}`,
          status,
        },
        { status },
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const acquireHandler = http.post(
  /https:\/\/edge\.adobedc\.net\/ee\/.*\/?v1\/identity\/acquire/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (
      configId &&
      (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83" ||
        configId.startsWith("bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83:"))
    ) {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/acquireResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const mediaSessionHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/mediaSessionResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const mediaEventHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee(\/[^/]+)?\/va\/v1\//,

  async () => {
    return new HttpResponse(null, { status: 204 });
  },
);

export const customCodeHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      const requestBody = await req.request.json();

      // Check if request contains query.personalization.schemas
      const hasSchemas =
        requestBody?.events?.[0]?.query?.personalization?.schemas;

      // If schemas are present, return response with custom code activity
      if (hasSchemas && hasSchemas.length > 0) {
        return HttpResponse.text(
          await readFile(
            `${server.config.root}/packages/browser/test/integration/helpers/mocks/targetCustomCodeAction.json`,
          ),
        );
      }

      // Otherwise, return response without custom code activity
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/emptyEventResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);

export const prependHtmlHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      const requestBody = await req.request.json();

      // Check if request contains query.personalization.schemas
      const hasSchemas =
        requestBody?.events?.[0]?.query?.personalization?.schemas;

      // If schemas are present, return response with prependHtml activity
      if (hasSchemas && hasSchemas.length > 0) {
        return HttpResponse.text(
          await readFile(
            `${server.config.root}/packages/browser/test/integration/helpers/mocks/targetPrependHtmlAction.json`,
          ),
        );
      }

      // Otherwise, return response without prependHtml activity
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/packages/browser/test/integration/helpers/mocks/emptyEventResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);
