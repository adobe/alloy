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
import { describe, it, expect } from "vitest";
import copyPropertiesWithDefaultFallback from "../../../../../src/view/configuration/utils/copyPropertiesWithDefaultFallback";

describe("copyPropertiesWithDefaultFallback", () => {
  it("should copy only the keys specified", () => {
    const toObj = {};
    const fromObj = {
      a: "foo",
      b: "bar",
      c: "",
    };
    const defaultsObj = {
      a: "",
      b: "",
      c: "",
    };
    const keys = ["a", "b"];
    copyPropertiesWithDefaultFallback({
      toObj,
      fromObj,
      defaultsObj,
      keys,
    });
    expect(Object.keys(toObj)).toEqual(keys);
  });

  it("should copy the default values when the key has not changed", () => {
    const toObj = {};
    const fromObj = {
      a: "",
      b: "bar",
      c: "",
    };
    const defaultsObj = {
      a: "",
      b: "",
      c: "",
    };
    const keys = ["a", "b"];
    copyPropertiesWithDefaultFallback({
      toObj,
      fromObj,
      defaultsObj,
      keys,
    });
    expect(toObj).toEqual({ a: "", b: "bar" });
  });

  it("should support copying nested objects", () => {
    const toObj = {};
    const fromObj = {
      a: "foo",
      c: {
        d: {
          e: "baz",
        },
      },
    };
    const defaultsObj = {
      a: "",
      b: "",
      c: {
        d: {
          e: "",
          f: "",
        },
        g: "",
      },
    };
    const keys = ["a", "b", "c"];
    copyPropertiesWithDefaultFallback({
      toObj,
      fromObj,
      defaultsObj,
      keys,
    });
    expect(toObj).toEqual({
      a: "foo",
      b: "",
      c: {
        d: {
          e: "baz",
          f: "",
        },
        g: "",
      },
    });
  });
});
