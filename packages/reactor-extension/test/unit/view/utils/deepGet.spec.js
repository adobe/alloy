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
import deepGet from "../../../../src/view/utils/deepGet";

describe("deepGet", () => {
  it("should return the value of a nested property", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    expect(deepGet(obj, "a.b.c")).toBe("value");
  });
  it("should return undefined if the property does not exist", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    expect(deepGet(obj, "a.b.d")).toBe(undefined);
  });
  it("should return undefined if the object is undefined", () => {
    expect(deepGet(undefined, "a.b.c")).toBe(undefined);
  });
  it("should return the object if the path is empty", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    expect(deepGet(obj, "")).toBe(obj);
  });
});
