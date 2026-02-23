/*
Copyright 2019 Adobe. All rights reserved.
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

const instanceNameField = spectrum.picker("instanceNameField");
const responseHeadersField = spectrum.textField("responseHeadersField");
const responseBodyField = spectrum.textField("responseBodyField");
const renderDecisionsField = spectrum.checkbox("renderDecisionsField");

const mockExtensionSettings = {
  instances: [
    {
      name: "alloy1",
      edgeConfigId: "PR123",
    },
    {
      name: "alloy2",
      edgeConfigId: "PR456",
    },
  ],
};

createExtensionViewFixture({
  title: "Apply response view",
  viewPath: "actions/applyResponse.html",
});

runCommonExtensionViewTests({
  extensionSettings: mockExtensionSettings,
});

test("initializes form fields with full settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy2",
      responseHeaders: "%headers%",
      responseBody: "%body%",
      renderDecisions: true,
    },
  });
  await instanceNameField.expectText("alloy2");
  await responseHeadersField.expectValue("%headers%");
  await responseBodyField.expectValue("%body%");
  await renderDecisionsField.expectChecked();
});

test("initializes form fields with minimal settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      instanceName: "alloy1",
      responseBody: "%mybody%",
    },
  });
  await instanceNameField.expectText("alloy1");
  await responseHeadersField.expectValue("");
  await responseBodyField.expectValue("%mybody%");
  await renderDecisionsField.expectUnchecked();
});

test("initializes form fields with no settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await instanceNameField.expectText("alloy1");
  await responseHeadersField.expectValue("");
  await responseBodyField.expectValue("");
  await renderDecisionsField.expectUnchecked();
});

test("returns minimal valid settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
    settings: {
      responseBody: "%mybody%",
    },
  });

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy1",
    responseBody: "%mybody%",
  });
});

test("returns full valid settings", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await instanceNameField.selectOption("alloy2");
  await responseHeadersField.typeText("%myheaders%");
  await responseBodyField.typeText("%mybody%");
  await renderDecisionsField.click();
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy2",
    responseHeaders: "%myheaders%",
    responseBody: "%mybody%",
    renderDecisions: true,
  });
});

test("shows error for responseHeaders value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await responseHeadersField.typeText("headers");
  await extensionViewController.expectIsNotValid();
  await responseHeadersField.expectError();
});

test("shows error for responseBody value that is not a data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await responseBodyField.typeText("%body");
  await extensionViewController.expectIsNotValid();
  await responseBodyField.expectError();
});

test("shows error for responseHeaders value that is more than one data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await responseHeadersField.typeText("%a%%b%");
  await extensionViewController.expectIsNotValid();
  await responseHeadersField.expectError();
});

test("shows error for responseBody value that is more than one data element", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await responseBodyField.typeText("%a%%b%");
  await extensionViewController.expectIsNotValid();
  await responseBodyField.expectError();
});

test("shows error when responseBody is not filled in", async () => {
  await extensionViewController.init({
    extensionSettings: mockExtensionSettings,
  });
  await extensionViewController.expectIsNotValid();
  await responseBodyField.expectError();
});

testInstanceNameOptions(extensionViewController, instanceNameField);
