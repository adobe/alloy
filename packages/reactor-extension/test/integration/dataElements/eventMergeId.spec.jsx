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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useView from "../helpers/useView";
import loadEntryView from "../helpers/entryView";
import { extensionSettings } from "../helpers/mediaEventsFixtures";
import {
  LIBRARY_TYPE_MANAGED,
  LIBRARY_TYPE_PREINSTALLED,
} from "../../../src/view/constants/libraryType";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/dataElements/eventMergeId"),
);

const uuidRegex =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

describe("Event merge ID data element", () => {
  let view;
  let driver;
  let cleanup;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it("returns valid settings with a generated cache ID for a new data element", async () => {
    await driver.init({
      extensionSettings: {
        ...extensionSettings,
        libraryCode: { type: LIBRARY_TYPE_MANAGED },
      },
      settings: null,
    });
    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings((settings) => settings.cacheId)
      .toMatch(uuidRegex);
  });

  it("does not modify cacheId if initialized with a cacheId", async () => {
    await driver.init({
      extensionSettings,
      settings: { cacheId: "ab3d0f9b-6faa-40c2-bf68-a77a9bbb686a" },
    });
    await driver.expectValidate().toBe(true);
    await driver
      .expectSettings()
      .toEqual({ cacheId: "ab3d0f9b-6faa-40c2-bf68-a77a9bbb686a" });
  });

  it("shows error when using preinstalled library type and creating new data element", async () => {
    await driver.init({
      extensionSettings: {
        ...extensionSettings,
        libraryCode: { type: LIBRARY_TYPE_PREINSTALLED },
      },
      settings: null,
    });
    await expect
      .element(
        view.getByText("Not available when using a self-hosted Alloy instance"),
      )
      .toBeVisible();
    await driver.expectValidate().toBe(false);
  });

  it("shows no error when using managed library type", async () => {
    await driver.init({
      extensionSettings: {
        ...extensionSettings,
        libraryCode: { type: LIBRARY_TYPE_MANAGED },
      },
      settings: null,
    });
    await expect
      .element(view.getByText("No configuration necessary."))
      .toBeVisible();
    await expect
      .element(
        view.getByText("Not available when using a self-hosted Alloy instance"),
      )
      .not.toBeInTheDocument();
    await driver.expectValidate().toBe(true);
  });
});
