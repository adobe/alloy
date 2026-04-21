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
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import { worker } from "../helpers/mocks/browser";
import {
  dataElementsUnauthorizedHandlers,
  dataElementsServerErrorHandlers,
  dataElementsEmptyHandlers,
} from "../helpers/mocks/defaultHandlers";

let extensionBridge;

describe("Update Variable Action Error Handling", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  describe("Data elements API errors", () => {
    it("displays error when access token is invalid", async () => {
      worker.use(...dataElementsUnauthorizedHandlers);
      const view = await renderView(UpdateVariableView);
      extensionBridge.init();

      await expect
        .element(view.getByText(/your access token appears to be invalid/i))
        .toBeVisible();
    });

    it("displays error when data elements API returns server error", async () => {
      worker.use(...dataElementsServerErrorHandlers);
      const view = await renderView(UpdateVariableView);
      extensionBridge.init();

      await expect
        .element(view.getByText(/failed to load data elements/i))
        .toBeVisible();
    });

    it("shows no data elements alert when no variable data elements exist", async () => {
      worker.use(...dataElementsEmptyHandlers);
      const view = await renderView(UpdateVariableView);
      extensionBridge.init();

      await expect.element(view.getByTestId("noDataElements")).toBeVisible();
    });
  });
});
