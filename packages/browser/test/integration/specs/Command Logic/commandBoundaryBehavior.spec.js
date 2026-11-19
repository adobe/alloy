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
  afterEach,
} from "../../helpers/testsSetup/extend.js";
import { test as plainTest } from "vitest";
import alloyConfig from "../../helpers/alloy/config.js";
import setupBaseCode from "../../helpers/alloy/setupBaseCode.js";
import setupAlloy from "../../helpers/alloy/setup.js";
import cleanAlloy from "../../helpers/alloy/clean.js";
import searchForLogMessage from "../../helpers/utils/searchForLogMessage.js";

const PENDING = Symbol("pending");

const settlesNow = async (promise) => {
  for (let i = 0; i < 20; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
  return Promise.race([
    promise.then(
      (value) => ({ value }),
      (error) => ({ error }),
    ),
    Promise.resolve(PENDING),
  ]);
};

const addMonitor = () => {
  const monitor = {
    onCommandResolved: vi.fn(),
    onCommandRejected: vi.fn(),
    onBeforeLog: vi.fn(),
  };
  window.__alloyMonitors.push(monitor);
  return monitor;
};

describe("Command boundary", () => {
  describe("after a failed configure", () => {
    test("later commands never settle, warn, and skip onCommandRejected", async ({
      alloy,
    }) => {
      const monitor = addMonitor();
      const originalAddEventListener = document.addEventListener;
      const addEventListenerSpy = vi
        .spyOn(document, "addEventListener")
        .mockImplementation(function addEventListener(type, ...rest) {
          if (type === "click") {
            throw new Error("click listener unavailable");
          }
          return originalAddEventListener.call(this, type, ...rest);
        });

      try {
        await expect(alloy("configure", alloyConfig)).rejects.toThrow(
          "click listener unavailable",
        );
      } finally {
        addEventListenerSpy.mockRestore();
      }

      const sendEvent = alloy("sendEvent");
      const libraryInfo = alloy("getLibraryInfo");

      const warnings = [];
      await vi.waitFor(() => {
        warnings.length = 0;
        warnings.push(
          ...monitor.onBeforeLog.mock.calls
            .map(([data]) => data)
            .filter(({ level }) => level === "warn")
            .map(({ arguments: args }) => args[0]),
        );
        expect(warnings).toHaveLength(2);
      });
      expect(await settlesNow(sendEvent)).toBe(PENDING);
      expect(await settlesNow(libraryInfo)).toBe(PENDING);
      expect(warnings).toContain(
        "An error during configuration is preventing the sendEvent command from executing.",
      );
      expect(warnings).toContain(
        "An error during configuration is preventing the getLibraryInfo command from executing.",
      );

      const rejectedCommands = monitor.onCommandRejected.mock.calls.map(
        ([data]) => data.commandName,
      );
      expect(rejectedCommands).toEqual(["configure"]);
    });
  });

  describe("command rejections", () => {
    test("unknown command rejects with the full list of available commands", async ({
      alloy,
    }) => {
      await alloy("configure", alloyConfig);

      const error = await alloy("bogus").catch((e) => e);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        "[alloy] The bogus command does not exist. List of available commands: configure, setDebug, sendConversationEvent, setConsent, createEventMergeId, getMediaAnalyticsTracker, applyPropositions, sendPushSubscription, evaluateRulesets, subscribeRulesetItems, createMediaSession, sendMediaEvent, sendEvent, applyResponse, getIdentity, appendIdentityToUrl, getLibraryInfo.",
      );
    });

    test("invalid options reject with the validation details and documentation link", async ({
      alloy,
    }) => {
      await alloy("configure", alloyConfig);

      const error = await alloy("setDebug", { enabled: "yes" }).catch((e) => e);

      expect(error.message).toBe(
        `[alloy] Invalid setDebug command options:\n\t - Error: 'enabled': Expected true or false, but got "yes". For command documentation see: https://adobe.ly/3sHgQHb`,
      );
    });

    test("configuring twice rejects with an instance-prefixed message", async ({
      alloy,
    }) => {
      await alloy("configure", alloyConfig);

      await expect(alloy("configure", alloyConfig)).rejects.toThrow(
        "[alloy] The library has already been configured and may only be configured once.",
      );
    });
  });

  describe("monitor payloads", () => {
    test("onCommandResolved receives the command name, options, and an empty result for configure", async ({
      alloy,
    }) => {
      const monitor = addMonitor();

      await alloy("configure", alloyConfig);

      const call = monitor.onCommandResolved.mock.calls
        .map(([data]) => data)
        .find(({ commandName }) => commandName === "configure");
      expect(call).toEqual(
        expect.objectContaining({
          commandName: "configure",
          options: expect.objectContaining({
            datastreamId: alloyConfig.datastreamId,
          }),
          result: {},
        }),
      );
    });

    test("onCommandRejected receives the same Error instance the promise rejected with", async ({
      alloy,
    }) => {
      await alloy("configure", alloyConfig);
      const monitor = addMonitor();

      const error = await alloy("bogus", { a: 1 }).catch((e) => e);

      expect(monitor.onCommandRejected).toHaveBeenCalledOnce();
      const data = monitor.onCommandRejected.mock.calls[0][0];
      expect(data.commandName).toBe("bogus");
      expect(data.options).toEqual({ a: 1 });
      expect(data.error).toBe(error);
    });
  });

  describe("setDebug", () => {
    let consoleSpy;

    afterEach(() => {
      consoleSpy?.mockRestore();
    });

    test("takes effect when called synchronously after configure", async ({
      alloy,
    }) => {
      consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      const configured = alloy("configure", alloyConfig);
      const debugSet = alloy("setDebug", { enabled: true });
      const libraryInfo = alloy("getLibraryInfo");
      await Promise.all([configured, debugSet, libraryInfo]);

      expect(
        searchForLogMessage(consoleSpy, "Executing getLibraryInfo command"),
      ).toBe(true);
    });
  });
});

describe("Base code queue", () => {
  plainTest(
    "resolves configure, getLibraryInfo, and setDebug queued before the library loads",
    async () => {
      await setupBaseCode();
      const order = [];
      const track = (name, promise) =>
        promise.then((result) => {
          order.push(name);
          return result;
        });

      const configured = track(
        "configure",
        window.alloy("configure", alloyConfig),
      );
      const libraryInfo = track(
        "getLibraryInfo",
        window.alloy("getLibraryInfo"),
      );
      const debugSet = track(
        "setDebug",
        window.alloy("setDebug", { enabled: false }),
      );

      await setupAlloy();
      const results = await Promise.all([configured, libraryInfo, debugSet]);

      expect(results[0]).toEqual({});
      expect(results[1]).toEqual({ libraryInfo: expect.any(Object) });
      expect(order).toEqual(["setDebug", "configure", "getLibraryInfo"]);

      cleanAlloy();
    },
  );
});

describe("Two instances on one page", () => {
  let consoleSpy;

  afterEach(() => {
    consoleSpy?.mockRestore();
    delete window.alloy2;
    cleanAlloy();
    sessionStorage.clear();
    localStorage.clear();
  });

  plainTest(
    "configure, errors, and debug output are independent per instance",
    async () => {
      sessionStorage.clear();
      localStorage.clear();
      await setupBaseCode();
      await setupAlloy({ instanceNames: ["alloy", "alloy2"] });
      const { alloy, alloy2 } = window;

      const unconfigured = await alloy2("getLibraryInfo").catch((e) => e);
      expect(unconfigured.message).toBe(
        "[alloy2] The library must be configured first. Please do so by executing the configure command.",
      );

      await expect(alloy("configure", alloyConfig)).resolves.toEqual({});
      await expect(alloy("getLibraryInfo")).resolves.toEqual({
        libraryInfo: expect.any(Object),
      });
      await expect(alloy2("getLibraryInfo")).rejects.toThrow(
        "[alloy2] The library must be configured first.",
      );

      await expect(
        alloy2("configure", {
          ...alloyConfig,
          datastreamId: "2d2d2d2d-aaaa-bbbb-cccc-000000000002",
          orgId: "OTHERORG0000000000000000@AdobeOrg",
        }),
      ).resolves.toEqual({});

      const bogus = await alloy2("bogus").catch((e) => e);
      expect(bogus.message).toMatch(/^\[alloy2\] The bogus command does not/);

      consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
      await alloy2("setDebug", { enabled: true });
      await alloy("getLibraryInfo");
      await alloy2("getLibraryInfo");

      const prefixes = consoleSpy.mock.calls.map(([prefix]) => prefix);
      expect(prefixes).toContain("[alloy2]");
      expect(prefixes).not.toContain("[alloy]");
    },
  );
});
