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

import { afterEach, describe, it } from "vitest";
import openXdmObject from "../helpers/dataElements/openXdmObject";

let result;

describe("XDM object field validation", () => {
  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("arrays with no values are invalid", async () => {
    result = await openXdmObject();
    const { editor, driver, selectSchema } = result;
    const { tree } = editor;
    await selectSchema();
    await tree.node("_unifiedjsqeonly").expand();
    await tree.node("vendor").expand();
    await tree.node("industries").click();
    await editor.array.selectParts();
    await editor.array.addItem();
    await editor.array.addItem();
    await editor.array.selectItem(0);
    await editor.array.enterValue("%item1%");
    await tree.node("industries").expand();

    await driver.expectValidate().toBe(false);
    await tree.node("Item 1").expectValid();
    await tree.node("Item 2").expectInvalid();
  });

  it("a populated required field is valid", async () => {
    result = await openXdmObject();
    const { editor, driver, selectSchema } = result;
    await selectSchema();
    await editor.tree.node("_unifiedjsqeonly").expand();
    await editor.tree.node("customer").expand();
    await editor.tree.node("emailAddress").click();
    await editor.string.enterValue("example@adobe.com");
    await driver.expectValidate().toBe(true);
    await editor.tree.node("emailAddress").expectValid();
  });

  it("an empty required field is valid if parent object is not populated", async () => {
    result = await openXdmObject();
    const { editor, driver, selectSchema } = result;
    await selectSchema();
    await editor.tree.node("_unifiedjsqeonly").expand();
    await editor.tree.node("customer").expand();
    await editor.nodeEdit.editor.expectExists();
    await driver.expectValidate().toBe(true);
    await editor.tree.node("emailAddress").expectValid();
  });

  it("an empty required field is invalid if another field on parent object is populated", async () => {
    result = await openXdmObject();
    const { editor, driver, selectSchema } = result;
    const { tree } = editor;
    await selectSchema();
    await tree.node("_unifiedjsqeonly").expand();
    await tree.node("customer").expand();
    // mailingAddress and emailAddress are siblings.
    await tree.node("mailingAddress").expand();
    await tree.node("city").click();
    await editor.string.enterValue("San Jose");
    await driver.expectValidate().toBe(false);
    await tree.node("emailAddress").expectInvalid();
  });
});
