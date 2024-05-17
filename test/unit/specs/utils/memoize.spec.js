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

import memoize from "../../../../src/utils/memoize.js";

describe("memoize", () => {
  describe("without keyResolver", () => {
    let getId;
    let memoizedGetId;

    beforeEach(() => {
      let iterator = 0;
      getId = jasmine.createSpy().and.callFake(() => {
        iterator += 1;
        return iterator;
      });
      memoizedGetId = memoize(getId);
    });

    it("only calls function once when no arguments are passed", () => {
      expect(memoizedGetId()).toBe(1);
      expect(memoizedGetId()).toBe(1);
      expect(getId).toHaveBeenCalledTimes(1);
    });

    it("calls function each time first argument is different", () => {
      const obj1 = {};
      const obj2 = {};
      expect(memoizedGetId(obj1, "foo")).toBe(1);
      expect(memoizedGetId(obj2, "foo")).toBe(2);
      expect(memoizedGetId(obj1, "bar")).toBe(1);
      expect(getId).toHaveBeenCalledTimes(2);
    });
  });

  describe("with keyResolver", () => {
    let getId;
    let memoizedGetId;

    beforeEach(() => {
      let iterator = 0;
      getId = jasmine.createSpy().and.callFake(() => {
        iterator += 1;
        return iterator;
      });
      memoizedGetId = memoize(getId, (a, b, c) => c);
    });

    it("calls function each time computed key is different", () => {
      const obj1 = { foo: "bar" };
      const obj2 = { baz: "qux" };

      expect(memoizedGetId("foo", "bar", obj1)).toBe(1);
      expect(memoizedGetId("foo", "baz", obj2)).toBe(2);
      expect(memoizedGetId("foo", "qux", obj1)).toBe(1);
      expect(getId).toHaveBeenCalledTimes(2);
    });
  });
});
