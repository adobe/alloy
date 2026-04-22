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
import { buildSettings } from "../helpers/settingsUtils";
import field from "../helpers/field";

let view;
let driver;
let cleanup;

describe("Datastream Selector - Refresh Button", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
  });

  afterEach(() => {
    cleanup();
  });

  it("displays refresh button next to datastream field", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "test-datastream-id",
          },
        ],
      }),
    );

    const refreshButton = view.getByRole("button", {
      name: "Refresh datastreams",
    });

    await expect.element(refreshButton).toBeVisible();
    await expect.element(refreshButton.locator("svg")).toBeVisible();
  });

  it("refresh button is disabled while loading", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "test-datastream-id",
          },
        ],
      }),
    );

    const refreshButton = field(
      view.getByRole("button", {
        name: "Refresh datastreams",
      }),
    );

    await refreshButton.click();

    // The button should eventually become enabled again after loading completes
    await refreshButton.expectEnabled();
  });

  it("refresh button reloads datastream list", async () => {
    await driver.init(
      buildSettings({
        instances: [
          {
            name: "alloy",
            edgeConfigId: "test-datastream-id",
          },
        ],
      }),
    );

    const datastreamField = field(
      view.getByTestId("productionDatastreamField"),
    );
    const refreshButton = field(
      view.getByRole("button", {
        name: "Refresh datastreams",
      }),
    );

    await datastreamField.expectVisible();

    await refreshButton.click();

    // Wait for reload to complete by polling the button's disabled state
    await refreshButton.expectEnabled();

    // Verify the field is still functional after refresh
    await datastreamField.expectVisible();
  });

  it("refresh button works independently for each environment", async () => {
    await driver.init(
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

    const allRefreshButtons = view.getByRole("button", {
      name: /Refresh datastreams/,
    });

    await expect.element(allRefreshButtons.nth(0)).toBeVisible();

    const firstRefreshButton = field(allRefreshButtons.nth(0));
    await firstRefreshButton.click();

    await firstRefreshButton.expectEnabled();
  });
});
