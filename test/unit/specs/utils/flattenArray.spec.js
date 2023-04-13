import flattenArray from "../../../../src/utils/flattenArray";

describe("flattenArray", () => {
  it("recursively flattens an array", () => {
    expect(
      flattenArray([
        "a",
        ["b", "c"],
        "d",
        ["e"],
        "f",
        ["g"],
        [
          "h",
          [
            "i",
            ["j"],
            "k",
            ["l", ["m"], ["n", ["o"], ["p", ["q"], "r"], "s"], "t"]
          ],
          "u"
        ],
        "v",
        "w",
        "x",
        "y",
        "z"
      ])
    ).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z"
    ]);
  });

  it("handles non arrays", () => {
    expect(flattenArray({ wat: true })).toEqual({ wat: true });
  });
});
