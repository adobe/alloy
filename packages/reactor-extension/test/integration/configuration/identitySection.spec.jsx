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

import { describe, it, beforeEach, afterEach } from "vitest";

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let driver;
let cleanup;
let idMigrationEnabledField;
let thirdPartyCookiesEnabledField;

describe("Config Identity section", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    idMigrationEnabledField = field(
      view.getByTestId("idMigrationEnabledField"),
    );
    thirdPartyCookiesEnabledField = field(
      view.getByTestId("thirdPartyCookiesEnabledField"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("sets form values from settings", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            idMigrationEnabled: false,
            thirdPartyCookiesEnabled: false,
          },
        ],
      }),
    );

    await idMigrationEnabledField.expectUnchecked();
    await thirdPartyCookiesEnabledField.expectValue("Disabled");
  });

  it("updates form values and saves to settings", async () => {
    await driver.init(buildSettings());

    await idMigrationEnabledField.click();

    await thirdPartyCookiesEnabledField.fill("Disabled");

    await driver
      .expectSettings((s) => s.instances[0].idMigrationEnabled)
      .toBe(false);
    await driver
      .expectSettings((s) => s.instances[0].thirdPartyCookiesEnabled)
      .toBe(false);
  });

  it("shows default values when no settings are provided", async () => {
    await driver.init(buildSettings());

    await idMigrationEnabledField.expectChecked();
    await thirdPartyCookiesEnabledField.expectValue("Enabled");
  });

  it("does not save default values to settings", async () => {
    await driver.init(buildSettings());

    await driver
      .expectSettings((s) => s.instances[0].idMigrationEnabled)
      .toBeUndefined();
    await driver
      .expectSettings((s) => s.instances[0].thirdPartyCookiesEnabled)
      .toBeUndefined();
  });

  it("allows data element in third-party cookies field", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            thirdPartyCookiesEnabled: "%myDataElement%",
          },
        ],
      }),
    );

    await thirdPartyCookiesEnabledField.expectValue("%myDataElement%");

    await driver
      .expectSettings((s) => s.instances[0].thirdPartyCookiesEnabled)
      .toBe("%myDataElement%");
  });

  describe("validation", () => {
    it("validates data element format in third-party cookies field", async () => {
      await driver.init(buildSettings());

      await thirdPartyCookiesEnabledField.fill("invalid%DataElement");

      await driver.expectValidate().toBe(false);

      await thirdPartyCookiesEnabledField.expectError(
        /please enter a valid data element/i,
      );
    });

    it("accepts valid data element format in third-party cookies field", async () => {
      await driver.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              thirdPartyCookiesEnabled: "%validDataElement%",
            },
          ],
        }),
      );

      await driver.expectValidate().toBe(true);
    });
  });
});
