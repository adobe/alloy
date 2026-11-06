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

import { it, expect, vi } from "vitest";
import loadEntryView from "../helpers/entryView";
import field from "../helpers/field";
import {
  snapshotMediaEventsCases,
  expectMediaEventsSettings,
} from "../helpers/mediaEventsFixtures";

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

it("Subscribe ruleset items settings snapshots", async () => {
  expect.hasAssertions();
  await snapshotMediaEventsCases(View, [
    {
      name: "round trips populated settings",
      settings: populated,
      fresh: true,
      verify: async ({ view, bridge }) => {
        await view.getByTestId("schemas0RemoveButton").click();
        await expect
          .element(view.getByTestId("schemas1Field"))
          .not.toBeInTheDocument();
        await expectMediaEventsSettings(bridge, {
          ...populated,
          schemas: [populated.schemas[1]],
        });
      },
    },
    {
      name: 'surfaces > row 0 > sets the value to "not a data element"',
      settings: populated,
      snapshot: false,
      edit: async ({ view }) => {
        const control = field(view.getByTestId("surfaces0Field"));
        await control.fill("not a data element");
        return () => control.fill("web://example.com/cart");
      },
      verify: async ({ view, bridge }) => {
        await expectMediaEventsSettings(
          bridge,
          { ...populated, surfaces: ["not a data element", "#hero"] },
          false,
        );
        await field(view.getByTestId("surfaces0Field")).expectError(
          "Invalid surface",
        );
      },
    },
    {
      name: 'sets the schemas data element to "not a data element"',
      reuse: true,
      snapshot: false,
      edit: async ({ view }) => {
        await field(view.getByTestId("schemasDataElementOption")).check();
        await field(view.getByTestId("schemasDataElementField")).fill(
          "not a data element",
        );
      },
      verify: async ({ view, bridge }) => {
        await expectMediaEventsSettings(
          bridge,
          { ...populated, schemas: "not a data element" },
          false,
        );
        await field(view.getByTestId("schemasDataElementField")).expectError(
          "Please specify a data element.",
        );
        await field(view.getByTestId("schemasDataElementField")).fill(
          "%schemas%",
        );
        await field(view.getByTestId("surfacesDataElementOption")).check();
        await field(view.getByTestId("surfacesDataElementField")).fill(
          "%surfaces%",
        );
        await expectMediaEventsSettings(bridge, {
          instanceName: "secondary",
          schemas: "%schemas%",
          surfaces: "%surfaces%",
        });
        await field(
          view.getByTestId("schemasDataElementField"),
        ).expectNotInvalid();
        await field(
          view.getByTestId("surfacesDataElementField"),
        ).expectNotInvalid();
      },
    },
    {
      name: "keeps surface error feedback on the second row after a blank first row",
      settings: null,
      snapshot: false,
      edit: async ({ view }) => {
        await view.getByTestId("surfacesAddButton").click();
        await field(view.getByTestId("surfaces1Field")).fill(
          "ftp://example.com",
        );
      },
      verify: async ({ view, bridge }) => {
        await expectMediaEventsSettings(
          bridge,
          { instanceName: "alloy", surfaces: ["ftp://example.com"] },
          false,
        );
        await field(view.getByTestId("surfaces1Field")).expectError(
          "Unsupported surface type ftp",
        );
        await field(view.getByTestId("surfaces0Field")).expectNotInvalid();
      },
    },
  ]);
});
