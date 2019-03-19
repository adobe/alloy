/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import window from "@adobe/reactor-window";
// TODO: What namespace do we use?
const NAMESPACE = "com.adobe.aep.";

export default (storageType, additionalNamespace) => {
  const finalNamespace = NAMESPACE + (additionalNamespace || "");

  // When storage is disabled on Safari, the mere act of referencing
  // window.localStorage or window.sessionStorage throws an error.
  // For this reason, we wrap in a try-catch.
  return {
    /**
     * Reads a value from storage.
     * @param {string} name The name of the item to be read.
     * @returns {string}
     */
    getItem(name) {
      try {
        return window[storageType].getItem(finalNamespace + name);
      } catch (e) {
        return null;
      }
    },
    /**
     * Saves a value to storage.
     * @param {string} name The name of the item to be saved.
     * @param {string} value The value of the item to be saved.
     * @returns {boolean} Whether the item was successfully saved to storage.
     */
    setItem(name, value) {
      try {
        window[storageType].setItem(finalNamespace + name, value);
        return true;
      } catch (e) {
        return false;
      }
    }
  };
};
