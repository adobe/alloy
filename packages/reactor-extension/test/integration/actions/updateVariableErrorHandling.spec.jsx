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

import { describe, it, afterEach, expect } from "vitest";

import useView from "../helpers/useView";
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import { worker } from "../helpers/mocks/browser";
import {
  dataElementsUnauthorizedHandlers,
  dataElementsServerErrorHandlers,
  dataElementsEmptyHandlers,
} from "../helpers/mocks/defaultHandlers";
import field from "../helpers/field";
import { suppressReactErrorBoundaryMessage } from "../helpers/errorSuppression";

let view;
let driver;
let cleanup;

describe("Update Variable Action Error Handling", () => {
  afterEach(() => {
    if (cleanup) cleanup();
  });

  describe("Data elements API errors", () => {
    it("displays error when access token is invalid", async () => {
      worker.use(...dataElementsUnauthorizedHandlers);
      suppressReactErrorBoundaryMessage();
      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init();

      await expect
        .element(view.getByText(/your access token appears to be invalid/i))
        .toBeVisible();
    });

    it("displays error when data elements API returns server error", async () => {
      worker.use(...dataElementsServerErrorHandlers);
      suppressReactErrorBoundaryMessage();
      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init();

      await expect
        .element(view.getByText(/failed to load data elements/i))
        .toBeVisible();
    });

    it("shows no data elements alert when no variable data elements exist", async () => {
      worker.use(...dataElementsEmptyHandlers);
      ({ view, driver, cleanup } = await useView(UpdateVariableView));
      await driver.init();

      await field(view.getByTestId("noDataElements")).expectVisible();
    });
  });
});
