/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { describe, it, expect } from "vitest";
import deepSet from "../../../../src/view/utils/deepSet";

describe("deepSet", () => {
  it("should set the value of a nested property", () => {
    const obj = {};
    deepSet(obj, "a.b.c", "value");
    expect(obj).toEqual({
      a: {
        b: {
          c: "value",
        },
      },
    });
  });
  it("should set the value of a nested property when the property already exists", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    deepSet(obj, "a.b.d", "value");
    expect(obj).toEqual({
      a: {
        b: {
          c: "value",
          d: "value",
        },
      },
    });
  });
  it("should set the value of a nested property when the property already exists and is an array", () => {
    const obj = {
      a: {
        b: {
          c: ["value"],
        },
      },
    };
    deepSet(obj, "a.b.c.1", "value");
    expect(obj).toEqual({
      a: {
        b: {
          c: ["value", "value"],
        },
      },
    });
  });
  it("should set the value of a nested property when the property already exists and is an array with a hole", () => {
    const obj = {
      a: {
        b: {
          c: ["value"],
        },
      },
    };
    deepSet(obj, "a.b.c.3", "value");
    expect(obj).toEqual({
      a: {
        b: {
          c: ["value", undefined, undefined, "value"],
        },
      },
    });
  });
  it("should throw an exception if the object is undefined or null or a primitive", () => {
    expect(() => {
      deepSet(undefined, "a.b.c", "value");
    }).toThrowError();
    expect(() => {
      deepSet(null, "a.b.c", "value");
    }).toThrowError();
    expect(() => {
      deepSet(1, "a.b.c", "value");
    }).toThrowError();
    expect(() => {
      deepSet("string", "a.b.c", "value");
    }).toThrowError();
    expect(() => {
      deepSet(true, "a.b.c", "value");
    }).toThrowError();
  });
});
