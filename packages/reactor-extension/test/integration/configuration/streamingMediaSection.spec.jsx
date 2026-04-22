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
let mediaChannelField;
let mediaPlayerNameField;
let mediaVersionField;
let mediaAdPingIntervalField;
let mediaMainPingIntervalField;
let streamingMediaComponentCheckbox;

describe("Config streaming media section", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    ui = configurationUI(view);
    mediaChannelField = field(view.getByTestId("mediaChannelField"));
    mediaPlayerNameField = field(view.getByTestId("mediaPlayerNameField"));
    mediaVersionField = field(view.getByTestId("mediaVersionField"));
    mediaAdPingIntervalField = field(
      view.getByTestId("mediaAdPingIntervalField"),
    );
    mediaMainPingIntervalField = field(
      view.getByTestId("mediaMainPingIntervalField"),
    );
    streamingMediaComponentCheckbox = field(
      view.getByTestId("streamingMediaComponentCheckbox"),
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

    await mediaChannelField.expectValue("channel");
    await mediaPlayerNameField.expectValue("name");
    await mediaVersionField.expectValue("1.0");
    await mediaAdPingIntervalField.expectValue("8");
    await mediaMainPingIntervalField.expectValue("20");
  });

  it("updates form values and saves to settings", async () => {
    await driver.init(buildSettings());

    await mediaChannelField.fill("test-channel");
    await mediaPlayerNameField.fill("test-player");
    await mediaVersionField.fill("2.0");
    await mediaAdPingIntervalField.fill("5");
    await mediaMainPingIntervalField.fill("30");

    await driver
      .expectSettings((s) => s.instances[0].streamingMedia)
      .toMatchObject({
        channel: "test-channel",
        playerName: "test-player",
        appVersion: "2.0",
        adPingInterval: 5,
        mainPingInterval: 30,
      });
  });

  it("saves settings with only channel and player name provided", async () => {
    await driver.init(buildSettings());

    await mediaChannelField.fill("test-channel");
    await mediaPlayerNameField.fill("test-player");

    await driver
      .expectSettings((s) => s.instances[0].streamingMedia)
      .toMatchObject({
        channel: "test-channel",
        playerName: "test-player",
      });
  });

  it("shows alert panel when component is disabled", async () => {
    await driver.init(
      buildSettings({
        components: {
          streamingMedia: false,
        },
      }),
    );

    await expect
      .element(
        view.getByRole("heading", {
          name: /streaming media component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("hides form fields and shows alert when component is toggled off", async () => {
    await driver.init(buildSettings());
    await ui.expand("Build options");
    await streamingMediaComponentCheckbox.click();

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
      await driver.init(buildSettings());
      await driver.expectValidate().toBe(true);

      await mediaPlayerNameField.fill("test-player");
      await mediaChannelField.clear();

      await driver.expectValidate().toBe(false);

      await mediaChannelField.expectError(
        /please provide a channel name for streaming media/i,
      );
    });

    it("requires player name when channel is provided", async () => {
      await driver.init(buildSettings());
      await driver.expectValidate().toBe(true);

      await mediaChannelField.fill("test-channel");
      await mediaPlayerNameField.clear();

      await driver.expectValidate().toBe(false);

      await mediaPlayerNameField.expectError(
        /please provide a player name for streaming media/i,
      );
    });

    it("validates ad ping interval minimum value", async () => {
      await driver.init(buildSettings());
      await driver.expectValidate().toBe(true);

      await mediaChannelField.fill("test-channel");
      await mediaPlayerNameField.fill("test-player");
      await mediaAdPingIntervalField.fill("0");

      await driver.expectValidate().toBe(false);

      await mediaAdPingIntervalField.expectError(
        /the ad ping interval must be greater than 1 second/i,
      );
    });

    it("validates ad ping interval maximum value", async () => {
      await driver.init(buildSettings());
      await driver.expectValidate().toBe(true);

      await mediaChannelField.fill("test-channel");
      await mediaPlayerNameField.fill("test-player");
      await mediaAdPingIntervalField.fill("11");

      await driver.expectValidate().toBe(false);

      await mediaAdPingIntervalField.expectError(
        /the ad ping interval must be less than 10 seconds/i,
      );
    });

    it("validates main ping interval minimum value", async () => {
      await driver.init(buildSettings());
      await driver.expectValidate().toBe(true);

      await mediaChannelField.fill("test-channel");
      await mediaPlayerNameField.fill("test-player");
      await mediaMainPingIntervalField.fill("9");

      await driver.expectValidate().toBe(false);

      await mediaMainPingIntervalField.expectError(
        /the main ping interval must be greater than 10 seconds/i,
      );
    });

    it("validates main ping interval maximum value", async () => {
      await driver.init(buildSettings());
      await driver.expectValidate().toBe(true);

      await mediaChannelField.fill("test-channel");
      await mediaPlayerNameField.fill("test-player");
      await mediaMainPingIntervalField.fill("61");

      await driver.expectValidate().toBe(false);

      await mediaMainPingIntervalField.expectError(
        /the main ping interval must be less than 60 seconds/i,
      );
    });

    it("accepts valid ad ping interval values", async () => {
      await driver.init(buildSettings());
      await driver.expectValidate().toBe(true);

      await mediaChannelField.fill("test-channel");
      await mediaPlayerNameField.fill("test-player");
      await mediaAdPingIntervalField.fill("5");

      await driver.expectValidate().toBe(true);
    });

    it("accepts valid main ping interval values", async () => {
      await driver.init(buildSettings());
      await driver.expectValidate().toBe(true);

      await mediaChannelField.fill("test-channel");
      await mediaPlayerNameField.fill("test-player");
      await mediaMainPingIntervalField.fill("30");

      await driver.expectValidate().toBe(true);
    });

    it("disables interval fields when channel and player name are not provided", async () => {
      await driver.init(buildSettings());
      await driver.expectValidate().toBe(true);

      await mediaAdPingIntervalField.expectDisabled();
      await mediaMainPingIntervalField.expectDisabled();
    });
  });
});
