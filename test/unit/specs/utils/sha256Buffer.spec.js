import sha256Buffer from "../../../../src/utils/sha256Buffer";
import bufferToHex from "../../../../src/utils/bufferToHex";

describe("sha256buffer", () => {
  it("should return 0 if the string is empty", () => {
    const stringToHash = "";
    sha256Buffer(stringToHash).then(val => expect(bufferToHex(val).toBe(0)));
  });
  it("should generate same hash for same string", () => {
    const stringOneToHash = "12345sadnksdc";
    const stringTwoToHash = "12345sadnksdc";
    sha256Buffer(stringOneToHash).then(result => {
      expect(bufferToHex(result)).toBe(
        "bea2016e1e7828a0525b16dc6d921bc3ae8d25f13479c3241b59ad0fa8f92d86"
      );
    });
    sha256Buffer(stringTwoToHash).then(result => {
      expect(bufferToHex(result)).toBe(
        "bea2016e1e7828a0525b16dc6d921bc3ae8d25f13479c3241b59ad0fa8f92d86"
      );
    });
  });
  it("should generate different hash for strings with same chars in different order", () => {
    const stringOneToHash = "qwertyuhj|kj";
    const stringTwoToHash = "qwertyuhj|jk";
    Promise.all(
      sha256Buffer(stringOneToHash),
      sha256Buffer(stringTwoToHash)
    ).then(results => {
      expect(bufferToHex(results[0])).not.toBe(bufferToHex(results[1]));
    });
  });
});
