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
import { Form, Radio } from "@react-spectrum/s2";
import FormikRadioGroup from "../../../src/view/forms/fields/RadioGroup";
import renderView from "../helpers/renderView";

let view;

const setup = async (props = {}, formLabelPosition = null) => {
  view = await renderView(() => (
    <Formik initialValues={{ delivery: "standard" }} onSubmit={() => {}}>
      {({ values }) => {
        const group = (
          <FormikRadioGroup
            name="delivery"
            label="Delivery"
            orientation="horizontal"
            description="Choose a delivery method."
            {...props}
          >
            <Radio value="standard">Standard</Radio>
            <Radio value="express">Express</Radio>
          </FormikRadioGroup>
        );

        return (
          <>
            {formLabelPosition ? (
              <Form labelPosition={formLabelPosition}>{group}</Form>
            ) : (
              group
            )}
            <output data-test-id="value">{values.delivery}</output>
          </>
        );
      }}
    </Formik>
  ));
};

const labelContainer = () => {
  const group = view.getByRole("radiogroup", { name: "Delivery" }).element();
  const labelId = group.getAttribute("aria-labelledby").split(" ")[0];
  return document.getElementById(labelId).parentElement;
};

describe("Radio group label spacing", () => {
  afterEach(() => {
    view?.unmount();
  });

  it("uses compact label spacing for standalone horizontal groups", async () => {
    await setup();

    expect(
      Number.parseFloat(getComputedStyle(labelContainer()).paddingBottom),
    ).toBeCloseTo(8, 1);
    await expect
      .element(view.getByText("Choose a delivery method."))
      .toBeVisible();
  });

  it.each([
    ["vertical", { orientation: "vertical" }, null, "14px"],
    ["side-labeled", { labelPosition: "side" }, null, "0px"],
    ["form-managed top-labeled", {}, "top", "14px"],
    ["form-managed side-labeled", {}, "side", "0px"],
  ])(
    "preserves native spacing for %s groups",
    async (name, props, formLabelPosition, expected) => {
      await setup(props, formLabelPosition);

      expect(getComputedStyle(labelContainer()).paddingBottom).toBe(expected);
    },
  );

  it("does not add label padding to an unlabeled group", async () => {
    await setup({ label: undefined, "aria-label": "Delivery" });

    const group = view.getByRole("radiogroup", { name: "Delivery" }).element();
    expect(getComputedStyle(group.firstElementChild).paddingBottom).toBe("0px");
  });

  it("preserves mouse and keyboard selection", async () => {
    await setup();

    await view.getByText("Express", { exact: true }).click();
    await expect
      .element(view.getByRole("radio", { name: "Express" }))
      .toBeChecked();
    await expect
      .element(view.getByTestId("value"))
      .toHaveTextContent("express");

    await userEvent.keyboard("{ArrowLeft}");
    await expect
      .element(view.getByRole("radio", { name: "Standard" }))
      .toBeChecked();
    await expect
      .element(view.getByTestId("value"))
      .toHaveTextContent("standard");
  });
});
