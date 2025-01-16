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

import { vi, beforeEach, describe, it, expect } from "vitest";
import lazy from "../../../../src/utils/lazy.js";

describe("lazy", () => {
  let factory;
  let getter;
  beforeEach(() => {
    factory = vi.fn();
    factory.mockReturnValue("result");
    getter = lazy(factory);
  });
  it("doesn't call the factory function before the first time the getter is called", () => {
    expect(factory).not.toHaveBeenCalled();
  });
  it("calls the factory function the first time the getter is called", () => {
    getter();
    expect(factory).toHaveBeenCalledTimes(1);
  });
  it("doesn't call the factory function the second time the getter is called", () => {
    getter();
    getter();
    expect(factory).toHaveBeenCalledTimes(1);
  });
  it("returns the result of the factory function", () => {
    expect(getter()).toBe("result");
  });
  it("returns the same result the second time the getter is called", () => {
    const result = getter();
    expect(getter()).toBe(result);
  });
  it("handles factory functions that return undefined", () => {
    factory.mockReturnValue(undefined);
    getter();
    expect(getter()).toBeUndefined();
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
