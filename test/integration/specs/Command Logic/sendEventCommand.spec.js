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
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";
import {
  sendEventHandler,
  sendEventErrorHandler,
} from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";

describe("Send event command", () => {
  test("throws an error when calling after bad configure", async ({
    alloy,
  }) => {
    try {
      await alloy("configure");
    } catch {
      /* empty */
    }

    let error;

    try {
      await alloy("sendEvent");
    } catch (e) {
      error = e;
    }

    expect(error.message).toContain("The library must be configured first.");
  });

  test("throws an error when calling without configuring alloy first", async ({
    alloy,
  }) => {
    let error;

    try {
      await alloy("sendEvent");
    } catch (e) {
      error = e;
    }

    expect(error.message).toContain(
      "The library must be configured first. Please do so by executing the configure command.",
    );
  });

  test("uses the computed config even if the original config object is changed at a later time", async ({
    alloy,
    worker,
    networkRecorder,
  }) => {
    worker.use(...[sendEventHandler]);

    const config = structuredClone(alloyConfig);
    await alloy("configure", config);

    config.orgId = "11111111111111111111@AdobeOrg";
    config.datastreamId = "11111111-1111-1111-1111-111111111111";

    await alloy("sendEvent");

    const call = await networkRecorder.findCall(/edge\.adobedc\.net/);
    expect(call?.request.url.includes(alloyConfig.datastreamId)).toBe(true);
  });

  test("throws an error when the datastreamId is invalid", async ({
    alloy,
    worker,
  }) => {
    worker.use(...[sendEventErrorHandler]);

    await alloy("configure", {
      ...alloyConfig,
      datastreamId: "BOGUS",
    });

    let error;
    try {
      await alloy("sendEvent");
    } catch (e) {
      error = e;
    }

    expect(error.message).toContain(
      "The server responded with a status code 400 and response body",
    );
    expect(error.message).toContain("EXEG-0003-400");
  });
});
