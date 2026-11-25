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

import { afterEach, beforeEach, describe, it, vi } from "vitest";
import useView from "../helpers/useView";
import loadEntryView from "../helpers/entryView";
import field from "../helpers/field";
import {
  runLibraryTypeTests,
  runRequiredComponentTests,
} from "../helpers/actions/requiredComponentTests";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));
const View = await loadEntryView(
  () => import("../../../src/view/actions/resetEventMergeId"),
);

const extensionSettings = { instances: [{ name: "alloy" }] };
const minimumValidSettings = { eventMergeId: "%foo%" };

describe("Reset event merge ID action", () => {
  let view;
  let driver;
  let cleanup;
  let eventMergeIdField;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(View));
    eventMergeIdField = field(view.getByTestId("eventMergeIdTextField"));
  });

  afterEach(() => cleanup());

  it("initializes form fields with settings", async () => {
    await driver.init({ extensionSettings, settings: minimumValidSettings });

    await eventMergeIdField.expectValue("%foo%");
  });

  it("shows error for event merge ID value that is more than one data element", async () => {
    await driver.init({ extensionSettings, settings: null });

    await eventMergeIdField.fill("%foo%%bar%");

    await driver.expectValidate().toBe(false);
    await eventMergeIdField.expectError(/please specify a data element/i);
  });
});

runRequiredComponentTests({
  openView: () => useView(View),
  requiredComponent: "eventMerge",
  minimumValidSettings,
  formTestId: "eventMergeIdTextField",
});

runLibraryTypeTests({
  openView: () => useView(View),
  minimumValidSettings,
  formTestId: "eventMergeIdTextField",
  newActionError: /please provide a event merge id/i,
});
