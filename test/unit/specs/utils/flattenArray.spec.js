/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import flattenArray from "../../../../src/utils/flattenArray.js";

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
            ["l", ["m"], ["n", ["o"], ["p", ["q"], "r"], "s"], "t"],
          ],
          "u",
        ],
        "v",
        "w",
        "x",
        "y",
        "z",
      ]),
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
      "z",
    ]);
  });

  it("handles non arrays", () => {
    expect(flattenArray({ wat: true })).toEqual({ wat: true });
  });
});
