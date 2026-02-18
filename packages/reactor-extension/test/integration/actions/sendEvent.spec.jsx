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
import SendEventView from "../../../src/view/actions/sendEventView";
import { spectrumRadio } from "../helpers/form";

let extensionBridge;

describe("Send Event Action", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  describe("Component visibility based on configuration", () => {
    it("hides advertising section when advertising component is not enabled", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {}, // advertising not enabled
        },
      });

      // Verify disabled component alert is shown
      await expect
        .element(
          view.getByText("enable the Advertising component in the custom"),
        )
        .toBeVisible();

      // The Advertising section header IS visible, but fields are hidden
      await expect
        .element(view.getByRole("heading", { name: /Advertising/ }))
        .toBeVisible();
    });

    it("shows advertising section when advertising component is enabled", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {
            advertising: true, // advertising explicitly enabled
          },
        },
      });

      // Verify advertising section header IS visible
      await expect
        .element(view.getByRole("heading", { name: /Advertising/ }))
        .toBeVisible();

      // Verify advertising field is visible
      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      // Verify disabled alert is NOT shown
      await expect
        .element(
          view.getByText("enable the Advertising component in the custom"),
        )
        .not.toBeInTheDocument();
    });

    it("hides advertising section when advertising component is explicitly disabled", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {
            advertising: false, // advertising explicitly disabled
          },
        },
      });

      // Verify disabled component alert is shown
      await expect
        .element(
          view.getByText("enable the Advertising component in the custom"),
        )
        .toBeVisible();

      // The Advertising section header IS visible, but fields are hidden
      await expect
        .element(view.getByRole("heading", { name: /Advertising/ }))
        .toBeVisible();
    });

    it("shows personalization section by default (default component)", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {}, // no explicit settings
        },
      });

      // Verify personalization section header IS visible
      await expect
        .element(view.getByRole("heading", { name: /Personalization/ }))
        .toBeVisible();

      // Verify disabled alert is NOT shown
      await expect
        .element(
          view.getByText("enable the Personalization component in the custom"),
        )
        .not.toBeInTheDocument();
    });

    it("hides personalization section when explicitly disabled", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: {
            personalization: false, // explicitly disabled
          },
        },
      });

      // Verify personalization section header IS visible
      await expect
        .element(view.getByRole("heading", { name: /Personalization/ }))
        .toBeVisible();

      // Verify disabled alert IS shown (checking first occurrence)
      await expect
        .element(
          view
            .getByText("enable the Personalization component in the custom")
            .first(),
        )
        .toBeVisible();
    });
  });

  describe("Advertising settings functionality", () => {
    it("initializes with default disabled value", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      // Verify "Disabled" is selected by default
      const disabledRadio = spectrumRadio(
        "handleAdvertisingDatadisabledOption",
      );
      expect(await disabledRadio.isSelected()).toBe(true);
    });

    it("does not save advertising settings when default disabled value is selected", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      // Keep default "disabled" selection
      const settings = await extensionBridge.getSettings();

      // Advertising should not be in settings when using default value
      expect(settings.advertising).toBeUndefined();
    });

    it("saves advertising settings when automatic is selected", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      // Select "Automatic"
      const autoRadio = spectrumRadio("handleAdvertisingDataautoOption");
      await autoRadio.click();

      const settings = await extensionBridge.getSettings();

      expect(settings.advertising).toBeDefined();
      expect(settings.advertising.handleAdvertisingData).toBe("auto");
    });

    it("saves advertising settings when wait is selected", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      // Select "Wait"
      const waitRadio = spectrumRadio("handleAdvertisingDatawaitOption");
      await waitRadio.click();

      const settings = await extensionBridge.getSettings();

      expect(settings.advertising).toBeDefined();
      expect(settings.advertising.handleAdvertisingData).toBe("wait");
    });

    it("loads existing advertising settings - automatic", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
        settings: {
          advertising: {
            handleAdvertisingData: "auto",
          },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      // Verify "Automatic" is selected
      const autoRadio = spectrumRadio("handleAdvertisingDataautoOption");
      expect(await autoRadio.isSelected()).toBe(true);
    });

    it("loads existing advertising settings - wait", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
        settings: {
          advertising: {
            handleAdvertisingData: "wait",
          },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      // Verify "Wait" is selected
      const waitRadio = spectrumRadio("handleAdvertisingDatawaitOption");
      expect(await waitRadio.isSelected()).toBe(true);
    });

    it("removes advertising settings when switching back to disabled", async () => {
      const view = await renderView(SendEventView);

      extensionBridge.init({
        extensionSettings: {
          instances: [{ name: "alloy", edgeConfigId: "PR123" }],
          components: { advertising: true },
        },
        settings: {
          advertising: {
            handleAdvertisingData: "auto",
          },
        },
      });

      await expect
        .element(view.getByText("Request default Advertising data"))
        .toBeVisible();

      // Switch to disabled
      const disabledRadio = spectrumRadio(
        "handleAdvertisingDatadisabledOption",
      );
      await disabledRadio.click();

      const settings = await extensionBridge.getSettings();

      // Advertising should not be in settings when disabled
      expect(settings.advertising).toBeUndefined();
    });
  });
});
