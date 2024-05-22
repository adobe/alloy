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

import isInteger from "../../../../src/utils/isInteger.js";

describe("isInteger", () => {
  it("returns true if the value is an integer", () => {
    [123, -123].forEach((value) => expect(isInteger(value)).toBe(true));
  });

  // eslint-disable-next-line no-restricted-globals
  it("returns false if the value is not an integer", () => {
    [null, undefined, NaN, "abc", "123", 123.45, -123.45].forEach((value) =>
      expect(isInteger(value)).toBe(false),
    );
  });
});
