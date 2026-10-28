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
  const counts = { overrides: 0, advanced: 0 };
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

describe("Configuration render isolation", () => {
  let view;
  let driver;
  let cleanup;

  beforeEach(async () => {
    ({ view, driver, cleanup } = await useView(ConfigurationView));
    await driver.init({
      settings: { instances: [{ name: "alloy", edgeDomain: "a.example.com" }] },
    });
    await field(view.getByTestId("nameField")).expectValue("alloy");
    // The datastream catalog finishes loading after init and re-renders the
    // instance panels; wait for it so only the edit is measured.
    await field(
      view.getByRole("button", { name: "Refresh datastreams" }).first(),
    ).expectEnabled();
  });

  afterEach(() => cleanup());

  it.each([
    ["edgeDomainField", "edgeDomain", "b.example.com"],
    ["nameField", "name", "renamed"],
  ])(
    "does not re-render unrelated sections when %s changes",
    async (testId, key, value) => {
      const before = { ...renders };

      await view.getByTestId(testId).getByRole("textbox").fill(value);
      await field(view.getByTestId(testId)).blur();
      await driver
        .expectSettings((settings) => settings.instances[0][key])
        .toBe(value);

      expect(renders).toEqual(before);
    },
  );
});
