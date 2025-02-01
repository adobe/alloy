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
import { describe, expect, it, vi } from "vitest";
import createGetEcidFromCookie, {
  decodeVarint,
} from "../../../../../src/components/Identity/createDecodeKndctrCookie.js";

describe("Identity", () => {
  describe("createGetEcidFromCookie", () => {
    it.for([
      // [cookie, expectedEcid]
      [
        "14015246138382268951805921616915743128",
        "CiYxNDAxNTI0NjEzODM4MjI2ODk1MTgwNTkyMTYxNjkxNTc0MzEyOFISCIelhf%5FOMRABGAEqA09SMjAA8AHX%5F4DZlzI%3D",
      ],
      [
        "80060702777980756313292855454149513217",
        "CiY4MDA2MDcwMjc3Nzk4MDc1NjMxMzI5Mjg1NTQ1NDE0OTUxMzIxN1IQCJS1kPGzMRgBKgNPUjIwAaAB0NOe3o0ysAG8swHwAcjTnt6NMg",
      ],
      [
        "44442001260087405491514793035065214288",
        "CiY0NDQ0MjAwMTI2MDA4NzQwNTQ5MTUxNDc5MzAzNTA2NTIxNDI4OFISCMjEz4O5MRABGAEqA09SMjAA8AHj2ouV1DE",
      ],
    ])("should decode ecid %o from the cookie", ([expectedEcid, cookie]) => {
      const cookieJar = { get: vi.fn().mockReturnValue(cookie) };
      const decodeKndctrCookie = createGetEcidFromCookie({
        orgId: "TEST_ORG",
        cookieJar,
      });
      const result = decodeKndctrCookie();
      expect(result).toEqual(expectedEcid);
    });
  });

  describe("decodeVarint", () => {
    it("should decode a varint", () => {
      const buffer = new Uint8Array([0b00000001]);
      const result = decodeVarint(buffer, 0);
      expect(result).toEqual({ value: 1, length: 1 });
      expect(decodeVarint(new Uint8Array([0b00011011]), 0)).toEqual({
        value: 27,
        length: 1,
      });
    });

    it("should decode a varint with multiple bytes", () => {
      const buffer = new Uint8Array([0b10010110, 0b00000001]);
      const result = decodeVarint(buffer, 0);
      expect(result).toEqual({ value: 150, length: 2 });
    });

    it("should decode a varint with multiple bytes and offset", () => {
      const buffer = new Uint8Array([
        0b10010110, 0b00000001, 0b10010111, 0b00000001,
      ]);
      const result = decodeVarint(buffer, 2);
      expect(result).toEqual({ value: 151, length: 2 });
    });

    it("should handle a negative varint", () => {
      const buffer = new Uint8Array([
        0b11111110, 0b11111111, 0b11111111, 0b11111111, 0b11111111, 0b11111111,
        0b11111111, 0b11111111, 0b11111111, 0b00000001,
      ]);
      expect(decodeVarint(buffer, 0)).toEqual({
        value: -2,
        length: 10,
      });
    });

    it("should handle an invalid varint", () => {
      const buffer = new Uint8Array([0b10000000]);
      expect(() => decodeVarint(buffer, 0)).toThrow();
    });

    it("should handle an empty buffer", () => {
      const buffer = new Uint8Array([]);
      expect(() => decodeVarint(buffer, 0)).toThrow();
    });

    it("should handle a negative offset", () => {
      const buffer = new Uint8Array([0b00000001]);
      expect(() => decodeVarint(buffer, -1)).toThrow();
    });

    it("should handle buffer overflow", () => {
      const buffer = new Uint8Array([0b10000000, 0b10000000]);
      expect(() => decodeVarint(buffer, 0)).toThrow();
    });
  });
});
