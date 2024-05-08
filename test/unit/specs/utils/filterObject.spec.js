/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { filterObject } from "../../../../src/utils/index.js";

describe("utils:filterObject", () => {
  it("should filter out keys with values that do not pass the predicate", () => {
    const obj = {
      a: 5,
      b: 6
    };
    const predicate = val => val > 5;
    expect(filterObject(obj, predicate)).toEqual({ b: 6 });
  });

  it("should filter out nested keys with values that do not pass the predicate", () => {
    const obj = {
      a: 5,
      b: { c: 6 }
    };
    const predicate = val => val > 5;
    expect(filterObject(obj, predicate)).toEqual({ b: { c: 6 } });
  });

  it("should filter out deeply nested keys with values that do not pass the predicate", () => {
    const obj = {
      a: 5,
      b: { c: { d: 4, e: 6 } },
      f: { g: 4 }
    };
    const predicate = val => val > 5;
    expect(filterObject(obj, predicate)).toEqual({ b: { c: { e: 6 } } });
  });
});
