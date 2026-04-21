/*
Copyright 2025 Adobe. All rights reserved.
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
 * Provides methods for managing form fields when editing an enum node.
 */
export default {
  selectEnumValue: async (label) => {
    const valueField = spectrum.comboBox("valueField");
    await valueField.openMenu();
    await valueField.selectMenuOption(label);
  },
  expectEnumValue: async (value) => {
    await spectrum.comboBox("valueField").expectValue(value);
  },
  enterCustomValue: async (text) => {
    const valueField = spectrum.comboBox("valueField");
    await valueField.clear();
    await valueField.enterSearch(text);
  },
  expectValue: async (value) => {
    await spectrum.comboBox("valueField").expectValue(value);
  },
};
