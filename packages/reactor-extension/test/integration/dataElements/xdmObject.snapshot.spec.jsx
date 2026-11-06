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
import { userEvent } from "vitest/browser";
import XdmObjectView from "../../../src/view/dataElements/xdmObjectView";
import useView from "../helpers/useView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import {
  extensionSettings,
  schemaSettings,
  schemaHandlers,
  xdmData,
  selectTreeNode,
  reinitialize,
} from "../helpers/dataElementsSnapshot";

const populated = { ...schemaSettings, data: xdmData };
let view;
let bridge;
let driver;
let cleanup;

describe("XDM object settings snapshots", () => {
  beforeEach(async () => {
    worker.use(...schemaHandlers);
    ({ view, bridge, driver, cleanup } = await useView(XdmObjectView));
  });

  afterEach(() => cleanup());

  it("round trips schema without sandbox settings", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        schema: schemaSettings.schema,
        data: { testField: "Legacy" },
      },
    });
    await field(view.getByTestId("schemaField")).expectValue("Test Schema 1");
    expect(await captureState(bridge)).toMatchSnapshot();
    await reinitialize(driver, { ...schemaSettings, data: { count: -1 } });
    await driver
      .expectSettings()
      .toEqual({ ...schemaSettings, data: { count: -1 } });
    const registration = await bridge.registration;
    // Main ignores the schema's minimum: 0 constraint.
    expect(await registration.validate()).toBe(true);
    await driver
      .expectSettings()
      .toEqual({ ...schemaSettings, data: { count: -1 } });
    await reinitialize(driver, { ...schemaSettings, data: "%object%" });
    await driver
      .expectSettings()
      .toEqual({ ...schemaSettings, data: "%object%" });
    expect(await registration.validate()).toBe(true);
    await driver
      .expectSettings()
      .toEqual({ ...schemaSettings, data: "%object%" });
    await reinitialize(driver, null);
    await field(view.getByTestId("schemaField")).expectValue("Test Schema 1");
    await driver.expectSettings().toEqual({ ...schemaSettings, data: {} });
    expect(await registration.validate()).toBe(true);
  });

  it("adds an array item", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await selectTreeNode(view, "tags");
    await view.getByTestId("addItemButton").click();
    expect(await captureState(bridge)).toMatchSnapshot();
    await view.getByTestId("item0RemoveButton").click();
    await driver
      .expectSettings((settings) => settings.data.tags)
      .toEqual(["%tag%"]);
    await field(view.getByTestId("wholePopulationStrategyField")).check();
    await field(view.getByTestId("valueField")).fill("%tags%");
    await driver
      .expectSettings((settings) => settings.data.tags)
      .toBe("%tags%");
  });

  it("shows display names without changing settings", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByTestId("schemaField").getByRole("combobox").clear();
    await userEvent.tab();
    await field(view.getByTestId("schemaField")).expectValue("Test Schema 1");
    await field(view.getByTestId("displayNamesSwitch")).check();
    await expect
      .element(
        view
          .getByTestId("xdmTreeNodeTitleDisplayName")
          .getByText("Test Field", { exact: true }),
      )
      .toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
    await selectTreeNode(view, "Count");
    const count = field(view.getByTestId("valueField"));
    await count.fill("abc");
    await driver.expectSettings((settings) => settings.data.count).toBeNaN();
    const registration = await bridge.registration;
    expect(await registration.validate()).toBe(false);
    await count.expectError("Value must be a data element or integer.");
    await driver.expectSettings((settings) => settings.data.count).toBeNaN();
    await count.fill("%count%");
    await driver
      .expectSettings((settings) => settings.data.count)
      .toBe("%count%");
    await count.fill("42");
    await driver.expectSettings((settings) => settings.data.count).toBe(42);
    await count.clear();
    await driver
      .expectSettings((settings) => settings.data.count)
      .toBeUndefined();
    await selectTreeNode(view, "Nested");
    await field(view.getByTestId("wholePopulationStrategyField")).check();
    await field(view.getByTestId("valueField")).fill("not a data element");
    await driver
      .expectSettings((settings) => settings.data.nested)
      .toBe("not a data element");
    expect(await registration.validate()).toBe(false);
    await field(view.getByTestId("valueField")).expectError(
      "Value must be a data element.",
    );
    await field(view.getByTestId("valueField")).clear();
    await driver
      .expectSettings((settings) => settings.data.nested)
      .toBeUndefined();
    await field(view.getByTestId("valueField")).fill("%nested%");
    await driver
      .expectSettings((settings) => settings.data.nested)
      .toBe("%nested%");
    await selectTreeNode(view, "Test Field");
    const value = field(view.getByTestId("valueField"));
    await value.fill("%edited%");
    await driver
      .expectSettings((settings) => settings.data.testField)
      .toBe("%edited%");
    await value.fill("typed text");
    await driver
      .expectSettings((settings) => settings.data.testField)
      .toBe("typed text");
    await value.clear();
    await driver
      .expectSettings((settings) => settings.data.testField)
      .toBeUndefined();
  });
});
