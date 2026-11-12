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
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import useView from "../helpers/useView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import { worker } from "../helpers/mocks/browser";
import {
  extensionSettings,
  schemaSettings,
  schemaHandlers,
  dataElementHandlers,
  updateSettings,
  selectTreeNode,
  reinitialize,
} from "../helpers/dataElementsSnapshot";

let view;
let bridge;
let driver;
let cleanup;

describe("Update variable settings snapshots", () => {
  beforeEach(async () => {
    worker.use(...schemaHandlers, ...dataElementHandlers);
    ({ view, bridge, driver, cleanup } = await useView(UpdateVariableView));
  });

  afterEach(() => cleanup());

  it("round trips data variable settings", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        dataElementName: "Data variable",
        data: {
          __adobe: {
            analytics: { pageName: "Home" },
            audienceManager: { d_uuid: "123" },
            target: { mbox: "home" },
          },
        },
      },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
    const data = { __adobe: { audiencemanager: { d_uuid: "123" } } };
    await reinitialize(driver, { dataElementName: "Data variable", data });
    await driver.expectSettings().toEqual({
      dataElementName: "Data variable",
      dataElementId: "DE2",
      data,
    });
    const registration = await bridge.registration;
    expect(await registration.validate()).toBe(true);
  });

  it("round trips root clear transform settings", async () => {
    await driver.init({
      extensionSettings,
      settings: {
        dataElementName: "XDM variable",
        transforms: { "": { clear: true } },
      },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
    await selectTreeNode(view, "xdm");
    await field(view.getByTestId("clearField")).uncheck();
    await field(view.getByTestId("wholePopulationStrategyField")).check();
    await field(view.getByTestId("valueField")).fill("%object%");
    await driver.expectSettings().toEqual({
      dataElementName: "XDM variable",
      dataElementId: "DE1",
      schema: schemaSettings.schema,
      data: "%object%",
    });
    await reinitialize(driver, {
      dataElementName: "XDM variable",
      transforms: { count: { clear: true } },
    });
    await selectTreeNode(view, "count");
    await field(view.getByTestId("clearField")).expectChecked();
    await driver
      .expectSettings((settings) => settings.transforms)
      .toEqual({ count: { clear: true } });
    await field(view.getByTestId("clearField")).uncheck();
    await field(view.getByTestId("valueField")).fill("42");
    await driver.expectSettings().toEqual({
      dataElementName: "XDM variable",
      dataElementId: "DE1",
      schema: schemaSettings.schema,
      data: { count: 42 },
    });
    const registration = await bridge.registration;
    expect(await registration.validate()).toBe(true);
  });

  it("switches from an XDM variable to a Data variable", async () => {
    await driver.init({ extensionSettings, settings: updateSettings });
    await field(view.getByTestId("dataElementField")).selectOption(
      "Data variable",
    );
    await expect
      .element(
        view.getByRole("heading", { name: "Variable Editor", exact: true }),
      )
      .toBeVisible();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("round trips new settings", async () => {
    await driver.init({ extensionSettings, settings: null });
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId("dataElementField")).selectOption(
      "XDM variable",
    );
    await expect
      .element(
        view
          .getByTestId("xdmTreeNodeTitleDisplayName")
          .getByText("testField", { exact: true }),
      )
      .toBeVisible();
    const expected = {
      dataElementName: "XDM variable",
      dataElementId: "DE1",
      schema: schemaSettings.schema,
      data: {},
    };
    await driver.expectSettings().toEqual(expected);
    await reinitialize(driver, {
      dataElementId: "DE_STALE",
      data: { testField: "legacy" },
    });
    const migrated = { ...expected, data: { testField: "legacy" } };
    await driver.expectSettings().toEqual(migrated);
    const registration = await bridge.registration;
    expect(await registration.validate()).toBe(true);
    await driver.expectSettings().toEqual(migrated);
    await reinitialize(driver, {
      dataElementName: "XDM variable",
      dataElementId: "DE2",
    });
    await driver.expectSettings().toEqual(expected);
    expect(await registration.validate()).toBe(true);
    await driver.expectSettings().toEqual(expected);
    await reinitialize(driver, {
      dataElementName: "Missing variable",
      dataElementId: "DE1",
    });
    await driver.expectSettings().toEqual(expected);
    expect(await registration.validate()).toBe(true);
    await driver.expectSettings().toEqual(expected);
  });

  it("edits custom code through the extension bridge", async () => {
    await driver.init({ extensionSettings, settings: updateSettings });
    bridge.openCodeEditorMock = async () => "content.xdm.count = 42;";
    await view.getByTestId("onBeforeEventSendEditButton").click();
    expect(await captureState(bridge)).toMatchSnapshot();
    await selectTreeNode(view, "count");
    await field(view.getByTestId("clearField")).check();
    await driver
      .expectSettings((settings) => ({
        count: settings.data.count,
        transforms: settings.transforms,
      }))
      .toEqual({ count: 2, transforms: { count: { clear: true } } });
  });
});
