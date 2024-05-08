/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import startsWith from "../../../../src/utils/startsWith.js";

const str = "The quick brown fox.";

describe("startsWith", () => {
  ["The quick brown fox.", "The"].forEach(prefix => {
    it(`returns true when prefix is ${prefix}`, () => {
      expect(startsWith(str, prefix)).toBeTrue();
    });
  });

  ["The quick brown fox. Extra", "bogus."].forEach(prefix => {
    it(`returns false when prefix is ${prefix}`, () => {
      expect(startsWith(str, prefix)).toBeFalse();
    });
  });
});
