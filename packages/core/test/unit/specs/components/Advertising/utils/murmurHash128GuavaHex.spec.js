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
import murmurHash128GuavaHexDefault, {
  murmurHash128GuavaHex,
} from "../../../../../../src/components/Advertising/utils/murmurHash128GuavaHex.js";

describe("Advertising::murmurHash128GuavaHex (Guava murmur3_128)", () => {
  it("should return a 32-character hex string", () => {
    const result = murmurHash128GuavaHex("hello");
    expect(result).toMatch(/^[0-9a-f]{32}$/);
    expect(result).toHaveLength(32);
  });

  it("should be deterministic for the same input", () => {
    expect(murmurHash128GuavaHex("test")).toBe(murmurHash128GuavaHex("test"));
    expect(murmurHash128GuavaHex("192.168.1.1")).toBe(
      murmurHash128GuavaHex("192.168.1.1"),
    );
  });

  it("should produce different hashes for different inputs", () => {
    expect(murmurHash128GuavaHex("a")).not.toBe(murmurHash128GuavaHex("b"));
    expect(murmurHash128GuavaHex("hello")).not.toBe(
      murmurHash128GuavaHex("world"),
    );
    expect(murmurHash128GuavaHex("")).not.toBe(murmurHash128GuavaHex(" "));
  });

  it("should hash empty string (Guava parity)", () => {
    const result = murmurHash128GuavaHex("");
    expect(result).toBe("00000000000000000000000000000000");
  });

  it("should match Guava for sample IP (seed 0)", () => {
    expect(murmurHash128GuavaHex("130.248.126.34", 0)).toBe(
      "92a8071c9c08f76e03b5d56a50aa1ae6",
    );
  });

  it("should use seed when provided (Guava parity)", () => {
    const withSeed = murmurHash128GuavaHex("hello", 12345);
    const defaultSeed = murmurHash128GuavaHex("hello", 0);
    expect(withSeed).not.toBe(defaultSeed);
    expect(withSeed).toBe("81c4ebf485d50af2340be73197f863d5");
    expect(defaultSeed).toBe("029bbd41b3a7d8cb191dae486a901e5b");
  });

  it("should be deterministic with same seed", () => {
    expect(murmurHash128GuavaHex("ip", 42)).toBe(
      murmurHash128GuavaHex("ip", 42),
    );
  });

  it("should handle string that looks like IP address", () => {
    const result = murmurHash128GuavaHex("10.0.0.1");
    expect(result).toMatch(/^[0-9a-f]{32}$/);
  });

  it("default export matches named export", () => {
    expect(murmurHash128GuavaHexDefault("hello", 0)).toBe(
      murmurHash128GuavaHex("hello", 0),
    );
  });
});
