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

/* eslint-disable vitest/expect-expect */

import { t } from "testcafe";
import initializeExtensionView from "../../../helpers/objectEditor/initializeExtensionView.mjs";
import xdmTree from "../../../helpers/objectEditor/xdmTree.mjs";
import arrayEdit from "../../../helpers/objectEditor/arrayEdit.mjs";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import { createTestIdSelector } from "../../../helpers/dataTestIdSelectors.mjs";

createExtensionViewFixture({
  title: "XDM Object Auto-Population Notice",
  viewPath: "dataElements/xdmObject.html",
  requiresAdobeIOIntegration: true,
});

const schemaField = spectrum.comboBox("schemaField");
const autoPopulationAlert = createTestIdSelector("autoPopulationAlert");

test("auto-population notice is shown for auto-populated fields", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("environment").toggleExpansion();
  await xdmTree.node("type").click();

  await t.expect(autoPopulationAlert.exists).ok();
  await t
    .expect(autoPopulationAlert.textContent)
    .contains("Auto-populated field");
});

test("auto-population notice is not shown for array items that match the name of a top-level auto-populated field", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  // This extensive navigation is necessary to find a field that is not auto-populated but matches the name of an auto-populated field
  await xdmTree.node("placeContext").toggleExpansion();
  await xdmTree.node("activePOIs").click();
  await arrayEdit.addItem();
  await arrayEdit.clickItem(0);
  await xdmTree.node("geoInteractionDetails").toggleExpansion();
  await xdmTree.node("geoShape").toggleExpansion();
  await xdmTree.node("_schema").toggleExpansion();
  await xdmTree.node("box").click();
  await arrayEdit.addItem();
  await arrayEdit.clickItem(0);
  await xdmTree.toggleDisplayNames();
  await xdmTree.node("Coordinates ID").click();

  await t.expect(autoPopulationAlert.exists).notOk();
});
