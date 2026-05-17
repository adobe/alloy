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
import createBrowserGlobalsService from "../../../../src/services/createBrowserGlobalsService.js";

afterEach(() => {
  delete window.__alloyNS;
  delete window.__alloyMonitors;
  delete window.testInstance;
});

describe("BrowserGlobalsService", () => {
  it("returns empty arrays (not undefined) when bootstrap globals are absent", () => {
    const globals = createBrowserGlobalsService();
    expect(globals.getInstanceNames()).toEqual([]);
    expect(globals.getMonitors()).toEqual([]);
    expect(globals.getInstanceQueue("missingInstance")).toEqual([]);
  });

  it("reads __alloyNS and per-instance queue when present", () => {
    window.__alloyNS = ["testInstance"];
    window.testInstance = { q: [["sendEvent", {}]] };
    const globals = createBrowserGlobalsService();
    expect(globals.getInstanceNames()).toEqual(["testInstance"]);
    expect(globals.getInstanceQueue("testInstance")).toEqual([
      ["sendEvent", {}],
    ]);
  });

  it("reads __alloyMonitors when present", () => {
    const monitor = { onBeforeCommand: () => {} };
    window.__alloyMonitors = [monitor];
    const globals = createBrowserGlobalsService();
    expect(globals.getMonitors()).toEqual([monitor]);
  });

  it("exposes location/navigator passthroughs", () => {
    const globals = createBrowserGlobalsService();
    expect(globals.getLocationSearch()).toBe(window.location.search);
    expect(globals.getHostname()).toBe(window.location.hostname);
    expect(globals.getUserAgent()).toBe(window.navigator.userAgent);
  });
});
