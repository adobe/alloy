import { Identity } from "../../../../src/utils/identityProtobuf.js";

const base64ToBytes = (base64) => {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0));
};

describe("Utils::identityProtobuf", () => {
  let message;
  beforeEach(() => {
    const messageStr =
      "CiYxNTkyMTM0MTU3ODg1MzkxOTM2MDExOTIxMzkxNzkyNTE5NzMyMlISCMjKluKXMhABGAEqA09SMjAAoAHrypbilzKwAbyzAfAByMqW4pcy";
    const decodedMessage = decodeURIComponent(messageStr)
      .replace(/_/g, "/")
      .replace(/-/g, "+");
    message = base64ToBytes(decodedMessage);
  });

  it("should decode the message", () => {
    const result = Identity.decode(message);
    expect(result.ecid).toBe("15921341578853919360119213917925197322");
  });
});
