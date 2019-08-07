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

import { isNonEmptyString } from "../utils";

export default (cookieProxy, componentNamespace) => {
  if (!isNonEmptyString(componentNamespace)) {
    throw Error(
      "No cookie namespace.  Please define 'abbreviation' on the component."
    );
  }

  return {
    /**
     * Returns a value from the Alloy cookie for a given key.
     * @param {string} key
     */
    get(key) {
      const currentCookie = cookieProxy.get();
      return (
        currentCookie &&
        currentCookie[componentNamespace] &&
        currentCookie[componentNamespace][key]
      );
    },
    /**
     * Sets a value in the Alloy cookie for a given key.
     * @param {string} key
     * @param {string} value
     */
    set(key, value) {
      const currentCookie = cookieProxy.get() || {};
      const updatedCookie = {
        ...currentCookie,
        [componentNamespace]: {
          ...currentCookie[componentNamespace],
          [key]: value
        }
      };
      cookieProxy.set(updatedCookie);
    },
    /**
     * Removes a value from the Alloy cookie for a given key.
     * @param {string} key
     */
    remove(key) {
      const currentCookie = cookieProxy.get();
      if (currentCookie && currentCookie[componentNamespace]) {
        const updatedCookie = {
          ...currentCookie,
          [componentNamespace]: {
            ...currentCookie[componentNamespace]
          }
        };
        delete updatedCookie[componentNamespace][key];
        cookieProxy.set(updatedCookie);
      }
    }
  };
};
