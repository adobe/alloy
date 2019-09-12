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

import { number } from "../../../../../src/utils/configValidators";

describe("configValidator::integer", () => {
  const validator = number().integer();

  [42.01, -1.1, NaN].forEach(value => {
    it(`rejects '${value}'`, () => {
      expect(validator("key", value)).toBeTruthy();
    });
  });

  [0, 42, -1].forEach(value => {
    it(`accepts '${value}'`, () => {
      expect(validator("key", value)).toBeFalsy();
    });
  });
});
