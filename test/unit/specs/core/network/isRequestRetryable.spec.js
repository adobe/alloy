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

import isRequestRetryable from "../../../../../src/core/network/isRequestRetryable.js";

describe("isRequestRetryable", () => {
  [429, 503, 502, 504].forEach((statusCode) => {
    it(`returns true for ${statusCode} and retries attempted is under the limit`, () => {
      const isRetryable = isRequestRetryable({
        response: {
          statusCode,
        },
        retriesAttempted: 2,
      });
      expect(isRetryable).toBeTrue();
    });

    it(`returns false for ${statusCode} and retries attempted is over the limit`, () => {
      const isRetryable = isRequestRetryable({
        response: {
          statusCode,
        },
        retriesAttempted: 3,
      });
      expect(isRetryable).toBeFalse();
    });
  });

  [100, 199, 200, 299, 300, 399, 400, 499, 500, 599].forEach((statusCode) => {
    it(`returns false for ${statusCode}`, () => {
      const isRetryable = isRequestRetryable({
        response: {
          statusCode,
        },
        retriesAttempted: 0,
      });
      expect(isRetryable).toBeFalse();
    });
  });
});
