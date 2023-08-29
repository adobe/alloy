import { deduplicateArray } from "../../../../src/utils";

describe("deduplicateArray", () => {
  it("should return an empty array if input is empty", () => {
    expect(deduplicateArray([])).toEqual([]);
  });

  it("should return an array with one item if input has one item", () => {
    const input = [1];
    expect(deduplicateArray(input)).toEqual(input);
  });

  it("should return an array with one item if input has two equal items", () => {
    const input = [1, 1];
    expect(deduplicateArray(input)).toEqual([1]);
  });

  it("should return an array with two items if input has two different items", () => {
    const input = [1, 2];
    expect(deduplicateArray(input)).toEqual(input);
  });

  it("should return an array with two items if input has three items with two equal items", () => {
    const input = [1, 1, 2];
    expect(deduplicateArray(input)).toEqual([1, 2]);
  });

  it("should accept a custom equality function", () => {
    const input = [{ id: 1 }, { id: 1 }, { id: 2 }];
    const isEqual = (a, b) => a.id === b.id;
    expect(deduplicateArray(input, isEqual)).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
