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
import stableSerialization from "../../../../src/utils/stableSerialization.js";

describe("stableSerialization", () => {
  const sameHashCases = [
    {
      description: "objects with same keys and values in different order",
      a: { a: 1, b: 2 },
      b: { b: 2, a: 1 },
    },
    {
      description:
        "arrays of objects with same keys and values in different order",
      a: [{ a: 1, b: 2 }],
      b: [{ b: 2, a: 1 }],
    },
    {
      description:
        "nested objects with same keys and values in different order",
      a: { a: { b: 2, c: 3 } },
      b: { a: { c: 3, b: 2 } },
    },
    {
      description: "objects with arrays having same elements",
      a: { a: [1], b: [2] },
      b: { b: [2], a: [1] },
    },
    {
      description: "object with undefined value and empty object",
      a: { a: undefined },
      b: {},
    },
  ];

  sameHashCases.forEach(({ description, a, b }, index) => {
    it(`computes the same hash for case ${index + 1}: ${description}`, () => {
      expect(stableSerialization(a)).toBe(stableSerialization(b));
    });
  });

  const differentHashCases = [
    {
      description: "arrays with same elements in different order",
      a: [1, 2],
      b: [2, 1],
    },
    {
      description: "string and number with same value",
      a: "1",
      b: 1,
    },
    {
      description: "object with null value and object with undefined value",
      a: { a: null },
      b: { a: undefined },
    },
    {
      description: "objects with different key formats",
      a: { "xdm:key": "value" },
      b: { xdm: "key:value" },
    },
    {
      description: "null and empty object",
      a: null,
      b: {},
    },
  ];

  differentHashCases.forEach(({ description, a, b }, index) => {
    it(`computes a different hash for case ${index + 1}: ${description}`, () => {
      expect(stableSerialization(a)).not.toBe(stableSerialization(b));
    });
  });
});
