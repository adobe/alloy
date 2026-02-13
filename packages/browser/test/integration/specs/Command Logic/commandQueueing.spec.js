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
import { test, expect, describe, vi, beforeEach, afterEach } from "vitest";
import setupBaseCode from "../../helpers/alloy/setupBaseCode.js";
import alloyConfig from "../../helpers/alloy/config.js";
import cleanAlloy from "../../helpers/alloy/clean.js";
import setupAlloy from "../../helpers/alloy/setup.js";
import getOnCommandResolvedPromise from "../../helpers/utils/getOnCommandResolvedPromise.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";

describe("Command queueing", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "info");
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("works", async () => {
    await setupBaseCode();
    const p = getOnCommandResolvedPromise("getLibraryInfo");
    window.alloy("configure", {
      ...alloyConfig,
      debugEnabled: true,
    });

    window.alloy("getLibraryInfo");

    expect(window.alloy.q.length).toBe(2);

    setupAlloy();

    await p;

    expect(
      searchForLogMessage(consoleSpy, "Executing getLibraryInfo command"),
    ).toBe(true);

    cleanAlloy();
  });
});
