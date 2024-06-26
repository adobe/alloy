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

import isUnique from "../../../../src/utils/isUnique.js";

describe("isUnique", () => {
  it("returns true if array values are unique", () => {
    expect(isUnique(["item1", "item2", "item3"])).toBe(true);
  });

  it("returns false if array contains duplicate values", () => {
    expect(isUnique(["item1", "item1", "item3"])).toBe(false);
  });
});
