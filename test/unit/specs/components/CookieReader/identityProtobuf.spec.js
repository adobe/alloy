import { describe, it, expect } from "vitest";
import { decodeVarint } from "../../../../../src/components/CookieReader/identityProtobuf.js";

describe("CookieReader", () => {
  describe("identityProtobuf", () => {
    describe("decodeVarint", () => {
      it("should decode a varint", () => {
        const buffer = new Uint8Array([0b00000001]);
        const result = decodeVarint(buffer, 0);
        expect(result).toEqual({ value: 1, length: 1 });
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
    });
  });
});
