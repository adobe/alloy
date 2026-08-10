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

/** @import { Storage, NamespacedStorage, StorageService } from "@adobe/alloy-core/services" */

/**
 * In-memory only; nothing persists across process restarts. A future
 * revision can back this with a file, Redis, etc.
 *
 * @returns {Storage}
 */
const createMemoryStorage = () => {
  const store = new Map();
  return {
    getItem(name) {
      return Promise.resolve(store.has(name) ? store.get(name) : null);
    },
    setItem(name, value) {
      store.set(name, value);
      return Promise.resolve(true);
    },
    removeItem(name) {
      store.delete(name);
      return Promise.resolve(true);
    },
    clear() {
      store.clear();
      return Promise.resolve(true);
    },
  };
};

/** @returns {StorageService} */
const createNodeStorageService = () => ({
  createNamespacedStorage() {
    /** @type {NamespacedStorage} */
    return {
      session: createMemoryStorage(),
      persistent: createMemoryStorage(),
    };
  },
});

export default createNodeStorageService;
