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
  extensionModes,
  schemaSettings,
  schemaHandlers,
  xdmData,
  treeValueEdits,
  treeStructureEdits,
  selectTreeNode,
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

  it.each([
    ["new", null],
    ["empty", {}],
    ["minimal", schemaSettings],
    ["populated", populated],
    [
      "schema without sandbox",
      { schema: schemaSettings.schema, data: { testField: "Legacy" } },
    ],
    ["whole object data element", { ...schemaSettings, data: "%object%" }],
    ["invalid negative integer", { ...schemaSettings, data: { count: -1 } }],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ extensionSettings, settings });
    await field(view.getByTestId("schemaField")).expectValue("Test Schema 1");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(extensionModes)(
    "round trips minimal settings with %s",
    async (_, mode) => {
      await driver.init({ extensionSettings: mode, settings: schemaSettings });
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each(treeValueEdits)("edits %s to %j", async (name, value) => {
    await driver.init({ extensionSettings, settings: populated });
    await selectTreeNode(view, name);
    await field(view.getByTestId("valueField")).fill(value);
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(treeStructureEdits)("%s", async (_, edit) => {
    await driver.init({ extensionSettings, settings: populated });
    await edit(view);
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("shows display names without changing settings", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("displayNamesSwitch")).check();
    await expect
      .element(
        view
          .getByTestId("xdmTreeNodeTitleDisplayName")
          .getByText("Test Field", { exact: true }),
      )
      .toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("blurs a cleared schema input", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await view.getByTestId("schemaField").getByRole("combobox").clear();
    await userEvent.tab();
    await field(view.getByTestId("schemaField")).expectValue("Test Schema 1");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(["", "not a data element"])(
    "sets whole object value to %j",
    async (value) => {
      await driver.init({ extensionSettings, settings: populated });
      await selectTreeNode(view, "nested");
      await field(view.getByTestId("wholePopulationStrategyField")).check();
      await field(view.getByTestId("valueField")).fill(value);
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );
});
