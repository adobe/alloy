/*
Copyright 2023 Adobe. All rights reserved.
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
  containsDataElements,
  createValidatorWithMessage,
  validateContainsDataElements,
  createValidateItemIsInArray,
  combineValidatorWithContainsDataElements,
  isDataElement,
} from "../../../../../src/view/components/overrides/utils";

describe("overrides/utils.js", () => {
  describe("isDataElement", () => {
    /**
     * [testName, testValue, expectedResult]
     * @type {[string, string, boolean][]}
     */
    [
      ["should validate data element", "%my data element%", true],
      [
        "should validate data element with whitespace in front",
        "    %my data element%",
        true,
      ],
      [
        "should validate data element with whitespace in back",
        "%my data element%    ",
        true,
      ],
      [
        "should validate data element with whitespace in front and back",
        "    %my data element%    ",
        true,
      ],
      [
        "should not validate multiple data elements",
        "%my data element% %my other data element%",
        false,
      ],
      ["should not validate empty string", "", false],
      ["should not validate string without data element", "abc", false],
      [
        "should not validate data element with characters in front",
        "asdf%my data element%",
        false,
      ],
      [
        "should not validate data element with characters in back",
        "%my data element%asdf",
        false,
      ],
      [
        "should not validate data element with characters in front and back",
        "asdf%my data element%asdf",
        false,
      ],
    ].forEach(([testName, testValue, expectedResult]) => {
      it(testName, () => {
        expect(isDataElement(testValue)).toBe(expectedResult);
      });
    });
  });
  describe("containsDataElements()", () => {
    /**
     * [testName, testValue, expectedResult]
     * @type {[string, string, boolean][]}
     */
    [
      ["should validate data element", "%my data element%", true],
      [
        "should validate data elements with characters in front",
        "abc%my data element%",
        true,
      ],
      [
        "should validate data elements with characters in back",
        "%my data element%abc",
        true,
      ],
      [
        "should validate data elements with characters in front and back",
        "abc%my data element%abc",
        true,
      ],
      [
        "should validate multiple data elements in the same string",
        "%my data element% %my other data element%%my third data element%%my fourth data element%",
        true,
      ],
      ["should not validate empty string", "", false],
      ["should not validate string without data element", "abc", false],
      [
        "should not validate un-terminated data elements",
        "%my data element",
        false,
      ],
      [
        "should not validate un-started data elements",
        "my data element%",
        false,
      ],
    ].forEach(([testName, testValue, expectedResult]) => {
      it(testName, () => {
        expect(containsDataElements(testValue)).toBe(expectedResult);
      });
    });
  });

  describe("createValidatorWithMessage()", () => {
    it("should return the message when the validation fails", () => {
      const validator = createValidatorWithMessage(() => false, "message");
      expect(validator()).toBe("message");
    });

    it("should return undefined when the validation passes", () => {
      const validator = createValidatorWithMessage(() => true, "message");
      expect(validator()).toBe(undefined);
    });
  });

  describe("validateContainsDataElements()", () => {
    it("should return the message when the value is not a data element", () => {
      expect(typeof validateContainsDataElements("abc")).toBe("string");
    });
  });

  describe("createValidateItemIsInArray()", () => {
    it("should return the message when the value is not in the array", () => {
      const validator = createValidateItemIsInArray(["a", "b"], "message");
      expect(typeof validator("c")).toBe("string");
    });

    it("should return undefined when the value is in the array", () => {
      const validator = createValidateItemIsInArray(["a", "b"], "message");
      expect(validator("a")).toBe(undefined);
    });
  });

  describe("combineValidatorWithContainsDataElements()", () => {
    it("should validate data elements and the other validator", () => {
      const combinedValidator = combineValidatorWithContainsDataElements(
        () => undefined,
      );
      expect(typeof combinedValidator("%my data element")).toBe("string");
      expect(combinedValidator("%my data element%")).toBe(undefined);
      expect(combinedValidator("abc")).toBe(undefined);
      expect(combinedValidator(undefined)).toBe(undefined);
      expect(combinedValidator(null)).toBe(undefined);
    });

    it("should support validating multiple data elements in a string", () => {
      const combinedValidator = combineValidatorWithContainsDataElements(
        () => undefined,
        true,
      );
      expect(
        combinedValidator("%my data element% %my other data element%"),
      ).toBe(undefined);
    });

    it("should support validating a single data element in a string", () => {
      const combinedValidator = combineValidatorWithContainsDataElements(
        () => undefined,
        false,
      );
      expect(
        typeof combinedValidator("%my data element% %my other data element%"),
      ).toBe("string");
      expect(combinedValidator("%my data element%")).toBe(undefined);
    });
  });
});
