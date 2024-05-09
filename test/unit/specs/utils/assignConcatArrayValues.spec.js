import assignConcatArrayValues from "../../../../src/utils/assignConcatArrayValues.js";

describe("assignConcatArrayValues", () => {
  it("throws an error if no arguments are passed", () => {
    expect(() => assignConcatArrayValues()).toThrowError();
  });

  it("returns an empty array if an empty array is passed", () => {
    const obj = [];
    expect(assignConcatArrayValues(obj)).toBe(obj);
  });

  it("returns the first object if only one argument is passed", () => {
    const obj = {};
    expect(assignConcatArrayValues(obj)).toBe(obj);
  });

  it("works with two objects with different properties", () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const result = assignConcatArrayValues(obj1, obj2);
    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).toBe(obj1);
  });

  it("works with two objects with the same property", () => {
    expect(assignConcatArrayValues({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
  });

  it("works with two objects with the same property that is an array", () => {
    expect(assignConcatArrayValues({ a: [1] }, { a: [2] })).toEqual({
      a: [1, 2],
    });
  });

  it("works with three objects with the same property that is an array", () => {
    expect(assignConcatArrayValues({ a: [1] }, { a: [] }, { a: [3] })).toEqual({
      a: [1, 3],
    });
  });

  it("works with three objects with the same property that is an array and different properties", () => {
    expect(
      assignConcatArrayValues(
        { a: [1] },
        { a: [], c: true, d: false },
        { a: [3], b: "2", e: null },
      ),
    ).toEqual({
      a: [1, 3],
      b: "2",
      c: true,
      d: false,
      e: null,
    });
  });

  it("skips non-objects", () => {
    expect(
      assignConcatArrayValues({ a: [1] }, null, { a: [3] }, false, [], 5),
    ).toEqual({
      a: [1, 3],
    });
  });
});
