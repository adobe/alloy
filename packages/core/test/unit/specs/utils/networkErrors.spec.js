/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { describe, it, expect } from "vitest";
import {
  TYPE_ERROR,
  NETWORK_ERROR,
  isNetworkError,
} from "../../../../src/utils/networkErrors.js";

describe("Network Errors", () => {
  describe("isNetworkError", () => {
    it("returns true for TypeError", () => {
      const error = new Error();
      error.name = TYPE_ERROR;

      expect(isNetworkError(error)).toBe(true);
    });

    it("returns true for NetworkError", () => {
      const error = new Error();
      error.name = NETWORK_ERROR;

      expect(isNetworkError(error)).toBe(true);
    });

    it("returns true for status 0", () => {
      const error = { status: 0 };

      expect(isNetworkError(error)).toBe(true);
    });

    it("returns false for other errors", () => {
      const error = new Error();
      error.name = "SyntaxError";

      expect(isNetworkError(error)).toBe(false);
    });

    it("returns false for non-zero status", () => {
      const error = { status: 500 };

      expect(isNetworkError(error)).toBe(false);
    });

    it("returns false for undefined status", () => {
      const error = new Error();

      expect(isNetworkError(error)).toBe(false);
    });
  });
});
