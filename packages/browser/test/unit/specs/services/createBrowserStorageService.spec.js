/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { afterEach, describe, it, expect, vi } from "vitest";
import baseNamespace from "@adobe/alloy-core/constants/namespace.js";
import createBrowserStorageService from "../../../../src/services/createBrowserStorageService.js";

const SUFFIX = "service-test.";

afterEach(() => {
  vi.restoreAllMocks();
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith(baseNamespace)) localStorage.removeItem(k);
  });
  Object.keys(sessionStorage).forEach((k) => {
    if (k.startsWith(baseNamespace)) sessionStorage.removeItem(k);
  });
});

describe("BrowserStorageService", () => {
  it("returns Promises from getItem/setItem/clear", async () => {
    const storage =
      createBrowserStorageService().createNamespacedStorage(SUFFIX);
    const setResult = storage.persistent.setItem("k", "v");
    const getResult = storage.persistent.getItem("k");
    const clearResult = storage.persistent.clear();
    expect(setResult).toBeInstanceOf(Promise);
    expect(getResult).toBeInstanceOf(Promise);
    expect(clearResult).toBeInstanceOf(Promise);
    await Promise.all([setResult, getResult, clearResult]);
  });

  it("namespaces keys under the shared alloy prefix plus the caller's suffix", async () => {
    const storage =
      createBrowserStorageService().createNamespacedStorage(SUFFIX);
    await storage.persistent.setItem("greeting", "hi");
    expect(localStorage.getItem(`${baseNamespace}${SUFFIX}greeting`)).toBe(
      "hi",
    );
    await storage.session.setItem("greeting", "hello");
    expect(sessionStorage.getItem(`${baseNamespace}${SUFFIX}greeting`)).toBe(
      "hello",
    );
  });

  it("clear() only removes keys inside the namespace", async () => {
    const storage =
      createBrowserStorageService().createNamespacedStorage(SUFFIX);
    await storage.persistent.setItem("inside", "1");
    localStorage.setItem("outside-key", "preserved");
    await storage.persistent.clear();
    expect(localStorage.getItem(`${baseNamespace}${SUFFIX}inside`)).toBeNull();
    expect(localStorage.getItem("outside-key")).toBe("preserved");
    localStorage.removeItem("outside-key");
  });

  it("resolves null/false instead of rejecting when storage throws (Safari disabled-storage)", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("disabled");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("disabled");
    });
    const storage =
      createBrowserStorageService().createNamespacedStorage(SUFFIX);
    await expect(storage.persistent.getItem("k")).resolves.toBeNull();
    await expect(storage.persistent.setItem("k", "v")).resolves.toBe(false);
  });
});
