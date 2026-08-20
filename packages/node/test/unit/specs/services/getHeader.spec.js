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
import getHeader from "../../../../src/services/getHeader.js";

describe("getHeader", () => {
  it("returns undefined when called with no headers", () => {
    expect(getHeader(undefined, "user-agent")).toBeUndefined();
  });

  it("reads a header off a plain headers object", () => {
    const headers = { "user-agent": "Mozilla/5.0" };

    expect(getHeader(headers, "user-agent")).toBe("Mozilla/5.0");
  });

  it("returns undefined for a header missing from a plain headers object", () => {
    expect(getHeader({}, "user-agent")).toBeUndefined();
  });

  it("reads a header off a WHATWG Headers instance via .get(), not bracket access", () => {
    const headers = new Headers({ "user-agent": "Mozilla/5.0" });

    expect(getHeader(headers, "user-agent")).toBe("Mozilla/5.0");
  });

  it("returns undefined, not null, for a header missing from a Headers instance", () => {
    const headers = new Headers();

    expect(getHeader(headers, "user-agent")).toBeUndefined();
  });

  it("is case-insensitive for a Headers instance, as the WHATWG spec requires", () => {
    const headers = new Headers({ "User-Agent": "Mozilla/5.0" });

    expect(getHeader(headers, "user-agent")).toBe("Mozilla/5.0");
  });
});
