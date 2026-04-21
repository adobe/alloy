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
import { worker } from "../helpers/mocks/browser";
import { spectrumRadio } from "../helpers/form";
import {
  singleSandboxNoDefaultHandlers,
  sandboxUserRegionMissingHandlers,
} from "../helpers/mocks/defaultHandlers";

let extensionBridge;

describe("Config Sandboxes", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  it("shows disabled sandbox dropdown when only one non default sandbox is returned", async () => {
    worker.use(...singleSandboxNoDefaultHandlers);
    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    const sandboxSelect = page.getByTestId("productionSandboxField");
    await expect.element(sandboxSelect).toBeDisabled();
  });

  it("shows alert panel when user region is missing", async () => {
    worker.use(...sandboxUserRegionMissingHandlers);

    const view = await renderView(ConfigurationView);

    extensionBridge.init();

    await waitForConfigurationViewToLoad(view);

    const selectRadio = spectrumRadio("edgeConfigInputMethodSelectRadio");
    await selectRadio.click();

    await expect
      .element(
        view.getByRole("heading", {
          name: /you do not have enough permissions to fetch the organization configurations/i,
        }),
      )
      .toBeVisible();
  });
});
