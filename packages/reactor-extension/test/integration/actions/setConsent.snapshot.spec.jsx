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
  modes,
  overrides,
  mockActionDatastreams,
} from "../helpers/actionsSnapshots";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));
const View = await loadEntryView(
  () => import("../../../src/view/actions/setConsent"),
);
const minimal = {
  consent: [{ standard: "Adobe", version: "1.0", value: { general: "in" } }],
};
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
    ["empty", {}],
    ["minimal Adobe 1.0", minimal],
    ["populated", populated],
    [
      "Adobe 2.0",
      { consent: [{ standard: "Adobe", version: "2.0", value: "%consent2%" }] },
    ],
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
    ["empty consent array", { consent: [] }],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ company, extensionSettings, settings });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    "identityMapField",
    "valueField",
    "iabVersionField",
    "iabValueField",
  ])("edits, clears, and invalidates %s", async (id) => {
    await driver.init({ company, extensionSettings, settings: editable });
    await field(view.getByTestId(id)).fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId(id)).fill("");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId(id)).fill("not a data element");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    ["inputMethodDataElementRadio", "dataElementField"],
    ["generalDataElementRadio", "generalDataElementField"],
    ["gdprAppliesDataElementRadio", "gdprAppliesDataElementField"],
    [
      "gdprContainsPersonalDataDataElementRadio",
      "gdprContainsPersonalDataDataElementField",
    ],
  ])(
    "switches %s and validates empty, invalid, and valid data elements",
    async (option, id) => {
      await driver.init({ company, extensionSettings, settings: editable });
      await field(view.getByTestId(option)).click();
      expect(await captureState(bridge)).toMatchSnapshot();
      await field(view.getByTestId(id)).fill("not a data element");
      expect(await captureState(bridge)).toMatchSnapshot();
      await field(view.getByTestId(id)).fill("%edited%");
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each([
    "generalInRadio",
    "gdprAppliesYesRadio",
    "gdprContainsPersonalDataNoRadio",
    "addConsentButton",
  ])("clicks %s", async (id) => {
    await driver.init({ company, extensionSettings, settings: editable });
    await field(view.getByTestId(id)).click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("sets general consent out", async () => {
    await driver.init({ company, extensionSettings, settings: minimal });
    await field(view.getByTestId("generalOutRadio")).click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("deletes the first consent object", async () => {
    await driver.init({ company, extensionSettings, settings: populated });
    await view
      .getByTestId("consentObject0")
      .getByTestId("deleteConsentButton")
      .click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches the first object to IAB TCF", async () => {
    await driver.init({ company, extensionSettings, settings: populated });
    await field(
      view.getByTestId("consentObject0").getByTestId("standardPicker"),
    ).selectOption("IAB TCF");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches Adobe 1.0 to Adobe 2.0", async () => {
    await driver.init({ company, extensionSettings, settings: minimal });
    await field(view.getByTestId("adobeVersionPicker")).selectOption("2.0");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("returns from a whole consent data element to the form", async () => {
    await driver.init({
      company,
      extensionSettings,
      settings: { consent: "%consent%" },
    });
    await field(view.getByTestId("inputMethodFormRadio")).click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches instances", async () => {
    await driver.init({ company, extensionSettings, settings: populated });
    await field(view.getByTestId("instanceNamePicker")).selectOption("alloy");
    await field(view.getByTestId("datastreamId")).expectValue(
      "Development stream",
    );
    await field(view.getByTestId("idSyncContainerOverride")).expectDisabled();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([123, "%id%"])("validates saved ID-sync override %j", async (id) => {
    await driver.init({
      company,
      extensionSettings,
      settings: {
        ...minimal,
        instanceName: "secondary",
        edgeConfigOverrides: {
          development: {
            enabled: true,
            com_adobe_identity: { idSyncContainerId: id },
          },
        },
      },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(modes)("round trips with %s", async (_, configuration) => {
    await driver.init({
      company,
      extensionSettings: configuration,
      settings: minimal,
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
