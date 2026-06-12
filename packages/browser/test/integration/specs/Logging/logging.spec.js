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
import {
  test,
  expect,
  describe,
  vi,
  beforeEach,
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import { test as vitestTest } from "vitest";
import { sendEventHandler } from "../../helpers/mswjs/handlers.js";
import alloyConfig from "../../helpers/alloy/config.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";
import { withTemporaryUrl } from "../../helpers/utils/location.js";
import setupBaseCode from "../../helpers/alloy/setupBaseCode.js";
import setupAlloy from "../../helpers/alloy/setup.js";
import cleanAlloy from "../../helpers/alloy/clean.js";

describe("Toggle logging through configuration (C2583)", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "info");
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("logs sendEvent when debugEnabled is true", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", { ...alloyConfig, debugEnabled: true });
    await alloy("sendEvent");
    expect(searchForLogMessage(consoleSpy, "Executing sendEvent command")).toBe(
      true,
    );
  });

  test("does not log sendEvent when debugEnabled is false", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventHandler);
    await alloy("configure", { ...alloyConfig, debugEnabled: false });
    await alloy("sendEvent");
    expect(searchForLogMessage(consoleSpy, "Executing sendEvent command")).toBe(
      false,
    );
  });
});

describe("Toggle logging through setDebug command (C2584)", () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "info");
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test("enables logging when setDebug called with enabled: true", async ({
    alloy,
  }) => {
    await alloy("configure", alloyConfig);
    await alloy("setDebug", { enabled: true });
    await alloy("getLibraryInfo");
    expect(
      searchForLogMessage(consoleSpy, "Executing getLibraryInfo command"),
    ).toBe(true);
  });

  test("disables logging when setDebug called with enabled: false after being enabled", async ({
    alloy,
  }) => {
    await alloy("configure", { ...alloyConfig, debugEnabled: true });
    await alloy("setDebug", { enabled: false });
    consoleSpy.mockClear();
    await alloy("getLibraryInfo");
    expect(
      searchForLogMessage(consoleSpy, "Executing getLibraryInfo command"),
    ).toBe(false);
  });
});

describe("Toggle logging through querystring parameter (C2586)", () => {
  // This test sets alloy_debug=true in the URL before calling configure
  // so alloy reads the param during initialization
  vitestTest(
    "enables logging when alloy_debug=true is in the URL at configure time",
    async () => {
      const consoleSpy = vi.spyOn(console, "info");
      try {
        await withTemporaryUrl(async ({ currentHref, applyUrl }) => {
          const url = new URL(currentHref);
          url.searchParams.set("alloy_debug", "true");
          applyUrl(url);

          await setupBaseCode();
          const alloy = await setupAlloy();

          await alloy("configure", alloyConfig);
          await alloy("getLibraryInfo");

          expect(
            searchForLogMessage(consoleSpy, "Executing getLibraryInfo command"),
          ).toBe(true);

          cleanAlloy();
        });
      } finally {
        consoleSpy.mockRestore();
      }
    },
  );
});

describe("Logged objects can be stringified (C532204)", () => {
  test("does not throw when console methods call String() on arguments", async ({
    alloy,
    worker,
  }) => {
    worker.use(sendEventHandler);

    const originals = {};
    ["log", "info", "warn", "error"].forEach((methodName) => {
      originals[methodName] = console[methodName];
      const orig = console[methodName];
      // eslint-disable-next-line no-console
      console[methodName] = (...args) => {
        args.forEach((arg) => String(arg));
        orig.apply(console, args);
      };
    });

    try {
      await alloy("configure", { ...alloyConfig, debugEnabled: true });
      await alloy("sendEvent");
    } finally {
      ["log", "info", "warn", "error"].forEach((methodName) => {
        // eslint-disable-next-line no-console
        console[methodName] = originals[methodName];
      });
    }
  });
});
