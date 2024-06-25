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

import includes from "../../../../src/utils/includes.js";

const items = ["a", "b", "c"];

describe("includes", () => {
  it("returns true if item is found", () => {
    const result = includes(items, "b");
    expect(result).toBe(true);
  });

  it("returns false if item is not found", () => {
    const result = includes(items, "z");
    expect(result).toBe(false);
  });
});
