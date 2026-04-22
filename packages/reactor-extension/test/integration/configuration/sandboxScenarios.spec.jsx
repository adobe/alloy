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
import { worker } from "../helpers/mocks/browser";
import {
  singleSandboxNoDefaultHandlers,
  sandboxUserRegionMissingHandlers,
} from "../helpers/mocks/defaultHandlers";
import field from "../helpers/field";

let view;
let driver;
let cleanup;
let productionSandboxField;
let edgeConfigInputMethodSelectRadio;

describe("Config Sandboxes", () => {
  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    productionSandboxField = field(view.getByTestId("productionSandboxField"));
    edgeConfigInputMethodSelectRadio = field(
      view.getByTestId("edgeConfigInputMethodSelectRadio"),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("shows disabled sandbox dropdown when only one non default sandbox is returned", async () => {
    worker.use(...singleSandboxNoDefaultHandlers);
    await driver.init();

    await productionSandboxField.expectDisabled();
  });

  it("shows alert panel when user region is missing", async () => {
    worker.use(...sandboxUserRegionMissingHandlers);
    await driver.init();

    await edgeConfigInputMethodSelectRadio.click();

    await expect
      .element(
        view.getByRole("heading", {
          name: /you do not have enough permissions to fetch the organization configurations/i,
        }),
      )
      .toBeVisible();
  });
});
