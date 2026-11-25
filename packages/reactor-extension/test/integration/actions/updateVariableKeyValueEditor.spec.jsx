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

import { describe, it, beforeEach, afterEach } from "vitest";
import useView from "../helpers/useView";
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import { worker } from "../helpers/mocks/browser";
import { createObjectEditor } from "../helpers/objectEditor";
import { updateVariableHandlers } from "../helpers/mocks/updateVariable/handlers";
import { SOLUTIONS_DATA_ELEMENT } from "../helpers/mocks/updateVariable/analyticsFixtures";

let view;
let driver;
let cleanup;
let keyValue;
let editor;

const init = async (settings) => {
  ({ view, driver, cleanup } = await useView(UpdateVariableView));
  editor = createObjectEditor(view);
  ({ keyValue } = editor);
  await driver.init({ settings });
  if (!settings) {
    await editor.tree.node("target").click();
  }
};

const expectSavedTarget = (value) =>
  driver.expectSettings().toEqual({
    ...SOLUTIONS_DATA_ELEMENT,
    data: { __adobe: { target: value } },
  });

describe("Update variable key value editor", () => {
  beforeEach(() => {
    worker.use(...updateVariableHandlers(["other", "sde1"]));
  });

  afterEach(() => {
    if (cleanup) cleanup();
  });

  it("returns minimal valid settings", async () => {
    await init();
    await keyValue.expectPartsSelected();
    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings()
      .toEqual({ ...SOLUTIONS_DATA_ELEMENT, data: {} });
  });

  it("returns full valid settings", async () => {
    await init();
    await keyValue.key(0).fill("key1");
    await keyValue.value(0).fill("value1");
    await keyValue.addRow();
    await keyValue.key(1).fill("key2");
    await keyValue.value(1).fill("value2");
    await driver.expectValidate().toBe(true);
    await expectSavedTarget({ key1: "value1", key2: "value2" });
  });

  it("fills in values", async () => {
    await init({
      ...SOLUTIONS_DATA_ELEMENT,
      data: { __adobe: { target: { key1: "value1", key2: "value2" } } },
    });
    // The node with saved values is selected automatically, and clicking a
    // selected tree node would deselect it.
    await editor.tree.node("target").expectSelected();
    await keyValue.key(0).expectValue("key1");
    await keyValue.value(0).expectValue("value1");
    await keyValue.key(1).expectValue("key2");
    await keyValue.value(1).expectValue("value2");
  });

  it("returns single data element", async () => {
    await init();
    await keyValue.selectWhole();
    await keyValue.enterValue("%data element%");
    await driver.expectValidate().toBe(true);
    await expectSavedTarget("%data element%");
  });

  it("returns data element values", async () => {
    await init();
    await keyValue.key(0).fill("key1");
    await keyValue.value(0).fill("%value1%");
    await keyValue.addRow();
    await keyValue.key(1).fill("key2");
    await keyValue.value(1).fill("%value2%");
    await driver.expectValidate().toBe(true);
    await expectSavedTarget({ key1: "%value1%", key2: "%value2%" });
  });

  it("returns JSON modified data", async () => {
    await init();
    await keyValue.selectWhole();
    await keyValue.enterValue('{"key1":"value1"}');
    await driver.expectValidate().toBe(true);
    await expectSavedTarget({ key1: "value1" });
  });

  it("switches between whole and parts population strategies with a data element", async () => {
    await init();
    await keyValue.selectWhole();
    await keyValue.enterValue("%data element%");
    await driver.expectValidate().toBe(true);
    await keyValue.selectParts();
    await keyValue.expectPartsSelected();
    await driver.expectValidate().toBe(true);
    await keyValue.selectWhole();
    await keyValue.expectWholeSelected();
    await driver.expectValidate().toBe(true);
    await expectSavedTarget("%data element%");
  });

  it("validates fields", async () => {
    await init();
    await keyValue.value(0).fill("value10");
    await driver.expectValidate().toBe(false);
    await keyValue.key(0).expectError(/please provide a key name/i);
  });
});
