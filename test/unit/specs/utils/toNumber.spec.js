/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import toNumber from "../../../../src/utils/toNumber";

describe("toNumber", () => {
  [
    ["0", 0],
    ["1", 1],
    ["true", undefined],
    ["1.1", 1.1],
    ["-4", -4],
    ["123abc", undefined],
    [-42, -42],
    [3.14, 3.14]
  ].forEach(([input, output]) => {
    it(`converts "${input}" to ${output}`, () => {
      expect(toNumber(input)).toEqual(output);
    });
  });

  it("uses the passed value for the default", () => {
    expect(toNumber("foo", 0)).toEqual(0);
  });
});
