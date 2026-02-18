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

import extensionViewController from "../../../helpers/extensionViewController.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";
import runCustomBuildTests from "../../runCustomBuildTests.mjs";
import { LIBRARY_TYPE_PREINSTALLED } from "../../../../../src/view/constants/libraryType.js";

const eventMergeIdField = spectrum.textField("eventMergeIdTextField");
const preinstalledModeError = spectrum.alert("preinstalledModeError");
const preinstalledModeWarning = spectrum.alert("preinstalledModeWarning");

createExtensionViewFixture({
  title: "Reset Event Merge ID View",
  viewPath: "actions/resetEventMergeId.html",
});

runCommonExtensionViewTests();
runCustomBuildTests({
  requiredComponent: "eventMerge",
  minimumValidSettings: { eventMergeId: "%foo%" },
});

test("initializes form fields with settings", async () => {
  await extensionViewController.init({
    settings: {
      eventMergeId: "%foo%",
    },
  });
  await eventMergeIdField.expectValue("%foo%");
});

test("returns valid settings", async () => {
  await extensionViewController.init();

  await eventMergeIdField.typeText("%foo%");
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    eventMergeId: "%foo%",
  });
});

test("shows error for empty event merge ID value", async () => {
  await extensionViewController.init();
  await extensionViewController.expectIsNotValid();
  await eventMergeIdField.expectError();
});

test("shows error for event merge ID value that is not a data element", async () => {
  await extensionViewController.init();
  await eventMergeIdField.typeText("foo");
  await extensionViewController.expectIsNotValid();
  await eventMergeIdField.expectError();
});

test("shows error for event merge ID value that is more than one data element", async () => {
  await extensionViewController.init();
  await eventMergeIdField.typeText("%foo%%bar%");
  await extensionViewController.expectIsNotValid();
  await eventMergeIdField.expectError();
});

test("shows error when using preinstalled library type and creating new action", async () => {
  await extensionViewController.init({
    extensionSettings: {
      libraryCode: { type: LIBRARY_TYPE_PREINSTALLED },
      instances: [{ name: "alloy" }],
    },
    settings: null,
  });

  await preinstalledModeError.expectExists();
  await preinstalledModeWarning.expectNotExists();
  await extensionViewController.expectIsNotValid();
});

test("shows warning when using preinstalled library type with existing action", async () => {
  await extensionViewController.init({
    extensionSettings: {
      libraryCode: { type: LIBRARY_TYPE_PREINSTALLED },
      instances: [{ name: "alloy" }],
    },
    settings: {
      eventMergeId: "%foo%",
    },
  });

  await preinstalledModeError.expectNotExists();
  await preinstalledModeWarning.expectExists();
  await extensionViewController.expectIsValid();
});

test("shows no error when using managed library type", async () => {
  await extensionViewController.init({
    extensionSettings: {
      libraryCode: { type: "managed" },
      instances: [{ name: "alloy" }],
    },
    settings: {
      eventMergeId: "%foo%",
    },
  });

  await preinstalledModeError.expectNotExists();
  await preinstalledModeWarning.expectNotExists();
  await extensionViewController.expectIsValid();
});
