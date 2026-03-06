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
      networkRecorder.reset();
      await use(networkRecorder);
      networkRecorder.reset();
    },
    { auto: true }, // Apply to all tests even if not explicitly using networkRecorder
  ],

  alloy: [
    async ({}, use) => {
      await setupBaseCode();
      const alloy = await setupAlloy();

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
