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

import extensionViewController from "../../../helpers/extensionViewController.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";

const instanceNamePicker = spectrum.picker("instanceNamePicker");

createExtensionViewFixture({
  title: "Redirect with identity",
  viewPath: "actions/sendPushSubscription.html",
});

runCommonExtensionViewTests();

const extensionSettings = {
  instances: [{ name: "alloy1" }, { name: "alloy2" }],
};

test("initializes form fields with settings", async () => {
  await extensionViewController.init({
    settings: {
      instanceName: "alloy2",
    },
    extensionSettings,
  });

  await instanceNamePicker.expectSelectedOptionLabel("alloy2");
});

test("returns valid settings", async () => {
  await extensionViewController.init({ extensionSettings });

  await instanceNamePicker.selectOption("alloy2");

  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    instanceName: "alloy2",
  });
});

test("defaults to the first instance name", async () => {
  await extensionViewController.init({ extensionSettings });
  await instanceNamePicker.expectSelectedOptionLabel("alloy1");
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettingsToContain({
    instanceName: "alloy1",
  });
});
