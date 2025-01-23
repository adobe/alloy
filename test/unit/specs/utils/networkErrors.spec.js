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
