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
    [
      "invalid surface",
      { personalization: { surfaces: ["", "ftp://example.com"] } },
    ],
    ["legacy dataset", { datasetId: "legacy-dataset" }],
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

  it("edits, clears, and invalidates surfaces0Field", async () => {
    await driver.init({
      company,
      extensionSettings,
      settings: {
        instanceName: "secondary",
        personalization: { surfaces: populated.personalization.surfaces },
      },
    });
    await field(view.getByTestId("surfaces0Field")).fill("%edited%");
    expect(await captureState(bridge)).toMatchSnapshot();
    await field(view.getByTestId("surfaces0Field")).fill("");
    expect(await captureState(bridge)).toMatchSnapshot();
  });

  it.each([
    ["guidedEventsEnabledCheckbox", populated],
    [
      "renderDecisionsCheckbox",
      {
        instanceName: "secondary",
        renderDecisions: true,
        personalization: { sendDisplayEvent: false },
      },
    ],
    [
      "defaultPersonalizationEnabledtrueOption",
      {
        instanceName: "secondary",
        personalization: { defaultPersonalizationEnabled: false },
      },
    ],
  ])("clicks %s", async (id, settings) => {
    await driver.init({
      company,
      extensionSettings,
      settings: structuredClone(settings),
    });
    await field(view.getByTestId(id)).click();
    expect(await captureState(bridge)).toMatchSnapshot();
  });

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

  it.each([
    ["fetch", 123],
    ["collect", 123],
  ])("validates %s ID-sync override %j", async (mode, id) => {
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
    await field(view.getByTestId("guidedEventsEnabledCheckbox")).check();
    await field(view.getByTestId("guidedEventfetchOption")).expectChecked();
    if (mode === "collect") {
      await field(view.getByTestId("guidedEventcollectOption")).click();
      await field(view.getByTestId("guidedEventcollectOption")).expectChecked();
    }
    await field(view.getByTestId("idSyncContainerOverride")).expectValue(
      String(id),
    );
    expect(await captureState(bridge)).toMatchSnapshot();
  });
});
