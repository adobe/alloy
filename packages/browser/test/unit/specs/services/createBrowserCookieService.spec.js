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

import { afterEach, describe, it, expect } from "vitest";
import createBrowserCookieService from "../../../../src/services/createBrowserCookieService.js";

const COOKIE_NAME = "alloy_service_test";

afterEach(() => {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
});

describe("BrowserCookieService", () => {
  it("round-trips get/set/remove against document.cookie", () => {
    const cookie = createBrowserCookieService();
    cookie.set(COOKIE_NAME, "hello");
    expect(cookie.get(COOKIE_NAME)).toBe("hello");
    cookie.remove(COOKIE_NAME);
    expect(cookie.get(COOKIE_NAME)).toBeUndefined();
  });

  it("withConverter applies a write encoder and returns a chainable CookieService", () => {
    const cookie = createBrowserCookieService();
    const encoded = cookie.withConverter({
      write: (value) => `encoded:${value}`,
    });
    encoded.set(COOKIE_NAME, "raw");
    // js-cookie's `get` decodes the converter's write output, so reading via
    // raw document.cookie verifies the encoder actually ran on write.
    expect(document.cookie).toContain(`${COOKIE_NAME}=encoded:raw`);
    // The returned service must itself satisfy the CookieService contract,
    // including being further chainable.
    expect(typeof encoded.withConverter).toBe("function");
    expect(typeof encoded.withConverter({}).get).toBe("function");
  });
});
