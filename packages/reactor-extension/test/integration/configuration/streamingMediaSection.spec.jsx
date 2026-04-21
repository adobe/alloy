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
import { spectrumTextField, spectrumNumberField } from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config streaming media section", () => {
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
            streamingMedia: {
              channel: "channel",
              playerName: "name",
              appVersion: "1.0",
              adPingInterval: 8,
              mainPingInterval: 20,
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const channelField = spectrumTextField("mediaChannelField");
    expect(await channelField.getValue()).toBe("channel");

    const playerNameField = spectrumTextField("mediaPlayerNameField");
    expect(await playerNameField.getValue()).toBe("name");

    const appVersionField = spectrumTextField("mediaVersionField");
    expect(await appVersionField.getValue()).toBe("1.0");

    const adPingIntervalField = spectrumNumberField("mediaAdPingIntervalField");
    expect(await adPingIntervalField.getNumericValue()).toBe(8);

    const mainPingIntervalField = spectrumNumberField(
      "mediaMainPingIntervalField",
    );
    expect(await mainPingIntervalField.getNumericValue()).toBe(20);
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const channelField = spectrumTextField("mediaChannelField");
    await channelField.fill("test-channel");

    const playerNameField = spectrumTextField("mediaPlayerNameField");
    await playerNameField.fill("test-player");

    const appVersionField = spectrumTextField("mediaVersionField");
    await appVersionField.fill("2.0");

    const adPingIntervalField = spectrumNumberField("mediaAdPingIntervalField");
    await adPingIntervalField.fill("5");

    const mainPingIntervalField = spectrumNumberField(
      "mediaMainPingIntervalField",
    );
    await mainPingIntervalField.fill("30");

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].streamingMedia).toMatchObject({
      channel: "test-channel",
      playerName: "test-player",
      appVersion: "2.0",
      adPingInterval: 5,
      mainPingInterval: 30,
    });
  });

  it("saves settings with only channel and player name provided", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());

    await waitForConfigurationViewToLoad(view);

    const channelField = spectrumTextField("mediaChannelField");
    await channelField.fill("test-channel");

    const playerNameField = spectrumTextField("mediaPlayerNameField");
    await playerNameField.fill("test-player");

    // Get settings and verify
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].streamingMedia).toMatchObject({
      channel: "test-channel",
      playerName: "test-player",
    });
  });

  it("shows alert panel when component is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          streamingMedia: false,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    await expect
      .element(
        view.getByRole("heading", {
          name: /streaming media component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("hides form fields and shows alert when component is toggled off", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());
    await waitForConfigurationViewToLoad(view);
    await toggleComponent("streamingMedia");

    // Should now show alert panel
    await expect
      .element(
        view.getByRole("heading", {
          name: /streaming media component disabled/i,
        }),
      )
      .toBeVisible();
  });

  describe("validation", () => {
    it("requires channel when player name is provided", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());
      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const playerNameField = spectrumTextField("mediaPlayerNameField");
      await playerNameField.fill("test-player");

      const channelField = spectrumTextField("mediaChannelField");
      // Touch the channel field to trigger validation
      await channelField.fill("");

      expect(await channelField.hasError()).toBe(true);
      expect(await channelField.getErrorMessage()).toBe(
        "Please provide a channel name for streaming media.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("requires player name when channel is provided", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());
      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const channelField = spectrumTextField("mediaChannelField");
      await channelField.fill("test-channel");

      const playerNameField = spectrumTextField("mediaPlayerNameField");
      // Touch the player name field to trigger validation
      await playerNameField.fill("");

      expect(await playerNameField.hasError()).toBe(true);
      expect(await playerNameField.getErrorMessage()).toBe(
        "Please provide a player name for streaming media.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates ad ping interval minimum value", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());
      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const channelField = spectrumTextField("mediaChannelField");
      await channelField.fill("test-channel");

      const playerNameField = spectrumTextField("mediaPlayerNameField");
      await playerNameField.fill("test-player");

      const adPingIntervalField = spectrumNumberField(
        "mediaAdPingIntervalField",
      );
      await adPingIntervalField.fill("0");

      expect(await adPingIntervalField.hasError()).toBe(true);
      expect(await adPingIntervalField.getErrorMessage()).toBe(
        "The Ad Ping Interval must be greater than 1 second.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates ad ping interval maximum value", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());
      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const channelField = spectrumTextField("mediaChannelField");
      await channelField.fill("test-channel");

      const playerNameField = spectrumTextField("mediaPlayerNameField");
      await playerNameField.fill("test-player");

      const adPingIntervalField = spectrumNumberField(
        "mediaAdPingIntervalField",
      );
      await adPingIntervalField.fill("11");

      expect(await adPingIntervalField.hasError()).toBe(true);
      expect(await adPingIntervalField.getErrorMessage()).toBe(
        "The Ad Ping Interval must be less than 10 seconds.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates main ping interval minimum value", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());
      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const channelField = spectrumTextField("mediaChannelField");
      await channelField.fill("test-channel");

      const playerNameField = spectrumTextField("mediaPlayerNameField");
      await playerNameField.fill("test-player");

      const mainPingIntervalField = spectrumNumberField(
        "mediaMainPingIntervalField",
      );
      await mainPingIntervalField.fill("9");

      expect(await mainPingIntervalField.hasError()).toBe(true);
      expect(await mainPingIntervalField.getErrorMessage()).toBe(
        "The Main Ping Interval must be greater than 10 seconds.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("validates main ping interval maximum value", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());
      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const channelField = spectrumTextField("mediaChannelField");
      await channelField.fill("test-channel");

      const playerNameField = spectrumTextField("mediaPlayerNameField");
      await playerNameField.fill("test-player");

      const mainPingIntervalField = spectrumNumberField(
        "mediaMainPingIntervalField",
      );
      await mainPingIntervalField.fill("61");

      expect(await mainPingIntervalField.hasError()).toBe(true);
      expect(await mainPingIntervalField.getErrorMessage()).toBe(
        "The Main Ping Interval must be less than 60 seconds.",
      );

      expect(await extensionBridge.validate()).toBe(false);
    });

    it("accepts valid ad ping interval values", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());
      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const channelField = spectrumTextField("mediaChannelField");
      await channelField.fill("test-channel");

      const playerNameField = spectrumTextField("mediaPlayerNameField");
      await playerNameField.fill("test-player");

      const adPingIntervalField = spectrumNumberField(
        "mediaAdPingIntervalField",
      );
      await adPingIntervalField.fill("5");

      expect(await adPingIntervalField.hasError()).toBe(false);
      expect(await extensionBridge.validate()).toBe(true);
    });

    it("accepts valid main ping interval values", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());
      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const channelField = spectrumTextField("mediaChannelField");
      await channelField.fill("test-channel");

      const playerNameField = spectrumTextField("mediaPlayerNameField");
      await playerNameField.fill("test-player");

      const mainPingIntervalField = spectrumNumberField(
        "mediaMainPingIntervalField",
      );
      await mainPingIntervalField.fill("30");

      expect(await mainPingIntervalField.hasError()).toBe(false);
      expect(await extensionBridge.validate()).toBe(true);
    });

    it("disables interval fields when channel and player name are not provided", async () => {
      const view = await renderView(ConfigurationView);
      extensionBridge.init(buildSettings());
      await waitForConfigurationViewToLoad(view);

      expect(await extensionBridge.validate()).toBe(true);

      const adPingIntervalField = spectrumNumberField(
        "mediaAdPingIntervalField",
      );
      const mainPingIntervalField = spectrumNumberField(
        "mediaMainPingIntervalField",
      );

      expect(await adPingIntervalField.isDisabled()).toBe(true);
      expect(await mainPingIntervalField.isDisabled()).toBe(true);
    });
  });
});
