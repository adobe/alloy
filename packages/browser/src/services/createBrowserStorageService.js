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

/** @import { NamespacedStorage, Storage, StorageService } from "@adobe/alloy-core/services" */

import baseNamespace from "@adobe/alloy-core/constants/namespace.js";

/**
 * Wraps a sync browser storage area (`localStorage` / `sessionStorage`) in the
 * async {@link Storage} contract. The mere act of referencing a storage area
 * throws when storage is disabled on Safari, so every access is try/catch'd.
 *
 * @param {string} storageType - "localStorage" or "sessionStorage".
 * @param {string} namespace - Prefix prepended to every key.
 * @returns {Storage}
 */
const wrapStorageArea = (storageType, namespace) => ({
  getItem(name) {
    try {
      return Promise.resolve(window[storageType].getItem(namespace + name));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem(name, value) {
    try {
      window[storageType].setItem(namespace + name, value);
      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  },
  clear() {
    try {
      Object.keys(window[storageType]).forEach((key) => {
        if (key.startsWith(namespace)) {
          window[storageType].removeItem(key);
        }
      });
      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  },
});

/**
 * Browser implementation of {@link StorageService}. Namespaces session and
 * persistent storage under the shared `com.adobe.alloy.` prefix plus a
 * caller-supplied suffix.
 *
 * @returns {StorageService}
 */
const createBrowserStorageService = () => ({
  createNamespacedStorage(additionalNamespace) {
    const finalNamespace = baseNamespace + additionalNamespace;
    /** @type {NamespacedStorage} */
    return {
      session: wrapStorageArea("sessionStorage", finalNamespace),
      persistent: wrapStorageArea("localStorage", finalNamespace),
    };
  },
});

export default createBrowserStorageService;
