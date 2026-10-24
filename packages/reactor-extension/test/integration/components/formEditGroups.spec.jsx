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
import simpleMap from "../../../src/view/forms/simpleMap";
import textField from "../../../src/view/forms/textField";
import ObjectJsonEdit from "../../../src/view/components/objectEditor/objectJsonEdit";
import Identity from "../../../src/view/dataElements/identityMap/components/Identity";
import FormElementContainer from "../../../src/view/components/formElementContainer";
import renderView from "../helpers/renderView";

const map = simpleMap({
  name: "context",
  label: "Context",
  singularLabel: "Context item",
  keyLabel: "Key",
  keyLabelPlural: "Keys",
  valueLabel: "Value",
});
const horizontal = objectArray(
  {
    name: "properties",
    singularLabel: "Property",
    horizontal: true,
    dataElementSupported: false,
  },
  [textField({ name: "value", label: "Value", width: "size-3000" })],
);
let view;

const setup = async (Component, initialValues) => {
  view = await renderView(() => (
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {({ values }) => (
        <FormElementContainer>
          <Component />
          <output data-test-id="values">{JSON.stringify(values)}</output>
        </FormElementContainer>
      )}
    </Formik>
  ));
};

const expectEditGroup = (name) => {
  const element = view.getByRole("group", { name, exact: true }).element();
  const card = element.parentElement.parentElement;
  expect(element.tagName).toBe("DIV");
  expect(element.tabIndex).toBe(-1);
  expect(element.hasAttribute("aria-selected")).toBe(false);
  expect(element.hasAttribute("href")).toBe(false);
  expect(card.tabIndex).toBe(-1);
  expect(card.hasAttribute("aria-selected")).toBe(false);
  expect(card.hasAttribute("href")).toBe(false);
  expect(getComputedStyle(card).overflow).toBe("clip");
  expect(getComputedStyle(element.parentElement).display).toBe("grid");
  return card;
};

describe("Former Well edit groups", () => {
  afterEach(() => view?.unmount());

  it("keeps simple map editing, adding and keyboard removal inside a native group", async () => {
    await setup(
      map.Component,
      map.getInitialValues({
        initInfo: { settings: { context: { page: "home" } } },
      }),
    );
    expectEditGroup("Context item 1");
    await view.getByTestId("Value0Field").getByRole("textbox").fill("updated");
    expect(
      map.getSettings({
        values: JSON.parse(view.getByTestId("values").element().textContent),
      }),
    ).toEqual({ context: { page: "updated" } });
    await view.getByTestId("contextAddButton").click();
    expectEditGroup("Context item 2");
    view.getByTestId("context0RemoveButton").element().focus();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(view.getByTestId("Key0Field").getByRole("textbox"))
      .toHaveValue("");
    await expect
      .element(view.getByTestId("Value0Field").getByRole("textbox"))
      .toHaveValue("");
  });

  it("preserves horizontal array editing and removal inside a native card", async () => {
    await setup(
      horizontal.Component,
      horizontal.getInitialValues({
        initInfo: {
          settings: { properties: [{ value: "first" }, { value: "second" }] },
        },
      }),
    );
    expectEditGroup("Property");
    await view
      .getByTestId("properties.1.valueTextField")
      .getByRole("textbox")
      .fill("updated");
    await view.getByTestId("properties0RemoveButton").click();
    await expect
      .element(
        view.getByTestId("properties.0.valueTextField").getByRole("textbox"),
      )
      .toHaveValue("updated");
    expect(
      horizontal.getSettings({
        values: JSON.parse(view.getByTestId("values").element().textContent),
      }),
    ).toEqual({ properties: [{ value: "updated" }] });
    await view.getByTestId("propertiesAddButton").click();
    await expect
      .element(
        view.getByTestId("properties.1.valueTextField").getByRole("textbox"),
      )
      .toHaveValue("");
  });

  it("preserves the JSON attribute group's indentation and edit flow", async () => {
    await setup(
      () => <ObjectJsonEdit displayName="Attributes" fieldName="attributes" />,
      {
        attributes: {
          populationStrategy: "parts",
          isPartsPopulationStrategySupported: true,
          items: [{ key: "page", value: "home" }],
          schema: {},
        },
      },
    );
    const group = expectEditGroup("Attributes");
    expect(getComputedStyle(group).marginInlineStart).toBe("24px");
    await view.getByTestId("valueField0").getByRole("textbox").fill("updated");
    await expect
      .element(view.getByTestId("values"))
      .toHaveTextContent('"items":[{"key":"page","value":"updated"}]');
    await view.getByTestId("addPropertyButton").click();
    await view.getByTestId("item0RemoveButton").click();
    await expect
      .element(view.getByTestId("keyField0").getByRole("textbox"))
      .toHaveValue("");
    await expect
      .element(view.getByTestId("valueField0").getByRole("textbox"))
      .toHaveValue("");
  });

  it("keeps identity identifiers independently editable with the same surface treatment", async () => {
    await setup(() => <Identity context={{ current: { namespaces: [] } }} />, {
      identities: [
        {
          namespaceCode: "Email",
          identifiers: [
            {
              id: "first@example.com",
              authenticatedState: "ambiguous",
              primary: false,
            },
          ],
        },
      ],
    });
    expectEditGroup("Identifier 1");
    await view
      .getByTestId("identity0idField0")
      .getByRole("textbox")
      .fill("updated@example.com");
    await expect
      .element(view.getByTestId("values"))
      .toHaveTextContent('"id":"updated@example.com"');
    await view.getByTestId("addIdentifier0Button").click();
    expectEditGroup("Identifier 2");
    await view.getByTestId("deleteIdentifier0Button0").click();
    await expect
      .element(view.getByTestId("identity0idField0").getByRole("textbox"))
      .toHaveValue("");
  });
});
