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

import type { Storage } from "../../../services/types.js";

/** The subset of a platform or in-memory storage the event registry uses. */
export interface EventStorage {
  getItem: (key: string) => string | null | Promise<string | null>;
  setItem: (key: string, value: string) => unknown;
}

export const createRestoreStorage = (
  storage: EventStorage,
  storageKey: string,
) => {
  return async <T>(defaultValue: T): Promise<[T, number]> => {
    try {
      const stored = await storage.getItem(storageKey);
      if (stored == null) return [defaultValue, 0];
      const s: T = JSON.parse(stored);
      return [s, stored.length];
      // eslint-disable-next-line no-empty
    } catch {}

    return [defaultValue, 0];
  };
};

export const createSaveStorage =
  (storage: EventStorage, storageKey: string) => (value: unknown) => {
    const result = storage.setItem(storageKey, JSON.stringify(value));
    // A thenable setItem result is the async platform storage's Promise.
    if (result && typeof (result as Promise<unknown>).then === "function") {
      (result as Promise<unknown>).catch(() => {});
    }
  };

export const createInMemoryStorage = () => {
  const inMemoryStorage: Record<string, string> = {};

  return {
    getItem: (key: string) => {
      return key in inMemoryStorage ? inMemoryStorage[key] : null;
    },

    setItem: (key: string, value: string) => {
      inMemoryStorage[key] = value;
    },
  };
};

export const clearLocalStorage = (storage: Pick<Storage, "clear">) => {
  storage.clear();
};
