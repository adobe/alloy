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

import { describe, it, expect } from "vitest";
import createNodeCookieService from "../../../../src/services/createNodeCookieService.js";

describe("createNodeCookieService", () => {
  it("returns undefined for a cookie that was never set", () => {
    const cookie = createNodeCookieService();
    expect(cookie.get("missing")).toBeUndefined();
  });

  it("sets and gets a cookie", () => {
    const cookie = createNodeCookieService();
    expect(cookie.set("name", "value")).toBe("value");
    expect(cookie.get("name")).toBe("value");
  });

  it("removes a cookie", () => {
    const cookie = createNodeCookieService();
    cookie.set("name", "value");
    cookie.remove("name");
    expect(cookie.get("name")).toBeUndefined();
  });

  it("returns every cookie via getAll", () => {
    const cookie = createNodeCookieService();
    cookie.set("a", "1");
    cookie.set("b", "2");
    expect(cookie.getAll()).toEqual({ a: "1", b: "2" });
  });

  it("withConverter applies read/write transforms without affecting the original instance", () => {
    const cookie = createNodeCookieService();
    const converted = cookie.withConverter({
      write: (value) => `written:${value}`,
      read: (value) => value.replace("written:", "read:"),
    });

    converted.set("name", "value");

    // Same underlying jar, so the raw (write-transformed) value is visible
    // through the original, unconverted instance...
    expect(cookie.get("name")).toBe("written:value");
    // ...while the converted instance also applies the read transform.
    expect(converted.get("name")).toBe("read:value");
  });

  it("withConverter falls back to the raw value when no read/write function is given", () => {
    const cookie = createNodeCookieService().withConverter({});
    cookie.set("name", "value");
    expect(cookie.get("name")).toBe("value");
  });
});
