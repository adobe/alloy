import convertStringToSha256Buffer from "../../../../src/utils/convertStringToSha256Buffer";
import convertBufferToHex from "../../../../src/utils/convertBufferToHex";

describe("convertStringToSha256Buffer", () => {
  it("should return 0 if the string is empty", () => {
    const stringToHash = "";
    convertStringToSha256Buffer(stringToHash).then(val =>
      expect(convertBufferToHex(val).toBe(0))
    );
  });
  it("should generate same hash for same string", () => {
    const stringOneToHash = "12345sadnksdc";
    const stringTwoToHash = "12345sadnksdc";
    convertStringToSha256Buffer(stringOneToHash).then(result => {
      expect(convertBufferToHex(result)).toBe(
        "bea2016e1e7828a0525b16dc6d921bc3ae8d25f13479c3241b59ad0fa8f92d86"
      );
    });
    convertStringToSha256Buffer(stringTwoToHash).then(result => {
      expect(convertBufferToHex(result)).toBe(
        "bea2016e1e7828a0525b16dc6d921bc3ae8d25f13479c3241b59ad0fa8f92d86"
      );
    });
  });
  it("should generate different hash for strings with same chars in different order", () => {
    const stringOneToHash = "qwertyuhj|kj";
    const stringTwoToHash = "qwertyuhj|jk";
    Promise.all(
      convertStringToSha256Buffer(stringOneToHash),
      convertStringToSha256Buffer(stringTwoToHash)
    ).then(results => {
      expect(convertBufferToHex(results[0])).not.toBe(
        convertBufferToHex(results[1])
      );
    });
  });
});
