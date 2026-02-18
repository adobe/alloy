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
import deepDelete from "../../../../src/view/utils/deepDelete";

describe("deepDelete", () => {
  it("should delete a leaf node", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    deepDelete(obj, "a.b.c");
    expect(obj).toEqual({
      a: {
        b: {},
      },
    });
  });
  it("should delete a node in the middle", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    deepDelete(obj, "a.b");
    expect(obj).toEqual({
      a: {},
    });
  });
  it("should delete a node at the root", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    deepDelete(obj, "a");
    expect(obj).toEqual({});
  });
  it("should do nothing if the property does not exist", () => {
    const obj = {
      a: {
        b: {
          c: "value",
        },
      },
    };
    deepDelete(obj, "a.b.d");
    expect(obj).toEqual({
      a: {
        b: {
          c: "value",
        },
      },
    });
  });
});
