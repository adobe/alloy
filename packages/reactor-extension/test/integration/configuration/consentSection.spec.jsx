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

import { describe, it, beforeEach, afterEach, expect } from "vitest";

import useView from "../helpers/useView";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import configurationUI from "../helpers/ui/configurationUI";
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let ui;
let driver;
let cleanup;
let defaultConsentInRadio;
let defaultConsentOutRadio;
let defaultConsentPendingRadio;
let defaultConsentDataElementRadio;
let defaultConsentDataElementField;
let consentComponentCheckbox;

describe("Config consent section", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    ui = configurationUI(view);
    defaultConsentInRadio = field(view.getByTestId("defaultConsentInRadio"));
    defaultConsentOutRadio = field(view.getByTestId("defaultConsentOutRadio"));
    defaultConsentPendingRadio = field(
      view.getByTestId("defaultConsentPendingRadio"),
    );
    defaultConsentDataElementRadio = field(
      view.getByTestId("defaultConsentDataElementRadio"),
    );
    defaultConsentDataElementField = field(
      view.getByTestId("defaultConsentDataElementField"),
    );
    consentComponentCheckbox = field(
      view.getByTestId("consentComponentCheckbox"),
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
            defaultConsent: "out",
          },
        ],
      }),
    );

    await defaultConsentOutRadio.expectChecked();
  });

  it("updates form values and saves to settings", async () => {
    await driver.init(buildSettings());

    await defaultConsentPendingRadio.click();

    await driver
      .expectSettings((s) => s.instances[0].defaultConsent)
      .toBe("pending");
  });

  it("does not emit consent settings when component is disabled", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            defaultConsent: "out",
          },
        ],
      }),
    );

    await ui.expand("Build options");
    await consentComponentCheckbox.click();

    await driver
      .expectSettings((s) => s.instances[0].defaultConsent)
      .toBeUndefined();
  });

  it("hides form fields and shows alert when component is toggled off", async () => {
    await driver.init(buildSettings({}));

    await ui.expand("Build options");
    await consentComponentCheckbox.click();

    await expect
      .element(
        view.getByRole("heading", {
          name: /consent component disabled/i,
        }),
      )
      .toBeVisible();

    await defaultConsentInRadio.expectHidden();
  });

  it("shows default value 'in' when no setting is provided", async () => {
    await driver.init(buildSettings());

    await defaultConsentInRadio.expectChecked();
  });

  it("does not save default value 'in' to settings", async () => {
    await driver.init(buildSettings());

    await driver
      .expectSettings((s) => s.instances[0].defaultConsent)
      .toBeUndefined();
  });

  describe("validation", () => {
    it("accepts data element in default consent field", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await defaultConsentDataElementRadio.click();

      await defaultConsentDataElementField.fill("%consentDataElement%");

      await driver.expectValidate().toBe(true);
    });

    it("validates data element format in default consent field", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await defaultConsentDataElementRadio.click();

      await defaultConsentDataElementField.fill("%consentDataElement");

      await driver.expectValidate().toBe(false);

      await defaultConsentDataElementField.expectError(
        /please specify a data element/i,
      );
    });

    it("shows error when value is missing in default consent field", async () => {
      await driver.init(buildSettings());

      await driver.expectValidate().toBe(true);

      await defaultConsentDataElementRadio.click();

      await driver.expectValidate().toBe(false);

      await defaultConsentDataElementField.clear();
      await defaultConsentDataElementField.expectError(
        /please specify a data element/i,
      );
    });
  });
});
