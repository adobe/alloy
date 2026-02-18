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
// eslint-disable-next-line import/no-unresolved
import { page } from "vitest/browser";
import renderView from "../helpers/renderView";
import createExtensionBridge from "../helpers/createExtensionBridge";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { waitForConfigurationViewToLoad } from "../helpers/ui";
import { spectrumCheckbox, spectrumComboBox } from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config Identity section", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("sets form values from settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
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

    await waitForConfigurationViewToLoad(view);

    const idMigrationEnabledField = spectrumCheckbox("idMigrationEnabledField");
    expect(await idMigrationEnabledField.isChecked()).toBe(false);

    const thirdPartyCookiesEnabledField = page.getByTestId(
      "thirdPartyCookiesEnabledField",
    );
    expect(thirdPartyCookiesEnabledField.element().value).toBe("Disabled");
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const idMigrationEnabledField = spectrumCheckbox("idMigrationEnabledField");
    await idMigrationEnabledField.uncheck();

    // Change third-party cookies to "Disabled"
    const thirdPartyCookiesEnabledField = page.getByTestId(
      "thirdPartyCookiesEnabledField",
    );
    await thirdPartyCookiesEnabledField.clear();
    await thirdPartyCookiesEnabledField.fill("Disabled");

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].idMigrationEnabled).toBe(false);
    expect(settings.instances[0].thirdPartyCookiesEnabled).toBe(false);
  });

  it("shows default values when no settings are provided", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Default for idMigrationEnabled is true
    const idMigrationEnabledField = spectrumCheckbox("idMigrationEnabledField");
    expect(await idMigrationEnabledField.isChecked()).toBe(true);

    // Default for thirdPartyCookiesEnabled is "Enabled"
    const thirdPartyCookiesEnabledField = page.getByTestId(
      "thirdPartyCookiesEnabledField",
    );
    expect(thirdPartyCookiesEnabledField.element().value).toBe("Enabled");
  });

  it("does not save default values to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Default values should not be saved
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].idMigrationEnabled).toBeUndefined();
    expect(settings.instances[0].thirdPartyCookiesEnabled).toBeUndefined();
  });

  it("allows data element in third-party cookies field", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            thirdPartyCookiesEnabled: "%myDataElement%",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const thirdPartyCookiesEnabledField = page.getByTestId(
      "thirdPartyCookiesEnabledField",
    );
    expect(thirdPartyCookiesEnabledField.element().value).toBe(
      "%myDataElement%",
    );

    // Verify it's saved as string
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].thirdPartyCookiesEnabled).toBe(
      "%myDataElement%",
    );
  });

  describe("validation", () => {
    it("validates data element format in third-party cookies field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      const thirdPartyCookiesCombo = spectrumComboBox(
        "thirdPartyCookiesEnabledField",
      );
      await thirdPartyCookiesCombo.fill("invalid%DataElement");

      expect(await extensionBridge.validate()).toBe(false);

      expect(await thirdPartyCookiesCombo.hasError()).toBe(true);
      const errorMessage = await thirdPartyCookiesCombo.getErrorMessage();
      expect(errorMessage).toBe("Please enter a valid data element.");
    });

    it("accepts valid data element format in third-party cookies field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              thirdPartyCookiesEnabled: "%validDataElement%",
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);
    });
  });
});
