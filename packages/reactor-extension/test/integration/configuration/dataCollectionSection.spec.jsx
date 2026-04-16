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
import {
  spectrumCheckbox,
  spectrumTextField,
  spectrumRadio,
} from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config data collection section", () => {
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
            onBeforeEventSend: "// custom code",
            clickCollection: {
              filterClickDetails: "// filter code",
            },
            context: ["web", "device"],
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const internalLinkEnabledField = spectrumCheckbox(
      "internalLinkEnabledField",
    );
    expect(await internalLinkEnabledField.isChecked()).toBe(true);

    let fields = [
      ["None", true],
      ["SessionStorage", false],
      ["Memory", false],
    ];

    for (const [fieldName, expectedValue] of fields) {
      const field = spectrumRadio(`eventGrouping${fieldName}Field`);
      // eslint-disable-next-line no-await-in-loop
      expect(await field.isSelected()).toBe(expectedValue);
    }
    const externalLinkEnabledField = spectrumCheckbox(
      "externalLinkEnabledField",
    );
    expect(await externalLinkEnabledField.isChecked()).toBe(true);

    const downloadLinkEnabledField = spectrumCheckbox(
      "downloadLinkEnabledField",
    );
    expect(await downloadLinkEnabledField.isChecked()).toBe(true);

    // Check that context is set to specific
    const contextGranularitySpecificField = page.getByTestId(
      "contextGranularitySpecificField",
    );
    expect(contextGranularitySpecificField.element().checked).toBe(true);

    fields = [
      ["Web", true],
      ["Device", true],
      ["Environment", false],
      ["PlaceContext", false],
      ["HighEntropyUserAgentHints", false],
      ["OneTimeAnalyticsReferrer", false],
    ];

    for (const [fieldName, expectedValue] of fields) {
      const field = spectrumCheckbox(`context${fieldName}Field`);
      // eslint-disable-next-line no-await-in-loop
      expect(await field.isChecked()).toBe(expectedValue);
    }
  });

  it("sets form values from settings with event grouping session storage", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollection: {
              sessionStorageEnabled: true,
              eventGroupingEnabled: true,
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const internalLinkEnabledField = spectrumCheckbox(
      "internalLinkEnabledField",
    );
    expect(await internalLinkEnabledField.isChecked()).toBe(true);

    const fields = [
      ["None", false],
      ["SessionStorage", true],
      ["Memory", false],
    ];

    for (const [fieldName, expectedValue] of fields) {
      const field = spectrumRadio(`eventGrouping${fieldName}Field`);
      // eslint-disable-next-line no-await-in-loop
      expect(await field.isSelected()).toBe(expectedValue);
    }
  });

  it("sets form values from settings with event grouping memory", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollection: {
              eventGroupingEnabled: true,
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const internalLinkEnabledField = spectrumCheckbox(
      "internalLinkEnabledField",
    );
    expect(await internalLinkEnabledField.isChecked()).toBe(true);

    const fields = [
      ["None", false],
      ["SessionStorage", false],
      ["Memory", true],
    ];

    for (const [fieldName, expectedValue] of fields) {
      const field = spectrumRadio(`eventGrouping${fieldName}Field`);
      // eslint-disable-next-line no-await-in-loop
      expect(await field.isSelected()).toBe(expectedValue);
    }
  });

  it("sets form values from settings with download link enabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            downloadLinkQualifier: "\\.(exe|zip)$",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const downloadsLinkEnabledField = spectrumCheckbox(
      "downloadLinkEnabledField",
    );
    expect(await downloadsLinkEnabledField.isChecked()).toBe(true);

    const downloadLinkQualifierField = spectrumTextField(
      "downloadLinkQualifierField",
    );
    expect(await downloadLinkQualifierField.getValue()).toBe("\\.(exe|zip)$");
  });

  it("sets form values from settings with all link types disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollectionEnabled: false,
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const internalLinkEnabledField = spectrumCheckbox(
      "internalLinkEnabledField",
    );
    expect(await internalLinkEnabledField.isChecked()).toBe(false);

    const externalLinkEnabledField = spectrumCheckbox(
      "externalLinkEnabledField",
    );
    expect(await externalLinkEnabledField.isChecked()).toBe(false);

    const downloadLinkEnabledField = spectrumCheckbox(
      "downloadLinkEnabledField",
    );
    expect(await downloadLinkEnabledField.isChecked()).toBe(false);
  });

  it("sets form values from settings with some link types disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollection: {
              externalLinkEnabled: false,
              downloadLinkEnabled: false,
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const internalLinkEnabledField = spectrumCheckbox(
      "internalLinkEnabledField",
    );
    expect(await internalLinkEnabledField.isChecked()).toBe(true);

    const externalLinkEnabledField = spectrumCheckbox(
      "externalLinkEnabledField",
    );
    expect(await externalLinkEnabledField.isChecked()).toBe(false);

    const downloadLinkEnabledField = spectrumCheckbox(
      "downloadLinkEnabledField",
    );
    expect(await downloadLinkEnabledField.isChecked()).toBe(false);
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Disable external link collection (from default true to false)
    const externalLinkEnabledField = spectrumCheckbox(
      "externalLinkEnabledField",
    );
    await externalLinkEnabledField.uncheck();

    // Disable download link collection (from default true to false)
    const downloadLinkEnabledField = spectrumCheckbox(
      "downloadLinkEnabledField",
    );
    await downloadLinkEnabledField.uncheck();

    // Change context to specific
    const contextGranularitySpecificField = page.getByTestId(
      "contextGranularitySpecificField",
    );
    await contextGranularitySpecificField.click();

    // Uncheck web context
    const contextWebField = spectrumCheckbox("contextWebField");
    await contextWebField.uncheck();

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].clickCollection.externalLinkEnabled).toBe(
      false,
    );
    expect(settings.instances[0].clickCollection.downloadLinkEnabled).toBe(
      false,
    );
    expect(settings.instances[0].context).toEqual([
      "device",
      "environment",
      "placeContext",
    ]);
  });

  it("shows and hides download link qualifier based on download link enabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Initially, download link is enabled by default, so qualifier should be visible
    await expect
      .element(view.getByTestId("downloadLinkQualifierField"))
      .toBeInTheDocument();

    // Disable download link collection
    const downloadLinkEnabledField = spectrumCheckbox(
      "downloadLinkEnabledField",
    );
    await downloadLinkEnabledField.uncheck();

    // Qualifier field should not be visible
    await expect
      .element(view.getByTestId("downloadLinkQualifierField"))
      .not.toBeInTheDocument();
  });

  it("shows and hides event grouping options based on internal link enabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Initially, internal link is enabled by default, so event grouping should be visible
    await expect
      .element(view.getByTestId("eventGroupingNoneField"))
      .toBeInTheDocument();

    // Disable internal link collection
    const internalLinkEnabledField = spectrumCheckbox(
      "internalLinkEnabledField",
    );
    await internalLinkEnabledField.uncheck();

    // Event grouping options should not be visible
    await expect
      .element(view.getByTestId("eventGroupingNoneField"))
      .not.toBeInTheDocument();
  });

  it("saves event grouping settings when session storage is selected", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Select session storage event grouping
    const eventGroupingSessionStorageField = page.getByTestId(
      "eventGroupingSessionStorageField",
    );
    await eventGroupingSessionStorageField.click();

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].clickCollection.eventGroupingEnabled).toBe(
      true,
    );
    expect(settings.instances[0].clickCollection.sessionStorageEnabled).toBe(
      true,
    );
  });

  it("saves event grouping settings when memory is selected", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Select memory event grouping
    const eventGroupingMemoryField = page.getByTestId(
      "eventGroupingMemoryField",
    );
    await eventGroupingMemoryField.click();

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].clickCollection.eventGroupingEnabled).toBe(
      true,
    );
    // sessionStorageEnabled should not be present when false (it's the default)
    expect(
      settings.instances[0].clickCollection.sessionStorageEnabled,
    ).toBeUndefined();
  });

  it("does not emit click collection settings when activity collector is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            clickCollectionEnabled: true,
            clickCollection: {
              internalLinkEnabled: true,
              externalLinkEnabled: true,
              downloadLinkEnabled: true,
            },
            downloadLinkQualifier: "\\.(pdf)$",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("activityCollector");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].clickCollectionEnabled).toBeUndefined();
    expect(settings.instances[0].clickCollection).toBeUndefined();
    expect(settings.instances[0].downloadLinkQualifier).toBeUndefined();
  });

  it("hides click collection fields and shows alert when activity collector is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings({}));

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("activityCollector");

    // Should now show alert panel
    await expect
      .element(
        view.getByRole("heading", {
          name: /activity collector component disabled/i,
        }),
      )
      .toBeVisible();

    // Checkboxes should not be present
    await expect
      .element(view.getByTestId("internalLinkEnabledField"))
      .not.toBeInTheDocument();
  });

  it("shows default values when no settings are provided", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Default for internal link is true
    const internalLinkEnabledField = spectrumCheckbox(
      "internalLinkEnabledField",
    );
    expect(await internalLinkEnabledField.isChecked()).toBe(true);

    // Default for external link is true
    const externalLinkEnabledField = spectrumCheckbox(
      "externalLinkEnabledField",
    );
    expect(await externalLinkEnabledField.isChecked()).toBe(true);

    // Default for download link is true
    const downloadLinkEnabledField = spectrumCheckbox(
      "downloadLinkEnabledField",
    );
    expect(await downloadLinkEnabledField.isChecked()).toBe(true);

    // Default for context granularity is "all"
    const contextGranularityAllField = page.getByTestId(
      "contextGranularityAllField",
    );
    expect(contextGranularityAllField.element().checked).toBe(true);

    // Default for event grouping is "none"
    const eventGroupingNoneField = page.getByTestId("eventGroupingNoneField");
    expect(eventGroupingNoneField.element().checked).toBe(true);
  });

  it("does not save default values to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Default values should not be saved
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].onBeforeEventSend).toBeUndefined();
    expect(settings.instances[0].clickCollection).toBeUndefined();
    expect(settings.instances[0].downloadLinkQualifier).toBeUndefined();
    expect(settings.instances[0].context).toBeUndefined();
  });

  it("updates download link qualifier", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Change download link qualifier
    const downloadLinkQualifierField = spectrumTextField(
      "downloadLinkQualifierField",
    );
    await downloadLinkQualifierField.fill("\\.(zip|exe)$");

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].downloadLinkQualifier).toBe("\\.(zip|exe)$");
  });

  it("shows context checkboxes when specific context is selected", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Initially, context granularity is "all", so checkboxes should not be visible
    await expect
      .element(view.getByTestId("contextWebField"))
      .not.toBeInTheDocument();

    // Change to specific context
    const contextGranularitySpecificField = page.getByTestId(
      "contextGranularitySpecificField",
    );
    await contextGranularitySpecificField.click();

    // Context checkboxes should now be visible
    await expect
      .element(view.getByTestId("contextWebField"))
      .toBeInTheDocument();
    await expect
      .element(view.getByTestId("contextDeviceField"))
      .toBeInTheDocument();
    await expect
      .element(view.getByTestId("contextEnvironmentField"))
      .toBeInTheDocument();
    await expect
      .element(view.getByTestId("contextPlaceContextField"))
      .toBeInTheDocument();
    await expect
      .element(view.getByTestId("contextHighEntropyUserAgentHintsField"))
      .toBeInTheDocument();
    await expect
      .element(view.getByTestId("contextOneTimeAnalyticsReferrerField"))
      .toBeInTheDocument();
  });

  it("saves non-default context when specific is selected", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Change to specific context
    const contextGranularitySpecificField = page.getByTestId(
      "contextGranularitySpecificField",
    );
    await contextGranularitySpecificField.click();

    // Uncheck environment
    const contextEnvironmentField = spectrumCheckbox("contextEnvironmentField");
    await contextEnvironmentField.uncheck();

    // Check high entropy
    const contextHighEntropyField = spectrumCheckbox(
      "contextHighEntropyUserAgentHintsField",
    );
    await contextHighEntropyField.check();

    // Check Analytics Referrer
    const contextOneTimeAnalyticsReferrerField = spectrumCheckbox(
      "contextOneTimeAnalyticsReferrerField",
    );
    await contextOneTimeAnalyticsReferrerField.check();

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].context).toEqual([
      "web",
      "device",
      "placeContext",
      "highEntropyUserAgentHints",
      "oneTimeAnalyticsReferrer",
    ]);
  });

  it("loads context options from settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            context: ["web", "device", "oneTimeAnalyticsReferrer"],
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Check that context is set to specific
    const contextGranularitySpecificField = page.getByTestId(
      "contextGranularitySpecificField",
    );
    expect(contextGranularitySpecificField.element().checked).toBe(true);

    // Check that default context options are set properly
    const contextWebField = spectrumCheckbox("contextWebField");
    expect(await contextWebField.isChecked()).toBe(true);
    const contextDeviceField = spectrumCheckbox("contextDeviceField");
    expect(await contextDeviceField.isChecked()).toBe(true);
    const contextEnvironmentField = spectrumCheckbox("contextEnvironmentField");
    expect(await contextEnvironmentField.isChecked()).toBe(false);
    const contextPlaceContextField = spectrumCheckbox(
      "contextPlaceContextField",
    );
    expect(await contextPlaceContextField.isChecked()).toBe(false);

    // Check that default-disabled context options are set properly
    const contextHighEntropyUserAgentHintsField = spectrumCheckbox(
      "contextHighEntropyUserAgentHintsField",
    );
    expect(await contextHighEntropyUserAgentHintsField.isChecked()).toBe(false);
    const contextOneTimeAnalyticsReferrerField = spectrumCheckbox(
      "contextOneTimeAnalyticsReferrerField",
    );
    expect(await contextOneTimeAnalyticsReferrerField.isChecked()).toBe(true);
  });

  it("disables click collection when all link types are disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Disable all link types
    const internalLinkEnabledField = spectrumCheckbox(
      "internalLinkEnabledField",
    );
    await internalLinkEnabledField.uncheck();

    const externalLinkEnabledField = spectrumCheckbox(
      "externalLinkEnabledField",
    );
    await externalLinkEnabledField.uncheck();

    const downloadLinkEnabledField = spectrumCheckbox(
      "downloadLinkEnabledField",
    );
    await downloadLinkEnabledField.uncheck();

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].clickCollectionEnabled).toBe(false);
  });

  it("sets download link qualifier when test button is clicked", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const downloadLinkQualifierTestButton = page.getByTestId(
      "downloadLinkQualifierTestButton",
    );
    await downloadLinkQualifierTestButton.click();

    const downloadLinkQualifierField = spectrumTextField(
      "downloadLinkQualifierField",
    );
    expect(await downloadLinkQualifierField.getValue()).toMatch(
      /edited regex/i,
    );
  });

  it("does not save onBeforeEventSend code if it matches placeholder", async () => {
    const testExtensionBridge = createExtensionBridge({
      openCodeEditor: ({ code }) => {
        return code;
      },
    });
    window.extensionBridge = testExtensionBridge;

    const view = await renderView(ConfigurationView);

    testExtensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const onBeforeEventSendEditButton = page.getByTestId(
      "onBeforeEventSendEditButton",
    );
    await onBeforeEventSendEditButton.click();

    const settings = await testExtensionBridge.getSettings();
    expect(settings.instances[0].onBeforeEventSend).toBeUndefined();
  });

  it("does not save filterClickDetails code if it matches placeholder", async () => {
    const testExtensionBridge = createExtensionBridge({
      openCodeEditor: ({ code }) => {
        return code;
      },
    });
    window.extensionBridge = testExtensionBridge;

    const view = await renderView(ConfigurationView);

    testExtensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const filterClickDetailsEditButton = page.getByTestId(
      "filterClickDetailsEditButton",
    );
    await filterClickDetailsEditButton.click();

    const settings = await testExtensionBridge.getSettings();
    expect(
      settings.instances[0].clickCollection?.filterClickDetails,
    ).toBeUndefined();
  });

  describe("restore default buttons", () => {
    it("restores default download link qualifier when button is clicked", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      // First, change the orgId
      const downloadLinkQualifierField = spectrumTextField(
        "downloadLinkQualifierField",
      );
      const originalDownloadLinkQualifier =
        await downloadLinkQualifierField.getValue();
      await downloadLinkQualifierField.fill("\\.(exe|zip)$");

      // Verify it changed
      expect(await downloadLinkQualifierField.getValue()).toBe("\\.(exe|zip)$");

      const restoreButton = page.getByTestId(
        "downloadLinkQualifierRestoreButton",
      );
      // Click restore button - click in a different position area to avoid margin issues.
      // When running in headless mode, clicking at center of the button sometimes misses.
      await restoreButton.click({ position: { x: 10, y: 10 } });

      expect(await downloadLinkQualifierField.getValue()).toBe(
        originalDownloadLinkQualifier,
      );
    });
  });

  describe("validation", () => {
    it("validates download link qualifier regex format", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              downloadLinkQualifier: "[(invalid regex",
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);

      // The field should show validation error for invalid regex
      expect(await extensionBridge.validate()).toBe(false);
    });

    it("accepts valid download link qualifier regex", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              downloadLinkQualifier: "\\.(pdf|doc)$",
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);
    });

    it("requires download link qualifier when download link is enabled", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              downloadLinkQualifier: "",
              clickCollection: {
                downloadLinkEnabled: true,
              },
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);

      // Clear the qualifier field
      const downloadLinkQualifierField = spectrumTextField(
        "downloadLinkQualifierField",
      );
      await downloadLinkQualifierField.fill("");

      expect(await extensionBridge.validate()).toBe(false);
    });
  });
});
