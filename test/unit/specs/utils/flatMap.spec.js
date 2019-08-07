import flatMap from "../../../../src/utils/flatMap";

const identity = item => item;

describe("flatMap", () => {
  it("handles empty array with identity function", () => {
    expect(flatMap([], identity)).toEqual([]);
  });

  it("flattens arrays with identity function", () => {
    expect(flatMap([[1], [2, 3], [], [4]], identity)).toEqual([1, 2, 3, 4]);
  });

  it("maps and flattens together", () => {
    expect(flatMap([1, 2, 3], item => [item, item])).toEqual([
      1,
      1,
      2,
      2,
      3,
      3
    ]);
  });
});
