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
import VariableView from "../../../src/view/dataElements/variableView";
import { worker } from "../helpers/mocks/browser";
import {
  sandboxUnauthorizedHandlers,
  sandboxServerErrorHandlers,
  sandboxEmptyHandlers,
  schemasServerErrorHandlers,
} from "../helpers/mocks/defaultHandlers";

let extensionBridge;

describe("Variable Data Element Error Handling", () => {
  beforeEach(() => {
    extensionBridge = createExtensionBridge();
    window.extensionBridge = extensionBridge;
  });

  afterEach(() => {
    delete window.extensionBridge;
  });

  describe("Sandbox errors", () => {
    it("displays error when access token is invalid", async () => {
      worker.use(...sandboxUnauthorizedHandlers);
      const view = await renderView(VariableView);
      extensionBridge.init();

      await expect
        .element(view.getByText(/your access token appears to be invalid/i))
        .toBeVisible();
    });

    it("displays error when sandbox API returns server error", async () => {
      worker.use(...sandboxServerErrorHandlers);
      const view = await renderView(VariableView);
      extensionBridge.init();

      await expect
        .element(view.getByText(/failed to load sandboxes/i))
        .toBeVisible();
    });

    it("displays error when user has no access to any sandboxes", async () => {
      worker.use(...sandboxEmptyHandlers);
      const view = await renderView(VariableView);
      extensionBridge.init();

      await expect
        .element(view.getByText(/you do not have access to any sandboxes/i))
        .toBeVisible();
    });
  });

  describe("Schema errors", () => {
    it("gracefully handles schema list API error", async () => {
      worker.use(...schemasServerErrorHandlers);
      const view = await renderView(VariableView);
      extensionBridge.init();

      const schemaField = view.getByTestId("schemaField");
      await expect.element(schemaField).toBeVisible();
    });
  });
});
