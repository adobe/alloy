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
import { spectrumCheckbox } from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config components section", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("has all necessary components enabled by default", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    const settings = await extensionBridge.getSettings();

    // Only non-default components should be in settings (eventMerge is deprecated/not default)
    expect(settings.components).toEqual({
      eventMerge: false,
    });
  });

  it("tracks disabled state for components enabled by default", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    // Toggle off consent and personalization components
    await toggleComponent("consent");
    await toggleComponent("personalization");

    const settings = await extensionBridge.getSettings();

    expect(settings.components).toBeDefined();
    expect(settings.components.personalization).toBe(false);
    expect(settings.components.consent).toBe(false);
  });

  it("restores disabled components from settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          personalization: false,
          consent: false,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Verify checkboxes are unchecked
    const personalizationCheckbox = spectrumCheckbox(
      "personalizationComponentCheckbox",
    );
    expect(await personalizationCheckbox.isChecked()).toBe(false);

    const consentCheckbox = spectrumCheckbox("consentComponentCheckbox");
    expect(await consentCheckbox.isChecked()).toBe(false);
  });

  it("does not include new components when creating a new configuration", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    // Verify new beta components are unchecked
    const pushNotificationsCheckbox = spectrumCheckbox(
      "pushNotificationsComponentCheckbox",
    );
    expect(await pushNotificationsCheckbox.isChecked()).toBe(false);

    const advertisingCheckbox = spectrumCheckbox(
      "advertisingComponentCheckbox",
    );
    expect(await advertisingCheckbox.isChecked()).toBe(false);

    const settings = await extensionBridge.getSettings();
    expect(settings.components).toBeDefined();
    // Only eventMerge is saved as false (it's deprecated/not default)
    // Other beta components are not saved if they match their default (false)
    expect(settings.components.eventMerge).toBe(false);
  });

  it("does not include new components when upgrading existing configuration", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          eventMerge: false,
        },
        instances: [
          {
            name: "alloy1",
            edgeConfigId: "PR123",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Verify new beta components are unchecked
    const pushNotificationsCheckbox = spectrumCheckbox(
      "pushNotificationsComponentCheckbox",
    );
    expect(await pushNotificationsCheckbox.isChecked()).toBe(false);

    const advertisingCheckbox = spectrumCheckbox(
      "advertisingComponentCheckbox",
    );
    expect(await advertisingCheckbox.isChecked()).toBe(false);

    const settings = await extensionBridge.getSettings();
    expect(settings.components).toBeDefined();
    expect(settings.components.eventMerge).toBe(false);
  });

  it("enables default components by default for new configuration", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    // Verify default components are checked
    const activityCollectorCheckbox = spectrumCheckbox(
      "activityCollectorComponentCheckbox",
    );
    expect(await activityCollectorCheckbox.isChecked()).toBe(true);

    const audiencesCheckbox = spectrumCheckbox("audiencesComponentCheckbox");
    expect(await audiencesCheckbox.isChecked()).toBe(true);

    const consentCheckbox = spectrumCheckbox("consentComponentCheckbox");
    expect(await consentCheckbox.isChecked()).toBe(true);

    const personalizationCheckbox = spectrumCheckbox(
      "personalizationComponentCheckbox",
    );
    expect(await personalizationCheckbox.isChecked()).toBe(true);

    const rulesEngineCheckbox = spectrumCheckbox(
      "rulesEngineComponentCheckbox",
    );
    expect(await rulesEngineCheckbox.isChecked()).toBe(true);

    const streamingMediaCheckbox = spectrumCheckbox(
      "streamingMediaComponentCheckbox",
    );
    expect(await streamingMediaCheckbox.isChecked()).toBe(true);

    const mediaAnalyticsBridgeCheckbox = spectrumCheckbox(
      "mediaAnalyticsBridgeComponentCheckbox",
    );
    expect(await mediaAnalyticsBridgeCheckbox.isChecked()).toBe(true);
  });

  it("allows toggling components on and off", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    // Toggle off a component
    await toggleComponent("audiences");

    let settings = await extensionBridge.getSettings();
    expect(settings.components.audiences).toBe(false);

    // Toggle it back on
    await toggleComponent("audiences");

    settings = await extensionBridge.getSettings();
    expect(settings.components.audiences).toBeUndefined();
  });

  it("allows enabling beta components", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    // Enable advertising component
    await toggleComponent("advertising");

    const settings = await extensionBridge.getSettings();
    expect(settings.components.advertising).toBe(true);

    // Verify checkbox is checked
    const advertisingCheckbox = spectrumCheckbox(
      "advertisingComponentCheckbox",
    );
    expect(await advertisingCheckbox.isChecked()).toBe(true);
  });

  it("preserves enabled beta components from settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          advertising: true,
          pushNotifications: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Verify beta components are checked
    const advertisingCheckbox = spectrumCheckbox(
      "advertisingComponentCheckbox",
    );
    expect(await advertisingCheckbox.isChecked()).toBe(true);

    const pushNotificationsCheckbox = spectrumCheckbox(
      "pushNotificationsComponentCheckbox",
    );
    expect(await pushNotificationsCheckbox.isChecked()).toBe(true);

    const settings = await extensionBridge.getSettings();
    expect(settings.components.advertising).toBe(true);
    expect(settings.components.pushNotifications).toBe(true);
  });

  it("allows disabling all components", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    // Disable all default components
    await toggleComponent("activityCollector");
    await toggleComponent("audiences");
    await toggleComponent("consent");
    await toggleComponent("personalization");
    await toggleComponent("rulesEngine");
    await toggleComponent("streamingMedia");
    await toggleComponent("mediaAnalyticsBridge");

    const settings = await extensionBridge.getSettings();
    expect(settings.components).toBeDefined();
    expect(settings.components.activityCollector).toBe(false);
    expect(settings.components.audiences).toBe(false);
    expect(settings.components.consent).toBe(false);
    expect(settings.components.personalization).toBe(false);
    expect(settings.components.rulesEngine).toBe(false);
    expect(settings.components.streamingMedia).toBe(false);
    expect(settings.components.mediaAnalyticsBridge).toBe(false);
  });

  it("handles deprecated components correctly", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    // eventMerge is deprecated and should be disabled by default for new configs
    const eventMergeCheckbox = spectrumCheckbox("eventMergeComponentCheckbox");
    expect(await eventMergeCheckbox.isChecked()).toBe(false);

    const settings = await extensionBridge.getSettings();
    expect(settings.components.eventMerge).toBe(false);
  });

  it("preserves deprecated components from existing configuration", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          eventMerge: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Verify deprecated component is enabled from settings
    const eventMergeCheckbox = spectrumCheckbox("eventMergeComponentCheckbox");
    expect(await eventMergeCheckbox.isChecked()).toBe(true);

    const settings = await extensionBridge.getSettings();
    // When eventMerge is true (its default value), it won't be in settings
    // because only non-default values are saved
    expect(settings.components).toBeUndefined();
  });

  it("only saves non-default component states to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    // All default components are enabled, so no explicit component settings
    const settings = await extensionBridge.getSettings();

    // The settings should only contain non-default values
    // eventMerge is deprecated (not default), so it's saved as false
    expect(settings.components).toBeDefined();
    expect(settings.components.eventMerge).toBe(false);

    // Default components should not be in settings when enabled
    expect(settings.components.activityCollector).toBeUndefined();
    expect(settings.components.audiences).toBeUndefined();
    expect(settings.components.consent).toBeUndefined();
  });
});
