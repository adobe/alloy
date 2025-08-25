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
import fnv1a32Hex from "../../../../packages/core/src/utils/fnv1a32Hex.js";

describe("fnv1a32Hex", () => {
  it("should return the correct hash for an empty string", () => {
    expect(fnv1a32Hex("")).toBe("811c9dc5");
  });

  it("should return the correct hash for a simple string", () => {
    expect(fnv1a32Hex("hello")).toBe("4f9f2cab");
  });

  it("should return the correct hash for a string with special characters", () => {
    expect(fnv1a32Hex("hello world!")).toBe("b034fff2");
  });

  it("should return the correct hash for a string with unicode characters", () => {
    expect(fnv1a32Hex("你好")).toBe("86938da3");
  });

  it("should return the correct hash for a long string", () => {
    const longString = "a".repeat(100);
    expect(fnv1a32Hex(longString)).toBe("0a0bb1d9");
  });
});
