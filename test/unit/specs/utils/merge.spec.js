/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import merge from "../../../../src/utils/merge";

describe("merge", () => {
  it("return an object with keys from passed in values", () => {
    expect(merge([{ a: 1 }, undefined])).toEqual({ a: 1 });
    expect(merge([{ a: 1 }, { b: 2 }, undefined])).toEqual({ a: 1, b: 2 });
  });
  it("returns an empty object if undefined", () => {
    expect(merge([undefined, undefined, undefined])).toEqual({});
  });
});
