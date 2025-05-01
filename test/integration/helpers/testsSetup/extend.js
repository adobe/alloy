/* eslint-disable no-empty-pattern */
/* eslint-disable no-underscore-dangle */
import { test as baseTest } from "vitest";
import { worker } from "../mswjs/browserWorker.js";
import { networkRecorder } from "../mswjs/networkRecorder.js";
import setupAlloy from "../alloy/setup.js";

// Extend the test with MSW worker
export const test = baseTest.extend({
  worker: [
    async ({}, use) => {
      // Start the worker before each test
      await worker.start({
        onUnhandledRequest: "bypass",
        quiet: true,
      });

      // Make worker available in the test context
      await use(worker);

      // Clean up after test
      worker.stop();
    },
    { auto: true }, // Apply to all tests even if not explicitly using worker
  ],

  networkRecorder: [
    async ({}, use) => {
      // Make networkRecorder available in the test context
      await use(networkRecorder);

      networkRecorder.reset();
    },
    { auto: true }, // Apply to all tests even if not explicitly using networkRecorder
  ],

  alloy: [
    async ({}, use) => {
      const alloy = await setupAlloy();

      // Make alloy available in the test context
      await use(alloy);

      delete window.__alloyMonitors;
      delete window.__alloyNS;
      delete window.alloy;
    },
    { auto: true }, // Apply to all tests even if not explicitly using alloy
  ],
});

// `it`` is an alias for `test` in Vitest
export const it = test;

export {
  describe,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";
