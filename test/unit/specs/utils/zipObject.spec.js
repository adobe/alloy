/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import zipObject from "../../../../src/utils/zipObject";

const keys = ["a", "b", "c"];
const values = ["x", "y", "z"];

describe("zipObject", () => {
  it("zips to newly created object", () => {
    const result = zipObject(keys, values);
    expect(result).toEqual({
      a: "x",
      b: "y",
      c: "z"
    });
  });

  it("zips to existing object", () => {
    const result = zipObject(keys, values, { foo: "bar" });
    expect(result).toEqual({
      foo: "bar",
      a: "x",
      b: "y",
      c: "z"
    });
  });

  it("handles having more keys than values", () => {
    const result = zipObject(["a", "b", "c", "d"], ["x", "y", "z"]);
    expect(result).toEqual({
      a: "x",
      b: "y",
      c: "z",
      d: undefined
    });
  });

  it("handles having more values than keys", () => {
    const result = zipObject(["a", "b", "c"], ["w", "x", "y", "z"]);
    expect(result).toEqual({
      a: "w",
      b: "x",
      c: "y"
    });
  });
});
