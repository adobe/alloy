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
import SetConsentView from "../../../src/view/actions/setConsentView";

const extensionSettings = {
  instances: [{ name: "alloy", edgeConfigId: "PR123" }],
  components: { consent: true },
};

describe("Set consent action validation", () => {
  let view;
  let driver;
  let cleanup;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(SetConsentView));
  });

  afterEach(() => cleanup());

  const init = (settings) =>
    driver.init({
      extensionSettings,
      settings: { instanceName: "alloy", ...settings },
    });

  it("accepts Adobe 1.0 consent", async () => {
    await init({
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "in" } },
      ],
    });

    await driver.expectValidate().toBe(true);
  });

  it("requires a consent data element to be a data element", async () => {
    await init({ consent: "not a data element" });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("dataElementField")).expectError(
      /please specify a data element/i,
    );
  });

  it("requires the identity map to be a data element", async () => {
    await init({
      identityMap: "not a data element",
      consent: [
        { standard: "Adobe", version: "1.0", value: { general: "in" } },
      ],
    });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("identityMapField")).expectError(
      /please specify a data element/i,
    );
  });

  it("requires Adobe 2.0 consent to be a data element", async () => {
    await init({
      consent: [{ standard: "Adobe", version: "2.0", value: "not valid" }],
    });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("valueField")).expectError(
      /please specify a data element/i,
    );
  });

  it("requires an IAB TCF value", async () => {
    await init({ consent: [{ standard: "IAB TCF", version: "2.0" }] });

    await driver.expectValidate().toBe(false);
    await field(view.getByTestId("iabValueField")).expectError(
      /please specify a value/i,
    );
  });

  it("blocks saving a new action when the consent component is disabled", async () => {
    await driver.init({
      extensionSettings: {
        ...extensionSettings,
        components: { consent: false },
      },
      settings: null,
    });

    await driver.expectValidate().toBe(false);
  });
});
