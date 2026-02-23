/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import spectrum from "../spectrum.mjs";

/**
 * Provides methods for managing form fields when editing a boolean node.
 */
export default {
  selectConstantTrueValueField: async () => {
    const valueField = spectrum.comboBox("valueField");
    await valueField.openMenu();
    await valueField.selectMenuOption("True");
  },
  selectConstantFalseValueField: async () => {
    const valueField = spectrum.comboBox("valueField");
    await valueField.openMenu();
    await valueField.selectMenuOption("False");
  },
  expectConstantTrueValue: async () => {
    await spectrum.comboBox("valueField").expectValue("true");
  },
  expectConstantFalseValue: async () => {
    await spectrum.comboBox("valueField").expectValue("false");
  },
  enterDataElementValue: async (text) => {
    const valueField = spectrum.comboBox("valueField");
    await valueField.clear();
    await valueField.enterSearch(text);
  },
  expectDataElementValue: async (value) => {
    await spectrum.comboBox("valueField").expectValue(value);
  },
};
