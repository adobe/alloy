/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import extensionViewController from "../../../helpers/extensionViewController.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import testInstanceNameOptions from "../../../helpers/testInstanceNameOptions.mjs";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";
import runCustomBuildTests from "../../runCustomBuildTests.mjs";

const instanceNameField = spectrum.picker("instanceNamePicker");
const propositionsField = spectrum.textField("propositionsTextField");
const viewNameField = spectrum.textField("viewNameTextField");
const metadataFormOption = spectrum.radio("metadataFormOption");
const metadataDataElementOption = spectrum.radio("metadataDataElementOption");
const metadataDataElementField = spectrum.textField("metadataDataElementField");

const metadata = [0, 1, 2].map((i) => ({
  scopeField: spectrum.textField(`metadata.${i}.scopeTextField`),
  selectorField: spectrum.textField(`metadata.${i}.selectorTextField`),
  actionType: spectrum.comboBox(`metadata.${i}.actionTypeField`),
  removeButton: spectrum.button(`metadata${i}RemoveButton`),
}));
const metadataAddButton = spectrum.button("metadataAddButton");

const mockExtensionSettings = {
  instances: [
    {
      name: "alloy1",
    },
    {
      name: "alloy2",
    },
  ],
};

createExtensionViewFixture({
  title: "Apply propositions view",
  viewPath: "actions/applyPropositions.html",
});

runCommonExtensionViewTests({
  extensionSettings: mockExtensionSettings,
});

runCustomBuildTests({
  requiredComponent: "personalization",
  minimumValidSettings: {
    propositions: "%myprops%",
  },
});

test("initializes form fields with full settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy2",
      propositions: "%propositions%",
      viewName: "%viewName%",
      metadata: {
        scope1: {
          selector: ".selector1",
          actionType: "setHtml",
        },
        scope2: {
          selector: ".selector2",
          actionType: "appendHtml",
        },
      },
    },
  });
  await instanceNameField.expectText("alloy2");
  await propositionsField.expectValue("%propositions%");
  await viewNameField.expectValue("%viewName%");
  await metadata[0].scopeField.expectValue("scope1");
  await metadata[0].selectorField.expectValue(".selector1");
  await metadata[0].actionType.expectText("Set HTML");
  await metadata[1].scopeField.expectValue("scope2");
  await metadata[1].selectorField.expectValue(".selector2");
  await metadata[1].actionType.expectText("Append HTML");
});

test("initializes form fields with minimal settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy1",
      propositions: "%mypropositions%",
    },
  });
  await instanceNameField.expectText("alloy1");
  await propositionsField.expectValue("%mypropositions%");
  await viewNameField.expectValue("");
  await metadata[0].scopeField.expectValue("");
  await metadata[0].selectorField.expectValue("");
  await metadata[0].actionType.expectText("");
});

test("initializes form fields with no settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await instanceNameField.expectText("alloy1");
  await propositionsField.expectValue("");
  await viewNameField.expectValue("");
  await metadata[0].scopeField.expectValue("");
  await metadata[0].selectorField.expectValue("");
  await metadata[0].actionType.expectText("");
});

test("returns minimal valid settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      propositions: "%myprops%",
    },
  });

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    propositions: "%myprops%",
  });
});

test("returns full valid settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await instanceNameField.selectOption("alloy2");
  await propositionsField.typeText("%myprops%");
  await viewNameField.typeText("myview");
  await metadata[0].scopeField.typeText("scope1");
  await metadata[0].selectorField.typeText(".selector1");
  await metadata[0].actionType.openMenu();
  await metadata[0].actionType.selectMenuOption("Set HTML");
  await metadataAddButton.click();
  await metadata[1].scopeField.typeText("scope2");
  await metadata[1].selectorField.typeText(".selector2");
  await metadata[1].actionType.openMenu();
  await metadata[1].actionType.selectMenuOption("Replace HTML");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy2",
    propositions: "%myprops%",
    viewName: "myview",
    metadata: {
      scope1: {
        selector: ".selector1",
        actionType: "setHtml",
      },
      scope2: {
        selector: ".selector2",
        actionType: "replaceHtml",
      },
    },
  });
});

test("removes a scope", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await metadata[0].scopeField.typeText("scope1");
  await metadata[0].selectorField.typeText(".selector1");
  await metadata[0].actionType.openMenu();
  await metadata[0].actionType.selectMenuOption("Set HTML");
  await metadata[0].removeButton.expectEnabled();
  await metadataAddButton.click();
  await metadata[1].scopeField.typeText("scope2");
  await metadata[1].selectorField.typeText(".selector2");
  await metadata[1].actionType.openMenu();
  await metadata[1].actionType.selectMenuOption("Replace HTML");
  await metadata[0].removeButton.click();

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    metadata: {
      scope2: {
        selector: ".selector2",
        actionType: "replaceHtml",
      },
    },
  });
});

test("metadata is invalid if two scopes are the same", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await metadata[0].scopeField.typeText("scope1");
  await metadata[0].selectorField.typeText(".selector1");
  await metadata[0].actionType.openMenu();
  await metadata[0].actionType.selectMenuOption("Set HTML");
  await metadataAddButton.click();
  await metadata[1].scopeField.typeText("scope1");
  await metadata[1].selectorField.typeText(".selector2");
  await metadata[1].actionType.openMenu();
  await metadata[1].actionType.selectMenuOption("Replace HTML");

  await extensionViewController.expectIsNotValid();
  await metadata[1].scopeField.expectError();
});

test("metadata is invalid if selector or actionType is missing", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await metadata[0].scopeField.typeText("scope1");
  await extensionViewController.expectIsNotValid();
  await metadata[0].selectorField.expectError();
  await metadata[0].actionType.expectError();
});

test("metadata is invalid if scope is missing", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await metadata[0].selectorField.typeText(".selector1");
  await metadata[0].actionType.openMenu();
  await metadata[0].actionType.selectMenuOption("Set HTML");
  await extensionViewController.expectIsNotValid();
  await metadata[0].scopeField.expectError();
});

test("shows error for propositions value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await propositionsField.typeText("propositions");
  await extensionViewController.expectIsNotValid();
  await propositionsField.expectError();
});

test("doesn't show error for viewName value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await viewNameField.typeText("%dataelement");
  await extensionViewController.expectIsValid();
  await viewNameField.expectNoError();
});

test("shows error for propositions value that is more than one data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await propositionsField.typeText("%a%%b%");
  await extensionViewController.expectIsNotValid();
  await propositionsField.expectError();
});

test("initialized metadata to be a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy1",
      metadata: "%metadata1%",
    },
  });
  await metadataDataElementOption.expectChecked();
  await metadataFormOption.expectUnchecked();
  await metadataDataElementField.expectValue("%metadata1%");
  await metadata[0].scopeField.expectNotExists();
});

test("returns metadata as a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await metadataDataElementOption.click();
  await metadataDataElementField.typeText("%metadata1%");
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    metadata: "%metadata1%",
  });
});

testInstanceNameOptions(extensionViewController, instanceNameField);
