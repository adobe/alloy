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

import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { Formik } from "formik";
import { ComboBoxItem } from "@react-spectrum/s2";
import FormikComboBox from "../../../src/view/forms/fields/ComboBox";
import FormikKeyedComboBox from "../../../src/view/forms/fields/KeyedComboBox";
import renderView from "../helpers/renderView";

const items = [
  { value: "enabled", label: "Enabled" },
  { value: "disabled", label: "Disabled" },
];

const renderItem = (item) => (
  <ComboBoxItem key={item.value} id={item.value}>
    {item.label}
  </ComboBoxItem>
);

describe.each([
  ["ComboBox", FormikComboBox],
  ["KeyedComboBox", FormikKeyedComboBox],
])("%s data element input", (name, Component) => {
  let view;
  let input;

  const setup = async () => {
    const keyedProps =
      Component === FormikKeyedComboBox
        ? {
            items,
            getKey: (item) => item.value,
            getLabel: (item) => item.label,
          }
        : {};

    view = await renderView(() => (
      <Formik initialValues={{ setting: "" }} onSubmit={() => {}}>
        {({ values }) => (
          <>
            <Component
              {...keyedProps}
              name="setting"
              label="Setting"
              allowsCustomValue
              width="size-5000"
            >
              {Component === FormikKeyedComboBox
                ? renderItem
                : items.map(renderItem)}
            </Component>
            <output data-test-id="value">{values.setting}</output>
          </>
        )}
      </Formik>
    ));
    input = view.getByRole("combobox", { name: "Setting" });
  };

  afterEach(() => {
    view?.unmount();
  });

  it("keeps suggestions closed while entering a data element", async () => {
    await setup();
    await input.fill("%");
    await expect.element(input).toHaveAttribute("aria-expanded", "false");
    await input.fill("%myDataElement");
    await expect.element(input).toHaveAttribute("aria-expanded", "false");
    await input.fill("%myDataElement%");
    await expect.element(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.tab();
    await expect
      .element(view.getByTestId("value"))
      .toHaveTextContent("%myDataElement%");
  });

  it("closes existing suggestions when input becomes a data element", async () => {
    await setup();
    await input.fill("En");
    await expect.element(input).toHaveAttribute("aria-expanded", "true");
    await expect
      .element(view.getByRole("option", { name: "Enabled" }))
      .toBeVisible();

    await input.fill("%myDataElement");
    await expect.element(input).toHaveAttribute("aria-expanded", "false");

    await expect.element(input).toHaveFocus();
    await input.fill("Di");
    await expect.element(input).toHaveAttribute("aria-expanded", "true");
    await expect
      .element(view.getByRole("option", { name: "Disabled" }))
      .toBeVisible();
  });

  it("still allows opening the list deliberately to select an option", async () => {
    await setup();
    await input.fill("%myDataElement%");
    await view.getByRole("button", { name: /Show suggestions/ }).click();
    await expect.element(input).toHaveAttribute("aria-expanded", "true");
    await view.getByRole("option", { name: "Disabled" }).click();
    await expect.element(input).toHaveAttribute("aria-expanded", "false");
    await userEvent.tab();
    await expect
      .element(view.getByTestId("value"))
      .toHaveTextContent(name === "KeyedComboBox" ? "disabled" : "Disabled");
  });

  it("supports keyboard opening without losing the data element", async () => {
    await setup();
    await input.fill("%myDataElement%");
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(input).toHaveAttribute("aria-expanded", "true");
    await expect
      .element(view.getByRole("option", { name: "Enabled" }))
      .toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(input).toHaveAttribute("aria-expanded", "false");
    await expect.element(input).toHaveValue("%myDataElement%");
  });
});
