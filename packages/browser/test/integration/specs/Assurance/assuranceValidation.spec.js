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

import { http, HttpResponse } from "msw";
import {
  testWithoutAlloy as test,
  expect,
  describe,
  beforeEach,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import setupAlloy from "../../helpers/alloy/setup.js";
import cleanAlloy from "../../helpers/alloy/clean.js";
import alloyConfig from "../../helpers/alloy/config.js";
import { withTemporaryUrl } from "../../helpers/utils/location.js";

const CLIENT_ID_KEY = "com.adobe.alloy.instance.alloy.validation.clientId";
const SESSION_PARAM = "adb_validation_sessionid";
const SESSION_ID = "assurance-validation-session";

describe("Assurance validation storage — PDCL-17400", () => {
  beforeEach(() => {
    localStorage.removeItem(CLIENT_ID_KEY);
  });

  afterEach(() => {
    cleanAlloy();
    localStorage.removeItem(CLIENT_ID_KEY);
  });

  test("does not persist a validation client ID before consent without a validation session", async ({
    networkRecorder,
  }) => {
    await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
      const url = new URL(currentHref);
      url.searchParams.delete(SESSION_PARAM);
      applyUrl(url);

      const alloy = await setupAlloy();
      await alloy("configure", { ...alloyConfig, defaultConsent: "pending" });

      expect(
        networkRecorder.calls.filter((call) =>
          call.request?.url.startsWith(`https://${alloyConfig.edgeDomain}/`),
        ),
      ).toHaveLength(0);
      expect(localStorage.getItem(CLIENT_ID_KEY)).toBeNull();
    });
  });

  test("does not persist or send a validation client ID on a normal request", async ({
    worker,
    networkRecorder,
  }) => {
    worker.use(
      http.post(
        `https://${alloyConfig.edgeDomain}/${alloyConfig.edgeBasePath}/v1/interact`,
        () => HttpResponse.json({ handle: [] }),
      ),
    );

    await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
      const url = new URL(currentHref);
      url.searchParams.delete(SESSION_PARAM);
      applyUrl(url);

      const alloy = await setupAlloy();
      await alloy("configure", alloyConfig);
      await alloy("sendEvent");

      const calls = await networkRecorder.findCalls(/v1\/interact/);
      expect(calls).toHaveLength(1);
      expect(
        new URL(calls[0].request.url).searchParams.has(
          "adobeAepValidationToken",
        ),
      ).toBe(false);
      expect(localStorage.getItem(CLIENT_ID_KEY)).toBeNull();
    });
  });

  describe.each([null, "12345678-1234-4234-8234-123456789abc"])(
    "validation session with stored ID: %s",
    (storedClientId) => {
      test("persists and sends the validation client ID", async ({
        worker,
        networkRecorder,
      }) => {
        worker.use(
          http.post(
            `https://${alloyConfig.edgeDomain}/${alloyConfig.edgeBasePath}/v1/interact`,
            () => HttpResponse.json({ handle: [] }),
          ),
        );
        if (storedClientId) {
          localStorage.setItem(CLIENT_ID_KEY, storedClientId);
        }

        await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
          const url = new URL(currentHref);
          url.searchParams.set(SESSION_PARAM, SESSION_ID);
          applyUrl(url);

          const alloy = await setupAlloy();
          await alloy("configure", alloyConfig);

          const clientId = localStorage.getItem(CLIENT_ID_KEY);
          expect(clientId).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          );
          if (storedClientId) {
            expect(clientId).toBe(storedClientId);
          }

          await alloy("sendEvent");

          const calls = await networkRecorder.findCalls(/v1\/interact/);
          expect(calls).toHaveLength(1);
          expect(
            new URL(calls[0].request.url).searchParams.get(
              "adobeAepValidationToken",
            ),
          ).toBe(`${SESSION_ID}|${clientId}`);
        });
      });
    },
  );
});
