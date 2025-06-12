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

export const createRestoreStorage = (storage, storageKey) => {
  return (defaultValue) => {
    try {
      const stored = storage.getItem(storageKey);
      const s = JSON.parse(stored);
      return [s, stored.length];
      // eslint-disable-next-line no-empty
    } catch {}

    return [defaultValue, 0];
  };
};

export const createSaveStorage = (storage, storageKey) => (value) => {
  storage.setItem(storageKey, JSON.stringify(value));
};

export const createInMemoryStorage = () => {
  const inMemoryStorage = {};

  return {
    getItem: (key) => {
      return key in inMemoryStorage ? inMemoryStorage[key] : null;
    },

    setItem: (key, value) => {
      inMemoryStorage[key] = value;
    },
  };
};

export const clearLocalStorage = (storage) => {
  storage.clear();
};
