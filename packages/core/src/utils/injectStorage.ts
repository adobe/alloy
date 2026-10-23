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

import type { Storage, StorageCreator } from "./types.js";

import baseNamespace from "../constants/namespace.js";

type StorageContext = Pick<Window, "localStorage" | "sessionStorage">;

/**
 * Creates a storage interface for a specific storage type with namespaced keys.
 *
 * @param context - The context object (typically window) that provides storage APIs.
 * @param storageType - The type of storage to use ('localStorage' or 'sessionStorage').
 * @param namespace - The namespace prefix to prepend to all storage keys.
 */
const getStorageByType = (
  context: StorageContext,
  storageType: "localStorage" | "sessionStorage",
  namespace: string,
): Storage => {
  // When storage is disabled on Safari, the mere act of referencing
  // window.localStorage or window.sessionStorage throws an error.
  // For this reason, we wrap in a try-catch.
  return {
    /**
     * Reads a value from storage.
     * @param name The name of the item to be read.
     */
    getItem(name) {
      try {
        return context[storageType].getItem(namespace + name);
      } catch {
        return null;
      }
    },
    /**
     * Saves a value to storage.
     * @param name The name of the item to be saved.
     * @param value The value of the item to be saved.
     * @returns Whether the item was successfully saved to storage.
     */
    setItem(name, value) {
      try {
        context[storageType].setItem(namespace + name, value);
        return true;
      } catch {
        return false;
      }
    },
    /**
     * Clear all values in storage that match the namespace.
     */
    clear() {
      try {
        Object.keys(context[storageType]).forEach((key) => {
          if (key.startsWith(namespace)) {
            context[storageType].removeItem(key);
          }
        });
        return true;
      } catch {
        return false;
      }
    },
  };
};

/**
 * Creates a storage factory function that provides access to both session and persistent storage
 * with namespaced keys. This is a higher-order function that returns a function which can be
 * used to create storage instances with additional namespace suffixes.
 *
 * @param context - The context object (typically window) that provides storage APIs.
 */
export default (context: StorageContext): StorageCreator =>
  (additionalNamespace) => {
    const finalNamespace = baseNamespace + additionalNamespace;
    return {
      session: getStorageByType(context, "sessionStorage", finalNamespace),
      persistent: getStorageByType(context, "localStorage", finalNamespace),
    };
  };
