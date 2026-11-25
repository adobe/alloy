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

import { expect } from "vitest";
import field from "../field";
import { TIMEOUT } from "./timeout";

export default (view) => {
  const valueField = () => field(view.getByTestId("valueField"));
  const strategy = (testId) => field(view.getByTestId(testId));

  // String, integer and number editors all render a plain text field.
  const text = {
    enterValue: (value) => valueField().fill(value),
    clear: () => valueField().clear(),
    expectValue: (value) => valueField().expectValue(value),
    expectVisible: () => valueField().expectVisible(),
    expectHidden: () => valueField().expectHidden(),
    expectError: (message) => valueField().expectError(message),
  };

  // Boolean and enum editors render a combo box that also accepts a
  // data element as a custom value.
  const comboBox = {
    select: (label) => valueField().selectOption(label),
    enterCustomValue: (value) => valueField().fill(value),
    expectValue: (value) => valueField().expectValue(value),
    expectError: (message) => valueField().expectError(message),
  };

  const strategies = {
    selectParts: () => strategy("partsPopulationStrategyField").check(),
    selectWhole: () => strategy("wholePopulationStrategyField").check(),
    expectPartsSelected: () =>
      strategy("partsPopulationStrategyField").expectChecked(),
    expectWholeSelected: () =>
      strategy("wholePopulationStrategyField").expectChecked(),
  };

  return {
    string: text,
    integer: text,
    number: text,
    boolean: {
      ...comboBox,
      selectTrue: () => comboBox.select("True"),
      selectFalse: () => comboBox.select("False"),
      expectTrue: () => comboBox.expectValue("True"),
      expectFalse: () => comboBox.expectValue("False"),
    },
    enum: comboBox,
    object: { ...strategies, ...text },
    // The key/value form of the `target` / `audiencemanager` nodes of a data
    // variable (objectJsonEdit.jsx); the whole-object value is `...text`.
    keyValue: {
      ...strategies,
      ...text,
      key: (index) => field(view.getByTestId(`keyField${index}`)),
      value: (index) => field(view.getByTestId(`valueField${index}`)),
      addRow: () => field(view.getByTestId("addPropertyButton")).click(),
    },
    array: {
      ...strategies,
      ...text,
      addItem: () => field(view.getByTestId("addItemButton")).click(),
      removeItem: (index) =>
        field(view.getByTestId(`item${index}RemoveButton`)).click(),
      selectItem: (index) =>
        field(view.getByTestId(`item${index}SelectButton`)).click(),
      expectItemCount: (count) =>
        expect
          .poll(
            () => view.getByTestId(/^item\d+SelectButton$/).elements().length,
            TIMEOUT,
          )
          .toBe(count),
    },
  };
};
