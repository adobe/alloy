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
import { Checkbox } from "@react-spectrum/s2";
import useView from "../helpers/useView";
import field from "../helpers/field";
import generateComponentFromForm from "../../../src/view/forms/generateComponentFromForm";
import form from "../../../src/view/forms/form";
import textField from "../../../src/view/forms/textField";
import dataElement from "../../../src/view/forms/dataElement";
import comboBox from "../../../src/view/forms/comboBox";
import radioGroup from "../../../src/view/forms/radioGroup";
import numberField from "../../../src/view/forms/numberField";
import fieldArray from "../../../src/view/forms/fieldArray";
import simpleMap from "../../../src/view/forms/simpleMap";
import objectArray from "../../../src/view/forms/objectArray";
import checkbox from "../../../src/view/forms/checkbox";
import conditional from "../../../src/view/forms/conditional";
import requiredComponent from "../../../src/view/forms/requiredComponent";
import jsonOptionalEditor from "../../../src/view/forms/jsonOptionalEditor";
import FormCheckboxGroup from "../../../src/view/forms/fields/CheckboxGroup";
import FormTextField from "../../../src/view/forms/fields/TextField";
import { rule } from "../../../src/view/forms/validation";

let view;
let driver;
let cleanup;

const renderForm = async (parts, initInfo) => {
  ({ view, driver, cleanup } = await useView(
    generateComponentFromForm(form({}, parts)),
  ));
  await driver.init(initInfo);
};

const expectError = (testId, message) =>
  field(view.getByTestId(testId)).expectError(message);

describe("Form builder validation", () => {
  afterEach(() => cleanup?.());

  it("requires a required text field", async () => {
    await renderForm(
      [textField({ name: "name", label: "Name", isRequired: true })],
      {
        settings: {},
      },
    );

    await driver.expectValidate().toBe(false);
    await expectError("nameTextField", /please provide a name/i);
  });

  it("requires a data element field to be a data element", async () => {
    await renderForm([dataElement({ name: "xdm", label: "XDM" })], {
      settings: { xdm: "not a data element" },
    });

    await driver.expectValidate().toBe(false);
    await expectError("xdmTextField", /please specify a data element/i);
  });

  it("requires a combo box value from its list or a data element", async () => {
    await renderForm(
      [
        comboBox({
          name: "type",
          label: "Type",
          items: [{ value: "known", label: "Known" }],
        }),
      ],
      { settings: { type: "unknown" } },
    );

    await driver.expectValidate().toBe(false);
    await expectError("typeField", /choose a type from the list/i);
  });

  it("requires a radio group data element to be a data element", async () => {
    await renderForm(
      [
        radioGroup({
          name: "mode",
          label: "Mode",
          items: [{ value: "auto", label: "Auto" }],
        }),
      ],
      { settings: { mode: "auto" } },
    );

    await field(view.getByTestId("modeDataElement")).click();
    await field(view.getByTestId("modeDataElementField")).fill("not %valid");

    await driver.expectValidate().toBe(false);
    await expectError("modeDataElementField", /please specify a data element/i);
  });

  it("requires a required number field", async () => {
    await renderForm(
      [numberField({ name: "timeout", label: "Timeout", isRequired: true })],
      { settings: {} },
    );

    await driver.expectValidate().toBe(false);
    await expectError(
      "timeoutNumberField",
      /please provide the timeout as a number/i,
    );
  });

  it("requires at least one item in a required field array", async () => {
    await renderForm(
      [
        fieldArray({
          name: "surfaces",
          label: "Surfaces",
          singularLabel: "Surface",
          isRequired: true,
        }),
      ],
      { settings: {} },
    );

    await driver.expectValidate().toBe(false);
    await expectError("surfaces0Field", /please provide at least one surface/i);
  });

  describe("simple map", () => {
    const headers = () =>
      simpleMap({
        name: "headers",
        label: "Headers",
        singularLabel: "Header",
        keyLabel: "Key",
        keyLabelPlural: "Keys",
        valueLabel: "Value",
      });

    it("requires a key when a value is provided", async () => {
      await renderForm([headers()], { settings: { headers: { "": "value" } } });

      await driver.expectValidate().toBe(false);
      await expectError("Key0Field", /please provide a key/i);
    });

    it("does not allow duplicate keys", async () => {
      await renderForm([headers()], { settings: { headers: { a: "1" } } });

      await field(view.getByTestId("headersAddButton")).click();
      await field(view.getByTestId("Key1Field")).fill("a");

      await driver.expectValidate().toBe(false);
      await expectError("Key1Field", /duplicate keys are not allowed/i);
    });
  });

  describe("object array", () => {
    const metadata = () =>
      objectArray(
        {
          name: "metadata",
          label: "Metadata",
          singularLabel: "Scope",
          objectKey: "scope",
          objectLabelPlural: "Scopes",
        },
        [
          textField({ name: "scope", label: "Scope" }),
          textField({ name: "selector", label: "Selector" }),
        ],
      );

    it("ignores empty rows", async () => {
      await renderForm([metadata()], {
        settings: { metadata: { first: { selector: "#first" } } },
      });

      await field(view.getByTestId("metadataAddButton")).click();

      await driver.expectValidate().toBe(true);
    });

    it("requires a key when other values are provided", async () => {
      await renderForm([metadata()], {
        settings: { metadata: { first: { selector: "#first" } } },
      });

      await field(view.getByTestId("metadataAddButton")).click();
      await field(view.getByTestId("metadata.1.selectorTextField")).fill(
        "#second",
      );

      await driver.expectValidate().toBe(false);
      await expectError("metadata.1.scopeTextField", /please provide a scope/i);
    });

    it("does not allow duplicate keys", async () => {
      await renderForm([metadata()], {
        settings: { metadata: { first: { selector: "#first" } } },
      });

      await field(view.getByTestId("metadataAddButton")).click();
      await field(view.getByTestId("metadata.1.scopeTextField")).fill("first");

      await driver.expectValidate().toBe(false);
      await expectError(
        "metadata.1.scopeTextField",
        /duplicate scopes are not allowed/i,
      );
    });
  });

  describe("conditional", () => {
    const parts = () => [
      checkbox({ name: "enabled", label: "Enabled" }),
      conditional({ args: "enabled", condition: (enabled) => enabled }, [
        textField({ name: "id", label: "ID", isRequired: true }),
      ]),
    ];

    it("validates its fields when the condition holds", async () => {
      await renderForm(parts(), { settings: { enabled: true } });

      await driver.expectValidate().toBe(false);
      await expectError("idTextField", /please provide a id/i);
    });

    it("skips its fields when the condition does not hold", async () => {
      await renderForm(parts(), { settings: { enabled: false } });

      await driver.expectValidate().toBe(true);
    });
  });

  describe("required component", () => {
    const parts = () => [
      requiredComponent(
        {
          requiredComponent: "personalization",
          title: "Personalization",
          whole: true,
        },
        [textField({ name: "scope", label: "Scope" })],
      ),
    ];

    it("blocks saving a new view when the component is disabled", async () => {
      await renderForm(parts(), {
        extensionSettings: { components: { personalization: false } },
        settings: null,
      });

      await driver.expectValidate().toBe(false);
    });

    it("returns its settings before the first validation", async () => {
      await renderForm(parts(), {
        extensionSettings: { components: { personalization: true } },
        settings: { scope: "products" },
      });

      await driver.expectSettings().toEqual({ scope: "products" });
    });

    it("allows saving when the component is enabled", async () => {
      await renderForm(parts(), {
        extensionSettings: { components: { personalization: true } },
        settings: null,
      });

      await driver.expectValidate().toBe(true);
    });
  });

  it("requires the whole JSON value to be valid JSON or a data element", async () => {
    await renderForm(
      [
        jsonOptionalEditor({ name: "data", label: "Data" }, [
          textField({ name: "a", label: "A" }),
        ]),
      ],
      { settings: "not json" },
    );

    await driver.expectValidate().toBe(false);
    await expectError(
      "dataWhole",
      /please provide a valid json object or a data element/i,
    );
  });

  it("shows the error of an empty checkbox group on save", async () => {
    await renderForm(
      [
        {
          getInitialValues: () => ({ solutions: [] }),
          getSettings: ({ values }) => ({ solutions: values.solutions }),
          validationShape: {
            solutions: rule(
              (solutions) => solutions.length > 0,
              "Please select at least one solution.",
            ),
          },
          Component: () => (
            <FormCheckboxGroup name="solutions" label="Solutions">
              <Checkbox value="analytics">Analytics</Checkbox>
            </FormCheckboxGroup>
          ),
        },
      ],
      { settings: {} },
    );

    await driver.expectValidate().toBe(false);
    await expect
      .element(view.getByText("Please select at least one solution."))
      .toBeVisible();
  });

  it("shows field validator errors on the first save of an already invalid form", async () => {
    await renderForm(
      [
        textField({ name: "name", label: "Name", isRequired: true }),
        checkbox({ name: "enabled", label: "Enabled" }),
        conditional({ args: "enabled", condition: (enabled) => enabled }, [
          {
            getInitialValues: ({ initInfo }) => ({
              code: initInfo.settings.code,
            }),
            Component: () => (
              <FormTextField
                data-test-id="codeField"
                name="code"
                label="Code"
                validate={(code) => (code === "bad" ? "Bad code." : undefined)}
              />
            ),
          },
        ]),
      ],
      { settings: { enabled: false, code: "bad" } },
    );

    await field(view.getByTestId("enabledCheckbox")).click();

    await driver.expectValidate().toBe(false);
    await expectError("codeField", /bad code/i);
  });
});
