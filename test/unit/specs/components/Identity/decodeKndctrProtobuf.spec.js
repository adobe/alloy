import { beforeEach, describe, it, expect } from "vitest";
import decodeKndctrProtobuf, {
  decodeVarint,
} from "../../../../../src/components/Identity/decodeKndctrProtobuf.js";

describe("Identity", () => {
  describe("decodeKndctrProtobuf", () => {
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
          0b11111110, 0b11111111, 0b11111111, 0b11111111, 0b11111111,
          0b11111111, 0b11111111, 0b11111111, 0b11111111, 0b00000001,
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

    describe("decodeKndctrProtobuf", () => {
      const uint8ArrayFromBase64 = (base64, isUrlSafeBase64 = false) => {
        // Can be replaced with https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64
        // in the future
        let input = base64;
        if (isUrlSafeBase64) {
          input = input.replace(/-/g, "+").replace(/_/g, "/");
        }
        const binString = atob(input);
        return Uint8Array.from(binString, (m) => m.codePointAt(0));
      };
      let message;
      beforeEach(() => {
        const messageStr =
          "CiYxNTkyMTM0MTU3ODg1MzkxOTM2MDExOTIxMzkxNzkyNTE5NzMyMlISCMjKluKXMhABGAEqA09SMjAAoAHrypbilzKwAbyzAfAByMqW4pcy";
        message = uint8ArrayFromBase64(messageStr);
      });

      it("should decode the message", () => {
        const ecid = decodeKndctrProtobuf(message);
        expect(ecid).toBe("15921341578853919360119213917925197322");
      });
    });
  });
});
