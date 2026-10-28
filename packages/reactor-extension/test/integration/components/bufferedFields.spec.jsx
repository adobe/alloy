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

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { useFormikContext } from "formik";
import { Button, ComboBoxItem } from "@react-spectrum/s2";
import ExtensionView from "../../../src/view/components/extensionView";
import TextField from "../../../src/view/forms/fields/TextField";
import TextArea from "../../../src/view/forms/fields/TextArea";
import ComboBox from "../../../src/view/forms/fields/ComboBox";
import KeyedComboBox from "../../../src/view/forms/fields/KeyedComboBox";
import NumberField from "../../../src/view/forms/fields/NumberField";
import { CommitOnBlurContext } from "../../../src/view/forms/fields/useDraftValue";
import useView from "../helpers/useView";
import field from "../helpers/field";

const Fields = () => {
  const { setFieldValue, values } = useFormikContext();
  return (
    <>
      <TextField name="text" label="Text" data-test-id="text" />
      <TextArea name="area" label="Area" data-test-id="area" />
      <ComboBox
        name="combo"
        label="Combo"
        data-test-id="combo"
        allowsCustomValue
      >
        <ComboBoxItem id="chosen">Chosen</ComboBoxItem>
      </ComboBox>
      <KeyedComboBox
        name="keyed"
        label="Keyed"
        data-test-id="keyed"
        allowsCustomValue
        items={[{ key: "chosen", label: "Chosen" }]}
        getKey={(item) => item.key}
        getLabel={(item) => item.label}
      >
        {(item) => <ComboBoxItem id={item.key}>{item.label}</ComboBoxItem>}
      </KeyedComboBox>
      <NumberField name="number" label="Number" data-test-id="number" />
      <output data-test-id="dependent" style={{ display: "block", height: 24 }}>
        {values.text}
      </output>
      <Button onPress={() => setFieldValue("text", "external")}>
        Replace text
      </Button>
    </>
  );
};

const ImmediateView = () => (
  <ExtensionView
    getInitialValues={() => ({
      text: "",
      area: "",
      combo: "",
      keyed: "",
      number: 10,
    })}
    getSettings={({ values }) => values}
    render={() => <Fields />}
  />
);

const View = () => (
  <CommitOnBlurContext.Provider value>
    <ImmediateView />
  </CommitOnBlurContext.Provider>
);

describe.each([true, false])(
  "Text fields with commit-on-blur=%s",
  (commitOnBlur) => {
    let view;
    let driver;
    let cleanup;

    beforeEach(async () => {
      ({ view, driver, cleanup } = await useView(
        commitOnBlur ? View : ImmediateView,
      ));
      await driver.init();
    });

    afterEach(() => cleanup());

    it.each(["text", "area", "combo", "keyed"])(
      "publishes %s at the configured boundary, including the final keystroke",
      async (name) => {
        const control = view
          .getByTestId(name)
          .locator("input, textarea")
          .first();
        const input = field(control);
        await input.focus();
        await userEvent.keyboard("draft");

        await expect.element(control).toHaveValue("draft");
        await driver
          .expectSettings((settings) => settings[name])
          .toBe(commitOnBlur ? "" : "draft");

        await userEvent.tab();

        await driver.expectSettings((settings) => settings[name]).toBe("draft");
      },
    );

    it("updates dependent UI and accepts external changes after committing", async () => {
      const input = field(view.getByTestId("text"));
      await input.focus();
      await userEvent.keyboard("draft");
      await expect
        .element(view.getByTestId("dependent"))
        .toHaveTextContent(commitOnBlur ? /^$/ : /^draft$/);

      await view.getByRole("button", { name: "Replace text" }).click();

      await driver.expectSettings((settings) => settings.text).toBe("external");
      await input.expectValue("external");
      await expect
        .element(view.getByTestId("dependent"))
        .toHaveTextContent("external");
    });

    it("commits the final numeric input before the blur handler completes", async () => {
      const input = view.getByTestId("number").getByRole("textbox");
      await input.fill("25");
      await driver.expectSettings((settings) => settings.number).toBe(10);
      await userEvent.tab();

      await driver.expectSettings((settings) => settings.number).toBe(25);
    });

    it.each([
      ["combo", "Chosen"],
      ["keyed", "chosen"],
    ])("commits %s selections without requiring blur", async (name, value) => {
      await field(view.getByTestId(name)).selectOption("Chosen");

      await driver.expectSettings((settings) => settings[name]).toBe(value);
    });

    it.each(["combo", "keyed"])(
      "opens %s suggestions on focus only in configuration",
      async (name) => {
        const input = view.getByTestId(name).getByRole("combobox");
        await field(input).focus();

        await expect
          .element(input)
          .toHaveAttribute("aria-expanded", String(commitOnBlur));
      },
    );
  },
);
