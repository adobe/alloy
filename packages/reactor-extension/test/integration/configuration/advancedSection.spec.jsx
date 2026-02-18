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
import { spectrumTextField } from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config advanced section", () => {
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
            edgeBasePath: "custom-path",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const edgeBasePathField = spectrumTextField("edgeBasePathField");
    expect(await edgeBasePathField.getValue()).toBe("custom-path");
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const edgeBasePathField = spectrumTextField("edgeBasePathField");
    await edgeBasePathField.fill("my-custom-path");

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeBasePath).toBe("my-custom-path");
  });

  it("shows default value 'ee' when no setting is provided", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const edgeBasePathField = spectrumTextField("edgeBasePathField");
    expect(await edgeBasePathField.getValue()).toBe("ee");
  });

  it("does not save default value 'ee' to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    // Default should be "ee" but not saved
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeBasePath).toBeUndefined();
  });

  it("allows data element in edge base path field", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeBasePath: "%myDataElement%",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const edgeBasePathField = spectrumTextField("edgeBasePathField");
    expect(await edgeBasePathField.getValue()).toBe("%myDataElement%");

    // Verify it's saved
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].edgeBasePath).toBe("%myDataElement%");
  });

  it("restores default edge base path when restore button is clicked", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const edgeBasePathField = spectrumTextField("edgeBasePathField");

    // Change the value
    await edgeBasePathField.fill("custom-path");

    // Verify it changed
    expect(await edgeBasePathField.getValue()).toBe("custom-path");

    // Click restore button
    const restoreButton = page.getByTestId("edgeBasePathRestoreButton");
    await restoreButton.click();

    // Verify it's restored to default
    expect(await edgeBasePathField.getValue()).toBe("ee");
  });

  describe("validation", () => {
    it("requires edge base path", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      // Clear the edge base path field
      const edgeBasePathField = spectrumTextField("edgeBasePathField");
      await edgeBasePathField.fill("");

      expect(await edgeBasePathField.hasError()).toBe(true);
      expect(await edgeBasePathField.getErrorMessage()).toBe(
        "Please specify an edge base path.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("accepts valid edge base path", async () => {
      const view = await renderView(ConfigurationView);

      extensionBridge.init(
        buildSettings({
          instances: [
            {
              name: "alloy",
              edgeBasePath: "custom-edge-path",
            },
          ],
        }),
      );

      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);
    });
  });
});
