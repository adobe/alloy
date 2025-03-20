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

import { vi, beforeEach, describe, it, expect } from "vitest";
import {
  createInMemoryStorage,
  createRestoreStorage,
  createSaveStorage,
} from "../../../../../../src/components/RulesEngine/utils/storage.js";

describe("RulesEngine:utils", () => {
  let storage;
  let inMemoryStorage;

  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    inMemoryStorage = createInMemoryStorage();
  });

  it("restores from storage", () => {
    storage.getItem.mockReturnValue(
      '{ "something": true, "color": "orange", "person": { "height": 5.83 } }',
    );
    const restore = createRestoreStorage(storage, "zoink");
    expect(
      restore({
        good: true,
      }),
    ).toEqual({
      something: true,
      color: "orange",
      person: {
        height: 5.83,
      },
    });
    expect(storage.getItem).toHaveBeenCalledWith("zoink");
  });

  it("uses default value if storage unavailable", () => {
    storage.getItem.mockReturnValue(undefined);
    const restore = createRestoreStorage(storage, "zoink");
    expect(
      restore({
        good: true,
      }),
    ).toEqual({
      good: true,
    });
    expect(storage.getItem).toHaveBeenCalledWith("zoink");
  });

  it("saves to storage", () => {
    const mockedTimestamp = new Date(Date.UTC(2023, 8, 2, 13, 34, 56));
    vi.useFakeTimers();
    vi.setSystemTime(mockedTimestamp);

    storage.getItem.mockReturnValue(
      '{ "something": true, "color": "orange", "person": { "height": 5.83 } }',
    );
    const save = createSaveStorage(storage, "zoink");
    save({
      something: true,
      color: "orange",
      person: {
        height: 5.83,
      },
    });

    vi.advanceTimersByTime(60);

    expect(storage.setItem).toHaveBeenCalledWith(
      "zoink",
      '{"something":true,"color":"orange","person":{"height":5.83}}',
    );

    vi.useRealTimers();
  });

  it("should set and retrieve an item from in-memory storage", () => {
    const key = "testKey";
    const value = "testValue";
    inMemoryStorage.setItem(key, value);
    const retrievedValue = inMemoryStorage.getItem(key);
    expect(retrievedValue).toEqual(value);
  });

  it("should return null for a non-existent item", () => {
    const key = "nonExistentKey";
    const retrievedValue = inMemoryStorage.getItem(key);
    expect(retrievedValue).toBeNull();
  });

  it("should overwrite the value for an existing key", () => {
    const key = "existingKey";
    const originalValue = "originalValue";
    const updatedValue = "updatedValue";
    inMemoryStorage.setItem(key, originalValue);
    inMemoryStorage.setItem(key, updatedValue);
    const retrievedValue = inMemoryStorage.getItem(key);
    expect(retrievedValue).toEqual(updatedValue);
  });
});
