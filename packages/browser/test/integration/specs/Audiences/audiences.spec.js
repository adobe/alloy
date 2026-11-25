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
import { cdp } from "vitest/browser";
import {
  test,
  expect,
  describe,
  afterEach,
  beforeEach,
  vi,
} from "../../helpers/testsSetup/extend.js";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

describe("Send event command", () => {
  let consoleSpy;
  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "info");
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("response should contain URL destinations if turned on in Blackbird", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    await alloy("configure", alloyConfig);

    await alloy("sendEvent");

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);

    const destinationUrls = call.response.body.handle
      .filter((item) => item.type === "activation:push")
      .map((item) => item.payload)
      .flat(Infinity)
      .filter((item) => item.type === "url");

    expect(destinationUrls.length).toBeGreaterThan(0);
  });

  test("C12412: logs an attempt to set a cookie destination from a mocked Edge response", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    await alloy("configure", { ...alloyConfig, debugEnabled: true });

    await alloy("sendEvent");

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);

    const cookieDestinations = call.response.body.handle
      .filter((item) => item.type === "activation:push")
      .map((item) => item.payload)
      .flat(Infinity)
      .filter((item) => item.type === "cookie");

    expect(cookieDestinations.length).toBeGreaterThan(0);

    const logMessage = consoleSpy.mock.calls.filter(
      ([module, message]) =>
        module === "[alloy] [Audiences]" && message === "Setting cookie",
    );

    expect(logMessage[0][2]).toEqual({
      name: "C12412",
      value: "test=C12412",
      domain: "alloyio.com",
      expires: 30,
    });
  });

  // Formerly TestCafe C12412 (packages/browser/test/functional/specs/Audiences/C12412.js): on HTTPS, a cookie destination has SameSite=None and Secure. Not ported: the Vitest page runs on http://localhost, so Alloy omits them. Configure the integration Vite server with HTTPS and a trusted TLS certificate to test this branch.
  test("C12412: stores the destination cookie on the root path", async ({
    alloy,
    worker,
  }) => {
    worker.use(
      http.post(/https:\/\/edge\.adobedc\.net\/ee\/.*v1\/interact/, () =>
        HttpResponse.json({
          handle: [
            {
              type: "activation:push",
              payload: [
                {
                  type: "cookie",
                  spec: { name: "C12412", value: "test=C12412", ttlDays: 30 },
                },
              ],
            },
          ],
        }),
      ),
    );
    await alloy("configure", alloyConfig);
    await alloy("sendEvent");

    expect(document.cookie).toContain("C12412=test%3DC12412");
    const { cookies } = await cdp().send("Network.getAllCookies");
    const destination = cookies.find((cookie) => cookie.name === "C12412");
    expect(destination).toMatchObject({ value: "test%3DC12412", path: "/" });
  });
});
