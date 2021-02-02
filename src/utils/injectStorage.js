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

import baseNamespace from "../constants/namespace";
import startsWith from "./startsWith";

const getStorageByType = (context, storageType, namespace) => {
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
        return context[storageType].getItem(namespace + name);
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
        context[storageType].setItem(namespace + name, value);
        return true;
      } catch (e) {
        return false;
      }
    },
    /**
     * Clear all values in storage that match the namespace.
     */
    clear() {
      try {
        Object.keys(context[storageType]).forEach(key => {
          if (startsWith(key, namespace)) {
            context[storageType].removeItem(key);
          }
        });
        return true;
      } catch (e) {
        return false;
      }
    }
  };
};

export default context => additionalNamespace => {
  const finalNamespace = baseNamespace + additionalNamespace;
  return {
    session: getStorageByType(context, "sessionStorage", finalNamespace),
    persistent: getStorageByType(context, "localStorage", finalNamespace)
  };
};
