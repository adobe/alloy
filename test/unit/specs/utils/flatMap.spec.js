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

import flatMap from "../../../../src/utils/flatMap.js";

const identity = (item) => item;

describe("flatMap", () => {
  it("handles empty array with identity function", () => {
    expect(flatMap([], identity)).toEqual([]);
  });

  it("flattens arrays with identity function", () => {
    expect(flatMap([[1], [2, 3], [], [4]], identity)).toEqual([1, 2, 3, 4]);
  });

  it("maps and flattens together", () => {
    expect(flatMap([1, 2, 3], (item) => [item, item])).toEqual([
      1, 1, 2, 2, 3, 3,
    ]);
  });
});
