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

describe("XDM object auto-population notice", () => {
  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("auto-population notice is shown for auto-populated fields", async () => {
    result = await openXdmObject();
    const { editor, selectSchema } = result;
    await selectSchema();
    await editor.tree.node("environment").expand();
    await editor.tree.node("type").click();

    await editor.nodeEdit.autoPopulationAlert.expectVisible();
    await editor.nodeEdit.autoPopulationAlert.expectText(
      "Auto-populated field",
    );
  });

  it("auto-population notice is not shown for array items that match the name of a top-level auto-populated field", async () => {
    result = await openXdmObject();
    const { editor, selectSchema } = result;
    const { tree, array, nodeEdit } = editor;
    await selectSchema();
    // This extensive navigation is necessary to find a field that is not
    // auto-populated but matches the name of an auto-populated field (_id).
    await tree.node("placeContext").expand();
    await tree.node("activePOIs").click();
    await array.addItem();
    await array.selectItem(0);
    await tree.node("geoInteractionDetails").expand();
    await tree.node("geoShape").expand();
    await tree.node("_schema").expand();
    await tree.node("box").click();
    await array.addItem();
    await array.selectItem(0);
    await tree.node(["Item 1", "_id"]).click();

    await editor.string.expectVisible();
    await nodeEdit.autoPopulationAlert.expectNotExists();

    // Control: the top-level _id is auto-populated, so it does get the notice.
    await tree.node("_id", { index: 0 }).click();
    await nodeEdit.autoPopulationAlert.expectVisible();
  });
});
