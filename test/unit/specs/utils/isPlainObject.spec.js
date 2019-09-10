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

import isPlainObject from "../../../../src/utils/isPlainObject";

describe("isPlainObject", () => {
  it("should return true if the object is created by the Object constructor", () => {
    expect(isPlainObject(Object.create({}))).toBe(true);
    expect(isPlainObject(Object.create(Object.prototype))).toBe(true);
    expect(isPlainObject({ foo: "bar" })).toBe(true);
    expect(isPlainObject({})).toBe(true);
  });

  it("should return false if the object is not created by the Object constructor", () => {
    // eslint-disable-next-line func-style
    function Foo() {
      this.abc = {};
    }

    expect(isPlainObject(/foo/)).toBe(false);
    expect(isPlainObject(function() {})).toBe(false);
    expect(isPlainObject(1)).toBe(false);
    expect(isPlainObject(["foo", "bar"])).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Foo())).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(Object.create(null))).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
  });
});
