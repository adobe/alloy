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

import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import useView from "../helpers/useView";
import loadEntryView from "../helpers/entryView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import {
  extensionSettings,
  company,
  overrides,
  mockActionDatastreams,
} from "../helpers/actionsSnapshots";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));
const View = await loadEntryView(
  () => import("../../../src/view/actions/setConsent"),
);
const populated = {
  instanceName: "secondary",
  identityMap: "%identity%",
  consent: [
    { standard: "Adobe", version: "1.0", value: { general: "out" } },
    { standard: "Adobe", version: "2.0", value: "%consent2%" },
    {
      standard: "IAB TCF",
      version: "2.0",
      value: "tc-string",
      gdprApplies: false,
      gdprContainsPersonalData: true,
    },
  ],
  edgeConfigOverrides: overrides,
};
const editable = { ...populated, edgeConfigOverrides: undefined };
let view;
let bridge;
let driver;
let cleanup;

describe("Set consent settings snapshots", () => {
  beforeEach(async () => {
    mockActionDatastreams();
    ({ view, bridge, driver, cleanup } = await useView(View));
  });
  afterEach(() => cleanup());

  it.each([
    ["new", null],
    ["populated", populated],
    [
      "Adobe 1.0 data element",
      {
        consent: [
          {
            standard: "Adobe",
            version: "1.0",
            value: { general: "%general%" },
          },
        ],
      },
    ],
    ["data element", { consent: "%consent%" }],
    [
      "IAB data elements",
      {
        consent: [
          {
            standard: "IAB TCF",
            version: "2.0",
            value: "%iab%",
            gdprApplies: "%gdpr%",
            gdprContainsPersonalData: "%personal%",
          },
        ],
      },
    ],
    [
      "invalid",
      {
        identityMap: "plain",
        consent: [{ standard: "Adobe", version: "2.0", value: "" }],
      },
    ],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ company, extensionSettings, settings });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("edits, clears, and invalidates iabVersionField", async () => {
    await driver.init({
      company,
      extensionSettings,
      settings: {
        ...editable,
        consent: [editable.consent[2]],
      },
    });
    await field(view.getByTestId("iabVersionField")).fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId("iabVersionField")).fill("");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches the first object to IAB TCF", async () => {
    await driver.init({ company, extensionSettings, settings: editable });
    await field(
      view.getByTestId("consentObject0").getByTestId("standardPicker"),
    ).selectOption("IAB TCF");
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
