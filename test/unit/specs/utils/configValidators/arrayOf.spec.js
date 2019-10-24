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

import { arrayOf, string } from "../../../../../src/utils/configValidators";

describe("configValidators::arrayOf", () => {
  [["foo", undefined], [true, "bar"], "non-array"].forEach(value => {
    it(`rejects ${JSON.stringify(value)}`, () => {
      const validator = arrayOf(string());
      expect(validator("key", value)).toBeTruthy();
    });
  });

  [["foo"], ["foo", "bar"], []].forEach(value => {
    it(`accepts ${JSON.stringify(value)}`, () => {
      const validator = arrayOf(string());
      expect(validator("key", value)).toBeFalsy();
    });
  });
});
