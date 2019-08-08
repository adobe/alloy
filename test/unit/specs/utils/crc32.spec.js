import crc32 from "../../../../src/utils/crc32";

describe("crc32", () => {
  it("should hash a string and return a number ", () => {
    const str = "hello";
    const result = crc32(str);
    expect(typeof result).toBe("number");
    expect(result).toEqual(907060870);
  });

  it("should create same hash every time", () => {
    const idsTohash = {
      email: {
        id: "me@me.com",
        authState: 0
      }
    };
    const resultOne = crc32(JSON.stringify(idsTohash));
    const resultTwo = crc32(JSON.stringify(idsTohash));
    expect(typeof resultOne).toBe("number");
    expect(resultOne).toBe(3158443042);
    expect(resultTwo).toBe(3158443042);
  });

  it("should always return a positive number", () => {
    const idOneTohash = "x+x";
    const idTwoTohash = "a*b/100-220";
    const resultOne = crc32(JSON.stringify(idOneTohash));
    const resultTwo = crc32(JSON.stringify(idTwoTohash));
    expect(typeof resultOne).toBe("number");
    expect(resultOne).toBeGreaterThan(0);
    expect(typeof resultTwo).toBe("number");
    expect(resultTwo).toBeGreaterThan(0);
  });

  it("should hash strings with special characters", () => {
    const stringToHash = "hello@#&^hq10";
    const result = crc32(stringToHash);
    expect(result).toBe(864118309);
  });

  it("should create different hash for identical strings", () => {
    const stringOneToHash = "hello@#&^hq10";
    const stringTwoToHash = "hello@#&h^q10";
    const resultOne = crc32(stringOneToHash);
    const resultTwo = crc32(stringTwoToHash);
    expect(resultOne).not.toEqual(resultTwo);
    expect(resultOne).toBe(864118309);
    expect(resultTwo).toBe(3365964926);
  });
});
