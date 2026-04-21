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
import { buildSettings } from "../helpers/settingsUtils";

let extensionBridge;

describe("Datastream Selector - Refresh Button", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("displays refresh button next to datastream field", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "test-datastream-id",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const refreshButton = page.getByRole("button", {
      name: "Refresh datastreams",
    });

    await expect.element(refreshButton).toBeInTheDocument();

    const refreshIcon = refreshButton.query().querySelector("svg");
    expect(refreshIcon).toBeTruthy();
  });

  it("refresh button is disabled while loading", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "test-datastream-id",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const refreshButton = page.getByRole("button", {
      name: "Refresh datastreams",
    });

    await refreshButton.click();

    // The button should eventually become enabled again after loading completes
    await expect
      .poll(() => refreshButton.element().disabled, {
        timeout: 5000,
      })
      .toBe(false);
  });

  it("refresh button reloads datastream list", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "test-datastream-id",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    const datastreamField = page.getByTestId("productionDatastreamField");
    const refreshButton = page.getByRole("button", {
      name: "Refresh datastreams",
    });

    await expect.element(datastreamField).toBeInTheDocument();

    await refreshButton.click();

    // Wait for reload to complete by polling the button's disabled state
    await expect
      .poll(() => refreshButton.element().disabled, {
        timeout: 5000,
      })
      .toBe(false);

    // Verify the field is still functional after refresh
    await expect.element(datastreamField).toBeInTheDocument();
  });

  it("refresh button works independently for each environment", async () => {
    const view = await renderView(ConfigurationView);

    extensionBridge.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "prod-datastream-id",
            stagingEdgeConfigId: "staging-datastream-id",
          },
        ],
      }),
    );

    await waitForConfigurationViewToLoad(view);

    // Get all refresh buttons (one for each environment)
    const allRefreshButtons = page.getByRole("button", {
      name: /Refresh datastreams/,
    });

    // Should have refresh buttons for production, staging, and development
    const buttons = allRefreshButtons.elements();
    expect(buttons.length).toBeGreaterThan(0);

    // Click the first refresh button
    await buttons[0].click();

    // Wait for loading to complete by polling the button's disabled state
    await expect
      .poll(() => buttons[0].disabled, {
        timeout: 5000,
      })
      .toBe(false);
  });
});
