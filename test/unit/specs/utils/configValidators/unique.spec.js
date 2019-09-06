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
import { unique } from "../../../../../src/utils/configValidators";

describe("configValidator::unique", () => {
  [["a"], ["a", "b", "c"]].forEach(values => {
    it(`should accept ${JSON.stringify(values)}`, () => {
      const validator = unique();
      values.forEach(value => {
        expect(validator("mykey", value)).toEqual("");
      });
    });
  });

  [["a", "a"], ["a", "b", "a"], ["a", "b", "b"]].forEach(values => {
    it(`should reject ${JSON.stringify(values)}`, () => {
      const validator = unique();
      values.forEach((value, i) => {
        if (i + 1 === values.length) {
          expect(validator("mykey", value)).not.toEqual("");
        } else {
          expect(validator("mykey", value)).toEqual("");
        }
      });
    });
  });

  [null, undefined].forEach(value => {
    it(`complains about required when ${JSON.stringify(value)}`, () => {
      const validator = unique();
      expect(validator("key", value)).toContain("required");
    });
  });
});
