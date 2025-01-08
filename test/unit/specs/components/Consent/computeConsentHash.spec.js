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

import { describe, it, expect } from "vitest";
import computeConsentHash from "../../../../../src/components/Consent/computeConsentHash.js";

describe("computeConsentHash", () => {
  it("works", () => {
    expect(
      computeConsentHash([
        {
          standard: "Adobe",
          version: "1.0",
          value: {
            general: "in",
          },
        },
      ]),
    ).toBe(2905535662);
  });
  [
    [
      {
        a: 1,
        b: 2,
      },
      {
        b: 2,
        a: 1,
      },
    ],
    [
      [
        {
          a: 1,
          b: 2,
        },
      ],
      [
        {
          b: 2,
          a: 1,
        },
      ],
    ],
    [
      {
        a: {
          b: 2,
          c: 3,
        },
      },
      {
        a: {
          c: 3,
          b: 2,
        },
      },
    ],
    [
      {
        a: [1],
        b: [2],
      },
      {
        b: [2],
        a: [1],
      },
    ],
    [
      {
        a: undefined,
      },
      {},
    ],
  ].forEach(([a, b], index) => {
    it(`computes the same hash ${index}`, () => {
      expect(computeConsentHash(a)).toBe(computeConsentHash(b));
    });
  });
  [
    [
      [1, 2],
      [2, 1],
    ],
    ["1", 1],
    [
      {
        a: null,
      },
      {
        a: undefined,
      },
    ],
    [
      {
        "xdm:key": "value",
      },
      {
        xdm: "key:value",
      },
    ],
    [null, {}],
  ].forEach(([a, b], index) => {
    it(`computes a different hash ${index}`, () => {
      expect(computeConsentHash(a)).not.toBe(computeConsentHash(b));
    });
  });
});
