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
import { test, expect, describe } from "../../helpers/testsSetup/extend.js";

describe("Install SDK", () => {
  // C2560 - Global function named alloy is accessible.
  test("C2560 - window.alloy is a callable function after the SDK loads", async ({
    alloy,
  }) => {
    // The `alloy` fixture loads the SDK and sets window.alloy before this test runs.
    // We check the type via window.alloy directly since the fixture also returns it.
    expect(typeof window.alloy).toBe("function");
    expect(alloy).toBeDefined();
  });

  // C2579 - Separate ECIDs are used for multiple SDK instances.
  //
  // Skipped: The integration test harness creates a single alloy instance via setupBaseCode +
  // setupAlloy. initializeStandalone() reads window.__alloyNS only once when alloy.js is
  // first parsed, so a second instance cannot be initialized by pushing to __alloyNS after
  // the fact. Properly testing multi-instance isolation requires loading alloy.js a second
  // time in the same browser context, which would conflict with the existing instance.
  // Multi-instance behavior is covered by unit tests.
  test.skip("C2579 - separate ECIDs are used for multiple SDK instances", () => {});

  // C1338399 - Use SDK from NPM entry point.
  //
  // Skipped: The NPM entry point exposes `alloyCreateInstance`, which requires a different
  // build artifact than the standalone alloy.js loaded by the integration test harness.
  // The fixture always loads the standalone build. Supporting the NPM build would require
  // a separate test setup or a fixture that loads alloyCreateInstance instead.
  test.skip("C1338399 - SDK can be initialized from the NPM entry point using alloyCreateInstance", () => {});
});
