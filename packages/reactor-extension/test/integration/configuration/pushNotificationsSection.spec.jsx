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
import renderView from "../helpers/renderView";
import createExtensionBridge from "../helpers/createExtensionBridge";
import ConfigurationView from "../../../src/view/configuration/configurationView";
import { waitForConfigurationViewToLoad, toggleComponent } from "../helpers/ui";
import { spectrumTextField } from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config push notifications section", () => {
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
        components: {
          pushNotifications: true,
        },

        instances: [
          {
            name: "alloy",
            pushNotifications: {
              vapidPublicKey: "test-vapid-key",
              appId: "test-app-id",
              trackingDatasetId: "test-dataset-id",
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const vapidPublicKeyField = spectrumTextField("vapidPublicKeyField");
    expect(await vapidPublicKeyField.getValue()).toBe("test-vapid-key");

    const appIdField = spectrumTextField("appIdField");
    expect(await appIdField.getValue()).toBe("test-app-id");

    const trackingDatasetIdField = spectrumTextField("trackingDatasetIdField");
    expect(await trackingDatasetIdField.getValue()).toBe("test-dataset-id");
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          pushNotifications: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const vapidPublicKeyField = spectrumTextField("vapidPublicKeyField");
    await vapidPublicKeyField.fill("new-vapid-key");

    const appIdField = spectrumTextField("appIdField");
    await appIdField.fill("new-app-id");

    const trackingDatasetIdField = spectrumTextField("trackingDatasetIdField");
    await trackingDatasetIdField.fill("new-dataset-id");

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].pushNotifications).toMatchObject({
      vapidPublicKey: "new-vapid-key",
      appId: "new-app-id",
      trackingDatasetId: "new-dataset-id",
    });
  });

  it("does not emit push notifications settings when component is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          pushNotifications: true,
        },

        instances: [
          {
            name: "alloy",
            pushNotifications: {
              vapidPublicKey: "test-vapid-key",
              appId: "test-app-id",
              trackingDatasetId: "test-dataset-id",
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("pushNotifications");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].pushNotifications).toBeUndefined();
  });

  it("shows alert panel when push notifications component is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());
    await waitForConfigurationViewToLoad(view);

    await expect
      .element(
        view.getByRole("heading", {
          name: /push notifications component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("hides form fields and shows alert when component is toggled off", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          pushNotifications: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("pushNotifications");

    // Should now show alert panel
    await expect
      .element(
        view.getByRole("heading", {
          name: /push notifications component disabled/i,
        }),
      )
      .toBeVisible();
  });

  describe("validation", () => {
    it("requires VAPID public key", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);
      expect(await extensionBridge.validate()).toBe(true);
      await toggleComponent("pushNotifications");

      const appIdField = spectrumTextField("appIdField");
      await appIdField.fill("test-app-id");

      const trackingDatasetIdField = spectrumTextField(
        "trackingDatasetIdField",
      );
      await trackingDatasetIdField.fill("test-dataset-id");

      const vapidPublicKeyField = spectrumTextField("vapidPublicKeyField");
      // Touch the field to trigger validation
      await vapidPublicKeyField.fill("");

      expect(await vapidPublicKeyField.hasError()).toBe(true);
      expect(await vapidPublicKeyField.getErrorMessage()).toBe(
        "Please provide a VAPID public key.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("requires application ID", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);
      expect(await extensionBridge.validate()).toBe(true);
      await toggleComponent("pushNotifications");

      const vapidPublicKeyField = spectrumTextField("vapidPublicKeyField");
      await vapidPublicKeyField.fill("test-vapid-key");

      const trackingDatasetIdField = spectrumTextField(
        "trackingDatasetIdField",
      );
      await trackingDatasetIdField.fill("test-dataset-id");

      const appIdField = spectrumTextField("appIdField");
      // Touch the field to trigger validation
      await appIdField.fill("");

      expect(await appIdField.hasError()).toBe(true);
      expect(await appIdField.getErrorMessage()).toBe(
        "Please provide an Application ID.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("requires tracking dataset ID", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());

      await waitForConfigurationViewToLoad(view);
      expect(await extensionBridge.validate()).toBe(true);
      await toggleComponent("pushNotifications");

      const vapidPublicKeyField = spectrumTextField("vapidPublicKeyField");
      await vapidPublicKeyField.fill("test-vapid-key");

      const appIdField = spectrumTextField("appIdField");
      await appIdField.fill("test-app-id");

      const trackingDatasetIdField = spectrumTextField(
        "trackingDatasetIdField",
      );
      // Touch the field to trigger validation
      await trackingDatasetIdField.fill("");

      expect(await trackingDatasetIdField.hasError()).toBe(true);
      expect(await trackingDatasetIdField.getErrorMessage()).toBe(
        "Please provide a Tracking Dataset ID.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });
  });
});
