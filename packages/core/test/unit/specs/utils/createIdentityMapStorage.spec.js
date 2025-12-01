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
import createIdentityMapStorage from "../../../../src/utils/createIdentityMapStorage.js";

describe("createIdentityMapStorage", () => {
  it("stores and retrieves identityMap", () => {
    const storage = createIdentityMapStorage();
    const identityMap = {
      CRM_ID: [{ id: "user123", primary: true }],
      ECID: [{ id: "ecid123" }],
    };

    storage.store(identityMap);
    expect(storage.get()).toEqual(identityMap);
  });

  it("returns undefined when nothing is stored", () => {
    const storage = createIdentityMapStorage();
    expect(storage.get()).toBeUndefined();
  });

  it("overwrites previous identityMap when storing a new one", () => {
    const storage = createIdentityMapStorage();
    const firstIdentityMap = {
      CRM_ID: [{ id: "user123" }],
    };
    const secondIdentityMap = {
      CRM_ID: [{ id: "user456" }],
      EMAIL: [{ id: "test@example.com" }],
    };

    storage.store(firstIdentityMap);
    storage.store(secondIdentityMap);
    expect(storage.get()).toEqual(secondIdentityMap);
  });

  it("clears stored identityMap", () => {
    const storage = createIdentityMapStorage();
    const identityMap = {
      CRM_ID: [{ id: "user123" }],
    };

    storage.store(identityMap);
    storage.clear();
    expect(storage.get()).toBeUndefined();
  });

  it("does not store non-object values", () => {
    const storage = createIdentityMapStorage();
    storage.store("not an object");
    expect(storage.get()).toBeUndefined();

    storage.store(null);
    expect(storage.get()).toBeUndefined();

    storage.store(undefined);
    expect(storage.get()).toBeUndefined();

    storage.store(123);
    expect(storage.get()).toBeUndefined();
  });

  it("stores empty object", () => {
    const storage = createIdentityMapStorage();
    storage.store({});
    expect(storage.get()).toEqual({});
  });
});

