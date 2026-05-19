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

import { describe, expect, test } from "vitest";
import { isPrerelease, cdnUrlFor } from "./release.js";

describe("isPrerelease", () => {
  test("identifies beta prereleases", () => {
    expect(isPrerelease("2.34.0-beta.0")).toBe(true);
  });

  test("identifies rc prereleases", () => {
    expect(isPrerelease("2.34.0-rc.1")).toBe(true);
  });

  test("returns false for stable semver", () => {
    expect(isPrerelease("2.34.0")).toBe(false);
  });

  test("returns false for stable semver with patch zero", () => {
    expect(isPrerelease("1.0.0")).toBe(false);
  });
});

describe("cdnUrlFor", () => {
  test("composes the versioned alloy.min.js URL", () => {
    expect(cdnUrlFor("2.34.0-beta.0", "alloy.min.js")).toBe(
      "https://cdn1.adoberesources.net/alloy/2.34.0-beta.0/alloy.min.js",
    );
  });

  test("composes the versioned alloyServiceWorker.js URL", () => {
    expect(cdnUrlFor("1.0.0", "alloyServiceWorker.js")).toBe(
      "https://cdn1.adoberesources.net/alloy/1.0.0/alloyServiceWorker.js",
    );
  });
});
