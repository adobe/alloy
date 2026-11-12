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

import { afterEach, beforeEach, describe, it } from "vitest";
import useView from "../helpers/useView";
import field from "../helpers/field";
import ApplyResponseView from "../../../src/view/actions/applyResponseView";

const extensionSettings = { instances: [{ name: "alloy" }] };

describe("Apply response action validation", () => {
  let view;
  let driver;
  let cleanup;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ApplyResponseView));
  });

  afterEach(() => cleanup());

  it("accepts data elements for the response", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        instanceName: "alloy",
        responseHeaders: "%headers%",
        responseBody: "%body%",
      },
    });

    await driver.expectValidate().toBe(true);
  });

  it("requires a response body", async () => {
    await driver.init({
      extensionSettings,
      settings: { instanceName: "alloy" },
    });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("responseBodyField")).expectError(
      /please provide a response body/i,
    );
  });

  it("requires the response headers to be a data element", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        instanceName: "alloy",
        responseHeaders: "headers",
        responseBody: "%body%",
      },
    });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("responseHeadersField")).expectError(
      /data element/i,
    );
  });
});
