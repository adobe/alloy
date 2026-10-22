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
import objectArray from "../../../src/view/forms/objectArray";
import textField from "../../../src/view/forms/textField";
import FormElementContainer from "../../../src/view/components/formElementContainer";
import renderView from "../helpers/renderView";

const rows = objectArray(
  {
    name: "metadata",
    singularLabel: "Scope",
    dataElementSupported: false,
    objectKey: "scope",
    objectLabelPlural: "Scopes",
  },
  [
    textField({
      name: "scope",
      label: "Scope",
      description:
        "Enter the scope (i.e. mbox or AJO surface name) for the propositions that you would like to apply these settings",
    }),
    textField({ name: "selector", label: "Selector" }),
  ],
);
const { Component } = rows;
let view;

const setup = async (width = 960) => {
  view = await renderView(() => (
    <div style={{ width }}>
      <Formik
        initialValues={rows.getInitialValues({
          initInfo: {
            settings: {
              metadata: {
                first: { selector: "#first" },
                second: { selector: "#second" },
              },
            },
          },
        })}
        onSubmit={() => {}}
      >
        {({ values }) => (
          <FormElementContainer>
            <Component />
            <output data-test-id="settings">
              {JSON.stringify(rows.getSettings({ values }))}
            </output>
          </FormElementContainer>
        )}
      </Formik>
    </div>
  ));
};

describe("Object array remove action", () => {
  afterEach(() => view?.unmount());

  it.each([960, 360])(
    "stays beside the field group at %i px",
    async (width) => {
      await setup(width);
      const field = view.getByTestId("metadata.0.scopeTextField").element();
      const fieldGroup = field.parentElement.getBoundingClientRect();
      const fieldRect = field.getBoundingClientRect();
      const button = view.getByTestId("metadata0RemoveButton").element();
      const buttonRect = button.getBoundingClientRect();
      const well = button.parentElement.parentElement.parentElement;

      expect(buttonRect.right).toBeCloseTo(fieldGroup.right, 1);
      expect(buttonRect.right - fieldRect.right).toBeLessThanOrEqual(48);
      expect(buttonRect.right).toBeLessThanOrEqual(fieldGroup.left + width);
      expect(buttonRect.top).toBeGreaterThan(fieldGroup.bottom);
      expect(buttonRect.height).toBeGreaterThanOrEqual(32);
      expect(well.getBoundingClientRect().right).toBeLessThanOrEqual(
        well.parentElement.getBoundingClientRect().right,
      );
    },
  );

  it.each(["mouse", "keyboard"])(
    "removes only the selected row using %s",
    async (interaction) => {
      await setup();
      const remove = view.getByTestId("metadata0RemoveButton");
      if (interaction === "keyboard") {
        remove.element().focus();
        await userEvent.keyboard("{Enter}");
      } else {
        await remove.click();
      }

      await expect
        .element(view.getByRole("textbox", { name: "Scope" }))
        .toHaveValue("second");
      await expect
        .element(view.getByRole("textbox", { name: "Selector" }))
        .toHaveValue("#second");
      await expect
        .element(view.getByTestId("settings"))
        .toHaveTextContent(
          JSON.stringify({ metadata: { second: { selector: "#second" } } }),
        );
    },
  );
});
