/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { vi, beforeEach, describe, it, expect } from "vitest";
import createClickActivityStorage from "../../../../../src/components/ActivityCollector/createClickActivityStorage.js";
import { CLICK_ACTIVITY_DATA } from "../../../../../src/constants/sessionDataKeys.js";

describe("ActivityCollector::createClickActivityStorage", () => {
  let storage;
  let clickActivityStorage;
  beforeEach(() => {
    storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    clickActivityStorage = createClickActivityStorage({
      storage,
    });
  });
  it("saves data", () => {
    clickActivityStorage.save({
      key: "value",
    });
    expect(storage.setItem).toHaveBeenCalledWith(
      CLICK_ACTIVITY_DATA,
      '{"key":"value"}',
    );
  });
  it("loads data", () => {
    storage.getItem.mockReturnValue('{"key":"value"}');
    const data = clickActivityStorage.load();
    expect(data).toEqual({
      key: "value",
    });
  });
  it("loads null when no data is present", () => {
    const data = clickActivityStorage.load();
    expect(data).toBeNull();
  });
  it("removes data", () => {
    clickActivityStorage.remove();
    expect(storage.removeItem).toHaveBeenCalledWith(CLICK_ACTIVITY_DATA);
  });
});
