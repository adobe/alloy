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

import find from "../../../src/utils/find";

const items = ["a", "b", "c"];

describe("find", () => {
  it("returns item if match found", () => {
    const predicate = jasmine.createSpy().and.callFake(item => item === "b");
    const result = find(items, predicate);
    expect(predicate).toHaveBeenCalledWith("a", 0, items);
    expect(predicate).toHaveBeenCalledWith("b", 1, items);
    expect(predicate).toHaveBeenCalledTimes(2);
    expect(result).toBe("b");
  });

  it("returns undefined if match not found", () => {
    const predicate = jasmine.createSpy().and.callFake(item => item === "z");
    const result = find(items, predicate);
    expect(predicate).toHaveBeenCalledWith("a", 0, items);
    expect(predicate).toHaveBeenCalledWith("b", 1, items);
    expect(predicate).toHaveBeenCalledWith("c", 2, items);
    expect(predicate).toHaveBeenCalledTimes(3);
    expect(result).toBeUndefined();
  });
});
