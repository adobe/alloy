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

/**
 * Regression guard for the Wave 4 migration: verifies that monitors registered
 * in window.__alloyMonitors before Alloy loads are still merged and receive
 * lifecycle callbacks. Previously browser/src/index.js read __alloyMonitors
 * directly; it now delegates to platformServices.globals.getMonitors().
 *
 * This file intentionally avoids the extended test fixture from extend.js so
 * that __alloyMonitors can be set before Alloy is loaded (the auto: true alloy
 * fixture would load Alloy before any test body runs, making pre-load setup
 * impossible).
 */

import { describe, test, expect, afterEach } from "vitest";
import setupBaseCode from "../../helpers/alloy/setupBaseCode.js";
import setupAlloy from "../../helpers/alloy/setup.js";
import cleanAlloy from "../../helpers/alloy/clean.js";
import alloyConfig from "../../helpers/alloy/config.js";

afterEach(() => {
  cleanAlloy();
});

describe("PlatformServices wiring — __alloyMonitors merging", () => {
  test("monitors placed in __alloyMonitors before Alloy loads receive onBeforeCommand callbacks", async () => {
    const observedCommands = [];
    window.__alloyMonitors = [
      {
        onBeforeCommand({ commandName }) {
          observedCommands.push(commandName);
        },
      },
    ];

    await setupBaseCode();
    const alloy = await setupAlloy();

    await alloy("configure", alloyConfig);

    // configure is the first command; if monitor merging is broken it will be absent.
    expect(observedCommands).toContain("configure");
  });
});
