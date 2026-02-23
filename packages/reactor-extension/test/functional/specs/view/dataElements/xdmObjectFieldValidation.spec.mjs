/*
Copyright 2021 Adobe. All rights reserved.
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
import stringEdit from "../../../helpers/objectEditor/stringEdit.mjs";
import editor from "../../../helpers/objectEditor/editor.mjs";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import spectrum from "../../../helpers/spectrum.mjs";

createExtensionViewFixture({
  title: "XDM Object Validation",
  viewPath: "dataElements/xdmObject.html",
  requiresAdobeIOIntegration: true,
});

const schemaField = spectrum.comboBox("schemaField");

test("arrays with no values are invalid", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("vendor").toggleExpansion();
  await xdmTree.node("industries").click();
  await arrayEdit.selectPartsPopulationStrategy();
  await arrayEdit.addItem();
  await arrayEdit.addItem();
  await arrayEdit.clickItem(0);
  await arrayEdit.enterValue("%item1%");
  await xdmTree.node("industries").toggleExpansion();

  await extensionViewController.expectIsNotValid();
  await xdmTree.node("Item 1").expectIsValid();
  await xdmTree.node("Item 2").expectIsNotValid();
});

test("a populated required field is valid", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("customer").toggleExpansion();
  await xdmTree.node("emailAddress").click();
  await stringEdit.enterValue("example@adobe.com");
  await extensionViewController.expectIsValid();
});

test("an empty required field is valid if parent object is not populated", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await editor.expectExists();
  await extensionViewController.expectIsValid();
});

test("an empty required field is invalid if another field on parent object is populated", async () => {
  const extensionViewController = await initializeExtensionView();
  await schemaField.openMenu();
  await schemaField.selectMenuOption("XDM Object Data Element Tests");
  await xdmTree.node("_unifiedjsqeonly").toggleExpansion();
  await xdmTree.node("customer").toggleExpansion();
  // mailingAddress and emailAddress are siblings.
  await xdmTree.node("mailingAddress").toggleExpansion();
  await xdmTree.node("city").click();
  await stringEdit.enterValue("San Jose");
  await extensionViewController.expectIsNotValid();
  await xdmTree.node("emailAddress").expectIsNotValid();
});
