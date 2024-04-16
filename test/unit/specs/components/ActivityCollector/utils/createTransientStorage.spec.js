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

import createTransientStorage from "../../../../../../src/components/ActivityCollector/utils/createTransientStorage";

describe("ActivityCollector::createTransientStorage", () => {
  it("should return an object with the expected methods", () => {
    const transientStorage = createTransientStorage(window);
    expect(transientStorage).toEqual({
      setItem: jasmine.any(Function),
      getItem: jasmine.any(Function),
      removeItem: jasmine.any(Function)
    });
  });

  it("should support storing and retrieving values", () => {
    const transientStorage = createTransientStorage(window);
    transientStorage.setItem("key1", "value1");
    transientStorage.setItem("key2", "value2");
    expect(transientStorage.getItem("key1")).toBe("value1");
    expect(transientStorage.getItem("key2")).toBe("value2");
  });

  it("should support removing values", () => {
    const transientStorage = createTransientStorage(window);
    transientStorage.setItem("key1", "value1");
    transientStorage.setItem("key2", "value2");
    transientStorage.removeItem("key1");
    expect(transientStorage.getItem("key1")).toBeFalsy();
    expect(transientStorage.getItem("key2")).toBe("value2");
  });
});
