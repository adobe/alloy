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
import createBrowserPlatformServices from "../../../../src/services/createBrowserPlatformServices.js";

const WIRING_COOKIE = "alloy_wiring_test";

afterEach(() => {
  document.cookie = `${WIRING_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  delete window.__alloyNS;
  delete window.__alloyMonitors;
});

describe("createBrowserPlatformServices (wiring)", () => {
  it("returns an object with all six service keys", () => {
    const services = createBrowserPlatformServices();
    expect(services).toHaveProperty("network");
    expect(services).toHaveProperty("storage");
    expect(services).toHaveProperty("cookie");
    expect(services).toHaveProperty("runtime");
    expect(services).toHaveProperty("legacy");
    expect(services).toHaveProperty("globals");
  });

  it("cookie.get and cookie.getAll read from the same jar", () => {
    const { cookie } = createBrowserPlatformServices();
    cookie.set(WIRING_COOKIE, "jar-parity");
    expect(cookie.get(WIRING_COOKIE)).toBe("jar-parity");
    expect(cookie.getAll()[WIRING_COOKIE]).toBe("jar-parity");
    cookie.remove(WIRING_COOKIE);
    expect(cookie.get(WIRING_COOKIE)).toBeUndefined();
    expect(cookie.getAll()[WIRING_COOKIE]).toBeUndefined();
  });

  it("globals.getLocationHash, isPageSsl, and getWindowContext are wired to the live browser environment", () => {
    const { globals } = createBrowserPlatformServices();
    expect(globals.getLocationHash()).toBe(window.location.hash);
    expect(globals.isPageSsl()).toBe(window.location.protocol === "https:");
    const ctx = globals.getWindowContext();
    expect(ctx.url).toBe(window.location.href);
    expect(typeof ctx.height).toBe("number");
    expect(typeof ctx.width).toBe("number");
  });

  it("globals.getMonitors reads __alloyMonitors from the window", () => {
    const monitor = { onBeforeCommand: () => {} };
    window.__alloyMonitors = [monitor];
    const { globals } = createBrowserPlatformServices();
    expect(globals.getMonitors()).toEqual([monitor]);
  });

  it("globals.getPageLocation returns the window.location object", () => {
    const { globals } = createBrowserPlatformServices();
    expect(globals.getPageLocation()).toBe(window.location);
  });
});
