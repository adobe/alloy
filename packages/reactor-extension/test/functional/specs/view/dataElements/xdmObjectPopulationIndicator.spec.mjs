/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import initializeExtensionView from "../../../helpers/objectEditor/initializeExtensionView.mjs";
import xdmTree from "../../../helpers/objectEditor/xdmTree.mjs";
import arrayEdit from "../../../helpers/objectEditor/arrayEdit.mjs";
import booleanEdit from "../../../helpers/objectEditor/booleanEdit.mjs";
import integerEdit from "../../../helpers/objectEditor/integerEdit.mjs";
import numberEdit from "../../../helpers/objectEditor/numberEdit.mjs";
import objectEdit from "../../../helpers/objectEditor/objectEdit.mjs";
import stringEdit from "../../../helpers/objectEditor/stringEdit.mjs";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import spectrum from "../../../helpers/spectrum.mjs";

createExtensionViewFixture({
  title: "XDM Object Population Indicator",
  viewPath: "dataElements/xdmObject.html",
  requiresAdobeIOIntegration: true,
});

const schemaField = spectrum.comboBox("schemaField");

test("shows empty population amount for _id", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_id").populationIndicator.expectEmpty();
});

test("shows empty population amount for context fields", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("environment").populationIndicator.expectEmpty();
  await xdmTree.node("environment").toggleExpansion();
  await xdmTree.node("type").populationIndicator.expectEmpty();
});

test("shows correct population amount for data element objects", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  const vendorPop = xdmTree.node("vendor").populationIndicator;
  await vendorPop.expectEmpty();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("vendor").click();
  const namePop = xdmTree.node("name").populationIndicator;
  await namePop.expectEmpty();
  await objectEdit.selectWholePopulationStrategy();
  await vendorPop.expectEmpty();
  await namePop.expectBlank();
  await objectEdit.enterValue("%vendor%");
  await vendorPop.expectFull();
  await namePop.expectBlank();
});

test("shows partial population amount for objects", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("name").click();
  await stringEdit.enterValue("Adobe");
  await xdmTree.node("vendor").populationIndicator.expectPartial();
});

test("show correct population amount for arrays", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  const industriesPop = xdmTree.node("industries").populationIndicator;
  await industriesPop.expectEmpty();
  await xdmTree.node("industries").click();
  await arrayEdit.addItem();
  await industriesPop.expectEmpty();

  await arrayEdit.clickItem(0);
  await arrayEdit.enterValue("%industry%");
  await industriesPop.expectFull();
  await xdmTree.node("industries").click();
  await arrayEdit.addItem();
  await industriesPop.expectPartial();
});

[
  {
    title: "whole array",
    field: "industries",
    async set() {
      await arrayEdit.selectWholePopulationStrategy();
      await arrayEdit.enterValue("%industries%");
    },
  },
  {
    title: "string value",
    field: "name",
    async set() {
      await stringEdit.enterValue("%name%");
    },
  },
  {
    title: "integer value",
    field: "numEmployees",
    async set() {
      await integerEdit.enterValue("123");
    },
  },
  {
    title: "number value",
    field: "revenue",
    async set() {
      await numberEdit.enterValue("123.123");
    },
  },
  {
    title: "boolean data element",
    field: "isLicensed",
    async set() {
      await booleanEdit.enterDataElementValue("%isLicensed%");
    },
  },
  {
    title: "boolean true",
    field: "isLicensed",
    async set() {
      await booleanEdit.selectConstantTrueValueField();
    },
  },
  {
    title: "boolean false",
    field: "isLicensed",
    async set() {
      await booleanEdit.selectConstantFalseValueField();
    },
  },
].forEach(({ title, field, set }) => {
  test(`shows correct population amount for ${title}`, async () => {
    await initializeExtensionView();
    await schemaField.openMenu();
    await schemaField.selectMenuOption("XDM Object Data Element Tests");
    await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
    await xdmTree.node("vendor").toggleExpansion();
    await xdmTree.node(field).click();
    const fieldPop = xdmTree.node(field).populationIndicator;
    await fieldPop.expectEmpty();
    await set();
    await fieldPop.expectFull();
  });
});

test("shows empty population indicator for booleans with No Value selected", async () => {
  await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("isLicensed").click();
  const isLicensedPop = xdmTree.node("isLicensed").populationIndicator;
  await isLicensedPop.expectEmpty();
  await isLicensedPop.expectEmpty();
});
