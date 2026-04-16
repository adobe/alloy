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
 * Provides methods for managing form fields when editing a string node.
 */
export default {
  enterValue: async (text) => {
    await spectrum.textField("valueField").typeText(text);
  },
  expectValue: async (text) => {
    await spectrum.textField("valueField").expectValue(text);
  },
  expectExists: async () => {
    await spectrum.textField("valueField").expectExists();
  },
  expectNotExists: async () => {
    await spectrum.textField("valueField").expectNotExists();
  },
};
