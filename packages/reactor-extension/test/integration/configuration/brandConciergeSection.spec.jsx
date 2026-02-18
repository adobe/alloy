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
import { spectrumCheckbox, spectrumNumberField } from "../helpers/form";
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Config brand concierge section", () => {
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
          brandConcierge: true,
        },
        instances: [
          {
            name: "alloy",
            conversation: {
              stickyConversationSession: true,
              streamTimeout: 20000, // 20 seconds in milliseconds
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const stickyConversationSessionField = spectrumCheckbox(
      "stickyConversationSessionField",
    );
    expect(await stickyConversationSessionField.isChecked()).toBe(true);

    // Stream timeout should be displayed in seconds (20000ms = 20s)
    const streamTimeoutField = spectrumNumberField("streamTimeoutDataTestId");
    expect(await streamTimeoutField.getNumericValue()).toBe(20);
  });

  it("updates form values and saves to settings", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const stickyConversationSessionField = spectrumCheckbox(
      "stickyConversationSessionField",
    );
    await stickyConversationSessionField.check();

    // Set stream timeout to 30 seconds (should save as 30000ms)
    const streamTimeoutField = spectrumNumberField("streamTimeoutDataTestId");
    await streamTimeoutField.fill(30);

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].conversation.stickyConversationSession).toBe(
      true,
    );
    // Should be saved as milliseconds (30s = 30000ms)
    expect(settings.instances[0].conversation.streamTimeout).toBe(30000);
  });

  it("does not emit brand concierge settings when component is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
        instances: [
          {
            name: "alloy",
            conversation: {
              stickyConversationSession: true,
              streamTimeout: 15000,
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("brandConcierge");

    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].conversation).toBeUndefined();
  });

  it("shows alert panel when brand concierge component is disabled", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(buildSettings());
    await waitForConfigurationViewToLoad(view);

    await expect
      .element(
        view.getByRole("heading", {
          name: /brand concierge component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("shows alert when component is toggled off", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);
    await toggleComponent("brandConcierge");

    await expect
      .element(
        view.getByRole("heading", {
          name: /brand concierge component disabled/i,
        }),
      )
      .toBeVisible();
  });

  it("converts stream timeout from milliseconds to seconds on load", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
        instances: [
          {
            name: "alloy",
            conversation: {
              streamTimeout: 45000, // 45 seconds in milliseconds
            },
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const streamTimeoutField = spectrumNumberField("streamTimeoutDataTestId");
    expect(await streamTimeoutField.getNumericValue()).toBe(45);
  });

  it("does not save stream timeout when it equals default value", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        components: {
          brandConcierge: true,
        },
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Default is 10 seconds, don't change it
    const settings = await extensionBridge.getSettings();
    expect(settings.instances[0].conversation?.streamTimeout).toBeUndefined();
  });
});
