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
import generateEventHash from "../../../../../../src/components/RulesEngine/utils/generateEventHash.js";

describe("generateEventHash", () => {
  it("should remove empty keys, sort the object, and hash it", () => {
    const input = {
      b: "",
      a: "value1",
      c: null,
      d: "value2",
      e: undefined,
    };

    const result = generateEventHash(input);

    expect(result).toBe("d8bc9975");
  });

  it("should handle an empty object", () => {
    const input = {};

    const result = generateEventHash(input);

    // Hash of an empty string
    expect(result).toBe("811c9dc5");
  });

  it("should handle the AJO example", () => {
    const input = {
      myEventKey: "eventHistoryWrite",
      id: "48181acd-22b3-edae-bc8a-447868a7df7c",
      eventType: "qualify",
      "~state.com.adobe.module.places/lastEnteredPOI.name": "adobe",
    };

    const result = generateEventHash(input);
    expect(result).toBe("935b3599");
  });
});
