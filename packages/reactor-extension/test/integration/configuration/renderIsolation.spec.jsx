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
import ConfigurationView from "../../../src/view/configuration/configurationView";
import field from "../helpers/field";

const { renders, countRenders } = vi.hoisted(() => {
  const counts = { overrides: 0, advanced: 0, sectionHeaders: 0 };
  return {
    renders: counts,
    countRenders: async (importOriginal, key) => {
      const original = await importOriginal();
      const Original = original.default;
      const Counted = (props) => {
        counts[key] += 1;
        return <Original {...props} />;
      };
      return { ...original, default: Counted };
    },
  };
});

vi.mock("../../../src/view/components/overrides", (importOriginal) =>
  countRenders(importOriginal, "overrides"),
);
vi.mock("../../../src/view/configuration/advancedSection", (importOriginal) =>
  countRenders(importOriginal, "advanced"),
);
vi.mock("../../../src/view/components/sectionHeader", (importOriginal) =>
  countRenders(importOriginal, "sectionHeaders"),
);

describe("Configuration render isolation", () => {
  let view;
  let driver;
  let cleanup;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
  });

  afterEach(() => cleanup());

  it.each([
    ["nameField", (instance) => instance.name, "renamed"],
    ["edgeDomainField", (instance) => instance.edgeDomain, "b.example.com"],
    [
      "productionDatastreamField",
      (instance) => instance.edgeConfigId,
      "typed-datastream-id",
    ],
  ])(
    "does not re-render unrelated sections while typing in %s",
    async (testId, getSetting, value) => {
      await driver.init({
        settings: {
          instances: [{ name: "alloy", edgeDomain: "a.example.com" }],
        },
      });
      await field(view.getByTestId("nameField")).expectValue("alloy");
      // The datastream catalog loads after init and re-renders the panels
      // that list datastreams; wait for it so only typing is measured.
      await field(
        view.getByRole("button", { name: "Refresh datastreams" }).first(),
      ).expectEnabled();
      const before = { ...renders };

      await field(view.getByTestId(testId)).fill(value);

      await driver
        .expectSettings((settings) => getSetting(settings.instances[0]))
        .toBe(value);
      expect(renders).toEqual(before);
    },
  );

  it("does not re-render the overrides while typing in an override field", async () => {
    await driver.init({
      settings: {
        instances: [
          {
            name: "alloy",
            edgeConfigOverrides: {
              development: {
                enabled: true,
                com_adobe_experience_platform: {
                  datasets: { event: { datasetId: "dataset" } },
                },
              },
            },
          },
        ],
      },
    });
    const eventDataset = field(view.getByTestId("eventDatasetOverride"));
    await eventDataset.expectValue("dataset");
    await field(
      view.getByRole("button", { name: "Refresh datastreams" }).first(),
    ).expectEnabled();
    const before = { ...renders };

    await eventDataset.fill("other-dataset");

    await driver
      .expectSettings(
        (settings) =>
          settings.instances[0].edgeConfigOverrides.development
            .com_adobe_experience_platform.datasets.event.datasetId,
      )
      .toBe("other-dataset");
    expect(renders).toEqual(before);
  });
});
