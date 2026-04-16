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
import { waitForConfigurationViewToLoad, toggleComponent } from "../helpers/ui";
import { spectrumCheckbox } from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config personalization section", () => {
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
            targetMigrationEnabled: true,
            prehidingStyle: "#container { opacity: 0 !important }",
            personalizationStorageEnabled: true,
            autoCollectPropositionInteractions: {
              AJO: "decoratedElementsOnly",
              TGT: "always",
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const targetMigrationEnabledField = spectrumCheckbox(
      "targetMigrationEnabledField",
    );
    expect(await targetMigrationEnabledField.isChecked()).toBe(true);

    const personalizationStorageEnabledField = spectrumCheckbox(
      "personalizationStorageEnabledField",
    );
    expect(await personalizationStorageEnabledField.isChecked()).toBe(true);

    // Check picker values
    const ajoPickerButton = page.getByTestId(
      "autoCollectPropositionInteractionsAJOPicker",
    );
    expect(ajoPickerButton.element().textContent).toContain(
      "Decorated elements only",
    );

    const tgtPickerButton = page.getByTestId(
      "autoCollectPropositionInteractionsTGTPicker",
    );
    expect(tgtPickerButton.element().textContent).toContain("Always");
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const targetMigrationEnabledField = spectrumCheckbox(
      "targetMigrationEnabledField",
    );
    await targetMigrationEnabledField.check();

    const personalizationStorageEnabledField = spectrumCheckbox(
      "personalizationStorageEnabledField",
    );
    await personalizationStorageEnabledField.check();

    // Click to open prehiding style code editor
    await page.getByTestId("prehidingStyleEditButton").click();

    // Change AJO picker to "Never"
    await page
      .getByTestId("autoCollectPropositionInteractionsAJOPicker")
      .click();
    await page.getByRole("option", { name: /never/i }).click();

    // Change TGT picker to "Decorated elements only"
    await page
      .getByTestId("autoCollectPropositionInteractionsTGTPicker")
      .click();
    await page
      .getByRole("option", { name: /decorated elements only/i })
      .click();

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].targetMigrationEnabled).toBe(true);
    expect(settings.instances[0].personalizationStorageEnabled).toBe(true);
    expect(settings.instances[0].prehidingStyle).toBe(
      "/*\nHide elements as necessary. For example:\n#container { opacity: 0 !important }\n*/ + modified code",
    );
    expect(settings.instances[0].autoCollectPropositionInteractions.AJO).toBe(
      "never",
    );
    expect(settings.instances[0].autoCollectPropositionInteractions.TGT).toBe(
      "decoratedElementsOnly",
    );
  });

  it("does not emit personalization settings when component is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            targetMigrationEnabled: true,
            prehidingStyle: "#container { opacity: 0 !important }",
            personalizationStorageEnabled: true,
            autoCollectPropositionInteractions: {
              AJO: "always",
              TGT: "never",
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("personalization");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].targetMigrationEnabled).toBeUndefined();
    expect(settings.instances[0].prehidingStyle).toBeUndefined();
    expect(settings.instances[0].personalizationStorageEnabled).toBeUndefined();
    expect(
      settings.instances[0].autoCollectPropositionInteractions,
    ).toBeUndefined();
  });

  it("does not emit personalization storage when rules engine is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            targetMigrationEnabled: true,
            personalizationStorageEnabled: true,
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("rulesEngine");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].targetMigrationEnabled).toBe(true);
    expect(settings.instances[0].personalizationStorageEnabled).toBeUndefined();
  });

  it("hides personalization storage checkbox when rules engine is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          rulesEngine: false,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Should show info alert instead of checkbox
    await expect
      .element(
        view.getByText(
          /enable it above to configure personalization storage settings/i,
        ),
      )
      .toBeVisible();

    // Checkbox should not be present
    await expect
      .element(view.getByTestId("personalizationStorageEnabledField"))
      .not.toBeInTheDocument(); // expect(personalizationStorageCheckbox).toBeNull();
  });

  it("shows default values for auto-collect pickers", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Check default values
    const ajoPickerButton = page.getByTestId(
      "autoCollectPropositionInteractionsAJOPicker",
    );
    expect(ajoPickerButton.element().textContent).toContain("Always");

    const tgtPickerButton = page.getByTestId(
      "autoCollectPropositionInteractionsTGTPicker",
    );
    expect(tgtPickerButton.element().textContent).toContain("Never");
  });

  it("does not save default values to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const settings = await extensionBridge.getSettings();
    // Default values should not be saved
    expect(settings.instances[0].targetMigrationEnabled).toBeUndefined();
    expect(settings.instances[0].prehidingStyle).toBeUndefined();
    expect(settings.instances[0].personalizationStorageEnabled).toBeUndefined();
    expect(
      settings.instances[0].autoCollectPropositionInteractions,
    ).toBeUndefined();
  });

  it("saves non-default auto-collect values", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          personalization: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Change TGT picker from default "Never" to "Always"
    await page
      .getByTestId("autoCollectPropositionInteractionsTGTPicker")
      .click();
    await page.getByRole("option", { name: /^always$/i }).click();

    const settings = await extensionBridge.getSettings();
    // Only non-default TGT value should be saved
    expect(settings.instances[0].autoCollectPropositionInteractions?.TGT).toBe(
      "always",
    );
    // AJO is still default, so should not be saved
    expect(
      settings.instances[0].autoCollectPropositionInteractions?.AJO,
    ).toBeUndefined();
  });

  it("does not save prehidingStyle code if it matches placeholder", async () => {
    const testExtensionBridge = createExtensionBridge({
      openCodeEditor: ({ code }) => {
        return code;
      },
    });
    window.extensionBridge = testExtensionBridge;

    const view = await renderView(ConfigurationView);

    testExtensionBridge.init(
      buildSettings({
        components: {
          personalization: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await page.getByTestId("prehidingStyleEditButton").click();

    const settings = await testExtensionBridge.getSettings();

    expect(settings.instances[0].prehidingStyle).toBeUndefined();
  });
});
