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
import { extensionSettings } from "../helpers/mediaEventsFixtures";

vi.mock("../../../src/view/render", async () => ({
  default: (await import("../helpers/entryView")).captureRender,
}));

const View = await loadEntryView(
  () => import("../../../src/view/events/subscribeRulesetItems"),
);

const populated = {
  instanceName: "secondary",
  schemas: [
    "https://ns.adobe.com/personalization/dom-action",
    "https://ns.adobe.com/personalization/json-content-item",
  ],
  surfaces: ["web://example.com/cart", "#hero"],
};
let view;
let bridge;
let driver;
let cleanup;

describe("Subscribe ruleset items settings snapshots", () => {
  beforeEach(async () => {
    ({ view, bridge, driver, cleanup } = await useView(View));
  });

  afterEach(() => cleanup());

  it("round trips saved filters and removes only the first schema", async () => {
    await driver.init({ extensionSettings, settings: populated });
    expect(await captureState(bridge)).toMatchSnapshot();

    await view.getByTestId("schemas0RemoveButton").click();
    await expect
      .element(view.getByTestId("schemas1Field"))
      .not.toBeInTheDocument();
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
      schemas: ["https://ns.adobe.com/personalization/json-content-item"],
      surfaces: ["web://example.com/cart", "#hero"],
    });
    expect(await registration.validate()).toBe(true);
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
      schemas: ["https://ns.adobe.com/personalization/json-content-item"],
      surfaces: ["web://example.com/cart", "#hero"],
    });
  });

  it("rejects an invalid surface without changing the saved schema filters", async () => {
    await driver.init({ extensionSettings, settings: populated });
    const control = field(view.getByTestId("surfaces0Field"));
    await control.fill("not a data element");
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
      schemas: [
        "https://ns.adobe.com/personalization/dom-action",
        "https://ns.adobe.com/personalization/json-content-item",
      ],
      surfaces: ["not a data element", "#hero"],
    });
    expect(await registration.validate()).toBe(false);
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
      schemas: [
        "https://ns.adobe.com/personalization/dom-action",
        "https://ns.adobe.com/personalization/json-content-item",
      ],
      surfaces: ["not a data element", "#hero"],
    });
    await control.expectError("Invalid surface");
  });

  it("corrects an invalid schemas data element and supplies both arrays through data elements", async () => {
    await driver.init({ extensionSettings, settings: populated });
    await field(view.getByTestId("schemasDataElementOption")).check();
    const schemas = field(view.getByTestId("schemasDataElementField"));
    await schemas.fill("not a data element");
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
      schemas: "not a data element",
      surfaces: ["web://example.com/cart", "#hero"],
    });
    expect(await registration.validate()).toBe(false);
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
      schemas: "not a data element",
      surfaces: ["web://example.com/cart", "#hero"],
    });
    await schemas.expectError("Please specify a data element.");

    await schemas.fill("%schemas%");
    await field(view.getByTestId("surfacesDataElementOption")).check();
    const surfaces = field(view.getByTestId("surfacesDataElementField"));
    await surfaces.fill("%surfaces%");
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
      schemas: "%schemas%",
      surfaces: "%surfaces%",
    });
    expect(await registration.validate()).toBe(true);
    expect(await registration.getSettings()).toEqual({
      instanceName: "secondary",
      schemas: "%schemas%",
      surfaces: "%surfaces%",
    });
    await schemas.expectNotInvalid();
    await surfaces.expectNotInvalid();
  });

  it("keeps unsupported-surface feedback on the second row after a blank first row", async () => {
    await driver.init({ extensionSettings, settings: null });
    await view.getByTestId("surfacesAddButton").click();
    await field(view.getByTestId("surfaces1Field")).fill("ftp://example.com");
    const registration = await bridge.registration;
    expect(await registration.getSettings()).toEqual({
      instanceName: "alloy",
      surfaces: ["ftp://example.com"],
    });
    expect(await registration.validate()).toBe(false);
    expect(await registration.getSettings()).toEqual({
      instanceName: "alloy",
      surfaces: ["ftp://example.com"],
    });
    await field(view.getByTestId("surfaces1Field")).expectError(
      "Unsupported surface type ftp",
    );
    await field(view.getByTestId("surfaces0Field")).expectNotInvalid();
  });
});
