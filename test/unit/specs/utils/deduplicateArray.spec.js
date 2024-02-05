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
