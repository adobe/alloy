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
import { userEvent } from "vitest/browser";
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

  const init = async (settings) => {
    await driver.init({ settings });
    await field(view.getByTestId("nameField")).expectValue("alloy");
    // The datastream catalog finishes loading after init and re-renders the
    // instance panels; wait for it so only the edit is measured.
    await field(
      view.getByRole("button", { name: "Refresh datastreams" }).first(),
    ).expectEnabled();
  };

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
  });

  afterEach(() => cleanup());

  it.each([
    ["edgeDomainField", "edgeDomain", "b.example.com"],
    ["nameField", "name", "renamed"],
  ])(
    "does not re-render unrelated sections when %s changes",
    async (testId, key, value) => {
      await init({
        instances: [{ name: "alloy", edgeDomain: "a.example.com" }],
      });
      const before = { ...renders };

      await view.getByTestId(testId).getByRole("textbox").fill(value);
      await field(view.getByTestId(testId)).blur();
      await driver
        .expectSettings((settings) => settings.instances[0][key])
        .toBe(value);

      expect(renders).toEqual(before);
    },
  );

  it.each([
    [
      "advertiser0Field",
      {
        components: { advertising: true },
        instances: [
          {
            name: "alloy",
            advertising: {
              dspEnabled: true,
              advertiserSettings: [{ advertiserId: "custom", enabled: true }],
            },
          },
        ],
      },
      (settings) =>
        settings.instances[0].advertising.advertiserSettings[0].advertiserId,
      "custom",
    ],
    [
      "transferCookie0Field",
      {
        components: { brandConcierge: true },
        instances: [
          { name: "alloy", conversation: { transferCookies: ["cookie"] } },
        ],
      },
      (settings) => settings.instances[0].conversation.transferCookies[0],
      "cookie",
    ],
    [
      "reportSuitesOverride.0",
      {
        instances: [
          {
            name: "alloy",
            edgeConfigOverrides: {
              development: {
                enabled: true,
                com_adobe_analytics: { reportSuites: ["suite"] },
              },
            },
          },
        ],
      },
      (settings) =>
        settings.instances[0].edgeConfigOverrides.development
          .com_adobe_analytics.reportSuites[0],
      "suite",
    ],
  ])(
    "does not re-render any section when %s changes",
    async (testId, settings, getSetting, initial) => {
      await init(settings);
      const input = field(view.getByTestId(testId));
      await input.expectValue(initial);
      const before = { ...renders };

      await input.focus();
      await userEvent.keyboard("2");
      await userEvent.tab();
      await driver.expectSettings(getSetting).toBe(`${initial}2`);

      expect(renders).toEqual(before);
    },
  );
});
