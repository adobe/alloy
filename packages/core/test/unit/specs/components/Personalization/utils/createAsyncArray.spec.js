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
import createAsyncArray from "../../../../../../src/components/Personalization/utils/createAsyncArray.js";
import { defer } from "../../../../../../src/utils/index.js";
import flushPromiseChains from "../../../../helpers/flushPromiseChains.js";

const isPending = (promise) => {
  const t = {};
  return Promise.race([promise, t]).then((v) => v === t);
};

describe("Personalization::utils::createAsyncArray", () => {
  it("should start with an empty array", async () => {
    const asyncArray = createAsyncArray();
    expect(await asyncArray.clear()).toEqual([]);
  });
  it("should add items to the array, and clear the items", async () => {
    const asyncArray = createAsyncArray();
    asyncArray.concat(Promise.resolve(["myitem1"]));
    expect(await asyncArray.clear()).toEqual(["myitem1"]);
    expect(await asyncArray.clear()).toEqual([]);
  });
  it("should add multiple arrays", async () => {
    const asyncArray = createAsyncArray();
    asyncArray.concat(Promise.resolve(["myitem1"]));
    asyncArray.concat(Promise.resolve(["myitem2"]));
    expect(await asyncArray.clear()).toEqual(["myitem1", "myitem2"]);
  });
  it("should wait for items while clearing the array", async () => {
    const asyncArray = createAsyncArray();
    const deferred = defer();
    asyncArray.concat(deferred.promise);
    const clearPromise = asyncArray.clear();
    await flushPromiseChains();

    expect(await isPending(clearPromise)).toBe(true);

    deferred.resolve(["myitem1"]);
    expect(await clearPromise).toEqual(["myitem1"]);
  });
  it("should handle rejected promises", async () => {
    const asyncArray = createAsyncArray();
    asyncArray.concat(Promise.resolve([1, 2]));
    asyncArray.concat(Promise.reject(new Error("Error!")));
    expect(await asyncArray.clear()).toEqual([1, 2]);
  });
});
