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
import { base64ToBytes, bytesToBase64 } from "../../../../src/utils/bytes.js";

describe("bytes utilities", () => {
  describe("bytesToBase64", () => {
    it("converts bytes to standard base64", () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const result = bytesToBase64(bytes);
      expect(result).toBe("SGVsbG8=");
    });

    it("converts bytes to URL-safe base64 when urlSafe option is true", () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const result = bytesToBase64(bytes, { urlSafe: true });
      expect(result).toBe("SGVsbG8");
    });

    it("converts bytes with + and / characters to URL-safe base64", () => {
      const bytes = new Uint8Array([62, 63, 254, 255]);
      const standardResult = bytesToBase64(bytes);
      const urlSafeResult = bytesToBase64(bytes, { urlSafe: true });

      expect(standardResult).toBe("Pj/+/w==");
      expect(urlSafeResult).toBe("Pj_-_w");
    });

    it("handles empty options object", () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const result = bytesToBase64(bytes, {});
      expect(result).toBe("SGVsbG8=");
    });

    it("defaults to standard base64 when no options provided", () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);
      const result = bytesToBase64(bytes);
      expect(result).toBe("SGVsbG8=");
    });

    it("handles empty byte array", () => {
      const bytes = new Uint8Array([]);
      const result = bytesToBase64(bytes);
      expect(result).toBe("");
    });

    it("handles single byte", () => {
      const bytes = new Uint8Array([65]);
      const standardResult = bytesToBase64(bytes);
      const urlSafeResult = bytesToBase64(bytes, { urlSafe: true });

      expect(standardResult).toBe("QQ==");
      expect(urlSafeResult).toBe("QQ");
    });

    it("produces output compatible with base64ToBytes", () => {
      const originalBytes = new Uint8Array([
        72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100,
      ]);

      const standardBase64 = bytesToBase64(originalBytes);
      const urlSafeBase64 = bytesToBase64(originalBytes, { urlSafe: true });

      const decodedFromStandard = base64ToBytes(standardBase64);
      const decodedFromUrlSafe = base64ToBytes(urlSafeBase64);

      expect(decodedFromStandard).toEqual(originalBytes);
      expect(decodedFromUrlSafe).toEqual(originalBytes);
    });
  });

  describe("base64ToBytes", () => {
    it("converts standard base64 to bytes", () => {
      const base64 = "SGVsbG8=";
      const result = base64ToBytes(base64);
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it("converts URL-safe base64 to bytes", () => {
      const base64 = "SGVsbG8";
      const result = base64ToBytes(base64);
      expect(result).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });

    it("handles base64 with + and / characters", () => {
      const base64 = "P/7/";
      const result = base64ToBytes(base64);
      expect(result).toEqual(new Uint8Array([63, 254, 255]));
    });

    it("handles URL-safe base64 with - and _ characters", () => {
      const base64 = "P_7_";
      const result = base64ToBytes(base64);
      expect(result).toEqual(new Uint8Array([63, 254, 255]));
    });
  });

  describe("round-trip compatibility", () => {
    it("standard base64 round-trip", () => {
      const originalBytes = new Uint8Array([255, 254, 253, 252, 251]);
      const base64 = bytesToBase64(originalBytes);
      const decodedBytes = base64ToBytes(base64);
      expect(decodedBytes).toEqual(originalBytes);
    });

    it("URL-safe base64 round-trip", () => {
      const originalBytes = new Uint8Array([255, 254, 253, 252, 251]);
      const base64 = bytesToBase64(originalBytes, { urlSafe: true });
      const decodedBytes = base64ToBytes(base64);
      expect(decodedBytes).toEqual(originalBytes);
    });

    it("large byte array round-trip", () => {
      const originalBytes = new Uint8Array(256).map((_, i) => i);
      const standardBase64 = bytesToBase64(originalBytes);
      const urlSafeBase64 = bytesToBase64(originalBytes, { urlSafe: true });

      const decodedFromStandard = base64ToBytes(standardBase64);
      const decodedFromUrlSafe = base64ToBytes(urlSafeBase64);

      expect(decodedFromStandard).toEqual(originalBytes);
      expect(decodedFromUrlSafe).toEqual(originalBytes);
    });
  });
});
