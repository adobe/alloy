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
import field from "../helpers/field";
import openXdmObject from "../helpers/dataElements/openXdmObject";

let result;

describe("XDM object display names", () => {
  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("toggles between display names and field IDs", async () => {
    result = await openXdmObject({
      data: { _unifiedjsqeonly: { vendor: { name: "Adobe" } } },
    });
    const { editor, view } = result;
    const { tree } = editor;
    await tree.node("_unifiedjsqeonly").expand();
    await tree.node("vendor").expand();

    await tree.node("name").expectExists();
    await tree.node("Name").expectNotExists();

    const displayNamesSwitch = field(view.getByTestId("displayNamesSwitch"));
    await displayNamesSwitch.check();
    await tree.node("Name").expectExists();
    await tree.node("name").expectNotExists();

    await displayNamesSwitch.uncheck();
    await tree.node("name").expectExists();
    await tree.node("Name").expectNotExists();
  });
});
