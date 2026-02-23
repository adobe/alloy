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
import createExtensionViewFixture from "../../../helpers/createExtensionViewFixture.mjs";
import runCommonExtensionViewTests from "../runCommonExtensionViewTests.mjs";
import spectrum from "../../../helpers/spectrum.mjs";
import {
  LIBRARY_TYPE_MANAGED,
  LIBRARY_TYPE_PREINSTALLED,
} from "../../../../../src/view/constants/libraryType.js";

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const preinstalledModeError = spectrum.alert("preinstalledModeError");

createExtensionViewFixture({
  title: "Event Merge ID View",
  viewPath: "dataElements/eventMergeId.html",
});

runCommonExtensionViewTests();

test("returns valid settings", async (t) => {
  await extensionViewController.init();
  await extensionViewController.expectIsValid();
  // We can't use extensionViewController.expectSettings because we don't know
  // the exact value of actualSettings.cacheId and therefore have to do some
  // custom matching.
  const actualSettings = await extensionViewController.getSettings();
  await t.expect(actualSettings.cacheId).match(uuidRegex);
});

test("does not modify cacheId if initialized with a cacheId", async () => {
  await extensionViewController.init({
    settings: {
      cacheId: "ab3d0f9b-6faa-40c2-bf68-a77a9bbb686a",
    },
  });
  await extensionViewController.expectIsValid();
  await extensionViewController.expectSettings({
    cacheId: "ab3d0f9b-6faa-40c2-bf68-a77a9bbb686a",
  });
});

test("shows error when using preinstalled library type and creating new data element", async () => {
  await extensionViewController.init({
    extensionSettings: {
      libraryCode: { type: LIBRARY_TYPE_PREINSTALLED },
      instances: [{ name: "alloy" }],
    },
    settings: null,
  });

  await preinstalledModeError.expectExists();
  await extensionViewController.expectIsNotValid();
});

test("shows no error when using managed library type", async () => {
  await extensionViewController.init({
    extensionSettings: {
      libraryCode: { type: LIBRARY_TYPE_MANAGED },
      instances: [{ name: "alloy" }],
    },
    settings: null,
  });

  await preinstalledModeError.expectNotExists();
  await extensionViewController.expectIsValid();
});
