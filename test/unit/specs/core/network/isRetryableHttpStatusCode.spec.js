/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import isRetryableHttpStatusCode from "../../../../../src/core/network/isRetryableHttpStatusCode";

describe("isRetryableHttpStatusCode", () => {
  [429, 500, 599].forEach(statusCode => {
    it(`returns true for ${statusCode}`, () => {
      expect(isRetryableHttpStatusCode(statusCode)).toBeTrue();
    });
  });

  [100, 199, 200, 299, 300, 399, 400, 499].forEach(statusCode => {
    it(`returns false for ${statusCode}`, () => {
      expect(isRetryableHttpStatusCode(statusCode)).toBeFalse();
    });
  });
});
