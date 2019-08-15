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
import { zFill } from "../../../../src/utils";

describe("zFill", () => {
  [
    [-1, 2, "-1"],
    [0, 2, "00"],
    [3, 2, "03"],
    [10, 2, "10"],
    [10, 3, "010"],
    [2015, 2, "2015"],
    [undefined, 3, "undefined"],
    [null, 5, "0null"],
    ["", 3, "000"]
  ].forEach(([input, size, expected]) => {
    it(`zFill(${input}, ${size}) === '${expected}'`, () => {
      expect(zFill(input, size)).toEqual(expected);
    });
  });
});
