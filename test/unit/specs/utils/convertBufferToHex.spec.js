import convertBufferToHex from "../../../../src/utils/convertBufferToHex";

const getUint8Array = str => {
  const cleanString = unescape(encodeURIComponent(str));
  return new Uint8Array(cleanString.split("").map(char => char.charCodeAt(0)));
};
describe("convertBufferToHex", () => {
  it("should return a string if an Uint8Array buffer is supplied", () => {
    const bufferOne = getUint8Array("Hello Wrorld!");
    expect(convertBufferToHex(bufferOne)).toEqual("48656c6c6f2057726f726c6421");
    const bufferTwo = getUint8Array(
      "איך קען עסן גלאָז און עס טוט מיר נישט װײ."
    );
    expect(convertBufferToHex(bufferTwo)).toEqual(
      "d790d799d79a20d7a7d7a2d79f20d7a2d7a1d79f20d792d79cd790d6b8d79620d790d795d79f20d7a2d7a120d798d795d79820d79ed799d7a820d7a0d799d7a9d79820d7b0d7b22e"
    );
  });
});
