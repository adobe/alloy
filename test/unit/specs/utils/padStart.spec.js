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
import { padStart } from "../../../../src/utils/index.js";

describe("padStart", () => {
  [
    [-1, 2, "0", "-1"],
    [0, 2, "0", "00"],
    [3, 2, "0", "03"],
    [10, 2, "0", "10"],
    [10, 3, "0", "010"],
    [2015, 2, "0", "2015"],
    [undefined, 3, "0", "undefined"],
    [null, 5, "0", "0null"],
    ["", 3, "0", "000"],
    ["foo", 10, "bar", "barbarbfoo"],
    ["a", 2, "", "a"],
  ].forEach(([input, size, padString, expected]) => {
    it(`padStart(${input}, ${size}, "${padString}") === '${expected}'`, () => {
      expect(padStart(input, size, padString)).toEqual(expected);
    });
  });
});
