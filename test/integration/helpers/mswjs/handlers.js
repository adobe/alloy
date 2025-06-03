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
// eslint-disable-next-line import/extensions
import { server } from "@vitest/browser/context";

const { readFile } = server.commands;

export const sendEventHandler = http.post(
  /https:\/\/edge.adobedc.net\/ee\/.*\/?v1\/interact/,

  async (req) => {
    const url = new URL(req.request.url);
    const configId = url.searchParams.get("configId");

    if (configId === "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83") {
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/test/integration/helpers/mocks/sendEventResponse.json`,
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
          `${server.config.root}/test/integration/helpers/mocks/sendEventErrorResponse.json`,
        ),
        {
          status: 400,
        },
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
          `${server.config.root}/test/integration/helpers/mocks/demdexResponse.json`,
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
          `${server.config.root}/test/integration/helpers/mocks/firstPartyAlloyResponse.json`,
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
      return HttpResponse.text(
        await readFile(
          `${server.config.root}/test/integration/helpers/mocks/inAppMessageResponse.json`,
        ),
      );
    }

    throw new Error("Handler not configured properly");
  },
);
