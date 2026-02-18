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

import { spectrumRadio, spectrumTextField } from "../helpers/form";
import renderView from "../helpers/renderView";
import createExtensionBridge from "../helpers/createExtensionBridge";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { waitForConfigurationViewToLoad, toggleComponent } from "../helpers/ui";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config consent section", () => {
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
            defaultConsent: "out",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const outRadio = spectrumRadio("defaultConsentOutRadio");
    expect(await outRadio.isSelected()).toBe(true);
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Change to "pending"
    const pendingRadio = spectrumRadio("defaultConsentPendingRadio");
    await pendingRadio.select();

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].defaultConsent).toBe("pending");
  });

  it("does not emit consent settings when component is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            defaultConsent: "out",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("consent");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].defaultConsent).toBeUndefined();
  });

  it("hides form fields and shows alert when component is toggled off", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings({}));

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("consent");

    // Should now show alert panel
    await expect
      .element(
        view.getByRole("heading", {
          name: /consent component disabled/i,
        }),
      )
      .toBeVisible();

    // Radio buttons should not be present
    await expect
      .element(view.getByTestId("defaultConsentInRadio"))
      .not.toBeInTheDocument();
  });

  it("shows default value 'in' when no setting is provided", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const inRadio = spectrumRadio("defaultConsentInRadio");
    expect(await inRadio.isSelected()).toBe(true);
  });

  it("does not save default value 'in' to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Default should be "in" but not saved
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].defaultConsent).toBeUndefined();
  });

  describe("validation", () => {
    it("accepts data element in default consent field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);
      expect(await extensionBridge.validate()).toBe(true);

      const dataElementRadio = spectrumRadio("defaultConsentDataElementRadio");
      await dataElementRadio.select();

      // Verify the data element field shows the correct value
      const dataElementField = spectrumTextField(
        "defaultConsentDataElementField",
      );
      await dataElementField.fill("%consentDataElement%");

      expect(await extensionBridge.validate()).toBe(true);
    });

    it("validates data element format in default consent field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);
      expect(await extensionBridge.validate()).toBe(true);

      const dataElementRadio = spectrumRadio("defaultConsentDataElementRadio");
      await dataElementRadio.click();

      const dataElementField = spectrumTextField(
        "defaultConsentDataElementField",
      );
      await dataElementField.fill("%consentDataElement");

      expect(await extensionBridge.validate()).toBe(false);

      expect(await dataElementField.hasError()).toBe(true);

      // Check the error message
      const errorMessage = await dataElementField.getErrorMessage();
      expect(errorMessage).toBe("Please specify a data element.");
    });

    it("shows error when value is missing in default consent field", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);
      expect(await extensionBridge.validate()).toBe(true);

      const dataElementRadio = spectrumRadio("defaultConsentDataElementRadio");
      await dataElementRadio.click();

      expect(await extensionBridge.validate()).toBe(false);

      const dataElementField = spectrumTextField(
        "defaultConsentDataElementField",
      );
      await dataElementField.clear();
      expect(await dataElementField.hasError()).toBe(true);

      // Check the error message
      const errorMessage = await dataElementField.getErrorMessage();
      expect(errorMessage).toBe("Please specify a data element.");
    });
  });
});
