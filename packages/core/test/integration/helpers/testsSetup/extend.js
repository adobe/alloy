/* eslint-disable no-empty-pattern */
import { test as baseTest } from "vitest";
import { createWorker } from "../mswjs/browserWorker.js";
import { networkRecorder } from "../mswjs/networkRecorder.js";
import setupAlloy from "../alloy/setup.js";
import setupBaseCode from "../alloy/setupBaseCode.js";
import cleanAlloy from "../alloy/clean.js";

const worker = createWorker();

let workerStarted = false;

// Extend the test with MSW worker
export const test = baseTest.extend({
  worker: [
    async ({}, use) => {
      if (!workerStarted) {
        await worker.start({
          onUnhandledRequest: "bypass",
          quiet: true,
        });
        workerStarted = true;
      }

      // Make worker available in the test context
      await use(worker);

      // Clean up after test
      worker.resetHandlers();
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
      await setupBaseCode();
      const alloy = setupAlloy();

      // Make alloy available in the test context
      await use(alloy);

      cleanAlloy();
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
  vi,
} from "vitest";
