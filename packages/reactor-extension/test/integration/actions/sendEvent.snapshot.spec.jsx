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

import { describe, it, beforeEach, afterEach, expect } from "vitest";
import useView from "../helpers/useView";
import View from "../../../src/view/actions/sendEventView";
import captureState from "../helpers/captureState";
import field from "../helpers/field";
import {
  extensionSettings,
  company,
  modes,
  overrides,
  mockActionDatastreams,
} from "../helpers/actionsSnapshots";

const populated = {
  instanceName: "secondary",
  type: "web.webpagedetails.pageViews",
  xdm: "%xdm%",
  data: "%data%",
  documentUnloading: true,
  renderDecisions: true,
  mergeId: "%merge%",
  personalization: {
    decisionScopes: ["home", "", "checkout"],
    surfaces: ["web://example.com/cart", "#hero"],
    sendDisplayEvent: false,
    includeRenderedPropositions: true,
    defaultPersonalizationEnabled: false,
    decisionContext: { country: "US" },
  },
  advertising: { handleAdvertisingData: "wait" },
  edgeConfigOverrides: overrides,
};
const editable = { ...populated, edgeConfigOverrides: undefined };
let view;
let bridge;
let driver;
let cleanup;

describe("Send event settings snapshots", () => {
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
      "data elements",
      {
        type: "%type%",
        xdm: "%xdm%",
        data: "%data%",
        personalization: {
          decisionScopes: "%scopes%",
          surfaces: "%surfaces%",
          decisionContext: "%context%",
          defaultPersonalizationEnabled: "%enabled%",
        },
        advertising: { handleAdvertisingData: "%advertising%" },
      },
    ],
    [
      "legacy fetch without rendering",
      {
        guidedEventsEnabled: true,
        guidedEvent: "fetch",
        renderDecisions: false,
      },
    ],
    ["legacy implicit fetch without rendering", { guidedEventsEnabled: true }],
    [
      "guided fetch",
      {
        guidedEventsEnabled: true,
        guidedEvent: "fetch",
        renderDecisions: true,
      },
    ],
    ["guided collect", { guidedEventsEnabled: true, guidedEvent: "collect" }],
    [
      "invalid surface",
      { personalization: { surfaces: ["", "ftp://example.com"] } },
    ],
    ["invalid XDM", { xdm: "not a data element" }],
    ["legacy dataset", { datasetId: "legacy-dataset" }],
    [
      "legacy overrides",
      {
        edgeConfigOverrides: {
          com_adobe_analytics: { reportSuites: ["suite"] },
          com_adobe_identity: { idSyncContainerId: 12 },
          com_adobe_audience_manager: { enabled: false },
        },
      },
    ],
  ])(
    "round trips %s settings before any edits or validation",
    async (_, settings) => {
      await driver.init({
        company,
        extensionSettings,
        settings: structuredClone(settings),
      });
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it.each([
    "typeField",
    "xdmTextField",
    "dataTextField",
    "mergeIdTextField",
    "decisionScopes0Field",
    "surfaces0Field",
  ])("edits, clears, and invalidates %s", async (id) => {
    await driver.init({
      company,
      extensionSettings,
      settings: structuredClone(editable),
    });
    await field(view.getByTestId(id)).fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId(id)).fill("");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId(id)).fill("not a data element");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    "guidedEventsEnabledCheckbox",
    "includeRenderedPropositionsCheckbox",
    "documentUnloadingCheckbox",
    "renderDecisionsCheckbox",
    "sendDisplayEventCheckbox",
    "decisionScopesAddButton",
    "decisionScopes0RemoveButton",
    "surfacesAddButton",
    "surfaces0RemoveButton",
    "defaultPersonalizationEnabledtrueOption",
    "defaultPersonalizationEnabledautoOption",
    "handleAdvertisingDatadisabledOption",
    "handleAdvertisingDataautoOption",
  ])("clicks %s", async (id) => {
    await driver.init({
      company,
      extensionSettings,
      settings: structuredClone(
        id === "guidedEventsEnabledCheckbox" ? populated : editable,
      ),
    });
    await field(view.getByTestId(id)).click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    ["decisionScopesDataElementOption", "decisionScopesDataElementField"],
    ["surfacesDataElementOption", "surfacesDataElementField"],
    ["decisionContextDataElementOption", "decisionContextDataElementField"],
    [
      "handleAdvertisingDataDataElement",
      "handleAdvertisingDataDataElementField",
    ],
  ])(
    "switches %s and validates empty, invalid, and valid data elements",
    async (option, id) => {
      await driver.init({
        company,
        extensionSettings,
        settings: structuredClone(editable),
      });
      await field(view.getByTestId(option)).click();
      expect(await captureState(bridge)).toMatchSnapshot();
      await field(view.getByTestId(id)).fill("not a data element");
      expect(await captureState(bridge)).toMatchSnapshot();
      await field(view.getByTestId(id)).fill("%edited%");
      expect(await captureState(bridge)).toMatchSnapshot();
    },
  );

  it("selects a predefined event type", async () => {
    await driver.init({
      company,
      extensionSettings,
      settings: { type: "custom" },
    });
    await field(view.getByTestId("typeField")).selectOption(
      "Web Webpagedetails Page Views",
    );
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("switches instances", async () => {
    await driver.init({
      company,
      extensionSettings,
      settings: structuredClone(populated),
    });
    await field(view.getByTestId("instanceNamePicker")).selectOption("alloy");
    await field(view.getByTestId("datastreamId")).expectValue(
      "Development stream",
    );
    await field(view.getByTestId("idSyncContainerOverride")).expectDisabled();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each(
    ["unguided", "fetch", "collect"].flatMap((mode) =>
      [123, "%id%"].map((id) => [mode, id]),
    ),
  )("validates %s ID-sync override %j", async (mode, id) => {
    await driver.init({
      company,
      extensionSettings,
      settings: {
        instanceName: "secondary",
        renderDecisions: true,
        edgeConfigOverrides: {
          development: {
            enabled: true,
            com_adobe_identity: { idSyncContainerId: id },
          },
        },
      },
    });
    if (mode !== "unguided") {
      await field(view.getByTestId("guidedEventsEnabledCheckbox")).check();
      await field(view.getByTestId("guidedEventfetchOption")).expectChecked();
    }
    if (mode === "collect") {
      await field(view.getByTestId("guidedEventcollectOption")).click();
      await field(view.getByTestId("guidedEventcollectOption")).expectChecked();
    }
    await field(view.getByTestId("idSyncContainerOverride")).expectValue(
      String(id),
    );
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it("enables guided events without overrides", async () => {
    await driver.init({
      company,
      extensionSettings,
      settings: { instanceName: "secondary", renderDecisions: true },
    });
    await field(view.getByTestId("guidedEventsEnabledCheckbox")).check();
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
