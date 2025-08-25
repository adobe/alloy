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
import computeConsentHash from "../../../../../packages/core/src/components/Consent/computeConsentHash.js";

describe("computeConsentHash", () => {
  it("computes the correct hash for a simple consent object", () => {
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
    ).toBe("10c9fc7c");
  });

  it("computes different hashes for different consent objects", () => {
    const hash1 = computeConsentHash([
      {
        standard: "Adobe",
        version: "1.0",
        value: {
          general: "in",
        },
      },
    ]);

    const hash2 = computeConsentHash([
      {
        standard: "Adobe",
        version: "1.0",
        value: {
          general: "out",
        },
      },
    ]);

    expect(hash1).not.toBe(hash2);
  });
});
