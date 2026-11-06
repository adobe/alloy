/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, beforeEach, afterEach, expect } from "vitest";
import VariableView from "../../../src/view/dataElements/variableView";
import useView from "../helpers/useView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import {
  extensionSettings,
  schemaSettings,
  schemaHandlers,
  solutions,
  reinitialize,
} from "../helpers/dataElementsSnapshot";

let view;
let bridge;
let driver;
let cleanup;

describe("Variable settings snapshots", () => {
  beforeEach(async () => {
    worker.use(...schemaHandlers);
    ({ view, bridge, driver, cleanup } = await useView(VariableView));
  });

  afterEach(() => cleanup());

  it("round trips schema without sandbox settings", async () => {
    await driver.init({
      extensionSettings,
      settings: { schema: schemaSettings.schema },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
    await reinitialize(driver, {
      solutions: ["analytics", "audienceManager", "target"],
    });
    await driver.expectSettings().toEqual({ solutions });
    await field(view.getByTestId("audiencemanagerCheckbox")).expectChecked();
    const registration = await bridge.registration;
    expect(await registration.validate()).toBe(true);
    await driver.expectSettings().toEqual({ solutions });
  });

  it("round trips untouched empty solutions settings", async () => {
    await driver.init({ extensionSettings, settings: { solutions: [] } });
    expect(await captureState(bridge)).toMatchSnapshot();
    await expect
      .element(view.getByText("Please select at least one Adobe solution."))
      .toBeVisible();
  });

  it("unchecks all solutions while the last checkbox keeps focus", async () => {
    await driver.init({ extensionSettings, settings: { solutions } });
    await field(view.getByTestId("analyticsCheckbox")).uncheck();
    await field(view.getByTestId("audiencemanagerCheckbox")).uncheck();
    await field(view.getByTestId("targetCheckbox")).uncheck();
    await expect
      .element(view.getByRole("checkbox", { name: "Adobe Target" }))
      .toHaveFocus();
    expect(await captureState(bridge)).toMatchSnapshot();
    await expect
      .element(view.getByText("Please select at least one Adobe solution."))
      .toBeVisible();
    await field(view.getByTestId("analyticsCheckbox")).check();
    await driver.expectSettings().toEqual({ solutions: ["analytics"] });
    await field(view.getByTestId("xdmRadioButton")).check();
    await field(view.getByTestId("schemaField")).expectValue("Test Schema 1");
    await driver.expectSettings().toEqual(schemaSettings);
    await field(view.getByTestId("dataRadioButton")).check();
    await driver.expectSettings().toEqual({ solutions: ["analytics"] });
  });
});
