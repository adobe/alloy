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

import { describe, it, expect } from "vitest";
import intersection from "../../../../src/utils/intersection.js";

describe("intersection", () => {
  it("returns items that are found within both arrays", () => {
    const result = intersection(["a", "b", "c", "d"], ["z", "b", "d"]);
    expect(result).toEqual(["b", "d"]);
  });
  it("returns an empty array if there are no matches", () => {
    const result = intersection(["a", "b", "c", "d"], ["e"]);
    expect(result).toEqual([]);
  });
});
