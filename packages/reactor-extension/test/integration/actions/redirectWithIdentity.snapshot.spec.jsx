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
  () => import("../../../src/view/actions/redirectWithIdentity"),
);
const populated = { instanceName: "secondary", edgeConfigOverrides: overrides };
let view;
let bridge;
let driver;
let cleanup;

describe("Redirect with identity settings snapshots", () => {
  beforeEach(async () => {
    mockActionDatastreams();
    ({ view, bridge, driver, cleanup } = await useView(View));
  });
  afterEach(() => cleanup());

  it.each([
    ["new", null],
    ["empty", {}],
    ["minimal", { instanceName: "alloy" }],
    ["populated", populated],
    [
      "legacy",
      {
        edgeConfigOverrides: {
          com_adobe_analytics: { reportSuites: ["suite"] },
          com_adobe_identity: { idSyncContainerId: 12 },
          com_adobe_audience_manager: { enabled: false },
        },
      },
    ],
  ])("round trips %s settings", async (_, settings) => {
    await driver.init({ company, extensionSettings, settings });
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    "overridesEnabled",
    "datastreamId",
    "analyticsEnabled",
    "idSyncContainerOverride",
  ])("edits, clears, and invalidates development %s", async (id) => {
    await driver.init({ company, extensionSettings, settings: populated });
    await field(view.getByTestId(id)).fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId(id)).fill("");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId(id)).fill("not a data element");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(
    ["development", "staging", "production"].flatMap((env) =>
      [
        ["analyticsEnabled", "invalid"],
        ["analyticsEnabled", "%bad"],
        ["eventDatasetOverride", "%dataset%"],
        ["targetPropertyTokenOverride", "%target%"],
        ["idSyncContainerOverride", "-1"],
        ["idSyncContainerOverride", "1.5"],
        ["idSyncContainerOverride", "abc"],
        ["idSyncContainerOverride", "prefix%id%"],
      ].map(([id, value]) => [env, id, value]),
    ),
  )("edits %s %s to %j", async (env, id, value) => {
    await driver.init({ company, extensionSettings, settings: populated });
    await view.getByTestId(`${env}OverridesTab`).click();
    await field(view.getByTestId(id)).fill(value);
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(["development", "staging", "production"])(
    "adds a report suite in %s",
    async (env) => {
      await driver.init({ company, extensionSettings, settings: populated });
      await view.getByTestId(`${env}OverridesTab`).click();
      await view.getByTestId("addReportSuite").click();
      await field(view.getByTestId("reportSuitesOverride.3")).fill(
        "%newSuite%",
      );
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it("removes a report suite", async () => {
    await driver.init({ company, extensionSettings, settings: populated });
    await view.getByTestId("removeReportSuite.0").click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches instances and waits for the configured datastream", async () => {
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
      settings: { instanceName: "alloy" },
    });
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
